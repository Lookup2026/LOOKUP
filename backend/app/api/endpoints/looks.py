from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.core.storage import upload_photo, delete_photo
from app.models import User, Look, LookItem, LookLike, LookView
from app.schemas import LookCreate, LookResponse, LookItemCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/looks", tags=["Looks"])

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

    # Verifier le type de fichier
    if not photo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit etre une image"
        )

    # Lire le contenu du fichier
    content = await photo.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier trop volumineux (max 5MB)"
        )

    # Upload vers Supabase Storage
    try:
        photo_url = await upload_photo(content, photo.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur upload photo: {str(e)}"
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
    if items_json:
        try:
            items = json.loads(items_json)
            for item_data in items:
                item = LookItem(
                    look_id=look.id,
                    category=item_data.get("category", "other"),
                    brand=item_data.get("brand"),
                    product_name=item_data.get("product_name"),
                    product_reference=item_data.get("product_reference"),
                    product_url=item_data.get("product_url"),
                    color=item_data.get("color")
                )
                db.add(item)
            db.commit()
            db.refresh(look)
        except json.JSONDecodeError:
            pass

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

@router.get("/{look_id}", response_model=LookResponse)
async def get_look(
    look_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir un look par ID"""
    look = db.query(Look).filter(Look.id == look_id).first()
    if not look:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Look non trouve"
        )
    return look

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
    if photo:
        if not photo.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier doit etre une image"
            )

        content = await photo.read()
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
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur upload photo: {str(e)}"
            )

    # Mettre a jour les items si fournis
    if items_json is not None:
        try:
            # Supprimer les anciens items
            db.query(LookItem).filter(LookItem.look_id == look_id).delete()

            # Ajouter les nouveaux
            items = json.loads(items_json)
            for item_data in items:
                item = LookItem(
                    look_id=look.id,
                    category=item_data.get("category", "other"),
                    brand=item_data.get("brand"),
                    product_name=item_data.get("product_name"),
                    product_reference=item_data.get("product_reference"),
                    product_url=item_data.get("product_url"),
                    color=item_data.get("color")
                )
                db.add(item)
        except json.JSONDecodeError:
            pass

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
        # Unlike (retirer le like)
        db.delete(existing_like)
        look.likes_count = max(0, look.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": look.likes_count}
    else:
        # Like
        new_like = LookLike(look_id=look_id, user_id=current_user.id)
        db.add(new_like)
        look.likes_count += 1
        db.commit()
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

    return {
        "likes_count": look.likes_count,
        "views_count": look.views_count,
        "user_liked": user_liked
    }
