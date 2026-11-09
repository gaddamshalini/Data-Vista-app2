from datetime import datetime, date
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import FreeInternshipOpportunity

free_internships_bp = Blueprint("free_internships", __name__, url_prefix="/api/free-internships")

def is_admin():
    role = request.headers.get("X-User-Role", "").strip().lower()
    if role == "admin":
        return True
    role_param = request.args.get("role", "").strip().lower()
    return role_param == "admin"

def is_valid_url(url_str):
    if not url_str or not isinstance(url_str, str):
        return False
    try:
        parsed = urlparse(url_str.strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False

@free_internships_bp.route("", methods=["GET"])
def get_free_internships():
    """
    Returns available free internship opportunities directly.
    Only displays verified, non-expired, free-to-apply opportunities to students.
    Admins can pass include_all=true to inspect all listings.
    """
    include_all = request.args.get("include_all", "false").lower() == "true" and is_admin()

    db = SessionLocal()
    try:
        query = db.query(FreeInternshipOpportunity)

        if not include_all:
            # Active and verified free-to-apply only
            query = query.filter(
                FreeInternshipOpportunity.is_active == True,
                FreeInternshipOpportunity.free_to_apply == True
            )

        items = query.order_by(FreeInternshipOpportunity.id.asc()).all()

        results = []
        for opp in items:
            # Filter out expired for non-admin viewers
            if not include_all and opp.is_expired():
                continue
            results.append(opp.to_dict())

        return jsonify({
            "success": True,
            "data": results,
            "total": len(results),
            "verified_count": sum(1 for r in results if r.get("free_to_apply"))
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@free_internships_bp.route("/<int:item_id>", methods=["GET"])
def get_free_internship_detail(item_id):
    """Get single opportunity detail."""
    db = SessionLocal()
    try:
        opp = db.query(FreeInternshipOpportunity).filter(FreeInternshipOpportunity.id == item_id).first()
        if not opp:
            return jsonify({"success": False, "error": "Opportunity not found."}), 404
        return jsonify({"success": True, "data": opp.to_dict()})
    finally:
        db.close()

@free_internships_bp.route("", methods=["POST"])
def add_free_internship():
    """
    Authorized Admin endpoint to manually add, verify and publish a free internship opportunity.
    """
    if not is_admin():
        return jsonify({"success": False, "error": "Forbidden: Administrative credentials required."}), 403

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    organization = (data.get("organization") or "").strip()
    domain = (data.get("domain") or "").strip()
    apply_url = (data.get("apply_url") or "").strip()
    official_source = (data.get("official_source") or "").strip()
    stipend_type = (data.get("stipend_type") or "Paid Stipend").strip()
    stipend_amount = (data.get("stipend_amount") or "").strip()
    duration = (data.get("duration") or "").strip()
    eligibility = (data.get("eligibility") or "").strip()
    application_deadline = (data.get("application_deadline") or "").strip()
    free_to_apply = bool(data.get("free_to_apply", True))
    verification_status = (data.get("verification_status") or "Verified Official").strip()

    if not title or not organization or not domain:
        return jsonify({"success": False, "error": "Title, organization, and domain are required."}), 400

    if not apply_url or not is_valid_url(apply_url):
        return jsonify({"success": False, "error": "A valid official application HTTP/HTTPS URL is required."}), 400

    if not official_source:
        official_source = organization + " Official Portal"

    # Enforce free-to-apply constraint
    if not free_to_apply:
        return jsonify({"success": False, "error": "Only opportunities verified as 100% free to apply can be added."}), 400

    db = SessionLocal()
    try:
        new_opp = FreeInternshipOpportunity(
            title=title,
            organization=organization,
            domain=domain,
            duration=duration or None,
            stipend_type=stipend_type,
            stipend_amount=stipend_amount or ("Unpaid" if "unpaid" in stipend_type.lower() else "As per industry scale"),
            eligibility=eligibility or None,
            application_deadline=application_deadline or "Rolling / Open Throughout Year",
            official_source=official_source,
            apply_url=apply_url,
            source_url=(data.get("source_url") or "").strip() or apply_url,
            free_to_apply=True,
            verification_status=verification_status,
            is_active=True
        )
        db.add(new_opp)
        db.commit()
        db.refresh(new_opp)

        return jsonify({
            "success": True,
            "message": "Free internship opportunity added and published successfully.",
            "data": new_opp.to_dict()
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@free_internships_bp.route("/<int:item_id>", methods=["PUT"])
def update_free_internship(item_id):
    """
    Authorized Admin endpoint to edit an existing opportunity.
    """
    if not is_admin():
        return jsonify({"success": False, "error": "Forbidden: Administrative credentials required."}), 403

    data = request.get_json() or {}
    db = SessionLocal()
    try:
        opp = db.query(FreeInternshipOpportunity).filter(FreeInternshipOpportunity.id == item_id).first()
        if not opp:
            return jsonify({"success": False, "error": "Opportunity not found."}), 404

        if "title" in data:
            opp.title = data["title"].strip()
        if "organization" in data:
            opp.organization = data["organization"].strip()
        if "domain" in data:
            opp.domain = data["domain"].strip()
        if "duration" in data:
            opp.duration = data["duration"].strip()
        if "stipend_type" in data:
            opp.stipend_type = data["stipend_type"].strip()
        if "stipend_amount" in data:
            opp.stipend_amount = data["stipend_amount"].strip()
        if "eligibility" in data:
            opp.eligibility = data["eligibility"].strip()
        if "application_deadline" in data:
            opp.application_deadline = data["application_deadline"].strip()
        if "official_source" in data:
            opp.official_source = data["official_source"].strip()
        if "apply_url" in data:
            url = data["apply_url"].strip()
            if not is_valid_url(url):
                return jsonify({"success": False, "error": "Invalid apply URL."}), 400
            opp.apply_url = url
        if "source_url" in data:
            opp.source_url = data["source_url"].strip()
        if "free_to_apply" in data:
            opp.free_to_apply = bool(data["free_to_apply"])
        if "verification_status" in data:
            opp.verification_status = data["verification_status"].strip()
        if "is_active" in data:
            opp.is_active = bool(data["is_active"])

        opp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(opp)

        return jsonify({
            "success": True,
            "message": "Opportunity updated successfully.",
            "data": opp.to_dict()
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@free_internships_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_free_internship(item_id):
    """
    Authorized Admin endpoint to delete an opportunity.
    """
    if not is_admin():
        return jsonify({"success": False, "error": "Forbidden: Administrative credentials required."}), 403

    db = SessionLocal()
    try:
        opp = db.query(FreeInternshipOpportunity).filter(FreeInternshipOpportunity.id == item_id).first()
        if not opp:
            return jsonify({"success": False, "error": "Opportunity not found."}), 404

        db.delete(opp)
        db.commit()
        return jsonify({"success": True, "message": "Opportunity deleted successfully."})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@free_internships_bp.route("/<int:item_id>/toggle-active", methods=["PATCH"])
def toggle_free_internship_active(item_id):
    """
    Quick toggle to activate / deactivate an opportunity.
    """
    if not is_admin():
        return jsonify({"success": False, "error": "Forbidden: Administrative credentials required."}), 403

    db = SessionLocal()
    try:
        opp = db.query(FreeInternshipOpportunity).filter(FreeInternshipOpportunity.id == item_id).first()
        if not opp:
            return jsonify({"success": False, "error": "Opportunity not found."}), 404

        opp.is_active = not opp.is_active
        opp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(opp)

        return jsonify({
            "success": True,
            "message": f"Opportunity is now {'Active' if opp.is_active else 'Deactivated'}.",
            "is_active": opp.is_active
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
