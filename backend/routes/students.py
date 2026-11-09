from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import (
    Student, Skill, StudentSkill, Certification, StudentCertification,
    Project, StudentInternship, Career
)

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

@students_bp.route("", methods=["GET"])
def list_students():
    """List all students for quick selection."""
    db = SessionLocal()
    try:
        students = db.query(Student).order_by(Student.id.desc()).all()
        return jsonify({
            "success": True,
            "data": [s.to_dict() for s in students],
            "total": len(students)
        })
    finally:
        db.close()

@students_bp.route("/catalog/options", methods=["GET"])
def get_catalog_options():
    """Returns available skills, certifications, branches, and careers for dropdown selection."""
    db = SessionLocal()
    try:
        skills = db.query(Skill).order_by(Skill.name).all()
        certs = db.query(Certification).order_by(Certification.name).all()
        careers_rows = db.query(Career).order_by(Career.title).all()
        careers = [c.title for c in careers_rows] if careers_rows else [
            "Data Analyst",
            "Business Analyst",
            "Data Scientist",
            "Machine Learning Engineer",
            "Full Stack Developer",
            "Cloud & DevOps Engineer",
            "Software Development Engineer (SDE)"
        ]
        branches = [
            "Computer Science and Engineering (CSE)",
            "CSE (Artificial Intelligence)",
            "CSE (Data Science)",
            "CSE (Cyber Security)",
            "CSE (Technology)",
            "Electrical and Electronics Engineering (EEE)",
            "Mechanical Engineering (Mech)",
            "Electronics and Communication Engineering (ECE)",
            "Civil Engineering (Civil)",
            "CSE (AI & ML)",
            "Other"
        ]
        return jsonify({
            "success": True,
            "skills": [s.to_dict() for s in skills],
            "certifications": [c.to_dict() for c in certs],
            "branches": branches,
            "careers": careers
        })
    finally:
        db.close()

@students_bp.route("/search", methods=["GET"])
def search_students():
    """Search students by ID or Name."""
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"success": True, "data": []})

    db = SessionLocal()
    try:
        results = db.query(Student).filter(
            (Student.student_id.ilike(f"%{query}%")) |
            (Student.name.ilike(f"%{query}%"))
        ).all()
        return jsonify({
            "success": True,
            "data": [s.to_dict() for s in results]
        })
    finally:
        db.close()

@students_bp.route("/<student_id>", methods=["GET"])
def get_student(student_id):
    """Retrieve full student profile by Student ID."""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({
                "success": False,
                "error": f"Student with ID '{student_id}' not found."
            }), 404

        return jsonify({
            "success": True,
            "data": student.to_dict()
        })
    finally:
        db.close()

@students_bp.route("", methods=["POST"])
def register_student():
    """Register a new student profile."""
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id", "").strip().upper()
    name = data.get("name", "").strip()
    branch = data.get("branch", "").strip()

    if not student_id or not name or not branch:
        return jsonify({
            "success": False,
            "error": "Student ID, Name, and Branch are required."
        }), 400

    db = SessionLocal()
    try:
        # Check if student_id already exists
        existing = db.query(Student).filter(Student.student_id == student_id).first()
        if existing:
            return jsonify({
                "success": False,
                "error": f"Student with ID '{student_id}' already exists. Please search or edit this profile."
            }), 409

        # Validate or normalize github url
        github_raw = (data.get("github_profile") or "").strip()
        if github_raw and not (github_raw.startswith("http://") or github_raw.startswith("https://")):
            if "github.com" in github_raw:
                github_raw = f"https://{github_raw}"
            else:
                github_raw = f"https://github.com/{github_raw.lstrip('/')}"

        exp_status = data.get("experience_status", "Fresher")
        exp_years = float(data.get("experience_years", 0.0) or 0.0) if exp_status == "Experienced" else 0.0

        # Educational details parsing
        edu = data.get("education") or {}
        school = edu.get("school") or {}
        inter = edu.get("intermediate") or {}
        degree = edu.get("degree") or {}

        # Certificates parsing
        import json
        certs_input = data.get("certificates") or []
        if not certs_input and "certifications" in data:
            certs_input = [
                {"name": c.strip(), "issuing_org": "External", "completion_date": "2024", "certificate_url": ""}
                for c in data.get("certifications", []) if isinstance(c, str) and c.strip()
            ]

        deg_pct = degree.get("percentage")
        parsed_deg_pct = float(deg_pct) if deg_pct not in (None, "") else None

        pers_email = (data.get("personal_email") or "").strip()
        coll_email = (data.get("college_email") or data.get("email") or "").strip()
        if not pers_email and coll_email:
            pers_email = coll_email
        if not coll_email and pers_email:
            coll_email = pers_email

        student = Student(
            student_id=student_id,
            name=name,
            email=coll_email,
            personal_email=pers_email,
            college_email=coll_email,
            branch=branch,
            year=int(data.get("year", 3)),
            cgpa=float(data.get("cgpa", 7.5)),
            preferred_career=data.get("preferred_career", "Data Analyst"),
            preferred_location=data.get("preferred_location", ""),
            num_internships=int(data.get("num_internships", 0) or 0),
            experience_status=exp_status,
            experience_years=exp_years,
            github_profile=github_raw,
            profile_photo=data.get("profile_photo", ""),
            school_name=school.get("name", ""),
            school_passing_year=int(school.get("year", 2020) or 2020),
            school_percentage=float(school.get("percentage", 0.0) or 0.0),
            intermediate_college_name=inter.get("college_name", ""),
            intermediate_passing_year=int(inter.get("year", 2022) or 2022),
            intermediate_percentage=float(inter.get("percentage", 0.0) or 0.0),
            degree_institute_name=degree.get("institute_name", ""),
            degree_passing_year=int(degree.get("year", 2026) or 2026),
            degree_education_status=degree.get("status", "Pursuing"),
            degree_percentage=parsed_deg_pct,
            certificates_data=json.dumps(certs_input)
        )
        db.add(student)
        db.flush()

        # Link skills
        skills_input = data.get("skills", [])
        for sk_name in skills_input:
            sk_obj = db.query(Skill).filter(Skill.name.ilike(sk_name.strip())).first()
            if not sk_obj:
                sk_obj = Skill(name=sk_name.strip(), category="Custom", demand_index=70.0)
                db.add(sk_obj)
                db.flush()
            db.add(StudentSkill(student_id=student.id, skill_id=sk_obj.id, proficiency="Intermediate"))

        # Link certifications
        for c in certs_input:
            c_name = c.get("name", "").strip() if isinstance(c, dict) else str(c).strip()
            if not c_name:
                continue
            c_org = c.get("issuing_org", "External") if isinstance(c, dict) else "External"
            c_obj = db.query(Certification).filter(Certification.name.ilike(c_name)).first()
            if not c_obj:
                c_obj = Certification(name=c_name, issuing_org=c_org)
                db.add(c_obj)
                db.flush()
            db.add(StudentCertification(student_id=student.id, certification_id=c_obj.id, year_completed=2024))

        # Add projects
        projects_input = data.get("projects", [])
        for p in projects_input:
            db.add(Project(
                student_id=student.id,
                title=p.get("title", "Project"),
                domain=p.get("domain", "General"),
                description=p.get("description", ""),
                technologies=p.get("technologies", "")
            ))

        # Add internships
        internships_input = data.get("internships", [])
        for i in internships_input:
            db.add(StudentInternship(
                student_id=student.id,
                company=i.get("company", "Company"),
                role=i.get("role", "Intern"),
                duration_months=int(i.get("duration_months", 3)),
                stipend=float(i.get("stipend", 15000)),
                work_mode=i.get("work_mode", "Hybrid")
            ))

        db.commit()
        db.refresh(student)
        return jsonify({
            "success": True,
            "message": "Student profile created successfully.",
            "data": student.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@students_bp.route("/<student_id>", methods=["PUT"])
def update_student(student_id):
    """Update student profile details, skills, certifications, projects, internships, scores."""
    data = request.get_json(silent=True) or {}
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({
                "success": False,
                "error": f"Student '{student_id}' not found."
            }), 404

        # Update core fields if provided
        if "name" in data:
            student.name = data["name"].strip()
        if "personal_email" in data:
            student.personal_email = (data["personal_email"] or "").strip()
        if "college_email" in data:
            student.college_email = (data["college_email"] or "").strip()
            student.email = student.college_email
        elif "email" in data:
            student.email = data["email"].strip()
            if not student.college_email:
                student.college_email = student.email
        if "branch" in data:
            student.branch = data["branch"].strip()
        if "year" in data:
            student.year = int(data["year"])
        if "cgpa" in data:
            student.cgpa = float(data["cgpa"])
        if "preferred_career" in data:
            student.preferred_career = data["preferred_career"].strip()
        if "preferred_location" in data:
            student.preferred_location = data["preferred_location"].strip()
        if "num_internships" in data:
            student.num_internships = int(data["num_internships"] or 0)
        if "experience_status" in data:
            student.experience_status = data["experience_status"].strip()
            if student.experience_status != "Experienced":
                student.experience_years = 0.0
        if "experience_years" in data:
            student.experience_years = float(data["experience_years"] or 0.0)
        if "github_profile" in data:
            github_raw = (data["github_profile"] or "").strip()
            if github_raw and not (github_raw.startswith("http://") or github_raw.startswith("https://")):
                if "github.com" in github_raw:
                    github_raw = f"https://{github_raw}"
                else:
                    github_raw = f"https://github.com/{github_raw.lstrip('/')}"
            student.github_profile = github_raw

        if "profile_photo" in data:
            student.profile_photo = data["profile_photo"] or ""

        # Update Education Details
        if "education" in data and isinstance(data["education"], dict):
            edu = data["education"]
            school = edu.get("school") or {}
            inter = edu.get("intermediate") or {}
            degree = edu.get("degree") or {}

            if "name" in school:
                student.school_name = school.get("name") or ""
            if "year" in school and school.get("year"):
                student.school_passing_year = int(school.get("year"))
            if "percentage" in school and school.get("percentage") not in (None, ""):
                student.school_percentage = float(school.get("percentage"))

            if "college_name" in inter:
                student.intermediate_college_name = inter.get("college_name") or ""
            if "year" in inter and inter.get("year"):
                student.intermediate_passing_year = int(inter.get("year"))
            if "percentage" in inter and inter.get("percentage") not in (None, ""):
                student.intermediate_percentage = float(inter.get("percentage"))

            if "institute_name" in degree:
                student.degree_institute_name = degree.get("institute_name") or ""
            if "year" in degree and degree.get("year"):
                student.degree_passing_year = int(degree.get("year"))
            if "status" in degree:
                student.degree_education_status = degree.get("status") or "Pursuing"
            if "percentage" in degree:
                deg_pct = degree.get("percentage")
                student.degree_percentage = float(deg_pct) if deg_pct not in (None, "") else None

        # Update Certificates
        if "certificates" in data:
            import json
            certs_in = data["certificates"] or []
            student.certificates_data = json.dumps(certs_in)
            # Sync with student_certifications for backward compatibility
            db.query(StudentCertification).filter(StudentCertification.student_id == student.id).delete()
            for c in certs_in:
                c_name = c.get("name", "").strip() if isinstance(c, dict) else str(c).strip()
                if not c_name:
                    continue
                c_org = c.get("issuing_org", "Certified") if isinstance(c, dict) else "Certified"
                c_obj = db.query(Certification).filter(Certification.name.ilike(c_name)).first()
                if not c_obj:
                    c_obj = Certification(name=c_name, issuing_org=c_org)
                    db.add(c_obj)
                    db.flush()
                db.add(StudentCertification(student_id=student.id, certification_id=c_obj.id, year_completed=2024))
        elif "certifications" in data:
            import json
            db.query(StudentCertification).filter(StudentCertification.student_id == student.id).delete()
            certs_in = []
            for c_name in data["certifications"]:
                clean_name = str(c_name).strip()
                if not clean_name:
                    continue
                certs_in.append({"name": clean_name, "issuing_org": "External", "completion_date": "2024", "certificate_url": ""})
                c_obj = db.query(Certification).filter(Certification.name.ilike(clean_name)).first()
                if not c_obj:
                    c_obj = Certification(name=clean_name, issuing_org="External")
                    db.add(c_obj)
                    db.flush()
                db.add(StudentCertification(student_id=student.id, certification_id=c_obj.id, year_completed=2024))
            student.certificates_data = json.dumps(certs_in)

        # Update Skills
        if "skills" in data:
            db.query(StudentSkill).filter(StudentSkill.student_id == student.id).delete()
            for sk_name in data["skills"]:
                sk_obj = db.query(Skill).filter(Skill.name.ilike(sk_name.strip())).first()
                if not sk_obj:
                    sk_obj = Skill(name=sk_name.strip(), category="Custom", demand_index=70.0)
                    db.add(sk_obj)
                    db.flush()
                db.add(StudentSkill(student_id=student.id, skill_id=sk_obj.id, proficiency="Intermediate"))

        # Update Projects
        if "projects" in data:
            db.query(Project).filter(Project.student_id == student.id).delete()
            for p in data["projects"]:
                db.add(Project(
                    student_id=student.id,
                    title=p.get("title", "Project"),
                    domain=p.get("domain", "General"),
                    description=p.get("description", ""),
                    technologies=p.get("technologies", "")
                ))

        # Update Internships
        if "internships" in data:
            db.query(StudentInternship).filter(StudentInternship.student_id == student.id).delete()
            for i in data["internships"]:
                db.add(StudentInternship(
                    student_id=student.id,
                    company=i.get("company", "Company"),
                    role=i.get("role", "Intern"),
                    duration_months=int(i.get("duration_months", 3)),
                    stipend=float(i.get("stipend", 15000)),
                    work_mode=i.get("work_mode", "Hybrid")
                ))

        db.commit()
        db.refresh(student)

        return jsonify({
            "success": True,
            "message": "Student profile updated successfully.",
            "data": student.to_dict()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@students_bp.route("/github-repos", methods=["GET"])
@students_bp.route("/<student_id>/github-repos", methods=["GET"])
def get_github_repos(student_id=None):
    """
    Fetch public repositories from GitHub for the student's saved profile or queried username.
    """
    import requests
    target_username = (request.args.get("username") or "").strip()
    profile_url = (request.args.get("url") or "").strip()

    if not target_username and student_id:
        db = SessionLocal()
        try:
            student = db.query(Student).filter(Student.student_id == student_id).first()
            if student and student.github_profile:
                profile_url = student.github_profile
        finally:
            db.close()

    if profile_url and not target_username:
        clean = profile_url.strip().rstrip("/")
        if "github.com/" in clean:
            target_username = clean.split("github.com/")[-1].strip().split("/")[0]
        elif "/" in clean:
            target_username = clean.split("/")[-1].strip()
        else:
            target_username = clean

    if not target_username:
        return jsonify({
            "success": False,
            "error": "No GitHub username or profile link provided.",
            "repos": []
        }), 400

    try:
        url = f"https://api.github.com/users/{target_username}/repos?sort=updated&per_page=30"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DATA-VISTA-Platform"
        }
        try:
            res = requests.get(url, headers=headers, timeout=8)
        except requests.exceptions.SSLError:
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            res = requests.get(url, headers=headers, timeout=8, verify=False)
        
        if res.status_code == 200:
            repos_raw = res.json()
            repos = []
            for r in repos_raw:
                if not isinstance(r, dict):
                    continue
                techs = []
                if r.get("language"):
                    techs.append(r["language"])
                for top in (r.get("topics") or []):
                    if top not in techs:
                        techs.append(top)
                
                tech_str = ", ".join(techs) if techs else "General"
                repos.append({
                    "name": r.get("name", "Project"),
                    "title": r.get("name", "Project").replace("-", " ").replace("_", " ").title(),
                    "description": r.get("description") or f"Public GitHub repository: {r.get('name')}",
                    "technologies": tech_str,
                    "html_url": r.get("html_url", f"https://github.com/{target_username}/{r.get('name', '')}"),
                    "stars": r.get("stargazers_count", 0),
                    "is_fork": r.get("fork", False),
                    "updated_at": r.get("updated_at")
                })
            return jsonify({
                "success": True,
                "username": target_username,
                "count": len(repos),
                "repos": repos
            })
        elif res.status_code == 404:
            return jsonify({
                "success": False,
                "error": f"GitHub user '{target_username}' not found. Please verify the profile link.",
                "repos": []
            }), 404
        elif res.status_code == 403:
            return jsonify({
                "success": False,
                "error": "GitHub API rate limit reached. You can add projects manually or retry later.",
                "repos": []
            }), 403
        else:
            return jsonify({
                "success": False,
                "error": f"GitHub API returned status {res.status_code}",
                "repos": []
            }), res.status_code
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Unable to fetch GitHub repositories at this time: {str(e)}",
            "repos": []
        }), 200
