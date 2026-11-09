"""
Machine Learning Training and Evaluation Pipeline
Trains and compares Logistic Regression, Decision Tree, and Random Forest
on a held-out test set to predict student placement readiness.
Evaluated with Accuracy, Precision, Recall, F1 Score, and Confusion Matrix.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent

def generate_benchmark_dataset(num_samples=1500, random_seed=42):
    np.random.seed(random_seed)

    # Features:
    # 1. CGPA: 5.5 to 9.8
    # 2. Technical Skills Count: 1 to 12
    # 3. Projects Count: 0 to 6
    # 4. Certifications Count: 0 to 5
    # 5. Internship Months: 0 to 12
    # 6. Aptitude Score: 40 to 98
    # 7. Communication Score: 45 to 98

    cgpa = np.clip(np.random.normal(7.6, 0.95, num_samples), 5.5, 9.9)
    num_skills = np.random.randint(1, 13, num_samples)
    num_projects = np.random.poisson(2.5, num_samples)
    num_projects = np.clip(num_projects, 0, 7)
    num_certs = np.random.poisson(1.8, num_samples)
    num_certs = np.clip(num_certs, 0, 6)
    internship_months = np.random.choice([0, 1, 2, 3, 6, 8], p=[0.40, 0.15, 0.15, 0.18, 0.08, 0.04], size=num_samples)
    aptitude_score = np.clip(np.random.normal(72, 12, num_samples), 40, 100)
    communication_score = np.clip(np.random.normal(73, 11, num_samples), 40, 100)

    # Realistic placement latent index with realistic weights
    latent_score = (
        0.30 * ((cgpa - 5.5) / 4.5) +
        0.20 * (num_skills / 12.0) +
        0.15 * (num_projects / 6.0) +
        0.10 * (num_certs / 5.0) +
        0.10 * (internship_months / 8.0) +
        0.08 * ((aptitude_score - 40) / 60.0) +
        0.07 * ((communication_score - 40) / 60.0) +
        np.random.normal(0, 0.08, num_samples)  # realistic real-world noise
    )

    # Threshold for placement
    placed = (latent_score >= 0.48).astype(int)

    df = pd.DataFrame({
        "cgpa": np.round(cgpa, 2),
        "num_skills": num_skills,
        "num_projects": num_projects,
        "num_certifications": num_certs,
        "internship_months": internship_months,
        "aptitude_score": np.round(aptitude_score, 1),
        "communication_score": np.round(communication_score, 1),
        "placed": placed,
        "data_origin": "Demo/Synthetic Data (Realistic Multi-Feature Placement Benchmark)"
    })

    csv_path = BASE_DIR / "placement_data.csv"
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {num_samples} records saved to {csv_path}")
    print(f"[Dataset] Overall Placement Rate: {df['placed'].mean() * 100:.1f}%")
    return df

def train_and_evaluate_models():
    csv_path = BASE_DIR / "placement_data.csv"
    if not csv_path.exists():
        df = generate_benchmark_dataset()
    else:
        df = pd.read_csv(csv_path)

    features = [
        "cgpa",
        "num_skills",
        "num_projects",
        "num_certifications",
        "internship_months",
        "aptitude_score",
        "communication_score"
    ]
    target = "placed"

    X = df[features]
    y = df[target]

    # 80/20 train/test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=7, random_state=42)
    }

    results = {}
    best_f1 = -1.0
    best_model_name = ""
    best_model_obj = None

    for name, clf in models.items():
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
            "tn": cm[0][0],
            "fp": cm[0][1],
            "fn": cm[1][0],
            "tp": cm[1][1],
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        }

        print(f"\nModel: {name}")
        print(f"  Accuracy:  {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f}")
        print(f"  F1 Score:  {f1:.4f}")
        print(f"  Confusion Matrix: {cm}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    # Extract feature importance from best model
    feature_importances = {}
    if hasattr(best_model_obj, "feature_importances_"):
        for feat, imp in zip(features, best_model_obj.feature_importances_):
            feature_importances[feat] = round(float(imp), 4)
    elif hasattr(best_model_obj, "coef_"):
        for feat, imp in zip(features, best_model_obj.coef_[0]):
            feature_importances[feat] = round(float(abs(imp)), 4)

    metrics_payload = {
        "dataset_origin": "Demo/Synthetic Data - Evaluated on 20% Held-Out Test Set (300 Samples)",
        "feature_names": features,
        "models": results,
        "best_model": best_model_name,
        "feature_importances": feature_importances,
        "train_set_size": len(X_train),
        "test_set_size": len(X_test)
    }

    # Save metrics JSON
    metrics_file = BASE_DIR / "model_evaluation_metrics.json"
    with open(metrics_file, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    # Save best model
    model_file = BASE_DIR / "best_placement_model.joblib"
    joblib.dump(best_model_obj, model_file)

    print(f"\n[ML Pipeline Complete] Best Model '{best_model_name}' persisted to {model_file}")
    return metrics_payload

if __name__ == "__main__":
    generate_benchmark_dataset()
    train_and_evaluate_models()
