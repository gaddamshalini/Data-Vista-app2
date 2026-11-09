from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import (
    Notification, Student, SavedResume, SkillAssessmentAttempt,
    AptitudeAssessmentAttempt, LearningGoal, StudentTask
)

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

def generate_smart_notifications(db, student_id: str):
    """
    Evaluates dynamic rules and creates contextual notifications for a student
    without creating spammy duplicates.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return

    # Helper to check if an active notification with identical title exists
    def has_active_notif(title):
        return db.query(Notification).filter(
            Notification.student_id == student_id,
            Notification.title == title,
            Notification.is_read == False
        ).first() is not None

    # Rule 1: Profile Completeness
    missing_items = []
    if not student.profile_photo:
        missing_items.append("profile photo")
    if not student.github_profile:
        missing_items.append("GitHub profile link")
    if not student.school_name or not student.intermediate_college_name:
        missing_items.append("academic schooling details")

    if missing_items:
        title = "Complete Your Student Profile"
        if not has_active_notif(title):
            msg = f"Your profile is missing {', '.join(missing_items)}. Complete it in Student Profile to maximize placement matching accuracy."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="profile"))

    # Rule 2: Resume Builder Reminder
    saved_resumes_count = db.query(SavedResume).filter(SavedResume.student_id == student_id).count()
    if saved_resumes_count == 0:
        title = "Create and Save Your Resume"
        if not has_active_notif(title):
            msg = "You have not saved a resume yet. Generate and save an industry-standard ATS resume in the Resume Builder."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="resume"))

    # Rule 3: Technical Skill Assessment Reminder
    skill_tests_count = db.query(SkillAssessmentAttempt).filter(SkillAssessmentAttempt.student_id == student_id).count()
    if skill_tests_count == 0:
        title = "Take Your First Skill Assessment"
        if not has_active_notif(title):
            msg = "Validate your technical competencies! Take a 10-question MCQ test in Python, SQL, React, or Java to earn skill proficiency badges."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="assessment"))

    # Rule 4: Aptitude Assessment Reminder
    apt_tests_count = db.query(AptitudeAssessmentAttempt).filter(AptitudeAssessmentAttempt.student_id == student_id).count()
    if apt_tests_count == 0:
        title = "Evaluate Placement Aptitude Readiness"
        if not has_active_notif(title):
            msg = "Take the 10-question Aptitude Assessment to benchmark Quantitative, Logical, and Verbal reasoning before campus drives."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="assessment"))

    # Rule 5: Pending Learning Goals
    in_progress_goals = db.query(LearningGoal).filter(
        LearningGoal.student_id == student_id,
        LearningGoal.status == "In Progress"
    ).all()
    if in_progress_goals:
        title = f"Learning In Progress: {len(in_progress_goals)} Active Goals"
        if not has_active_notif(title):
            skills_list = ", ".join([g.skill_name for g in in_progress_goals[:3]])
            msg = f"Keep up the momentum! You have active learning goals for {skills_list}. Update your progress in the Learning Tracker."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="learning"))

    # Rule 6: Task Planner - Approaching or Overdue Tasks
    tasks = db.query(StudentTask).filter(
        StudentTask.student_id == student_id,
        StudentTask.status != "Completed"
    ).all()
    overdue_count = sum(1 for t in tasks if t.is_overdue())
    today_count = sum(1 for t in tasks if t.is_today())

    if overdue_count > 0:
        title = f"Task Alert: {overdue_count} Overdue Task{'s' if overdue_count > 1 else ''}"
        if not has_active_notif(title):
            msg = f"You have {overdue_count} overdue task(s) in your Task Planner. Review and complete them to keep your placement preparation on track."
            db.add(Notification(student_id=student_id, title=title, message=msg, type="tasks"))
    elif today_count > 0:
        title = f"Tasks Due Today: {today_count} Pending"
        if not has_active_notif(title):
            msg = f"You have {today_count} task(s) scheduled for completion today. Visit your Student Task Planner to check them off!"
            db.add(Notification(student_id=student_id, title=title, message=msg, type="tasks"))

    db.commit()

@notifications_bp.route("/<student_id>", methods=["GET"])
def get_notifications(student_id):
    """
    Returns all notifications for a student, runs smart generation, and includes unread count.
    """
    db = SessionLocal()
    try:
        # Trigger smart evaluation
        generate_smart_notifications(db, student_id)

        notifications = db.query(Notification).filter(
            Notification.student_id == student_id
        ).order_by(Notification.created_at.desc()).all()

        unread_count = sum(1 for n in notifications if not n.is_read)

        return jsonify({
            "success": True,
            "data": [n.to_dict() for n in notifications],
            "unread_count": unread_count,
            "total": len(notifications)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@notifications_bp.route("/item/<int:notif_id>/read", methods=["PUT"])
def mark_notification_read(notif_id):
    """Marks a single notification as read."""
    db = SessionLocal()
    try:
        notif = db.query(Notification).filter(Notification.id == notif_id).first()
        if not notif:
            return jsonify({"success": False, "error": "Notification not found."}), 404
        notif.is_read = True
        db.commit()
        return jsonify({"success": True, "message": "Notification marked as read."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@notifications_bp.route("/<student_id>/mark-all-read", methods=["PUT"])
def mark_all_read(student_id):
    """Marks all notifications as read for a student."""
    db = SessionLocal()
    try:
        db.query(Notification).filter(
            Notification.student_id == student_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return jsonify({"success": True, "message": "All notifications marked as read."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@notifications_bp.route("/item/<int:notif_id>", methods=["DELETE"])
def delete_notification(notif_id):
    """Deletes a single notification."""
    db = SessionLocal()
    try:
        notif = db.query(Notification).filter(Notification.id == notif_id).first()
        if not notif:
            return jsonify({"success": False, "error": "Notification not found."}), 404
        db.delete(notif)
        db.commit()
        return jsonify({"success": True, "message": "Notification deleted."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@notifications_bp.route("/<student_id>/clear", methods=["DELETE"])
def clear_all_notifications(student_id):
    """Clears all notifications for a student."""
    db = SessionLocal()
    try:
        db.query(Notification).filter(Notification.student_id == student_id).delete()
        db.commit()
        return jsonify({"success": True, "message": "All notifications cleared."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
