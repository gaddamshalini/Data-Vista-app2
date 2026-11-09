import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import SavedResume, Student

resumes_bp = Blueprint("resumes", __name__, url_prefix="/api/resumes")

@resumes_bp.route("/<student_id>", methods=["GET"])
def get_student_resumes(student_id):
    """
    Fetch all saved resumes for a specific student, latest first.
    """
    db = SessionLocal()
    try:
        resumes = db.query(SavedResume).filter(
            SavedResume.student_id == student_id
        ).order_by(SavedResume.updated_at.desc()).all()

        return jsonify({
            "success": True,
            "data": [r.to_dict() for r in resumes],
            "latest": resumes[0].to_dict() if resumes else None,
            "total": len(resumes)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@resumes_bp.route("/<student_id>", methods=["POST"])
def save_student_resume(student_id):
    """
    Save or update a resume for a student.
    Body:
    {
        "id": optional int (if updating existing),
        "title": "Data Scientist Resume",
        "resume_data": { ... full resume JSON structure ... }
    }
    """
    data = request.get_json() or {}
    resume_id = data.get("id")
    title = data.get("title", "My Resume").strip() or "My Resume"
    resume_data = data.get("resume_data")

    if not resume_data:
        return jsonify({"success": False, "error": "Resume content data is required."}), 400

    db = SessionLocal()
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": f"Student with ID '{student_id}' does not exist."}), 404

        content_json_str = json.dumps(resume_data)

        if resume_id:
            # Update existing resume
            saved_resume = db.query(SavedResume).filter(
                SavedResume.id == resume_id,
                SavedResume.student_id == student_id
            ).first()

            if saved_resume:
                saved_resume.title = title
                saved_resume.content_json = content_json_str
                saved_resume.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(saved_resume)
                return jsonify({
                    "success": True,
                    "message": "Resume updated successfully in database.",
                    "data": saved_resume.to_dict()
                })

        # Check if student already has a resume with the same title or create new
        existing = db.query(SavedResume).filter(
            SavedResume.student_id == student_id,
            SavedResume.title == title
        ).first()

        if existing:
            existing.content_json = content_json_str
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return jsonify({
                "success": True,
                "message": "Resume updated successfully in database.",
                "data": existing.to_dict()
            })

        new_resume = SavedResume(
            student_id=student_id,
            title=title,
            content_json=content_json_str
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)

        return jsonify({
            "success": True,
            "message": "Resume saved successfully in database.",
            "data": new_resume.to_dict()
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@resumes_bp.route("/item/<int:resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    """Delete a saved resume."""
    db = SessionLocal()
    try:
        r = db.query(SavedResume).filter(SavedResume.id == resume_id).first()
        if not r:
            return jsonify({"success": False, "error": "Resume not found."}), 404
        db.delete(r)
        db.commit()
        return jsonify({"success": True, "message": "Resume deleted successfully."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
