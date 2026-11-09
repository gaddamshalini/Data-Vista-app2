import os
import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "best_placement_model.joblib"
METRICS_PATH = BASE_DIR / "model_evaluation_metrics.json"

class PlacementPredictor:
    def __init__(self):
        self.model = None
        self.metrics = None
        self._load_model()

    def _load_model(self):
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
        if METRICS_PATH.exists():
            with open(METRICS_PATH, "r") as f:
                self.metrics = json.load(f)

    def predict_readiness(self, features: dict):
        if not self.model:
            self._load_model()
            if not self.model:
                raise RuntimeError("Placement ML model not trained or found.")

        feature_cols = [
            "cgpa",
            "num_skills",
            "num_projects",
            "num_certifications",
            "internship_months",
            "aptitude_score",
            "communication_score"
        ]

        # Extract values with safe defaults
        row = [
            float(features.get("cgpa", 7.0)),
            int(features.get("num_skills", 3)),
            int(features.get("num_projects", 1)),
            int(features.get("num_certifications", 1)),
            int(features.get("internship_months", 0)),
            float(features.get("aptitude_score", 65.0)),
            float(features.get("communication_score", 65.0))
        ]

        df_in = pd.DataFrame([row], columns=feature_cols)

        # Predict probability of placement (class 1)
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(df_in)[0]
            prob_placed = float(probs[1])
        else:
            prob_placed = float(self.model.predict(df_in)[0])

        readiness_pct = int(round(prob_placed * 100))
        # Ensure clamped 5 to 99 for realistic bounds
        readiness_pct = max(5, min(98, readiness_pct))

        # Classification thresholds
        if readiness_pct >= 75:
            category = "Green"
            status_text = "Placement Ready"
            badge_color = "emerald"
            recommendation = (
                "Excellent candidate profile. Keep practicing advanced technical interview questions, "
                "refining system design or domain project portfolios, and participating in mock interviews."
            )
        elif readiness_pct >= 50:
            category = "Yellow"
            status_text = "Needs Improvement"
            badge_color = "amber"
            recommendation = (
                "Good foundation with notable potential. To reach Placement Ready tier, focus on completing "
                "1-2 high-impact technical projects, earning recognized domain certifications, and boosting your aptitude score."
            )
        else:
            category = "Red"
            status_text = "Needs Major Improvement"
            badge_color = "rose"
            recommendation = (
                "Action required. Prioritize foundational core skills, build your first hands-on projects, "
                "participate in coding hackathons/internships, and systematically practice quantitative and verbal aptitude."
            )

        # Feature impact / breakdown analysis for this individual student
        strengths = []
        improvements = []

        if row[0] >= 8.0:
            strengths.append(f"Strong CGPA ({row[0]:.2f}) demonstrates consistent academic excellence.")
        else:
            improvements.append(f"CGPA ({row[0]:.2f}) is below typical top-tier campus cutoffs (8.0+).")

        if row[1] >= 6:
            strengths.append(f"Diverse technical skill stack ({row[1]} verified skills).")
        else:
            improvements.append(f"Skill stack ({row[1]} skills) is relatively narrow. Add 3+ high-demand skills.")

        if row[2] >= 3:
            strengths.append(f"Healthy project portfolio ({row[2]} projects).")
        else:
            improvements.append(f"Only {row[2]} project(s) listed. Build at least 2 full-stack/analytics projects.")

        if row[4] > 0:
            strengths.append(f"Valuable practical industry exposure ({row[4]} months internship).")
        else:
            improvements.append("No prior internship experience recorded. Target summer/winter internships.")

        if row[5] >= 75:
            strengths.append(f"Competitive aptitude benchmark ({row[5]:.0f}%).")
        else:
            improvements.append(f"Aptitude score ({row[5]:.0f}%) could be raised to 75%+ with regular timed practice.")

        if row[6] >= 75:
            strengths.append(f"Strong communication confidence ({row[6]:.0f}%).")
        else:
            improvements.append(f"Communication score ({row[6]:.0f}%) requires practice for group discussions and HR interviews.")

        return {
            "readiness_percentage": readiness_pct,
            "category": category,
            "status_text": status_text,
            "badge_color": badge_color,
            "recommendation": recommendation,
            "strengths": strengths,
            "improvements": improvements,
            "input_features": dict(zip(feature_cols, row)),
            "model_used": self.metrics.get("best_model", "Logistic Regression") if self.metrics else "Machine Learning Classifier"
        }

    def get_evaluation_metrics(self):
        if not self.metrics:
            self._load_model()
        return self.metrics or {}

predictor = PlacementPredictor()
