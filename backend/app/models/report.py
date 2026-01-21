from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Report(Base):
    """Table pour stocker les signalements"""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Qui signale
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Utilisateur signale
    reported_look_id = Column(Integer, ForeignKey("looks.id"), nullable=True)  # Look signale
    reason = Column(String, nullable=False)  # Raison du signalement
    details = Column(Text, nullable=True)  # Details supplementaires
    status = Column(String, default="pending")  # pending, reviewed, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    # Relations
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    reported_look = relationship("Look", foreign_keys=[reported_look_id])
