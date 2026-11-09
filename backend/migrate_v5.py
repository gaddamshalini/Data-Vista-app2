from database import engine, Base
import models

def migrate():
    print("Creating all tables if not exist...")
    Base.metadata.create_all(bind=engine)
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
