from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List
from datetime import datetime, timedelta
from geopy.geocoders import Nominatim

from app.core.database import get_db
from app.core.config import settings
from app.core.zones import get_zone_id, get_adjacent_zones
from app.models import User, Look, LocationPing, Crossing, BlockedUser, CrossingLike, SavedCrossing, Follow, LookView, LookLike
from app.schemas import LocationPingCreate, CrossingWithDetails
from app.api.deps import get_current_user

# Geocoder pour reverse geocoding
geolocator = Nominatim(user_agent="lookup_app")

def round_coordinates(lat: float, lon: float, precision: int = 3) -> tuple:
    """
    Arrondir les coordonnees pour proteger la vie privee.
    precision=3 donne une precision d'environ 100m
    precision=2 donne une precision d'environ 1km
    """
    if lat and lon:
        return round(lat, precision), round(lon, precision)
    return 0, 0

def are_friends(db: Session, user1_id: int, user2_id: int) -> bool:
    """Verifier si deux utilisateurs sont amis (se suivent mutuellement)"""
    follows = db.query(Follow).filter(
        Follow.follower_id == user1_id,
        Follow.followed_id == user2_id
    ).first()
    followed_by = db.query(Follow).filter(
        Follow.follower_id == user2_id,
        Follow.followed_id == user1_id
    ).first()
    return follows is not None and followed_by is not None


def get_location_name(latitude: float, longitude: float) -> str:
    """
    Obtenir le nom du lieu a partir des coordonnees.
    Pour la vie privee, on montre le quartier/arrondissement, PAS la rue exacte.
    """
    try:
        location = geolocator.reverse(f"{latitude}, {longitude}", language="fr", timeout=5)
        if location and location.raw.get("address"):
            addr = location.raw["address"]
            # Pour la vie privee: quartier > arrondissement > ville (jamais la rue exacte)
            if addr.get("neighbourhood"):
                return addr["neighbourhood"]
            elif addr.get("suburb"):
                return addr["suburb"]
            elif addr.get("city_district"):  # Arrondissement a Paris
                return addr["city_district"]
            elif addr.get("city") or addr.get("town"):
                return addr.get("city") or addr.get("town")
        return "Zone de croisement"
    except Exception:
        return "Zone de croisement"

router = APIRouter(prefix="/crossings", tags=["Crossings"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/ping")
@limiter.limit("30/minute")  # 30 pings max par minute par IP
async def send_location_ping(
    request: Request,
    location: LocationPingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envoyer sa position et detecter les croisements.
    Utilise un systeme de zones 50m x 50m.
    """
    # Calculer la zone de l'utilisateur
    zone_id = get_zone_id(location.latitude, location.longitude)

    # Sauvegarder le ping avec la zone
    ping = LocationPing(
        user_id=current_user.id,
        latitude=location.latitude,
        longitude=location.longitude,
        zone_id=zone_id,
        accuracy=location.accuracy
    )
    db.add(ping)

    # Fenetre de temps pour detecter un croisement (10 min par defaut)
    time_window = datetime.utcnow() - timedelta(minutes=settings.CROSSING_TIME_WINDOW_MINUTES)

    # Obtenir les zones adjacentes (rayon de ~100m)
    adjacent_zones = get_adjacent_zones(zone_id)

    # Trouver les autres utilisateurs dans la MEME ZONE ou zones adjacentes
    users_in_same_zone = db.query(LocationPing).filter(
        LocationPing.user_id != current_user.id,
        LocationPing.zone_id.in_(adjacent_zones),  # Zone + 8 voisins
        LocationPing.timestamp >= time_window
    ).all()

    new_crossings = []

    # Fenetre plus longue pour eviter les doublons (1 heure)
    dedup_window = datetime.utcnow() - timedelta(hours=1)

    for other_ping in users_in_same_zone:
        # Verifier que l'autre utilisateur est visible
        other_user = db.query(User).filter(User.id == other_ping.user_id).first()
        if other_user and other_user.is_visible == False:
            continue

        # Verifier qu'on n'a pas deja detecte ce croisement recemment
        existing = db.query(Crossing).filter(
            or_(
                and_(
                    Crossing.user1_id == current_user.id,
                    Crossing.user2_id == other_ping.user_id
                ),
                and_(
                    Crossing.user1_id == other_ping.user_id,
                    Crossing.user2_id == current_user.id
                )
            ),
            Crossing.crossed_at >= dedup_window  # 1 heure au lieu de 10 min
        ).first()

        if not existing:
            # Obtenir le look le plus recent (< 24h) de chaque utilisateur
            since_24h = datetime.utcnow() - timedelta(hours=24)
            my_look = db.query(Look).filter(
                Look.user_id == current_user.id,
                Look.created_at >= since_24h,
            ).order_by(Look.created_at.desc()).first()

            other_look = db.query(Look).filter(
                Look.user_id == other_ping.user_id,
                Look.created_at >= since_24h,
            ).order_by(Look.created_at.desc()).first()

            # Obtenir le nom du lieu
            location_name = get_location_name(location.latitude, location.longitude)

            # Creer le croisement
            crossing = Crossing(
                user1_id=current_user.id,
                user2_id=other_ping.user_id,
                zone_id=zone_id,
                latitude=location.latitude,
                longitude=location.longitude,
                location_name=location_name,
                user1_look_id=my_look.id if my_look else None,
                user2_look_id=other_look.id if other_look else None
            )
            db.add(crossing)
            new_crossings.append({
                "user_id": other_ping.user_id,
                "zone": zone_id
            })

    try:
        db.commit()
    except Exception as e:
        # En cas de race condition (doublon), rollback et retenter sans les doublons
        db.rollback()
        import logging
        logging.getLogger(__name__).warning(f"Race condition croisement, retry sans doublons: {e}")
        # Le ping est perdu mais on le resauvegarde
        ping_retry = LocationPing(
            user_id=current_user.id,
            latitude=location.latitude,
            longitude=location.longitude,
            zone_id=zone_id,
            accuracy=location.accuracy
        )
        db.add(ping_retry)
        try:
            db.commit()
        except Exception:
            db.rollback()
        new_crossings = []

    return {
        "ping_saved": True,
        "zone": zone_id,
        "new_crossings": len(new_crossings),
        "crossings": new_crossings
    }

@router.get("/", response_model=List[CrossingWithDetails])
async def get_my_crossings(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir la liste de mes croisements des dernieres 24h.
    Les looks croises restent visibles pendant 24h.
    Ne montre que le croisement le plus recent par utilisateur.
    Filtre les utilisateurs bloques.
    """
    # Seulement les croisements des dernieres 24h
    since_24h = datetime.utcnow() - timedelta(hours=24)

    # Obtenir les IDs des utilisateurs bloques (dans les deux sens)
    blocked_by_me = db.query(BlockedUser.blocked_id).filter(
        BlockedUser.blocker_id == current_user.id
    ).all()
    blocked_me = db.query(BlockedUser.blocker_id).filter(
        BlockedUser.blocked_id == current_user.id
    ).all()
    blocked_ids = set([b[0] for b in blocked_by_me] + [b[0] for b in blocked_me])

    all_crossings = db.query(Crossing).filter(
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        ),
        Crossing.crossed_at >= since_24h  # Visible 24h
    ).order_by(Crossing.crossed_at.desc()).all()

    # Dedupliquer: garder seulement le croisement le plus recent par utilisateur
    # Et filtrer les utilisateurs bloques + profils prives (si pas amis)
    seen_users = set()
    crossings = []
    for c in all_crossings:
        other_user_id = c.user2_id if c.user1_id == current_user.id else c.user1_id
        # Ignorer si utilisateur bloque
        if other_user_id in blocked_ids:
            continue
        # Verifier si profil prive
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if other_user and other_user.is_private:
            # Profil prive: verifier si amis (se suivent mutuellement)
            if not are_friends(db, current_user.id, other_user_id):
                continue
        if other_user_id not in seen_users:
            seen_users.add(other_user_id)
            crossings.append(c)

    # Appliquer pagination
    crossings = crossings[skip:skip + limit]

    result = []
    for c in crossings:
        # Determiner qui est l'autre utilisateur
        if c.user1_id == current_user.id:
            other_user_id = c.user2_id
            other_look_id = c.user2_look_id
        else:
            other_user_id = c.user1_id
            other_look_id = c.user1_look_id

        # Obtenir les infos de l'autre utilisateur
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if not other_user:
            continue

        # Obtenir le look (< 24h) uniquement
        other_look = None
        look_items = []
        since_24h = datetime.utcnow() - timedelta(hours=24)

        if other_look_id:
            # Verifier que le look a moins de 24h
            other_look = db.query(Look).filter(
                Look.id == other_look_id,
                Look.created_at >= since_24h,
            ).first()

        # Fallback: chercher le look le plus recent (< 24h)
        if not other_look:
            other_look = db.query(Look).filter(
                Look.user_id == other_user_id,
                Look.created_at >= since_24h,
            ).order_by(Look.created_at.desc()).first()

        # Pas de look recent (< 24h) = on n'affiche pas ce croisement
        if not other_look:
            continue

        look_items = [
            {
                "category": item.category,
                "brand": item.brand,
                "product_name": item.product_name,
                "color": item.color
            }
            for item in other_look.items
        ]

        # Arrondir les coordonnees pour la vie privee
        rounded_lat, rounded_lon = round_coordinates(c.latitude, c.longitude)

        result.append(CrossingWithDetails(
            id=c.id,
            crossed_at=c.crossed_at,
            latitude=rounded_lat,
            longitude=rounded_lon,
            location_name=c.location_name,
            other_user_id=other_user.id,
            other_username=other_user.username,
            other_avatar_url=other_user.avatar_url,
            other_look_id=other_look.id if other_look else None,
            other_look_title=other_look.title if other_look else None,
            other_look_photo_url=other_look.photo_url if other_look else None,
            other_look_items=look_items,
            views_count=other_look.views_count if other_look else 0,
            likes_count=other_look.likes_count if other_look else 0
        ))

    return result

@router.get("/{crossing_id}")
async def get_crossing_detail(
    crossing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir les details d'un croisement"""

    crossing = db.query(Crossing).filter(
        Crossing.id == crossing_id,
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        )
    ).first()

    if not crossing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Croisement non trouve"
        )

    # Marquer comme vu et incrementer le compteur de vues
    if crossing.user1_id == current_user.id and not crossing.user1_viewed:
        crossing.user1_viewed = datetime.utcnow()
        crossing.views_count += 1
    elif crossing.user2_id == current_user.id and not crossing.user2_viewed:
        crossing.user2_viewed = datetime.utcnow()
        crossing.views_count += 1

    db.commit()

    # Retourner les details complets
    if crossing.user1_id == current_user.id:
        other_user_id = crossing.user2_id
        other_look_id = crossing.user2_look_id
    else:
        other_user_id = crossing.user1_id
        other_look_id = crossing.user1_look_id

    other_user = db.query(User).filter(User.id == other_user_id).first()

    # Verifier que le look a moins de 24h
    since_24h = datetime.utcnow() - timedelta(hours=24)

    other_look = None
    if other_look_id:
        other_look = db.query(Look).filter(
            Look.id == other_look_id,
            Look.created_at >= since_24h,
        ).first()

    # Fallback: chercher le look le plus recent (< 24h)
    if not other_look:
        other_look = db.query(Look).filter(
            Look.user_id == other_user_id,
            Look.created_at >= since_24h,
        ).order_by(Look.created_at.desc()).first()

    # Propager la vue sur le look associe (apres resolution du look)
    if other_look and other_look.user_id != current_user.id:
        existing_look_view = db.query(LookView).filter(
            LookView.look_id == other_look.id,
            LookView.user_id == current_user.id
        ).first()
        if not existing_look_view:
            db.add(LookView(look_id=other_look.id, user_id=current_user.id))
            other_look.views_count += 1
            db.commit()
            db.refresh(other_look)

    # Verifier si l'utilisateur a like/sauvegarde ce croisement
    user_liked = db.query(CrossingLike).filter(
        CrossingLike.crossing_id == crossing_id,
        CrossingLike.user_id == current_user.id
    ).first() is not None

    user_saved = db.query(SavedCrossing).filter(
        SavedCrossing.crossing_id == crossing_id,
        SavedCrossing.user_id == current_user.id
    ).first() is not None

    # Arrondir les coordonnees pour la vie privee
    rounded_lat, rounded_lon = round_coordinates(crossing.latitude, crossing.longitude)

    return {
        "crossing": {
            "id": crossing.id,
            "crossed_at": crossing.crossed_at.isoformat(),
            "zone_id": crossing.zone_id,
            "latitude": rounded_lat,
            "longitude": rounded_lon,
            "location_name": crossing.location_name,
            "likes_count": crossing.likes_count,
            "views_count": crossing.views_count
        },
        "stats": {
            "likes_count": crossing.likes_count,
            "views_count": crossing.views_count,
            "user_liked": user_liked,
            "user_saved": user_saved
        },
        "other_user": {
            "id": other_user.id,
            "username": other_user.username,
            "avatar_url": other_user.avatar_url
        } if other_user else None,
        "other_look": {
            "id": other_look.id,
            "photo_url": other_look.photo_url,
            "title": other_look.title,
            "items": [
                {
                    "category": item.category,
                    "brand": item.brand,
                    "product_name": item.product_name,
                    "product_reference": item.product_reference,
                    "product_url": item.product_url,
                    "color": item.color
                }
                for item in other_look.items
            ]
        } if other_look else None
    }


@router.post("/{crossing_id}/like")
async def like_crossing(
    crossing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liker un croisement.
    """
    crossing = db.query(Crossing).filter(
        Crossing.id == crossing_id,
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        )
    ).first()

    if not crossing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Croisement non trouve"
        )

    # Verifier si deja like
    existing_like = db.query(CrossingLike).filter(
        CrossingLike.crossing_id == crossing_id,
        CrossingLike.user_id == current_user.id
    ).first()

    # Determiner le look de l'autre utilisateur
    if crossing.user1_id == current_user.id:
        other_look_id = crossing.user2_look_id
    else:
        other_look_id = crossing.user1_look_id

    if existing_like:
        # Unlike - Opération atomique
        db.delete(existing_like)
        db.query(Crossing).filter(Crossing.id == crossing_id).update(
            {Crossing.likes_count: Crossing.likes_count - 1},
            synchronize_session=False
        )
        # Propager unlike sur le look
        if other_look_id:
            existing_look_like = db.query(LookLike).filter(
                LookLike.look_id == other_look_id,
                LookLike.user_id == current_user.id
            ).first()
            if existing_look_like:
                db.delete(existing_look_like)
                db.query(Look).filter(Look.id == other_look_id).update(
                    {Look.likes_count: Look.likes_count - 1},
                    synchronize_session=False
                )
        db.commit()
        db.refresh(crossing)
        return {"liked": False, "likes_count": max(0, crossing.likes_count)}
    else:
        # Like - Opération atomique
        new_like = CrossingLike(crossing_id=crossing_id, user_id=current_user.id)
        db.add(new_like)
        db.query(Crossing).filter(Crossing.id == crossing_id).update(
            {Crossing.likes_count: Crossing.likes_count + 1},
            synchronize_session=False
        )
        # Propager like sur le look
        if other_look_id:
            existing_look_like = db.query(LookLike).filter(
                LookLike.look_id == other_look_id,
                LookLike.user_id == current_user.id
            ).first()
            if not existing_look_like:
                db.add(LookLike(look_id=other_look_id, user_id=current_user.id))
                db.query(Look).filter(Look.id == other_look_id).update(
                    {Look.likes_count: Look.likes_count + 1},
                    synchronize_session=False
                )
        db.commit()
        db.refresh(crossing)
        return {"liked": True, "likes_count": crossing.likes_count}


@router.post("/{crossing_id}/save")
async def save_crossing(
    crossing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sauvegarder un croisement.
    """
    crossing = db.query(Crossing).filter(
        Crossing.id == crossing_id,
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        )
    ).first()

    if not crossing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Croisement non trouve"
        )

    # Verifier si deja sauvegarde
    existing = db.query(SavedCrossing).filter(
        SavedCrossing.crossing_id == crossing_id,
        SavedCrossing.user_id == current_user.id
    ).first()

    if existing:
        # Retirer la sauvegarde
        db.delete(existing)
        db.commit()
        return {"saved": False}
    else:
        # Sauvegarder
        new_save = SavedCrossing(crossing_id=crossing_id, user_id=current_user.id)
        db.add(new_save)
        db.commit()
        return {"saved": True}


@router.get("/saved/list")
async def get_saved_crossings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir tous les croisements sauvegardes"""
    saved = db.query(SavedCrossing).filter(
        SavedCrossing.user_id == current_user.id
    ).order_by(SavedCrossing.created_at.desc()).all()

    result = []
    for s in saved:
        crossing = db.query(Crossing).filter(Crossing.id == s.crossing_id).first()
        if not crossing:
            continue

        # Determiner l'autre utilisateur
        if crossing.user1_id == current_user.id:
            other_user_id = crossing.user2_id
            other_look_id = crossing.user2_look_id
        else:
            other_user_id = crossing.user1_id
            other_look_id = crossing.user1_look_id

        other_user = db.query(User).filter(User.id == other_user_id).first()
        other_look = db.query(Look).filter(Look.id == other_look_id).first() if other_look_id else None

        result.append({
            "id": crossing.id,
            "crossed_at": crossing.crossed_at.isoformat(),
            "location_name": crossing.location_name,
            "likes_count": crossing.likes_count,
            "views_count": crossing.views_count,
            "saved_at": s.created_at.isoformat(),
            "other_user": {
                "id": other_user.id,
                "username": other_user.username,
                "avatar_url": other_user.avatar_url
            } if other_user else None,
            "other_look_photo_url": other_look.photo_url if other_look else None
        })

    return result


@router.get("/{crossing_id}/stats")
async def get_crossing_stats(
    crossing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir les stats d'un croisement (likes, vues, etc.)
    """
    crossing = db.query(Crossing).filter(
        Crossing.id == crossing_id,
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        )
    ).first()

    if not crossing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Croisement non trouve"
        )

    # Verifier si l'utilisateur a like
    user_liked = db.query(CrossingLike).filter(
        CrossingLike.crossing_id == crossing_id,
        CrossingLike.user_id == current_user.id
    ).first() is not None

    # Verifier si l'utilisateur a sauvegarde
    user_saved = db.query(SavedCrossing).filter(
        SavedCrossing.crossing_id == crossing_id,
        SavedCrossing.user_id == current_user.id
    ).first() is not None

    return {
        "likes_count": crossing.likes_count,
        "views_count": crossing.views_count,
        "user_liked": user_liked,
        "user_saved": user_saved
    }
