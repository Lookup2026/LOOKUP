from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.endpoints import auth, looks, crossings, users, photos

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Creer les tables
Base.metadata.create_all(bind=engine)

# Creer l'app
app = FastAPI(
    title=settings.APP_NAME,
    description="API pour LOOKUP - Decouvrez les looks des personnes que vous croisez",
    version="1.0.0"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS pour le frontend
if not settings.CORS_ORIGINS:
    import warnings
    warnings.warn("CORS_ORIGINS not set - using localhost defaults (dev only)")
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Servir les fichiers uploades
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(looks.router, prefix="/api")
app.include_router(crossings.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(photos.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "message": "Bienvenue sur LOOKUP API",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
