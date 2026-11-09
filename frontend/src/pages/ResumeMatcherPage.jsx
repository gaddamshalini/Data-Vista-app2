import React, { useState, useEffect } from "react";
import {
  FileSearch,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Briefcase
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getSampleJDs, matchResume } from "../services/api";

export default function ResumeMatcherPage() {
  const { activeStudent } = useStudent();
  const [sampleJDs, setSampleJDs] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState("");
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Load sample JDs and populate initial resume text from active student profile
  useEffect(() => {
    async function loadJDs() {
      try {
        const res = await getSampleJDs();
        if (res.success && res.data.length > 0) {
          setSampleJDs(res.data);
          setSelectedJdId(res.data[0].id);
          setJobText(res.data[0].text);
        }
      } catch (err) {
        console.error("Failed to load sample JDs:", err);
      }
    }
    loadJDs();

    if (activeStudent) {
      // Auto-construct realistic resume summary from student profile
      const skillsStr = (activeStudent.skills || []).join(", ");
      const certsRaw = activeStudent.certifications || [];
      const certsStr = certsRaw.map((c) =>
        typeof c === "string" ? c : c?.name || ""
      ).filter(Boolean).join(", ");
      const projsStr = (activeStudent.projects || [])
        .map((p) => `${p.title}: ${p.description} (Tech: ${p.technologies})`)
        .join(". ");
      const internshipsStr = (activeStudent.internships || [])
        .map((i) => `${i.role} at ${i.company} (${i.duration_months} months)`)
        .join("; ") || `${activeStudent.num_internships || 0} internship(s)`;

      const autoResume = `Name: ${activeStudent.name}
Degree: B.Tech in ${activeStudent.branch}, Year ${activeStudent.year}
Academic CGPA: ${activeStudent.cgpa} / 10.0

Technical Skills:
${skillsStr || "Not listed"}

Certifications:
${certsStr || "None"}

Academic & Capstone Projects:
${projsStr || "None listed"}

Experience & Internships:
${internshipsStr}. Professional focus on ${activeStudent.preferred_career}.`;

      setResumeText(autoResume);
    }
  }, [activeStudent]);

  const handleJdSelectChange = (e) => {
    const jdId = e.target.value;
    setSelectedJdId(jdId);
    const found = sampleJDs.find((j) => j.id === jdId);
    if (found) {
      setJobText(found.text);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleRunMatch = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMatchResult(null);

    try {
      setIsProcessing(true);
      let res;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume_file", resumeFile);
        formData.append("job_text", jobText);
        res = await matchResume(formData, true);
      } else {
        if (!resumeText.trim()) {
          setErrorMessage("Please enter resume text or upload a resume file.");
          setIsProcessing(false);
          return;
        }
        res = await matchResume({
          resume_text: resumeText,
          job_text: jobText
        });
      }

      if (res.success) {
        setMatchResult(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || "NLP matching failed. Check inputs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSearch size={22} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                NLP Resume–Job Matching Engine
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              TF-IDF (Term Frequency–Inverse Document Frequency) vectorization, Cosine Similarity, and entity extraction
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge badge-blue">
              NLP Engine: Active
            </span>
          </div>
        </div>
      </div>

      {/* Two Column: Resume Input vs Job Description */}
      <form onSubmit={handleRunMatch}>
        <div className="grid-2">
          {/* Left: Resume Ingestion */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <FileText size={18} color="var(--brand-blue)" /> Candidate Resume Content
                </div>
                <div className="card-subtitle">
                  Auto-populated from {activeStudent?.name}'s profile or upload PDF/TXT
                </div>
              </div>
            </div>

            {/* File Upload Box */}
            <div
              style={{
                border: "2px dashed var(--border-subtle)",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                backgroundColor: "var(--bg-subtle)",
                marginBottom: "14px"
              }}
            >
              <Upload size={24} color="var(--brand-blue)" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary-navy)" }}>
                {resumeFile ? `Selected: ${resumeFile.name}` : "Upload Resume File (PDF or TXT)"}
              </div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                style={{ marginTop: "8px", fontSize: "0.78rem" }}
              />
              {resumeFile && (
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  style={{ display: "block", margin: "6px auto 0", fontSize: "0.75rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Clear File (Use Text Below)
                </button>
              )}
            </div>

            {/* Raw Text Box */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Resume Text (Direct Edit)</label>
              <textarea
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="form-textarea"
                placeholder="Paste complete resume content here..."
                disabled={Boolean(resumeFile)}
                style={{ fontSize: "0.82rem", lineHeight: 1.4 }}
              />
            </div>
          </div>

          {/* Right: Job Description */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Briefcase size={18} color="var(--brand-blue)" /> Target Job Description (JD)
                </div>
                <div className="card-subtitle">Select industry JD template or paste custom requirements</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose Sample Industry JD:</label>
              <select
                value={selectedJdId}
                onChange={handleJdSelectChange}
                className="form-select"
              >
                {sampleJDs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Job Description Text</label>
              <textarea
                rows={10}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="form-textarea"
                placeholder="Paste hiring job description..."
                style={{ fontSize: "0.82rem", lineHeight: 1.4 }}
              />
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <button
            type="submit"
            disabled={isProcessing}
            className="btn btn-primary"
            style={{ padding: "12px 32px", fontSize: "0.95rem" }}
          >
            <Cpu size={16} />
            {isProcessing ? "Extracting Entities & Computing Cosine Distance..." : "Compute Resume–Job NLP Match"}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="card" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)", padding: "14px", border: "1px solid #fecaca", textAlign: "center" }}>
          {errorMessage}
        </div>
      )}

      {/* NLP Match Results Display */}
      {matchResult && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Sparkles size={18} color="var(--brand-blue)" /> NLP Matching Diagnostics
              </div>
              <div className="card-subtitle">
                Calibrated match score based on extracted technical entities & TF-IDF vector space similarity
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: matchResult.match_percentage >= 75 ? "var(--success)" : "var(--brand-blue)" }}>
                {matchResult.match_percentage}%
              </div>
              <span className="badge badge-blue">
                Overall Resume Match
              </span>
            </div>
          </div>

          {/* Mathematical NLP Metrics Strip */}
          <div className="grid-3" style={{ marginBottom: "20px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                TF-IDF Cosine Similarity
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-navy)", marginTop: "2px" }}>
                {matchResult.cosine_similarity}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Range: 0.0 to 1.0</div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Skill Coverage Ratio
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--success)", marginTop: "2px" }}>
                {matchResult.total_matched} / {matchResult.total_matched + matchResult.total_missing}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>JD required skills satisfied</div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Document Word Counts
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--purple)", marginTop: "2px" }}>
                {matchResult.resume_word_count} / {matchResult.job_word_count}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Resume words / JD words</div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid-2">
            {/* Matched Skills */}
            <div style={{ padding: "16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--success)", marginBottom: "8px" }}>
                <CheckCircle2 size={16} /> Matched Skills Extracted ({matchResult.matched_skills.length}):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {matchResult.matched_skills.length === 0 ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No exact keyword matches found.</span>
                ) : (
                  matchResult.matched_skills.map((s) => (
                    <span key={s} className="badge badge-green" style={{ fontSize: "0.8rem" }}>
                      ✓ {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div style={{ padding: "16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--danger)", marginBottom: "8px" }}>
                <XCircle size={16} /> Missing Skills from Job Description ({matchResult.missing_skills.length}):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {matchResult.missing_skills.length === 0 ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--success)" }}>None! All JD required skills present.</span>
                ) : (
                  matchResult.missing_skills.map((s) => (
                    <span key={s} className="badge badge-red" style={{ fontSize: "0.8rem" }}>
                      ✗ {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommended Skills to Add */}
          {matchResult.recommended_skills.length > 0 && (
            <div style={{ marginTop: "16px", padding: "14px 18px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "0.84rem", color: "#1e3a8a" }}>
              <strong>Recommended Resume Additions: </strong>
              To significantly boost ATS keyword screening scores for this role, add demonstrable projects or coursework covering:{" "}
              <strong>{matchResult.recommended_skills.join(", ")}</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
