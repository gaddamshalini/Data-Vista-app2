import hashlib
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import UserAccount, Student, AccountActivity
from sqlalchemy import or_

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


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    One-step registration: creates both Student record and UserAccount together.
    Requires: student_id, name, branch, email (used as login), password.
    Prevents duplicate Student IDs and duplicate account emails.
    """
    data = request.get_json(silent=True) or {}
    student_id = (data.get("student_id") or "").strip().upper()
    name = (data.get("name") or "").strip()
    branch = (data.get("branch") or "").strip()
    email = (data.get("email") or data.get("college_email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not student_id or not name or not branch:
        return jsonify({"success": False, "error": "Student ID, Name, and Branch are required."}), 400
    if not email:
        return jsonify({"success": False, "error": "Email address is required for account creation."}), 400
    if not password or len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters."}), 400

    db = SessionLocal()
    try:
        # Check duplicate student_id
        if db.query(Student).filter(Student.student_id == student_id).first():
            return jsonify({"success": False,
                            "error": f"Student ID '{student_id}' is already registered. Please log in."}), 409

        # Check duplicate email in UserAccount
        if db.query(UserAccount).filter(UserAccount.email.ilike(email)).first():
            return jsonify({"success": False,
                            "error": f"An account with email '{email}' already exists. Please log in."}), 409

        # This endpoint handles the full registration — the student record creation
        # is left to POST /api/students (called by RegisterStudentModal).
        # Here we just validate that the student record already exists (created first).
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return jsonify({"success": False,
                            "error": "Student profile not found. Create the student profile first."}), 404

        # Create UserAccount
        user = UserAccount(
            username=student_id,
            email=email,
            password_hash=hash_pw(password),
            role="student",
            student_ref=student_id,
            full_name=name or student.name
        )
        db.add(user)
        db.flush()

        log_activity(db, student_id, "account_created", f"Account registered for {name or student.name}")
        db.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully. You can now log in.",
            "student_id": student_id
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate a student or admin.
    Accepts: { username, password, role }
    username can be student_id OR registered email.
    Returns the authenticated user object + full student profile data.
    """
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    requested_role = (data.get("role") or "student").lower()

    if not username:
        return jsonify({"success": False, "error": "Student ID or email is required."}), 400
    if not password:
        return jsonify({"success": False, "error": "Password is required."}), 400

    db = SessionLocal()
    try:
        # 1. Try UserAccount by username (student_id)
        user = db.query(UserAccount).filter(UserAccount.username.ilike(username)).first()

        # 2. Try UserAccount by email
        if not user:
            user = db.query(UserAccount).filter(UserAccount.email.ilike(username)).first()

        # 3. For admins only: also check by username without student record requirement
        if not user and requested_role == "admin":
            return jsonify({"success": False,
                            "error": "Admin account not found."}), 404

        # 4. For students: if no UserAccount yet but Student row exists,
        #    we do NOT auto-create anymore — the student must register properly.
        if not user:
            student = db.query(Student).filter(
                (Student.student_id.ilike(username)) |
                (Student.email.ilike(username)) |
                (Student.personal_email.ilike(username)) |
                (Student.college_email.ilike(username))
            ).first()
            if student:
                return jsonify({
                    "success": False,
                    "error": (
                        f"No login account found for '{username}'. "
                        "Please register first to create your account."
                    )
                }), 404
            return jsonify({"success": False,
                            "error": "Account not found. Please check your Student ID or email."}), 404

        # Role guard for admin
        if requested_role == "admin" and user.role != "admin":
            return jsonify({"success": False,
                            "error": "This account does not have Admin privileges."}), 403

        # Strict password validation — no backdoor bypass
        if hash_pw(password) != user.password_hash:
            log_activity(db, user.student_ref or user.username, "login_failed",
                         "Incorrect password attempt")
            db.commit()
            return jsonify({"success": False, "error": "Incorrect password. Please try again."}), 401

        # Log successful login
        ref_id = user.student_ref or user.username
        log_activity(db, ref_id, "login", f"Logged in as {user.role}")
        db.commit()

        # Fetch the linked student profile
        student_data = None
        if user.role == "student" and user.student_ref:
            student = db.query(Student).filter(
                Student.student_id == user.student_ref
            ).first()
            if student:
                student_data = student.to_dict()

        return jsonify({
            "success": True,
            "message": f"Welcome back, {user.full_name}!",
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


@auth_bp.route("/me", methods=["POST"])
def me():
    """
    Restore session on page refresh.
    Accepts: { student_id, role }
    Returns the student profile for the given student_id if the account exists.
    Used by the frontend to re-hydrate auth state after a browser refresh.
    """
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip().upper()
    role = (data.get("role") or "student").lower()

    if not student_id:
        return jsonify({"success": False, "error": "student_id is required."}), 400

    db = SessionLocal()
    try:
        if role == "admin":
            user = db.query(UserAccount).filter(
                UserAccount.username.ilike(student_id),
                UserAccount.role == "admin"
            ).first()
            if not user:
                return jsonify({"success": False, "error": "Admin account not found."}), 404
            return jsonify({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                    "student_id": user.student_ref
                },
                "student": None
            })

        # Student path
        user = db.query(UserAccount).filter(
            UserAccount.username.ilike(student_id)
        ).first()
        if not user:
            return jsonify({"success": False, "error": "Session expired. Please log in again."}), 401

        student = db.query(Student).filter(
            Student.student_id == user.student_ref
        ).first()
        if not student:
            return jsonify({"success": False, "error": "Student profile not found."}), 404

        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "student_id": user.student_ref
            },
            "student": student.to_dict()
        })

    except Exception as e:
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
    """Allow a student to change their password."""
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip().upper()
    current_pw = (data.get("current_password") or "").strip()
    new_pw = (data.get("new_password") or "").strip()

    if not student_id or not current_pw or not new_pw:
        return jsonify({"success": False,
                        "error": "Student ID, current password and new password are all required."}), 400
    if len(new_pw) < 8:
        return jsonify({"success": False,
                        "error": "New password must be at least 8 characters."}), 400

    db = SessionLocal()
    try:
        user = db.query(UserAccount).filter(UserAccount.username.ilike(student_id)).first()
        if not user:
            return jsonify({"success": False,
                            "error": f"No account found for Student ID '{student_id}'."}), 404

        if hash_pw(current_pw) != user.password_hash:
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
    Called from RegisterStudentModal after the student record is created.
    Creates a UserAccount with the student's chosen password.
    Prevents duplicate accounts by email.
    """
    data = request.get_json() or {}
    student_id = (data.get("student_id") or "").strip().upper()
    password = (data.get("password") or "").strip()
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()

    if not student_id or not password:
        return jsonify({"success": False, "error": "Student ID and password are required."}), 400
    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters."}), 400

    db = SessionLocal()
    try:
        # Don't overwrite an existing account
        existing = db.query(UserAccount).filter(UserAccount.username.ilike(student_id)).first()
        if existing:
            return jsonify({"success": True, "message": "Account already exists."})

        # Check email uniqueness
        if email and db.query(UserAccount).filter(UserAccount.email.ilike(email)).first():
            return jsonify({
                "success": False,
                "error": f"An account with email '{email}' already exists. Use a different email or log in."
            }), 409

        # Verify student record exists
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
                     f"Account created for {full_name or student.name}")
        db.commit()

        return jsonify({"success": True, "message": "Account created successfully."})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route("/check-email", methods=["POST"])
def check_email():
    """Check if an email is already registered. Used during registration."""
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "error": "Email is required."}), 400

    db = SessionLocal()
    try:
        exists = db.query(UserAccount).filter(UserAccount.email.ilike(email)).first() is not None
        return jsonify({"success": True, "exists": exists})
    finally:
        db.close()


@auth_bp.route("/activity/<student_id>", methods=["GET"])
def get_activity_history(student_id):
    """Return account activity history for a student."""
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
