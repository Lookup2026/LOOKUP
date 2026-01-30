from pydantic import BaseModel, field_validator, Field
from typing import Optional
from datetime import datetime

class LocationPingCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = Field(None, ge=0, le=10000)

class LocationPingResponse(LocationPingCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class CrossingBase(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    crossed_at: datetime

class CrossingResponse(CrossingBase):
    id: int
    user1_id: int
    user2_id: int
    user1_look_id: Optional[int] = None
    user2_look_id: Optional[int] = None

    class Config:
        from_attributes = True

class CrossingWithDetails(BaseModel):
    """Croisement avec details du look et de l'utilisateur croise"""
    id: int
    crossed_at: datetime
    latitude: float
    longitude: float
    location_name: Optional[str] = None

    # L'autre utilisateur
    other_user_id: int
    other_username: str
    other_avatar_url: Optional[str] = None

    # Le look de l'autre utilisateur
    other_look_id: Optional[int] = None
    other_look_photo_url: Optional[str] = None
    other_look_items: list = []

    # Stats du look
    views_count: int = 0
    likes_count: int = 0

    class Config:
        from_attributes = True
