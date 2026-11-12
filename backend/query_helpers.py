"""
query_helpers.py — Reusable SQLAlchemy eager-loading options.
Import these into route files to eliminate N+1 query problems.
"""
from sqlalchemy.orm import selectinload
from models import (
    Student, StudentSkill, Skill, StudentCertification, Certification,
    Project, StudentInternship, Career, CareerSkill, Job, JobSkill
)


def student_full_load():
    """
    Eagerly loads all 4 student relationships in 5 queries total
    instead of 4*N queries for N students.
    Use with: db.query(Student).options(*student_full_load())
    """
    return [
        selectinload(Student.skills).selectinload(StudentSkill.skill),
        selectinload(Student.certifications).selectinload(StudentCertification.certification),
        selectinload(Student.projects),
        selectinload(Student.internships),
    ]


def career_with_skills():
    """
    Eagerly loads career skills in 2 queries instead of N+1.
    Use with: db.query(Career).options(*career_with_skills())
    """
    return [
        selectinload(Career.skills).selectinload(CareerSkill.skill),
    ]


def jobs_with_skills():
    """
    Eagerly loads job skills in 2 queries instead of N+1.
    Use with: db.query(Job).options(*jobs_with_skills())
    """
    return [
        selectinload(Job.skills).selectinload(JobSkill.skill),
    ]
