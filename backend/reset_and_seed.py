"""
Reset and re-seed the database from scratch.
Run this AFTER stopping the backend (python app.py).
Usage: python reset_and_seed.py
"""
import os
import sys
import traceback

# Ensure we run from the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "careercompass.db")

print("=" * 55)
print("  DATA VISTA — Database Reset & Seed")
print("=" * 55)

# Step 1: Delete the SQLite file directly (fastest wipe)
print("\n[1/3] Deleting old database file...")
if os.path.exists(DB_FILE):
    try:
        os.remove(DB_FILE)
        print("      Deleted:", DB_FILE)
    except PermissionError:
        print("\n  ERROR: Cannot delete the database file.")
        print("  The backend (python app.py) is still running.")
        print("  Please stop it with Ctrl+C in its terminal, then run this script again.\n")
        sys.exit(1)
else:
    print("      No existing database file found (fresh start).")

# Step 2: Re-create tables
print("[2/3] Creating fresh tables...")
from database import engine, Base, SessionLocal
import models  # noqa: F401 — registers all ORM models
Base.metadata.create_all(bind=engine)
print("      Done.")

# Step 3: Seed
print("[3/3] Running seed scripts...\n")

# Main data (students, skills, careers, placement records, jobs, internships)
try:
    import seed_data
    seed_data.seed(force=True)
    print("[+] Main seed complete.")
except Exception:
    print("[!] seed_data FAILED:")
    traceback.print_exc()
    sys.exit(1)

# Interview questions (Mock Interview practice)
try:
    import seed_interview_questions
    seed_interview_questions.seed_interview_questions()
    print("[+] Interview questions seeded.")
except Exception as e:
    print(f"[!] seed_interview_questions failed: {e}")
    traceback.print_exc()

# Interview & assessment questions + demo user accounts
try:
    import seed_questions
    seed_questions.seed_question_banks_and_users()
    print("[+] Questions & user accounts seeded.")
except Exception as e:
    print(f"[!] seed_questions failed: {e}")
    traceback.print_exc()

# Basic questions (if exists)
try:
    import seed_basic_questions
    fn = (getattr(seed_basic_questions, "seed_basic_questions", None)
          or getattr(seed_basic_questions, "seed", None))
    if fn:
        fn()
        print("[+] Basic questions seeded.")
except Exception as e:
    print(f"[!] seed_basic_questions skipped: {e}")

# Free internship opportunities
try:
    import seed_free_internships
    seed_free_internships.seed_free_internships()
    print("[+] Free internships seeded.")
except Exception as e:
    print(f"[!] seed_free_internships failed: {e}")
    traceback.print_exc()

# Verification
from models import (Skill, Career, Student, PlacementRecord, Job,
                    Internship, MockInterviewQuestion, FreeInternshipOpportunity, UserAccount)
db = SessionLocal()
print("\n" + "=" * 55)
print("  Verification — Record Counts")
print("=" * 55)
print(f"  Skills                : {db.query(Skill).count()}")
print(f"  Careers               : {db.query(Career).count()}")
print(f"  Students              : {db.query(Student).count()}")
print(f"  Placement Records     : {db.query(PlacementRecord).count()}")
print(f"  Jobs                  : {db.query(Job).count()}")
print(f"  Internships           : {db.query(Internship).count()}")
print(f"  Interview Questions   : {db.query(MockInterviewQuestion).count()}")
print(f"  Free Internships      : {db.query(FreeInternshipOpportunity).count()}")
print(f"  User Accounts         : {db.query(UserAccount).count()}")
db.close()

print("\n  SUCCESS! Now start the backend with:")
print("  python app.py")
print("=" * 55)
