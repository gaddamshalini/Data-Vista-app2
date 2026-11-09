from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import LearningGoal, Student, Career, CareerSkill, StudentSkill, Skill

learning_bp = Blueprint("learning", __name__, url_prefix="/api/learning")

@learning_bp.route("/<student_id>", methods=["GET"])
def get_learning_goals(student_id):
    """Fetch all learning goals for a student with summary stats."""
    db = SessionLocal()
    try:
        goals = db.query(LearningGoal).filter(
            LearningGoal.student_id == student_id
        ).order_by(LearningGoal.created_at.desc()).all()

        total = len(goals)
        completed = sum(1 for g in goals if g.status == "Completed" or g.progress_pct == 100)
        in_progress = sum(1 for g in goals if g.status == "In Progress" and g.progress_pct < 100)
        not_started = sum(1 for g in goals if g.status == "Not Started")
        avg_progress = round(sum(g.progress_pct for g in goals) / total, 1) if total > 0 else 0.0

        return jsonify({
            "success": True,
            "data": [g.to_dict() for g in goals],
            "summary": {
                "total_goals": total,
                "completed": completed,
                "in_progress": in_progress,
                "not_started": not_started,
                "average_progress": avg_progress
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@learning_bp.route("/<student_id>", methods=["POST"])
def add_learning_goal(student_id):
    """
    Add a new learning goal for a student.
    Body: { "skill_name": "...", "target_role": "...", "status": "...", "progress_pct": 20, "target_date": "...", "notes": "..." }
    """
    data = request.get_json() or {}
    skill_name = (data.get("skill_name") or "").strip()
    target_role = (data.get("target_role") or "Target Career").strip()
    status = data.get("status", "Not Started")
    progress_pct = int(data.get("progress_pct", 0))
    target_date = data.get("target_date")
    notes = data.get("notes", "")

    if not skill_name:
        return jsonify({"success": False, "error": "Skill name is required."}), 400

    # Ensure progress_pct is within 0-100
    progress_pct = max(0, min(100, progress_pct))
    if progress_pct == 100:
        status = "Completed"
    elif progress_pct > 0 and status == "Not Started":
        status = "In Progress"

    db = SessionLocal()
    try:
        # Check student
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": "Student not found."}), 404

        # Check duplicate active goal
        existing = db.query(LearningGoal).filter(
            LearningGoal.student_id == student_id,
            LearningGoal.skill_name.ilike(skill_name)
        ).first()

        if existing:
            # Update existing goal
            existing.target_role = target_role
            existing.status = status
            existing.progress_pct = progress_pct
            existing.target_date = target_date or existing.target_date
            existing.notes = notes or existing.notes
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return jsonify({
                "success": True,
                "message": f"Updated existing learning goal for '{skill_name}'.",
                "data": existing.to_dict()
            })

        goal = LearningGoal(
            student_id=student_id,
            target_role=target_role,
            skill_name=skill_name,
            status=status,
            progress_pct=progress_pct,
            target_date=target_date,
            notes=notes
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

        return jsonify({
            "success": True,
            "message": f"Goal '{skill_name}' added to learning tracker.",
            "data": goal.to_dict()
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@learning_bp.route("/goal/<int:goal_id>", methods=["PUT"])
def update_learning_goal(goal_id):
    """Update goal status, progress, notes, or target date."""
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
        if not goal:
            return jsonify({"success": False, "error": "Learning goal not found."}), 404

        if "status" in data:
            goal.status = data["status"]
        if "progress_pct" in data:
            pct = int(data["progress_pct"])
            goal.progress_pct = max(0, min(100, pct))
            if goal.progress_pct == 100:
                goal.status = "Completed"
            elif goal.progress_pct > 0 and goal.status == "Not Started":
                goal.status = "In Progress"
        if "target_role" in data:
            goal.target_role = data["target_role"]
        if "target_date" in data:
            goal.target_date = data["target_date"]
        if "notes" in data:
            goal.notes = data["notes"]

        goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(goal)

        return jsonify({
            "success": True,
            "message": "Learning goal updated successfully.",
            "data": goal.to_dict()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@learning_bp.route("/goal/<int:goal_id>", methods=["DELETE"])
def delete_learning_goal(goal_id):
    """Delete a learning goal."""
    db = SessionLocal()
    try:
        goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
        if not goal:
            return jsonify({"success": False, "error": "Goal not found."}), 404
        db.delete(goal)
        db.commit()
        return jsonify({"success": True, "message": "Goal removed from tracker."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@learning_bp.route("/<student_id>/sync-skill-gap", methods=["POST"])
def sync_skill_gap(student_id):
    """
    Automatically creates learning goals for any missing skills identified from the student's
    target career role (or preferred_career) that are not yet acquired or tracked.
    """
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": "Student not found."}), 404

        target_role = student.preferred_career or "Data Analyst"

        # Find career in DB or match fuzzy
        career = db.query(Career).filter(Career.title.ilike(f"%{target_role}%")).first()
        if not career:
            career = db.query(Career).first()

        career_skills = []
        if career:
            cs_rows = db.query(CareerSkill).filter(CareerSkill.career_id == career.id).all()
            for cs in cs_rows:
                s = db.query(Skill).filter(Skill.id == cs.skill_id).first()
                if s:
                    career_skills.append(s.name)

        # Fallback common skills if career table has no direct match
        if not career_skills:
            career_skills = ["Python", "SQL", "Machine Learning", "Data Visualization", "Git"]

        # Student's acquired skills
        acquired_rows = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        acquired_skill_ids = [ss.skill_id for ss in acquired_rows]
        acquired_skills = [s.name.lower() for s in db.query(Skill).filter(Skill.id.in_(acquired_skill_ids)).all()]

        # Existing tracked goals
        existing_goals = db.query(LearningGoal).filter(LearningGoal.student_id == student_id).all()
        existing_goal_skills = [g.skill_name.lower() for g in existing_goals]

        created = []
        for req_skill in career_skills:
            if req_skill.lower() not in acquired_skills and req_skill.lower() not in existing_goal_skills:
                new_goal = LearningGoal(
                    student_id=student_id,
                    target_role=target_role,
                    skill_name=req_skill,
                    status="Not Started",
                    progress_pct=0,
                    notes=f"Auto-imported from Skill Gap analysis for {target_role}."
                )
                db.add(new_goal)
                created.append(req_skill)

        db.commit()

        return jsonify({
            "success": True,
            "message": f"Synced {len(created)} missing skills into Learning Progress Tracker.",
            "synced_skills": created,
            "target_role": target_role
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
