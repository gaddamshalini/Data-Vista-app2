import unittest
import json
from app import create_app

class TestFreeInternships(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_get_free_internships_list(self):
        res = self.client.get("/api/free-internships")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["total"], 1)

        # Check required card fields for student view
        first_item = data["data"][0]
        self.assertIn("title", first_item)
        self.assertIn("organization", first_item)
        self.assertIn("domain", first_item)
        self.assertIn("duration", first_item)
        self.assertIn("stipend_type", first_item)
        self.assertIn("stipend_amount", first_item)
        self.assertIn("eligibility", first_item)
        self.assertIn("application_deadline", first_item)
        self.assertIn("official_source", first_item)
        self.assertIn("apply_url", first_item)
        self.assertTrue(first_item["free_to_apply"])
        self.assertTrue(first_item["apply_url"].startswith("http"))

    def test_admin_crud_free_internship(self):
        # 1. Deny non-admin
        deny_res = self.client.post("/api/free-internships", json={
            "title": "Unauthorized Test Internship",
            "organization": "Test Org",
            "domain": "AI",
            "apply_url": "https://example.com/apply"
        })
        self.assertEqual(deny_res.status_code, 403)

        # 2. Allow admin to create
        create_res = self.client.post("/api/free-internships", headers={"X-User-Role": "admin"}, json={
            "title": "Open Source Research Fellowship",
            "organization": "Open Technology Foundation",
            "domain": "Artificial Intelligence & Open Source",
            "duration": "3 Months",
            "stipend_type": "Paid Stipend",
            "stipend_amount": "₹20,000 / month",
            "eligibility": "Undergraduate students in CS/IT",
            "application_deadline": "2026-12-31",
            "official_source": "Open Technology Foundation Official",
            "apply_url": "https://careers.google.com/students/",
            "free_to_apply": True
        })
        self.assertEqual(create_res.status_code, 201)
        created_data = json.loads(create_res.data)
        item_id = created_data["data"]["id"]

        # 3. Update opportunity
        upd_res = self.client.put(f"/api/free-internships/{item_id}", headers={"X-User-Role": "admin"}, json={
            "stipend_amount": "₹25,000 / month"
        })
        self.assertEqual(upd_res.status_code, 200)
        upd_data = json.loads(upd_res.data)
        self.assertEqual(upd_data["data"]["stipend_amount"], "₹25,000 / month")

        # 4. Toggle active status
        toggle_res = self.client.patch(f"/api/free-internships/{item_id}/toggle-active", headers={"X-User-Role": "admin"})
        self.assertEqual(toggle_res.status_code, 200)
        toggle_data = json.loads(toggle_res.data)
        self.assertFalse(toggle_data["is_active"])

        # 5. Delete opportunity
        del_res = self.client.delete(f"/api/free-internships/{item_id}", headers={"X-User-Role": "admin"})
        self.assertEqual(del_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
