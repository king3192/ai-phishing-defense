"""
Database migration & table initialization script for PhishGuard AI.
Usage:
  python migrate_db.py [DATABASE_URL]
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
import app.models
from app.models.user import User

def migrate_and_seed(db_url: str = None):
    print("=======================================================")
    print("  PhishGuard AI — Database Migration & Table Seeding")
    print("=======================================================")
    
    if db_url:
        os.environ["DATABASE_URL"] = db_url
        print(f"Targeting Database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    
    # 1. Create all schema tables
    print("[1/3] Creating database schema tables...")
    Base.metadata.create_all(bind=engine)
    print("      ✓ Tables created: users, scans, action_plan_progress, notifications, security_tips, reports")

    # 2. Seed Admin user
    print("[2/3] Seeding platform administrator account...")
    db = SessionLocal()
    try:
        admin_email = settings.ADMIN_EMAIL.lower()
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Platform Admin",
                email=admin_email,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                security_score=100
            )
            db.add(admin)
            db.commit()
            print(f"      ✓ Admin created: {admin_email} (Password: {settings.ADMIN_PASSWORD})")
        else:
            print(f"      ✓ Admin already exists: {admin_email}")
    finally:
        db.close()

    # 3. Verify connection with simple query
    print("[3/3] Verifying database connectivity...")
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        print(f"      ✓ Verified: Successfully queried database (total users: {result})")

    print("\n>>> Database migration and seed completed successfully! <<<\n")

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else None
    migrate_and_seed(url_arg)
