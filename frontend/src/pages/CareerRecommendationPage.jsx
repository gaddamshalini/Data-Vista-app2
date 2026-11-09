import React, { useState, useEffect } from "react";
import {
  Target,
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Briefcase
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getCareerRecommendations } from "../services/api";

export default function CareerRecommendationPage({ setActiveTab, setSelectedCareerId }) {
  const { activeStudent } = useStudent();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      if (!activeStudent?.student_id) return;
      try {
        setLoading(true);
        const res = await getCareerRecommendations(activeStudent.student_id);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error("Career recommendations error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [activeStudent]);

  if (loading || !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Evaluating career suitability recommendations for {activeStudent?.name}...</p>
      </div>
    );
  }

  const recommendations = data.top_recommendations || [];

  return (
    <div>
      {/* Overview Banner */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={22} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                Algorithmic Career Suitability Engine
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Profile: <strong>{activeStudent.name}</strong> • CGPA: <strong>{activeStudent.cgpa}</strong> • Skills: <strong>{activeStudent.skills?.length || 0}</strong> • Projects: <strong>{activeStudent.projects?.length || 0}</strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge badge-blue">
              Target Goal: {activeStudent.preferred_career}
            </span>
          </div>
        </div>
      </div>

      {/* Career Recommendations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {recommendations.map((c, index) => {
          const matchColor =
            c.suitability_percentage >= 75
              ? "var(--success)"
              : c.suitability_percentage >= 60
              ? "var(--brand-blue)"
              : "var(--warning)";

          return (
            <div key={c.career_id} className="card" style={{ padding: "22px 24px", margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: index === 0 ? "var(--brand-blue)" : "var(--bg-subtle)",
                        color: index === 0 ? "#ffffff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.82rem",
                        fontWeight: 700
                      }}
                    >
                      #{index + 1}
                    </span>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                      {c.title}
                    </h3>
                    <span className="badge badge-gray">{c.domain}</span>
                    {c.is_preferred && (
                      <span className="badge badge-purple">
                        ⭐ Stated Goal
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Benchmark CTC: <strong>₹{c.avg_salary_lpa} LPA</strong> • Hiring Growth Rate: <strong>+{c.market_growth_pct}%</strong>
                  </div>
                </div>

                {/* Match Score Gauge */}
                <div style={{ textAlign: "right", minWidth: "160px" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: matchColor, lineHeight: 1 }}>
                    {c.suitability_percentage}%
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "2px" }}>
                    Suitability Score
                  </div>
                  <div className="progress-container" style={{ width: "160px", height: "6px", marginTop: "6px" }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${c.suitability_percentage}%`, backgroundColor: matchColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Explainability Section: WHY Recommended */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#1e3a8a",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px"
                }}
              >
                <Sparkles size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Why Recommended: </strong>
                  {c.explanation}
                </div>
              </div>

              {/* Matched vs Missing Skills Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "4px" }}>
                    Verified Match ({c.matched_skills.length}):
                  </span>
                  {c.matched_skills.map((s) => (
                    <span key={s} className="badge badge-green" style={{ fontSize: "0.78rem" }}>
                      ✓ {s}
                    </span>
                  ))}
                  {c.missing_skills.length > 0 && (
                    <>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginLeft: "8px", marginRight: "4px" }}>
                        Skill Gaps ({c.missing_skills.length}):
                      </span>
                      {c.missing_skills.slice(0, 3).map((s) => (
                        <span key={s} className="badge badge-red" style={{ fontSize: "0.78rem" }}>
                          ✗ {s}
                        </span>
                      ))}
                      {c.missing_skills.length > 3 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          +{c.missing_skills.length - 3} more
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      if (setSelectedCareerId) setSelectedCareerId(c.career_id);
                      setActiveTab("skill_gap");
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    View Skill Gap
                  </button>
                  <button
                    onClick={() => {
                      if (setSelectedCareerId) setSelectedCareerId(c.career_id);
                      setActiveTab("career_roadmap");
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    View Roadmap <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
