import sqlite3
import json

def migrate():
    conn = sqlite3.connect("careercompass.db")
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(students)")
    columns = [r[1] for r in cur.fetchall()]

    new_columns = [
        ("profile_photo", "TEXT DEFAULT ''"),
        ("school_name", "TEXT DEFAULT ''"),
        ("school_passing_year", "INTEGER DEFAULT 2020"),
        ("school_percentage", "REAL DEFAULT 90.0"),
        ("intermediate_college_name", "TEXT DEFAULT ''"),
        ("intermediate_passing_year", "INTEGER DEFAULT 2022"),
        ("intermediate_percentage", "REAL DEFAULT 88.0"),
        ("degree_institute_name", "TEXT DEFAULT ''"),
        ("degree_passing_year", "INTEGER DEFAULT 2026"),
        ("degree_education_status", "TEXT DEFAULT 'Pursuing'"),
        ("degree_percentage", "REAL DEFAULT NULL"),
        ("certificates_data", "TEXT DEFAULT '[]'")
    ]

    for col_name, col_def in new_columns:
        if col_name not in columns:
            print(f"Adding column '{col_name}' to students table...")
            cur.execute(f"ALTER TABLE students ADD COLUMN {col_name} {col_def}")
        else:
            print(f"Column '{col_name}' already exists.")

    # Populate sensible defaults for existing students where school/college name is empty
    sample_education = [
        ("CS2024001", "Delhi Public School, Bangalore", 2020, 92.4, "National Junior College, Bangalore", 2022, 90.8, "RV College of Engineering", 2026, "Pursuing", 8.85),
        ("CS2024002", "St. Xavier's High School, Ahmedabad", 2019, 94.0, "Nirma Junior College", 2021, 91.5, "Institute of Technology, Nirma University", 2025, "Pursuing", 9.12),
        ("CS2024003", "Bhavan's Vidya Mandir, Mumbai", 2020, 88.5, "KC Junior College, Churchgate", 2022, 85.0, "Veermata Jijabai Technological Institute (VJTI)", 2026, "Pursuing", 7.80),
        ("CS2024004", "Kendriya Vidyalaya, Pune", 2019, 91.2, "Fergusson Junior College", 2021, 89.4, "College of Engineering Pune (COEP)", 2025, "Pursuing", 8.45),
        ("CS2024005", "National Public School, Hyderabad", 2019, 95.0, "Narayana Junior College", 2021, 93.0, "CBIT Hyderabad", 2025, "Pursuing", 8.90)
    ]

    for s_id, s_name, s_yr, s_pct, i_name, i_yr, i_pct, d_name, d_yr, d_status, d_pct in sample_education:
        cur.execute("""
            UPDATE students
            SET school_name = COALESCE(NULLIF(school_name, ''), ?),
                school_passing_year = COALESCE(school_passing_year, ?),
                school_percentage = COALESCE(school_percentage, ?),
                intermediate_college_name = COALESCE(NULLIF(intermediate_college_name, ''), ?),
                intermediate_passing_year = COALESCE(intermediate_passing_year, ?),
                intermediate_percentage = COALESCE(intermediate_percentage, ?),
                degree_institute_name = COALESCE(NULLIF(degree_institute_name, ''), ?),
                degree_passing_year = COALESCE(degree_passing_year, ?),
                degree_education_status = COALESCE(degree_education_status, ?),
                degree_percentage = COALESCE(degree_percentage, ?)
            WHERE student_id = ?
        """, (s_name, s_yr, s_pct, i_name, i_yr, i_pct, d_name, d_yr, d_status, d_pct, s_id))

    conn.commit()
    conn.close()
    print("Migration v2 complete!")

if __name__ == "__main__":
    migrate()
