import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Image,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Award,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import {
  useStudent,
  DEFAULT_BRANCHES,
  DEFAULT_CAREERS,
  DEFAULT_SKILLS
} from "../context/StudentContext";
import { request } from "../services/api";

export default function RegisterStudentModal({ isOpen, onClose }) {
  const { registerStudent, catalog, isBackendConnected, retryConnection } = useStudent();

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    personal_email: "",
    college_email: "",
    branch: DEFAULT_BRANCHES[0],
    year: 3,
    cgpa: 8.0,
    experience_status: "Fresher",
    experience_years: 0.0,
    num_internships: 0,
    github_profile: "",
    profile_photo: "",
    preferred_career: "Data Analyst",
    education: {
      school: { name: "", year: 2020, percentage: 90.0 },
      intermediate: { college_name: "", year: 2022, percentage: 88.0 },
      degree: { institute_name: "", year: 2026, status: "Pursuing", percentage: "" }
    },
    skills: ["Python", "SQL"],
    certificates: [],
    projects: [
      { title: "Smart Analytics Dashboard", domain: "Data Analytics", description: "Built end-to-end data intelligence portal", technologies: "Python, SQL" }
    ],
    internships: []
  });

  const [selectedBranchOption, setSelectedBranchOption] = useState(DEFAULT_BRANCHES[0]);
  const [customBranchInput, setCustomBranchInput] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Other career
  const [selectedCareerOption, setSelectedCareerOption] = useState("Data Analyst");
  const [customCareerInput, setCustomCareerInput] = useState("");

  // Certificate input states
  const [certNameInput, setCertNameInput] = useState("");
  const [editingCertIndex, setEditingCertIndex] = useState(null);

  // Internship input states
  const [internForm, setInternForm] = useState({
    company: "",
    role: "Intern",
    duration_months: 3,
    stipend: 15000,
    work_mode: "Hybrid"
  });
  const [editingInternIndex, setEditingInternIndex] = useState(null);

  if (!isOpen) return null;

  const branchList =
    catalog?.branches && catalog.branches.length > 0
      ? catalog.branches
      : DEFAULT_BRANCHES;

  const careerList =
    catalog?.careers && catalog.careers.length > 0
      ? catalog.careers
      : DEFAULT_CAREERS;

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setSelectedBranchOption(val);
    if (val === "Other") {
      setFormData((prev) => ({ ...prev, branch: customBranchInput.trim() || "Other" }));
    } else {
      setFormData((prev) => ({ ...prev, branch: val }));
    }
  };

  const handleCustomBranchChange = (e) => {
    const val = e.target.value;
    setCustomBranchInput(val);
    setFormData((prev) => ({ ...prev, branch: val }));
  };

  // Profile photo handling with validation
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 2.5 MB. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profile_photo: reader.result }));
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profile_photo: "" }));
  };

  // Education change handlers
  const handleEducationChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [section]: {
          ...prev.education[section],
          [field]: value
        }
      }
    }));
  };

  // Skills
  const handleAddSkill = (skillName) => {
    if (!skillName.trim()) return;
    const clean = skillName.trim();
    if (!formData.skills.includes(clean)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, clean] }));
    }
    setCustomSkill("");
  };

  const handleRemoveSkill = (skillName) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillName)
    }));
  };

  // Certificates Management (Add, Edit, Delete, Prevent duplicates)
  const handleSaveCertificate = () => {
    const cleanName = certNameInput.trim();
    if (!cleanName) {
      setErrorMsg("Certificate name is required.");
      return;
    }

    const isDuplicate = formData.certificates.some(
      (c, idx) => (c.name || c).toLowerCase() === cleanName.toLowerCase() && idx !== editingCertIndex
    );
    if (isDuplicate) {
      setErrorMsg(`A certificate named "${cleanName}" already exists.`);
      return;
    }

    if (editingCertIndex !== null) {
      const updated = [...formData.certificates];
      updated[editingCertIndex] = { name: cleanName };
      setFormData((prev) => ({ ...prev, certificates: updated }));
      setEditingCertIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        certificates: [...prev.certificates, { name: cleanName }]
      }));
    }

    setCertNameInput("");
    setErrorMsg("");
  };

  const handleEditCertificate = (idx) => {
    const item = formData.certificates[idx];
    setCertNameInput(item.name || item);
    setEditingCertIndex(idx);
  };

  const handleDeleteCertificate = (idx) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== idx)
    }));
    if (editingCertIndex === idx) {
      setEditingCertIndex(null);
      setCertNameInput("");
    }
  };

  // Internship Records Management (Company, Duration, Role, Stipend, Mode)
  const handleSaveInternship = () => {
    const cleanCompany = internForm.company.trim();
    if (!cleanCompany) {
      setErrorMsg("Internship Company Name is required.");
      return;
    }
    const duration = parseInt(internForm.duration_months, 10);
    if (isNaN(duration) || duration <= 0) {
      setErrorMsg("Internship duration must be at least 1 month.");
      return;
    }

    const newRecord = {
      company: cleanCompany,
      role: internForm.role.trim() || "Intern",
      duration_months: duration,
      stipend: parseFloat(internForm.stipend || 0),
      work_mode: internForm.work_mode || "Hybrid"
    };

    if (editingInternIndex !== null) {
      const updated = [...formData.internships];
      updated[editingInternIndex] = newRecord;
      setFormData((prev) => ({
        ...prev,
        internships: updated,
        num_internships: updated.length
      }));
      setEditingInternIndex(null);
    } else {
      const updated = [...formData.internships, newRecord];
      setFormData((prev) => ({
        ...prev,
        internships: updated,
        num_internships: updated.length
      }));
    }

    setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
    setErrorMsg("");
  };

  const handleEditInternship = (idx) => {
    setInternForm(formData.internships[idx]);
    setEditingInternIndex(idx);
  };

  const handleDeleteInternship = (idx) => {
    const updated = formData.internships.filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      internships: updated,
      num_internships: updated.length
    }));
    if (editingInternIndex === idx) {
      setEditingInternIndex(null);
      setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
    }
  };

  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateGithub = (url) => {
    if (!url || !url.trim()) return true;
    const clean = url.trim().toLowerCase();
    return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("github.com/");
  };

  const validatePassword = (pw) => {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return "Password must contain at least one special character (!@#$%^&*...).";
    return null;
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) score++;
    if (score <= 2) return { label: "Weak", color: "#ef4444" };
    if (score <= 3) return { label: "Fair", color: "#f59e0b" };
    if (score <= 4) return { label: "Good", color: "#3b82f6" };
    return { label: "Strong", color: "#10b981" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.student_id.trim()) { setErrorMsg("Student ID is mandatory and must be unique."); return; }
    if (!formData.name.trim()) { setErrorMsg("Student Name is mandatory."); return; }
    if (!formData.personal_email.trim() || !validateEmailFormat(formData.personal_email.trim())) {
      setErrorMsg("Please enter a valid Personal Email address."); return;
    }
    if (!formData.college_email.trim() || !validateEmailFormat(formData.college_email.trim())) {
      setErrorMsg("Please enter a valid College Email address."); return;
    }

    // Password validation
    const pwError = validatePassword(password);
    if (pwError) { setErrorMsg(pwError); return; }
    if (password !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }

    if (selectedBranchOption === "Other" && !customBranchInput.trim()) {
      setErrorMsg("Please enter your custom Department / Course name."); return;
    }
    if (selectedCareerOption === "Other" && !customCareerInput.trim()) {
      setErrorMsg("Please enter your custom Career Goal."); return;
    }
    if (formData.github_profile && !validateGithub(formData.github_profile)) {
      setErrorMsg("Please enter a valid GitHub profile URL."); return;
    }

    try {
      setIsSubmitting(true);
      let normalizedGithub = formData.github_profile.trim();
      if (normalizedGithub && !normalizedGithub.startsWith("http://") && !normalizedGithub.startsWith("https://")) {
        normalizedGithub = `https://${normalizedGithub}`;
      }

      const finalCareer = selectedCareerOption === "Other" ? "Other" : selectedCareerOption;
      const finalCareerCustom = selectedCareerOption === "Other" ? customCareerInput.trim() : "";

      await registerStudent({
        ...formData,
        student_id: formData.student_id.trim().toUpperCase(),
        branch: selectedBranchOption === "Other" ? customBranchInput.trim() : selectedBranchOption,
        preferred_career: finalCareer,
        preferred_career_custom: finalCareerCustom,
        cgpa: parseFloat(formData.cgpa),
        personal_email: formData.personal_email.trim(),
        college_email: formData.college_email.trim(),
        email: formData.college_email.trim(),
        num_internships: formData.internships.length,
        experience_status: formData.experience_status,
        experience_years: formData.experience_status === "Experienced" ? parseFloat(formData.experience_years || 0) : 0.0,
        github_profile: normalizedGithub,
        year: parseInt(formData.year, 10)
      });

      // Create user account with chosen password (non-blocking — registration succeeds even if this fails)
      try {
        const studentId = formData.student_id.trim().toUpperCase();
        await request("/auth/register-with-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            password: password,
            full_name: formData.name.trim(),
            email: formData.college_email.trim()
          })
        });
      } catch (pwErr) {
        // Password registration failed but student profile was saved — not fatal
        console.warn("Password registration note:", pwErr.message);
      }

      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register student. Ensure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
              First-Time Student Registration
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Save student profile with academic credentials, educational background, certificates and internships.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Backend offline warning banner */}
        {!isBackendConnected && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--warning-bg)",
              color: "#b45309",
              borderRadius: "6px",
              fontSize: "0.82rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #fde68a"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={16} />
              <span>
                Backend API is currently offline. Ensure <strong>python app.py</strong> is running on port 5000.
              </span>
            </div>
            <button
              type="button"
              onClick={retryConnection}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "2px 8px" }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "10px 14px", backgroundColor: "var(--danger-bg)", color: "var(--danger)", borderRadius: "6px", fontSize: "0.84rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PROFILE PHOTO UPLOAD SECTION */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", marginBottom: "16px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "2px solid #cbd5e1",
                flexShrink: 0
              }}
            >
              {formData.profile_photo ? (
                <img
                  src={formData.profile_photo}
                  alt="Profile Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Image size={28} color="#94a3b8" />
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--primary-navy)", marginBottom: "4px" }}>
                Student Profile Photo
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                Upload JPEG, PNG or WEBP (Max 2.5 MB). Appears on profile and ATS resume.
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Upload size={13} /> {formData.profile_photo ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {formData.profile_photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "var(--danger)", fontSize: "0.78rem" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 1: ID & Name */}
          <div className="grid-2" style={{ marginBottom: "12px" }}>
            <div className="form-group">
              <label className="form-label">Student ID *</label>
              <input
                type="text"
                placeholder="e.g. CS2024099"
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                placeholder="Student Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 2: PART G - Personal Email & College Email */}
          <div className="grid-2" style={{ marginBottom: "12px" }}>
            <div className="form-group">
              <label className="form-label">Personal Email *</label>
              <input
                type="email"
                placeholder="e.g. yourname@gmail.com"
                required
                value={formData.personal_email}
                onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                className="form-input"
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Default contact email for ATS resume</span>
            </div>
            <div className="form-group">
              <label className="form-label">College Email *</label>
              <input
                type="email"
                placeholder="e.g. student@college.edu"
                required
                value={formData.college_email}
                onChange={(e) => setFormData({ ...formData, college_email: e.target.value })}
                className="form-input"
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Official college/university address</span>
            </div>
          </div>

          {/* Row 3: Branch & Academic Year & CGPA */}
          <div className="grid-2" style={{ marginBottom: "12px" }}>
            <div className="form-group">
              <label className="form-label">Branch / Department *</label>
              <select
                value={selectedBranchOption}
                onChange={handleBranchChange}
                className="form-select"
                required
              >
                {branchList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {selectedBranchOption === "Other" && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Enter custom department / course name *"
                    value={customBranchInput}
                    onChange={handleCustomBranchChange}
                    className="form-input"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="form-select"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">CGPA (out of 10) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Experience Status, Experience Years, GitHub Link */}
          <div className="grid-3" style={{ marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Experience Status *</label>
              <select
                value={formData.experience_status}
                onChange={(e) => setFormData({ ...formData, experience_status: e.target.value })}
                className="form-select"
              >
                <option value="Fresher">Fresher</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>

            {formData.experience_status === "Experienced" ? (
              <div className="form-group">
                <label className="form-label">Years of Experience *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  required
                  placeholder="e.g. 1.5"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="form-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <input
                  type="text"
                  disabled
                  value="Entry Level"
                  className="form-input"
                  style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">GitHub Profile Link</label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={formData.github_profile}
                onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 5: Preferred Career Goal */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Preferred Career Goal *</label>
            <select
              value={selectedCareerOption}
              onChange={(e) => {
                setSelectedCareerOption(e.target.value);
                setFormData((prev) => ({ ...prev, preferred_career: e.target.value }));
              }}
              className="form-select"
            >
              {careerList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Other">Other (Custom Career Goal)</option>
            </select>
            {selectedCareerOption === "Other" && (
              <div style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter your custom career goal *"
                  value={customCareerInput}
                  onChange={(e) => setCustomCareerInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "12px", fontSize: "0.95rem" }}>
              <Lock size={16} color="var(--brand-blue)" /> Create Account Password
            </div>
            <div className="grid-2" style={{ marginBottom: "8px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, A-Z, a-z, 0-9, !@#"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="form-input"
                    style={{ paddingRight: "38px" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "10px", top: "9px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (() => {
                  const s = getPasswordStrength(password);
                  return s ? (
                    <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ flex: 1, height: "4px", backgroundColor: "#e2e8f0", borderRadius: "2px" }}>
                        <div style={{ height: "4px", borderRadius: "2px", width: `${["Weak","Fair","Good","Strong"].indexOf(s.label) * 25 + 25}%`, backgroundColor: s.color, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.color }}>{s.label}</span>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ paddingRight: "38px", borderColor: confirmPassword && password !== confirmPassword ? "#ef4444" : "" }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: "10px", top: "9px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ fontSize: "0.73rem", color: "#ef4444", marginTop: "4px" }}>Passwords do not match.</p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 8 && (
                  <p style={{ fontSize: "0.73rem", color: "#10b981", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </div>
            </div>
            <div style={{ fontSize: "0.73rem", color: "#64748b", backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              Password must have: at least 8 characters · one uppercase letter · one lowercase letter · one number · one special character (!@#$%^&*...)
            </div>
          </div>

          {/* EDUCATIONAL DETAILS SECTION */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "12px", fontSize: "0.95rem" }}>
              <GraduationCap size={18} color="var(--brand-blue)" /> Educational Details
            </div>

            {/* A. School Education */}
            <div style={{ backgroundColor: "var(--bg-subtle)", padding: "12px", borderRadius: "8px", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                A. School Education (10th / Matriculation)
              </div>
              <div className="grid-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>School Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi Public School"
                    value={formData.education.school.name}
                    onChange={(e) => handleEducationChange("school", "name", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Passing Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2035"
                    value={formData.education.school.year}
                    onChange={(e) => handleEducationChange("school", "year", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Percentage (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 91.5"
                    value={formData.education.school.percentage}
                    onChange={(e) => handleEducationChange("school", "percentage", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* B. Intermediate / Junior College */}
            <div style={{ backgroundColor: "var(--bg-subtle)", padding: "12px", borderRadius: "8px", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                B. Intermediate / College Education (12th / Diploma)
              </div>
              <div className="grid-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>College Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. National Junior College"
                    value={formData.education.intermediate.college_name}
                    onChange={(e) => handleEducationChange("intermediate", "college_name", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Passing Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2035"
                    value={formData.education.intermediate.year}
                    onChange={(e) => handleEducationChange("intermediate", "year", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Percentage (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 88.0"
                    value={formData.education.intermediate.percentage}
                    onChange={(e) => handleEducationChange("intermediate", "percentage", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* C. Degree / Institute Education */}
            <div style={{ backgroundColor: "var(--bg-subtle)", padding: "12px", borderRadius: "8px", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                C. Degree / Institute Education (Undergraduate / University)
              </div>
              <div className="grid-2" style={{ marginBottom: "8px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Institute / College Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. RV College of Engineering"
                    value={formData.education.degree.institute_name}
                    onChange={(e) => handleEducationChange("degree", "institute_name", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.76rem" }}>Passing Year *</label>
                    <input
                      type="number"
                      min="2000"
                      max="2035"
                      value={formData.education.degree.year}
                      onChange={(e) => handleEducationChange("degree", "year", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.76rem" }}>Status *</label>
                    <select
                      value={formData.education.degree.status}
                      onChange={(e) => handleEducationChange("degree", "status", e.target.value)}
                      className="form-select"
                    >
                      <option value="Pursuing">Pursuing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditional Percentage display */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.76rem" }}>
                  {formData.education.degree.status === "Completed"
                    ? "Degree Final Percentage / Aggregate *"
                    : "Current Percentage / Aggregate (Optional)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={formData.education.degree.status === "Completed" ? "e.g. 85.5" : "e.g. 82.0 (Optional)"}
                  value={formData.education.degree.percentage}
                  onChange={(e) => handleEducationChange("degree", "percentage", e.target.value)}
                  className="form-input"
                  required={formData.education.degree.status === "Completed"}
                />
              </div>
            </div>
          </div>

          {/* PART B: CERTIFICATES SECTION (Certificate Name Only, Add/Edit/Delete, Multiple) */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--primary-navy)", fontSize: "0.95rem" }}>
                <Award size={18} color="var(--brand-blue)" /> Certificates ({formData.certificates.length})
              </div>
            </div>

            {/* Certificates List */}
            {formData.certificates.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                {formData.certificates.map((cert, idx) => {
                  const certName = cert.name || cert;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary-navy)" }}>
                        {certName}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEditCertificate(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                          title="Edit Certificate Name"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "3px 8px", fontSize: "0.72rem", color: "var(--danger)" }}
                          title="Delete Certificate"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Certificate Add / Edit Input */}
            <div style={{ padding: "10px 12px", border: "1px dashed var(--border-subtle)", borderRadius: "6px", backgroundColor: "#fafbfc" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter Certificate Name (e.g. AWS Certified Cloud Practitioner)..."
                  value={certNameInput}
                  onChange={(e) => setCertNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveCertificate();
                    }
                  }}
                  className="form-input"
                  style={{ fontSize: "0.84rem", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSaveCertificate}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {editingCertIndex !== null ? "Update Certificate" : "+ Add Certificate"}
                </button>
                {editingCertIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCertIndex(null);
                      setCertNameInput("");
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PART C: INTERNSHIP DETAILS SECTION (Company Name, Duration, Role, Stipend, Mode) */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--primary-navy)", fontSize: "0.95rem" }}>
                <Briefcase size={18} color="var(--brand-blue)" /> Internship Details ({formData.internships.length})
              </div>
            </div>

            {/* Existing added internships */}
            {formData.internships.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {formData.internships.map((intern, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      backgroundColor: "var(--bg-subtle)",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-navy)" }}>
                        {intern.company} • <span style={{ color: "var(--brand-blue)" }}>{intern.role || "Intern"}</span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Duration: <strong>{intern.duration_months} Months</strong> • Mode: {intern.work_mode || "Hybrid"} • Stipend: ₹{Number(intern.stipend || 0).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleEditInternship(idx)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                        title="Edit Internship"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInternship(idx)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "3px 8px", fontSize: "0.72rem", color: "var(--danger)" }}
                        title="Delete Internship"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Internship Add / Edit Form */}
            <div style={{ padding: "12px", border: "1px dashed var(--border-subtle)", borderRadius: "6px", backgroundColor: "#fafbfc" }}>
              <div className="grid-2" style={{ marginBottom: "8px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Internship Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, TCS, Google..."
                    value={internForm.company}
                    onChange={(e) => setInternForm({ ...internForm, company: e.target.value })}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Internship Duration in Months *</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    placeholder="e.g. 3"
                    value={internForm.duration_months}
                    onChange={(e) => setInternForm({ ...internForm, duration_months: e.target.value })}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: "10px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Analyst Intern"
                    value={internForm.role}
                    onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Monthly Stipend (₹)</label>
                  <input
                    type="number"
                    step="500"
                    placeholder="e.g. 15000"
                    value={internForm.stipend}
                    onChange={(e) => setInternForm({ ...internForm, stipend: e.target.value })}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Work Mode</label>
                  <select
                    value={internForm.work_mode}
                    onChange={(e) => setInternForm({ ...internForm, work_mode: e.target.value })}
                    className="form-select"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                {editingInternIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInternIndex(null);
                      setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveInternship}
                  className="btn btn-secondary btn-sm"
                >
                  {editingInternIndex !== null ? "Update Internship" : "+ Add Internship Record"}
                </button>
              </div>
            </div>
          </div>

          {/* Technical Skills Section */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginBottom: "16px" }}>
            <label className="form-label" style={{ fontWeight: 700, color: "var(--primary-navy)" }}>
              Technical Skills ({formData.skills.length})
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {formData.skills.map((s) => (
                <span key={s} className="badge badge-blue" style={{ fontSize: "0.8rem", padding: "4px 8px" }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "5px", color: "var(--brand-blue)" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Add custom skill (e.g. Docker, FastApi)..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(customSkill);
                  }
                }}
                className="form-input"
                style={{ fontSize: "0.84rem" }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill(customSkill)}
                className="btn btn-secondary btn-sm"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Saving Profile..." : "Register & Save Student Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
