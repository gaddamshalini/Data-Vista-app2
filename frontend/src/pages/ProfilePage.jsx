import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Layers,
  Search,
  ExternalLink,
  Edit3,
  Edit2,
  Upload,
  Image,
  Calendar,
  Building
} from "lucide-react";
import { useStudent, DEFAULT_BRANCHES, DEFAULT_CAREERS } from "../context/StudentContext";

const GithubIcon = ({ size = 14, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProfilePage() {
  const {
    activeStudent,
    catalog,
    saveStudentProfile,
    switchStudentByIdOrName,
    loading
  } = useStudent();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedBranchOption, setSelectedBranchOption] = useState(DEFAULT_BRANCHES[0]);
  const [customBranchInput, setCustomBranchInput] = useState("");
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [newSkillInput, setNewSkillInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Certificate input state (PART B: Name only)
  const [certNameInput, setCertNameInput] = useState("");
  const [editingCertIndex, setEditingCertIndex] = useState(null);

  // Internship states (PART C & PART F)
  const [internshipSearch, setInternshipSearch] = useState("");
  const [internForm, setInternForm] = useState({
    company: "",
    role: "Intern",
    duration_months: 3,
    stipend: 15000,
    work_mode: "Hybrid"
  });
  const [editingInternIndex, setEditingInternIndex] = useState(null);
  const [showInternForm, setShowInternForm] = useState(false);

  const branchList =
    catalog?.branches && catalog.branches.length > 0
      ? catalog.branches
      : DEFAULT_BRANCHES;

  const careerList =
    catalog?.careers && catalog.careers.length > 0
      ? catalog.careers
      : DEFAULT_CAREERS;

  // Sync form data with activeStudent
  useEffect(() => {
    if (activeStudent) {
      const studentBranch = activeStudent.branch || DEFAULT_BRANCHES[0];
      const isKnownBranch = branchList.includes(studentBranch) && studentBranch !== "Other";

      if (isKnownBranch) {
        setSelectedBranchOption(studentBranch);
        setCustomBranchInput("");
      } else {
        setSelectedBranchOption("Other");
        setCustomBranchInput(studentBranch);
      }

      // Format certificates (PART B: name only)
      let initialCerts = [];
      if (Array.isArray(activeStudent.certificates) && activeStudent.certificates.length > 0) {
        initialCerts = activeStudent.certificates.map((c) => ({
          name: typeof c === "string" ? c : (c.name || c.title || "")
        })).filter((c) => c.name.trim());
      } else if (Array.isArray(activeStudent.certifications) && activeStudent.certifications.length > 0) {
        initialCerts = activeStudent.certifications.map((c) => ({
          name: typeof c === "string" ? c : (c.name || "")
        })).filter((c) => c.name.trim());
      }

      // Educational details with defaults
      const edu = activeStudent.education || {};
      const school = edu.school || {};
      const inter = edu.intermediate || {};
      const deg = edu.degree || {};

      const baseName = (activeStudent.name || "student").toLowerCase().replace(/\s+/g, ".");
      const pEmail = activeStudent.personal_email || (activeStudent.email && !activeStudent.email.includes("college.edu") ? activeStudent.email : `${baseName}@gmail.com`);
      const cEmail = activeStudent.college_email || activeStudent.email || `${baseName}@college.edu`;

      setFormData({
        name: activeStudent.name || "",
        personal_email: pEmail,
        college_email: cEmail,
        email: cEmail,
        branch: studentBranch,
        year: activeStudent.year || 3,
        cgpa: activeStudent.cgpa !== undefined ? activeStudent.cgpa : 7.5,
        experience_status: activeStudent.experience_status || "Fresher",
        experience_years: activeStudent.experience_years !== undefined ? activeStudent.experience_years : 0.0,
        num_internships: (activeStudent.internships || []).length || (activeStudent.num_internships !== undefined ? activeStudent.num_internships : 0),
        github_profile: activeStudent.github_profile || "",
        profile_photo: activeStudent.profile_photo || "",
        preferred_career: activeStudent.preferred_career || "Data Analyst",
        education: {
          school: {
            name: school.name || "",
            year: school.year || 2020,
            percentage: school.percentage !== undefined ? school.percentage : 90.0
          },
          intermediate: {
            college_name: inter.college_name || "",
            year: inter.year || 2022,
            percentage: inter.percentage !== undefined ? inter.percentage : 88.0
          },
          degree: {
            institute_name: deg.institute_name || "",
            year: deg.year || 2026,
            status: deg.status || "Pursuing",
            percentage: deg.percentage !== undefined && deg.percentage !== null ? deg.percentage : ""
          }
        },
        skills: [...(activeStudent.skills || [])],
        certificates: initialCerts,
        projects: (activeStudent.projects || []).map((p) => ({ ...p })),
        internships: (activeStudent.internships || []).map((i) => ({ ...i }))
      });
      setIsEditing(false);
      setEditingCertIndex(null);
      setCertNameInput("");
      setShowInternForm(false);
      setEditingInternIndex(null);
      setSaveStatus({ success: false, message: "" });
    }
  }, [activeStudent]);

  if (!activeStudent || !formData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>No student profile loaded. Please select or register a student.</p>
      </div>
    );
  }

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearchLoading(true);
      setSaveStatus({ success: false, message: "" });
      await switchStudentByIdOrName(searchQuery.trim());
      setSearchQuery("");
      setSaveStatus({ success: true, message: "Profile successfully fetched and loaded!" });
      setTimeout(() => setSaveStatus({ success: false, message: "" }), 3000);
    } catch (err) {
      setSaveStatus({ success: false, message: `Student '${searchQuery}' not found in database.` });
    } finally {
      setSearchLoading(false);
    }
  };

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

  // Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveStatus({ success: false, message: "Please upload an image file (JPEG, PNG, WEBP)." });
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setSaveStatus({ success: false, message: "Photo file exceeds 2.5 MB. Please select a smaller file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profile_photo: reader.result }));
      setSaveStatus({ success: true, message: "Profile photo updated in draft. Click 'Save Changes' to persist." });
      setTimeout(() => setSaveStatus({ success: false, message: "" }), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profile_photo: "" }));
  };

  // Education update handler
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
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillName) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillName)
    }));
  };

  // Certificates Management (PART B: Name only, Add, Edit, Delete, Duplicate check)
  const handleSaveCertificate = () => {
    const cleanName = certNameInput.trim();
    if (!cleanName) {
      setSaveStatus({ success: false, message: "Certificate name is required." });
      return;
    }

    const isDuplicate = formData.certificates.some(
      (c, idx) => (c.name || c).toLowerCase() === cleanName.toLowerCase() && idx !== editingCertIndex
    );
    if (isDuplicate) {
      setSaveStatus({ success: false, message: `A certificate named "${cleanName}" already exists.` });
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
    setSaveStatus({ success: true, message: "Certificate saved to draft. Click 'Save Changes' to persist." });
    setTimeout(() => setSaveStatus({ success: false, message: "" }), 2500);
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

  // Internship Management (PART C: Company, Duration in Months, Role, Stipend, Mode)
  const handleSaveInternship = () => {
    const cleanCompany = internForm.company.trim();
    if (!cleanCompany) {
      setSaveStatus({ success: false, message: "Internship Company Name is required." });
      return;
    }
    const duration = parseInt(internForm.duration_months, 10);
    if (isNaN(duration) || duration <= 0) {
      setSaveStatus({ success: false, message: "Internship duration must be at least 1 month." });
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
      setShowInternForm(false);
    } else {
      const updated = [...formData.internships, newRecord];
      setFormData((prev) => ({
        ...prev,
        internships: updated,
        num_internships: updated.length
      }));
      setShowInternForm(false);
    }

    setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
    setSaveStatus({ success: true, message: "Internship record updated in draft. Click 'Save Changes' to persist." });
    setTimeout(() => setSaveStatus({ success: false, message: "" }), 3000);
  };

  const handleEditInternship = (idx) => {
    setInternForm(formData.internships[idx]);
    setEditingInternIndex(idx);
    setShowInternForm(true);
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
      setShowInternForm(false);
      setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
    }
  };

  // Projects
  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "New Project", domain: "Data Analytics", description: "", technologies: "Python, SQL" }
      ]
    }));
  };

  const handleRemoveProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index][field] = value;
      return { ...prev, projects: updated };
    });
  };

  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateGithub = (url) => {
    if (!url || !url.trim()) return true;
    const clean = url.trim().toLowerCase();
    return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("github.com/");
  };

  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();

    // PART G: Validate email formats
    if (!formData.personal_email?.trim() || !validateEmailFormat(formData.personal_email.trim())) {
      setSaveStatus({
        success: false,
        message: "Please enter a valid Personal Email address (e.g. yourname@gmail.com)."
      });
      return;
    }
    if (!formData.college_email?.trim() || !validateEmailFormat(formData.college_email.trim())) {
      setSaveStatus({
        success: false,
        message: "Please enter a valid College Email address (e.g. yourname@college.edu)."
      });
      return;
    }

    if (formData.github_profile && !validateGithub(formData.github_profile)) {
      setSaveStatus({
        success: false,
        message: "Please enter a valid GitHub profile URL (e.g. https://github.com/your-username)."
      });
      return;
    }

    try {
      let normalizedGithub = (formData.github_profile || "").trim();
      if (normalizedGithub && !normalizedGithub.startsWith("http://") && !normalizedGithub.startsWith("https://")) {
        normalizedGithub = `https://${normalizedGithub}`;
      }

      const finalBranch = selectedBranchOption === "Other" ? (customBranchInput.trim() || "Other") : selectedBranchOption;

      // Ensure degree percentage handling
      const degStatus = formData.education.degree.status;
      let degPct = formData.education.degree.percentage;
      if (degStatus === "Completed" && (degPct === "" || degPct === null || isNaN(degPct))) {
        setSaveStatus({
          success: false,
          message: "Please enter your final degree percentage since education status is marked as 'Completed'."
        });
        return;
      }

      await saveStudentProfile({
        ...formData,
        branch: finalBranch,
        cgpa: parseFloat(formData.cgpa),
        personal_email: formData.personal_email.trim(),
        college_email: formData.college_email.trim(),
        email: formData.college_email.trim(),
        internships: formData.internships,
        num_internships: formData.internships.length,
        experience_status: formData.experience_status,
        experience_years: formData.experience_status === "Experienced" ? parseFloat(formData.experience_years || 0) : 0.0,
        github_profile: normalizedGithub,
        profile_photo: formData.profile_photo || "",
        education: {
          school: {
            name: formData.education.school.name || "",
            year: parseInt(formData.education.school.year || 2020, 10),
            percentage: parseFloat(formData.education.school.percentage || 0)
          },
          intermediate: {
            college_name: formData.education.intermediate.college_name || "",
            year: parseInt(formData.education.intermediate.year || 2022, 10),
            percentage: parseFloat(formData.education.intermediate.percentage || 0)
          },
          degree: {
            institute_name: formData.education.degree.institute_name || "",
            year: parseInt(formData.education.degree.year || 2026, 10),
            status: degStatus,
            percentage: degPct !== "" && degPct !== null ? parseFloat(degPct) : null
          }
        },
        certificates: formData.certificates,
        certifications: formData.certificates.map((c) => c.name || c),
        year: parseInt(formData.year, 10)
      });

      setIsEditing(false);
      setEditingCertIndex(null);
      setShowInternForm(false);
      setEditingInternIndex(null);
      setSaveStatus({
        success: true,
        message: "Student profile, emails, certificates, and internships successfully saved to database!"
      });
      setTimeout(() => setSaveStatus({ success: false, message: "" }), 4000);
    } catch (err) {
      setSaveStatus({
        success: false,
        message: err.message || "Failed to update profile."
      });
    }
  };

  return (
    <div>
      {/* Search by Student ID or Name */}
      <div className="card" style={{ marginBottom: "16px", padding: "14px 20px" }}>
        <form onSubmit={handleLookup} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-navy)", fontWeight: 600, fontSize: "0.9rem" }}>
            <Search size={16} color="var(--brand-blue)" /> Search Saved Profile:
          </div>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <input
              type="text"
              placeholder="Enter Student ID (e.g. CS2024001) or Student Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <button type="submit" disabled={searchLoading} className="btn btn-secondary" style={{ height: "38px" }}>
            {searchLoading ? "Searching..." : "Retrieve Profile"}
          </button>
        </form>
      </div>

      {/* Top Profile Header Bar */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--brand-blue)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
              overflow: "hidden",
              border: "2px solid #cbd5e1",
              flexShrink: 0
            }}
          >
            {formData.profile_photo ? (
              <img
                src={formData.profile_photo}
                alt={activeStudent.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              activeStudent.name ? activeStudent.name.charAt(0) : "S"
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                {activeStudent.name}
              </h2>
              <span className="badge badge-blue">ID: {activeStudent.student_id}</span>
              <span className="badge badge-gray">{activeStudent.branch}</span>
              <span className="badge badge-purple">{activeStudent.experience_status || "Fresher"}</span>
            </div>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Year {activeStudent.year} • CGPA: <strong>{activeStudent.cgpa}</strong> • Target Goal: <strong>{activeStudent.preferred_career}</strong> • Internships: <strong>{activeStudent.num_internships || 0}</strong>
              {activeStudent.github_profile && (
                <span style={{ marginLeft: "8px" }}>
                  • <a href={activeStudent.github_profile} target="_blank" rel="noreferrer" style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}>
                    <GithubIcon size={12} style={{ marginRight: "3px" }} />
                    GitHub <ExternalLink size={10} style={{ display: "inline" }} />
                  </a>
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingCertIndex(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="btn btn-primary"
              >
                <Save size={15} /> Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {saveStatus.message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.88rem",
            backgroundColor: saveStatus.success ? "var(--success-bg)" : "var(--danger-bg)",
            color: saveStatus.success ? "var(--success)" : "var(--danger)",
            border: `1px solid ${saveStatus.success ? "#a7f3d0" : "#fecaca"}`
          }}
        >
          {saveStatus.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveChanges}>
        {/* Profile Photo Upload & Management Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Image size={18} color="var(--brand-blue)" /> Profile Photo
              </div>
              <div className="card-subtitle">Upload or update student photo displayed across profile and ATS resume</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "2px solid #cbd5e1"
              }}
            >
              {formData.profile_photo ? (
                <img
                  src={formData.profile_photo}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={36} color="#94a3b8" />
              )}
            </div>

            <div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                {isEditing ? (
                  <>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Upload size={14} /> {formData.profile_photo ? "Change Photo" : "Upload Photo"}
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
                        style={{ color: "var(--danger)" }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {formData.profile_photo ? "Photo uploaded and verified" : "No photo uploaded yet. Click 'Edit Profile' to upload."}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Supported formats: JPEG, PNG, WEBP (Max 2.5 MB). Validated file size and encoding.
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Professional Information Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <GraduationCap size={18} color="var(--brand-blue)" /> Academic & Professional Profile
              </div>
              <div className="card-subtitle">Core student credentials synchronized across DATA VISTA intelligence modules</div>
            </div>
          </div>

          {/* Row 1: Name and Academic Year */}
          <div className="grid-2" style={{ marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                disabled={!isEditing}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="form-select"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year (Final)</option>
              </select>
            </div>
          </div>

          {/* Row 2: PART G - Personal Email and College Email */}
          <div className="grid-2" style={{ marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label">Personal Email</label>
              <input
                type="email"
                disabled={!isEditing}
                placeholder="e.g. personal@gmail.com"
                value={formData.personal_email || ""}
                onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                className="form-input"
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Default contact email on ATS resume</span>
            </div>

            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                disabled={!isEditing}
                placeholder="e.g. student@college.edu"
                value={formData.college_email || ""}
                onChange={(e) => setFormData({ ...formData, college_email: e.target.value })}
                className="form-input"
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Official college/university email address</span>
            </div>
          </div>

          {/* Department / Branch Dropdown + Custom Other & CGPA */}
          <div className="grid-2" style={{ marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <select
                disabled={!isEditing}
                value={selectedBranchOption}
                onChange={handleBranchChange}
                className="form-select"
              >
                {branchList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {selectedBranchOption === "Other" && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="Enter custom department or course name..."
                    value={customBranchInput}
                    onChange={handleCustomBranchChange}
                    className="form-input"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Current Academic CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                disabled={!isEditing}
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Experience Status, Experience Years, Number of Internships */}
          <div className="grid-3" style={{ marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label">Experience Status</label>
              <select
                disabled={!isEditing}
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
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  disabled={!isEditing}
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
                  value="Entry Level (Fresher)"
                  className="form-input"
                  style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Number of Internships</label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={!isEditing}
                value={formData.num_internships}
                onChange={(e) => setFormData({ ...formData, num_internships: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* GitHub & Preferred Career Goal (Location removed) */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <GithubIcon size={14} style={{ marginRight: "4px" }} />
                GitHub Profile Link
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="https://github.com/username"
                value={formData.github_profile}
                onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Career Goal</label>
              <select
                disabled={!isEditing}
                value={formData.preferred_career}
                onChange={(e) => setFormData({ ...formData, preferred_career: e.target.value })}
                className="form-select"
              >
                {careerList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* EDUCATIONAL DETAILS SECTION */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Building size={18} color="var(--brand-blue)" /> Educational Details
              </div>
              <div className="card-subtitle">School, Intermediate, and Degree academic milestones</div>
            </div>
          </div>

          {/* A. School Education */}
          <div style={{ padding: "16px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", marginBottom: "14px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-navy)", marginBottom: "10px" }}>
              A. School Education (10th Standard / Matriculation)
            </div>
            <div className="grid-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">School Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. Delhi Public School"
                  value={formData.education.school.name}
                  onChange={(e) => handleEducationChange("school", "name", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Year of Passing</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  placeholder="2020"
                  value={formData.education.school.year}
                  onChange={(e) => handleEducationChange("school", "year", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Percentage (%) / GPA</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isEditing}
                  placeholder="e.g. 92.4"
                  value={formData.education.school.percentage}
                  onChange={(e) => handleEducationChange("school", "percentage", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* B. Intermediate / College Education */}
          <div style={{ padding: "16px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", marginBottom: "14px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-navy)", marginBottom: "10px" }}>
              B. Intermediate / Junior College (12th / Pre-University / Diploma)
            </div>
            <div className="grid-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">College Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. National Junior College"
                  value={formData.education.intermediate.college_name}
                  onChange={(e) => handleEducationChange("intermediate", "college_name", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Year of Passing</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  placeholder="2022"
                  value={formData.education.intermediate.year}
                  onChange={(e) => handleEducationChange("intermediate", "year", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Percentage (%) / GPA</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isEditing}
                  placeholder="e.g. 90.5"
                  value={formData.education.intermediate.percentage}
                  onChange={(e) => handleEducationChange("intermediate", "percentage", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* C. Degree / Institute Education */}
          <div style={{ padding: "16px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-navy)", marginBottom: "10px" }}>
              C. Degree / Institute Education (B.Tech / B.E / Undergrad)
            </div>
            <div className="grid-2" style={{ marginBottom: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Institute Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. RV College of Engineering"
                  value={formData.education.degree.institute_name}
                  onChange={(e) => handleEducationChange("degree", "institute_name", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Year of Passing</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    placeholder="2026"
                    value={formData.education.degree.year}
                    onChange={(e) => handleEducationChange("degree", "year", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Education Status</label>
                  <select
                    disabled={!isEditing}
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

            {/* Conditional Percentage display based on status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                {formData.education.degree.status === "Completed" ? (
                  <span>Degree Final Percentage / Aggregate * <span style={{ color: "var(--danger)" }}>(Mandatory for Completed)</span></span>
                ) : (
                  <span>Current Percentage / Aggregate <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional for Pursuing)</span></span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                disabled={!isEditing}
                placeholder={formData.education.degree.status === "Completed" ? "e.g. 85.5" : "e.g. 82.0 (Optional)"}
                value={formData.education.degree.percentage}
                onChange={(e) => handleEducationChange("degree", "percentage", e.target.value)}
                className="form-input"
                required={formData.education.degree.status === "Completed"}
              />
            </div>
          </div>
        </div>

        {/* PART B: CERTIFICATES SECTION */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Award size={18} color="var(--brand-blue)" /> Certificates Management ({formData.certificates.length})
              </div>
              <div className="card-subtitle">
                Verified certificate credentials fetched directly into your smart resume
              </div>
            </div>
          </div>

          {/* List of existing certificates */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {formData.certificates.length === 0 ? (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No certificates added yet.</span>
            ) : (
              formData.certificates.map((cert, idx) => {
                const certName = cert.name || cert;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--primary-navy)" }}>
                      {certName}
                    </div>

                    {isEditing && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleEditCertificate(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          title="Edit Certificate Name"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--danger)" }}
                          title="Delete Certificate"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add / Edit Certificate Form (Only visible when editing) */}
          {isEditing && (
            <div style={{ padding: "14px", border: "1px dashed var(--border-subtle)", borderRadius: "8px", backgroundColor: "#fafbfc" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary-navy)", marginBottom: "8px" }}>
                {editingCertIndex !== null ? `Edit Certificate (#${editingCertIndex + 1})` : "+ Add Certificate"}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
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
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSaveCertificate}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Plus size={13} /> {editingCertIndex !== null ? "Update Certificate" : "Add Certificate"}
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
          )}
        </div>

        {/* Technical Skills Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Code size={18} color="var(--brand-blue)" /> Verified Technical Skills ({formData.skills.length})
              </div>
              <div className="card-subtitle">
                Updating your skills immediately recalculates your Career Match % and Skill Gap diagnostics
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="badge badge-blue"
                style={{ fontSize: "0.85rem", padding: "6px 12px" }}
              >
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "6px", color: "var(--brand-blue)", fontWeight: 700 }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: "10px", maxWidth: "620px" }}>
              <select
                onChange={(e) => {
                  if (e.target.value) handleAddSkill(e.target.value);
                  e.target.value = "";
                }}
                className="form-select"
                style={{ flex: 1 }}
              >
                <option value="">+ Select from Master Skills Catalog</option>
                {catalog.skills.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name} ({s.category} • Demand: {s.demand_index})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or custom skill..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="btn btn-secondary"
              >
                Add Skill
              </button>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Layers size={18} color="var(--brand-blue)" /> Capstone & Technical Projects ({formData.projects.length})
              </div>
              <div className="card-subtitle">Hands-on applications evaluated in career recommendations and ATS resumes</div>
            </div>
            {isEditing && (
              <button type="button" onClick={handleAddProject} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Project
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {formData.projects.map((proj, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary-navy)" }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                        className="form-input"
                        placeholder="Project Title"
                        style={{ fontWeight: 600 }}
                      />
                    ) : (
                      proj.title
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid-2" style={{ marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Domain</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={proj.domain}
                        onChange={(e) => handleProjectChange(idx, "domain", e.target.value)}
                        className="form-input"
                        placeholder="Domain (e.g. Data Analytics)"
                      />
                    ) : (
                      <span className="badge badge-gray">{proj.domain}</span>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Technologies Used</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={proj.technologies}
                        onChange={(e) => handleProjectChange(idx, "technologies", e.target.value)}
                        className="form-input"
                        placeholder="Tech (e.g. Python, SQL, React)"
                      />
                    ) : (
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--brand-blue)" }}>{proj.technologies}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Description & Highlights</label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                      className="form-textarea"
                      placeholder="Summary of project methodology, key contributions and impact..."
                    />
                  ) : (
                    <p style={{ fontSize: "0.84rem", color: "var(--text-main)" }}>{proj.description || "No description provided."}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internships Section (PART C & PART F) */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div className="card-title">
                <Briefcase size={18} color="var(--brand-blue)" /> Internship Details ({formData.internships.length})
              </div>
              <div className="card-subtitle">Practical industry exposure & stipends</div>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditingInternIndex(null);
                  setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
                  setShowInternForm(!showInternForm);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> {showInternForm ? "Close Form" : "Add Internship"}
              </button>
            )}
          </div>

          {/* PART F: Search bar for internships */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ position: "relative", maxWidth: "420px" }}>
              <input
                type="text"
                placeholder="Search by internship company name, role..."
                value={internshipSearch}
                onChange={(e) => setInternshipSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "0.84rem", height: "36px" }}
              />
              <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-dim)" }} />
              {internshipSearch && (
                <button
                  type="button"
                  onClick={() => setInternshipSearch("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Add / Edit Internship Form (Only visible when editing and opened) */}
          {isEditing && showInternForm && (
            <div style={{ padding: "14px", border: "1px dashed var(--border-subtle)", borderRadius: "8px", backgroundColor: "#fafbfc", marginBottom: "16px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary-navy)", marginBottom: "10px" }}>
                {editingInternIndex !== null ? `Edit Internship Record (#${editingInternIndex + 1})` : "+ Add New Internship Record"}
              </div>

              <div className="grid-2" style={{ marginBottom: "10px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Internship Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, TCS, Google"
                    value={internForm.company}
                    onChange={(e) => setInternForm({ ...internForm, company: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Internship Duration in Months *</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    placeholder="e.g. 3"
                    value={internForm.duration_months}
                    onChange={(e) => setInternForm({ ...internForm, duration_months: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Analyst Intern"
                    value={internForm.role}
                    onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Monthly Stipend (₹)</label>
                  <input
                    type="number"
                    step="500"
                    placeholder="e.g. 20000"
                    value={internForm.stipend}
                    onChange={(e) => setInternForm({ ...internForm, stipend: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>Work Mode</label>
                  <select
                    value={internForm.work_mode}
                    onChange={(e) => setInternForm({ ...internForm, work_mode: e.target.value })}
                    className="form-select"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowInternForm(false);
                    setEditingInternIndex(null);
                    setInternForm({ company: "", role: "Intern", duration_months: 3, stipend: 15000, work_mode: "Hybrid" });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInternship}
                  className="btn btn-primary btn-sm"
                >
                  {editingInternIndex !== null ? "Update Internship" : "Save Internship Record"}
                </button>
              </div>
            </div>
          )}

          {/* List of Internships (Filtered by Search) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(() => {
              const filteredInternships = (formData.internships || []).filter((intern) => {
                if (!internshipSearch.trim()) return true;
                const q = internshipSearch.trim().toLowerCase();
                const c = (intern.company || "").toLowerCase();
                const r = (intern.role || "").toLowerCase();
                const n = (intern.title || intern.name || "").toLowerCase();
                return c.includes(q) || r.includes(q) || n.includes(q);
              });

              if (filteredInternships.length === 0) {
                return (
                  <div style={{ padding: "16px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {formData.internships.length === 0
                      ? "No internships recorded yet. Click 'Add Internship' to add industry exposure and stipends."
                      : `No internships match "${internshipSearch}". Try searching by another company or role, or clear your search.`}
                  </div>
                );
              }

              return filteredInternships.map((intern, idx) => {
                const originalIndex = formData.internships.indexOf(intern);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--primary-navy)" }}>
                        {intern.company} • <span style={{ color: "var(--brand-blue)" }}>{intern.role || "Intern"}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Duration: <strong>{intern.duration_months} Months</strong> • Mode: {intern.work_mode || "Hybrid"} • Stipend: ₹{Number(intern.stipend || 0).toLocaleString()}
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEditInternship(originalIndex)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          title="Edit Internship Record"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInternship(originalIndex)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--danger)" }}
                          title="Delete Internship Record"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", marginBottom: "30px" }}>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingCertIndex(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={15} /> Save All Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
