from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=True)
    personal_email = Column(String(120), nullable=True)
    college_email = Column(String(120), nullable=True)
    branch = Column(String(100), nullable=False)
    year = Column(Integer, default=3)  # 1 to 4
    cgpa = Column(Float, nullable=False, default=7.5)
    preferred_career = Column(String(100), default="Data Analyst")
    preferred_location = Column(String(100), default="Bangalore")
    num_internships = Column(Integer, default=0)
    experience_status = Column(String(20), default="Fresher")  # Fresher, Experienced
    experience_years = Column(Float, default=0.0)
    github_profile = Column(String(255), nullable=True, default="")
    profile_photo = Column(Text, nullable=True, default="")
    school_name = Column(String(150), nullable=True, default="")
    school_passing_year = Column(Integer, nullable=True, default=2020)
    school_percentage = Column(Float, nullable=True, default=90.0)
    intermediate_college_name = Column(String(150), nullable=True, default="")
    intermediate_passing_year = Column(Integer, nullable=True, default=2022)
    intermediate_percentage = Column(Float, nullable=True, default=88.0)
    degree_institute_name = Column(String(150), nullable=True, default="")
    degree_passing_year = Column(Integer, nullable=True, default=2026)
    degree_education_status = Column(String(50), nullable=True, default="Pursuing")  # Pursuing or Completed
    degree_percentage = Column(Float, nullable=True)
    certificates_data = Column(Text, nullable=True, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("StudentCertification", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    internships = relationship("StudentInternship", back_populates="student", cascade="all, delete-orphan")

    def to_dict(self):
        import json
        certs_list = []
        if self.certificates_data:
            try:
                parsed = json.loads(self.certificates_data)
                if isinstance(parsed, list):
                    certs_list = parsed
            except Exception:
                certs_list = []

        if not certs_list and self.certifications:
            for c in self.certifications:
                if c.certification:
                    certs_list.append({
                        "name": c.certification.name,
                        "issuing_org": c.certification.issuing_org or "Certified",
                        "completion_date": str(c.year_completed or 2024),
                        "certificate_url": ""
                    })

        return {
            "id": self.id,
            "student_id": self.student_id,
            "name": self.name,
            "email": self.college_email or self.email or "",
            "personal_email": self.personal_email or "",
            "college_email": self.college_email or self.email or "",
            "branch": self.branch,
            "year": self.year,
            "cgpa": self.cgpa,
            "preferred_career": self.preferred_career,
            "preferred_location": self.preferred_location or "",
            "num_internships": self.num_internships if self.num_internships is not None else 0,
            "experience_status": self.experience_status or "Fresher",
            "experience_years": self.experience_years if self.experience_years is not None else 0.0,
            "github_profile": self.github_profile or "",
            "profile_photo": self.profile_photo or "",
            "education": {
                "school": {
                    "name": self.school_name or "",
                    "year": self.school_passing_year or 2020,
                    "percentage": self.school_percentage if self.school_percentage is not None else 0.0
                },
                "intermediate": {
                    "college_name": self.intermediate_college_name or "",
                    "year": self.intermediate_passing_year or 2022,
                    "percentage": self.intermediate_percentage if self.intermediate_percentage is not None else 0.0
                },
                "degree": {
                    "institute_name": self.degree_institute_name or "",
                    "year": self.degree_passing_year or 2026,
                    "status": self.degree_education_status or "Pursuing",
                    "percentage": self.degree_percentage
                }
            },
            "skills": [s.skill.name for s in self.skills if s.skill],
            "certificates": certs_list,
            "certifications": [c["name"] if isinstance(c, dict) else str(c) for c in certs_list],
            "projects": [p.to_dict() for p in self.projects],
            "internships": [i.to_dict() for i in self.internships],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), default="Technical")  # Programming, Database, Cloud, Tool, Soft
    demand_index = Column(Float, default=70.0)  # 0 to 100 job market demand score

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "demand_index": self.demand_index
        }


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(String(20), default="Intermediate")  # Beginner, Intermediate, Advanced

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False)
    issuing_org = Column(String(100), default="Coursera")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "issuing_org": self.issuing_org
        }


class StudentCertification(Base):
    __tablename__ = "student_certifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    certification_id = Column(Integer, ForeignKey("certifications.id", ondelete="CASCADE"), nullable=False)
    year_completed = Column(Integer, default=2024)

    student = relationship("Student", back_populates="certifications")
    certification = relationship("Certification")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    domain = Column(String(100), default="Web Development")
    description = Column(Text, nullable=True)
    technologies = Column(String(250), default="Python, SQL")

    student = relationship("Student", back_populates="projects")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "domain": self.domain,
            "description": self.description,
            "technologies": self.technologies
        }


class StudentInternship(Base):
    __tablename__ = "student_internships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(150), nullable=False)
    role = Column(String(100), nullable=False)
    duration_months = Column(Integer, default=3)
    stipend = Column(Float, default=15000)
    work_mode = Column(String(50), default="Hybrid")  # Remote, On-Site, Hybrid

    student = relationship("Student", back_populates="internships")

    def to_dict(self):
        return {
            "id": self.id,
            "company": self.company,
            "role": self.role,
            "duration_months": self.duration_months,
            "stipend": self.stipend,
            "work_mode": self.work_mode
        }


class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), unique=True, nullable=False)
    domain = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    avg_salary_lpa = Column(Float, default=8.5)
    market_growth_pct = Column(Float, default=18.0)
    min_cgpa = Column(Float, default=7.0)

    skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "domain": self.domain,
            "description": self.description,
            "avg_salary_lpa": self.avg_salary_lpa,
            "market_growth_pct": self.market_growth_pct,
            "min_cgpa": self.min_cgpa,
            "skills": [cs.skill.name for cs in self.skills if cs.skill]
        }


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    career_id = Column(Integer, ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance_weight = Column(Float, default=1.0)  # 1.0 = standard, 2.0 = mandatory core

    career = relationship("Career", back_populates="skills")
    skill = relationship("Skill")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(120), nullable=False)
    company = Column(String(120), nullable=False)
    location = Column(String(100), default="Bangalore")
    salary_lpa = Column(Float, default=9.0)
    experience_years = Column(Float, default=1.0)
    work_mode = Column(String(50), default="Hybrid")
    description = Column(Text, nullable=True)
    posted_date = Column(DateTime, default=datetime.utcnow)

    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "salary_lpa": self.salary_lpa,
            "experience_years": self.experience_years,
            "work_mode": self.work_mode,
            "description": self.description,
            "skills": [js.skill.name for js in self.skills if js.skill]
        }


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill")


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(120), nullable=False)
    company = Column(String(120), nullable=False)
    location = Column(String(100), default="Bangalore")
    stipend = Column(Float, default=20000)
    duration_months = Column(Integer, default=3)
    work_mode = Column(String(50), default="Remote")  # Remote, On-Site, Hybrid
    internship_type = Column(String(50), default="Full-time")  # Full-time, Part-time
    certificate_provided = Column(Boolean, default=True)
    company_rating = Column(Float, default=4.2)  # out of 5.0
    description = Column(Text, nullable=True)

    skills = relationship("InternshipSkill", back_populates="internship", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "stipend": self.stipend,
            "duration_months": self.duration_months,
            "work_mode": self.work_mode,
            "internship_type": self.internship_type,
            "certificate_provided": self.certificate_provided,
            "company_rating": self.company_rating,
            "description": self.description,
            "skills": [iks.skill.name for iks in self.skills if iks.skill]
        }


class InternshipSkill(Base):
    __tablename__ = "internship_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    internship = relationship("Internship", back_populates="skills")
    skill = relationship("Skill")


class PlacementRecord(Base):
    __tablename__ = "placement_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_ref = Column(String(50), nullable=True)
    branch = Column(String(100), nullable=False)
    year = Column(Integer, default=2024)
    cgpa = Column(Float, nullable=False)
    aptitude_score = Column(Float, default=70.0)
    communication_score = Column(Float, default=70.0)
    num_skills = Column(Integer, default=4)
    num_projects = Column(Integer, default=2)
    num_certifications = Column(Integer, default=1)
    internship_months = Column(Integer, default=0)
    placed = Column(Integer, default=1)  # 1 = Placed, 0 = Unplaced
    company = Column(String(120), nullable=True)
    salary_lpa = Column(Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "student_ref": self.student_ref,
            "branch": self.branch,
            "year": self.year,
            "cgpa": self.cgpa,
            "aptitude_score": self.aptitude_score,
            "communication_score": self.communication_score,
            "num_skills": self.num_skills,
            "num_projects": self.num_projects,
            "num_certifications": self.num_certifications,
            "internship_months": self.internship_months,
            "placed": self.placed,
            "company": self.company,
            "salary_lpa": self.salary_lpa
        }


class SavedResume(Base):
    __tablename__ = "saved_resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    title = Column(String(150), default="My Resume")
    content_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        try:
            parsed = json.loads(self.content_json)
        except Exception:
            parsed = {}
        return {
            "id": self.id,
            "student_id": self.student_id,
            "title": self.title,
            "resume_data": parsed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class SkillQuestion(Base):
    __tablename__ = "skill_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill = Column(String(50), nullable=False, index=True)
    question = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)  # "A", "B", "C", "D"
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Medium")  # Easy, Medium, Hard

    def to_client_dict(self):
        return {
            "id": self.id,
            "skill": self.skill,
            "question": self.question,
            "options": [
                {"key": "A", "text": self.option_a},
                {"key": "B", "text": self.option_b},
                {"key": "C", "text": self.option_c},
                {"key": "D", "text": self.option_d}
            ],
            "difficulty": self.difficulty
        }

    def to_dict(self):
        return {
            "id": self.id,
            "skill": self.skill,
            "question": self.question,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "correct_option": self.correct_option,
            "explanation": self.explanation,
            "difficulty": self.difficulty
        }


class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False, index=True)  # "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"
    topic = Column(String(100), nullable=True)
    question = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Medium")

    def to_client_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "topic": self.topic or self.category,
            "question": self.question,
            "options": [
                {"key": "A", "text": self.option_a},
                {"key": "B", "text": self.option_b},
                {"key": "C", "text": self.option_c},
                {"key": "D", "text": self.option_d}
            ],
            "difficulty": self.difficulty
        }

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "topic": self.topic,
            "question": self.question,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "correct_option": self.correct_option,
            "explanation": self.explanation,
            "difficulty": self.difficulty
        }


class SkillAssessmentAttempt(Base):
    __tablename__ = "skill_assessment_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    skill = Column(String(50), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, default=10)
    percentage = Column(Float, nullable=False)
    skill_level = Column(String(20), nullable=False)  # Beginner, Intermediate, Advanced
    difficulty = Column(String(20), default="Mixed")
    question_ids = Column(Text, nullable=False)
    answers_json = Column(Text, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "student_id": self.student_id,
            "skill": self.skill,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": self.percentage,
            "skill_level": self.skill_level,
            "difficulty": self.difficulty,
            "question_ids": json.loads(self.question_ids) if self.question_ids else [],
            "answers": json.loads(self.answers_json) if self.answers_json else {},
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class AptitudeAssessmentAttempt(Base):
    __tablename__ = "aptitude_assessment_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    quantitative_score = Column(Integer, default=0)
    logical_score = Column(Integer, default=0)
    verbal_score = Column(Integer, default=0)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, default=10)
    percentage = Column(Float, nullable=False)
    performance_level = Column(String(30), nullable=False)
    difficulty = Column(String(20), default="Mixed")
    question_ids = Column(Text, nullable=False)
    answers_json = Column(Text, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "student_id": self.student_id,
            "quantitative_score": self.quantitative_score,
            "logical_score": self.logical_score,
            "verbal_score": self.verbal_score,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": self.percentage,
            "performance_level": self.performance_level,
            "difficulty": self.difficulty,
            "question_ids": json.loads(self.question_ids) if self.question_ids else [],
            "answers": json.loads(self.answers_json) if self.answers_json else {},
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class ServedQuestionHistory(Base):
    __tablename__ = "served_question_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    assessment_type = Column(String(20), nullable=False)  # "skill" or "aptitude"
    skill_or_category = Column(String(50), nullable=False)
    question_id = Column(Integer, nullable=False)
    served_at = Column(DateTime, default=datetime.utcnow)


class LearningGoal(Base):
    __tablename__ = "learning_goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    target_role = Column(String(100), default="Target Career")
    skill_name = Column(String(100), nullable=False)
    status = Column(String(20), default="Not Started")  # "Not Started", "In Progress", "Completed"
    progress_pct = Column(Integer, default=0)  # 0 to 100
    target_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "target_role": self.target_role,
            "skill_name": self.skill_name,
            "status": self.status,
            "progress_pct": self.progress_pct,
            "target_date": self.target_date,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="general")  # profile, resume, learning, assessment, internship
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(120), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student")  # "student", "admin"
    student_ref = Column(String(50), nullable=True)
    full_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "student_ref": self.student_ref,
            "full_name": self.full_name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class FreeInternshipOpportunity(Base):
    __tablename__ = "free_internship_opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False, index=True)
    organization = Column(String(150), nullable=False, index=True)
    domain = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)  # Short description of the program
    duration = Column(String(80), nullable=True)
    stipend_type = Column(String(50), nullable=False, default="Paid Stipend")
    stipend_amount = Column(String(100), nullable=True)
    eligibility = Column(Text, nullable=True)
    application_deadline = Column(String(50), nullable=True)
    official_source = Column(String(150), nullable=False)
    apply_url = Column(Text, nullable=False)
    source_url = Column(Text, nullable=True)
    free_to_apply = Column(Boolean, default=True)
    verification_status = Column(String(50), default="Verified Official")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def is_expired(self):
        if not self.application_deadline:
            return False
        dl = self.application_deadline.strip().lower()
        if "rolling" in dl or "throughout" in dl or "ongoing" in dl or "open" in dl:
            return False
        try:
            from datetime import date
            parts = self.application_deadline.strip().split("-")
            if len(parts) == 3:
                exp_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                return exp_date < date.today()
        except Exception:
            pass
        return False

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "organization": self.organization,
            "domain": self.domain,
            "description": self.description or "",
            "duration": self.duration,
            "stipend_type": self.stipend_type,
            "stipend_amount": self.stipend_amount,
            "eligibility": self.eligibility,
            "application_deadline": self.application_deadline,
            "is_expired": self.is_expired(),
            "official_source": self.official_source,
            "apply_url": self.apply_url,
            "source_url": self.source_url,
            "free_to_apply": self.free_to_apply,
            "verification_status": self.verification_status,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class StudentTask(Base):
    __tablename__ = "student_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Skill Learning")  # "Skill Learning", "Weekly Goal", "Project Work", "Aptitude Practice", "Resume & Internship", "Revision"
    is_weekly_goal = Column(Boolean, default=False)
    start_date = Column(String(50), nullable=True)  # YYYY-MM-DD
    deadline = Column(String(50), nullable=False)    # YYYY-MM-DD
    status = Column(String(30), default="Not Started")  # "Not Started", "In Progress", "Completed"
    priority = Column(String(20), default="Medium")  # "Low", "Medium", "High"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def is_overdue(self):
        if self.status == "Completed" or not self.deadline:
            return False
        try:
            from datetime import date
            parts = self.deadline.strip().split("-")
            if len(parts) == 3:
                return date(int(parts[0]), int(parts[1]), int(parts[2])) < date.today()
        except Exception:
            pass
        return False

    def is_today(self):
        if not self.deadline:
            return False
        try:
            from datetime import date
            today_str = date.today().isoformat()
            return self.deadline.strip() == today_str
        except Exception:
            return False

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "is_weekly_goal": self.is_weekly_goal,
            "start_date": self.start_date,
            "deadline": self.deadline,
            "status": self.status,
            "priority": self.priority,
            "is_overdue": self.is_overdue(),
            "is_today": self.is_today(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class CodingPracticeRecord(Base):
    __tablename__ = "coding_practice_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    language = Column(String(30), nullable=False, index=True)  # "Python", "Java", "C", "SQL"
    problem_title = Column(String(200), nullable=False)
    topic = Column(String(100), nullable=False, index=True)  # "Arrays", "Strings", "Loops", "Recursion", "Joins", "OOP", etc.
    difficulty = Column(String(20), default="Easy")  # "Easy", "Medium", "Hard"
    platform = Column(String(50), default="LeetCode")  # "LeetCode", "HackerRank", "GeeksforGeeks", "CodeChef", "Custom"
    problem_url = Column(Text, nullable=True)
    status = Column(String(30), default="Attempted")  # "Not Started", "Attempted", "Solved"
    notes = Column(Text, nullable=True)
    attempted_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "language": self.language,
            "problem_title": self.problem_title,
            "topic": self.topic,
            "difficulty": self.difficulty,
            "platform": self.platform,
            "problem_url": self.problem_url,
            "status": self.status,
            "notes": self.notes,
            "attempted_date": self.attempted_date,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class MockInterviewQuestion(Base):
    __tablename__ = "mock_interview_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    interview_type = Column(String(30), nullable=False, index=True)  # "Technical" or "HR"
    domain_or_category = Column(String(100), nullable=False, index=True)  # "Python", "Java", "C", "SQL", "HTML and CSS", "JavaScript", "React", "Machine Learning", "Data Analytics", "HR Behavioral"
    question = Column(Text, nullable=False)
    sample_answer = Column(Text, nullable=False)
    explanation_tips = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Beginner")

    def to_dict(self):
        return {
            "id": self.id,
            "interview_type": self.interview_type,
            "domain_or_category": self.domain_or_category,
            "question": self.question,
            "sample_answer": self.sample_answer,
            "explanation_tips": self.explanation_tips,
            "difficulty": self.difficulty
        }


class InterviewPracticeRecord(Base):
    __tablename__ = "interview_practice_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("mock_interview_questions.id", ondelete="CASCADE"), nullable=False)
    student_answer = Column(Text, nullable=True)
    is_practiced = Column(Boolean, default=True)
    practiced_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("MockInterviewQuestion")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "question_id": self.question_id,
            "question": self.question.to_dict() if self.question else None,
            "student_answer": self.student_answer,
            "is_practiced": self.is_practiced,
            "practiced_at": self.practiced_at.isoformat() if self.practiced_at else None
        }


