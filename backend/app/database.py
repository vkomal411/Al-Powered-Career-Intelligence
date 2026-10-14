from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

is_postgres = (
    settings.database_url.startswith("postgresql") or 
    settings.database_url.startswith("postgres")
)

engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

if is_postgres:
    # Conservative connection pool sizing for PostgreSQL provider limits:
    # pool_size=5 + max_overflow=5 = 10 max connections (reserves 50%+ headroom on 20-limit tiers)
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 5,
        "pool_timeout": 30,
    })

engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
