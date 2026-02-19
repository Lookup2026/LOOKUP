from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models import User, Notification
from app.schemas.notification import NotificationResponse, NotificationActor
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste paginee des notifications, plus recentes en premier"""
    notifs = db.query(Notification).options(
        joinedload(Notification.actor)
    ).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for n in notifs:
        if not n.actor:
            continue
        result.append(NotificationResponse(
            id=n.id,
            type=n.type,
            actor=NotificationActor(
                id=n.actor.id,
                username=n.actor.username,
                avatar_url=n.actor.avatar_url,
                full_name=n.actor.full_name,
            ),
            look_id=n.look_id,
            is_read=n.is_read,
            created_at=n.created_at,
        ))
    return result


@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Nombre de notifications non lues"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}


@router.put("/read-all")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marquer toutes les notifications comme lues"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"success": True}
