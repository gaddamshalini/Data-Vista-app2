import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "careercompass.db")

def migrate():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(students)")
    existing_cols = [r[1] for r in cursor.fetchall()]

    new_cols = [
        ("personal_email", "VARCHAR(120)"),
        ("college_email", "VARCHAR(120)")
    ]

    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            print(f"Adding column '{col_name}' ({col_type}) to 'students' table...")
            cursor.execute(f"ALTER TABLE students ADD COLUMN {col_name} {col_type};")
        else:
            print(f"Column '{col_name}' already exists.")

    # Populate existing rows with default distinct emails if empty
    cursor.execute("SELECT id, name, email, personal_email, college_email FROM students")
    rows = cursor.fetchall()
    for row in rows:
        s_id, name, email, p_email, c_email = row
        clean_name = name.lower().replace(" ", ".")
        new_personal = p_email or f"{clean_name}@gmail.com"
        new_college = c_email or email or f"{clean_name}@college.edu"
        cursor.execute(
            "UPDATE students SET personal_email = ?, college_email = ? WHERE id = ?",
            (new_personal, new_college, s_id)
        )

    conn.commit()
    conn.close()
    print("Database migration v3 complete.")

if __name__ == "__main__":
    migrate()
