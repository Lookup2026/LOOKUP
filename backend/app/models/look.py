from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date, UniqueConstraint, Index, Float
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base

class Look(Base):
    __tablename__ = "looks"
    __table_args__ = (
        Index("ix_looks_user_date", "user_id", "look_date"),
        Index("ix_looks_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=False)
    look_date = Column(Date, default=date.today, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Localisation du look
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # Compteurs (anonymes)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)

    # Relations
    user = relationship("User", back_populates="looks")
    items = relationship("LookItem", back_populates="look", cascade="all, delete-orphan")
    photos = relationship("LookPhoto", back_populates="look", cascade="all, delete-orphan", order_by="LookPhoto.position")
    likes = relationship("LookLike", back_populates="look", cascade="all, delete-orphan")
    views = relationship("LookView", back_populates="look", cascade="all, delete-orphan")


class LookPhoto(Base):
    """Photo individuelle d'un look (jusqu'a 5 photos par look)"""
    __tablename__ = "look_photos"

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False, index=True)
    photo_url = Column(String, nullable=False)
    position = Column(Integer, nullable=False, default=0)  # 0-based

    # Relations
    look = relationship("Look", back_populates="photos")


class LookItem(Base):
    """Piece individuelle d'un look (haut, bas, chaussures, accessoire)"""
    __tablename__ = "look_items"

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)

    # Type de vetement
    category = Column(String, nullable=False)  # top, bottom, shoes, accessory, outerwear

    # Infos produit
    brand = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    product_reference = Column(String, nullable=True)  # Reference produit
    product_url = Column(String, nullable=True)  # Lien vers le produit
    color = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)  # Photo individuelle de la piece

    # Relations
    look = relationship("Look", back_populates="items")


class LookLike(Base):
    """Like anonyme sur un look (l'owner ne sait pas qui a like)"""
    __tablename__ = "look_likes"
    __table_args__ = (
        UniqueConstraint("look_id", "user_id", name="uq_look_like"),
    )

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look", back_populates="likes")


class LookView(Base):
    """Vue anonyme sur un look (quand quelqu'un consulte un look croise)"""
    __tablename__ = "look_views"
    __table_args__ = (
        UniqueConstraint("look_id", "user_id", name="uq_look_view"),
    )

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look", back_populates="views")


class SavedLook(Base):
    """Look sauvegarde par un utilisateur (bookmark)"""
    __tablename__ = "saved_looks"
    __table_args__ = (
        UniqueConstraint("look_id", "user_id", name="uq_saved_look"),
    )

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look")
    user = relationship("User")
