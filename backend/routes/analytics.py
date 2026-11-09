from flask import Blueprint, request, jsonify
from sqlalchemy import func
import numpy as np
import pandas as pd
from database import SessionLocal
from models import PlacementRecord, Job, JobSkill, Skill

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/placement", methods=["GET"])
def get_placement_analytics():
    """
    Placement Analytics with interactive filtering:
    Branch, Year, min_cgpa, max_cgpa, company
    """
    branch_filter = request.args.get("branch")
    year_filter = request.args.get("year")
    min_cgpa = request.args.get("min_cgpa", type=float)
    max_cgpa = request.args.get("max_cgpa", type=float)
    company_filter = request.args.get("company")

    db = SessionLocal()
    try:
        query = db.query(PlacementRecord)

        if branch_filter and branch_filter != "All":
            query = query.filter(PlacementRecord.branch == branch_filter)
        if year_filter and year_filter != "All":
            query = query.filter(PlacementRecord.year == int(year_filter))
        if min_cgpa is not None:
            query = query.filter(PlacementRecord.cgpa >= min_cgpa)
        if max_cgpa is not None:
            query = query.filter(PlacementRecord.cgpa <= max_cgpa)
        if company_filter and company_filter != "All":
            query = query.filter(PlacementRecord.company == company_filter)

        records = query.all()
        if not records:
            return jsonify({
                "success": True,
                "data_origin": "Demo/Synthetic Data",
                "summary": {
                    "total_students": 0,
                    "placed_count": 0,
                    "placement_rate_pct": 0,
                    "avg_salary_lpa": 0,
                    "highest_salary_lpa": 0
                },
                "department_wise": [],
                "year_wise": [],
                "company_hiring": [],
                "salary_distribution": [],
                "cgpa_vs_placement": [],
                "internship_vs_placement": [],
                "cert_vs_placement": []
            })

        # Process with Pandas for efficient aggregation
        data = [r.to_dict() for r in records]
        df = pd.DataFrame(data)

        total_students = len(df)
        placed_df = df[df["placed"] == 1]
        placed_count = len(placed_df)
        placement_rate = round((placed_count / total_students) * 100, 1) if total_students > 0 else 0.0

        avg_salary = round(float(placed_df["salary_lpa"].mean()), 2) if not placed_df.empty and placed_df["salary_lpa"].notnull().any() else 0.0
        highest_salary = round(float(placed_df["salary_lpa"].max()), 2) if not placed_df.empty and placed_df["salary_lpa"].notnull().any() else 0.0

        # 1. Department-wise placement rate
        dept_group = df.groupby("branch").agg(
            total=("id", "count"),
            placed=("placed", "sum")
        ).reset_index()
        dept_group["placement_pct"] = (dept_group["placed"] / dept_group["total"] * 100).round(1)
        department_wise = dept_group.to_dict(orient="records")

        # 2. Year-wise placement trends
        year_group = df.groupby("year").agg(
            total=("id", "count"),
            placed=("placed", "sum"),
            avg_salary=("salary_lpa", "mean")
        ).reset_index()
        year_group["placement_pct"] = (year_group["placed"] / year_group["total"] * 100).round(1)
        year_group["avg_salary"] = year_group["avg_salary"].fillna(0).round(2)
        year_wise = year_group.sort_values("year").to_dict(orient="records")

        # 3. Company-wise hiring count & average offer
        company_hiring = []
        if not placed_df.empty and placed_df["company"].notnull().any():
            comp_group = placed_df.groupby("company").agg(
                hired=("id", "count"),
                avg_package=("salary_lpa", "mean")
            ).reset_index().sort_values("hired", ascending=False).head(10)
            comp_group["avg_package"] = comp_group["avg_package"].round(2)
            company_hiring = comp_group.to_dict(orient="records")

        # 4. Salary Distribution Bins
        salary_bins = [
            {"range": "3 - 6 LPA", "count": int(((placed_df["salary_lpa"] >= 3) & (placed_df["salary_lpa"] < 6)).sum())},
            {"range": "6 - 10 LPA", "count": int(((placed_df["salary_lpa"] >= 6) & (placed_df["salary_lpa"] < 10)).sum())},
            {"range": "10 - 15 LPA", "count": int(((placed_df["salary_lpa"] >= 10) & (placed_df["salary_lpa"] < 15)).sum())},
            {"range": "15 - 20 LPA", "count": int(((placed_df["salary_lpa"] >= 15) & (placed_df["salary_lpa"] < 20)).sum())},
            {"range": "20+ LPA", "count": int((placed_df["salary_lpa"] >= 20).sum())}
        ] if not placed_df.empty else []

        # 5. CGPA vs Placement
        df["cgpa_bucket"] = pd.cut(
            df["cgpa"],
            bins=[0, 6.5, 7.5, 8.5, 10.0],
            labels=["< 6.5", "6.5 - 7.5", "7.5 - 8.5", "8.5+"]
        )
        cgpa_group = df.groupby("cgpa_bucket", observed=False).agg(
            total=("id", "count"),
            placed=("placed", "sum")
        ).reset_index()
        cgpa_group["placement_pct"] = (cgpa_group["placed"] / cgpa_group["total"] * 100).fillna(0).round(1)
        cgpa_vs_placement = cgpa_group.to_dict(orient="records")

        # 6. Internship vs Placement
        df["internship_bucket"] = df["internship_months"].apply(
            lambda m: "0 Months (None)" if m == 0 else ("1 - 3 Months" if m <= 3 else "4+ Months")
        )
        intern_group = df.groupby("internship_bucket").agg(
            total=("id", "count"),
            placed=("placed", "sum")
        ).reset_index()
        intern_group["placement_pct"] = (intern_group["placed"] / intern_group["total"] * 100).fillna(0).round(1)
        internship_vs_placement = intern_group.to_dict(orient="records")

        # 7. Certification vs Placement
        df["cert_bucket"] = df["num_certifications"].apply(
            lambda c: "0 Certifications" if c == 0 else ("1 - 2 Certifications" if c <= 2 else "3+ Certifications")
        )
        cert_group = df.groupby("cert_bucket").agg(
            total=("id", "count"),
            placed=("placed", "sum")
        ).reset_index()
        cert_group["placement_pct"] = (cert_group["placed"] / cert_group["total"] * 100).fillna(0).round(1)
        cert_vs_placement = cert_group.to_dict(orient="records")

        # Distinct branches & companies for filters
        distinct_branches = sorted(df["branch"].dropna().unique().tolist())
        distinct_years = sorted(df["year"].dropna().unique().tolist())
        distinct_companies = sorted(placed_df["company"].dropna().unique().tolist()) if not placed_df.empty else []

        return jsonify({
            "success": True,
            "data_origin": "Demo/Synthetic Data (Realistic Multi-Feature Placement Benchmark)",
            "summary": {
                "total_students": total_students,
                "placed_count": placed_count,
                "placement_rate_pct": placement_rate,
                "avg_salary_lpa": avg_salary,
                "highest_salary_lpa": highest_salary
            },
            "filters": {
                "branches": distinct_branches,
                "years": distinct_years,
                "companies": distinct_companies
            },
            "department_wise": department_wise,
            "year_wise": year_wise,
            "company_hiring": company_hiring,
            "salary_distribution": salary_bins,
            "cgpa_vs_placement": cgpa_vs_placement,
            "internship_vs_placement": internship_vs_placement,
            "cert_vs_placement": cert_vs_placement
        })
    finally:
        db.close()

@analytics_bp.route("/jobs", methods=["GET"])
def get_job_market_analytics():
    """
    Job Market Analytics:
    - Most demanded roles
    - Top required skills
    - Salary by role
    - Salary by skill
    - Location demand
    - Company demand
    - Experience requirements
    """
    db = SessionLocal()
    try:
        jobs = db.query(Job).all()
        if not jobs:
            return jsonify({"success": True, "data": {}})

        records = [j.to_dict() for j in jobs]
        df = pd.DataFrame(records)

        # 1. Most Demanded Roles
        role_counts = df["title"].value_counts().head(8).reset_index()
        role_counts.columns = ["role", "count"]
        top_roles = role_counts.to_dict(orient="records")

        # 2. Most Demanded Skills
        all_skills = []
        for j in jobs:
            for s in j.skills:
                if s.skill:
                    all_skills.append({"skill": s.skill.name, "category": s.skill.category})
        df_skills = pd.DataFrame(all_skills)
        skill_counts = df_skills["skill"].value_counts().head(12).reset_index()
        skill_counts.columns = ["skill", "postings"]
        top_skills = skill_counts.to_dict(orient="records")

        # 3. Salary by Role
        role_salary = df.groupby("title")["salary_lpa"].mean().round(2).reset_index()
        role_salary.columns = ["role", "avg_salary_lpa"]
        role_salary = role_salary.sort_values("avg_salary_lpa", ascending=False).to_dict(orient="records")

        # 4. Salary by Skill
        skill_salary_map = {}
        for j in jobs:
            for s in j.skills:
                if s.skill:
                    s_name = s.skill.name
                    if s_name not in skill_salary_map:
                        skill_salary_map[s_name] = []
                    skill_salary_map[s_name].append(j.salary_lpa)

        salary_by_skill = []
        for s_name, sals in skill_salary_map.items():
            if len(sals) >= 5:  # meaningful sample size
                salary_by_skill.append({
                    "skill": s_name,
                    "avg_salary_lpa": round(float(np.mean(sals)), 2),
                    "postings": len(sals)
                })
        salary_by_skill = sorted(salary_by_skill, key=lambda x: x["avg_salary_lpa"], reverse=True)[:10]

        # 5. Location-wise job demand
        loc_counts = df["location"].value_counts().reset_index()
        loc_counts.columns = ["location", "jobs_count"]
        location_demand = loc_counts.to_dict(orient="records")

        # 6. Company-wise job demand
        comp_counts = df["company"].value_counts().head(10).reset_index()
        comp_counts.columns = ["company", "openings"]
        company_demand = comp_counts.to_dict(orient="records")

        # 7. Experience requirements
        df["exp_bucket"] = df["experience_years"].apply(
            lambda e: "0 - 1 Years (Entry)" if e <= 1 else ("1 - 3 Years (Junior/Mid)" if e <= 3 else "3+ Years (Senior)")
        )
        exp_counts = df["exp_bucket"].value_counts().reset_index()
        exp_counts.columns = ["experience_level", "count"]
        experience_distribution = exp_counts.to_dict(orient="records")

        return jsonify({
            "success": True,
            "data_origin": "Demo/Synthetic Data (Realistic Industry Market Postings)",
            "summary": {
                "total_active_jobs": len(df),
                "avg_market_salary": round(float(df["salary_lpa"].mean()), 2),
                "unique_companies": int(df["company"].nunique()),
                "unique_roles": int(df["title"].nunique())
            },
            "top_roles": top_roles,
            "top_skills": top_skills,
            "salary_by_role": role_salary,
            "salary_by_skill": salary_by_skill,
            "location_demand": location_demand,
            "company_demand": company_demand,
            "experience_distribution": experience_distribution
        })
    finally:
        db.close()

@analytics_bp.route("/skills", methods=["POST"])
def add_custom_skill():
    """
    Add a new skill to the catalog.
    Prevents duplicate skills (case-insensitive).
    Saves to database and makes available across student profile and analytics.
    """
    data = request.get_json(silent=True) or {}
    skill_name = (data.get("name") or "").strip()
    category = (data.get("category") or "Technical").strip()
    demand_index = float(data.get("demand_index") or 78.0)

    if not skill_name:
        return jsonify({"success": False, "error": "Skill name cannot be empty."}), 400

    db = SessionLocal()
    try:
        # Prevent duplicates
        existing = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if existing:
            return jsonify({
                "success": False,
                "error": f"Skill '{existing.name}' already exists in the catalog."
            }), 409

        new_skill = Skill(name=skill_name, category=category, demand_index=demand_index)
        db.add(new_skill)
        db.commit()
        db.refresh(new_skill)

        return jsonify({
            "success": True,
            "message": f"Skill '{new_skill.name}' added successfully to DATA VISTA catalog.",
            "data": new_skill.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@analytics_bp.route("/skill-trends", methods=["GET"])
def get_skill_trends():
    """
    Skill Demand Trend Analyzer:
    Shows how demand changes over years/quarters.
    Includes historical trajectory (Increasing, Stable, Decreasing).
    """
    selected_skill = request.args.get("skill", "Python").strip()

    # Defined trend trajectories for key industry skills
    time_points = ["2021-Q1", "2021-Q3", "2022-Q1", "2022-Q3", "2023-Q1", "2023-Q3", "2024-Q1", "2024-Q3"]

    trend_catalog = {
        "Python": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+28.4%",
            "description": "Explosive growth driven by AI, Machine Learning, Data Analytics, and backend automation.",
            "data": [62, 68, 73, 79, 84, 89, 93, 96]
        },
        "SQL": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+19.2%",
            "description": "Universal fundamental skill required across Data Engineering, Analytics, and Backend Development.",
            "data": [74, 76, 80, 83, 86, 89, 92, 94]
        },
        "Power BI": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+34.5%",
            "description": "Rapid adoption across corporate reporting, self-service BI, and executive analytics.",
            "data": [48, 54, 61, 68, 74, 80, 84, 88]
        },
        "Tableau": {
            "trajectory": "Decreasing",
            "growth_rate_pct": "-8.2%",
            "description": "Gradual enterprise migration towards cloud-native BI and unified Microsoft Power BI suites.",
            "data": [85, 84, 82, 80, 78, 77, 76, 75]
        },
        "Excel": {
            "trajectory": "Stable",
            "growth_rate_pct": "+1.5%",
            "description": "Evergreen baseline tool present across almost every business and analytical function.",
            "data": [82, 81, 83, 82, 83, 82, 83, 82]
        },
        "Machine Learning": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+38.0%",
            "description": "Massive hiring spike across predictive analytics, generative AI, and automation pipelines.",
            "data": [55, 62, 69, 74, 81, 86, 90, 92]
        },
        "Docker": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+25.1%",
            "description": "Ubiquitous containerization standard in DevOps, Microservices, and ML deployment.",
            "data": [60, 65, 71, 76, 80, 83, 86, 89]
        },
        "React": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+21.0%",
            "description": "Dominant modern web frontend UI library worldwide.",
            "data": [70, 75, 79, 83, 86, 88, 90, 91]
        },
        "AWS": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+26.8%",
            "description": "Market leader in cloud infrastructure and scalable serverless compute.",
            "data": [68, 72, 77, 82, 85, 88, 90, 92]
        },
        "Statistics": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+14.0%",
            "description": "Core foundation essential for reliable experimentation, A/B testing, and data science.",
            "data": [72, 74, 76, 78, 80, 82, 84, 85]
        },
        "C": {
            "trajectory": "Stable",
            "growth_rate_pct": "+4.2%",
            "description": "Foundational low-level systems programming language essential for embedded systems, drivers, and operating systems.",
            "data": [80, 79, 81, 80, 82, 81, 82, 83]
        },
        "Java": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+16.5%",
            "description": "Enterprise standard for high-performance backend microservices, Android development, and distributed systems.",
            "data": [76, 78, 80, 82, 84, 86, 88, 90]
        },
        "Full Stack Development (FSD)": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+31.2%",
            "description": "High industry demand for engineers capable of end-to-end frontend interfaces, backend REST APIs, and database architecture.",
            "data": [58, 64, 70, 76, 82, 86, 90, 93]
        },
        "GitHub": {
            "trajectory": "Increasing",
            "growth_rate_pct": "+24.0%",
            "description": "Ubiquitous version control, CI/CD action workflows, and collaborative codebase management platform.",
            "data": [74, 77, 81, 85, 88, 91, 93, 95]
        }
    }

    # Query all skills from database to include any user-added skills
    db = SessionLocal()
    try:
        all_db_skills = db.query(Skill).all()
        for sk in all_db_skills:
            if sk.name not in trend_catalog:
                # Provide a realistic sample trend for newly added skills
                base_val = int(sk.demand_index or 75)
                trend_catalog[sk.name] = {
                    "trajectory": "Increasing",
                    "growth_rate_pct": "+12.5%",
                    "description": f"Demand trajectory benchmark for {sk.name} ({sk.category}).",
                    "data": [
                        max(40, base_val - 14),
                        max(43, base_val - 11),
                        max(47, base_val - 8),
                        max(52, base_val - 5),
                        max(57, base_val - 3),
                        max(62, base_val - 1),
                        base_val,
                        min(98, base_val + 3)
                    ],
                    "is_custom": True
                }
    finally:
        db.close()

    # Case-insensitive resolution of selected_skill
    matched_key = None
    for k in trend_catalog.keys():
        if k.lower() == selected_skill.lower():
            matched_key = k
            break
    if not matched_key:
        matched_key = "Python"

    skill_info = trend_catalog[matched_key]
    time_series = [{"period": t, "demand_score": score} for t, score in zip(time_points, skill_info["data"])]

    # Multi-skill comparison overview
    comparison = []
    for s_name, s_meta in trend_catalog.items():
        comparison.append({
            "skill": s_name,
            "trajectory": s_meta["trajectory"],
            "growth_rate": s_meta["growth_rate_pct"],
            "current_score": s_meta["data"][-1]
        })

    return jsonify({
        "success": True,
        "selected_skill": matched_key,
        "trajectory": skill_info["trajectory"],
        "growth_rate": skill_info["growth_rate_pct"],
        "description": skill_info["description"],
        "time_series": time_series,
        "available_skills": sorted(list(trend_catalog.keys())),
        "comparison_overview": sorted(comparison, key=lambda x: x["current_score"], reverse=True),
        "data_origin": "DATA VISTA Analytics Engine"
    })
