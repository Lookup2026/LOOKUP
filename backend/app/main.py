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

# Creer les tables (checkfirst=True est le defaut, ignore les tables existantes)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logging.getLogger(__name__).warning(f"create_all warning (tables may already exist): {e}")

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

@app.get("/migrate")
async def run_migration():
    """Lancer la migration de la base de donnees (colonnes/tables/contraintes manquantes)"""
    from sqlalchemy import text, inspect
    results = []
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    with engine.begin() as conn:
        # Colonnes manquantes sur users
        user_cols = [c["name"] for c in inspector.get_columns("users")] if "users" in existing_tables else []
        for col, sql in [
            ("is_private", "ALTER TABLE users ADD COLUMN is_private BOOLEAN DEFAULT FALSE"),
            ("referral_code", "ALTER TABLE users ADD COLUMN referral_code VARCHAR UNIQUE"),
            ("referred_by_id", "ALTER TABLE users ADD COLUMN referred_by_id INTEGER REFERENCES users(id)"),
            ("referral_count", "ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0"),
        ]:
            if col not in user_cols:
                try:
                    conn.execute(text(sql))
                    results.append(f"Added column {col}")
                except Exception as e:
                    results.append(f"Column {col}: {e}")

        # Creer tables manquantes
        Base.metadata.create_all(bind=engine)
        results.append("create_all done")

        # Contraintes uniques
        for name, table, columns in [
            ("uq_look_like", "look_likes", "look_id, user_id"),
            ("uq_look_view", "look_views", "look_id, user_id"),
            ("uq_saved_look", "saved_looks", "look_id, user_id"),
            ("uq_follow", "follows", "follower_id, followed_id"),
            ("uq_block", "blocked_users", "blocker_id, blocked_id"),
            ("uq_crossing_like", "crossing_likes", "crossing_id, user_id"),
            ("uq_saved_crossing", "saved_crossings", "crossing_id, user_id"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD CONSTRAINT {name} UNIQUE ({columns})"))
                results.append(f"Added {name}")
            except Exception as e:
                results.append(f"{name}: already exists or {e}")

        # Indexes
        for name, table, columns in [
            ("ix_looks_user_date", "looks", "user_id, look_date"),
            ("ix_looks_created_at", "looks", "created_at"),
            ("ix_crossings_users", "crossings", "user1_id, user2_id"),
            ("ix_crossings_crossed_at", "crossings", "crossed_at"),
        ]:
            try:
                conn.execute(text(f"CREATE INDEX IF NOT EXISTS {name} ON {table} ({columns})"))
                results.append(f"Index {name} OK")
            except Exception as e:
                results.append(f"Index {name}: {e}")

    return {"migration": results}

@app.get("/cleanup-crossings")
async def cleanup_crossings():
    """Nettoyer les croisements qui pointent vers des looks hors-jour"""
    from sqlalchemy import text
    with engine.begin() as conn:
        # Mettre a NULL TOUS les look_id (reset complet)
        # Les fallbacks reconstruiront avec le bon filtre jour
        result1 = conn.execute(text("""
            UPDATE crossings SET user1_look_id = NULL
            WHERE user1_look_id IS NOT NULL
        """))
        result2 = conn.execute(text("""
            UPDATE crossings SET user2_look_id = NULL
            WHERE user2_look_id IS NOT NULL
        """))
    return {
        "cleaned_user1_looks": result1.rowcount,
        "cleaned_user2_looks": result2.rowcount
    }

@app.get("/debug-crossings")
async def debug_crossings():
    """Debug: voir les croisements recents, pings et looks"""
    from sqlalchemy import text
    from datetime import datetime, timedelta
    since_24h = datetime.utcnow() - timedelta(hours=24)
    with engine.connect() as conn:
        crossings = conn.execute(text("""
            SELECT c.id, c.crossed_at, c.user1_id, c.user2_id,
                   c.user1_look_id, c.user2_look_id,
                   l1.created_at as look1_created, l1.title as look1_title,
                   l2.created_at as look2_created, l2.title as look2_title
            FROM crossings c
            LEFT JOIN looks l1 ON l1.id = c.user1_look_id
            LEFT JOIN looks l2 ON l2.id = c.user2_look_id
            ORDER BY c.crossed_at DESC
            LIMIT 20
        """)).fetchall()

        looks = conn.execute(text("""
            SELECT id, user_id, title, created_at
            FROM looks
            ORDER BY created_at DESC
            LIMIT 10
        """)).fetchall()

        pings = conn.execute(text("""
            SELECT id, user_id, zone_id, latitude, longitude, accuracy, timestamp
            FROM location_pings
            ORDER BY timestamp DESC
            LIMIT 30
        """)).fetchall()

    return {
        "now_utc": datetime.utcnow().isoformat(),
        "since_24h": since_24h.isoformat(),
        "recent_pings": [
            {"id": r[0], "user_id": r[1], "zone_id": r[2], "lat": float(r[3]) if r[3] else None, "lon": float(r[4]) if r[4] else None, "accuracy": float(r[5]) if r[5] else None, "timestamp": str(r[6])}
            for r in pings
        ],
        "crossings": [
            {
                "id": r[0], "crossed_at": str(r[1]),
                "user1_id": r[2], "user2_id": r[3],
                "user1_look_id": r[4], "user2_look_id": r[5],
                "look1_created": str(r[6]), "look1_title": r[7],
                "look2_created": str(r[8]), "look2_title": r[9],
            } for r in crossings
        ],
        "recent_looks": [
            {"id": r[0], "user_id": r[1], "title": r[2], "created_at": str(r[3])}
            for r in looks
        ]
    }
