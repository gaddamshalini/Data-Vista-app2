import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Edit,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  CheckSquare,
  Square,
  Globe,
  Star,
  GitBranch,
  Save,
  BookmarkCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getGithubRepos, getSavedResumes, saveResume, deleteSavedResume } from "../services/api";

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

export default function ResumeBuilderPage() {
  const { activeStudent } = useStudent();

  const [activeView, setActiveView] = useState("split"); // "split", "edit", "preview"
  const [resumeData, setResumeData] = useState(null);

  // Resume Persistence State
  const [resumeTitle, setResumeTitle] = useState("My Technical Resume");
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [savedResumesList, setSavedResumesList] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle", "saving", "saved", "error"
  const [saveMessage, setSaveMessage] = useState("");

  // GitHub Repos Fetch State
  const [fetchedGithubRepos, setFetchedGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");

  // Fetch saved resumes for student
  const fetchStudentSavedResumes = async (studentId) => {
    try {
      const res = await getSavedResumes(studentId);
      if (res?.success && Array.isArray(res.data)) {
        setSavedResumesList(res.data);
        // If student has a previously saved resume, auto-load the latest one if user hasn't modified yet
        if (res.data.length > 0 && res.latest?.resume_data) {
          const latest = res.latest;
          setActiveResumeId(latest.id);
          setResumeTitle(latest.title || "My Technical Resume");
          setResumeData(latest.resume_data);
        }
      }
    } catch (err) {
      console.warn("Could not load saved resumes from database:", err);
    }
  };

  // Save Resume to Database Handler
  const handleSaveResume = async () => {
    if (!activeStudent?.student_id || !resumeData) return;

    try {
      setSaveStatus("saving");
      setSaveMessage("");

      const payload = {
        id: activeResumeId,
        title: resumeTitle.trim() || "My Technical Resume",
        resume_data: resumeData
      };

      const res = await saveResume(activeStudent.student_id, payload);
      if (res?.success) {
        setSaveStatus("saved");
        setSaveMessage(res.message || "Resume saved successfully to database!");
        if (res.data?.id) {
          setActiveResumeId(res.data.id);
        }
        // Refresh saved resumes list
        const listRes = await getSavedResumes(activeStudent.student_id);
        if (listRes?.success && Array.isArray(listRes.data)) {
          setSavedResumesList(listRes.data);
        }
        // Clear message after 4 seconds
        setTimeout(() => {
          setSaveStatus("idle");
          setSaveMessage("");
        }, 4000);
      } else {
        throw new Error(res?.error || "Failed to save resume");
      }
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage(err.message || "Error saving resume to database.");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 5000);
    }
  };

  // Re-open / Load a previously saved resume
  const handleLoadResume = (savedItem) => {
    if (!savedItem) return;
    setActiveResumeId(savedItem.id);
    setResumeTitle(savedItem.title || "My Technical Resume");
    if (savedItem.resume_data) {
      setResumeData(savedItem.resume_data);
      setSaveStatus("saved");
      setSaveMessage(`Loaded saved resume: "${savedItem.title}"`);
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 3000);
    }
  };

  // Sync resumeData with activeStudent profile
  useEffect(() => {
    if (activeStudent) {
      const edu = activeStudent.education || {};
      const school = edu.school || {};
      const inter = edu.intermediate || {};
      const deg = edu.degree || {};

      // Education list for resume
      const educationList = [];
      // 1. Degree
      educationList.push({
        degree: "Bachelor of Technology",
        department: activeStudent.branch || "Engineering",
        institution: deg.institute_name || "Institute of Technology",
        year: deg.year ? `Year of Passing: ${deg.year}` : "2026",
        status: deg.status || "Pursuing",
        score: deg.percentage
          ? `${deg.percentage}%`
          : (activeStudent.cgpa ? `CGPA: ${activeStudent.cgpa} / 10.0` : "")
      });
      // 2. Intermediate
      if (inter.college_name) {
        educationList.push({
          degree: "Intermediate / Higher Secondary (12th)",
          department: "MPC / Science",
          institution: inter.college_name,
          year: inter.year ? `Passed: ${inter.year}` : "2022",
          status: "Completed",
          score: inter.percentage ? `${inter.percentage}%` : ""
        });
      }
      // 3. School
      if (school.name) {
        educationList.push({
          degree: "Secondary School Certificate (10th)",
          department: "General Academics",
          institution: school.name,
          year: school.year ? `Passed: ${school.year}` : "2020",
          status: "Completed",
          score: school.percentage ? `${school.percentage}%` : ""
        });
      }

      // Format certificates (PART B: Name only)
      let certs = [];
      if (Array.isArray(activeStudent.certificates) && activeStudent.certificates.length > 0) {
        certs = activeStudent.certificates.map((c) => ({
          name: typeof c === "string" ? c : (c.name || c.title || "")
        })).filter((c) => c.name.trim());
      } else if (Array.isArray(activeStudent.certifications) && activeStudent.certifications.length > 0) {
        certs = activeStudent.certifications.map((c) => ({
          name: typeof c === "string" ? c : (c.name || "")
        })).filter((c) => c.name.trim());
      }

      // Initial projects from profile
      const initialProjects = (activeStudent.projects && activeStudent.projects.length > 0)
        ? activeStudent.projects.map((p) => ({
            title: p.title || "Project Title",
            technologies: p.technologies || "Python, SQL",
            description: p.description || "Designed and implemented end-to-end functionality.",
            github_url: activeStudent.github_profile || "",
            included: true,
            bullets: [
              p.description || "Engineered core modules and optimized throughput.",
              `Implemented with ${p.technologies || "modern stacks"} following industry best practices.`
            ]
          }))
        : [];

      const baseName = (activeStudent.name || "student").toLowerCase().replace(/\s+/g, ".");
      const pEmail = activeStudent.personal_email || (activeStudent.email && !activeStudent.email.includes("college.edu") ? activeStudent.email : `${baseName}@gmail.com`);
      const cEmail = activeStudent.college_email || activeStudent.email || `${baseName}@college.edu`;

      setResumeData({
        fullName: activeStudent.name || "",
        personalEmail: pEmail,
        collegeEmail: cEmail,
        emailChoice: "personal",
        email: pEmail, // Default to Personal Email as per PART G
        phone: "+91 98765 43210",
        github: activeStudent.github_profile || "",
        profilePhoto: activeStudent.profile_photo || "",
        includePhotoInResume: !!activeStudent.profile_photo,
        linkedin: "linkedin.com/in/" + (activeStudent.name ? activeStudent.name.toLowerCase().replace(/\s+/g, "") : "student"),
        targetRole: activeStudent.preferred_career || "Software / Data Engineer",
        summary: `Motivated and analytical ${activeStudent.branch || "Engineering"} student (${activeStudent.experience_status || "Fresher"}) with a strong foundation in ${(activeStudent.skills || []).slice(0, 5).join(", ") || "core technical competencies"}. Demonstrated capability through hands-on software development and capstone implementations. Seeking to apply technical skills in ${activeStudent.preferred_career || "industry roles"} to deliver robust, scalable solutions.`,
        education: educationList,
        experienceStatus: activeStudent.experience_status || "Fresher",
        experienceYears: activeStudent.experience_years || 0,
        skills: [...(activeStudent.skills || [])],
        skillInput: "",
        certificates: certs,
        projects: initialProjects,
        internships: (activeStudent.internships && activeStudent.internships.length > 0)
          ? activeStudent.internships.map((i) => ({
              role: i.role || "Technical Intern",
              company: i.company || "Company",
              duration: i.duration_months ? `${i.duration_months} Months` : "3 Months",
              mode: i.work_mode || "Hybrid",
              bullets: [
                `Contributed to production engineering tasks under ${i.role} role.`,
                "Collaborated with cross-functional teams to implement and test enterprise software modules."
              ]
            }))
          : activeStudent.num_internships > 0
          ? [
              {
                role: "Software Engineering Intern",
                company: "Tech Solutions Pvt Ltd",
                duration: "3 Months",
                mode: "Hybrid",
                bullets: [
                  "Participated in agile sprints, bug triaging, and unit testing across core application microservices.",
                  "Assisted senior engineers in API integration and database query optimization."
                ]
              }
            ]
          : []
      });

      // Automatically fetch GitHub repositories if student has a profile
      if (activeStudent.github_profile) {
        fetchGithubRepos(activeStudent.github_profile);
      }

      // Automatically fetch previously saved resumes from database
      if (activeStudent.student_id) {
        fetchStudentSavedResumes(activeStudent.student_id);
      }
    }
  }, [activeStudent]);

  // GitHub Repos Fetcher
  const fetchGithubRepos = async (profileUrl) => {
    try {
      setGithubLoading(true);
      setGithubError("");

      let username = profileUrl.trim().rstrip ? profileUrl.trim().rstrip("/") : profileUrl.trim();
      if (username.endsWith("/")) username = username.slice(0, -1);
      if (username.includes("github.com/")) {
        username = username.split("github.com/")[1].split("/")[0];
      } else if (username.includes("/")) {
        username = username.split("/").pop();
      }

      const res = await getGithubRepos(activeStudent?.student_id, username);
      if (res.success && Array.isArray(res.repos) && res.repos.length > 0) {
        setFetchedGithubRepos(res.repos);

        // Merge fetched repos into projects if projects list is empty or update repo URLs
        setResumeData((prev) => {
          if (!prev) return prev;
          // Check existing titles
          const existingTitles = new Set(prev.projects.map((p) => p.title.toLowerCase()));
          const newFromGithub = [];

          res.repos.slice(0, 6).forEach((repo) => {
            if (!existingTitles.has(repo.title.toLowerCase()) && !existingTitles.has(repo.name.toLowerCase())) {
              newFromGithub.push({
                title: repo.title || repo.name,
                technologies: repo.technologies || "General",
                description: repo.description || `Public GitHub repository by ${username}`,
                github_url: repo.html_url,
                included: true,
                bullets: [
                  repo.description || `Implemented project repository: ${repo.name}`,
                  `Repository Link: ${repo.html_url}`
                ]
              });
            }
          });

          if (prev.projects.length === 0) {
            return { ...prev, projects: newFromGithub };
          }
          return prev;
        });
      } else {
        setFetchedGithubRepos([]);
        if (res.error) setGithubError(res.error);
      }
    } catch (err) {
      console.warn("GitHub fetch error:", err);
      setGithubError("Could not connect to GitHub API or rate limit reached. Manual projects can be added below.");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleImportGithubRepo = (repo) => {
    // Add repo directly into projects
    const cleanTitle = repo.title || repo.name;
    const exists = resumeData.projects.some((p) => p.title.toLowerCase() === cleanTitle.toLowerCase());
    if (exists) return;

    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          title: cleanTitle,
          technologies: repo.technologies || "General",
          description: repo.description || "Public repository on GitHub.",
          github_url: repo.html_url,
          included: true,
          bullets: [
            repo.description || `Developed repository: ${repo.name}`,
            `Source code available on GitHub: ${repo.html_url}`
          ]
        }
      ]
    });
  };

  if (!activeStudent || !resumeData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>No active student profile loaded. Please select or register a student first.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Skill management
  const handleAddSkill = () => {
    if (!resumeData.skillInput.trim()) return;
    const clean = resumeData.skillInput.trim();
    if (!resumeData.skills.includes(clean)) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, clean],
        skillInput: ""
      });
    } else {
      setResumeData({ ...resumeData, skillInput: "" });
    }
  };

  const handleRemoveSkill = (skill) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((s) => s !== skill)
    });
  };

  // Project management
  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          title: "New Project",
          technologies: "Python, SQL",
          description: "Project methodology and deliverables.",
          github_url: activeStudent.github_profile || "",
          included: true,
          bullets: ["Implemented core features and verified test coverage."]
        }
      ]
    });
  };

  const handleRemoveProject = (idx) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== idx)
    });
  };

  const handleToggleProjectIncluded = (idx) => {
    const updated = [...resumeData.projects];
    updated[idx].included = !updated[idx].included;
    setResumeData({ ...resumeData, projects: updated });
  };

  const handleProjectFieldChange = (idx, field, val) => {
    const updated = [...resumeData.projects];
    updated[idx][field] = val;
    setResumeData({ ...resumeData, projects: updated });
  };

  const handleProjectBulletChange = (pIdx, bIdx, val) => {
    const updated = [...resumeData.projects];
    updated[pIdx].bullets[bIdx] = val;
    setResumeData({ ...resumeData, projects: updated });
  };

  const handleAddProjectBullet = (pIdx) => {
    const updated = [...resumeData.projects];
    updated[pIdx].bullets.push("Key contribution or performance milestone.");
    setResumeData({ ...resumeData, projects: updated });
  };

  const handleRemoveProjectBullet = (pIdx, bIdx) => {
    const updated = [...resumeData.projects];
    updated[pIdx].bullets = updated[pIdx].bullets.filter((_, i) => i !== bIdx);
    setResumeData({ ...resumeData, projects: updated });
  };

  // Internship management
  const handleAddInternship = () => {
    setResumeData({
      ...resumeData,
      internships: [
        ...resumeData.internships,
        {
          role: "Technical Intern",
          company: "Enterprise Inc.",
          duration: "3 Months",
          mode: "Hybrid",
          bullets: ["Contributed to core development and feature testing."]
        }
      ]
    });
  };

  const handleRemoveInternship = (idx) => {
    setResumeData({
      ...resumeData,
      internships: resumeData.internships.filter((_, i) => i !== idx)
    });
  };

  const handleInternshipFieldChange = (idx, field, val) => {
    const updated = [...resumeData.internships];
    updated[idx][field] = val;
    setResumeData({ ...resumeData, internships: updated });
  };

  const handleInternshipBulletChange = (iIdx, bIdx, val) => {
    const updated = [...resumeData.internships];
    updated[iIdx].bullets[bIdx] = val;
    setResumeData({ ...resumeData, internships: updated });
  };

  const handleAddInternshipBullet = (iIdx) => {
    const updated = [...resumeData.internships];
    updated[iIdx].bullets.push("Assisted team in feature rollout and documentation.");
    setResumeData({ ...resumeData, internships: updated });
  };

  const handleRemoveInternshipBullet = (iIdx, bIdx) => {
    const updated = [...resumeData.internships];
    updated[iIdx].bullets = updated[iIdx].bullets.filter((_, i) => i !== bIdx);
    setResumeData({ ...resumeData, internships: updated });
  };

  // Certifications management
  const handleAddCert = (val) => {
    if (!val.trim()) return;
    const exists = resumeData.certificates.some((c) => c.name.toLowerCase() === val.trim().toLowerCase());
    if (!exists) {
      setResumeData({
        ...resumeData,
        certificates: [...resumeData.certificates, { name: val.trim(), issuing_org: "Certified", completion_date: "2024", certificate_url: "" }]
      });
    }
  };

  const handleRemoveCert = (idx) => {
    setResumeData({
      ...resumeData,
      certificates: resumeData.certificates.filter((_, i) => i !== idx)
    });
  };

  const selectedProjects = resumeData.projects.filter((p) => p.included !== false);

  return (
    <div className="resume-builder-page">
      {/* Top Action Bar */}
      <div className="card no-print" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={20} color="var(--brand-blue)" /> ATS-Friendly Smart Resume Builder
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="Resume Title (e.g. Data Scientist Resume)"
                style={{
                  fontSize: "0.85rem",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  fontWeight: 600,
                  color: "#1e293b",
                  width: "240px"
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                for <strong>{activeStudent.name}</strong> ({activeStudent.student_id})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Saved Resumes Quick Switcher if available */}
            {savedResumesList.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} color="#64748b" />
                <select
                  value={activeResumeId || ""}
                  onChange={(e) => {
                    const found = savedResumesList.find((r) => r.id === parseInt(e.target.value));
                    if (found) handleLoadResume(found);
                  }}
                  style={{
                    fontSize: "0.8rem",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    color: "#1e293b",
                    fontWeight: 500
                  }}
                >
                  <option value="" disabled>Saved Resumes ({savedResumesList.length})</option>
                  {savedResumesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({new Date(r.updated_at || r.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", backgroundColor: "var(--bg-subtle)", borderRadius: "6px", padding: "3px" }}>
              <button
                type="button"
                onClick={() => setActiveView("split")}
                className={`btn btn-sm ${activeView === "split" ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "4px" }}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={`btn btn-sm ${activeView === "edit" ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "4px" }}
              >
                <Edit size={13} /> Edit Content
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`btn btn-sm ${activeView === "preview" ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "4px" }}
              >
                <Eye size={13} /> ATS Preview
              </button>
            </div>

            {/* Clearly Visible Save Resume Button */}
            <button
              type="button"
              onClick={handleSaveResume}
              disabled={saveStatus === "saving"}
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 600,
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
              }}
              title="Save Resume to Database"
            >
              <Save size={16} /> {saveStatus === "saving" ? "Saving..." : "Save Resume"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
              title="Print or Save as PDF"
            >
              <Download size={16} /> Download PDF / Print
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {saveMessage && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: saveStatus === "saved" ? "#f0fdf4" : "#fef2f2",
              color: saveStatus === "saved" ? "#15803d" : "#b91c1c",
              border: `1px solid ${saveStatus === "saved" ? "#bbf7d0" : "#fecaca"}`
            }}
          >
            {saveStatus === "saved" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ display: "grid", gridTemplateColumns: activeView === "split" ? "1fr 1fr" : "1fr", gap: "20px" }}>
        {/* EDIT CONTROLS */}
        {(activeView === "split" || activeView === "edit") && (
          <div className="resume-editor no-print" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* 1. Personal & Contact Information Card */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "12px", fontSize: "1rem" }}>
                1. Personal & Contact Information
              </div>

              {/* Photo toggle if available */}
              {resumeData.profilePhoto && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", padding: "8px 12px", backgroundColor: "var(--bg-subtle)", borderRadius: "6px" }}>
                  <img
                    src={resumeData.profilePhoto}
                    alt="Avatar"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <label style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--primary-navy)", fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={resumeData.includePhotoInResume}
                      onChange={(e) => setResumeData({ ...resumeData, includePhotoInResume: e.target.checked })}
                    />
                    Display profile photo on resume header
                  </label>
                </div>
              )}

              <div className="grid-2" style={{ marginBottom: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.fullName}
                    onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Role / Title</label>
                  <input
                    type="text"
                    value={resumeData.targetRole}
                    onChange={(e) => setResumeData({ ...resumeData, targetRole: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* PART G: Contact Email on Resume (Personal Email Default vs College Email) */}
              <div style={{ marginBottom: "12px", padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <label className="form-label" style={{ marginBottom: "8px", fontWeight: 700, fontSize: "0.8rem", color: "var(--primary-navy)" }}>
                  Resume Contact Email Preference:
                </label>
                <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", cursor: "pointer", color: "var(--primary-navy)", fontWeight: resumeData.emailChoice === "personal" ? 700 : 400 }}>
                    <input
                      type="radio"
                      name="resumeEmailChoice"
                      value="personal"
                      checked={resumeData.emailChoice === "personal"}
                      onChange={() => setResumeData({ ...resumeData, emailChoice: "personal", email: resumeData.personalEmail })}
                    />
                    <span>Personal Email ({resumeData.personalEmail || "N/A"}) <strong>[Default]</strong></span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", cursor: "pointer", color: "var(--primary-navy)", fontWeight: resumeData.emailChoice === "college" ? 700 : 400 }}>
                    <input
                      type="radio"
                      name="resumeEmailChoice"
                      value="college"
                      checked={resumeData.emailChoice === "college"}
                      onChange={() => setResumeData({ ...resumeData, emailChoice: "college", email: resumeData.collegeEmail })}
                    />
                    <span>College Email ({resumeData.collegeEmail || "N/A"})</span>
                  </label>
                </div>
                <input
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  className="form-input"
                  placeholder="Primary contact email displayed on resume..."
                  style={{ height: "36px", fontSize: "0.84rem" }}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn / Portfolio Link</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/username"
                    value={resumeData.linkedin}
                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">GitHub Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/username"
                    value={resumeData.github}
                    onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn / Portfolio Link</label>
                  <input
                    type="text"
                    value={resumeData.linkedin}
                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* 2. Professional Summary */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "12px", fontSize: "1rem" }}>
                2. Professional Summary
              </div>
              <div className="form-group">
                <textarea
                  rows={4}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="form-textarea"
                  placeholder="Concise 2-3 sentence career summary tailored for ATS parsers..."
                />
              </div>
            </div>

            {/* 3. Education Card */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "12px", fontSize: "1rem" }}>
                3. Educational Details ({resumeData.education.length})
              </div>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "6px", marginBottom: "8px" }}>
                  <div className="grid-2" style={{ marginBottom: "8px" }}>
                    <div className="form-group">
                      <label className="form-label">Degree / Certificate</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].degree = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department / Stream</label>
                      <input
                        type="text"
                        value={edu.department}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].department = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Institution Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].institution = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Score / Percentage</label>
                        <input
                          type="text"
                          value={edu.score}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].score = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Year / Status</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].year = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Technical Skills */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "12px", fontSize: "1rem" }}>
                4. Technical Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {resumeData.skills.map((skill) => (
                  <span key={skill} className="badge badge-blue" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
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
                  placeholder="Add skill (e.g. Java, Docker, React)..."
                  value={resumeData.skillInput}
                  onChange={(e) => setResumeData({ ...resumeData, skillInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="form-input"
                />
                <button type="button" onClick={handleAddSkill} className="btn btn-secondary btn-sm">
                  Add
                </button>
              </div>
            </div>

            {/* 5. GITHUB PROJECTS SECTION & FETCHED REPOS */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div className="card-title" style={{ fontSize: "1rem" }}>
                    5. Technical & GitHub Projects ({resumeData.projects.length})
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Selected projects display live clickable repository links in your resume and PDF export.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {activeStudent.github_profile && (
                    <button
                      type="button"
                      onClick={() => fetchGithubRepos(activeStudent.github_profile)}
                      className="btn btn-secondary btn-sm"
                      disabled={githubLoading}
                    >
                      <RefreshCw size={13} className={githubLoading ? "spin" : ""} /> {githubLoading ? "Fetching..." : "Re-fetch GitHub"}
                    </button>
                  )}
                  <button type="button" onClick={handleAddProject} className="btn btn-primary btn-sm">
                    <Plus size={13} /> Add Manual Project
                  </button>
                </div>
              </div>

              {/* GitHub Repos discovery list if fetched */}
              {fetchedGithubRepos.length > 0 && (
                <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--primary-navy)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <GithubIcon size={14} /> Fetched Public Repositories from GitHub ({fetchedGithubRepos.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {fetchedGithubRepos.map((repo) => {
                      const isAlreadyAdded = resumeData.projects.some(
                        (p) => p.title.toLowerCase() === (repo.title || repo.name).toLowerCase()
                      );
                      return (
                        <div
                          key={repo.html_url}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: isAlreadyAdded ? "#eff6ff" : "#ffffff",
                            border: isAlreadyAdded ? "1px solid #bfdbfe" : "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <div>
                            <strong>{repo.name}</strong> <span style={{ color: "var(--text-muted)" }}>({repo.technologies})</span>
                          </div>
                          {!isAlreadyAdded ? (
                            <button
                              type="button"
                              onClick={() => handleImportGithubRepo(repo)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "2px 6px", fontSize: "0.7rem" }}
                            >
                              + Add to Resume
                            </button>
                          ) : (
                            <span style={{ color: "var(--brand-blue)", fontWeight: 600, fontSize: "0.7rem" }}>
                              ✓ Added
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {githubError && (
                <div style={{ padding: "8px 12px", backgroundColor: "var(--warning-bg)", color: "#b45309", borderRadius: "6px", fontSize: "0.78rem", marginBottom: "12px" }}>
                  {githubError}
                </div>
              )}

              {/* Active Projects List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {resumeData.projects.map((proj, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      padding: "14px",
                      backgroundColor: proj.included !== false ? "var(--bg-subtle)" : "#f8fafc",
                      borderRadius: "6px",
                      border: proj.included !== false ? "1px solid var(--border-subtle)" : "1px dashed #cbd5e1",
                      opacity: proj.included !== false ? 1 : 0.65
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, marginRight: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleProjectIncluded(pIdx)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: proj.included !== false ? "var(--brand-blue)" : "#94a3b8" }}
                          title={proj.included !== false ? "Included in Resume (Click to exclude)" : "Excluded from Resume (Click to include)"}
                        >
                          {proj.included !== false ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleProjectFieldChange(pIdx, "title", e.target.value)}
                          className="form-input"
                          placeholder="Project Name"
                          style={{ fontWeight: 600, flex: 1 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(pIdx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid-2" style={{ marginBottom: "8px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.76rem" }}>Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => handleProjectFieldChange(pIdx, "technologies", e.target.value)}
                          className="form-input"
                          placeholder="Python, SQL, React"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.76rem" }}>GitHub Repository Link</label>
                        <input
                          type="url"
                          value={proj.github_url || ""}
                          onChange={(e) => handleProjectFieldChange(pIdx, "github_url", e.target.value)}
                          className="form-input"
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <label className="form-label" style={{ fontSize: "0.76rem" }}>Bullet Points</label>
                      {proj.bullets.map((b, bIdx) => (
                        <div key={bIdx} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => handleProjectBulletChange(pIdx, bIdx, e.target.value)}
                            className="form-input"
                            style={{ fontSize: "0.82rem" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProjectBullet(pIdx, bIdx)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddProjectBullet(pIdx)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "2px 8px", marginTop: "4px" }}
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. EXACT REQUIREMENT: Pushed Projects in GitHub External App Link Card */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <GithubIcon size={18} /> Pushed Projects in GitHub
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0 0" }}>
                    Check your pushed projects and explore your GitHub repositories using GitHub Repository Analytics.
                  </p>
                </div>

                <a
                  href="https://github-repository-analytics.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: "8px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Check Pushed Projects in GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* 6. Internships & Experience Card */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div className="card-title" style={{ fontSize: "1rem" }}>
                  6. Experience & Internships ({resumeData.internships.length})
                </div>
                <button type="button" onClick={handleAddInternship} className="btn btn-secondary btn-sm">
                  <Plus size={13} /> Add Experience
                </button>
              </div>

              {resumeData.internships.length === 0 ? (
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "10px", backgroundColor: "var(--bg-subtle)", borderRadius: "6px" }}>
                  Profile marked as Fresher. Click "+ Add Experience" if you have any internships to include.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {resumeData.internships.map((intern, iIdx) => (
                    <div key={iIdx} style={{ padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div className="grid-2" style={{ flex: 1, marginRight: "8px" }}>
                          <input
                            type="text"
                            value={intern.role}
                            onChange={(e) => handleInternshipFieldChange(iIdx, "role", e.target.value)}
                            className="form-input"
                            placeholder="Job / Intern Title"
                            style={{ fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            value={intern.company}
                            onChange={(e) => handleInternshipFieldChange(iIdx, "company", e.target.value)}
                            className="form-input"
                            placeholder="Company Name"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInternship(iIdx)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid-2" style={{ marginBottom: "8px" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.76rem" }}>Duration</label>
                          <input
                            type="text"
                            value={intern.duration}
                            onChange={(e) => handleInternshipFieldChange(iIdx, "duration", e.target.value)}
                            className="form-input"
                            placeholder="e.g. 3 Months / June 2024 - Aug 2024"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.76rem" }}>Work Mode</label>
                          <input
                            type="text"
                            value={intern.mode}
                            onChange={(e) => handleInternshipFieldChange(iIdx, "mode", e.target.value)}
                            className="form-input"
                            placeholder="Remote / On-site / Hybrid"
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: "8px" }}>
                        <label className="form-label" style={{ fontSize: "0.76rem" }}>Bullet Points</label>
                        {intern.bullets.map((b, bIdx) => (
                          <div key={bIdx} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => handleInternshipBulletChange(iIdx, bIdx, e.target.value)}
                              className="form-input"
                              style={{ fontSize: "0.82rem" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveInternshipBullet(iIdx, bIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddInternshipBullet(iIdx)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.75rem", padding: "2px 8px", marginTop: "4px" }}
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Certificates Card (PART B: Name only) */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "12px", fontSize: "1rem" }}>
                7. Certificates ({resumeData.certificates.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {resumeData.certificates.length === 0 ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No certificates added yet.</span>
                ) : (
                  resumeData.certificates.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "6px"
                      }}
                    >
                      <div style={{ fontSize: "0.84rem" }}>
                        <strong style={{ color: "var(--primary-navy)" }}>{c.name || c}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                        title="Remove Certificate"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Certificate input in Resume Builder */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Add certificate name (e.g. AWS Certified Developer)..."
                  id="resumeCertInput"
                  className="form-input"
                  style={{ fontSize: "0.84rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCert(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("resumeCertInput");
                    if (el && el.value.trim()) {
                      handleAddCert(el.value);
                      el.value = "";
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ATS RESUME PREVIEW (A4 PAPER STYLED) */}
        {(activeView === "split" || activeView === "preview") && (
          <div className="resume-preview-container">
            <div
              id="resume-preview-area"
              className="resume-paper"
              style={{
                backgroundColor: "#ffffff",
                color: "#1e293b",
                padding: "36px 42px",
                borderRadius: "4px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                lineHeight: "1.45",
                fontSize: "13px",
                border: "1px solid #cbd5e1",
                minHeight: "860px"
              }}
            >
              {/* ATS Resume Header with Photo (if enabled) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "14px", marginBottom: "16px" }}>
                <div style={{ flex: 1, textAlign: resumeData.includePhotoInResume && resumeData.profilePhoto ? "left" : "center" }}>
                  <h1 style={{ fontSize: "22px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px 0", color: "#0f172a" }}>
                    {resumeData.fullName || "STUDENT NAME"}
                  </h1>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", marginBottom: "6px" }}>
                    {resumeData.targetRole}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "#475569", justifyContent: resumeData.includePhotoInResume && resumeData.profilePhoto ? "flex-start" : "center" }}>
                    {resumeData.email && <span>{resumeData.email}</span>}
                    {resumeData.phone && <span>• {resumeData.phone}</span>}
                    {resumeData.github && (
                      <span>
                        • GitHub:{" "}
                        <a href={resumeData.github} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                          {resumeData.github.replace(/^https?:\/\//, "")}
                        </a>
                      </span>
                    )}
                    {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                  </div>
                </div>

                {resumeData.includePhotoInResume && resumeData.profilePhoto && (
                  <div style={{ width: "68px", height: "68px", borderRadius: "50%", overflow: "hidden", border: "1.5px solid #0f172a", marginLeft: "16px", flexShrink: 0 }}>
                    <img
                      src={resumeData.profilePhoto}
                      alt={resumeData.fullName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {/* 1. PROFESSIONAL SUMMARY */}
              {resumeData.summary && (
                <div style={{ marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                    Professional Summary
                  </h2>
                  <p style={{ margin: "0", fontSize: "12.5px", color: "#334155", textAlign: "justify" }}>
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* 2. EDUCATION */}
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                  Education
                </h2>
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: "700", color: "#0f172a" }}>
                      <span>{edu.institution}</span>
                      <span style={{ fontSize: "12px", color: "#475569" }}>{edu.year}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "12.5px", color: "#334155" }}>
                      <span>{edu.degree} — {edu.department}</span>
                      {edu.score && <span style={{ fontWeight: "600" }}>{edu.score}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. TECHNICAL SKILLS */}
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                    Technical Skills
                  </h2>
                  <div style={{ fontSize: "12.5px", color: "#334155" }}>
                    <strong>Technologies & Competencies:</strong> {resumeData.skills.join(", ")}
                  </div>
                </div>
              )}

              {/* 4. TECHNICAL & GITHUB PROJECTS */}
              {selectedProjects.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                    Technical & GitHub Projects
                  </h2>
                  {selectedProjects.map((proj, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: "700", color: "#0f172a" }}>
                        <span>
                          {proj.title}
                          {proj.github_url && (
                            <span style={{ marginLeft: "6px", fontWeight: 400, fontSize: "11px" }}>
                              [<a href={proj.github_url} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                                GitHub Repo
                              </a>]
                            </span>
                          )}
                        </span>
                        <span style={{ fontSize: "11.5px", fontWeight: "600", color: "#2563eb" }}>
                          {proj.technologies}
                        </span>
                      </div>
                      <ul style={{ margin: "4px 0 0 18px", padding: 0, fontSize: "12px", color: "#334155" }}>
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: "2px" }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. EXPERIENCE & INTERNSHIPS */}
              {resumeData.internships && resumeData.internships.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                    Internships & Practical Experience
                  </h2>
                  {resumeData.internships.map((intern, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: "700", color: "#0f172a" }}>
                        <span>
                          {intern.role} — <span style={{ color: "#2563eb" }}>{intern.company}</span>
                        </span>
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {intern.duration} ({intern.mode})
                        </span>
                      </div>
                      <ul style={{ margin: "4px 0 0 18px", padding: 0, fontSize: "12px", color: "#334155" }}>
                        {intern.bullets.map((b, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: "2px" }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. CERTIFICATES */}
              {resumeData.certificates && resumeData.certificates.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #94a3b8", paddingBottom: "3px", marginBottom: "6px" }}>
                    Certificates & Credentials
                  </h2>
                  <ul style={{ margin: "4px 0 0 18px", padding: 0, fontSize: "12px", color: "#334155" }}>
                    {resumeData.certificates.map((c, idx) => (
                      <li key={idx} style={{ marginBottom: "2px" }}>
                        <strong>{c.name || c}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
