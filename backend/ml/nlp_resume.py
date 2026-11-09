"""
NLP Resume-Job Matching Engine
Extracts text from PDF/Text resumes, detects technical skills,
computes TF-IDF vector representations and Cosine Similarity against Job Descriptions,
and computes Matched Skills, Missing Skills, and Recommended Skills.
"""

import re
import io
import numpy as np
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Extensive Canonical Skill Catalog for NLP Entity Extraction
CANONICAL_SKILLS = [
    # Data & Analytics
    "python", "r", "sql", "mysql", "postgresql", "mongodb", "power bi", "tableau",
    "excel", "advanced excel", "pandas", "numpy", "scipy", "scikit-learn",
    "tensorflow", "keras", "pytorch", "spark", "hadoop", "apache spark",
    "bigquery", "snowflake", "data analysis", "data visualization", "statistics",
    "machine learning", "deep learning", "nlp", "computer vision", "etl", "data modeling",

    # Software Engineering & Web
    "java", "c++", "c#", "javascript", "typescript", "react", "angular", "vue",
    "node.js", "express", "html", "css", "tailwind css", "django", "flask",
    "fastapi", "spring boot", "rest api", "graphql", "next.js",

    # Cloud, DevOps & Tools
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "ci/cd",
    "linux", "bash", "jira", "agile", "scrum", "terraform", "jenkins",

    # Business, Aptitude & Soft Skills
    "problem solving", "communication", "critical thinking", "business analysis",
    "project management", "time management", "teamwork", "leadership"
]

SAMPLE_JOB_DESCRIPTIONS = [
    {
        "id": "jd-1",
        "title": "Junior Data Analyst",
        "company": "Amazon Analytics",
        "text": """We are seeking a junior data analyst with strong proficiency in Python, SQL, and Advanced Excel.
        The candidate should be experienced in data cleaning, exploratory data analysis, and building interactive dashboards in Power BI or Tableau.
        Foundational understanding of statistics, data visualization, and ETL processes is essential.
        Familiarity with MySQL, Git, and business analysis metrics is a major plus."""
    },
    {
        "id": "jd-2",
        "title": "Associate Machine Learning Engineer",
        "company": "Microsoft AI Labs",
        "text": """Looking for an early-career ML Engineer skilled in Python, Scikit-learn, TensorFlow, and PyTorch.
        You will build, evaluate, and deploy predictive models and deep learning pipelines.
        Requirements: Machine Learning, Deep Learning, Pandas, NumPy, SQL, Docker, Git, and REST API development with FastAPI or Flask.
        Solid grounding in statistics, linear algebra, and data modeling is required."""
    },
    {
        "id": "jd-3",
        "title": "Full Stack Software Engineer",
        "company": "Google Cloud",
        "text": """We are looking for a software developer passionate about building scalable web applications.
        Must have strong skills in JavaScript, TypeScript, React, Node.js, and HTML/CSS.
        Experience with REST APIs, SQL, PostgreSQL, MongoDB, Docker, Git, and CI/CD pipelines.
        Excellent problem solving and teamwork skills are expected."""
    },
    {
        "id": "jd-4",
        "title": "Cloud & DevOps Intern / Associate",
        "company": "Infosys Cloud Solutions",
        "text": """Join our cloud platform team. Essential requirements: AWS or Azure cloud services, Linux shell scripting,
        Docker containerization, Kubernetes, Git, CI/CD with Jenkins or GitHub Actions.
        Knowledge of Python or Bash scripting and Terraform infrastructure-as-code is preferred.
        Strong communication and troubleshooting abilities."""
    }
]

def extract_text_from_pdf(file_stream) -> str:
    """Extracts raw text from a PDF file stream using pypdf."""
    try:
        reader = PdfReader(file_stream)
        text_parts = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_parts.append(extracted)
        return "\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def preprocess_text(text: str) -> str:
    """Normalizes text: lowercase, removes special noise while preserving alphanumeric tokens."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'[^\w\s\+\#\.\-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_skills_from_text(text: str) -> list:
    """Extracts recognized technical and analytical skills from normalized text."""
    normalized = preprocess_text(text)
    detected = set()

    for skill in CANONICAL_SKILLS:
        # Match as whole word/phrase
        pattern = r'(?:\b|^)' + re.escape(skill) + r'(?:\b|$)'
        if re.search(pattern, normalized):
            # Format nicely
            detected.add(skill.title() if len(skill) > 3 and skill not in ["aws", "gcp", "sql", "nlp", "etl", "ci/cd"] else skill.upper())

    # Sort alphabetically
    return sorted(list(detected))

def match_resume_with_job(resume_text: str, job_text: str) -> dict:
    """
    Computes NLP similarity, extracts skills from both documents,
    calculates TF-IDF Cosine Similarity, and derives match metrics.
    """
    cleaned_resume = preprocess_text(resume_text)
    cleaned_job = preprocess_text(job_text)

    if not cleaned_resume:
        raise ValueError("Resume content cannot be empty.")
    if not cleaned_job:
        raise ValueError("Job description cannot be empty.")

    # 1. Skill Extraction
    resume_skills = extract_skills_from_text(cleaned_resume)
    job_skills = extract_skills_from_text(cleaned_job)

    # Set operations for skill gaps
    resume_skills_lower = {s.lower() for s in resume_skills}
    job_skills_lower = {s.lower() for s in job_skills}

    matched_lower = resume_skills_lower.intersection(job_skills_lower)
    missing_lower = job_skills_lower - resume_skills_lower

    # Format properly
    matched_skills = [s for s in job_skills if s.lower() in matched_lower]
    missing_skills = [s for s in job_skills if s.lower() in missing_lower]

    # 2. TF-IDF and Cosine Similarity
    corpus = [cleaned_resume, cleaned_job]
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", max_features=1000)
    tfidf_matrix = vectorizer.fit_transform(corpus)

    cos_sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

    # 3. Blended Match Score
    # Skill overlap weight (60%) + Semantic TF-IDF similarity weight (40%)
    if len(job_skills) > 0:
        skill_coverage_ratio = len(matched_skills) / len(job_skills)
    else:
        skill_coverage_ratio = cos_sim

    # Weighted blend
    raw_score = (0.55 * skill_coverage_ratio) + (0.45 * cos_sim)
    # Scale to percentage
    match_pct = int(round(raw_score * 100))
    match_pct = max(10, min(98, match_pct))

    # Priority recommended skills: missing skills that were most crucial
    recommended_skills = missing_skills[:5]

    return {
        "match_percentage": match_pct,
        "cosine_similarity": round(cos_sim, 4),
        "skill_coverage_ratio": round(skill_coverage_ratio, 4),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommended_skills": recommended_skills,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "total_matched": len(matched_skills),
        "total_missing": len(missing_skills),
        "resume_word_count": len(cleaned_resume.split()),
        "job_word_count": len(cleaned_job.split()),
    }
