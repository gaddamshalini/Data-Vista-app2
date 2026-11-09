"""
Seed Data Script for CareerCompass
Populates the database with:
- Canonical Skill Master list with demand indices
- Career Pathways with skill mappings and salary ranges
- Industry Certifications
- Pre-loaded realistic Student Profiles
- Job Market records (100+ realistic postings)
- Internship Opportunities (50+ postings with quality attributes)
- Historical Placement records (1,500 realistic benchmark records)
All data clearly labeled as Demo/Synthetic Data for academic major project presentation.
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    Student, Skill, StudentSkill, Certification, StudentCertification,
    Project, StudentInternship, Career, CareerSkill, Job, JobSkill,
    Internship, InternshipSkill, PlacementRecord
)

def init_db():
    print("[DB] Creating all relational database tables...")
    Base.metadata.create_all(bind=engine)

def seed(force=False):
    init_db()
    db = SessionLocal()

    # Check if already seeded (skip unless force=True)
    if not force and db.query(Skill).count() > 0:
        print("[DB] Database already seeded. Skipping initial seeding.")
        db.close()
        return
    print("[DB] Seeding canonical Skills...")
    skills_data = [
        # Data & Analytics
        ("Python", "Programming", 96.0),
        ("SQL", "Database", 94.0),
        ("Power BI", "Data Analytics", 88.0),
        ("Tableau", "Data Analytics", 76.0),
        ("Excel", "Tools", 82.0),
        ("Advanced Excel", "Tools", 84.0),
        ("Pandas", "Data Analytics", 90.0),
        ("NumPy", "Data Analytics", 86.0),
        ("Scikit-learn", "Machine Learning", 88.0),
        ("Statistics", "Core Analytics", 85.0),
        ("Machine Learning", "Machine Learning", 92.0),
        ("Deep Learning", "Machine Learning", 86.0),
        ("NLP", "Machine Learning", 84.0),
        ("Apache Spark", "Big Data", 80.0),
        ("BigQuery", "Cloud Data", 82.0),
        ("Snowflake", "Cloud Data", 81.0),

        # Software & Web
        ("Java", "Programming", 87.0),
        ("C++", "Programming", 80.0),
        ("JavaScript", "Programming", 93.0),
        ("TypeScript", "Programming", 89.0),
        ("React", "Web Framework", 91.0),
        ("Node.js", "Web Backend", 88.0),
        ("HTML/CSS", "Web Frontend", 82.0),
        ("FastAPI", "Web Backend", 84.0),
        ("Flask", "Web Backend", 78.0),
        ("Django", "Web Backend", 80.0),
        ("Spring Boot", "Web Backend", 85.0),

        # Cloud & DevOps
        ("AWS", "Cloud", 92.0),
        ("Azure", "Cloud", 86.0),
        ("Docker", "DevOps", 89.0),
        ("Kubernetes", "DevOps", 85.0),
        ("Git", "Tools", 93.0),
        ("Linux", "Operating System", 84.0),
        ("CI/CD", "DevOps", 83.0),

        # Databases
        ("MySQL", "Database", 88.0),
        ("PostgreSQL", "Database", 87.0),
        ("MongoDB", "Database", 83.0),

        # Soft Skills & Aptitude
        ("Problem Solving", "Soft Skills", 90.0),
        ("Communication", "Soft Skills", 88.0),
        ("Agile/Scrum", "Methodology", 80.0),
        ("Quantitative Aptitude", "Aptitude", 85.0),
        ("Logical Reasoning", "Aptitude", 85.0),
    ]

    skill_map = {}
    for name, cat, demand in skills_data:
        s = Skill(name=name, category=cat, demand_index=demand)
        db.add(s)
        db.flush()
        skill_map[name] = s

    print("[DB] Seeding Certifications...")
    certs_data = [
        ("Google Data Analytics Professional Certificate", "Google / Coursera"),
        ("Microsoft Certified: Power BI Data Analyst Associate", "Microsoft"),
        ("AWS Certified Cloud Practitioner", "Amazon Web Services"),
        ("Meta Front-End Developer Professional Certificate", "Meta / Coursera"),
        ("IBM Data Science Professional Certificate", "IBM / Coursera"),
        ("DeepLearning.AI Machine Learning Specialization", "DeepLearning.AI"),
        ("Oracle Certified Associate Java Programmer", "Oracle"),
        ("Certified Kubernetes Application Developer (CKAD)", "Linux Foundation"),
    ]

    cert_map = {}
    for name, org in certs_data:
        c = Certification(name=name, issuing_org=org)
        db.add(c)
        db.flush()
        cert_map[name] = c

    print("[DB] Seeding Careers & Required Skills...")
    careers_data = [
        {
            "title": "Data Analyst",
            "domain": "Data Analytics",
            "description": "Analyzes raw structured data, builds interactive business dashboards, performs exploratory data analysis, and informs corporate decision-making.",
            "avg_salary_lpa": 8.2,
            "market_growth_pct": 22.5,
            "min_cgpa": 6.8,
            "skills": [("SQL", 2.0), ("Python", 1.8), ("Power BI", 1.8), ("Excel", 1.5), ("Statistics", 1.6), ("Tableau", 1.2), ("Communication", 1.2)]
        },
        {
            "title": "Business Analyst",
            "domain": "Management & Analytics",
            "description": "Bridges technology and business strategy by formulating data-driven metrics, analyzing KPIs, and mapping stakeholder requirements.",
            "avg_salary_lpa": 8.8,
            "market_growth_pct": 18.0,
            "min_cgpa": 7.0,
            "skills": [("SQL", 1.8), ("Power BI", 1.8), ("Advanced Excel", 1.8), ("Communication", 2.0), ("Agile/Scrum", 1.5), ("Problem Solving", 1.5)]
        },
        {
            "title": "Data Scientist",
            "domain": "Artificial Intelligence & Data",
            "description": "Builds statistical and predictive models, designs machine learning algorithms, conducts deep hypothesis testing, and extracts insights from complex big data.",
            "avg_salary_lpa": 12.5,
            "market_growth_pct": 28.0,
            "min_cgpa": 7.5,
            "skills": [("Python", 2.0), ("Machine Learning", 2.0), ("SQL", 1.8), ("Statistics", 1.9), ("Pandas", 1.6), ("Scikit-learn", 1.7), ("Deep Learning", 1.4)]
        },
        {
            "title": "Machine Learning Engineer",
            "domain": "Artificial Intelligence & ML",
            "description": "Engineers and operationalizes scalable ML pipelines, deep learning architectures, feature stores, and real-time model inferencing systems.",
            "avg_salary_lpa": 13.8,
            "market_growth_pct": 32.0,
            "min_cgpa": 7.5,
            "skills": [("Python", 2.0), ("Machine Learning", 2.0), ("Deep Learning", 1.9), ("Docker", 1.6), ("FastAPI", 1.5), ("Git", 1.4), ("AWS", 1.5)]
        },
        {
            "title": "Full Stack Developer",
            "domain": "Software Engineering",
            "description": "Develops responsive frontends and resilient backend REST APIs, architects database systems, and manages deployment workflows.",
            "avg_salary_lpa": 9.5,
            "market_growth_pct": 21.0,
            "min_cgpa": 6.8,
            "skills": [("JavaScript", 2.0), ("React", 1.9), ("Node.js", 1.8), ("SQL", 1.6), ("HTML/CSS", 1.5), ("Git", 1.5), ("Docker", 1.3)]
        },
        {
            "title": "Cloud & DevOps Engineer",
            "domain": "Cloud Infrastructure",
            "description": "Architects reliable cloud infrastructure, manages container orchestration, builds CI/CD automated release pipelines, and ensures platform high-availability.",
            "avg_salary_lpa": 11.2,
            "market_growth_pct": 26.0,
            "min_cgpa": 7.0,
            "skills": [("AWS", 2.0), ("Docker", 1.9), ("Kubernetes", 1.8), ("Linux", 1.7), ("CI/CD", 1.7), ("Python", 1.4), ("Git", 1.5)]
        },
        {
            "title": "Software Development Engineer (SDE)",
            "domain": "Core Software Engineering",
            "description": "Designs low-latency, scalable enterprise software solutions, masters data structures and algorithms, and writes reliable production-grade code.",
            "avg_salary_lpa": 12.0,
            "market_growth_pct": 20.0,
            "min_cgpa": 7.2,
            "skills": [("Java", 1.9), ("C++", 1.7), ("Problem Solving", 2.0), ("SQL", 1.6), ("Git", 1.5), ("Linux", 1.4)]
        }
    ]

    for c_info in careers_data:
        career = Career(
            title=c_info["title"],
            domain=c_info["domain"],
            description=c_info["description"],
            avg_salary_lpa=c_info["avg_salary_lpa"],
            market_growth_pct=c_info["market_growth_pct"],
            min_cgpa=c_info["min_cgpa"]
        )
        db.add(career)
        db.flush()

        for skill_name, weight in c_info["skills"]:
            if skill_name in skill_map:
                cs = CareerSkill(career_id=career.id, skill_id=skill_map[skill_name].id, importance_weight=weight)
                db.add(cs)

    print("[DB] Seeding Student Profiles...")
    demo_students = [
        {
            "student_id": "CS2024001",
            "name": "Aarav Sharma",
            "email": "aarav.sharma@college.edu",
            "branch": "Computer Science & Engineering",
            "year": 4,
            "cgpa": 8.75,
            "aptitude_score": 85.0,
            "communication_score": 82.0,
            "preferred_career": "Data Analyst",
            "preferred_location": "Bangalore",
            "internship_experience_months": 4,
            "skills": ["Python", "SQL", "Power BI", "Pandas", "NumPy", "Excel", "Problem Solving"],
            "certs": ["Google Data Analytics Professional Certificate", "Microsoft Certified: Power BI Data Analyst Associate"],
            "projects": [
                ("E-Commerce Customer Churn Analysis", "Data Analytics", "Built an end-to-end churn prediction dashboard analyzing 50k customer transactions with SQL and Power BI.", "Python, SQL, Power BI"),
                ("Retail Sales Forecasting Pipeline", "Machine Learning", "Trained time-series models in Pandas and Scikit-learn to forecast monthly retail revenue.", "Python, Pandas, Scikit-learn"),
                ("Interactive Covid Trends Dashboard", "Data Visualization", "Engineered interactive geographical visualization using Streamlit and Plotly.", "Python, Plotly")
            ],
            "internships": [
                ("Infosys BPM Analytics", "Data Analyst Intern", 4, 25000, "Hybrid")
            ]
        },
        {
            "student_id": "CS2024002",
            "name": "Priya Patel",
            "email": "priya.patel@college.edu",
            "branch": "Information Technology",
            "year": 4,
            "cgpa": 9.20,
            "aptitude_score": 90.0,
            "communication_score": 88.0,
            "preferred_career": "Data Scientist",
            "preferred_location": "Hyderabad",
            "internship_experience_months": 6,
            "skills": ["Python", "SQL", "Machine Learning", "Deep Learning", "Pandas", "NumPy", "Scikit-learn", "Git", "Statistics"],
            "certs": ["DeepLearning.AI Machine Learning Specialization", "IBM Data Science Professional Certificate"],
            "projects": [
                ("Medical Image Diagnosis using CNN", "Deep Learning", "Created automated chest X-ray disease classification achieving 94% test accuracy.", "Python, PyTorch, NumPy"),
                ("Credit Card Fraud Detector", "Machine Learning", "Constructed high-imbalance fraud detection pipeline using Random Forests and SMOTE.", "Python, Scikit-learn, Pandas")
            ],
            "internships": [
                ("TCS Innovation Labs", "ML Research Intern", 6, 28000, "Remote")
            ]
        },
        {
            "student_id": "CS2024003",
            "name": "Rohan Verma",
            "email": "rohan.verma@college.edu",
            "branch": "Electronics & Communication",
            "year": 3,
            "cgpa": 7.10,
            "aptitude_score": 64.0,
            "communication_score": 62.0,
            "preferred_career": "Full Stack Developer",
            "preferred_location": "Pune",
            "internship_experience_months": 0,
            "skills": ["C++", "HTML/CSS", "JavaScript"],
            "certs": [],
            "projects": [
                ("Student Attendance Portal", "Web Development", "Created responsive HTML/CSS student database portal.", "HTML/CSS, JavaScript")
            ],
            "internships": []
        },
        {
            "student_id": "CS2024004",
            "name": "Sneha Kulkarni",
            "email": "sneha.k@college.edu",
            "branch": "Computer Science & Engineering",
            "year": 4,
            "cgpa": 8.40,
            "aptitude_score": 78.0,
            "communication_score": 84.0,
            "preferred_career": "Full Stack Developer",
            "preferred_location": "Bangalore",
            "internship_experience_months": 3,
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git", "HTML/CSS"],
            "certs": ["Meta Front-End Developer Professional Certificate"],
            "projects": [
                ("Realtime Team Collaboration App", "Web Development", "Engineered Kanban board application with React, Node.js and WebSockets.", "React, Node.js, SQL"),
                ("Online Bookstore API", "Backend Engineering", "RESTful API handling authentication and shopping cart logic.", "Node.js, Express, MySQL")
            ],
            "internships": [
                ("Wipro Digital", "Frontend Web Intern", 3, 20000, "Hybrid")
            ]
        },
        {
            "student_id": "CS2024005",
            "name": "Vikram Adithya",
            "email": "vikram.a@college.edu",
            "branch": "Mechanical Engineering",
            "year": 3,
            "cgpa": 6.85,
            "aptitude_score": 60.0,
            "communication_score": 65.0,
            "preferred_career": "Business Analyst",
            "preferred_location": "Chennai",
            "internship_experience_months": 0,
            "skills": ["Excel", "Communication", "Problem Solving"],
            "certs": [],
            "projects": [
                ("Inventory Optimization Spreadsheet", "Operations", "Calculated EOQ models for workshop tooling.", "Excel")
            ],
            "internships": []
        }
    ]

    for s_info in demo_students:
        student = Student(
            student_id=s_info["student_id"],
            name=s_info["name"],
            email=s_info["email"],
            branch=s_info["branch"],
            year=s_info["year"],
            cgpa=s_info["cgpa"],
            preferred_career=s_info["preferred_career"],
            preferred_location=s_info["preferred_location"],
            num_internships=len(s_info["internships"])
        )
        db.add(student)
        db.flush()

        # Skills
        for sk_name in s_info["skills"]:
            if sk_name in skill_map:
                ssk = StudentSkill(student_id=student.id, skill_id=skill_map[sk_name].id, proficiency="Intermediate")
                db.add(ssk)

        # Certifications
        for c_name in s_info["certs"]:
            if c_name in cert_map:
                scert = StudentCertification(student_id=student.id, certification_id=cert_map[c_name].id, year_completed=2024)
                db.add(scert)

        # Projects
        for p_title, p_domain, p_desc, p_tech in s_info["projects"]:
            proj = Project(student_id=student.id, title=p_title, domain=p_domain, description=p_desc, technologies=p_tech)
            db.add(proj)

        # Internships
        for comp, role, dur, stip, mode in s_info["internships"]:
            intern = StudentInternship(student_id=student.id, company=comp, role=role, duration_months=dur, stipend=stip, work_mode=mode)
            db.add(intern)

    print("[DB] Seeding Job Postings...")
    companies = [
        "Google", "Microsoft", "Amazon", "Flipkart", "Accenture", "TCS",
        "Infosys", "Wipro", "Cognizant", "Deloitte", "JPMorgan Chase", "Swiggy",
        "Zomato", "Goldman Sachs", "Cisco", "Adobe", "Oracle", "IBM"
    ]
    locations = ["Bangalore", "Hyderabad", "Pune", "Chennai", "Gurgaon", "Mumbai", "Noida", "Remote"]
    work_modes = ["Hybrid", "On-Site", "Remote"]

    job_templates = [
        ("Junior Data Analyst", 6.5, 9.5, 0.5, 2.0, ["Python", "SQL", "Power BI", "Excel", "Statistics"]),
        ("Senior Data Analyst", 10.0, 15.0, 3.0, 5.0, ["Python", "SQL", "Tableau", "Power BI", "Statistics", "Snowflake"]),
        ("Data Scientist - Analytics", 11.0, 18.0, 1.0, 3.0, ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn", "Statistics"]),
        ("ML Ops Engineer", 12.0, 20.0, 2.0, 4.0, ["Python", "Machine Learning", "Docker", "Kubernetes", "AWS", "Git"]),
        ("Frontend React Developer", 7.0, 12.0, 1.0, 3.0, ["JavaScript", "TypeScript", "React", "HTML/CSS", "Git"]),
        ("Backend Python/FastAPI Engineer", 8.0, 14.0, 1.0, 3.0, ["Python", "FastAPI", "SQL", "MySQL", "Docker", "Git"]),
        ("Cloud Infrastructure Specialist", 10.0, 16.0, 2.0, 4.0, ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD"]),
        ("Associate Software Engineer", 6.0, 10.0, 0.0, 1.5, ["Java", "C++", "SQL", "Problem Solving", "Git"]),
        ("Business Analyst - Financial Systems", 8.5, 13.0, 1.0, 3.0, ["SQL", "Power BI", "Advanced Excel", "Communication", "Agile/Scrum"]),
        ("Big Data Engineer", 12.0, 19.0, 2.0, 5.0, ["Python", "Apache Spark", "SQL", "AWS", "BigQuery"]),
    ]

    for i in range(120):
        tmpl = random.choice(job_templates)
        company = random.choice(companies)
        loc = random.choice(locations)
        salary = round(random.uniform(tmpl[1], tmpl[2]), 1)
        exp = round(random.uniform(tmpl[3], tmpl[4]), 1)
        mode = random.choice(work_modes)

        job = Job(
            title=tmpl[0],
            company=company,
            location=loc,
            salary_lpa=salary,
            experience_years=exp,
            work_mode=mode,
            description=f"Exciting opportunity at {company} in {loc}. Seeking passionate engineering talent with strong problem-solving skills.",
            posted_date=datetime.utcnow() - timedelta(days=random.randint(1, 45))
        )
        db.add(job)
        db.flush()

        for s_name in tmpl[5]:
            if s_name in skill_map:
                js = JobSkill(job_id=job.id, skill_id=skill_map[s_name].id)
                db.add(js)

    print("[DB] Seeding Internships...")
    internship_templates = [
        ("Data Analytics Intern", ["Python", "SQL", "Power BI", "Excel"], 20000, 35000, 3, 6, "Hybrid", 4.4),
        ("Machine Learning Research Intern", ["Python", "Machine Learning", "Scikit-learn", "Pandas"], 25000, 45000, 3, 6, "Remote", 4.6),
        ("Frontend Web Development Intern", ["JavaScript", "React", "HTML/CSS", "Git"], 15000, 30000, 2, 4, "Remote", 4.1),
        ("Backend Cloud Systems Intern", ["Python", "FastAPI", "Docker", "AWS"], 22000, 38000, 3, 6, "On-Site", 4.3),
        ("Business Intelligence Intern", ["Power BI", "SQL", "Excel", "Communication"], 18000, 28000, 3, 4, "Hybrid", 4.2),
        ("DevOps & SRE Intern", ["Linux", "Docker", "Git", "AWS"], 20000, 32000, 3, 6, "Remote", 4.0),
        ("Software Engineering Intern", ["Java", "SQL", "Problem Solving", "Git"], 25000, 40000, 3, 6, "On-Site", 4.5),
        ("Data Engineering Intern", ["Python", "SQL", "Apache Spark", "MySQL"], 22000, 35000, 3, 5, "Hybrid", 4.3)
    ]

    for i in range(60):
        tmpl = random.choice(internship_templates)
        company = random.choice(companies)
        loc = random.choice(locations)
        stipend = random.randint(tmpl[2] // 1000, tmpl[3] // 1000) * 1000
        dur = random.choice([2, 3, 4, 6])
        mode = random.choice(["Remote", "Hybrid", "On-Site"])
        cert = random.choice([True, True, True, False])
        rating = round(random.uniform(3.8, 4.9), 1)

        internship = Internship(
            title=tmpl[0],
            company=company,
            location=loc,
            stipend=stipend,
            duration_months=dur,
            work_mode=mode,
            internship_type="Full-time" if dur >= 3 else "Part-time",
            certificate_provided=cert,
            company_rating=rating,
            description=f"Join the {tmpl[0]} cohort at {company}. Mentorship, live project exposure, and placement pre-placement offer (PPO) potential."
        )
        db.add(internship)
        db.flush()

        for s_name in tmpl[1]:
            if s_name in skill_map:
                iks = InternshipSkill(internship_id=internship.id, skill_id=skill_map[s_name].id)
                db.add(iks)

    print("[DB] Seeding Placement Records for Analytics...")
    # Load from generated CSV
    csv_path = os.path.join(os.path.dirname(__file__), "ml", "placement_data.csv")
    if os.path.exists(csv_path):
        df_p = pd.read_csv(csv_path)
    else:
        # Fallback quick generation
        from ml.train_models import generate_benchmark_dataset
        df_p = generate_benchmark_dataset()

    branches = [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Electrical & Electronics",
        "Data Science & AI"
    ]
    years = [2021, 2022, 2023, 2024]
    p_companies = [
        ("TCS", 4.5, 7.5),
        ("Infosys", 4.2, 7.0),
        ("Wipro", 4.0, 6.8),
        ("Accenture", 5.0, 8.5),
        ("Amazon", 14.0, 28.0),
        ("Microsoft", 16.0, 32.0),
        ("Deloitte", 7.5, 11.5),
        ("Cognizant", 4.5, 7.0),
        ("Flipkart", 12.0, 22.0),
        ("JPMorgan Chase", 13.0, 20.0)
    ]

    records_to_insert = []
    for idx, row in df_p.iterrows():
        branch = random.choice(branches)
        year = random.choice(years)
        placed = int(row["placed"])

        comp_name = None
        sal = None
        if placed == 1:
            comp_choice = random.choice(p_companies)
            comp_name = comp_choice[0]
            # Higher CGPA gets higher salary bracket
            bonus = (row["cgpa"] - 6.0) * 0.8
            sal = round(max(comp_choice[1], min(comp_choice[2], random.uniform(comp_choice[1], comp_choice[2]) + bonus)), 2)

        records_to_insert.append(PlacementRecord(
            student_ref=f"HIST_{idx+1:04d}",
            branch=branch,
            year=year,
            cgpa=float(row["cgpa"]),
            aptitude_score=float(row["aptitude_score"]),
            communication_score=float(row["communication_score"]),
            num_skills=int(row["num_skills"]),
            num_projects=int(row["num_projects"]),
            num_certifications=int(row["num_certifications"]),
            internship_months=int(row["internship_months"]),
            placed=placed,
            company=comp_name,
            salary_lpa=sal
        ))

    db.bulk_save_objects(records_to_insert)
    db.commit()
    print(f"[DB] Successfully seeded {len(records_to_insert)} placement records, {len(demo_students)} demo students, 120 jobs, 60 internships!")
    db.close()

if __name__ == "__main__":
    seed()
