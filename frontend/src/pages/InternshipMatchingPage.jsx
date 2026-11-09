import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Star
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getInternshipMatches } from "../services/api";

export default function InternshipMatchingPage() {
  const { activeStudent } = useStudent();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [workMode, setWorkMode] = useState("All");
  const [minStipend, setMinStipend] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [expandedQualityId, setExpandedQualityId] = useState(null);

  const fetchMatches = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const filters = {};
      if (workMode !== "All") filters.work_mode = workMode;
      if (minStipend) filters.min_stipend = minStipend;
      if (selectedLocation !== "All") filters.location = selectedLocation;

      const res = await getInternshipMatches(activeStudent.student_id, filters);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Internship match load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeStudent, workMode, selectedLocation]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchMatches();
  };

  if (loading && !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Calculating personalized skill matches and internship quality scores for {activeStudent?.name}...</p>
      </div>
    );
  }

  const internships = data?.top_internships || [];

  return (
    <div>
      {/* Header Profile Notice */}
      <div className="card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={22} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                Personalized Internship Matching & Quality Scores
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Matching against verified skills: <strong style={{ color: "var(--primary-navy)" }}>{(activeStudent.skills || []).join(", ")}</strong> (No manual re-entry needed)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge badge-green">
              {internships.length} Matching Opportunities Evaluated
            </span>
          </div>
        </div>

        {/* Interactive Filters Strip */}
        <form onSubmit={handleApplyFilter} style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ width: "160px" }}>
            <label className="form-label">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="form-select"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>

          <div style={{ width: "160px" }}>
            <label className="form-label">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-select"
            >
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div style={{ width: "140px" }}>
            <label className="form-label">Min Stipend (₹)</label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={minStipend}
              onChange={(e) => setMinStipend(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ height: "38px" }}>
              Filter Matches
            </button>
          </div>
        </form>
      </div>

      {/* Internship Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {internships.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No internships found matching your filter criteria. Try resetting filters.
          </div>
        ) : (
          internships.map((item) => {
            const isQualityExpanded = expandedQualityId === item.id;
            const matchBadgeClass =
              item.match_percentage >= 75
                ? "badge-green"
                : item.match_percentage >= 50
                ? "badge-yellow"
                : "badge-gray";

            return (
              <div key={item.id} className="card" style={{ padding: "22px 24px", margin: 0 }}>
                {/* Top Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                        {item.title}
                      </h3>
                      <span className="badge badge-blue">{item.company}</span>
                      <span className="badge badge-gray">{item.work_mode}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "6px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={14} /> {item.location}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} /> {item.duration_months} Months ({item.internship_type})
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontWeight: 700 }}>
                        <DollarSign size={14} /> ₹{Number(item.stipend).toLocaleString()}/month
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" /> {item.company_rating} / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Dual Score Badges: Match % and Quality Score */}
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    {/* Personalized Skill Match % */}
                    <div style={{ textAlign: "center", minWidth: "100px" }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: item.match_percentage >= 75 ? "var(--success)" : "var(--brand-blue)" }}>
                        {item.match_percentage}%
                      </div>
                      <span className={`badge ${matchBadgeClass}`} style={{ fontSize: "0.72rem" }}>
                        Profile Match
                      </span>
                    </div>

                    {/* Internship Quality Score */}
                    <div style={{ textAlign: "center", minWidth: "110px", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "18px" }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--purple)" }}>
                        {item.quality_score}<span style={{ fontSize: "0.95rem", color: "var(--text-dim)" }}>/100</span>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>
                        Quality Score
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", marginBottom: "14px" }}>
                  {item.description}
                </p>

                {/* Skill Match Breakdown */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "4px" }}>
                    Skills Overlap:
                  </span>
                  {item.matched_skills.map((s) => (
                    <span key={s} className="badge badge-green" style={{ fontSize: "0.78rem" }}>
                      ✓ {s}
                    </span>
                  ))}
                  {item.missing_skills.map((s) => (
                    <span key={s} className="badge badge-red" style={{ fontSize: "0.78rem" }}>
                      ✗ {s} (Missing)
                    </span>
                  ))}
                </div>

                {/* Quality Score Transparent Factor Explanations Toggle */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={() => setExpandedQualityId(isQualityExpanded ? null : item.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.78rem" }}
                  >
                    <HelpCircle size={14} />
                    {isQualityExpanded ? "Hide Quality Factors" : `Why Quality Score is ${item.quality_score}/100?`}
                  </button>

                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Verified Certificate: <strong>{item.certificate_provided ? "Yes" : "No"}</strong>
                  </span>
                </div>

                {/* Expanded Factors Breakdown */}
                {isQualityExpanded && (
                  <div style={{ marginTop: "14px", padding: "14px", backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", fontSize: "0.83rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--purple)", marginBottom: "8px" }}>
                      Transparent Internship Quality Score Formula (Total: {item.quality_score}/100 - {item.quality_grade})
                    </div>
                    <div className="grid-3" style={{ gap: "10px" }}>
                      {Object.entries(item.quality_factors || {}).map(([key, f]) => (
                        <div key={key} style={{ backgroundColor: "#ffffff", padding: "10px", borderRadius: "6px", border: "1px solid #f3e8ff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--primary-navy)", textTransform: "capitalize" }}>
                            <span>{key.replace("_", " ")}</span>
                            <span style={{ color: "var(--purple)" }}>{f.score} / {f.max} pts</span>
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            {f.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
