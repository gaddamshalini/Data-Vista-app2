import unittest
import json
from app import create_app
from database import SessionLocal
from models import StudentTask, CodingPracticeRecord, InterviewPracticeRecord

class TestV5Features(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.student_id = "STU1001"

    def test_01_skill_assessment_basic_questions(self):
        # Start skill test for Python
        res = self.client.get(f"/api/assessments/skills/start?skill=Python&student_id={self.student_id}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["questions"]), 10)
        q1 = data["questions"][0]
        self.assertIn("options", q1)
        self.assertEqual(len(q1["options"]), 4)
        # Should NOT disclose correct answer
        self.assertNotIn("correct_option", q1)

        # Submit test answers
        answers = {str(q["id"]): "A" for q in data["questions"]}
        submit_res = self.client.post("/api/assessments/skills/submit", json={
            "student_id": self.student_id,
            "skill": "Python",
            "answers": answers
        })
        self.assertEqual(submit_res.status_code, 200)
        sub_data = submit_res.get_json()
        self.assertTrue(sub_data["success"])
        self.assertEqual(sub_data["total_questions"], 10)
        self.assertIn("score", sub_data)
        self.assertIn("breakdown", sub_data)
        self.assertEqual(len(sub_data["breakdown"]), 10)
        self.assertIn("explanation", sub_data["breakdown"][0])

    def test_02_aptitude_assessment_basic_questions(self):
        # Start aptitude test
        res = self.client.get(f"/api/assessments/aptitude/start?student_id={self.student_id}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["questions"]), 10)
        q1 = data["questions"][0]
        self.assertEqual(len(q1["options"]), 4)

        # Submit test
        answers = {str(q["id"]): "B" for q in data["questions"]}
        submit_res = self.client.post("/api/assessments/aptitude/submit", json={
            "student_id": self.student_id,
            "answers": answers
        })
        self.assertEqual(submit_res.status_code, 200)
        sub_data = submit_res.get_json()
        self.assertTrue(sub_data["success"])
        self.assertEqual(sub_data["total_questions"], 10)
        self.assertIn("score", sub_data)
        self.assertIn("breakdown", sub_data)

    def test_03_student_task_planner_crud(self):
        # Create a daily task
        res = self.client.post(f"/api/tasks/{self.student_id}", json={
            "title": "Complete Python Basic MCQs",
            "description": "Revise syntax and functions",
            "category": "Skill Learning",
            "is_weekly_goal": False,
            "deadline": "2026-11-10",
            "priority": "High"
        })
        self.assertEqual(res.status_code, 201)
        created = res.get_json()["task"]
        task_id = created["id"]
        self.assertEqual(created["title"], "Complete Python Basic MCQs")

        # Get tasks
        get_res = self.client.get(f"/api/tasks/{self.student_id}")
        self.assertEqual(get_res.status_code, 200)
        get_data = get_res.get_json()
        self.assertTrue(get_data["success"])
        self.assertIn("stats", get_data)
        self.assertGreaterEqual(get_data["stats"]["total_tasks"], 1)

        # Update task status
        patch_res = self.client.patch(f"/api/tasks/{self.student_id}/{task_id}/status", json={
            "status": "Completed"
        })
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.get_json()["task"]["status"], "Completed")

        # Delete task
        del_res = self.client.delete(f"/api/tasks/{self.student_id}/{task_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_04_coding_practice_tracker_crud(self):
        # Add coding practice record
        res = self.client.post(f"/api/coding/{self.student_id}", json={
            "language": "Python",
            "problem_title": "Two Sum",
            "topic": "Arrays & Hash Table",
            "difficulty": "Easy",
            "platform": "LeetCode",
            "problem_url": "https://leetcode.com/problems/two-sum/",
            "status": "Solved",
            "notes": "Used a hash map to achieve O(n) runtime."
        })
        self.assertEqual(res.status_code, 201)
        record = res.get_json()["record"]
        rec_id = record["id"]
        self.assertEqual(record["language"], "Python")

        # Get coding records & stats
        get_res = self.client.get(f"/api/coding/{self.student_id}")
        self.assertEqual(get_res.status_code, 200)
        stats = get_res.get_json()["stats"]
        self.assertIn("language_breakdown", stats)
        self.assertIn("Python", stats["language_breakdown"])
        self.assertGreaterEqual(stats["total_solved"], 1)

        # Delete test record
        del_res = self.client.delete(f"/api/coding/{self.student_id}/{rec_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_05_mock_interview_practice(self):
        # Get domains
        dom_res = self.client.get("/api/interviews/domains")
        self.assertEqual(dom_res.status_code, 200)
        dom_data = dom_res.get_json()
        self.assertTrue(len(dom_data["technical_domains"]) >= 9)

        # Get Technical questions
        q_res = self.client.get(f"/api/interviews/questions?interview_type=Technical&domain=Python&student_id={self.student_id}")
        self.assertEqual(q_res.status_code, 200)
        q_data = q_res.get_json()
        self.assertTrue(len(q_data["questions"]) > 0)
        q1 = q_data["questions"][0]

        # Submit practice answer
        prac_res = self.client.post(f"/api/interviews/practice/{self.student_id}", json={
            "question_id": q1["id"],
            "student_answer": "Lists are mutable and tuples are immutable in Python."
        })
        self.assertEqual(prac_res.status_code, 200)
        prac_data = prac_res.get_json()
        self.assertTrue(prac_data["success"])
        self.assertIn("sample_answer", prac_data)
        self.assertIn("explanation_tips", prac_data)

        # Check history
        hist_res = self.client.get(f"/api/interviews/history/{self.student_id}")
        self.assertEqual(hist_res.status_code, 200)
        self.assertGreaterEqual(hist_res.get_json()["stats"]["technical_practiced"], 1)

if __name__ == "__main__":
    unittest.main()
