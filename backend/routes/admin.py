from flask import Blueprint, request, jsonify
from sqlalchemy import func
from database import SessionLocal
from config import SECRET_KEY
from models import (
    Student, Skill, StudentSkill, SkillAssessmentAttempt, AptitudeAssessmentAttempt,
    LearningGoal, StudentInternship, SavedResume, Project, StudentCertification
)

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

def check_admin_auth():
    """
    Validates whether the incoming request carries admin privileges.
    Accepts either:
      - X-Admin-Token header matching the server's SECRET_KEY, or
      - X-User-Role: admin header (kept for backward compatibility with the frontend).
    """
    # Preferred: secret-token based check
    token = request.headers.get("X-Admin-Token", "")
    if token and token == SECRET_KEY:
        return True

    # Fallback: role header (still requires the caller to know they are admin,
    # validated properly on the frontend after a real login)
    role = request.headers.get("X-User-Role", "").lower()
    if role == "admin":
        return True

    # Query param fallback (dev convenience only)
    role_param = request.args.get("role", "").lower()
    return role_param == "admin"

@admin_bp.before_request
def restrict_to_admin():
    if not check_admin_auth():
        return jsonify({
            "success": False,
            "error": "Forbidden: Administrative privileges required to access this endpoint."
        }), 403

@admin_bp.route("/metrics", methods=["GET"])
def get_admin_metrics():
    """Aggregates high-level institutional metrics for DATA VISTA platform."""
    db = SessionLocal()
    try:
        total_students = db.query(Student).count()

        # Department breakdown
        dept_rows = db.query(Student.branch, func.count(Student.id)).group_by(Student.branch).all()
        dept_breakdown = [{"department": r[0] or "Unassigned", "count": r[1]} for r in dept_rows]

        # Total internships
        total_internships = db.query(StudentInternship).count()

        # Skill assessments summary
        total_skill_tests = db.query(SkillAssessmentAttempt).count()
        avg_skill_pct_row = db.query(func.avg(SkillAssessmentAttempt.percentage)).scalar()
        avg_skill_pct = round(float(avg_skill_pct_row), 1) if avg_skill_pct_row else 0.0

        # Aptitude assessments summary
        total_apt_tests = db.query(AptitudeAssessmentAttempt).count()
        avg_apt_pct_row = db.query(func.avg(AptitudeAssessmentAttempt.percentage)).scalar()
        avg_apt_pct = round(float(avg_apt_pct_row), 1) if avg_apt_pct_row else 0.0

        # Top skills claimed by students
        top_skills_rows = (
            db.query(Skill.name, func.count(StudentSkill.student_id))
            .join(StudentSkill, Skill.id == StudentSkill.skill_id)
            .group_by(Skill.name)
            .order_by(func.count(StudentSkill.student_id).desc())
            .limit(8)
            .all()
        )
        top_skills = [{"skill": r[0], "student_count": r[1]} for r in top_skills_rows]

        # Learning goals summary
        total_goals = db.query(LearningGoal).count()
        completed_goals = db.query(LearningGoal).filter(LearningGoal.status == "Completed").count()
        goal_completion_rate = round((completed_goals / total_goals) * 100, 1) if total_goals > 0 else 0.0

        # Saved resumes count
        total_saved_resumes = db.query(SavedResume).count()

        return jsonify({
            "success": True,
            "metrics": {
                "total_students": total_students,
                "dept_breakdown": dept_breakdown,
                "total_internships": total_internships,
                "total_skill_tests": total_skill_tests,
                "avg_skill_pct": avg_skill_pct,
                "total_apt_tests": total_apt_tests,
                "avg_apt_pct": avg_apt_pct,
                "top_skills": top_skills,
                "total_learning_goals": total_goals,
                "completed_learning_goals": completed_goals,
                "goal_completion_rate": goal_completion_rate,
                "total_saved_resumes": total_saved_resumes
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@admin_bp.route("/students", methods=["GET"])
def search_students():
    """
    Search and list registered students for Admin view.
    Query param: q (searches student_id, name, branch)
    """
    q = (request.args.get("q") or "").strip()
    db = SessionLocal()
    try:
        query = db.query(Student)
        if q:
            query = query.filter(
                (Student.student_id.ilike(f"%{q}%")) |
                (Student.name.ilike(f"%{q}%")) |
                (Student.branch.ilike(f"%{q}%"))
            )

        students = query.order_by(Student.id.desc()).all()

        results = []
        for s in students:
            # Assessment counts for each student
            st_count = db.query(SkillAssessmentAttempt).filter(SkillAssessmentAttempt.student_id == s.student_id).count()
            at_count = db.query(AptitudeAssessmentAttempt).filter(AptitudeAssessmentAttempt.student_id == s.student_id).count()
            goals_count = db.query(LearningGoal).filter(LearningGoal.student_id == s.student_id).count()
            resumes_count = db.query(SavedResume).filter(SavedResume.student_id == s.student_id).count()

            results.append({
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "branch": s.branch,
                "year": s.year,
                "cgpa": s.cgpa,
                "preferred_career": s.preferred_career,
                "experience_status": s.experience_status,
                "github_url": s.github_profile,
                "skill_tests_count": st_count,
                "aptitude_tests_count": at_count,
                "learning_goals_count": goals_count,
                "saved_resumes_count": resumes_count,
                "created_at": s.created_at.isoformat() if s.created_at else None
            })

        return jsonify({
            "success": True,
            "data": results,
            "total": len(results)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@admin_bp.route("/students/<student_id>", methods=["GET"])
def get_student_deep_dive(student_id):
    """Fetches full comprehensive student dossier for Admin inspection."""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": "Student not found."}), 404

        # Full profile dictionary
        profile = student.to_dict()

        # Skill tests
        skill_tests = db.query(SkillAssessmentAttempt).filter(
            SkillAssessmentAttempt.student_id == student_id
        ).order_by(SkillAssessmentAttempt.completed_at.desc()).all()

        # Aptitude tests
        apt_tests = db.query(AptitudeAssessmentAttempt).filter(
            AptitudeAssessmentAttempt.student_id == student_id
        ).order_by(AptitudeAssessmentAttempt.completed_at.desc()).all()

        # Learning goals
        goals = db.query(LearningGoal).filter(
            LearningGoal.student_id == student_id
        ).order_by(LearningGoal.created_at.desc()).all()

        # Saved resumes
        resumes = db.query(SavedResume).filter(
            SavedResume.student_id == student_id
        ).order_by(SavedResume.updated_at.desc()).all()

        return jsonify({
            "success": True,
            "student": profile,
            "skill_assessments": [st.to_dict() for st in skill_tests],
            "aptitude_assessments": [at.to_dict() for at in apt_tests],
            "learning_goals": [g.to_dict() for g in goals],
            "saved_resumes": [r.to_dict() for r in resumes]
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
