import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import SECRET_KEY, DEBUG
from database import engine, Base
from routes.students import students_bp
from routes.analytics import analytics_bp
from routes.careers import careers_bp
from routes.internships import internships_bp
from routes.ml_readiness import ml_bp
from routes.nlp_resume import nlp_bp
from routes.auth import auth_bp
from routes.resumes import resumes_bp
from routes.assessments import assessments_bp
from routes.learning import learning_bp
from routes.insights import insights_bp
from routes.admin import admin_bp
from routes.notifications import notifications_bp
from routes.free_internships import free_internships_bp
from routes.tasks import tasks_bp
from routes.coding import coding_bp
from routes.interviews import interviews_bp

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    # Enable CORS for frontend clients
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Auto-initialize database tables if not exist
    Base.metadata.create_all(bind=engine)

    # Register API Blueprints
    app.register_blueprint(students_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(internships_bp)
    app.register_blueprint(ml_bp)
    app.register_blueprint(nlp_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(resumes_bp)
    app.register_blueprint(assessments_bp)
    app.register_blueprint(learning_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(free_internships_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(coding_bp)
    app.register_blueprint(interviews_bp)

    DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

    @app.route("/assets/<path:path>")
    def serve_dist_assets(path):
        assets_dir = os.path.join(DIST_DIR, "assets")
        if os.path.exists(os.path.join(assets_dir, path)):
            return send_from_directory(assets_dir, path)
        return jsonify({"error": "Asset not found"}), 404

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        if path.startswith("api/") or path == "api":
            return jsonify({"error": "API endpoint not found"}), 404

        file_path = os.path.join(DIST_DIR, path)
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(DIST_DIR, path)

        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return send_from_directory(DIST_DIR, "index.html")

        return jsonify({
            "project": "DATA VISTA Intelligence Platform",
            "version": "2.1.0",
            "status": "Operational",
            "domain": "Data Analytics + Career, Internship & Placement Intelligence"
        })

    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_status = "Connected"
        try:
            with engine.connect() as conn:
                pass
        except Exception as e:
            db_status = f"Disconnected: {str(e)}"

        return jsonify({
            "status": "healthy",
            "application": "DATA VISTA",
            "database": db_status
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"\n=======================================================")
    print(f" DATA VISTA API running on http://127.0.0.1:{port}")
    print(f" Relational Database & Analytics Engine Active")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=DEBUG)
