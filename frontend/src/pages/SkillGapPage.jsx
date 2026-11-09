import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Target,
  TrendingUp,
  Search
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getSkillGap } from "../services/api";

export default function SkillGapPage({ selectedCareerId, setSelectedCareerId, setActiveTab }) {
  const { activeStudent } = useStudent();
  const [roleInput, setRoleInput] = useState(activeStudent?.preferred_career || "Data Analyst");
  const [activeRoleName, setActiveRoleName] = useState(activeStudent?.preferred_career || "Data Analyst");
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  const suggestedRoles = [
    "Data Analyst",
    "Python Developer",
    "ML Engineer",
    "Full Stack Developer",
    "Cloud & DevOps Engineer",
    "Java Developer",
    "Software Development Engineer (SDE)"
  ];

  // Load skill gap data whenever activeStudent or activeRoleName changes
  useEffect(() => {
    async function loadGap() {
      if (!activeStudent?.student_id) return;
      try {
        setLoading(true);
        const res = await getSkillGap(activeStudent.student_id, null, activeRoleName);
        if (res.success) {
          setGapData(res);
        }
      } catch (err) {
        console.error("Skill gap load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGap();
  }, [activeStudent, activeRoleName]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!roleInput.trim()) return;
    setActiveRoleName(roleInput.trim());
  };

  const handleSelectSuggestedRole = (role) => {
    setRoleInput(role);
    setActiveRoleName(role);
  };

  if (loading && !gapData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Analyzing skill compatibility and identifying gaps for {activeRoleName}...</p>
      </div>
    );
  }

  const careerInfo = gapData?.career || {};
  const matchedSkills = gapData?.matched_skills || [];
  const missingSkills = gapData?.missing_skills || [];
  const priorityList = gapData?.priority_skills_to_learn || [];
  const gapPercentage = gapData?.skill_gap_percentage || 0;

  return (
    <div>
      {/* Target Role Searchable Input Header */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                Skill Gap Analyzer
              </h2>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Type any career role to evaluate your profile skills against industry requirements.
            </p>
          </div>
        </div>

        {/* Searchable Text Input Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
            <input
              type="text"
              placeholder="Type any career role (e.g. Data Analyst, Python Developer, ML Engineer, Full Stack Developer)..."
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "42px", fontSize: "0.92rem", fontWeight: 500 }}
            />
            <Search size={17} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-dim)" }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "42px", padding: "0 20px" }}>
            Analyze Skill Gap
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Quick Examples:
          </span>
          {suggestedRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleSelectSuggestedRole(role)}
              className={`badge ${activeRoleName.toLowerCase() === role.toLowerCase() ? "badge-blue" : "badge-gray"}`}
              style={{ cursor: "pointer", border: "1px solid var(--border-subtle)", padding: "4px 10px", fontSize: "0.76rem" }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Target Role</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: "1.25rem" }}>{careerInfo.title || activeRoleName}</div>
          <div className="kpi-subtext">{careerInfo.domain || "Target Role"}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Matched Skills</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "var(--success)" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>
            {gapData?.total_matched} / {gapData?.total_required}
          </div>
          <div className="kpi-subtext">Competencies already acquired</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Missing Skills</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fef2f2", color: "var(--danger)" }}>
              <XCircle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>
            {gapData?.total_missing}
          </div>
          <div className="kpi-subtext">Gaps requiring upskilling</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Skill Gap Ratio</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fffbeb", color: "var(--warning)" }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: gapPercentage > 50 ? "var(--danger)" : "var(--warning)" }}>
            {gapPercentage}%
          </div>
          <div className="kpi-subtext">Deficit percentage</div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Matched vs Missing */}
      <div className="grid-2">
        {/* Matched Skills Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: "var(--success)" }}>
                <CheckCircle2 size={18} /> Verified Matched Skills ({matchedSkills.length})
              </div>
              <div className="card-subtitle">Skills found in your profile that satisfy requirements for {activeRoleName}</div>
            </div>
          </div>

          {matchedSkills.length === 0 ? (
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
              No overlapping skills currently found. Explore the priority learning list below to get started.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {matchedSkills.map((s) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--success-bg)",
                    border: "1px solid #a7f3d0"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--primary-navy)" }}>
                    <CheckCircle2 size={16} color="var(--success)" />
                    <span>{s}</span>
                  </div>
                  <span className="badge badge-green">Satisfied</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: "var(--danger)" }}>
                <XCircle size={18} /> Missing Required Skills ({missingSkills.length})
              </div>
              <div className="card-subtitle">Key prerequisite skills needed to become competitive for {activeRoleName}</div>
            </div>
          </div>

          {missingSkills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--success)", fontWeight: 600 }}>
              🎉 Perfect Match! You have covered all required skills for {activeRoleName}.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {missingSkills.map((s) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--danger-bg)",
                    border: "1px solid #fecaca"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--primary-navy)" }}>
                    <XCircle size={16} color="var(--danger)" />
                    <span>{s}</span>
                  </div>
                  <span className="badge badge-red">Missing Gap</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority Ranked Skills to Learn */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <TrendingUp size={18} color="var(--brand-blue)" /> Priority Learning Recommendations
            </div>
            <div className="card-subtitle">
              Missing skills ranked by current industry hiring frequency and role importance
            </div>
          </div>
          <button
            onClick={() => {
              if (setSelectedCareerId) setSelectedCareerId(careerInfo.id || 1);
              setActiveTab("career_roadmap");
            }}
            className="btn btn-primary btn-sm"
          >
            Generate Career Roadmap <ArrowRight size={13} />
          </button>
        </div>

        {priorityList.length === 0 ? (
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>No missing skills to prioritize.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Priority Rank</th>
                  <th>Skill Name</th>
                  <th>Domain Category</th>
                  <th>Market Demand Index</th>
                  <th>Action Urgency</th>
                </tr>
              </thead>
              <tbody>
                {priorityList.map((item) => (
                  <tr key={item.name}>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: item.rank === 1 ? "var(--danger)" : item.rank === 2 ? "var(--warning)" : "var(--bg-subtle)",
                          color: item.rank <= 2 ? "#ffffff" : "var(--text-muted)",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.78rem"
                        }}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary-navy)" }}>{item.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gray">{item.category}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="progress-container" style={{ width: "100px", height: "6px" }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${item.demand_index}%`, backgroundColor: "var(--brand-blue)" }}
                          />
                        </div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{item.demand_index} / 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={item.urgency === "High" ? "badge badge-red" : item.urgency === "Medium" ? "badge badge-yellow" : "badge badge-gray"}>
                        {item.urgency} Urgency
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
