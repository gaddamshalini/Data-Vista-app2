import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Building,
  Briefcase,
  CheckCircle,
  BarChart2,
  Search,
  Eye,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
  X
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getAdminMetrics,
  getAdminStudents,
  getAdminStudentDeepDive
} from "../services/api";

export default function AdminDashboardPage() {
  const { isAdmin, userRole } = useStudent();

  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Student Dossier Modal
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [mRes, sRes] = await Promise.all([
        getAdminMetrics("admin"),
        getAdminStudents("", "admin")
      ]);

      if (mRes.success) setMetrics(mRes.metrics);
      if (sRes.success) setStudents(sRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load admin metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await getAdminStudents(searchQuery.trim(), "admin");
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      console.warn("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDossier = async (studentId) => {
    try {
      setLoadingDossier(true);
      const res = await getAdminStudentDeepDive(studentId, "admin");
      if (res.success) {
        setSelectedStudentDossier(res);
      }
    } catch (err) {
      alert("Error loading student dossier: " + err.message);
    } finally {
      setLoadingDossier(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px" }}>
        <ShieldCheck size={54} color="#dc2626" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "8px" }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "20px" }}>
          The Administrator Dashboard requires elevated administrative credentials. Please sign in via the Admin Portal tab on the login screen.
        </p>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
            backgroundColor: "#f1f5f9",
            padding: "6px 12px",
            borderRadius: "6px"
          }}
        >
          Demo Admin Credentials: <strong>admin</strong> / <strong>admin123</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page" style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb"
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                DATA VISTA Institutional Administration
              </h1>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0 0" }}>
              Comprehensive institutional placement intelligence, cohort assessment metrics, and individual student dossiers.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: "#dcfce7",
                color: "#15803d"
              }}
            >
              Role: System Administrator
            </span>
            <button
              type="button"
              onClick={loadData}
              className="btn btn-secondary btn-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "20px"
          }}
        >
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Registered Students</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-navy)", marginTop: "4px" }}>
              {metrics.total_students}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Across all branches</div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>Skill Tests Taken</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {metrics.total_skill_tests}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Avg Score: {metrics.avg_skill_pct}%</div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>Aptitude Tests</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
              {metrics.total_apt_tests}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Avg Score: {metrics.avg_apt_pct}%</div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, textTransform: "uppercase" }}>Goal Completion</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
              {metrics.goal_completion_rate}%
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
              {metrics.completed_learning_goals} of {metrics.total_learning_goals} completed
            </div>
          </div>
        </div>
      )}

      {/* Cohort Breakdown & Top Skills */}
      {metrics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Department Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "14px" }}>
              Department-Wise Enrolment
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {metrics.dept_breakdown?.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#f8fafc",
                    fontSize: "0.85rem"
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{d.department}</span>
                  <span style={{ fontWeight: 700, color: "var(--brand-blue)" }}>{d.count} students</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills in Cohort */}
          <div className="card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "14px" }}>
              Most Acquired Student Skills
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {metrics.top_skills?.map((sk, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    fontSize: "0.82rem",
                    color: "#1e40af",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <strong>{sk.skill}</strong>
                  <span style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "1px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 700 }}>
                    {sk.student_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Search & List */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
              Student Directory & Deep Dive
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Inspect individual student portfolios, assessment scores, and saved resumes.
            </p>
          </div>

          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Search by ID, Name or Department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.85rem",
                width: "280px"
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={14} /> Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 12px" }}>Student ID</th>
                <th style={{ padding: "10px 12px" }}>Full Name</th>
                <th style={{ padding: "10px 12px" }}>Branch</th>
                <th style={{ padding: "10px 12px" }}>CGPA</th>
                <th style={{ padding: "10px 12px" }}>Career Goal</th>
                <th style={{ padding: "10px 12px" }}>Skill Tests</th>
                <th style={{ padding: "10px 12px" }}>Aptitude Tests</th>
                <th style={{ padding: "10px 12px" }}>Resumes</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Dossier</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: 700, color: "var(--brand-blue)" }}>
                    {s.student_id}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "var(--primary-navy)" }}>
                    {s.name}
                  </td>
                  <td style={{ padding: "12px", color: "#475569" }}>
                    {s.branch}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 700 }}>
                    {s.cgpa}
                  </td>
                  <td style={{ padding: "12px", color: "#64748b", fontSize: "0.82rem" }}>
                    {s.preferred_career || "General"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 600, fontSize: "0.78rem" }}>
                      {s.skill_tests_count} taken
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f5f3ff", color: "#6d28d9", fontWeight: 600, fontSize: "0.78rem" }}>
                      {s.aptitude_tests_count} taken
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f0fdf4", color: "#15803d", fontWeight: 600, fontSize: "0.78rem" }}>
                      {s.saved_resumes_count} saved
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(s.student_id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentDossier && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "26px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-navy)", margin: 0 }}>
                  {selectedStudentDossier.student.name}
                </h3>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Student ID: <strong>{selectedStudentDossier.student.student_id}</strong> • {selectedStudentDossier.student.branch} (CGPA: {selectedStudentDossier.student.cgpa})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentDossier(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Assessment Records in Dossier */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                Completed Skill Assessments ({selectedStudentDossier.skill_assessments.length})
              </h4>
              {selectedStudentDossier.skill_assessments.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>No skill tests taken.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedStudentDossier.skill_assessments.map((sa) => (
                    <div
                      key={sa.id}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontSize: "0.82rem"
                      }}
                    >
                      <strong>{sa.skill}</strong>: {sa.score}/10 ({sa.percentage}%) • <span style={{ fontWeight: 600 }}>{sa.skill_level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aptitude Assessments */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                Aptitude Assessments ({selectedStudentDossier.aptitude_assessments.length})
              </h4>
              {selectedStudentDossier.aptitude_assessments.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>No aptitude tests taken.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedStudentDossier.aptitude_assessments.map((aa) => (
                    <div
                      key={aa.id}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#f5f3ff",
                        border: "1px solid #ddd6fe",
                        fontSize: "0.82rem"
                      }}
                    >
                      Overall: <strong>{aa.score}/10</strong> ({aa.percentage}%) • Level: {aa.performance_level}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Resumes */}
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
                Saved Resumes ({selectedStudentDossier.saved_resumes.length})
              </h4>
              {selectedStudentDossier.saved_resumes.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>No saved resumes in database.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedStudentDossier.saved_resumes.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        fontSize: "0.82rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span><strong>{r.title}</strong></span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Last modified: {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
