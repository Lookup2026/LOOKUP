from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
import os
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.core.storage import upload_photo, delete_photo
from app.models import User, Look, LookPhoto, LookItem, LookLike, LookView, SavedLook, Follow, BlockedUser, Notification
from app.schemas import LookCreate, LookResponse, LookItemCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/looks", tags=["Looks"])

# Limite de looks par jour
MAX_LOOKS_PER_DAY = 5


def _get_photo_urls(look):
    """Helper: retourne la liste des photo_urls d'un look"""
    if look.photos and len(look.photos) > 0:
        return [p.photo_url for p in look.photos]
    elif look.photo_url:
        return [look.photo_url]
    return []


def _look_to_response(look):
    """Convertit un Look ORM en dict avec photo_urls"""
    data = {
        "id": look.id,
        "user_id": look.user_id,
        "title": look.title,
        "description": look.description,
        "photo_url": look.photo_url,
        "photo_urls": _get_photo_urls(look),
        "look_date": look.look_date,
        "created_at": look.created_at,
        "items": look.items,
        "likes_count": look.likes_count,
        "views_count": look.views_count,
        "latitude": look.latitude,
        "longitude": look.longitude,
        "city": look.city,
        "country": look.country,
    }
    return data


@router.post("/", response_model=LookResponse, status_code=status.HTTP_201_CREATED)
async def create_look(
    photos: List[UploadFile] = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    look_date: Optional[str] = Form(None),
    items_json: Optional[str] = Form(None),  # JSON string des items
    item_photos: Optional[List[UploadFile]] = File(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creer un nouveau look du jour avec 1 a 5 photos"""
    import json

    # Verifier le nombre de photos (1-5)
    if len(photos) < 1 or len(photos) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entre 1 et 5 photos sont acceptees"
        )

    # Verifier la limite de looks par jour
    today = date.today()
    looks_today = db.query(Look).filter(
        Look.user_id == current_user.id,
        Look.look_date == today
    ).count()

    if looks_today >= MAX_LOOKS_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Tu as atteint la limite de {MAX_LOOKS_PER_DAY} looks par jour. Reviens demain !"
        )

    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

    # Upload toutes les photos
    uploaded_urls = []
    for photo in photos:
        if photo.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format accepte : JPEG, PNG ou WebP uniquement"
            )

        content = await photo.read(settings.MAX_FILE_SIZE + 1)
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Fichier trop volumineux (max 5MB)"
            )

        try:
            photo_url = await upload_photo(content, photo.filename)
            uploaded_urls.append(photo_url)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur lors de l'upload de la photo"
            )

    # Parser la date
    parsed_date = date.today()
    if look_date:
        try:
            parsed_date = date.fromisoformat(look_date)
        except ValueError:
            pass

    # Creer le look (photo_url = premiere photo pour backward compat)
    look = Look(
        user_id=current_user.id,
        title=title,
        description=description,
        photo_url=uploaded_urls[0],
        look_date=parsed_date,
        latitude=latitude,
        longitude=longitude,
        city=city[:100] if city else None,
        country=country[:100] if country else None
    )
    db.add(look)
    db.commit()
    db.refresh(look)

    # Creer les LookPhoto records
    for position, url in enumerate(uploaded_urls):
        db.add(LookPhoto(look_id=look.id, photo_url=url, position=position))
    db.commit()

    # Uploader les photos d'items si fournies
    item_photo_urls = {}
    if item_photos:
        for idx, ip in enumerate(item_photos):
            if not ip.filename:
                continue
            if ip.content_type not in ALLOWED_IMAGE_TYPES:
                continue
            ip_content = await ip.read(settings.MAX_FILE_SIZE + 1)
            if len(ip_content) > settings.MAX_FILE_SIZE:
                continue
            try:
                ip_url = await upload_photo(ip_content, ip.filename)
                item_photo_urls[idx] = ip_url
            except Exception:
                pass

    # Ajouter les items si fournis
    VALID_CATEGORIES = {"top", "bottom", "shoes", "accessory", "outerwear", "other"}
    if items_json:
        try:
            items = json.loads(items_json)
            if not isinstance(items, list):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Les items doivent etre une liste"
                )
            for item_data in items:
                if not isinstance(item_data, dict):
                    continue
                category = item_data.get("category", "other")
                if category not in VALID_CATEGORIES:
                    category = "other"
                # Photo de l'item via _photo_index
                item_photo_url = None
                photo_index = item_data.get("_photo_index")
                if photo_index is not None and photo_index in item_photo_urls:
                    item_photo_url = item_photo_urls[photo_index]
                item = LookItem(
                    look_id=look.id,
                    category=category,
                    brand=item_data.get("brand", "")[:100] if item_data.get("brand") else None,
                    product_name=item_data.get("product_name", "")[:200] if item_data.get("product_name") else None,
                    product_reference=item_data.get("product_reference", "")[:100] if item_data.get("product_reference") else None,
                    product_url=item_data.get("product_url", "")[:500] if item_data.get("product_url") else None,
                    color=item_data.get("color", "")[:50] if item_data.get("color") else None,
                    photo_url=item_photo_url
                )
                db.add(item)
            db.commit()
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format JSON invalide pour les items"
            )

    db.refresh(look)
    return _look_to_response(look)

@router.get("/", response_model=List[LookResponse])
async def get_my_looks(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir mes looks"""
    looks = db.query(Look).options(
        joinedload(Look.photos)
    ).filter(
        Look.user_id == current_user.id
    ).order_by(Look.look_date.desc()).offset(skip).limit(limit).all()
    return [_look_to_response(l) for l in looks]


@router.get("/limit")
async def get_looks_limit(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir le nombre de looks restants pour aujourd'hui"""
    today = date.today()
    looks_today = db.query(Look).filter(
        Look.user_id == current_user.id,
        Look.look_date == today
    ).count()

    return {
        "looks_today": looks_today,
        "max_per_day": MAX_LOOKS_PER_DAY,
        "remaining": max(0, MAX_LOOKS_PER_DAY - looks_today)
    }


@router.get("/discover")
async def discover_looks(
    q: Optional[str] = None,  # Search query
    period: str = "week",  # today, week, month, all
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Découvrir des looks - recherche par titre, triés par likes"""
    from datetime import datetime, timedelta

    # Calculer la date de début selon la période
    now = datetime.utcnow()
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:  # all
        start_date = None

    # Construire la requête
    query = db.query(Look).options(
        joinedload(Look.user),
        joinedload(Look.items),
        joinedload(Look.photos)
    )

    # Filtre par période
    if start_date:
        query = query.filter(Look.created_at >= start_date)

    # Filtre par recherche (titre)
    if q and len(q) >= 2:
        search_term = f"%{q.lower()}%"
        query = query.filter(Look.title.ilike(search_term))

    # Trier par likes (les plus populaires en premier)
    query = query.order_by(Look.likes_count.desc(), Look.created_at.desc())

    # Pagination
    looks = query.offset(skip).limit(limit).all()

    result = []
    for look in looks:
        user = look.user
        if not user:
            continue
        result.append({
            "id": look.id,
            "title": look.title,
            "photo_url": look.photo_url,
            "photo_urls": _get_photo_urls(look),
            "look_date": look.look_date.isoformat(),
            "created_at": look.created_at.isoformat(),
            "likes_count": look.likes_count,
            "views_count": look.views_count,
            # Pas de localisation pour la sécurité
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar_url": user.avatar_url
            },
            "items": [
                {
                    "category": item.category,
                    "brand": item.brand,
                    "product_name": item.product_name,
                    "color": item.color,
                    "photo_url": item.photo_url
                }
                for item in look.items
            ]
        })

    return result


@router.get("/feed")
async def get_friends_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir les looks du jour des gens que je suis"""
    today = date.today()

    # Obtenir les IDs des gens suivis
    following_ids = [
        f.followed_id for f in db.query(Follow).filter(
            Follow.follower_id == current_user.id
        ).all()
    ]

    if not following_ids:
        return []

    # Obtenir leurs looks du jour avec user precharge
    looks = db.query(Look).options(
        joinedload(Look.user),
        joinedload(Look.items),
        joinedload(Look.photos)
    ).filter(
        Look.user_id.in_(following_ids),
        Look.look_date == today
    ).order_by(Look.created_at.desc()).all()

    result = []
    for look in looks:
        user = look.user
        if not user:
            continue
        result.append({
            "id": look.id,
            "title": look.title,
            "photo_url": look.photo_url,
            "photo_urls": _get_photo_urls(look),
            "look_date": look.look_date.isoformat(),
            "created_at": look.created_at.isoformat(),
            "likes_count": look.likes_count,
            "views_count": look.views_count,
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar_url": user.avatar_url
            } if user else None,
            "items": [
                {
                    "category": item.category,
                    "brand": item.brand,
                    "product_name": item.product_name,
                    "color": item.color,
                    "photo_url": item.photo_url
                }
                for item in look.items
            ]
        })

    return result


@router.get("/today", response_model=List[LookResponse])
async def get_today_looks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir les looks des dernieres 24h"""
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(hours=24)
    looks = db.query(Look).options(
        joinedload(Look.photos)
    ).filter(
        Look.user_id == current_user.id,
        Look.created_at >= yesterday
    ).order_by(Look.created_at.desc()).all()
    return [_look_to_response(l) for l in looks]

@router.get("/{look_id}")
async def get_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir un look par ID avec infos utilisateur"""
    look = db.query(Look).options(joinedload(Look.photos)).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    user = db.query(User).filter(User.id == look.user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Look non trouve")

    # Verifier l'acces: bloques et profils prives
    if user.id != current_user.id:
        # Bloque ?
        blocked = db.query(BlockedUser).filter(
            ((BlockedUser.blocker_id == current_user.id) & (BlockedUser.blocked_id == user.id)) |
            ((BlockedUser.blocker_id == user.id) & (BlockedUser.blocked_id == current_user.id))
        ).first()
        if blocked:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Look non trouve")

        # Profil prive ?
        if user.is_private:
            is_friend = db.query(Follow).filter(
                Follow.follower_id == current_user.id, Follow.followed_id == user.id
            ).first() and db.query(Follow).filter(
                Follow.follower_id == user.id, Follow.followed_id == current_user.id
            ).first()
            if not is_friend:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ce profil est prive")

    # Verifier si l'utilisateur courant like/saved ce look
    user_liked = db.query(LookLike).filter(
        LookLike.look_id == look_id,
        LookLike.user_id == current_user.id
    ).first() is not None

    user_saved = db.query(SavedLook).filter(
        SavedLook.look_id == look_id,
        SavedLook.user_id == current_user.id
    ).first() is not None

    # Enregistrer la vue
    existing_view = db.query(LookView).filter(
        LookView.look_id == look_id,
        LookView.user_id == current_user.id
    ).first()
    if not existing_view and look.user_id != current_user.id:
        db.add(LookView(look_id=look_id, user_id=current_user.id))
        look.views_count += 1
        db.commit()
        db.refresh(look)

    return {
        "id": look.id,
        "title": look.title,
        "description": look.description,
        "photo_url": look.photo_url,
        "photo_urls": _get_photo_urls(look),
        "look_date": look.look_date.isoformat(),
        "created_at": look.created_at.isoformat(),
        "likes_count": look.likes_count,
        "views_count": look.views_count,
        "user": {
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url
        } if user else None,
        "items": [
            {
                "id": item.id,
                "category": item.category,
                "brand": item.brand,
                "product_name": item.product_name,
                "product_reference": item.product_reference,
                "product_url": item.product_url,
                "color": item.color,
                "photo_url": item.photo_url
            }
            for item in look.items
        ],
        "stats": {
            "likes_count": look.likes_count,
            "views_count": look.views_count,
            "user_liked": user_liked,
            "user_saved": user_saved
        }
    }

@router.put("/{look_id}", response_model=LookResponse)
async def update_look(
    look_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    items_json: Optional[str] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    item_photos: Optional[List[UploadFile]] = File(None),
    delete_photo_ids_json: Optional[str] = Form(None),  # JSON array d'IDs de LookPhoto a supprimer
    existing_photos_json: Optional[str] = Form(None),  # JSON array d'IDs ordonnés pour réordonnancement
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre a jour un look avec support multi-photos"""
    import json

    look = db.query(Look).options(joinedload(Look.photos)).filter(
        Look.id == look_id,
        Look.user_id == current_user.id
    ).first()

    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Mettre a jour le titre et la description
    if title is not None:
        look.title = title
    if description is not None:
        look.description = description

    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

    # 1. Supprimer les photos demandees
    if delete_photo_ids_json:
        try:
            delete_ids = json.loads(delete_photo_ids_json)
            if isinstance(delete_ids, list):
                for photo_record in list(look.photos):
                    if photo_record.id in delete_ids:
                        await delete_photo(photo_record.photo_url)
                        db.delete(photo_record)
        except json.JSONDecodeError:
            pass

    # 2. Reordonner les photos existantes
    if existing_photos_json:
        try:
            ordered_ids = json.loads(existing_photos_json)
            if isinstance(ordered_ids, list):
                for new_pos, photo_id in enumerate(ordered_ids):
                    photo_record = db.query(LookPhoto).filter(
                        LookPhoto.id == photo_id, LookPhoto.look_id == look_id
                    ).first()
                    if photo_record:
                        photo_record.position = new_pos
        except json.JSONDecodeError:
            pass

    # 3. Ajouter les nouvelles photos
    # Determiner la position de depart
    existing_photos = db.query(LookPhoto).filter(LookPhoto.look_id == look_id).all()
    next_position = max([p.position for p in existing_photos], default=-1) + 1

    if photos:
        for photo in photos:
            if not photo.filename:
                continue
            if photo.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Format accepte : JPEG, PNG ou WebP uniquement"
                )
            content = await photo.read(settings.MAX_FILE_SIZE + 1)
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Fichier trop volumineux (max 5MB)"
                )
            try:
                photo_url = await upload_photo(content, photo.filename)
                db.add(LookPhoto(look_id=look.id, photo_url=photo_url, position=next_position))
                next_position += 1
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erreur lors de l'upload de la photo"
                )

    # Verifier qu'il reste au moins 1 photo et max 5
    total_photos = db.query(LookPhoto).filter(LookPhoto.look_id == look_id).count()
    if total_photos < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un look doit avoir au moins 1 photo"
        )
    if total_photos > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 photos par look"
        )

    # 4. Mettre a jour photo_url = premiere photo (backward compat)
    first_photo = db.query(LookPhoto).filter(
        LookPhoto.look_id == look_id
    ).order_by(LookPhoto.position).first()
    if first_photo:
        look.photo_url = first_photo.photo_url

    # Uploader les photos d'items si fournies
    item_photo_urls = {}
    if item_photos:
        for idx, ip in enumerate(item_photos):
            if not ip.filename:
                continue
            if ip.content_type not in ALLOWED_IMAGE_TYPES:
                continue
            ip_content = await ip.read(settings.MAX_FILE_SIZE + 1)
            if len(ip_content) > settings.MAX_FILE_SIZE:
                continue
            try:
                ip_url = await upload_photo(ip_content, ip.filename)
                item_photo_urls[idx] = ip_url
            except Exception:
                pass

    # Mettre a jour les items si fournis
    ALLOWED_CATEGORIES = {"top", "bottom", "shoes", "accessory", "outerwear", "other"}
    if items_json is not None:
        try:
            items = json.loads(items_json)
            if not isinstance(items, list):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Les items doivent etre une liste"
                )
            # Supprimer les anciennes photos d'items
            old_items = db.query(LookItem).filter(LookItem.look_id == look_id).all()
            for old_item in old_items:
                if old_item.photo_url:
                    await delete_photo(old_item.photo_url)
            db.query(LookItem).filter(LookItem.look_id == look_id).delete()
            for item_data in items:
                if not isinstance(item_data, dict):
                    continue
                category = item_data.get("category", "other")
                if category not in ALLOWED_CATEGORIES:
                    category = "other"
                # Determiner la photo de l'item
                item_photo_url = None
                photo_index = item_data.get("_photo_index")
                if photo_index is not None and photo_index in item_photo_urls:
                    item_photo_url = item_photo_urls[photo_index]
                elif item_data.get("photo_url") and not item_data.get("_remove_photo"):
                    # Garder la photo existante
                    item_photo_url = item_data["photo_url"]
                item = LookItem(
                    look_id=look.id,
                    category=category,
                    brand=item_data.get("brand", "")[:100] if item_data.get("brand") else None,
                    product_name=item_data.get("product_name", "")[:200] if item_data.get("product_name") else None,
                    product_reference=item_data.get("product_reference", "")[:100] if item_data.get("product_reference") else None,
                    product_url=item_data.get("product_url", "")[:500] if item_data.get("product_url") else None,
                    color=item_data.get("color", "")[:50] if item_data.get("color") else None,
                    photo_url=item_photo_url
                )
                db.add(item)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format JSON invalide pour les items"
            )

    db.commit()
    db.refresh(look)
    return _look_to_response(look)


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer un look"""
    look = db.query(Look).filter(
        Look.id == look_id,
        Look.user_id == current_user.id
    ).first()

    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Supprimer toutes les photos de Supabase Storage
    look_photos = db.query(LookPhoto).filter(LookPhoto.look_id == look_id).all()
    for lp in look_photos:
        await delete_photo(lp.photo_url)
    # Fallback: supprimer aussi photo_url principale si pas dans look_photos
    if look.photo_url and not look_photos:
        await delete_photo(look.photo_url)
    # Supprimer les photos d'items
    for item in look.items:
        if item.photo_url:
            await delete_photo(item.photo_url)

    db.delete(look)
    db.commit()


@router.post("/{look_id}/like")
async def like_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liker un look (anonyme).
    Le proprietaire du look voit juste le nombre, pas qui a like.
    """
    look = db.query(Look).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Verifier si deja like
    existing_like = db.query(LookLike).filter(
        LookLike.look_id == look_id,
        LookLike.user_id == current_user.id
    ).first()

    if existing_like:
        # Unlike (retirer le like) - Opération atomique
        db.delete(existing_like)
        db.query(Look).filter(Look.id == look_id).update(
            {Look.likes_count: Look.likes_count - 1},
            synchronize_session=False
        )
        db.commit()
        # Récupérer la valeur mise à jour
        db.refresh(look)
        return {"liked": False, "likes_count": max(0, look.likes_count)}
    else:
        # Like - Opération atomique
        new_like = LookLike(look_id=look_id, user_id=current_user.id)
        db.add(new_like)
        db.query(Look).filter(Look.id == look_id).update(
            {Look.likes_count: Look.likes_count + 1},
            synchronize_session=False
        )
        # Notification like (pas si propre look)
        if look.user_id != current_user.id:
            db.add(Notification(
                user_id=look.user_id,
                actor_id=current_user.id,
                type="like",
                look_id=look_id,
            ))
        db.commit()
        db.refresh(look)
        return {"liked": True, "likes_count": look.likes_count}


@router.post("/{look_id}/view")
async def view_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enregistrer une vue sur un look (anonyme).
    Compte uniquement 1 vue par utilisateur.
    """
    look = db.query(Look).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Ne pas compter ses propres vues
    if look.user_id == current_user.id:
        return {"viewed": False, "views_count": look.views_count}

    # Verifier si deja vu
    existing_view = db.query(LookView).filter(
        LookView.look_id == look_id,
        LookView.user_id == current_user.id
    ).first()

    if not existing_view:
        new_view = LookView(look_id=look_id, user_id=current_user.id)
        db.add(new_view)
        look.views_count += 1
        db.commit()

    return {"viewed": True, "views_count": look.views_count}


@router.get("/{look_id}/stats")
async def get_look_stats(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir les stats d'un look (likes, vues).
    Indique aussi si l'utilisateur courant a like.
    """
    look = db.query(Look).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Verifier si l'utilisateur a like
    user_liked = db.query(LookLike).filter(
        LookLike.look_id == look_id,
        LookLike.user_id == current_user.id
    ).first() is not None

    # Verifier si l'utilisateur a sauvegarde
    user_saved = db.query(SavedLook).filter(
        SavedLook.look_id == look_id,
        SavedLook.user_id == current_user.id
    ).first() is not None

    return {
        "likes_count": look.likes_count,
        "views_count": look.views_count,
        "user_liked": user_liked,
        "user_saved": user_saved
    }


@router.post("/{look_id}/save")
async def save_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sauvegarder un look (bookmark)"""
    look = db.query(Look).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )

    # Verifier si deja sauvegarde
    existing = db.query(SavedLook).filter(
        SavedLook.look_id == look_id,
        SavedLook.user_id == current_user.id
    ).first()

    if existing:
        # Retirer la sauvegarde
        db.delete(existing)
        db.commit()
        return {"saved": False}
    else:
        # Sauvegarder
        new_save = SavedLook(look_id=look_id, user_id=current_user.id)
        db.add(new_save)
        db.commit()
        return {"saved": True}


@router.get("/saved/list", response_model=List[LookResponse])
async def get_saved_looks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir tous les looks sauvegardes"""
    saved = db.query(SavedLook).filter(
        SavedLook.user_id == current_user.id
    ).order_by(SavedLook.created_at.desc()).all()

    look_ids = [s.look_id for s in saved]
    looks = db.query(Look).options(joinedload(Look.photos)).filter(Look.id.in_(look_ids)).all() if look_ids else []

    # Trier par ordre de sauvegarde
    look_dict = {look.id: look for look in looks}
    return [_look_to_response(look_dict[lid]) for lid in look_ids if lid in look_dict]
