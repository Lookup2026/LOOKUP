from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.zones import get_zone_id
from app.models import User, Look, LocationPing, Crossing
from app.schemas import LocationPingCreate, CrossingWithDetails
from app.api.deps import get_current_user

router = APIRouter(prefix="/crossings", tags=["Crossings"])

@router.post("/ping")
async def send_location_ping(
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

    # Trouver les autres utilisateurs dans la MEME ZONE au meme moment
    users_in_same_zone = db.query(LocationPing).filter(
        LocationPing.user_id != current_user.id,
        LocationPing.zone_id == zone_id,  # Meme zone!
        LocationPing.timestamp >= time_window
    ).all()

    new_crossings = []

    for other_ping in users_in_same_zone:
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
            Crossing.crossed_at >= time_window
        ).first()

        if not existing:
            # Obtenir les looks du jour des deux utilisateurs
            today = datetime.utcnow().date()
            my_look = db.query(Look).filter(
                Look.user_id == current_user.id,
                Look.look_date == today
            ).first()
            other_look = db.query(Look).filter(
                Look.user_id == other_ping.user_id,
                Look.look_date == today
            ).first()

            # Creer le croisement
            crossing = Crossing(
                user1_id=current_user.id,
                user2_id=other_ping.user_id,
                zone_id=zone_id,
                latitude=location.latitude,
                longitude=location.longitude,
                user1_look_id=my_look.id if my_look else None,
                user2_look_id=other_look.id if other_look else None
            )
            db.add(crossing)
            new_crossings.append({
                "user_id": other_ping.user_id,
                "zone": zone_id
            })

    db.commit()

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
    """
    # Seulement les croisements des dernieres 24h
    since_24h = datetime.utcnow() - timedelta(hours=24)

    crossings = db.query(Crossing).filter(
        or_(
            Crossing.user1_id == current_user.id,
            Crossing.user2_id == current_user.id
        ),
        Crossing.crossed_at >= since_24h  # Visible 24h
    ).order_by(Crossing.crossed_at.desc()).offset(skip).limit(limit).all()

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

        # Obtenir le look
        other_look = None
        look_items = []
        if other_look_id:
            other_look = db.query(Look).filter(Look.id == other_look_id).first()
            if other_look:
                look_items = [
                    {
                        "category": item.category,
                        "brand": item.brand,
                        "product_name": item.product_name,
                        "color": item.color
                    }
                    for item in other_look.items
                ]

        result.append(CrossingWithDetails(
            id=c.id,
            crossed_at=c.crossed_at,
            latitude=c.latitude or 0,
            longitude=c.longitude or 0,
            location_name=c.location_name,
            other_user_id=other_user.id,
            other_username=other_user.username,
            other_avatar_url=other_user.avatar_url,
            other_look_id=other_look_id,
            other_look_photo_url=other_look.photo_url if other_look else None,
            other_look_items=look_items
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

    # Marquer comme vu
    if crossing.user1_id == current_user.id and not crossing.user1_viewed:
        crossing.user1_viewed = datetime.utcnow()
    elif crossing.user2_id == current_user.id and not crossing.user2_viewed:
        crossing.user2_viewed = datetime.utcnow()
    db.commit()

    # Retourner les details complets
    if crossing.user1_id == current_user.id:
        other_user_id = crossing.user2_id
        other_look_id = crossing.user2_look_id
    else:
        other_user_id = crossing.user1_id
        other_look_id = crossing.user1_look_id

    other_user = db.query(User).filter(User.id == other_user_id).first()
    other_look = db.query(Look).filter(Look.id == other_look_id).first() if other_look_id else None

    return {
        "crossing": {
            "id": crossing.id,
            "crossed_at": crossing.crossed_at.isoformat(),
            "zone_id": crossing.zone_id,
            "latitude": crossing.latitude,
            "longitude": crossing.longitude,
            "location_name": crossing.location_name
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
