import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL.strip()

# Normalize mysql:// to mysql+pymysql://
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if db_url.startswith("sqlite:///./") or db_url == "sqlite:///phishing_defense.db":
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        rel_path = db_url.replace("sqlite:///./", "").replace("sqlite:///", "")
        abs_path = os.path.join(backend_dir, rel_path).replace("\\", "/")
        db_url = f"sqlite:///{abs_path}"

# MySQL pool pre-ping to handle reconnects on sleeping/idle connections
engine_kwargs = {"connect_args": connect_args}
if db_url.startswith("mysql"):
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(
    db_url, **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
