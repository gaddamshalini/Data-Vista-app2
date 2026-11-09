import json
import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import (
    SkillQuestion, AptitudeQuestion, SkillAssessmentAttempt,
    AptitudeAssessmentAttempt, ServedQuestionHistory, Student
)

assessments_bp = Blueprint("assessments", __name__, url_prefix="/api/assessments")

# 10 Supported Technical Skills
SUPPORTED_SKILLS = [
    "Python", "Java", "C", "SQL", "HTML", "CSS", "JavaScript", "React", "Machine Learning", "Data Analytics"
]

# 3 Aptitude Categories
SUPPORTED_APTITUDE_CATEGORIES = [
    "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"
]

# =========================================================================
# 1. SKILL ASSESSMENTS
# =========================================================================

@assessments_bp.route("/skills/list", methods=["GET"])
def list_skills():
    """Returns available skills for assessment along with meta."""
    db = SessionLocal()
    try:
        skills_summary = []
        for s in SUPPORTED_SKILLS:
            count = db.query(SkillQuestion).filter(SkillQuestion.skill == s).count()
            skills_summary.append({
                "name": s,
                "question_count": count,
                "test_size": 10,
                "status": "Available" if count >= 10 else "Coming Soon"
            })
        return jsonify({"success": True, "skills": skills_summary})
    finally:
        db.close()

@assessments_bp.route("/skills/start", methods=["GET"])
def start_skill_test():
    """
    Starts a 10-question technical skill test for a student.
    Query params: skill (e.g. Python), student_id
    Enforces question uniqueness per student: avoids serving questions already served until bank exhausted.
    Does NOT return correct options or explanations to client!
    """
    skill = request.args.get("skill")
    student_id = request.args.get("student_id")

    if not skill or not student_id:
        return jsonify({"success": False, "error": "Both 'skill' and 'student_id' are required."}), 400

    if skill not in SUPPORTED_SKILLS:
        return jsonify({"success": False, "error": f"Invalid skill. Must be one of: {', '.join(SUPPORTED_SKILLS)}"}), 400

    db = SessionLocal()
    try:
        # Fetch question IDs already served to this student for this skill
        served_rows = db.query(ServedQuestionHistory.question_id).filter(
            ServedQuestionHistory.student_id == student_id,
            ServedQuestionHistory.assessment_type == "skill",
            ServedQuestionHistory.skill_or_category == skill
        ).all()
        served_ids = set(r[0] for r in served_rows)

        # Get all question IDs for this skill
        all_questions = db.query(SkillQuestion).filter(SkillQuestion.skill == skill).all()
        if len(all_questions) < 10:
            return jsonify({"success": False, "error": f"Insufficient questions in bank for {skill}."}), 500

        unserved_questions = [q for q in all_questions if q.id not in served_ids]

        # If unserved questions < 10, reset history for this student & skill so bank can cycle
        if len(unserved_questions) < 10:
            db.query(ServedQuestionHistory).filter(
                ServedQuestionHistory.student_id == student_id,
                ServedQuestionHistory.assessment_type == "skill",
                ServedQuestionHistory.skill_or_category == skill
            ).delete()
            db.commit()
            unserved_questions = list(all_questions)

        # Sample 10 random questions
        selected_questions = random.sample(unserved_questions, 10)

        # Record served questions in history
        for q in selected_questions:
            rec = ServedQuestionHistory(
                student_id=student_id,
                assessment_type="skill",
                skill_or_category=skill,
                question_id=q.id
            )
            db.add(rec)
        db.commit()

        # Format for client without disclosing answers
        client_questions = [q.to_client_dict() for q in selected_questions]

        return jsonify({
            "success": True,
            "skill": skill,
            "total_questions": len(client_questions),
            "questions": client_questions,
            "session_id": f"skill_{student_id}_{int(datetime.utcnow().timestamp())}"
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@assessments_bp.route("/skills/submit", methods=["POST"])
def submit_skill_test():
    """
    Submits student answers for a skill test and evaluates performance.
    Body:
    {
        "student_id": "STU1001",
        "skill": "Python",
        "answers": {
            "14": "A",
            "18": "B",
            ...
        }
    }
    """
    data = request.get_json() or {}
    student_id = data.get("student_id")
    skill = data.get("skill")
    answers = data.get("answers", {})

    if not student_id or not skill:
        return jsonify({"success": False, "error": "student_id and skill are required."}), 400

    db = SessionLocal()
    try:
        q_ids = [int(qid) for qid in answers.keys()]
        if not q_ids:
            return jsonify({"success": False, "error": "No answers provided."}), 400

        questions = db.query(SkillQuestion).filter(SkillQuestion.id.in_(q_ids)).all()
        q_dict = {q.id: q for q in questions}

        score = 0
        breakdown = []

        for qid_str, user_ans in answers.items():
            qid = int(qid_str)
            q_obj = q_dict.get(qid)
            if not q_obj:
                continue

            user_choice = (user_ans or "").strip().upper()
            is_correct = (user_choice == q_obj.correct_option)
            if is_correct:
                score += 1

            breakdown.append({
                "question_id": q_obj.id,
                "question": q_obj.question,
                "options": [
                    {"key": "A", "text": q_obj.option_a},
                    {"key": "B", "text": q_obj.option_b},
                    {"key": "C", "text": q_obj.option_c},
                    {"key": "D", "text": q_obj.option_d}
                ],
                "user_answer": user_choice,
                "correct_answer": q_obj.correct_option,
                "is_correct": is_correct,
                "explanation": q_obj.explanation,
                "difficulty": q_obj.difficulty
            })

        total = len(breakdown)
        percentage = round((score / total) * 100, 1) if total > 0 else 0.0

        # Skill Level classification
        if score >= 8:
            skill_level = "Advanced"
        elif score >= 5:
            skill_level = "Intermediate"
        else:
            skill_level = "Beginner"

        # Record attempt in DB
        attempt = SkillAssessmentAttempt(
            student_id=student_id,
            skill=skill,
            score=score,
            total_questions=total,
            percentage=percentage,
            skill_level=skill_level,
            difficulty="Mixed",
            question_ids=json.dumps(q_ids),
            answers_json=json.dumps(answers)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        return jsonify({
            "success": True,
            "attempt_id": attempt.id,
            "skill": skill,
            "score": score,
            "total_questions": total,
            "percentage": percentage,
            "skill_level": skill_level,
            "breakdown": breakdown,
            "completed_at": attempt.completed_at.isoformat()
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@assessments_bp.route("/skills/history/<student_id>", methods=["GET"])
def get_skill_history(student_id):
    """Returns past skill test attempts for a student."""
    db = SessionLocal()
    try:
        attempts = db.query(SkillAssessmentAttempt).filter(
            SkillAssessmentAttempt.student_id == student_id
        ).order_by(SkillAssessmentAttempt.completed_at.desc()).all()

        return jsonify({
            "success": True,
            "data": [a.to_dict() for a in attempts],
            "total": len(attempts)
        })
    finally:
        db.close()


# =========================================================================
# 2. APTITUDE ASSESSMENTS
# =========================================================================

@assessments_bp.route("/aptitude/categories", methods=["GET"])
def list_aptitude_categories():
    """Returns the 3 categories for aptitude assessment."""
    db = SessionLocal()
    try:
        cat_summary = []
        for c in SUPPORTED_APTITUDE_CATEGORIES:
            count = db.query(AptitudeQuestion).filter(AptitudeQuestion.category == c).count()
            cat_summary.append({
                "category": c,
                "question_count": count,
                "test_size": 10
            })
        return jsonify({"success": True, "categories": cat_summary})
    finally:
        db.close()

@assessments_bp.route("/aptitude/start", methods=["GET"])
def start_aptitude_test():
    """
    Starts a 10-question aptitude assessment.
    Query params:
    - student_id (required)
    - category: optional specific category, or 'all' (balanced 10 questions: 4 Quant, 3 Logical, 3 Verbal)
    """
    student_id = request.args.get("student_id")
    category = request.args.get("category", "all")

    if not student_id:
        return jsonify({"success": False, "error": "'student_id' is required."}), 400

    db = SessionLocal()
    try:
        selected_questions = []

        if category and category != "all" and category in SUPPORTED_APTITUDE_CATEGORIES:
            # Category-specific test
            all_q = db.query(AptitudeQuestion).filter(AptitudeQuestion.category == category).all()
            served_rows = db.query(ServedQuestionHistory.question_id).filter(
                ServedQuestionHistory.student_id == student_id,
                ServedQuestionHistory.assessment_type == "aptitude",
                ServedQuestionHistory.skill_or_category == category
            ).all()
            served_ids = set(r[0] for r in served_rows)
            unserved = [q for q in all_q if q.id not in served_ids]

            if len(unserved) < 10:
                db.query(ServedQuestionHistory).filter(
                    ServedQuestionHistory.student_id == student_id,
                    ServedQuestionHistory.assessment_type == "aptitude",
                    ServedQuestionHistory.skill_or_category == category
                ).delete()
                db.commit()
                unserved = list(all_q)

            selected_questions = random.sample(unserved, 10)
        else:
            # Balanced full test: 4 Quantitative, 3 Logical, 3 Verbal = 10 questions
            distribution = {
                "Quantitative Aptitude": 4,
                "Logical Reasoning": 3,
                "Verbal Ability": 3
            }
            for cat, count in distribution.items():
                cat_all = db.query(AptitudeQuestion).filter(AptitudeQuestion.category == cat).all()
                served_rows = db.query(ServedQuestionHistory.question_id).filter(
                    ServedQuestionHistory.student_id == student_id,
                    ServedQuestionHistory.assessment_type == "aptitude",
                    ServedQuestionHistory.skill_or_category == cat
                ).all()
                served_ids = set(r[0] for r in served_rows)
                unserved = [q for q in cat_all if q.id not in served_ids]

                if len(unserved) < count:
                    db.query(ServedQuestionHistory).filter(
                        ServedQuestionHistory.student_id == student_id,
                        ServedQuestionHistory.assessment_type == "aptitude",
                        ServedQuestionHistory.skill_or_category == cat
                    ).delete()
                    db.commit()
                    unserved = list(cat_all)

                selected_questions.extend(random.sample(unserved, count))

        # Shuffle selected questions
        random.shuffle(selected_questions)

        # Record served history
        for q in selected_questions:
            rec = ServedQuestionHistory(
                student_id=student_id,
                assessment_type="aptitude",
                skill_or_category=q.category,
                question_id=q.id
            )
            db.add(rec)
        db.commit()

        client_questions = [q.to_client_dict() for q in selected_questions]

        return jsonify({
            "success": True,
            "category": category,
            "total_questions": len(client_questions),
            "questions": client_questions,
            "session_id": f"aptitude_{student_id}_{int(datetime.utcnow().timestamp())}"
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@assessments_bp.route("/aptitude/submit", methods=["POST"])
def submit_aptitude_test():
    """
    Submits student answers for an aptitude test and calculates category scores.
    """
    data = request.get_json() or {}
    student_id = data.get("student_id")
    answers = data.get("answers", {})

    if not student_id or not answers:
        return jsonify({"success": False, "error": "student_id and answers are required."}), 400

    db = SessionLocal()
    try:
        q_ids = [int(qid) for qid in answers.keys()]
        questions = db.query(AptitudeQuestion).filter(AptitudeQuestion.id.in_(q_ids)).all()
        q_dict = {q.id: q for q in questions}

        quant_score = 0
        logical_score = 0
        verbal_score = 0
        total_score = 0
        breakdown = []

        for qid_str, user_ans in answers.items():
            qid = int(qid_str)
            q_obj = q_dict.get(qid)
            if not q_obj:
                continue

            user_choice = (user_ans or "").strip().upper()
            is_correct = (user_choice == q_obj.correct_option)

            if is_correct:
                total_score += 1
                if "Quantitative" in q_obj.category:
                    quant_score += 1
                elif "Logical" in q_obj.category:
                    logical_score += 1
                elif "Verbal" in q_obj.category:
                    verbal_score += 1

            breakdown.append({
                "question_id": q_obj.id,
                "category": q_obj.category,
                "topic": q_obj.topic or q_obj.category,
                "question": q_obj.question,
                "options": [
                    {"key": "A", "text": q_obj.option_a},
                    {"key": "B", "text": q_obj.option_b},
                    {"key": "C", "text": q_obj.option_c},
                    {"key": "D", "text": q_obj.option_d}
                ],
                "user_answer": user_choice,
                "correct_answer": q_obj.correct_option,
                "is_correct": is_correct,
                "explanation": q_obj.explanation,
                "difficulty": q_obj.difficulty
            })

        total = len(breakdown)
        percentage = round((total_score / total) * 100, 1) if total > 0 else 0.0

        if total_score >= 8:
            perf_level = "High Placement Readiness"
        elif total_score >= 5:
            perf_level = "Moderate Placement Readiness"
        else:
            perf_level = "Needs Foundational Improvement"

        attempt = AptitudeAssessmentAttempt(
            student_id=student_id,
            quantitative_score=quant_score,
            logical_score=logical_score,
            verbal_score=verbal_score,
            score=total_score,
            total_questions=total,
            percentage=percentage,
            performance_level=perf_level,
            difficulty="Mixed",
            question_ids=json.dumps(q_ids),
            answers_json=json.dumps(answers)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        return jsonify({
            "success": True,
            "attempt_id": attempt.id,
            "score": total_score,
            "total_questions": total,
            "percentage": percentage,
            "performance_level": perf_level,
            "quantitative_score": quant_score,
            "logical_score": logical_score,
            "verbal_score": verbal_score,
            "breakdown": breakdown,
            "completed_at": attempt.completed_at.isoformat()
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@assessments_bp.route("/aptitude/history/<student_id>", methods=["GET"])
def get_aptitude_history(student_id):
    """Returns past aptitude test attempts for a student."""
    db = SessionLocal()
    try:
        attempts = db.query(AptitudeAssessmentAttempt).filter(
            AptitudeAssessmentAttempt.student_id == student_id
        ).order_by(AptitudeAssessmentAttempt.completed_at.desc()).all()

        return jsonify({
            "success": True,
            "data": [a.to_dict() for a in attempts],
            "total": len(attempts)
        })
    finally:
        db.close()
