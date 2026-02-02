from pydantic import BaseModel
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from app.schemas.user import UserPublic

class LookItemBase(BaseModel):
    category: str  # top, bottom, shoes, accessory, outerwear
    brand: Optional[str] = None
    product_name: Optional[str] = None
    product_reference: Optional[str] = None
    product_url: Optional[str] = None
    color: Optional[str] = None

class LookItemCreate(LookItemBase):
    pass

class LookItemResponse(LookItemBase):
    id: int

    class Config:
        from_attributes = True

class LookBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    look_date: Optional[date] = None

class LookCreate(LookBase):
    items: List[LookItemCreate] = []

class LookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class LookResponse(LookBase):
    id: int
    user_id: int
    photo_url: str
    photo_urls: List[str] = []
    look_date: date
    created_at: datetime
    items: List[LookItemResponse] = []
    likes_count: int = 0
    views_count: int = 0

    class Config:
        from_attributes = True
