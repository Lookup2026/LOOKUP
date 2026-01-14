from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "LOOKUP"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./lookup.db"  # SQLite pour dev, PostgreSQL pour prod

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours

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
