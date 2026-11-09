import sqlite3
from database import engine, Base
import models

def run_migration():
    print("Creating all tables defined in models...")
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        tables = [row[0] for row in conn.exec_driver_sql("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")]
        print("Current tables in database:")
        for t in tables:
            print(f" - {t}")

if __name__ == "__main__":
    run_migration()
