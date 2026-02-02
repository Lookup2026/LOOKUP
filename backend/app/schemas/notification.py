from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationActor(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str] = None
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    type: str
    actor: NotificationActor
    look_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
