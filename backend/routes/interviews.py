from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import MockInterviewQuestion, InterviewPracticeRecord, Student

interviews_bp = Blueprint("interviews", __name__, url_prefix="/api/interviews")

SUPPORTED_TECHNICAL_DOMAINS = [
    "Python", "Java", "C", "SQL", "HTML and CSS", "JavaScript", "React", "Machine Learning", "Data Analytics"
]

@interviews_bp.route("/domains", methods=["GET"])
def get_interview_domains():
    """
    Returns available technical and HR interview domains and question counts.
    """
    db = SessionLocal()
    try:
        domains_data = []
        for dom in SUPPORTED_TECHNICAL_DOMAINS:
            count = db.query(MockInterviewQuestion).filter(
                MockInterviewQuestion.interview_type == "Technical",
                MockInterviewQuestion.domain_or_category == dom
            ).count()
            domains_data.append({
                "domain": dom,
                "type": "Technical",
                "question_count": count
            })

        hr_count = db.query(MockInterviewQuestion).filter(
            MockInterviewQuestion.interview_type == "HR"
        ).count()

        return jsonify({
            "success": True,
            "technical_domains": domains_data,
            "hr_domain": {
                "domain": "HR Behavioral",
                "type": "HR",
                "question_count": hr_count
            }
        })
    finally:
        db.close()


@interviews_bp.route("/questions", methods=["GET"])
def get_interview_questions():
    """
    Fetches interview questions filtered by type and domain.
    Query params:
      - interview_type: 'Technical' or 'HR'
      - domain: domain name e.g. 'Python', 'SQL', or 'HR Behavioral'
      - student_id: optional to check practice status
      - skills: optional comma-separated list of skill names to filter domains
                e.g. skills=Python,SQL,React  (only returns questions for those domains)
    """
    interview_type = request.args.get("interview_type", "Technical")
    domain = request.args.get("domain")
    student_id = request.args.get("student_id")
    skills_param = request.args.get("skills", "")

    # Build a set of allowed domains from the skills filter
    allowed_domains = None
    if skills_param.strip():
        raw_skills = [s.strip() for s in skills_param.split(",") if s.strip()]
        # Map skill names to the domain names stored in the DB
        allowed_domains = set()
        for sk in raw_skills:
            sk_lower = sk.lower()
            for supported in SUPPORTED_TECHNICAL_DOMAINS:
                if sk_lower == supported.lower() or sk_lower in supported.lower():
                    allowed_domains.add(supported)
            # Special mappings
            if "html" in sk_lower or "css" in sk_lower:
                allowed_domains.add("HTML and CSS")
            if "machine learning" in sk_lower or "ml" == sk_lower:
                allowed_domains.add("Machine Learning")
            if "data" in sk_lower and "analytics" in sk_lower:
                allowed_domains.add("Data Analytics")

    db = SessionLocal()
    try:
        query = db.query(MockInterviewQuestion).filter(
            MockInterviewQuestion.interview_type == interview_type
        )
        if domain and domain != "All":
            query = query.filter(MockInterviewQuestion.domain_or_category == domain)
        elif allowed_domains is not None and interview_type == "Technical":
            query = query.filter(MockInterviewQuestion.domain_or_category.in_(allowed_domains))

        questions = query.order_by(MockInterviewQuestion.domain_or_category,
                                   MockInterviewQuestion.id.asc()).all()

        practiced_ids = set()
        practiced_answers = {}
        if student_id:
            user_records = db.query(InterviewPracticeRecord).filter(
                InterviewPracticeRecord.student_id == student_id
            ).all()
            for r in user_records:
                practiced_ids.add(r.question_id)
                practiced_answers[r.question_id] = {
                    "answer": r.student_answer,
                    "practiced_at": r.practiced_at.isoformat() if r.practiced_at else None
                }

        results = []
        for q in questions:
            item = q.to_dict()
            item["is_practiced"] = q.id in practiced_ids
            item["saved_answer"] = practiced_answers.get(q.id, {}).get("answer", "")
            item["practiced_at"] = practiced_answers.get(q.id, {}).get("practiced_at", None)
            results.append(item)

        return jsonify({
            "success": True,
            "total": len(results),
            "questions": results
        })
    finally:
        db.close()


@interviews_bp.route("/practice/<student_id>", methods=["POST"])
def save_practice_response(student_id):
    """
    Saves or updates a student's practice response for an interview question.
    Body:
    {
        "question_id": 1,
        "student_answer": "My practice answer here...",
        "is_practiced": true
    }
    """
    data = request.get_json() or {}
    question_id = data.get("question_id")
    student_answer = (data.get("student_answer") or "").strip()

    if not question_id:
        return jsonify({"success": False, "error": "question_id is required."}), 400

    db = SessionLocal()
    try:
        q = db.query(MockInterviewQuestion).filter(MockInterviewQuestion.id == question_id).first()
        if not q:
            return jsonify({"success": False, "error": "Question not found."}), 404

        record = db.query(InterviewPracticeRecord).filter(
            InterviewPracticeRecord.student_id == student_id,
            InterviewPracticeRecord.question_id == question_id
        ).first()

        if record:
            record.student_answer = student_answer
            record.is_practiced = True
            record.practiced_at = datetime.utcnow()
        else:
            record = InterviewPracticeRecord(
                student_id=student_id,
                question_id=question_id,
                student_answer=student_answer,
                is_practiced=True,
                practiced_at=datetime.utcnow()
            )
            db.add(record)

        db.commit()
        db.refresh(record)

        return jsonify({
            "success": True,
            "message": "Practice response saved successfully.",
            "record": record.to_dict(),
            "sample_answer": q.sample_answer,
            "explanation_tips": q.explanation_tips
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@interviews_bp.route("/history/<student_id>", methods=["GET"])
def get_practice_history(student_id):
    """
    Returns student practice history and analytics across Technical and HR questions.
    """
    db = SessionLocal()
    try:
        records = db.query(InterviewPracticeRecord).filter(
            InterviewPracticeRecord.student_id == student_id
        ).order_by(InterviewPracticeRecord.practiced_at.desc()).all()

        total_practiced = len(records)
        tech_practiced = sum(1 for r in records if r.question and r.question.interview_type == "Technical")
        hr_practiced = sum(1 for r in records if r.question and r.question.interview_type == "HR")

        total_available_tech = db.query(MockInterviewQuestion).filter(MockInterviewQuestion.interview_type == "Technical").count()
        total_available_hr = db.query(MockInterviewQuestion).filter(MockInterviewQuestion.interview_type == "HR").count()

        return jsonify({
            "success": True,
            "records": [r.to_dict() for r in records],
            "stats": {
                "total_practiced": total_practiced,
                "technical_practiced": tech_practiced,
                "hr_practiced": hr_practiced,
                "total_available_tech": total_available_tech,
                "total_available_hr": total_available_hr,
                "tech_completion_pct": round((tech_practiced / total_available_tech * 100), 1) if total_available_tech > 0 else 0.0,
                "hr_completion_pct": round((hr_practiced / total_available_hr * 100), 1) if total_available_hr > 0 else 0.0
            }
        })
    finally:
        db.close()
