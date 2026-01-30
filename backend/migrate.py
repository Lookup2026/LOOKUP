"""
Script de migration manuelle pour ajouter les colonnes/tables/contraintes manquantes.
A lancer une seule fois sur la base de production.
Usage: python migrate.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text, inspect
from app.core.database import engine, Base
from app.models import *  # Import all models

def migrate():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    with engine.begin() as conn:
        # 1. Ajouter colonnes manquantes sur users
        user_columns = [c["name"] for c in inspector.get_columns("users")] if "users" in existing_tables else []

        if "is_private" not in user_columns:
            print("Adding is_private to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN is_private BOOLEAN DEFAULT FALSE"))

        if "referral_code" not in user_columns:
            print("Adding referral_code to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN referral_code VARCHAR UNIQUE"))

        if "referred_by_id" not in user_columns:
            print("Adding referred_by_id to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN referred_by_id INTEGER REFERENCES users(id)"))

        if "referral_count" not in user_columns:
            print("Adding referral_count to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0"))

        # 2. Creer les tables manquantes
        tables_to_create = [
            "crossing_likes", "saved_crossings", "follows",
            "blocked_users", "look_likes", "look_views", "saved_looks"
        ]
        for table_name in tables_to_create:
            if table_name not in existing_tables:
                print(f"Creating table {table_name}...")

        # create_all ne touche pas les tables existantes
        Base.metadata.create_all(bind=engine)

        # 3. Ajouter les contraintes uniques (ignore si existe deja)
        constraints = [
            ("uq_look_like", "look_likes", "look_id, user_id"),
            ("uq_look_view", "look_views", "look_id, user_id"),
            ("uq_saved_look", "saved_looks", "look_id, user_id"),
            ("uq_follow", "follows", "follower_id, followed_id"),
            ("uq_block", "blocked_users", "blocker_id, blocked_id"),
            ("uq_crossing_like", "crossing_likes", "crossing_id, user_id"),
            ("uq_saved_crossing", "saved_crossings", "crossing_id, user_id"),
        ]
        for name, table, columns in constraints:
            if table in existing_tables or table in [t for t in inspector.get_table_names()]:
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD CONSTRAINT {name} UNIQUE ({columns})"))
                    print(f"Added constraint {name}")
                except Exception as e:
                    if "already exists" in str(e) or "duplicate" in str(e).lower():
                        print(f"Constraint {name} already exists, skipping")
                    else:
                        print(f"Warning adding {name}: {e}")

        # 4. Ajouter les indexes manquants
        indexes = [
            ("ix_looks_user_date", "looks", "user_id, look_date"),
            ("ix_looks_created_at", "looks", "created_at"),
            ("ix_crossings_users", "crossings", "user1_id, user2_id"),
            ("ix_crossings_crossed_at", "crossings", "crossed_at"),
        ]
        for name, table, columns in indexes:
            try:
                conn.execute(text(f"CREATE INDEX IF NOT EXISTS {name} ON {table} ({columns})"))
                print(f"Index {name} OK")
            except Exception as e:
                print(f"Warning index {name}: {e}")

    print("Migration done!")

if __name__ == "__main__":
    migrate()
