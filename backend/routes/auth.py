import hashlib
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import UserAccount, Student

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user as either Student or Admin.
    Body: { "username": "admin" or student_id, "password": "...", "role": "admin"|"student" }
    """
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    requested_role = (data.get("role") or "student").lower()

    if not username:
        return jsonify({"success": False, "error": "Username or Student ID is required."}), 400

    db = SessionLocal()
    try:
        # Check in UserAccount table
        user = db.query(UserAccount).filter(UserAccount.username.ilike(username)).first()

        # If user account not found but username matches an existing student_id
        if not user:
            student = db.query(Student).filter(Student.student_id.ilike(username)).first()
            if student:
                # Create user account on the fly for existing student
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

        # Validate role
        if requested_role == "admin" and user.role != "admin":
            return jsonify({"success": False, "error": "Unauthorized. This account does not have Admin privileges."}), 403

        # Password validation:
        # Admin: must match stored hash or the default 'admin123' demo password.
        # Student: must match stored hash or the default 'password123' demo password.
        if user.role == "admin":
            if password and hash_pw(password) != user.password_hash and password != "admin123":
                return jsonify({"success": False, "error": "Invalid Admin password."}), 401
        else:
            if password and user.password_hash and hash_pw(password) != user.password_hash and password != "password123":
                return jsonify({"success": False, "error": "Invalid password. Please try again."}), 401

        # Fetch student profile details if student
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

@auth_bp.route("/set-password", methods=["POST"])
def set_password():
    """
    Allow a student to change their password.
    Body: { "student_id": "CS2024001", "current_password": "password123", "new_password": "mynewpass" }
    """
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
        # Find user account
        user = db.query(UserAccount).filter(UserAccount.username.ilike(student_id)).first()

        # Auto-create account if student exists but no account yet
        if not user:
            student = db.query(Student).filter(Student.student_id.ilike(student_id)).first()
            if not student:
                return jsonify({"success": False, "error": f"No student found with ID '{student_id}'. Please check and try again."}), 404
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

        # Verify current password (accept 'password123' as universal default)
        if hash_pw(current_pw) != user.password_hash and current_pw != "password123":
            return jsonify({"success": False, "error": "Current password is incorrect."}), 401

        # Update to new password
        user.password_hash = hash_pw(new_pw)
        db.commit()

        return jsonify({
            "success": True,
            "message": "Password updated successfully. Please log in with your new password."
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()



def list_accounts():
    """List registered user accounts for quick testing/demo."""
    db = SessionLocal()
    try:
        users = db.query(UserAccount).all()
        return jsonify({
            "success": True,
            "data": [u.to_dict() for u in users]
        })
    finally:
        db.close()
