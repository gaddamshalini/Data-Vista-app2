from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import Student, Career, CareerSkill, Skill
from query_helpers import student_full_load, career_with_skills

careers_bp = Blueprint("careers", __name__, url_prefix="/api/careers")

@careers_bp.route("", methods=["GET"])
def list_careers():
    """List all available career pathways."""
    db = SessionLocal()
    try:
        careers = db.query(Career).options(*career_with_skills()).all()
        return jsonify({
            "success": True,
            "data": [c.to_dict() for c in careers]
        })
    finally:
        db.close()

@careers_bp.route("/recommendations", methods=["GET"])
def get_career_recommendations():
    """
    Career Recommendation Module:
    Calculates suitability % for each career using student's:
    - Skills (and weights)
    - CGPA
    - Projects
    - Certifications
    - Internship experience
    - Preferred career bonus
    Provides clear 'Why Recommended' explanations.
    """
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    db = SessionLocal()
    try:
        student = db.query(Student).options(*student_full_load()).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": f"Student '{student_id}' not found"}), 404

        careers = db.query(Career).options(*career_with_skills()).all()
        student_skills = {s.skill.name.lower() for s in student.skills if s.skill}
        student_projects = student.projects
        student_certs = [c.certification.name.lower() for c in student.certifications if c.certification]
        num_internships = getattr(student, "num_internships", 0) or len(student.internships)
        exp_status = getattr(student, "experience_status", "Fresher") or "Fresher"
        exp_years = float(getattr(student, "experience_years", 0.0) or 0.0)
        cgpa = student.cgpa

        recommendations = []

        for c in careers:
            # 1. Skill Match Weighting
            req_skills = c.skills
            total_weight = sum(cs.importance_weight for cs in req_skills) if req_skills else 1.0
            matched_weight = 0.0
            matched_skill_names = []
            missing_skill_names = []

            for cs in req_skills:
                if cs.skill:
                    s_name = cs.skill.name
                    if s_name.lower() in student_skills:
                        matched_weight += cs.importance_weight
                        matched_skill_names.append(s_name)
                    else:
                        missing_skill_names.append(s_name)

            skill_score = (matched_weight / total_weight) * 60.0  # max 60 points

            # 2. CGPA Score (max 15 points)
            cgpa_score = min(15.0, max(5.0, (cgpa / 10.0) * 15.0))

            # 3. Project Relevance Score (max 10 points)
            project_bonus = 0.0
            domain_keyword = c.domain.lower()
            career_title_lower = c.title.lower()
            relevant_projects = []
            for p in student_projects:
                p_text = f"{p.title} {p.domain} {p.technologies}".lower()
                if (domain_keyword in p_text or
                    any(s.lower() in p_text for s in matched_skill_names) or
                    career_title_lower in p_text):
                    project_bonus += 4.0
                    relevant_projects.append(p.title)
            project_score = min(10.0, project_bonus if student_projects else 0.0)

            # 4. Certifications & Internship / Experience Score (max 10 points)
            cert_bonus = min(5.0, len(student_certs) * 2.5)
            intern_bonus = min(5.0, num_internships * 2.5 + (exp_years * 1.5 if exp_status == "Experienced" else 0.0))
            practical_score = cert_bonus + intern_bonus

            # 5. Preferred Career Alignment Bonus (max 5 points)
            pref_bonus = 5.0 if student.preferred_career.lower() == c.title.lower() else 0.0

            # Total suitability score
            total_suitability = skill_score + cgpa_score + project_score + practical_score + pref_bonus
            total_suitability = max(10, min(97, int(round(total_suitability))))

            # Formulate 'Why Recommended' explanation
            reasons = []
            if matched_skill_names:
                reasons.append(f"Strong match because you have {', '.join(matched_skill_names[:3])} skills.")
            if relevant_projects:
                reasons.append(f"Your project '{relevant_projects[0]}' demonstrates direct hands-on domain experience.")
            if pref_bonus > 0:
                reasons.append("Aligns with your explicitly stated preferred career goal.")
            if num_internships > 0 and total_suitability >= 65:
                reasons.append(f"Your {num_internships} completed internship(s) give you a competitive advantage.")
            if exp_status == "Experienced" and exp_years > 0:
                reasons.append(f"Your {exp_years} years of professional experience strengthen your profile.")
            if not reasons:
                reasons.append(f"Good entry-level foundation with {len(matched_skill_names)} overlapping technical skill(s).")

            recommendations.append({
                "career_id": c.id,
                "title": c.title,
                "domain": c.domain,
                "suitability_percentage": total_suitability,
                "avg_salary_lpa": c.avg_salary_lpa,
                "market_growth_pct": c.market_growth_pct,
                "matched_skills": matched_skill_names,
                "missing_skills": missing_skill_names,
                "explanation": " ".join(reasons),
                "is_preferred": (student.preferred_career.lower() == c.title.lower())
            })

        # Sort descending by suitability percentage
        recommendations = sorted(recommendations, key=lambda x: x["suitability_percentage"], reverse=True)

        return jsonify({
            "success": True,
            "student_id": student.student_id,
            "student_name": student.name,
            "top_recommendations": recommendations
        })
    finally:
        db.close()

@careers_bp.route("/skill-gap", methods=["GET"])
def get_skill_gap():
    """
    Skill Gap Analyzer:
    Compares student's skills vs required skills for selected career/job.
    Returns:
    - Matched Skills
    - Missing Skills
    - Skill Gap Percentage
    - Priority Skills to learn (ranked by job-market demand)
    """
    student_id = request.args.get("student_id")
    career_id = request.args.get("career_id", type=int)
    role_query = (request.args.get("role") or request.args.get("career_role") or request.args.get("target_role") or "").strip()

    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    db = SessionLocal()
    try:
        student = db.query(Student).options(*student_full_load()).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": f"Student '{student_id}' not found"}), 404

        career = None

        # 1. If explicit role query provided, search in DB first
        if role_query:
            # Exact or substring match in DB
            career = db.query(Career).options(*career_with_skills()).filter(Career.title.ilike(role_query)).first()
            if not career:
                career = db.query(Career).options(*career_with_skills()).filter(Career.title.ilike(f"%{role_query}%")).first()

        # 2. If career_id provided
        if not career and career_id:
            career = db.query(Career).options(*career_with_skills()).filter(Career.id == career_id).first()

        # 3. Default to student's preferred career or first career
        if not career and not role_query:
            if student.preferred_career:
                career = db.query(Career).options(*career_with_skills()).filter(Career.title.ilike(student.preferred_career)).first()
            if not career:
                career = db.query(Career).options(*career_with_skills()).first()

        student_skills = {s.skill.name.lower(): s.skill for s in student.skills if s.skill}

        # If career found in DB, use its CareerSkill associations
        if career:
            career_dict = career.to_dict()
            required_skills_data = []
            for cs in career.skills:
                if cs.skill:
                    required_skills_data.append({
                        "name": cs.skill.name,
                        "category": cs.skill.category,
                        "demand_index": cs.skill.demand_index,
                        "importance_weight": cs.importance_weight
                    })
        else:
            # Custom user-typed role! Dynamically synthesize industry required skills
            custom_title = role_query or "Custom Target Role"
            r_lower = custom_title.lower()

            # Map common keywords to required skill profiles
            role_mappings = [
                (["python", "django", "flask"], [
                    ("Python", "Programming", 96.0, 2.0),
                    ("SQL", "Database", 94.0, 1.8),
                    ("GitHub", "Tools", 90.0, 1.5),
                    ("Django/Flask", "Web Backend", 86.0, 1.5),
                    ("Problem Solving", "Soft Skills", 90.0, 1.3),
                    ("REST API", "Web Backend", 88.0, 1.4),
                    ("PostgreSQL", "Database", 87.0, 1.2)
                ]),
                (["full stack", "fsd", "web developer", "mern", "mean"], [
                    ("Full Stack Development (FSD)", "Web Development", 95.0, 2.0),
                    ("React", "Web Framework", 91.0, 1.8),
                    ("JavaScript", "Programming", 92.0, 1.8),
                    ("Node.js", "Web Backend", 88.0, 1.7),
                    ("SQL", "Database", 94.0, 1.5),
                    ("HTML/CSS", "Web Development", 85.0, 1.3),
                    ("GitHub", "Tools", 90.0, 1.4)
                ]),
                (["frontend", "front-end", "react", "ui developer"], [
                    ("React", "Web Framework", 91.0, 2.0),
                    ("JavaScript", "Programming", 92.0, 1.9),
                    ("TypeScript", "Programming", 89.0, 1.6),
                    ("HTML/CSS", "Web Development", 85.0, 1.5),
                    ("GitHub", "Tools", 90.0, 1.4),
                    ("UI/UX Design", "Design", 80.0, 1.2)
                ]),
                (["backend", "back-end", "api developer"], [
                    ("Python", "Programming", 96.0, 1.8),
                    ("Java", "Programming", 90.0, 1.8),
                    ("SQL", "Database", 94.0, 1.9),
                    ("Node.js", "Web Backend", 88.0, 1.6),
                    ("PostgreSQL", "Database", 87.0, 1.5),
                    ("Docker", "DevOps", 86.0, 1.4),
                    ("GitHub", "Tools", 90.0, 1.3)
                ]),
                (["machine learning", "ml", "ai", "artificial intelligence", "deep learning"], [
                    ("Python", "Programming", 96.0, 2.0),
                    ("Scikit-learn", "Machine Learning", 88.0, 1.8),
                    ("Pandas", "Data Analytics", 90.0, 1.7),
                    ("NumPy", "Data Analytics", 86.0, 1.6),
                    ("Statistics", "Core Analytics", 85.0, 1.7),
                    ("SQL", "Database", 94.0, 1.4),
                    ("Deep Learning", "Machine Learning", 87.0, 1.5)
                ]),
                (["data analyst", "business analyst", "bi developer", "power bi", "tableau"], [
                    ("SQL", "Database", 94.0, 2.0),
                    ("Power BI", "Data Analytics", 88.0, 1.8),
                    ("Python", "Programming", 96.0, 1.7),
                    ("Advanced Excel", "Tools", 84.0, 1.6),
                    ("Statistics", "Core Analytics", 85.0, 1.5),
                    ("Pandas", "Data Analytics", 90.0, 1.5),
                    ("Problem Solving", "Soft Skills", 90.0, 1.3)
                ]),
                (["devops", "cloud", "sre", "aws", "azure"], [
                    ("AWS", "Cloud", 92.0, 2.0),
                    ("Docker", "DevOps", 86.0, 1.8),
                    ("Kubernetes", "DevOps", 88.0, 1.7),
                    ("Linux", "Operating Systems", 85.0, 1.6),
                    ("GitHub", "Tools", 90.0, 1.5),
                    ("Python", "Programming", 96.0, 1.4)
                ]),
                (["java", "spring boot"], [
                    ("Java", "Programming", 90.0, 2.0),
                    ("Spring Boot", "Web Backend", 85.0, 1.8),
                    ("SQL", "Database", 94.0, 1.7),
                    ("GitHub", "Tools", 90.0, 1.5),
                    ("Problem Solving", "Soft Skills", 90.0, 1.3),
                    ("REST API", "Web Backend", 88.0, 1.4)
                ]),
                (["c developer", "c++", "embedded", "systems"], [
                    ("C", "Programming", 82.0, 2.0),
                    ("C++", "Programming", 80.0, 1.8),
                    ("Linux", "Operating Systems", 85.0, 1.7),
                    ("Data Structures & Algorithms", "Core CS", 92.0, 1.9),
                    ("Problem Solving", "Soft Skills", 90.0, 1.5),
                    ("GitHub", "Tools", 90.0, 1.3)
                ])
            ]

            selected_reqs = None
            for keywords, reqs in role_mappings:
                if any(kw in r_lower for kw in keywords):
                    selected_reqs = reqs
                    break

            if not selected_reqs:
                # Default dynamic requirement profile
                selected_reqs = [
                    ("Python", "Programming", 96.0, 1.8),
                    ("SQL", "Database", 94.0, 1.8),
                    ("GitHub", "Tools", 90.0, 1.5),
                    ("Problem Solving", "Soft Skills", 90.0, 1.4),
                    ("Data Structures & Algorithms", "Core CS", 92.0, 1.6)
                ]

            required_skills_data = [
                {"name": s[0], "category": s[1], "demand_index": s[2], "importance_weight": s[3]}
                for s in selected_reqs
            ]

            career_dict = {
                "id": 0,
                "title": custom_title,
                "domain": "Target Industry Role",
                "description": f"Role competencies and skill prerequisites for {custom_title}.",
                "avg_salary_lpa": 8.5,
                "market_growth_pct": 16.5,
                "min_cgpa": 7.0,
                "skills": [s["name"] for s in required_skills_data]
            }

        matched = []
        missing = []

        for req in required_skills_data:
            s_name = req["name"]
            if s_name.lower() in student_skills:
                matched.append({
                    "name": s_name,
                    "category": req["category"],
                    "demand_index": req["demand_index"]
                })
            else:
                missing.append({
                    "name": s_name,
                    "category": req["category"],
                    "demand_index": req["demand_index"],
                    "importance_weight": req.get("importance_weight", 1.0)
                })

        total_required = len(matched) + len(missing)
        matched_count = len(matched)
        missing_count = len(missing)

        if total_required > 0:
            gap_percentage = round((missing_count / total_required) * 100, 1)
        else:
            gap_percentage = 0.0

        # Rank missing skills by priority based on job-market demand and importance weight
        missing_sorted = sorted(
            missing,
            key=lambda x: (x["importance_weight"] * 50 + x["demand_index"]),
            reverse=True
        )

        priority_skills = []
        for rank, item in enumerate(missing_sorted, 1):
            priority_skills.append({
                "rank": rank,
                "name": item["name"],
                "category": item["category"],
                "demand_index": item["demand_index"],
                "urgency": "High" if rank <= 2 else ("Medium" if rank <= 4 else "Low")
            })

        return jsonify({
            "success": True,
            "career": career_dict,
            "total_matched": matched_count,
            "total_missing": missing_count,
            "total_required": total_required,
            "skill_gap_percentage": gap_percentage,
            "match_ratio": f"{matched_count}/{total_required}",
            "matched_skills": [m["name"] for m in matched],
            "missing_skills": [m["name"] for m in missing],
            "priority_skills_to_learn": priority_skills
        })
    finally:
        db.close()

@careers_bp.route("/roadmap", methods=["GET"])
def get_career_roadmap():
    """
    Personalized Career Roadmap:
    Generates tailored, step-by-step phased roadmap towards the target career
    factoring in current skills and missing skill gaps.
    """
    student_id = request.args.get("student_id")
    career_id = request.args.get("career_id", type=int)

    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": "Student not found"}), 404

        career = None
        if career_id:
            career = db.query(Career).filter(Career.id == career_id).first()
        if not career and student.preferred_career:
            career = db.query(Career).filter(Career.title.ilike(student.preferred_career)).first()
        if not career:
            career = db.query(Career).first()

        student_skills = {s.skill.name.lower() for s in student.skills if s.skill}
        missing_skills = [
            cs.skill.name for cs in career.skills
            if cs.skill and cs.skill.name.lower() not in student_skills
        ]

        steps = []
        step_num = 1

        # Phase 1: Foundational Skill Upgrades
        foundational_missing = [s for s in missing_skills if s in ["Excel", "SQL", "Statistics", "HTML/CSS", "Python"]]
        if foundational_missing:
            steps.append({
                "step": step_num,
                "phase": "Foundation & Core Tools",
                "title": f"Master {', '.join(foundational_missing)}",
                "description": f"Build solid proficiency in foundational tools ({', '.join(foundational_missing)}) using guided tutorials and practice problem sets.",
                "duration": "2 - 4 Weeks",
                "status": "In Progress"
            })
            step_num += 1

        # Phase 2: Advanced Technical Stack & Frameworks
        advanced_missing = [s for s in missing_skills if s not in foundational_missing]
        if advanced_missing:
            for s in advanced_missing[:3]:
                steps.append({
                    "step": step_num,
                    "phase": "Specialized Competency",
                    "title": f"Learn {s}",
                    "description": f"Acquire practical industry skills in {s}. Focus on end-to-end implementations and best practices.",
                    "duration": "3 - 5 Weeks",
                    "status": "Upcoming"
                })
                step_num += 1

        # Phase 3: Project Building
        steps.append({
            "step": step_num,
            "phase": "Practical Portfolio",
            "title": f"Build 1-2 End-to-End {career.title} Capstone Projects",
            "description": f"Develop production-ready projects in {career.domain} integrating your skills ({', '.join([s.skill.name for s in student.skills[:3] if s.skill])}). Deploy to GitHub with comprehensive documentation.",
            "duration": "4 Weeks",
            "status": "Upcoming"
        })
        step_num += 1

        # Phase 4: Internship Applications
        steps.append({
            "step": step_num,
            "phase": "Industry Experience",
            "title": "Apply for Targeted Internships",
            "description": f"Leverage your matched skill profile to apply for {career.title} internships. Target high-quality roles offering mentorship and PPO prospects.",
            "duration": "Ongoing",
            "status": "Upcoming"
        })
        step_num += 1

        # Phase 5: Placement & Mock Interview Preparation
        steps.append({
            "step": step_num,
            "phase": "Placement Readiness",
            "title": "Aptitude Drills & Technical Mock Interviews",
            "description": "Practice quantitative aptitude, system design/case studies, and behavioural HR questions to achieve placement-ready benchmark.",
            "duration": "3 Weeks",
            "status": "Upcoming"
        })

        return jsonify({
            "success": True,
            "target_career": career.title,
            "domain": career.domain,
            "total_steps": len(steps),
            "roadmap_steps": steps
        })
    finally:
        db.close()
