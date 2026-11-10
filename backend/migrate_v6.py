"""
Migration v6 — DATA VISTA
1. Create account_activities table (activity history)
2. Add preferred_career_custom column to students table (Other career goal)
Run: python migrate_v6.py
"""
import sys
from database import engine
from sqlalchemy import text, inspect

def run():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    conn = engine.connect()

    # ── 1. Create account_activities table ──────────────────────────────────
    if "account_activities" not in existing_tables:
        print("[+] Creating account_activities table...")
        conn.execute(text("""
            CREATE TABLE account_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(50) NOT NULL,
                activity_type VARCHAR(50) NOT NULL,
                description VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("CREATE INDEX ix_account_activities_student_id ON account_activities (student_id)"))
        conn.execute(text("CREATE INDEX ix_account_activities_activity_type ON account_activities (activity_type)"))
        conn.commit()
        print("    Done.")
    else:
        print("[~] account_activities table already exists.")

    # ── 2. Add preferred_career_custom column to students ───────────────────
    existing_cols = [c["name"] for c in inspector.get_columns("students")]
    if "preferred_career_custom" not in existing_cols:
        print("[+] Adding preferred_career_custom column to students...")
        conn.execute(text("ALTER TABLE students ADD COLUMN preferred_career_custom VARCHAR(200)"))
        conn.commit()
        print("    Done.")
    else:
        print("[~] preferred_career_custom column already exists.")

    conn.close()
    print("\nMigration v6 complete.")

if __name__ == "__main__":
    run()
