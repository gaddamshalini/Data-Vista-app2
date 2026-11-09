import unittest
import json
from app import create_app

class TestV4Enhancements(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_auth_admin_and_student(self):
        # Admin login
        admin_res = self.client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123",
            "role": "admin"
        })
        self.assertEqual(admin_res.status_code, 200)
        admin_data = json.loads(admin_res.data)
        self.assertTrue(admin_data["success"])
        self.assertEqual(admin_data["user"]["role"], "admin")

        # Student login
        stu_res = self.client.post("/api/auth/login", json={
            "username": "CS2024001",
            "password": "password123",
            "role": "student"
        })
        self.assertEqual(stu_res.status_code, 200)
        stu_data = json.loads(stu_res.data)
        self.assertTrue(stu_data["success"])

    def test_resume_save_and_fetch(self):
        # Save resume
        save_res = self.client.post("/api/resumes/CS2024001", json={
            "title": "Machine Learning Engineer Resume",
            "resume_data": {
                "fullName": "Aarav Sharma",
                "targetRole": "Machine Learning Engineer",
                "skills": ["Python", "Machine Learning", "SQL"]
            }
        })
        self.assertIn(save_res.status_code, [200, 201])
        save_data = json.loads(save_res.data)
        self.assertTrue(save_data["success"])

        # Fetch resumes
        get_res = self.client.get("/api/resumes/CS2024001")
        self.assertEqual(get_res.status_code, 200)
        get_data = json.loads(get_res.data)
        self.assertTrue(get_data["success"])
        self.assertGreaterEqual(get_data["total"], 1)

    def test_skill_assessment_flow(self):
        # 1. List skills
        list_res = self.client.get("/api/assessments/skills/list")
        self.assertEqual(list_res.status_code, 200)
        list_data = json.loads(list_res.data)
        self.assertTrue(list_data["success"])
        self.assertEqual(len(list_data["skills"]), 10)

        # 2. Start test
        start_res = self.client.get("/api/assessments/skills/start?skill=Python&student_id=CS2024001")
        self.assertEqual(start_res.status_code, 200)
        start_data = json.loads(start_res.data)
        self.assertTrue(start_data["success"])
        self.assertEqual(len(start_data["questions"]), 10)
        # Check that answers are NOT leaked to client
        first_q = start_data["questions"][0]
        self.assertNotIn("correct_option", first_q)
        self.assertNotIn("explanation", first_q)

        # 3. Submit test answers
        answers_payload = {str(q["id"]): "B" for q in start_data["questions"]}
        submit_res = self.client.post("/api/assessments/skills/submit", json={
            "student_id": "CS2024001",
            "skill": "Python",
            "answers": answers_payload
        })
        self.assertEqual(submit_res.status_code, 200)
        submit_data = json.loads(submit_res.data)
        self.assertTrue(submit_data["success"])
        self.assertIn("score", submit_data)
        self.assertIn("skill_level", submit_data)
        self.assertEqual(len(submit_data["breakdown"]), 10)

        # 4. History
        hist_res = self.client.get("/api/assessments/skills/history/CS2024001")
        self.assertEqual(hist_res.status_code, 200)
        hist_data = json.loads(hist_res.data)
        self.assertTrue(hist_data["success"])
        self.assertGreaterEqual(hist_data["total"], 1)

    def test_aptitude_assessment_flow(self):
        # 1. Categories
        cat_res = self.client.get("/api/assessments/aptitude/categories")
        self.assertEqual(cat_res.status_code, 200)
        cat_data = json.loads(cat_res.data)
        self.assertTrue(cat_data["success"])
        self.assertEqual(len(cat_data["categories"]), 3)

        # 2. Start test
        start_res = self.client.get("/api/assessments/aptitude/start?student_id=CS2024001&category=all")
        self.assertEqual(start_res.status_code, 200)
        start_data = json.loads(start_res.data)
        self.assertTrue(start_data["success"])
        self.assertEqual(len(start_data["questions"]), 10)

        # 3. Submit test
        answers_payload = {str(q["id"]): "A" for q in start_data["questions"]}
        submit_res = self.client.post("/api/assessments/aptitude/submit", json={
            "student_id": "CS2024001",
            "answers": answers_payload
        })
        self.assertEqual(submit_res.status_code, 200)
        submit_data = json.loads(submit_res.data)
        self.assertTrue(submit_data["success"])
        self.assertIn("quantitative_score", submit_data)
        self.assertIn("logical_score", submit_data)
        self.assertIn("verbal_score", submit_data)

    def test_learning_goals_and_sync(self):
        # Add goal
        add_res = self.client.post("/api/learning/CS2024001", json={
            "skill_name": "Docker & Kubernetes",
            "target_role": "DevOps Engineer",
            "status": "In Progress",
            "progress_pct": 35
        })
        self.assertIn(add_res.status_code, [200, 201])
        add_data = json.loads(add_res.data)
        self.assertTrue(add_data["success"])
        goal_id = add_data["data"]["id"]

        # Update goal
        upd_res = self.client.put(f"/api/learning/goal/{goal_id}", json={
            "progress_pct": 75
        })
        self.assertEqual(upd_res.status_code, 200)
        upd_data = json.loads(upd_res.data)
        self.assertEqual(upd_data["data"]["progress_pct"], 75)

        # Sync from skill gap
        sync_res = self.client.post("/api/learning/CS2024001/sync-skill-gap")
        self.assertEqual(sync_res.status_code, 200)
        sync_data = json.loads(sync_res.data)
        self.assertTrue(sync_data["success"])

    def test_performance_insights(self):
        res = self.client.get("/api/insights/CS2024001")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertIn("readiness_index", data)
        self.assertIn("metrics", data)
        self.assertIn("recommendations", data)

    def test_admin_dashboard_authorization(self):
        # 1. Deny unauthenticated
        unauth_res = self.client.get("/api/admin/metrics")
        self.assertEqual(unauth_res.status_code, 403)

        # 2. Allow admin
        auth_res = self.client.get("/api/admin/metrics", headers={"X-User-Role": "admin"})
        self.assertEqual(auth_res.status_code, 200)
        data = json.loads(auth_res.data)
        self.assertTrue(data["success"])
        self.assertIn("total_students", data["metrics"])

        # 3. Search students
        search_res = self.client.get("/api/admin/students?q=CS2024", headers={"X-User-Role": "admin"})
        self.assertEqual(search_res.status_code, 200)
        search_data = json.loads(search_res.data)
        self.assertTrue(search_data["success"])

    def test_smart_notifications(self):
        # Get notifications (triggers dynamic smart rules)
        get_res = self.client.get("/api/notifications/CS2024001")
        self.assertEqual(get_res.status_code, 200)
        data = json.loads(get_res.data)
        self.assertTrue(data["success"])
        self.assertIn("unread_count", data)

        # Mark all read
        mark_res = self.client.put("/api/notifications/CS2024001/mark-all-read")
        self.assertEqual(mark_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
