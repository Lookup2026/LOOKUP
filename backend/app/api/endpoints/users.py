from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models import User, BlockedUser, Report, Look, Follow, Notification
from app.api.deps import get_current_user


class ReportRequest(BaseModel):
    reason: Literal["inappropriate_content", "harassment", "spam", "fake_profile", "other"]
    user_id: Optional[int] = None
    look_id: Optional[int] = None
    details: Optional[str] = Field(None, max_length=1000)

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

    # Verifier si deja suivi ou demande en attente
    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == user_id
    ).first()

    if existing:
        # Unfollow ou annuler la demande
        db.delete(existing)
        db.commit()
        if existing.status == "pending":
            return {"following": False, "status": None, "message": "Demande annulee"}
        return {"following": False, "status": None, "message": "Tu ne suis plus cet utilisateur"}
    else:
        # Si le profil est prive, creer une demande en attente
        if target_user.is_private:
            follow = Follow(follower_id=current_user.id, followed_id=user_id, status="pending")
            db.add(follow)
            # Notification de demande d'abonnement
            db.add(Notification(
                user_id=user_id,
                actor_id=current_user.id,
                type="follow_request",
            ))
            db.commit()
            return {"following": False, "status": "pending", "message": "Demande d'abonnement envoyee"}
        else:
            # Profil public: follow direct
            follow = Follow(follower_id=current_user.id, followed_id=user_id, status="accepted")
            db.add(follow)
            # Notification follow
            db.add(Notification(
                user_id=user_id,
                actor_id=current_user.id,
                type="follow",
            ))
            db.commit()
            return {"following": True, "status": "accepted", "message": "Tu suis maintenant cet utilisateur"}


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

    if following:
        return {"is_following": following.status == "accepted", "status": following.status}
    return {"is_following": False, "status": None}


@router.get("/following")
async def get_following(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir la liste des gens que je suis (acceptes)"""
    follows = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.status == "accepted"
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
    """Obtenir la liste de mes followers (acceptes)"""
    followers = db.query(Follow).filter(
        Follow.followed_id == current_user.id,
        Follow.status == "accepted"
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


# ============== DEMANDES D'ABONNEMENT ==============

@router.get("/follow-requests")
async def get_follow_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir la liste des demandes d'abonnement en attente"""
    requests = db.query(Follow).filter(
        Follow.followed_id == current_user.id,
        Follow.status == "pending"
    ).all()

    return [
        {
            "id": r.id,
            "user_id": r.follower.id,
            "username": r.follower.username,
            "avatar_url": r.follower.avatar_url,
            "requested_at": r.created_at
        }
        for r in requests
    ]


@router.get("/follow-requests/count")
async def get_follow_requests_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir le nombre de demandes d'abonnement en attente"""
    count = db.query(Follow).filter(
        Follow.followed_id == current_user.id,
        Follow.status == "pending"
    ).count()

    return {"count": count}


@router.post("/follow-requests/{request_id}/accept")
async def accept_follow_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accepter une demande d'abonnement"""
    follow_request = db.query(Follow).filter(
        Follow.id == request_id,
        Follow.followed_id == current_user.id,
        Follow.status == "pending"
    ).first()

    if not follow_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande non trouvee"
        )

    # Accepter la demande
    follow_request.status = "accepted"

    # Envoyer une notification a celui qui a demande
    db.add(Notification(
        user_id=follow_request.follower_id,
        actor_id=current_user.id,
        type="follow_accepted",
    ))

    db.commit()
    return {"success": True, "message": "Demande acceptee"}


@router.post("/follow-requests/{request_id}/reject")
async def reject_follow_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Refuser une demande d'abonnement"""
    follow_request = db.query(Follow).filter(
        Follow.id == request_id,
        Follow.followed_id == current_user.id,
        Follow.status == "pending"
    ).first()

    if not follow_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande non trouvee"
        )

    # Supprimer la demande
    db.delete(follow_request)
    db.commit()
    return {"success": True, "message": "Demande refusee"}


@router.get("/search")
async def search_users(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rechercher un utilisateur par username"""
    # Echapper les caracteres speciaux SQL LIKE
    safe_q = q.replace("%", "").replace("_", "").replace("\\", "")
    users = db.query(User).filter(
        User.username.ilike(f"%{safe_q}%"),
        User.id != current_user.id,
        User.is_active == True,
        or_(User.is_visible == True, User.is_visible == None)
    ).limit(20).all()

    # Charger les follows en une seule requete (avec le status)
    user_ids = [u.id for u in users]
    follow_status = {}
    if user_ids:
        follows = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.followed_id.in_(user_ids)
        ).all()
        follow_status = {f.followed_id: f.status for f in follows}

    return [
        {
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "is_private": user.is_private or False,
            "is_following": follow_status.get(user.id) == "accepted",
            "follow_status": follow_status.get(user.id)  # None, "pending", ou "accepted"
        }
        for user in users
    ]


# ============== SIGNALEMENTS ==============

@router.post("/report")
async def report_content(
    report_data: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Signaler un utilisateur ou un look"""
    reason = report_data.reason
    user_id = report_data.user_id
    look_id = report_data.look_id
    details = report_data.details

    if not user_id and not look_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu dois specifier un utilisateur ou un look a signaler"
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
    from sqlalchemy import and_

    # Construire les filtres dynamiquement
    filters = [
        Report.reporter_id == current_user.id,
        Report.created_at >= datetime.utcnow() - timedelta(hours=24)
    ]

    if user_id:
        filters.append(Report.reported_user_id == user_id)
    if look_id:
        filters.append(Report.reported_look_id == look_id)

    recent = db.query(Report).filter(and_(*filters)).first()

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


# ============== VISIBILITE ==============

@router.put("/me/visibility")
async def update_visibility(
    visible: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Changer la visibilite du profil"""
    current_user.is_visible = visible
    db.commit()
    return {"is_visible": current_user.is_visible}


@router.get("/me/visibility")
async def get_visibility(
    current_user: User = Depends(get_current_user)
):
    """Obtenir l'etat de visibilite du profil"""
    return {"is_visible": current_user.is_visible if current_user.is_visible is not None else True}


# ============== PROFIL PRIVE ==============

@router.put("/me/privacy")
async def update_privacy(
    is_private: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activer/desactiver le profil prive (seuls les amis voient le contenu)"""
    current_user.is_private = is_private
    db.commit()
    return {"is_private": current_user.is_private}


@router.get("/me/privacy")
async def get_privacy(
    current_user: User = Depends(get_current_user)
):
    """Obtenir l'etat du profil prive"""
    return {"is_private": current_user.is_private if current_user.is_private is not None else False}


def is_friend(db: Session, user_id: int, other_user_id: int) -> bool:
    """Verifier si deux utilisateurs sont amis (se suivent mutuellement avec status accepted)"""
    # Verifier si user_id suit other_user_id (accepte)
    follows = db.query(Follow).filter(
        Follow.follower_id == user_id,
        Follow.followed_id == other_user_id,
        Follow.status == "accepted"
    ).first()

    # Verifier si other_user_id suit user_id (accepte)
    followed_by = db.query(Follow).filter(
        Follow.follower_id == other_user_id,
        Follow.followed_id == user_id,
        Follow.status == "accepted"
    ).first()

    return follows is not None and followed_by is not None
