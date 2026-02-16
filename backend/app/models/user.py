from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
from app.core.database import Base

def generate_referral_code():
    """Genere un code de parrainage unique de 8 caracteres"""
    return secrets.token_urlsafe(6)[:8].upper()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable pour les comptes Apple Sign In
    apple_id = Column(String, unique=True, nullable=True, index=True)  # Apple Sign In identifier
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    username_changed_at = Column(DateTime, nullable=True)  # Pour limiter le changement de username a 1x/15 jours
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)
    is_private = Column(Boolean, default=False)  # Profil prive: seuls les amis voient le contenu
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Parrainage
    referral_code = Column(String, unique=True, index=True, nullable=True)
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_count = Column(Integer, default=0)

    # Relations
    looks = relationship("Look", back_populates="user", cascade="all, delete-orphan")
    location_pings = relationship("LocationPing", back_populates="user", cascade="all, delete-orphan")
    referred_by = relationship("User", remote_side=[id], foreign_keys=[referred_by_id])


class Follow(Base):
    """Table pour stocker les abonnements (followers)"""
    __tablename__ = "follows"
    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follow"),
    )

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    followed_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="accepted")  # "pending" ou "accepted"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    follower = relationship("User", foreign_keys=[follower_id])
    followed = relationship("User", foreign_keys=[followed_id])


class BlockedUser(Base):
    """Table pour stocker les utilisateurs bloques"""
    __tablename__ = "blocked_users"
    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="uq_block"),
    )

    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blocked_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    blocker = relationship("User", foreign_keys=[blocker_id])
    blocked = relationship("User", foreign_keys=[blocked_id])
