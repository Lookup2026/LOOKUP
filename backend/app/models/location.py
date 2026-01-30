from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class LocationPing(Base):
    """Position GPS d'un utilisateur a un moment donne"""
    __tablename__ = "location_pings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone_id = Column(String, index=True, nullable=False)  # Zone 50mx50m
    accuracy = Column(Float, nullable=True)  # Precision en metres
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relations
    user = relationship("User", back_populates="location_pings")


class Crossing(Base):
    """Croisement entre deux utilisateurs dans la meme zone"""
    __tablename__ = "crossings"
    __table_args__ = (
        Index("ix_crossings_users", "user1_id", "user2_id"),
        Index("ix_crossings_crossed_at", "crossed_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Zone du croisement
    zone_id = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)  # Nom du lieu (optionnel)

    # Looks portes au moment du croisement
    user1_look_id = Column(Integer, ForeignKey("looks.id"), nullable=True)
    user2_look_id = Column(Integer, ForeignKey("looks.id"), nullable=True)

    crossed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Indicateurs de visibilite
    user1_viewed = Column(DateTime, nullable=True)
    user2_viewed = Column(DateTime, nullable=True)

    # Compteurs (pour le croisement, pas le look)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)

    # Relations
    likes = relationship("CrossingLike", back_populates="crossing", cascade="all, delete-orphan")
    saves = relationship("SavedCrossing", back_populates="crossing", cascade="all, delete-orphan")


class CrossingLike(Base):
    """Like sur un croisement"""
    __tablename__ = "crossing_likes"
    __table_args__ = (
        UniqueConstraint("crossing_id", "user_id", name="uq_crossing_like"),
    )

    id = Column(Integer, primary_key=True, index=True)
    crossing_id = Column(Integer, ForeignKey("crossings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    crossing = relationship("Crossing", back_populates="likes")


class SavedCrossing(Base):
    """Croisement sauvegarde par un utilisateur"""
    __tablename__ = "saved_crossings"
    __table_args__ = (
        UniqueConstraint("crossing_id", "user_id", name="uq_saved_crossing"),
    )

    id = Column(Integer, primary_key=True, index=True)
    crossing_id = Column(Integer, ForeignKey("crossings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    crossing = relationship("Crossing", back_populates="saves")
