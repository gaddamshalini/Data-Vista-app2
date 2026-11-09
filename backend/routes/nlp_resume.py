from flask import Blueprint, request, jsonify
from ml.nlp_resume import (
    match_resume_with_job, extract_text_from_pdf, SAMPLE_JOB_DESCRIPTIONS
)

nlp_bp = Blueprint("nlp_resume", __name__, url_prefix="/api/nlp")

@nlp_bp.route("/sample-jds", methods=["GET"])
def get_sample_jds():
    """Returns sample industry job descriptions for quick demonstration."""
    return jsonify({
        "success": True,
        "data": SAMPLE_JOB_DESCRIPTIONS
    })

@nlp_bp.route("/match", methods=["POST"])
def match_resume():
    """
    NLP Resume-Job Matching Endpoint:
    Accepts:
    - Multipart file upload ('resume_file', e.g. PDF or TXT) OR JSON 'resume_text'
    - 'job_text' OR 'job_id' (to match against pre-loaded sample)
    Returns:
    - Match percentage
    - Matched skills
    - Missing skills
    - Recommended skills
    - TF-IDF Cosine similarity metrics
    """
    resume_text = ""
    job_text = ""

    # Check if multipart form upload
    if "resume_file" in request.files:
        uploaded_file = request.files["resume_file"]
        filename = uploaded_file.filename.lower()
        if filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(uploaded_file.stream)
        else:
            resume_text = uploaded_file.read().decode("utf-8", errors="ignore")
        job_text = request.form.get("job_text", "")
        job_id = request.form.get("job_id", "")
    else:
        # JSON payload
        data = request.get_json(silent=True) or {}
        resume_text = data.get("resume_text", "")
        job_text = data.get("job_text", "")
        job_id = data.get("job_id", "")

    # If job_id specified without job_text, resolve from sample JDs
    if not job_text and job_id:
        for sjd in SAMPLE_JOB_DESCRIPTIONS:
            if sjd["id"] == job_id:
                job_text = sjd["text"]
                break

    if not resume_text:
        return jsonify({
            "success": False,
            "error": "Resume text or PDF file is required."
        }), 400

    if not job_text:
        return jsonify({
            "success": False,
            "error": "Job description text or job_id is required."
        }), 400

    try:
        match_result = match_resume_with_job(resume_text, job_text)
        return jsonify({
            "success": True,
            "data": match_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
