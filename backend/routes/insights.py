from flask import Blueprint, jsonify
from database import SessionLocal
from models import (
    Student, SkillAssessmentAttempt, AptitudeAssessmentAttempt,
    LearningGoal, StudentInternship, StudentCertification, Project,
    StudentTask, CodingPracticeRecord
)

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")

@insights_bp.route("/<student_id>", methods=["GET"])
def get_student_insights(student_id):
    """
    Computes unified, real-time performance analytics for a student
    derived strictly from real database records (no fake/hardcoded metrics).
    """
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": f"Student '{student_id}' not found."}), 404

        # 1. Fetch Skill Assessment records
        skill_attempts = db.query(SkillAssessmentAttempt).filter(
            SkillAssessmentAttempt.student_id == student_id
        ).order_by(SkillAssessmentAttempt.completed_at.desc()).all()

        total_skill_tests = len(skill_attempts)
        avg_skill_pct = round(sum(a.percentage for a in skill_attempts) / total_skill_tests, 1) if total_skill_tests > 0 else 0.0

        # Skill attempts grouped by skill (latest score per skill)
        latest_skill_scores = {}
        for a in reversed(skill_attempts):
            latest_skill_scores[a.skill] = {
                "score": a.score,
                "percentage": a.percentage,
                "skill_level": a.skill_level,
                "completed_at": a.completed_at.isoformat()
            }

        # Count levels
        beginner_count = sum(1 for s in latest_skill_scores.values() if s["skill_level"] == "Beginner")
        inter_count = sum(1 for s in latest_skill_scores.values() if s["skill_level"] == "Intermediate")
        adv_count = sum(1 for s in latest_skill_scores.values() if s["skill_level"] == "Advanced")

        # 2. Fetch Aptitude Assessment records
        apt_attempts = db.query(AptitudeAssessmentAttempt).filter(
            AptitudeAssessmentAttempt.student_id == student_id
        ).order_by(AptitudeAssessmentAttempt.completed_at.desc()).all()

        total_apt_tests = len(apt_attempts)
        avg_apt_pct = round(sum(a.percentage for a in apt_attempts) / total_apt_tests, 1) if total_apt_tests > 0 else 0.0

        # Latest category scores in aptitude
        latest_quant_pct = 0.0
        latest_logical_pct = 0.0
        latest_verbal_pct = 0.0
        latest_apt_level = "No attempts yet"
        if apt_attempts:
            latest_attempt = apt_attempts[0]
            latest_apt_level = latest_attempt.performance_level
            # Compute category percentages based on questions
            latest_quant_pct = round((latest_attempt.quantitative_score / 4.0) * 100, 1) if latest_attempt.quantitative_score else 0.0
            latest_logical_pct = round((latest_attempt.logical_score / 3.0) * 100, 1) if latest_attempt.logical_score else 0.0
            latest_verbal_pct = round((latest_attempt.verbal_score / 3.0) * 100, 1) if latest_attempt.verbal_score else 0.0

        # 3. Fetch Learning Goals
        goals = db.query(LearningGoal).filter(LearningGoal.student_id == student_id).all()
        total_goals = len(goals)
        completed_goals = sum(1 for g in goals if g.status == "Completed" or g.progress_pct == 100)
        in_progress_goals = sum(1 for g in goals if g.status == "In Progress")
        avg_goal_progress = round(sum(g.progress_pct for g in goals) / total_goals, 1) if total_goals > 0 else 0.0

        # 4. Profile Accomplishments
        internships_count = db.query(StudentInternship).filter(StudentInternship.student_id == student.id).count()
        certs_count = db.query(StudentCertification).filter(StudentCertification.student_id == student.id).count()
        projects_count = db.query(Project).filter(Project.student_id == student.id).count()

        # Task Planner & Coding Practice Integration
        tasks = db.query(StudentTask).filter(StudentTask.student_id == student_id).all()
        total_tasks_count = len(tasks)
        completed_tasks_count = sum(1 for t in tasks if t.status == "Completed")
        task_completion_pct = round((completed_tasks_count / total_tasks_count * 100), 1) if total_tasks_count > 0 else 0.0

        coding_records = db.query(CodingPracticeRecord).filter(CodingPracticeRecord.student_id == student_id).all()
        coding_total = len(coding_records)
        coding_solved = sum(1 for c in coding_records if c.status == "Solved")

        # 5. Composite Readiness Index (0-100)
        # Weighted real factors:
        # Academic (CGPA scaled from 10 to 100): 25%
        # Technical Skill Tests Avg: 25% (or fallback to student skill presence if no tests yet)
        # Aptitude Tests Avg: 20%
        # Practical experience (internships, projects, certs): 15%
        # Learning consistency: 15%
        cgpa_score = min(100.0, (student.cgpa or 7.0) * 10.0)
        academic_component = cgpa_score * 0.25

        if total_skill_tests > 0:
            tech_component = avg_skill_pct * 0.25
        else:
            tech_component = 50.0 * 0.25  # baseline pending test

        if total_apt_tests > 0:
            apt_component = avg_apt_pct * 0.20
        else:
            apt_component = 50.0 * 0.20  # baseline pending test

        practical_raw = min(100.0, (internships_count * 30.0) + (projects_count * 15.0) + (certs_count * 10.0) + (20.0 if student.github_profile else 0.0))
        practical_component = practical_raw * 0.15

        if total_goals > 0:
            learning_component = avg_goal_progress * 0.15
        else:
            learning_component = 40.0 * 0.15

        readiness_index = round(academic_component + tech_component + apt_component + practical_component + learning_component, 1)

        # 6. Actionable recommendations derived from actual data
        recommendations = []
        if total_skill_tests == 0:
            recommendations.append({
                "category": "Skill Assessment",
                "priority": "High",
                "message": "You haven't taken any Technical Skill Assessments yet. Start by taking tests in your primary skills (e.g. Python, SQL) to validate your proficiency level."
            })
        else:
            # Check weak skills
            for s_name, s_info in latest_skill_scores.items():
                if s_info["skill_level"] == "Beginner" or s_info["percentage"] < 50:
                    recommendations.append({
                        "category": "Skill Improvement",
                        "priority": "High",
                        "message": f"Your latest score in {s_name} is {s_info['percentage']}%. Practice core coding exercises and retake the {s_name} test to elevate to Intermediate."
                    })

        if total_apt_tests == 0:
            recommendations.append({
                "category": "Aptitude Assessment",
                "priority": "High",
                "message": "Take the Aptitude Assessment test to evaluate Quantitative Aptitude, Logical Reasoning, and Verbal Ability needed for placement screening rounds."
            })
        else:
            if latest_quant_pct < 60:
                recommendations.append({
                    "category": "Quantitative Aptitude",
                    "priority": "Medium",
                    "message": f"Quantitative score is currently at {latest_quant_pct}%. Focus on Speed & Time, Work, and Percentages to clear technical aptitude cutoffs."
                })
            if latest_logical_pct < 60:
                recommendations.append({
                    "category": "Logical Reasoning",
                    "priority": "Medium",
                    "message": f"Logical score is at {latest_logical_pct}%. Practice Syllogisms, Series, and Blood Relations to improve analytical accuracy."
                })

        if total_goals == 0:
            recommendations.append({
                "category": "Learning Tracker",
                "priority": "Medium",
                "message": "Add your target career skills to the Learning Progress Tracker or sync missing skills from the Skill Gap module."
            })

        if internships_count == 0:
            recommendations.append({
                "category": "Internship Ecosystem",
                "priority": "High",
                "message": "Explore the Internship Matching module and apply to recommended internships to gain real-world industry exposure before placement season."
            })

        if not student.github_profile:
            recommendations.append({
                "category": "Portfolio",
                "priority": "Low",
                "message": "Link your GitHub profile in the Student Profile so technical recruiters can review your repositories in the Resume Builder."
            })

        return jsonify({
            "success": True,
            "student_id": student.student_id,
            "student_name": student.name,
            "department": student.branch,
            "cgpa": student.cgpa,
            "readiness_index": readiness_index,
            "metrics": {
                "academic_score": round(cgpa_score, 1),
                "total_skill_tests": total_skill_tests,
                "avg_skill_pct": avg_skill_pct,
                "skill_levels_breakdown": {
                    "Advanced": adv_count,
                    "Intermediate": inter_count,
                    "Beginner": beginner_count
                },
                "latest_skills": latest_skill_scores,
                "total_apt_tests": total_apt_tests,
                "avg_apt_pct": avg_apt_pct,
                "latest_apt_level": latest_apt_level,
                "aptitude_breakdown": {
                    "quantitative_pct": latest_quant_pct,
                    "logical_pct": latest_logical_pct,
                    "verbal_pct": latest_verbal_pct
                },
                "learning_tracker": {
                    "total_goals": total_goals,
                    "completed": completed_goals,
                    "in_progress": in_progress_goals,
                    "avg_progress": avg_goal_progress
                },
                "portfolio": {
                    "internships": internships_count,
                    "certifications": certs_count,
                    "projects": projects_count,
                    "github_connected": bool(student.github_profile)
                },
                "tasks_summary": {
                    "total_tasks": total_tasks_count,
                    "completed_tasks": completed_tasks_count,
                    "completion_pct": task_completion_pct
                },
                "coding_summary": {
                    "total_problems": coding_total,
                    "solved_problems": coding_solved
                }
            },
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
