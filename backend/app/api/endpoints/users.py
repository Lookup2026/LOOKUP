from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import User, BlockedUser, Report, Look, Follow
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


# ============== FOLLOW ==============

@router.post("/{user_id}/follow")
async def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Suivre/Ne plus suivre un utilisateur (toggle)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu ne peux pas te suivre toi-meme"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouve"
        )

    # Verifier si deja suivi
    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()

    if existing:
        # Unfollow
        db.delete(existing)
        db.commit()
        return {"following": False, "message": "Tu ne suis plus cet utilisateur"}
    else:
        # Follow
        follow = Follow(follower_id=current_user.id, followed_id=user_id)
        db.add(follow)
        db.commit()
        return {"following": True, "message": "Tu suis maintenant cet utilisateur"}


@router.get("/{user_id}/is-following")
async def check_if_following(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verifier si on suit un utilisateur"""
    following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()

    return {"is_following": following is not None}


@router.get("/following")
async def get_following(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir la liste des gens que je suis"""
    follows = db.query(Follow).filter(
        Follow.follower_id == current_user.id
    ).all()

    return [
        {
            "id": f.followed.id,
            "username": f.followed.username,
            "avatar_url": f.followed.avatar_url,
            "followed_at": f.created_at
        }
        for f in follows
    ]


@router.get("/followers")
async def get_followers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir la liste de mes followers"""
    followers = db.query(Follow).filter(
        Follow.followed_id == current_user.id
    ).all()

    return [
        {
            "id": f.follower.id,
            "username": f.follower.username,
            "avatar_url": f.follower.avatar_url,
            "followed_at": f.created_at
        }
        for f in followers
    ]


@router.get("/search")
async def search_users(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rechercher un utilisateur par username"""
    users = db.query(User).filter(
        User.username.ilike(f"%{q}%"),
        User.id != current_user.id,
        User.is_active == True
    ).limit(20).all()

    # Verifier le statut de suivi pour chaque resultat
    result = []
    for user in users:
        is_following = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.followed_id == user.id
        ).first() is not None

        result.append({
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "is_following": is_following
        })

    return result


# ============== SIGNALEMENTS ==============

REPORT_REASONS = [
    "inappropriate_content",  # Contenu inapproprie
    "harassment",             # Harcelement
    "spam",                   # Spam
    "fake_profile",           # Faux profil
    "other"                   # Autre
]

@router.post("/report")
async def report_content(
    reason: str,
    user_id: int = None,
    look_id: int = None,
    details: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Signaler un utilisateur ou un look"""
    if not user_id and not look_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu dois specifier un utilisateur ou un look a signaler"
        )

    if reason not in REPORT_REASONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Raison invalide. Choisis parmi: {', '.join(REPORT_REASONS)}"
        )

    # Verifier que l'utilisateur/look existe
    if user_id:
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu ne peux pas te signaler toi-meme"
            )
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouve"
            )

    if look_id:
        target_look = db.query(Look).filter(Look.id == look_id).first()
        if not target_look:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Look non trouve"
            )
        # Si on signale un look, on recupere aussi l'utilisateur
        if not user_id:
            user_id = target_look.user_id

    # Verifier si deja signale recemment (eviter le spam)
    from datetime import datetime, timedelta
    recent = db.query(Report).filter(
        Report.reporter_id == current_user.id,
        Report.reported_user_id == user_id if user_id else True,
        Report.reported_look_id == look_id if look_id else True,
        Report.created_at >= datetime.utcnow() - timedelta(hours=24)
    ).first()

    if recent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu as deja signale ce contenu recemment"
        )

    # Creer le signalement
    report = Report(
        reporter_id=current_user.id,
        reported_user_id=user_id,
        reported_look_id=look_id,
        reason=reason,
        details=details
    )
    db.add(report)
    db.commit()

    return {"success": True, "message": "Signalement envoye. Merci de nous aider a garder LOOKUP sur."}
