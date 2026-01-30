from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
import os
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.core.storage import upload_photo, delete_photo
from app.models import User, Look, LookItem, LookLike, LookView, SavedLook, Follow, BlockedUser
from app.schemas import LookCreate, LookResponse, LookItemCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/looks", tags=["Looks"])

# Limite de looks par jour
MAX_LOOKS_PER_DAY = 5


@router.post("/", response_model=LookResponse, status_code=status.HTTP_201_CREATED)
async def create_look(
    photo: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    look_date: Optional[str] = Form(None),
    items_json: Optional[str] = Form(None),  # JSON string des items
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creer un nouveau look du jour avec photo"""
    import json

    # Verifier la limite de looks par jour (with_for_update pour eviter race condition)
    today = date.today()
    looks_today = db.query(Look).filter(
        Look.user_id == current_user.id,
        Look.look_date == today
    ).with_for_update().count()

    if looks_today >= MAX_LOOKS_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Tu as atteint la limite de {MAX_LOOKS_PER_DAY} looks par jour. Reviens demain !"
        )

    # Verifier le type de fichier (whitelist stricte)
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if photo.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format accepte : JPEG, PNG ou WebP uniquement"
        )

    # Lire le contenu du fichier (taille limitee)
    content = await photo.read(settings.MAX_FILE_SIZE + 1)
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier trop volumineux (max 5MB)"
        )

    # Upload vers Supabase Storage
    try:
        photo_url = await upload_photo(content, photo.filename)
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

    # Creer le look
    look = Look(
        user_id=current_user.id,
        title=title,
        description=description,
        photo_url=photo_url,
        look_date=parsed_date
    )
    db.add(look)
    db.commit()
    db.refresh(look)

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
                item = LookItem(
                    look_id=look.id,
                    category=category,
                    brand=item_data.get("brand", "")[:100] if item_data.get("brand") else None,
                    product_name=item_data.get("product_name", "")[:200] if item_data.get("product_name") else None,
                    product_reference=item_data.get("product_reference", "")[:100] if item_data.get("product_reference") else None,
                    product_url=item_data.get("product_url", "")[:500] if item_data.get("product_url") else None,
                    color=item_data.get("color", "")[:50] if item_data.get("color") else None
                )
                db.add(item)
            db.commit()
            db.refresh(look)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format JSON invalide pour les items"
            )

    return look

@router.get("/", response_model=List[LookResponse])
async def get_my_looks(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir mes looks"""
    looks = db.query(Look).filter(
        Look.user_id == current_user.id
    ).order_by(Look.look_date.desc()).offset(skip).limit(limit).all()
    return looks


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
        joinedload(Look.items)
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
                    "color": item.color
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
    looks = db.query(Look).filter(
        Look.user_id == current_user.id,
        Look.created_at >= yesterday
    ).order_by(Look.created_at.desc()).all()
    return looks

@router.get("/{look_id}")
async def get_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir un look par ID avec infos utilisateur"""
    look = db.query(Look).filter(Look.id == look_id).first()
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
                "color": item.color
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
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre a jour un look"""
    import json

    look = db.query(Look).filter(
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

    # Mettre a jour la photo si fournie
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if photo:
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

        # Supprimer l'ancienne photo
        if look.photo_url:
            await delete_photo(look.photo_url)

        # Upload la nouvelle
        try:
            look.photo_url = await upload_photo(content, photo.filename)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur lors de l'upload de la photo"
            )

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
            # Supprimer les anciens items
            db.query(LookItem).filter(LookItem.look_id == look_id).delete()

            # Ajouter les nouveaux avec validation
            for item_data in items:
                if not isinstance(item_data, dict):
                    continue
                category = item_data.get("category", "other")
                if category not in ALLOWED_CATEGORIES:
                    category = "other"
                item = LookItem(
                    look_id=look.id,
                    category=category,
                    brand=item_data.get("brand", "")[:100] if item_data.get("brand") else None,
                    product_name=item_data.get("product_name", "")[:200] if item_data.get("product_name") else None,
                    product_reference=item_data.get("product_reference", "")[:100] if item_data.get("product_reference") else None,
                    product_url=item_data.get("product_url", "")[:500] if item_data.get("product_url") else None,
                    color=item_data.get("color", "")[:50] if item_data.get("color") else None
                )
                db.add(item)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format JSON invalide pour les items"
            )

    db.commit()
    db.refresh(look)
    return look


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

    # Supprimer la photo de Supabase Storage
    if look.photo_url:
        await delete_photo(look.photo_url)

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
    looks = db.query(Look).filter(Look.id.in_(look_ids)).all() if look_ids else []

    # Trier par ordre de sauvegarde
    look_dict = {look.id: look for look in looks}
    return [look_dict[lid] for lid in look_ids if lid in look_dict]
