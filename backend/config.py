import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Database configuration: defaults to SQLite for zero-config, supports MySQL via environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'careercompass.db'}"
)

# Upload directory for resumes
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

# ML model directory
ML_DIR = BASE_DIR / "ml"
ML_DIR.mkdir(exist_ok=True)
MODEL_PATH = ML_DIR / "best_placement_model.joblib"
METRICS_PATH = ML_DIR / "model_evaluation_metrics.json"

_DEFAULT_SECRET = "careercompass-secure-secret-key-2026"
SECRET_KEY = os.getenv("SECRET_KEY", _DEFAULT_SECRET)
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")

# Warn if the insecure default secret key is used outside of local dev
if SECRET_KEY == _DEFAULT_SECRET and not DEBUG:
    import warnings
    warnings.warn(
        "SECURITY WARNING: SECRET_KEY is set to the insecure default value. "
        "Set the SECRET_KEY environment variable to a random secret before deploying.",
        stacklevel=1
    )
