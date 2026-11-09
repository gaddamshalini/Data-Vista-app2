import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "careercompass.db"

def run_migration():
    if not DB_PATH.exists():
        print(f"Database at {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(students)")
    cols = [c[1] for c in cursor.fetchall()]
    print("Existing student columns:", cols)

    if "num_internships" not in cols:
        cursor.execute("ALTER TABLE students ADD COLUMN num_internships INTEGER DEFAULT 0")
        print("Added column: num_internships")

    if "experience_status" not in cols:
        cursor.execute("ALTER TABLE students ADD COLUMN experience_status VARCHAR(20) DEFAULT 'Fresher'")
        print("Added column: experience_status")

    if "experience_years" not in cols:
        cursor.execute("ALTER TABLE students ADD COLUMN experience_years FLOAT DEFAULT 0.0")
        print("Added column: experience_years")

    if "github_profile" not in cols:
        cursor.execute("ALTER TABLE students ADD COLUMN github_profile VARCHAR(255) DEFAULT ''")
        print("Added column: github_profile")

    # Update existing students
    cursor.execute("""
        UPDATE students 
        SET num_internships = (
            SELECT COUNT(*) FROM student_internships WHERE student_internships.student_id = students.id
        )
        WHERE num_internships IS NULL OR num_internships = 0
    """)

    cursor.execute("""
        UPDATE students
        SET num_internships = 1
        WHERE (num_internships IS NULL OR num_internships = 0)
          AND internship_experience_months > 0
    """)

    cursor.execute("UPDATE students SET experience_status = 'Fresher' WHERE experience_status IS NULL OR experience_status = ''")
    cursor.execute("UPDATE students SET experience_years = 0.0 WHERE experience_years IS NULL")
    
    # Add realistic github links for demo students
    cursor.execute("UPDATE students SET github_profile = 'https://github.com/aaravsharma' WHERE student_id = 'CS2024001' AND (github_profile IS NULL OR github_profile = '')")
    cursor.execute("UPDATE students SET github_profile = 'https://github.com/priyapatel' WHERE student_id = 'CS2024002' AND (github_profile IS NULL OR github_profile = '')")
    cursor.execute("UPDATE students SET github_profile = 'https://github.com/rohanverma' WHERE student_id = 'CS2024003' AND (github_profile IS NULL OR github_profile = '')")
    cursor.execute("UPDATE students SET github_profile = 'https://github.com/snehakulkarni' WHERE student_id = 'CS2024004' AND (github_profile IS NULL OR github_profile = '')")
    cursor.execute("UPDATE students SET github_profile = 'https://github.com/vikramadithya' WHERE student_id = 'CS2024005' AND (github_profile IS NULL OR github_profile = '')")

    # Ensure required skills are present: C, Java, Full Stack Development (FSD), GitHub
    required_skills = [
        ("C", "Programming", 82.0),
        ("Java", "Programming", 89.0),
        ("Full Stack Development (FSD)", "Web Development", 92.0),
        ("GitHub", "Tools", 94.0)
    ]
    for name, cat, demand in required_skills:
        cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (name,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("INSERT INTO skills (name, category, demand_index) VALUES (?, ?, ?)", (name, cat, demand))
            print(f"Inserted skill: {name}")
        else:
            cursor.execute("UPDATE skills SET name = ?, category = ?, demand_index = ? WHERE id = ?", (name, cat, demand, row[0]))
            print(f"Updated skill: {name}")

    conn.commit()
    conn.close()
    print("Database migration completed successfully.")

if __name__ == "__main__":
    run_migration()
