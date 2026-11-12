from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL

# Force psycopg2 driver for PostgreSQL connections (avoids psycopg v3 requirement)
def get_database_url():
    url = DATABASE_URL
    if url.startswith("postgres://"):
        # Heroku-style URL — SQLAlchemy requires postgresql://
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://") and "+psycopg2" not in url and "+psycopg" not in url:
        # Explicitly use psycopg2 driver
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url

RESOLVED_URL = get_database_url()

connect_args = {}
if RESOLVED_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(RESOLVED_URL, connect_args=connect_args)

# Enable foreign keys for SQLite
if RESOLVED_URL.startswith("sqlite"):
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
