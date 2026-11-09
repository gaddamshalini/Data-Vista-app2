import unittest
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app import create_app
from database import SessionLocal
from models import Student

class DataVistaApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_check(self):
        """Test system health check and connectivity."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["application"], "DATA VISTA")
        self.assertEqual(data["database"], "Connected")

    def test_get_student_by_id(self):
        """Test retrieving student profile by unique ID."""
        response = self.client.get("/api/students/CS2024001")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["student_id"], "CS2024001")
        self.assertIn("Python", data["data"]["skills"])
        self.assertIn("num_internships", data["data"])
        self.assertIn("experience_status", data["data"])
        self.assertIn("github_profile", data["data"])

    def test_add_custom_skill_and_trends(self):
        """Test adding a custom skill and duplicate prevention."""
        import time
        unique_skill = f"TestSkill_{int(time.time() * 1000) % 1000000}"
        payload = {"name": unique_skill, "category": "DevOps", "demand_index": 85.0}
        
        # 1. Add skill
        res1 = self.client.post("/api/analytics/skills", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res1.status_code, 201)
        self.assertTrue(res1.get_json()["success"])

        # 2. Duplicate check (prevent duplicate)
        res_dup = self.client.post("/api/analytics/skills", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res_dup.status_code, 409)

        # 3. Check skill trends endpoint includes the new skill
        res_trends = self.client.get(f"/api/analytics/skill-trends?skill={unique_skill}")
        self.assertEqual(res_trends.status_code, 200)
        self.assertTrue(res_trends.get_json()["success"])
        self.assertEqual(res_trends.get_json()["selected_skill"], unique_skill)

    def test_search_student(self):
        """Test searching student by name or partial ID."""
        response = self.client.get("/api/students/search?q=Aarav")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(len(data["data"]), 0)

    def test_placement_analytics(self):
        """Test placement analytics data structure and calculations."""
        response = self.client.get("/api/analytics/placement")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("summary", data)
        self.assertGreater(data["summary"]["total_students"], 0)
        self.assertIn("department_wise", data)
        self.assertIn("salary_distribution", data)

    def test_job_market_analytics(self):
        """Test job market analytics returns in-demand roles and skills."""
        response = self.client.get("/api/analytics/jobs")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("top_roles", data)
        self.assertIn("top_skills", data)

    def test_career_recommendation(self):
        """Test career recommendation returns ranked suitability and reasons."""
        response = self.client.get("/api/careers/recommendations?student_id=CS2024001")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(len(data["top_recommendations"]), 0)
        top = data["top_recommendations"][0]
        self.assertIn("suitability_percentage", top)
        self.assertIn("explanation", top)

    def test_skill_gap_analysis(self):
        """Test skill gap calculation and priority ranking."""
        response = self.client.get("/api/careers/skill-gap?student_id=CS2024001")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("total_matched", data)
        self.assertIn("priority_skills_to_learn", data)

    def test_internship_matching_and_quality(self):
        """Test personalized internship matching and quality score calculation."""
        response = self.client.get("/api/internships/match?student_id=CS2024001")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(len(data["top_internships"]), 0)
        first_intern = data["top_internships"][0]
        self.assertIn("quality_score", first_intern)
        self.assertIn("match_percentage", first_intern)
        self.assertIn("quality_factors", first_intern)

    def test_ml_placement_readiness(self):
        """Test ML readiness prediction and classification."""
        response = self.client.get("/api/ml/predict?student_id=CS2024001")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("readiness_percentage", data["data"])
        self.assertIn(data["data"]["category"], ["Green", "Yellow", "Red"])
        self.assertIn("recommendation", data["data"])

    def test_ml_evaluation_metrics(self):
        """Test ML evaluation metrics returns real test-set comparison."""
        response = self.client.get("/api/ml/evaluation-metrics")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        models = data["data"]["models"]
        self.assertIn("Logistic Regression", models)
        self.assertIn("accuracy", models["Logistic Regression"])
        self.assertIn("confusion_matrix", models["Logistic Regression"])

    def test_nlp_resume_matcher(self):
        """Test TF-IDF resume-job text matcher."""
        resume = "Experienced student with Python, SQL, Power BI, data cleaning, and statistical modeling."
        jd = "Hiring Junior Data Analyst with Python, SQL, Power BI, Tableau, and Excel skills."
        payload = {"resume_text": resume, "job_text": jd}
        response = self.client.post(
            "/api/nlp/match",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("match_percentage", data["data"])
        self.assertIn("Python", data["data"]["matched_skills"])
        self.assertIn("Tableau", data["data"]["missing_skills"])

    def test_education_and_certificates_update(self):
        """Test updating educational details and certificates."""
        payload = {
            "profile_photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "education": {
                "school": {"name": "Delhi Public School", "year": 2020, "percentage": 92.4},
                "intermediate": {"college_name": "National College", "year": 2022, "percentage": 90.0},
                "degree": {"institute_name": "RV College of Engineering", "year": 2026, "status": "Pursuing", "percentage": None}
            },
            "certificates": [
                {"name": "AWS Certified Cloud Practitioner", "issuing_org": "Amazon Web Services", "completion_date": "2024", "certificate_url": "https://aws.amazon.com"}
            ]
        }
        res = self.client.put("/api/students/CS2024001", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("education", data["data"])
        self.assertEqual(data["data"]["education"]["school"]["name"], "Delhi Public School")
        self.assertEqual(data["data"]["education"]["degree"]["status"], "Pursuing")
        self.assertIn("certificates", data["data"])
        self.assertEqual(data["data"]["certificates"][0]["name"], "AWS Certified Cloud Practitioner")
        self.assertTrue(data["data"]["profile_photo"].startswith("data:image/png"))

    def test_custom_role_skill_gap(self):
        """Test skill gap analysis for a custom typed career role."""
        res = self.client.get("/api/careers/skill-gap?student_id=CS2024001&role=Python%20Developer")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["career"]["title"], "Python Developer")
        self.assertIn("Python", data["matched_skills"])
        self.assertIn("priority_skills_to_learn", data)

    def test_github_repos_endpoint(self):
        """Test github repos endpoint returns response structure."""
        res = self.client.get("/api/students/CS2024001/github-repos")
        # May be 200 or 403 (if GitHub rate limited)
        self.assertIn(res.status_code, [200, 403, 404])
        data = res.get_json()
        self.assertIn("repos", data)

    def test_personal_and_college_emails_and_internships(self):
        """Test that personal and college emails and internships are properly stored and retrieved."""
        payload = {
            "name": "Aarav Sharma",
            "personal_email": "aarav.personal@gmail.com",
            "college_email": "aarav.college@college.edu",
            "branch": "Computer Science and Engineering (CSE)",
            "year": 4,
            "cgpa": 9.1,
            "internships": [
                {
                    "company": "Google India",
                    "role": "Cloud Engineering Intern",
                    "duration_months": 6,
                    "stipend": 45000,
                    "work_mode": "Hybrid"
                }
            ],
            "certificates": [
                {"name": "Google Professional Cloud Architect"}
            ]
        }
        res = self.client.put("/api/students/CS2024001", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["personal_email"], "aarav.personal@gmail.com")
        self.assertEqual(data["data"]["college_email"], "aarav.college@college.edu")
        self.assertEqual(len(data["data"]["internships"]), 1)
        self.assertEqual(data["data"]["internships"][0]["company"], "Google India")
        self.assertEqual(data["data"]["internships"][0]["duration_months"], 6)

if __name__ == "__main__":
    unittest.main()
