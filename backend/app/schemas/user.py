from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    full_name: Optional[str] = Field(None, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if not re.match(r"^[a-zA-Z0-9_.-]+$", v):
            raise ValueError("Le username ne peut contenir que des lettres, chiffres, _ . -")
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    referral_code: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Le mot de passe doit contenir au moins une majuscule")
        if not re.search(r"[0-9]", v):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    created_at: datetime
    referral_code: Optional[str] = None
    referral_count: int = 0

    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    """Info publique d'un utilisateur (pour les croisements)"""
    id: int
    username: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
