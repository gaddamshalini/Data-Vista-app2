import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Code,
  Award,
  Layers,
  Briefcase,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  UserCheck,
  Building
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getCareerRecommendations,
  getSkillGap,
  getInternshipMatches
} from "../services/api";

export default function DashboardPage({ setActiveTab }) {
  const { activeStudent, loading: studentLoading } = useStudent();

  const [metrics, setMetrics] = useState({
    topCareer: null,
    skillGapCount: 0,
    matchedCount: 0,
    gapPercentage: 0,
    internshipCount: 0,
    loading: true
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeStudent?.student_id) return;
      try {
        setMetrics((prev) => ({ ...prev, loading: true }));
        const [careerRes, gapRes, internRes] = await Promise.all([
          getCareerRecommendations(activeStudent.student_id).catch(() => null),
          getSkillGap(activeStudent.student_id).catch(() => null),
          getInternshipMatches(activeStudent.student_id).catch(() => null)
        ]);

        const topC =
          careerRes?.success && careerRes.top_recommendations?.length > 0
            ? careerRes.top_recommendations[0]
            : null;

        setMetrics({
          topCareer: topC,
          skillGapCount: gapRes?.success ? (gapRes.total_missing || gapRes.missing_skills?.length || 0) : 0,
          matchedCount: gapRes?.success ? (gapRes.total_matched || gapRes.matched_skills?.length || 0) : 0,
          gapPercentage: gapRes?.success ? (gapRes.gap_percentage || 0) : 0,
          internshipCount: internRes?.success ? (internRes.top_internships?.length || 0) : 0,
          loading: false
        });
      } catch (err) {
        console.error("Dashboard metrics load error:", err);
        setMetrics((prev) => ({ ...prev, loading: false }));
      }
    }
    loadDashboardData();
  }, [activeStudent]);

  if (studentLoading || !activeStudent) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading active student dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Student Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 50%, #B39DDB 100%)",
          color: "#4A3B68",
          padding: "26px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "20px",
          border: "1px solid #D1C4E9",
          boxShadow: "0 8px 20px -4px rgba(74, 59, 104, 0.15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {activeStudent.profile_photo ? (
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(74, 59, 104, 0.3)", flexShrink: 0 }}>
              <img src={activeStudent.profile_photo} alt={activeStudent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : null}
          <div>
            <div style={{ display: "inline-block", background: "rgba(74, 59, 104, 0.12)", color: "#4A3B68", border: "1px solid rgba(74, 59, 104, 0.2)", padding: "3px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px" }}>
              DATA VISTA • STUDENT PROFILE INTELLIGENCE
            </div>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#4A3B68" }}>
              Welcome back, {activeStudent.name}!
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#4A3B68", marginTop: "4px" }}>
              Student ID: <strong style={{ color: "#4A3B68" }}>{activeStudent.student_id}</strong> • {activeStudent.branch} (Year {activeStudent.year}) • Experience: <strong style={{ color: "#4A3B68" }}>{activeStudent.experience_status || "Fresher"}</strong>
              {activeStudent.experience_status === "Experienced" && ` (${activeStudent.experience_years || 0} yrs)`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(74, 59, 104, 0.15)", padding: "14px 20px", borderRadius: "10px", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(74, 59, 104, 0.06)" }}>
          <div>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#6A588E", fontWeight: 700 }}>
              Target Career Match
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, lineHeight: 1.1, color: "#4A3B68" }}>
              {metrics.topCareer ? `${metrics.topCareer.suitability_percentage}%` : "Calculating..."}
            </div>
            <div style={{ fontSize: "0.76rem", color: "#4A3B68", fontWeight: 600 }}>
              {metrics.topCareer ? metrics.topCareer.title : activeStudent.preferred_career}
            </div>
          </div>
          <button
            onClick={() => setActiveTab("career_recommendation")}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: "#4A3B68", color: "#ffffff", border: "none", fontWeight: 600, padding: "8px 14px", borderRadius: "6px" }}
          >
            Details <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* KPI 1: CGPA */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Academic CGPA</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeStudent.cgpa}</div>
          <div className="kpi-subtext">Scale of 10.0 • Verified</div>
        </div>

        {/* KPI 2: Skills */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Verified Skills</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#f0fdf4", color: "var(--success)" }}>
              <Code size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeStudent.skills?.length || 0}</div>
          <div className="kpi-subtext">Technical competencies</div>
        </div>

        {/* KPI 3: Projects */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Projects Built</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#faf5ff", color: "var(--purple)" }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeStudent.projects?.length || 0}</div>
          <div className="kpi-subtext">Academic & capstone work</div>
        </div>

        {/* KPI 4: Certifications */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Certifications</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fffbeb", color: "var(--warning)" }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeStudent.certifications?.length || 0}</div>
          <div className="kpi-subtext">Industry credentials</div>
        </div>

        {/* KPI 5: Number of Internships */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Internships</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {activeStudent.num_internships !== undefined ? activeStudent.num_internships : 0}
          </div>
          <div className="kpi-subtext">
            Status: <strong>{activeStudent.experience_status || "Fresher"}</strong>
          </div>
        </div>

        {/* KPI 6: Top Career */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recommended Career</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#f0fdf4", color: "var(--success)" }}>
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: "1.15rem", lineHeight: 1.3 }}>
            {metrics.topCareer ? metrics.topCareer.title : activeStudent.preferred_career}
          </div>
          <div className="kpi-subtext" style={{ color: "var(--success)", fontWeight: 600 }}>
            {metrics.topCareer ? `${metrics.topCareer.suitability_percentage}% Match` : "Evaluated"}
          </div>
        </div>

        {/* KPI 7: Skill Gap Count */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Skill Gaps Identified</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fef2f2", color: "var(--danger)" }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>
            {metrics.skillGapCount}
          </div>
          <div className="kpi-subtext">Missing for {activeStudent.preferred_career}</div>
        </div>

        {/* KPI 8: Matching Internships */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Matching Internships</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#f0f9ff", color: "var(--info)" }}>
              <Building size={20} />
            </div>
          </div>
          <div className="kpi-value">{metrics.internshipCount}</div>
          <div className="kpi-subtext">Profile-compatible openings</div>
        </div>
      </div>

      {/* Two Column Detailed Section */}
      <div className="grid-2">
        {/* ATS Resume Builder Quick Launch Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileText size={18} color="var(--brand-blue)" /> ATS Resume Builder
              </div>
              <div className="card-subtitle">
                Generate an industry-ready single-column ATS-friendly resume from your profile
              </div>
            </div>
            <span className="badge badge-blue">Ready</span>
          </div>

          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, color: "var(--primary-navy)", marginBottom: "6px" }}>
              Profile Synchronization Status:
            </div>
            <ul style={{ margin: "0 0 0 18px", padding: 0, color: "var(--text-main)", lineHeight: 1.6 }}>
              <li>Academic & Branch credentials: <strong>{activeStudent.branch}</strong> (CGPA: {activeStudent.cgpa})</li>
              <li>Experience Status: <strong>{activeStudent.experience_status || "Fresher"}</strong> ({activeStudent.num_internships || 0} internships)</li>
              <li>Technical Skills: <strong>{activeStudent.skills?.length || 0} skills</strong> ready for ATS keyword parsing</li>
              <li>GitHub Profile: <strong>{activeStudent.github_profile ? "Linked" : "Not specified"}</strong></li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveTab("resume_builder")}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <FileText size={14} /> Open Resume Builder <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Edit Profile Details
            </button>
          </div>
        </div>

        {/* Top Career Recommendation Snapshot Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Target size={18} color="var(--brand-blue)" /> Top Career Recommendation
              </div>
              <div className="card-subtitle">
                Algorithmic match based on your skills, branch, and projects
              </div>
            </div>
            {metrics.topCareer && (
              <span className="badge badge-green" style={{ fontSize: "0.85rem", padding: "5px 10px" }}>
                {metrics.topCareer.suitability_percentage}% Match
              </span>
            )}
          </div>

          {metrics.topCareer ? (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                  {metrics.topCareer.title}
                </h3>
                <span className="badge badge-gray">{metrics.topCareer.domain}</span>
              </div>

              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "14px" }}>
                Avg Package: <strong>₹{metrics.topCareer.avg_salary_lpa} LPA</strong> • Industry Growth: <strong>+{metrics.topCareer.market_growth_pct}%</strong>
              </div>

              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "8px", fontSize: "0.84rem", color: "#1e3a8a", marginBottom: "16px" }}>
                <strong>Why Recommended:</strong> {metrics.topCareer.explanation}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setActiveTab("career_recommendation")}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  View All Careers
                </button>
                <button
                  onClick={() => setActiveTab("skill_gap")}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Analyze Skill Gaps <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Evaluating recommendations...</p>
          )}
        </div>
      </div>
    </div>
  );
}
