from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.endpoints import auth, looks, crossings, users, photos, notifications


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# Admin key for debug endpoints
ADMIN_KEY = os.getenv("ADMIN_KEY", "dev-admin-key-change-in-production")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Creer les tables (checkfirst=True est le defaut, ignore les tables existantes)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logging.getLogger(__name__).warning(f"create_all warning (tables may already exist): {e}")

# Migration: ajouter photo_url aux look_items si manquante
try:
    from sqlalchemy import text, inspect
    _inspector = inspect(engine)
    if "look_items" in _inspector.get_table_names():
        _cols = [c["name"] for c in _inspector.get_columns("look_items")]
        if "photo_url" not in _cols:
            with engine.begin() as _conn:
                _conn.execute(text("ALTER TABLE look_items ADD COLUMN photo_url VARCHAR"))
except Exception:
    pass

# Creer l'app
app = FastAPI(
    title=settings.APP_NAME,
    description="API pour LOOKUP - Decouvrez les looks des personnes que vous croisez",
    version="1.0.0"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

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
app.include_router(notifications.router, prefix="/api")

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

def verify_admin_key(request: Request):
    """Vérifie la clé admin dans le header X-Admin-Key"""
    admin_key = request.headers.get("X-Admin-Key")
    if admin_key != ADMIN_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return True


@app.get("/migrate")
async def run_migration(request: Request, _: bool = Depends(verify_admin_key)):
    """Lancer la migration de la base de donnees (colonnes/tables/contraintes manquantes)"""
    from sqlalchemy import text, inspect
    results = []

    def run_sql(description, sql):
        """Execute une requete SQL dans sa propre transaction"""
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
            results.append(f"OK: {description}")
        except Exception as e:
            if "already exists" in str(e) or "duplicate" in str(e).lower():
                results.append(f"SKIP: {description} (already exists)")
            else:
                results.append(f"ERROR: {description}: {e}")

    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    # Colonnes manquantes sur look_items
    look_item_cols = [c["name"] for c in inspector.get_columns("look_items")] if "look_items" in existing_tables else []
    if "photo_url" not in look_item_cols and "look_items" in existing_tables:
        run_sql("look_items.photo_url", "ALTER TABLE look_items ADD COLUMN photo_url VARCHAR")

    # Colonnes manquantes sur users
    user_cols = [c["name"] for c in inspector.get_columns("users")] if "users" in existing_tables else []
    for col, sql in [
        ("is_private", "ALTER TABLE users ADD COLUMN is_private BOOLEAN DEFAULT FALSE"),
        ("referral_code", "ALTER TABLE users ADD COLUMN referral_code VARCHAR UNIQUE"),
        ("referred_by_id", "ALTER TABLE users ADD COLUMN referred_by_id INTEGER REFERENCES users(id)"),
        ("referral_count", "ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0"),
        ("bio", "ALTER TABLE users ADD COLUMN bio VARCHAR"),
        ("username_changed_at", "ALTER TABLE users ADD COLUMN username_changed_at TIMESTAMP"),
        ("avatar_url", "ALTER TABLE users ADD COLUMN avatar_url VARCHAR"),
        ("is_visible", "ALTER TABLE users ADD COLUMN is_visible BOOLEAN DEFAULT TRUE"),
        ("is_verified", "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"),
        ("updated_at", "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()"),
        ("apple_id", "ALTER TABLE users ADD COLUMN apple_id VARCHAR UNIQUE"),
    ]:
        if col not in user_cols:
            run_sql(f"users.{col}", sql)

    # Make hashed_password nullable (for Apple Sign In users)
    run_sql("users.hashed_password nullable", "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL")

    # Colonnes manquantes sur looks
    look_cols = [c["name"] for c in inspector.get_columns("looks")] if "looks" in existing_tables else []
    for col, sql in [
        ("latitude", "ALTER TABLE looks ADD COLUMN latitude FLOAT"),
        ("longitude", "ALTER TABLE looks ADD COLUMN longitude FLOAT"),
        ("city", "ALTER TABLE looks ADD COLUMN city VARCHAR"),
        ("country", "ALTER TABLE looks ADD COLUMN country VARCHAR"),
        ("likes_count", "ALTER TABLE looks ADD COLUMN likes_count INTEGER DEFAULT 0"),
        ("views_count", "ALTER TABLE looks ADD COLUMN views_count INTEGER DEFAULT 0"),
        ("look_date", "ALTER TABLE looks ADD COLUMN look_date DATE DEFAULT CURRENT_DATE"),
    ]:
        if col not in look_cols:
            run_sql(f"looks.{col}", sql)

    # Colonnes manquantes sur crossings
    crossing_cols = [c["name"] for c in inspector.get_columns("crossings")] if "crossings" in existing_tables else []
    for col, sql in [
        ("latitude", "ALTER TABLE crossings ADD COLUMN latitude FLOAT"),
        ("longitude", "ALTER TABLE crossings ADD COLUMN longitude FLOAT"),
        ("location_name", "ALTER TABLE crossings ADD COLUMN location_name VARCHAR"),
        ("user1_viewed", "ALTER TABLE crossings ADD COLUMN user1_viewed TIMESTAMP"),
        ("user2_viewed", "ALTER TABLE crossings ADD COLUMN user2_viewed TIMESTAMP"),
        ("likes_count", "ALTER TABLE crossings ADD COLUMN likes_count INTEGER DEFAULT 0"),
        ("views_count", "ALTER TABLE crossings ADD COLUMN views_count INTEGER DEFAULT 0"),
    ]:
        if col not in crossing_cols:
            run_sql(f"crossings.{col}", sql)

    # Colonnes manquantes sur follows
    follow_cols = [c["name"] for c in inspector.get_columns("follows")] if "follows" in existing_tables else []
    if "status" not in follow_cols and "follows" in existing_tables:
        run_sql("follows.status", "ALTER TABLE follows ADD COLUMN status VARCHAR DEFAULT 'accepted'")

    # Creer tables manquantes
    try:
        Base.metadata.create_all(bind=engine)
        results.append("OK: create_all done")
    except Exception as e:
        results.append(f"ERROR: create_all: {e}")

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
        run_sql(name, f"ALTER TABLE {table} ADD CONSTRAINT {name} UNIQUE ({columns})")

    # Indexes
    for name, table, columns in [
        ("ix_notifications_user_read_created", "notifications", "user_id, is_read, created_at"),
        ("ix_looks_user_date", "looks", "user_id, look_date"),
        ("ix_looks_created_at", "looks", "created_at"),
        ("ix_crossings_users", "crossings", "user1_id, user2_id"),
        ("ix_crossings_crossed_at", "crossings", "crossed_at"),
    ]:
        run_sql(f"Index {name}", f"CREATE INDEX IF NOT EXISTS {name} ON {table} ({columns})")

    return {"migration": results}

@app.get("/cleanup-crossings")
async def cleanup_crossings(request: Request, _: bool = Depends(verify_admin_key)):
    """Nettoyer les doublons de croisements et reset les look_ids"""
    from sqlalchemy import text
    with engine.begin() as conn:
        # Supprimer les doublons: garder seulement le plus recent par paire d'utilisateurs
        result_dedup = conn.execute(text("""
            DELETE FROM crossings WHERE id NOT IN (
                SELECT MAX(id) FROM crossings
                GROUP BY LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)
            )
        """))
        # Reset les look_ids
        result1 = conn.execute(text("""
            UPDATE crossings SET user1_look_id = NULL
            WHERE user1_look_id IS NOT NULL
        """))
        result2 = conn.execute(text("""
            UPDATE crossings SET user2_look_id = NULL
            WHERE user2_look_id IS NOT NULL
        """))
    return {
        "duplicates_removed": result_dedup.rowcount,
        "cleaned_user1_looks": result1.rowcount,
        "cleaned_user2_looks": result2.rowcount
    }

@app.get("/debug-crossings")
async def debug_crossings(request: Request, _: bool = Depends(verify_admin_key)):
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
