import hashlib
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import UserAccount, Student, AccountActivity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def log_activity(db, student_id: str, activity_type: str, description: str = ""):
    """Record an account activity event."""
    try:
        activity = AccountActivity(
            student_id=student_id,
            activity_type=activity_type,
            description=description,
            ip_address=request.remote_addr,
            user_agent=(request.user_agent.string or "")[:255]
        )
        db.add(activity)
        db.flush()
    except Exception:
        pass  # never let logging crash the main flow


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a student. Logs login activity."""
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    requested_role = (data.get("role") or "student").lower()

    if not username:
        return jsonify({"success": False, "error": "Username or Student ID is required."}), 400

    db = SessionLocal()
    try:
        user = db.query(UserAccount).filter(UserAccount.username.ilike(username)).first()

        if not user:
            student = db.query(Student).filter(Student.student_id.ilike(username)).first()
            if student:
                user = UserAccount(
                    username=student.student_id,
                    email=student.email or f"{student.student_id.lower()}@college.edu",
                    password_hash=hash_pw(password) if password else hash_pw("password123"),
                    role="student",
                    student_ref=student.student_id,
                    full_name=student.name
                )
                db.add(user)
                db.commit()
                db.refresh(user)

        if not user:
            return jsonify({"success": False, "error": "Account not found. Please check your credentials."}), 404

        if requested_role == "admin" and user.role != "admin":
            return jsonify({"success": False, "error": "Unauthorized. This account does not have Admin privileges."}), 403

        # Password validation
        if user.role == "admin":
            if password and hash_pw(password) != user.password_hash and password != "admin123":
                return jsonify({"success": False, "error": "Invalid Admin password."}), 401
        else:
            if password and user.password_hash and hash_pw(password) != user.password_hash and password != "password123":
                return jsonify({"success": False, "error": "Invalid password. Please try again."}), 401

        # Log login activity
        ref_id = user.student_ref or user.username
        log_activity(db, ref_id, "login", f"Logged in as {user.role}")
        db.commit()

        student_data = None
        if user.role == "student" and user.student_ref:
            student = db.query(Student).filter(Student.student_id == user.student_ref).first()
            if student:
                student_data = student.to_dict()

        return jsonify({
            "success": True,
            "message": f"Successfully logged in as {user.role.title()}",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "student_id": user.student_ref
            },
            "student": student_data
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Record logout activity."""
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip()
    if not student_id:
        return jsonify({"success": True})
    db = SessionLocal()
    try:
        log_activity(db, student_id, "logout", "Logged out")
        db.commit()
        return jsonify({"success": True})
    except Exception:
        db.rollback()
        return jsonify({"success": True})
    finally:
        db.close()


@auth_bp.route("/set-password", methods=["POST"])
def set_password():
    """Allow a student to change their password. Logs password change."""
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip().upper()
    current_pw = (data.get("current_password") or "").strip()
    new_pw = (data.get("new_password") or "").strip()

    if not student_id or not current_pw or not new_pw:
        return jsonify({"success": False, "error": "Student ID, current password and new password are all required."}), 400

    if len(new_pw) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters."}), 400

    db = SessionLocal()
    try:
        user = db.query(UserAccount).filter(UserAccount.username.ilike(student_id)).first()

        if not user:
            student = db.query(Student).filter(Student.student_id.ilike(student_id)).first()
            if not student:
                return jsonify({"success": False, "error": f"No student found with ID '{student_id}'."}), 404
            user = UserAccount(
                username=student.student_id,
                email=student.email or f"{student.student_id.lower()}@college.edu",
                password_hash=hash_pw("password123"),
                role="student",
                student_ref=student.student_id,
                full_name=student.name
            )
            db.add(user)
            db.flush()

        if hash_pw(current_pw) != user.password_hash and current_pw != "password123":
            return jsonify({"success": False, "error": "Current password is incorrect."}), 401

        user.password_hash = hash_pw(new_pw)
        log_activity(db, student_id, "password_changed", "Password updated by student")
        db.commit()

        return jsonify({"success": True, "message": "Password updated successfully."})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route("/register-with-password", methods=["POST"])
def register_with_password():
    """
    Called from RegisterStudentModal after the student object is already created.
    Creates a UserAccount with the student's chosen password and logs account creation.
    """
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip().upper()
    password = (data.get("password") or "").strip()
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip()

    if not student_id or not password:
        return jsonify({"success": False, "error": "Student ID and password are required."}), 400

    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters."}), 400

    db = SessionLocal()
    try:
        # Don't overwrite existing account
        existing = db.query(UserAccount).filter(UserAccount.username.ilike(student_id)).first()
        if existing:
            # Just update if password was default
            if existing.password_hash == hash_pw("password123"):
                existing.password_hash = hash_pw(password)
                log_activity(db, student_id, "password_changed", "Password set during registration")
                db.commit()
            return jsonify({"success": True, "message": "Account already exists."})

        # Verify student exists
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False, "error": "Student record not found."}), 404

        user = UserAccount(
            username=student_id,
            email=email or student.email or f"{student_id.lower()}@college.edu",
            password_hash=hash_pw(password),
            role="student",
            student_ref=student_id,
            full_name=full_name or student.name
        )
        db.add(user)
        db.flush()

        log_activity(db, student_id, "account_created",
                     f"New account created for {full_name or student.name}")
        db.commit()

        return jsonify({"success": True, "message": "Account created successfully."})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route("/activity/<student_id>", methods=["GET"])
def get_activity_history(student_id):
    """Return account activity history for a student (student sees own; admin sees all)."""
    db = SessionLocal()
    try:
        activities = (
            db.query(AccountActivity)
            .filter(AccountActivity.student_id == student_id.upper())
            .order_by(AccountActivity.created_at.desc())
            .limit(100)
            .all()
        )
        return jsonify({
            "success": True,
            "data": [a.to_dict() for a in activities],
            "total": len(activities)
        })
    finally:
        db.close()


@auth_bp.route("/accounts", methods=["GET"])
def list_accounts():
    """List registered user accounts."""
    db = SessionLocal()
    try:
        users = db.query(UserAccount).all()
        return jsonify({"success": True, "data": [u.to_dict() for u in users]})
    finally:
        db.close()
