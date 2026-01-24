from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.endpoints import auth, looks, crossings, users, photos

# Creer les tables
Base.metadata.create_all(bind=engine)

# Creer l'app
app = FastAPI(
    title=settings.APP_NAME,
    description="API pour LOOKUP - Decouvrez les looks des personnes que vous croisez",
    version="1.0.0"
)

# CORS pour le frontend
# En prod: definir CORS_ORIGINS avec l'URL Vercel
cors_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
