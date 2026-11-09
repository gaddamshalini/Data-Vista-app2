from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from database import SessionLocal
from models import Internship, InternshipSkill, Skill, Student

internships_bp = Blueprint("internships", __name__, url_prefix="/api/internships")

def calculate_internship_quality_score(internship: Internship) -> dict:
    """
    Calculates a transparent Internship Quality Score out of 100 based on:
    1. Stipend Competitiveness (max 25 pts) - Higher stipend relative to market
    2. Company Rating & Tier (max 20 pts) - Rating (3.0-5.0) scaled
    3. Duration Adequacy (max 15 pts) - 3-6 months is ideal for learning & PPO
    4. Certificate Provided (max 15 pts) - Formal recognized certification
    5. Work Mode Flexibility (max 15 pts) - Hybrid/Remote flexibility
    6. Skill Enrichment (max 10 pts) - Multiple industry-relevant skills demanded
    """
    factors = {}

    # 1. Stipend score (0 to 25)
    # Market average is ~22k. 35k+ gets 25 pts.
    stipend = float(internship.stipend or 0)
    stipend_score = min(25.0, max(5.0, (stipend / 40000.0) * 25.0))
    factors["stipend"] = {
        "score": round(stipend_score, 1),
        "max": 25,
        "detail": f"Rs. {int(stipend):,}/month stipend compensation."
    }

    # 2. Company Rating (0 to 20)
    rating = float(internship.company_rating or 4.0)
    rating_score = (rating / 5.0) * 20.0
    factors["company_rating"] = {
        "score": round(rating_score, 1),
        "max": 20,
        "detail": f"Company Glassdoor/Employer rating: {rating}/5.0."
    }

    # 3. Duration Adequacy (0 to 15)
    dur = internship.duration_months or 3
    if dur in [3, 4, 6]:
        dur_score = 15.0
        dur_detail = f"{dur} months provides optimal depth for real-world capstone projects and pre-placement evaluations."
    elif dur == 2:
        dur_score = 10.0
        dur_detail = "2 months summer/winter tenure."
    else:
        dur_score = 8.0
        dur_detail = f"{dur} month duration."
    factors["duration"] = {
        "score": round(dur_score, 1),
        "max": 15,
        "detail": dur_detail
    }

    # 4. Certificate Provided (0 to 15)
    cert_score = 15.0 if internship.certificate_provided else 5.0
    factors["certificate"] = {
        "score": cert_score,
        "max": 15,
        "detail": "Verified industry experience certificate provided." if internship.certificate_provided else "Certificate not explicitly specified."
    }

    # 5. Work Mode Flexibility (0 to 15)
    mode = internship.work_mode
    if mode == "Hybrid":
        mode_score = 15.0
        mode_detail = "Hybrid mode combines in-person teamwork with remote flexibility."
    elif mode == "Remote":
        mode_score = 14.0
        mode_detail = "100% Remote flexibility eliminates relocation hurdles."
    else:
        mode_score = 11.0
        mode_detail = "On-site presence at engineering office."
    factors["work_mode"] = {
        "score": mode_score,
        "max": 15,
        "detail": mode_detail
    }

    # 6. Skill Enrichment (0 to 10)
    skill_count = len(internship.skills)
    skill_score = min(10.0, max(4.0, skill_count * 2.5))
    factors["skill_breadth"] = {
        "score": round(skill_score, 1),
        "max": 10,
        "detail": f"{skill_count} relevant technical skills practiced."
    }

    total_score = int(round(stipend_score + rating_score + dur_score + cert_score + mode_score + skill_score))
    total_score = max(35, min(98, total_score))

    return {
        "quality_score": total_score,
        "grade": "Tier 1 Excellent" if total_score >= 85 else ("Tier 2 Very Good" if total_score >= 70 else "Tier 3 Standard"),
        "factors": factors
    }

@internships_bp.route("/analytics", methods=["GET"])
def get_internship_analytics():
    """
    Internship Analytics:
    - Average stipend, Highest stipend
    - Most common roles
    - Demanded internship skills
    - Location-wise internships
    - Remote vs on-site breakdown
    - Company-wise availability
    """
    db = SessionLocal()
    try:
        internships = db.query(Internship).all()
        if not internships:
            return jsonify({"success": True, "data": {}})

        data = [i.to_dict() for i in internships]
        df = pd.DataFrame(data)

        avg_stipend = round(float(df["stipend"].mean()), 2)
        highest_stipend = round(float(df["stipend"].max()), 2)

        # Most common roles
        role_counts = df["title"].value_counts().head(8).reset_index()
        role_counts.columns = ["role", "count"]
        top_roles = role_counts.to_dict(orient="records")

        # Demanded skills
        all_skills = []
        for i in internships:
            for s in i.skills:
                if s.skill:
                    all_skills.append(s.skill.name)
        skill_counts = pd.Series(all_skills).value_counts().head(10).reset_index()
        skill_counts.columns = ["skill", "count"]
        demanded_skills = skill_counts.to_dict(orient="records")

        # Location-wise
        loc_counts = df["location"].value_counts().reset_index()
        loc_counts.columns = ["location", "count"]
        location_wise = loc_counts.to_dict(orient="records")

        # Work Mode breakdown (Remote vs On-site vs Hybrid)
        mode_counts = df["work_mode"].value_counts().reset_index()
        mode_counts.columns = ["work_mode", "count"]
        work_mode_breakdown = mode_counts.to_dict(orient="records")

        # Company-wise availability
        comp_counts = df["company"].value_counts().head(10).reset_index()
        comp_counts.columns = ["company", "openings"]
        company_wise = comp_counts.to_dict(orient="records")

        # Duration distribution
        dur_counts = df["duration_months"].value_counts().reset_index()
        dur_counts.columns = ["duration_months", "count"]
        duration_distribution = dur_counts.sort_values("duration_months").to_dict(orient="records")

        return jsonify({
            "success": True,
            "data_origin": "Demo/Synthetic Data (Realistic Internship Intelligence)",
            "summary": {
                "total_internships": len(df),
                "avg_stipend": avg_stipend,
                "highest_stipend": highest_stipend,
                "companies_offering": int(df["company"].nunique()),
                "remote_percentage": round(float((df["work_mode"] == "Remote").mean() * 100), 1)
            },
            "top_roles": top_roles,
            "demanded_skills": demanded_skills,
            "location_wise": location_wise,
            "work_mode_breakdown": work_mode_breakdown,
            "company_wise": company_wise,
            "duration_distribution": duration_distribution
        })
    finally:
        db.close()

@internships_bp.route("/match", methods=["GET"])
def get_personalized_internship_matching():
    """
    Personalized Internship Matching & Quality Scores:
    Uses the student's saved profile automatically (does NOT ask for skills again).
    Calculates:
    - Match Percentage (based on student skills vs internship required skills)
    - Internship Quality Score (out of 100)
    - Matched vs Missing skills
    - Filters by work_mode, min_stipend, location
    """
    student_id = request.args.get("student_id")
    work_mode_filter = request.args.get("work_mode")
    min_stipend = request.args.get("min_stipend", type=float)
    location_filter = request.args.get("location")

    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": f"Student '{student_id}' not found"}), 404

        student_skills = {s.skill.name.lower() for s in student.skills if s.skill}

        query = db.query(Internship)
        if work_mode_filter and work_mode_filter != "All":
            query = query.filter(Internship.work_mode == work_mode_filter)
        if min_stipend is not None:
            query = query.filter(Internship.stipend >= min_stipend)
        if location_filter and location_filter != "All":
            query = query.filter(Internship.location == location_filter)

        internships = query.all()
        matched_results = []

        for item in internships:
            req_skill_names = [s.skill.name for s in item.skills if s.skill]
            matched_skills = [s for s in req_skill_names if s.lower() in student_skills]
            missing_skills = [s for s in req_skill_names if s.lower() not in student_skills]

            # Calculate Match %
            if req_skill_names:
                match_pct = int(round((len(matched_skills) / len(req_skill_names)) * 100))
            else:
                match_pct = 50

            # Quality Score calculation
            quality_data = calculate_internship_quality_score(item)

            matched_results.append({
                "id": item.id,
                "title": item.title,
                "company": item.company,
                "location": item.location,
                "stipend": item.stipend,
                "duration_months": item.duration_months,
                "work_mode": item.work_mode,
                "internship_type": item.internship_type,
                "certificate_provided": item.certificate_provided,
                "company_rating": item.company_rating,
                "description": item.description,
                "required_skills": req_skill_names,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "match_percentage": match_pct,
                "quality_score": quality_data["quality_score"],
                "quality_grade": quality_data["grade"],
                "quality_factors": quality_data["factors"]
            })

        # Sort primarily by match percentage, secondarily by quality score
        matched_results = sorted(
            matched_results,
            key=lambda x: (x["match_percentage"], x["quality_score"]),
            reverse=True
        )

        return jsonify({
            "success": True,
            "student_id": student.student_id,
            "student_name": student.name,
            "total_internships_evaluated": len(matched_results),
            "top_internships": matched_results
        })
    finally:
        db.close()
