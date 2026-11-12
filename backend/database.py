from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL


def get_database_url():
    url = DATABASE_URL
    # Fix Heroku-style postgres:// URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # Explicitly use psycopg2 driver for PostgreSQL
    if url.startswith("postgresql://") and "+psycopg2" not in url and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


RESOLVED_URL = get_database_url()
IS_POSTGRES = RESOLVED_URL.startswith("postgresql")

if IS_POSTGRES:
    # For Neon / cloud PostgreSQL:
    # - pool_pre_ping: test connection before using it (fixes stale SSL connections)
    # - pool_recycle: recycle connections every 5 minutes to prevent timeout
    # - pool_size / max_overflow: limit concurrent connections for free tier
    engine = create_engine(
        RESOLVED_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=2,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }
    )
else:
    # SQLite for local development
    engine = create_engine(
        RESOLVED_URL,
        connect_args={"check_same_thread": False}
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
