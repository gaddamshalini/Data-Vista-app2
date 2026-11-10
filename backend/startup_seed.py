"""
startup_seed.py — runs automatically during Render build.
Safe to run multiple times: each script checks before inserting duplicates.
"""
import sys
import traceback

print("\n========================================")
print("  DATA VISTA — Startup Seed")
print("========================================\n")

# 0. Run database migrations first
try:
    import migrate_v6
    migrate_v6.run()
    print("[OK] Migration v6 complete.\n")
except Exception:
    print("[!] migrate_v6 warning (may already be applied):")
    traceback.print_exc()

# 1. Main data (skills, careers, students, placement records, jobs, internships)
try:
    from seed_data import seed
    seed()
    print("[OK] Main seed complete.\n")
except Exception:
    print("[ERROR] seed_data failed:")
    traceback.print_exc()
    sys.exit(1)

# 2. Assessment & interview question banks + user accounts
try:
    from seed_questions import seed_question_banks_and_users
    seed_question_banks_and_users()
    print("[OK] Question banks seeded.\n")
except Exception:
    print("[ERROR] seed_questions failed:")
    traceback.print_exc()

# 3. Mock interview questions
try:
    from seed_interview_questions import seed_interview_questions
    seed_interview_questions()
    print("[OK] Interview questions seeded.\n")
except Exception:
    print("[ERROR] seed_interview_questions failed:")
    traceback.print_exc()

# 4. Free internship opportunities
try:
    from seed_free_internships import seed_free_internships
    seed_free_internships()
    print("[OK] Free internships seeded.\n")
except Exception:
    print("[ERROR] seed_free_internships failed:")
    traceback.print_exc()

# 5. Print final counts
try:
    from database import SessionLocal
    from models import (Skill, Career, Student, PlacementRecord,
                        MockInterviewQuestion, FreeInternshipOpportunity, UserAccount)
    db = SessionLocal()
    print("========================================")
    print("  Final Record Counts")
    print("========================================")
    print(f"  Skills            : {db.query(Skill).count()}")
    print(f"  Careers           : {db.query(Career).count()}")
    print(f"  Students          : {db.query(Student).count()}")
    print(f"  Placement Records : {db.query(PlacementRecord).count()}")
    print(f"  Interview Questions: {db.query(MockInterviewQuestion).count()}")
    print(f"  Free Internships  : {db.query(FreeInternshipOpportunity).count()}")
    print(f"  User Accounts     : {db.query(UserAccount).count()}")
    print("========================================\n")
    db.close()
except Exception:
    pass

print("Seed complete. Starting server...\n")
