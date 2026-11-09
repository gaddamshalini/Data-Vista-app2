from datetime import datetime, date
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import CodingPracticeRecord, Student

coding_bp = Blueprint("coding", __name__, url_prefix="/api/coding")

SUPPORTED_CODING_LANGUAGES = ["Python", "Java", "C", "SQL"]

@coding_bp.route("/<student_id>", methods=["GET"])
def get_coding_records(student_id):
    """
    Returns coding practice records and analytical statistics for a student.
    Query params:
      - language: Python, Java, C, SQL
      - difficulty: Easy, Medium, Hard
      - status: Not Started, Attempted, Solved
      - topic: optional string
    """
    db = SessionLocal()
    try:
        query = db.query(CodingPracticeRecord).filter(CodingPracticeRecord.student_id == student_id)

        # Filters
        lang = request.args.get("language")
        if lang and lang != "All":
            query = query.filter(CodingPracticeRecord.language == lang)

        diff = request.args.get("difficulty")
        if diff and diff != "All":
            query = query.filter(CodingPracticeRecord.difficulty == diff)

        stat = request.args.get("status")
        if stat and stat != "All":
            query = query.filter(CodingPracticeRecord.status == stat)

        topic = request.args.get("topic")
        if topic and topic != "All":
            query = query.filter(CodingPracticeRecord.topic.ilike(f"%{topic}%"))

        records = query.order_by(CodingPracticeRecord.created_at.desc()).all()

        # Compute full statistics across all student coding records
        all_records = db.query(CodingPracticeRecord).filter(CodingPracticeRecord.student_id == student_id).all()
        total_problems = len(all_records)
        total_solved = sum(1 for r in all_records if r.status == "Solved")
        total_attempted = sum(1 for r in all_records if r.status == "Attempted")
        solve_rate = round((total_solved / total_problems * 100), 1) if total_problems > 0 else 0.0

        # Language breakdown
        language_breakdown = {}
        for l in SUPPORTED_CODING_LANGUAGES:
            l_records = [r for r in all_records if r.language == l]
            l_solved = sum(1 for r in l_records if r.status == "Solved")
            l_attempted = sum(1 for r in l_records if r.status == "Attempted")
            language_breakdown[l] = {
                "total": len(l_records),
                "solved": l_solved,
                "attempted": l_attempted,
                "solve_rate": round((l_solved / len(l_records) * 100), 1) if l_records else 0.0
            }

        # Difficulty breakdown
        difficulty_breakdown = {
            "Easy": sum(1 for r in all_records if r.difficulty == "Easy"),
            "Medium": sum(1 for r in all_records if r.difficulty == "Medium"),
            "Hard": sum(1 for r in all_records if r.difficulty == "Hard")
        }

        # Topic breakdown (top topics)
        topic_counts = {}
        for r in all_records:
            t = r.topic.strip() if r.topic else "General"
            topic_counts[t] = topic_counts.get(t, 0) + 1

        return jsonify({
            "success": True,
            "records": [r.to_dict() for r in records],
            "stats": {
                "total_problems": total_problems,
                "total_solved": total_solved,
                "total_attempted": total_attempted,
                "solve_rate_pct": solve_rate,
                "language_breakdown": language_breakdown,
                "difficulty_breakdown": difficulty_breakdown,
                "topics_count": topic_counts
            }
        })
    finally:
        db.close()


@coding_bp.route("/<student_id>", methods=["POST"])
def add_coding_record(student_id):
    """
    Adds a new coding practice record.
    """
    data = request.get_json() or {}
    problem_title = (data.get("problem_title") or "").strip()
    language = (data.get("language") or "Python").strip()
    topic = (data.get("topic") or "General").strip()

    if not problem_title:
        return jsonify({"success": False, "error": "Problem title is required."}), 400

    if language not in SUPPORTED_CODING_LANGUAGES:
        return jsonify({"success": False, "error": f"Language must be one of {', '.join(SUPPORTED_CODING_LANGUAGES)}"}), 400

    db = SessionLocal()
    try:
        record = CodingPracticeRecord(
            student_id=student_id,
            language=language,
            problem_title=problem_title,
            topic=topic,
            difficulty=data.get("difficulty", "Easy"),
            platform=data.get("platform", "LeetCode"),
            problem_url=(data.get("problem_url") or "").strip(),
            status=data.get("status", "Solved"),
            notes=(data.get("notes") or "").strip(),
            attempted_date=data.get("attempted_date") or date.today().isoformat()
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return jsonify({
            "success": True,
            "message": "Coding practice record logged successfully.",
            "record": record.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@coding_bp.route("/<student_id>/<int:record_id>", methods=["PUT"])
def update_coding_record(student_id, record_id):
    """
    Updates an existing coding practice record.
    """
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        record = db.query(CodingPracticeRecord).filter(
            CodingPracticeRecord.id == record_id,
            CodingPracticeRecord.student_id == student_id
        ).first()

        if not record:
            return jsonify({"success": False, "error": "Record not found."}), 404

        if "problem_title" in data and data["problem_title"]:
            record.problem_title = data["problem_title"].strip()
        if "language" in data and data["language"]:
            if data["language"] in SUPPORTED_CODING_LANGUAGES:
                record.language = data["language"]
        if "topic" in data and data["topic"]:
            record.topic = data["topic"].strip()
        if "difficulty" in data and data["difficulty"]:
            record.difficulty = data["difficulty"]
        if "platform" in data and data["platform"]:
            record.platform = data["platform"]
        if "problem_url" in data:
            record.problem_url = (data["problem_url"] or "").strip()
        if "status" in data and data["status"]:
            record.status = data["status"]
        if "notes" in data:
            record.notes = (data["notes"] or "").strip()
        if "attempted_date" in data and data["attempted_date"]:
            record.attempted_date = data["attempted_date"]

        record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(record)

        return jsonify({
            "success": True,
            "message": "Record updated successfully.",
            "record": record.to_dict()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@coding_bp.route("/<student_id>/<int:record_id>", methods=["DELETE"])
def delete_coding_record(student_id, record_id):
    """
    Deletes a coding practice record.
    """
    db = SessionLocal()
    try:
        record = db.query(CodingPracticeRecord).filter(
            CodingPracticeRecord.id == record_id,
            CodingPracticeRecord.student_id == student_id
        ).first()

        if not record:
            return jsonify({"success": False, "error": "Record not found."}), 404

        db.delete(record)
        db.commit()
        return jsonify({"success": True, "message": "Record deleted successfully."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
