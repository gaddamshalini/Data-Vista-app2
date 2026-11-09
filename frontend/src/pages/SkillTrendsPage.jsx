import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Search,
  Plus,
  AlertCircle,
  Database
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { getSkillTrends } from "../services/api";
import { useStudent } from "../context/StudentContext";

export default function SkillTrendsPage() {
  const { addNewSkill, catalog } = useStudent();

  const [selectedSkill, setSelectedSkill] = useState("Python");
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom skill modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming");
  const [newSkillScore, setNewSkillScore] = useState(80);
  const [addStatus, setAddStatus] = useState({ success: false, message: "" });
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  const fetchTrend = async (skillToFetch) => {
    try {
      setLoading(true);
      const res = await getSkillTrends(skillToFetch);
      if (res.success) {
        setTrendData(res);
      }
    } catch (err) {
      console.error("Skill trend fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrend(selectedSkill);
  }, [selectedSkill]);

  const availableSkills = trendData?.available_skills || [];

  // Filter skills based on search query
  const filteredSkills = availableSkills.filter((s) =>
    s.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const isExactMatch = availableSkills.some(
    (s) => s.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const handleOpenAddModal = (name = "") => {
    setNewSkillName(name || searchQuery.trim());
    setNewSkillCategory("Programming");
    setNewSkillScore(80);
    setAddStatus({ success: false, message: "" });
    setShowAddModal(true);
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    const cleanName = newSkillName.trim();
    if (!cleanName) {
      setAddStatus({ success: false, message: "Skill name cannot be empty." });
      return;
    }

    // Duplicate check client-side
    const duplicate = availableSkills.some(
      (s) => s.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      setAddStatus({ success: false, message: `Skill '${cleanName}' already exists in catalog.` });
      return;
    }

    try {
      setIsSubmittingSkill(true);
      setAddStatus({ success: false, message: "" });

      await addNewSkill({
        name: cleanName,
        category: newSkillCategory,
        demand_index: parseInt(newSkillScore, 10)
      });

      setAddStatus({ success: true, message: `Skill '${cleanName}' successfully added to database!` });
      setTimeout(() => {
        setShowAddModal(false);
        setSelectedSkill(cleanName);
        setSearchQuery("");
      }, 1000);
    } catch (err) {
      setAddStatus({
        success: false,
        message: err.message || "Failed to add skill. Please ensure backend is active."
      });
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  if (loading && !trendData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading skill time-series demand intelligence...</p>
      </div>
    );
  }

  const trajectory = trendData?.trajectory || "Increasing";
  const trajectoryBadge =
    trajectory === "Increasing" ? (
      <span className="badge badge-green">
        <ArrowUpRight size={13} /> Increasing Demand
      </span>
    ) : trajectory === "Decreasing" ? (
      <span className="badge badge-red">
        <ArrowDownRight size={13} /> Decreasing Demand
      </span>
    ) : (
      <span className="badge badge-yellow">
        <Minus size={13} /> Stable Demand
      </span>
    );

  return (
    <div>
      {/* Skill Search & Selector Card */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={20} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                Skill Demand Trend Analyzer
              </h2>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Track time-series demand velocity and hiring volume across verified tech competencies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal("")}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} /> Add Custom Skill
          </button>
        </div>

        {/* Skill Search Bar */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <input
              type="text"
              placeholder="Search skills (e.g. Python, Java, C, GitHub, FSD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "34px", height: "38px" }}
            />
            <Search size={16} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-dim)" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              Active Skill:
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="form-select"
              style={{ width: "220px", height: "38px", fontWeight: 600 }}
            >
              {availableSkills.map((sk) => (
                <option key={sk} value={sk}>{sk}</option>
              ))}
            </select>
          </div>
        </div>

        {/* If searched skill not found */}
        {searchQuery.trim() && !isExactMatch && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.84rem"
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>
              No exact match for <strong>"{searchQuery.trim()}"</strong> in current master skill records.
            </span>
            <button
              type="button"
              onClick={() => handleOpenAddModal(searchQuery.trim())}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              <Plus size={12} /> Add "{searchQuery.trim()}" as New Skill
            </button>
          </div>
        )}
      </div>

      {/* Selected Skill Highlight & Demand Trajectory Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                {trendData?.selected_skill}
              </h3>
              {trajectoryBadge}
              <span className="badge badge-blue">
                Velocity: {trendData?.growth_rate}
              </span>
              <span className="badge badge-gray" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Database size={11} /> Supported by Dataset Records
              </span>
            </div>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {trendData?.description}
            </p>
          </div>
        </div>

        {/* Time Series Area Chart */}
        <div style={{ height: "320px", marginTop: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData?.time_series || []} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit=" pts" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value} / 100`, "Market Demand Index"]} />
              <Area
                type="monotone"
                dataKey="demand_score"
                name="Market Demand Index"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#skillGradient)"
                dot={{ r: 5, fill: "#2563eb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Skill Trajectory Comparison Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart2 size={18} color="var(--brand-blue)" /> Multi-Skill Demand Trajectory Comparison
            </div>
            <div className="card-subtitle">
              Comprehensive trajectory overview across core software, web, and data technologies
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Demand Trajectory</th>
                <th>Growth Velocity</th>
                <th>Current Demand Score (0-100)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(trendData?.comparison_overview || [])
                .filter((item) =>
                  !searchQuery.trim() || item.skill.toLowerCase().includes(searchQuery.trim().toLowerCase())
                )
                .map((item) => {
                  const isSelected = item.skill === selectedSkill;
                  return (
                    <tr
                      key={item.skill}
                      style={{ backgroundColor: isSelected ? "var(--brand-blue-light)" : "transparent" }}
                    >
                      <td>
                        <strong style={{ color: "var(--primary-navy)" }}>{item.skill}</strong>
                      </td>
                      <td>
                        {item.trajectory === "Increasing" ? (
                          <span className="badge badge-green">
                            <ArrowUpRight size={12} /> Increasing
                          </span>
                        ) : item.trajectory === "Decreasing" ? (
                          <span className="badge badge-red">
                            <ArrowDownRight size={12} /> Decreasing
                          </span>
                        ) : (
                          <span className="badge badge-yellow">
                            <Minus size={12} /> Stable
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: (item.growth_rate || "").startsWith("+") ? "var(--success)" : "var(--danger)" }}>
                          {item.growth_rate}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="progress-container" style={{ width: "120px", height: "6px" }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${item.current_score}%`,
                                backgroundColor: item.current_score > 85 ? "var(--brand-blue)" : "var(--info)"
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.current_score}/100</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedSkill(item.skill)}
                          className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                          style={{ padding: "4px 10px" }}
                        >
                          {isSelected ? "Viewing" : "View Trend"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Skill Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px" }}>
              Add Custom Skill to DATA VISTA
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Once registered, this skill will be saved in the database and made available in student profiles, skill gap analysis, and trend visualizations.
            </p>

            {addStatus.message && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  marginBottom: "14px",
                  backgroundColor: addStatus.success ? "var(--success-bg)" : "var(--danger-bg)",
                  color: addStatus.success ? "var(--success)" : "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {addStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{addStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateSkill}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flutter, Kotlin, C, Rust"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Testing & QA">Testing & QA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Base Demand Index (0 - 100)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={newSkillScore}
                  onChange={(e) => setNewSkillScore(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="btn btn-primary"
                >
                  {isSubmittingSkill ? "Saving..." : "Save New Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
