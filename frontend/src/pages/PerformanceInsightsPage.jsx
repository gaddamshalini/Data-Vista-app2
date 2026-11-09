import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Brain,
  Code,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart2,
  PieChart,
  Activity,
  Layers,
  Briefcase
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getStudentInsights } from "../services/api";

export default function PerformanceInsightsPage({ onNavigateTab }) {
  const { activeStudent } = useStudent();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeStudent?.student_id) {
      loadInsights();
    }
  }, [activeStudent]);

  const loadInsights = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      setError("");
      const res = await getStudentInsights(activeStudent.student_id);
      if (res.success) {
        setInsights(res);
      } else {
        setError(res.error || "Unable to fetch student performance insights.");
      }
    } catch (err) {
      setError(err.message || "Failed to load performance analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeStudent) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Please select or register a student profile first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <Activity size={36} color="var(--brand-blue)" className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)" }}>
          Synthesizing Real Student Analytics...
        </h3>
        <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
          Aggregating assessment attempts, learning milestones, and academic indices.
        </p>
      </div>
    );
  }

  const metrics = insights?.metrics || {};
  const readiness = insights?.readiness_index || 0;
  const recommendations = insights?.recommendations || [];

  return (
    <div className="performance-insights-page" style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "40px" }}>
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
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-blue)"
                }}
              >
                <TrendingUp size={20} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Student Performance Insights & Placement Intelligence
              </h1>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0 0" }}>
              Data-driven evaluation synthesised exclusively from active student database records, skill tests, and learning goals.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInsights}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        {/* Composite Placement Readiness Gauge */}
        <div
          className="card"
          style={{
            padding: "26px",
            textAlign: "center",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
            Placement Readiness Index
          </div>

          {/* Circular Percentage Badge */}
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              border: `10px solid ${readiness >= 75 ? "#16a34a" : readiness >= 50 ? "#2563eb" : "#f59e0b"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)"
            }}
          >
            <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--primary-navy)", lineHeight: 1 }}>
              {readiness}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>out of 100</span>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: 700,
              backgroundColor: readiness >= 75 ? "#dcfce7" : readiness >= 50 ? "#eff6ff" : "#fef3c7",
              color: readiness >= 75 ? "#15803d" : readiness >= 50 ? "#1d4ed8" : "#b45309",
              marginBottom: "12px"
            }}
          >
            {readiness >= 75 ? "Placement Ready (Tier 1)" : readiness >= 50 ? "Moderate Readiness" : "Needs Skill Preparation"}
          </div>

          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
            Synthesized from academic CGPA (25%), verified skill assessments (25%), aptitude tests (20%), practical portfolio (15%), and goal consistency (15%).
          </p>
        </div>

        {/* 4 Core Pillars Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {/* 1. Technical Skills */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "6px", backgroundColor: "#eff6ff", borderRadius: "6px", color: "#2563eb" }}>
                  <Code size={18} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                  Technical Assessments
                </h4>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb" }}>
                {metrics.total_skill_tests} Tests Taken
              </span>
            </div>

            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "4px" }}>
              {metrics.avg_skill_pct}% <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>avg score</span>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <span style={{ fontSize: "0.72rem", padding: "3px 6px", borderRadius: "4px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: 600 }}>
                {metrics.skill_levels_breakdown?.Advanced || 0} Advanced
              </span>
              <span style={{ fontSize: "0.72rem", padding: "3px 6px", borderRadius: "4px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 600 }}>
                {metrics.skill_levels_breakdown?.Intermediate || 0} Inter.
              </span>
              <span style={{ fontSize: "0.72rem", padding: "3px 6px", borderRadius: "4px", backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 600 }}>
                {metrics.skill_levels_breakdown?.Beginner || 0} Beginner
              </span>
            </div>
          </div>

          {/* 2. Aptitude Evaluation */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "6px", backgroundColor: "#f5f3ff", borderRadius: "6px", color: "#7c3aed" }}>
                  <Brain size={18} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                  Aptitude Screening
                </h4>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed" }}>
                {metrics.total_apt_tests} Attempts
              </span>
            </div>

            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "4px" }}>
              {metrics.avg_apt_pct}% <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>overall</span>
            </div>

            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "8px" }}>
              Latest Level: <strong>{metrics.latest_apt_level}</strong>
            </div>
          </div>

          {/* 3. Learning Progress */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "6px", backgroundColor: "#ecfdf5", borderRadius: "6px", color: "#059669" }}>
                  <Target size={18} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                  Learning Goals
                </h4>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669" }}>
                {metrics.learning_tracker?.completed || 0}/{metrics.learning_tracker?.total_goals || 0} Done
              </span>
            </div>

            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "4px" }}>
              {metrics.learning_tracker?.avg_progress || 0}% <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>progress</span>
            </div>

            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "8px" }}>
              {metrics.learning_tracker?.in_progress || 0} goals actively in progress
            </div>
          </div>

          {/* 4. Practical Portfolio */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "6px", backgroundColor: "#fffbeb", borderRadius: "6px", color: "#d97706" }}>
                  <Briefcase size={18} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                  Portfolio & Industry
                </h4>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#d97706" }}>
                CGPA: {insights.cgpa}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                Internships: <strong>{metrics.portfolio?.internships || 0}</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                Certs: <strong>{metrics.portfolio?.certifications || 0}</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                GitHub: <strong>{metrics.portfolio?.github_connected ? "Connected ✓" : "Pending"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Sparkles size={20} color="var(--brand-blue)" />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
            Targeted Improvement Recommendations
          </h3>
        </div>

        {recommendations.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            No recommendations at this time. All assessed benchmarks are meeting or exceeding requirements.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  backgroundColor: rec.priority === "High" ? "#fffbfa" : "#f8fafc",
                  borderLeft: `4px solid ${rec.priority === "High" ? "#ef4444" : "#2563eb"}`
                }}
              >
                <div style={{ marginTop: "2px" }}>
                  {rec.priority === "High" ? (
                    <AlertTriangle size={16} color="#ef4444" />
                  ) : (
                    <CheckCircle size={16} color="#2563eb" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary-navy)" }}>
                      {rec.category}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: rec.priority === "High" ? "#fee2e2" : "#eff6ff",
                        color: rec.priority === "High" ? "#b91c1c" : "#1d4ed8"
                      }}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#334155", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                    {rec.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
