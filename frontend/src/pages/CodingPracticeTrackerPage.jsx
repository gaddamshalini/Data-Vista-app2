import React, { useState, useEffect } from "react";
import {
  Terminal,
  Plus,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  Search,
  Code2,
  Layers,
  BookOpen,
  TrendingUp,
  Cpu,
  Database,
  CalendarCheck
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getCodingRecords,
  addCodingRecord,
  updateCodingRecord,
  deleteCodingRecord,
  createStudentTask
} from "../services/api";

const LANGUAGES = ["Python", "Java", "C", "SQL"];
const PLATFORMS = ["LeetCode", "HackerRank", "GeeksforGeeks", "CodeChef", "Custom"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Solved", "Attempted", "Not Started"];

const LANG_ICONS = {
  Python: "🐍",
  Java: "☕",
  C: "⚡",
  SQL: "🗄️"
};

export default function CodingPracticeTrackerPage({ setActiveTab }) {
  const { activeStudent } = useStudent();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_problems: 0,
    total_solved: 0,
    total_attempted: 0,
    solve_rate_pct: 0,
    language_breakdown: {},
    difficulty_breakdown: { Easy: 0, Medium: 0, Hard: 0 },
    topics_count: {}
  });

  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    problem_title: "",
    language: "Python",
    topic: "Arrays",
    difficulty: "Easy",
    platform: "LeetCode",
    problem_url: "",
    status: "Solved",
    notes: "",
    attempted_date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (activeStudent?.student_id) {
      loadRecords();
    }
  }, [activeStudent, selectedLanguage, selectedDifficulty, selectedStatus]);

  const loadRecords = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const res = await getCodingRecords(activeStudent.student_id, {
        language: selectedLanguage,
        difficulty: selectedDifficulty,
        status: selectedStatus
      });
      if (res?.success) {
        setRecords(res.records || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.warn("Failed to load coding records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (defaultLang = "Python") => {
    setEditingRecord(null);
    setFormData({
      problem_title: "",
      language: defaultLang,
      topic: "Arrays",
      difficulty: "Easy",
      platform: "LeetCode",
      problem_url: "",
      status: "Solved",
      notes: "",
      attempted_date: new Date().toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      problem_title: rec.problem_title,
      language: rec.language,
      topic: rec.topic,
      difficulty: rec.difficulty,
      platform: rec.platform,
      problem_url: rec.problem_url || "",
      status: rec.status,
      notes: rec.notes || "",
      attempted_date: rec.attempted_date || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!formData.problem_title.trim()) {
      alert("Problem title is required.");
      return;
    }

    try {
      if (editingRecord) {
        await updateCodingRecord(activeStudent.student_id, editingRecord.id, formData);
      } else {
        await addCodingRecord(activeStudent.student_id, formData);
      }
      setIsModalOpen(false);
      loadRecords();
    } catch (err) {
      alert(err.message || "Failed to save coding record.");
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this practice record?")) return;
    try {
      await deleteCodingRecord(activeStudent.student_id, recordId);
      loadRecords();
    } catch (err) {
      alert(err.message || "Failed to delete record.");
    }
  };

  const handleAddToPlanner = async (record) => {
    try {
      await createStudentTask(activeStudent.student_id, {
        title: `Revise problem: ${record.problem_title} (${record.language})`,
        description: `Review logic and optimal solution for ${record.topic} on ${record.platform}. ${record.notes || ""}`,
        category: "Skill Learning",
        is_weekly_goal: false,
        deadline: new Date().toISOString().split("T")[0],
        priority: "Medium",
        status: "Not Started"
      });
      alert(`Problem added to your Task Planner for today!`);
    } catch (err) {
      alert(err.message || "Failed to add to task planner.");
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.problem_title.toLowerCase().includes(term) ||
      r.topic.toLowerCase().includes(term) ||
      r.platform.toLowerCase().includes(term) ||
      (r.notes && r.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Top Banner Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "var(--light-lavender)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-lavender)"
                }}
              >
                <Terminal size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Coding Practice Tracker
                </h1>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                  Systematically log, track, and analyze your coding problem solutions in Python, Java, C, and SQL.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={16} />
              <span>Log Solved Problem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Breakdown Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        {LANGUAGES.map((lang) => {
          const langStat = stats.language_breakdown[lang] || { total: 0, solved: 0, attempted: 0, solve_rate: 0 };
          const isSelected = selectedLanguage === lang;

          return (
            <div
              key={lang}
              onClick={() => setSelectedLanguage(isSelected ? "All" : lang)}
              style={{
                backgroundColor: isSelected ? "var(--very-light-lavender)" : "#ffffff",
                border: isSelected ? "2px solid var(--primary-lavender)" : "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "18px",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(81, 68, 119, 0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.4rem" }}>{LANG_ICONS[lang]}</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{lang}</span>
                </div>
                <span className="badge badge-purple">{langStat.solved} Solved</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Total Logged: {langStat.total}</span>
                <span>Success: {langStat.solve_rate}%</span>
              </div>

              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${langStat.solve_rate}%`, backgroundColor: "var(--primary-lavender)" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Solved</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#10b981" }}>{stats.total_solved}</div>
          <div className="kpi-subtext">Problems successfully mastered</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">In Progress / Attempted</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--light-lavender)", color: "var(--primary-lavender)" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{stats.total_attempted}</div>
          <div className="kpi-subtext">Problems currently practicing</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Difficulty Distribution</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--very-light-lavender)", color: "var(--primary-lavender)" }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <span className="badge badge-green">Easy: {stats.difficulty_breakdown.Easy}</span>
            <span className="badge badge-yellow">Med: {stats.difficulty_breakdown.Medium}</span>
            <span className="badge badge-red">Hard: {stats.difficulty_breakdown.Hard}</span>
          </div>
          <div className="kpi-subtext" style={{ marginTop: "8px" }}>Total logged: {stats.total_problems}</div>
        </div>
      </div>

      {/* Records Table Card */}
      <div className="card">
        {/* Filters and Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "18px"
          }}
        >
          {/* Search Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-dim)" }} />
              <input
                type="text"
                placeholder="Search problem title, topic, platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Difficulty and Status Selects */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Diff:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="form-select"
                style={{ width: "auto", padding: "6px 10px", fontSize: "0.82rem" }}
              >
                <option value="All">All Difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ width: "auto", padding: "6px 10px", fontSize: "0.82rem" }}
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading coding records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div
            style={{
              padding: "45px 20px",
              textAlign: "center",
              backgroundColor: "var(--very-light-lavender)",
              borderRadius: "12px",
              border: "1px dashed var(--border-strong)"
            }}
          >
            <Code2 size={40} style={{ color: "var(--primary-lavender)", margin: "0 auto 12px", opacity: 0.7 }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No practice records found
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 16px" }}>
              Log problems you have solved or attempted on LeetCode, HackerRank, GeeksforGeeks, or College Labs.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={16} />
              <span>Log Problem Now</span>
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem Title</th>
                  <th>Language</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {r.problem_title}
                        </span>
                        {r.problem_url && (
                          <a
                            href={r.problem_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open external problem link"
                            style={{ color: "var(--primary-lavender)", display: "inline-flex" }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      {r.notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <span>{LANG_ICONS[r.language]}</span>
                        <span>{r.language}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.83rem", color: "var(--text-main)" }}>{r.topic}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.difficulty === "Easy"
                            ? "badge-green"
                            : r.difficulty === "Medium"
                            ? "badge-yellow"
                            : "badge-red"
                        }`}
                      >
                        {r.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gray">{r.platform}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "Solved"
                            ? "badge-green"
                            : r.status === "Attempted"
                            ? "badge-yellow"
                            : "badge-gray"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {r.attempted_date || "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleAddToPlanner(r)}
                          title="Add revision task to Daily Planner"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                        >
                          <CalendarCheck size={12} />
                          <span>Plan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Record"
                          style={{ padding: "4px 6px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.id)}
                          className="btn btn-secondary btn-sm"
                          title="Delete Record"
                          style={{ padding: "4px 6px", color: "#ef4444" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log / Edit Problem Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                {editingRecord ? "Edit Practice Problem" : "Log New Practice Problem"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord}>
              <div className="form-group">
                <label className="form-label">Problem Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Two Sum / Reverse Linked List / Group Anagrams"
                  value={formData.problem_title}
                  onChange={(e) => setFormData({ ...formData, problem_title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Programming Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="form-select"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic / Data Structure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Arrays, Strings, Trees, Joins, OOP"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="form-select"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="form-select"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Problem URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={formData.problem_url}
                    onChange={(e) => setFormData({ ...formData, problem_url: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attempted / Solved Date</label>
                  <input
                    type="date"
                    value={formData.attempted_date}
                    onChange={(e) => setFormData({ ...formData, attempted_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Algorithm Takeaways</label>
                <textarea
                  rows={2}
                  placeholder="Key insights, time/space complexity, edge cases handled..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? "Save Changes" : "Log Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
