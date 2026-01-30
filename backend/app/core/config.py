import secrets
import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "LOOKUP"
    DEBUG: bool = False  # False par defaut pour la securite

    # Database
    DATABASE_URL: str = "sqlite:///./lookup.db"  # SQLite pour dev, PostgreSQL pour prod

    # JWT - OBLIGATOIRE en production
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours

    @property
    def is_production(self) -> bool:
        return "postgresql" in self.DATABASE_URL or "postgres" in self.DATABASE_URL

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.SECRET_KEY:
            if self.is_production:
                raise ValueError(
                    "CRITICAL: SECRET_KEY must be set in production! "
                    "Add SECRET_KEY to your environment variables."
                )
            else:
                # Dev only: generate temporary key with warning
                import warnings
                warnings.warn(
                    "SECRET_KEY not set - using temporary key (dev only). "
                    "Set SECRET_KEY in .env for production.",
                    UserWarning
                )
                object.__setattr__(self, 'SECRET_KEY', secrets.token_urlsafe(32))

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    # Supabase Storage
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "looks"

    # Geolocation
    CROSSING_RADIUS_METERS: float = 50.0  # Rayon pour detecter un croisement
    CROSSING_TIME_WINDOW_MINUTES: int = 10  # Fenetre de temps pour un croisement

    # CORS - Frontend URLs autorisees
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
