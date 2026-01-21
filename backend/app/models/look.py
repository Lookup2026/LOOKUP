from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base

class Look(Base):
    __tablename__ = "looks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=False)
    look_date = Column(Date, default=date.today, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Compteurs (anonymes)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)

    # Relations
    user = relationship("User", back_populates="looks")
    items = relationship("LookItem", back_populates="look", cascade="all, delete-orphan")
    likes = relationship("LookLike", back_populates="look", cascade="all, delete-orphan")
    views = relationship("LookView", back_populates="look", cascade="all, delete-orphan")


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

    # Relations
    look = relationship("Look", back_populates="items")


class LookLike(Base):
    """Like anonyme sur un look (l'owner ne sait pas qui a like)"""
    __tablename__ = "look_likes"

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Pour eviter double like
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look", back_populates="likes")


class LookView(Base):
    """Vue anonyme sur un look (quand quelqu'un consulte un look croise)"""
    __tablename__ = "look_views"

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Pour eviter double comptage
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look", back_populates="views")


class SavedLook(Base):
    """Look sauvegarde par un utilisateur (bookmark)"""
    __tablename__ = "saved_looks"

    id = Column(Integer, primary_key=True, index=True)
    look_id = Column(Integer, ForeignKey("looks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    look = relationship("Look")
    user = relationship("User")
