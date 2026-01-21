from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import User, BlockedUser
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/{user_id}/block")
async def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bloquer un utilisateur"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu ne peux pas te bloquer toi-meme"
        )

    # Verifier que l'utilisateur existe
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouve"
        )

    # Verifier si deja bloque
    existing = db.query(BlockedUser).filter(
        BlockedUser.blocker_id == current_user.id,
        BlockedUser.blocked_id == user_id
    ).first()

    if existing:
        # Debloquer
        db.delete(existing)
        db.commit()
        return {"blocked": False, "message": "Utilisateur debloque"}
    else:
        # Bloquer
        block = BlockedUser(blocker_id=current_user.id, blocked_id=user_id)
        db.add(block)
        db.commit()
        return {"blocked": True, "message": "Utilisateur bloque"}


@router.get("/blocked", response_model=List[dict])
async def get_blocked_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir la liste des utilisateurs bloques"""
    blocked = db.query(BlockedUser).filter(
        BlockedUser.blocker_id == current_user.id
    ).all()

    return [
        {
            "id": b.blocked.id,
            "username": b.blocked.username,
            "avatar_url": b.blocked.avatar_url,
            "blocked_at": b.created_at
        }
        for b in blocked
    ]


@router.get("/{user_id}/is-blocked")
async def check_if_blocked(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verifier si un utilisateur est bloque"""
    blocked = db.query(BlockedUser).filter(
        BlockedUser.blocker_id == current_user.id,
        BlockedUser.blocked_id == user_id
    ).first()

    return {"is_blocked": blocked is not None}
