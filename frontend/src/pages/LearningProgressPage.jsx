import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Calendar,
  AlertCircle,
  Award,
  Layers,
  BookOpen
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getLearningGoals,
  addLearningGoal,
  updateLearningGoal,
  deleteLearningGoal,
  syncSkillGapGoals
} from "../services/api";

export default function LearningProgressPage() {
  const { activeStudent } = useStudent();

  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({
    total_goals: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    average_progress: 0
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form State for Adding / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [formData, setFormData] = useState({
    skill_name: "",
    target_role: "",
    status: "In Progress",
    progress_pct: 20,
    target_date: "",
    notes: ""
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");

  useEffect(() => {
    if (activeStudent?.student_id) {
      loadGoals();
    }
  }, [activeStudent]);

  const loadGoals = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const res = await getLearningGoals(activeStudent.student_id);
      if (res.success) {
        setGoals(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.warn("Error loading learning goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGoalId(null);
    setFormData({
      skill_name: "",
      target_role: activeStudent?.preferred_career || "Software / Data Engineer",
      status: "In Progress",
      progress_pct: 20,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoalId(goal.id);
    setFormData({
      skill_name: goal.skill_name,
      target_role: goal.target_role || "",
      status: goal.status,
      progress_pct: goal.progress_pct,
      target_date: goal.target_date || "",
      notes: goal.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!formData.skill_name.trim()) return;

    try {
      if (editingGoalId) {
        await updateLearningGoal(editingGoalId, formData);
      } else {
        await addLearningGoal(activeStudent.student_id, formData);
      }
      setIsModalOpen(false);
      loadGoals();
    } catch (err) {
      alert(err.message || "Failed to save learning goal.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Remove this learning goal?")) return;
    try {
      await deleteLearningGoal(goalId);
      loadGoals();
    } catch (err) {
      alert(err.message || "Error deleting goal.");
    }
  };

  const handleQuickProgressUpdate = async (goalId, newPct) => {
    try {
      const status = newPct === 100 ? "Completed" : newPct > 0 ? "In Progress" : "Not Started";
      await updateLearningGoal(goalId, { progress_pct: newPct, status });
      // Update locally
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, progress_pct: newPct, status } : g))
      );
      loadGoals();
    } catch (err) {
      console.warn("Failed quick update:", err);
    }
  };

  const handleSyncSkillGap = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setIsSyncing(true);
      setSyncFeedback("");
      const res = await syncSkillGapGoals(activeStudent.student_id);
      if (res.success) {
        setSyncFeedback(res.message);
        loadGoals();
        setTimeout(() => setSyncFeedback(""), 4000);
      }
    } catch (err) {
      setSyncFeedback("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return g.status === "Completed" || g.progress_pct === 100;
    if (filterStatus === "in_progress") return g.status === "In Progress" && g.progress_pct < 100;
    if (filterStatus === "not_started") return g.status === "Not Started";
    return true;
  });

  return (
    <div className="learning-progress-page" style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Top Banner */}
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
                <Target size={20} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Learning Progress Tracker
              </h1>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0 0" }}>
              Set, monitor and achieve skill milestones required for your target career: <strong>{activeStudent?.preferred_career || "Target Role"}</strong>.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleSyncSkillGap}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
              title="Automatically import missing skills identified in Skill Gap Analyzer"
            >
              <Sparkles size={15} color="#2563eb" /> {isSyncing ? "Syncing..." : "Sync Missing Skills from Skill Gap"}
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            >
              <Plus size={16} /> Add Learning Goal
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "0.82rem",
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <CheckCircle2 size={15} /> {syncFeedback}
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "20px"
        }}
      >
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Goals</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-navy)", marginTop: "4px" }}>
            {summary.total_goals}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Active tracked skills</div>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, textTransform: "uppercase" }}>Completed</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
            {summary.completed}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>100% mastery achieved</div>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>In Progress</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
            {summary.in_progress}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Actively learning</div>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>Average Completion</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
            {summary.average_progress}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Overall milestone pace</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: "16px", padding: "12px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "all", label: "All Goals" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
              { id: "not_started", label: "Not Started" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: filterStatus === tab.id ? "var(--primary-navy)" : "#f1f5f9",
                  color: filterStatus === tab.id ? "#ffffff" : "#475569",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Showing <strong>{filteredGoals.length}</strong> of <strong>{goals.length}</strong> goals
          </span>
        </div>
      </div>

      {/* Goals List */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading goals...</p>
      ) : filteredGoals.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <Target size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            No goals found in this view
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "480px", margin: "0 auto 18px" }}>
            Add specific skills you want to master or sync missing competencies directly from the Skill Gap module.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button type="button" onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add First Goal
            </button>
            <button type="button" onClick={handleSyncSkillGap} className="btn btn-secondary btn-sm">
              <Sparkles size={14} /> Auto-Sync from Skill Gap
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredGoals.map((g) => {
            const isDone = g.status === "Completed" || g.progress_pct === 100;

            return (
              <div
                key={g.id}
                className="card"
                style={{
                  padding: "20px",
                  border: isDone ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                  backgroundColor: isDone ? "#fcfffd" : "#ffffff",
                  transition: "box-shadow 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                        {g.skill_name}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: isDone ? "#dcfce7" : g.status === "In Progress" ? "#eff6ff" : "#f1f5f9",
                          color: isDone ? "#15803d" : g.status === "In Progress" ? "#1d4ed8" : "#475569"
                        }}
                      >
                        {g.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                      <span>Target Role: <strong>{g.target_role}</strong></span>
                      {g.target_date && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} /> Target Date: {g.target_date}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(g)}
                      style={{
                        padding: "6px",
                        background: "none",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "#475569"
                      }}
                      title="Edit Goal"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      style={{
                        padding: "6px",
                        background: "none",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "#dc2626"
                      }}
                      title="Delete Goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Quick Sliders */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Progress: {g.progress_pct}%</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {[25, 50, 75, 100].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => handleQuickProgressUpdate(g.id, step)}
                          style={{
                            padding: "2px 6px",
                            fontSize: "0.72rem",
                            borderRadius: "4px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: g.progress_pct >= step ? "#eff6ff" : "#ffffff",
                            color: g.progress_pct >= step ? "#1d4ed8" : "#64748b",
                            cursor: "pointer"
                          }}
                        >
                          {step === 100 ? "Done ✓" : `${step}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${g.progress_pct}%`,
                        backgroundColor: isDone ? "#16a34a" : "var(--brand-blue)",
                        transition: "width 0.25s ease"
                      }}
                    />
                  </div>
                </div>

                {g.notes && (
                  <p style={{ fontSize: "0.82rem", color: "#475569", backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", margin: 0 }}>
                    <strong>Notes:</strong> {g.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "16px" }}>
              {editingGoalId ? "Edit Learning Goal" : "Add New Learning Goal"}
            </h3>

            <form onSubmit={handleSaveGoal}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Skill / Competency Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deep Learning, Apache Spark, React Native"
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Target Career Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning Engineer"
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      let newPct = formData.progress_pct;
                      if (newStatus === "Completed") newPct = 100;
                      if (newStatus === "Not Started") newPct = 0;
                      setFormData({ ...formData, status: newStatus, progress_pct: newPct });
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Current Progress: {formData.progress_pct}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress_pct}
                  onChange={(e) => {
                    const pct = parseInt(e.target.value);
                    const status = pct === 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started";
                    setFormData({ ...formData, progress_pct: pct, status });
                  }}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Notes / Resources (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completing Course 3 on Coursera, building mini capstone project"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGoalId ? "Save Changes" : "Add Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
