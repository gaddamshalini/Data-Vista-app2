import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Target,
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getStudentTasks,
  createStudentTask,
  updateStudentTask,
  toggleStudentTaskStatus,
  deleteStudentTask
} from "../services/api";

const CATEGORIES = [
  "Skill Learning",
  "Weekly Goal",
  "Project Work",
  "Aptitude Practice",
  "Resume & Internship",
  "Revision"
];

const PRIORITIES = ["Low", "Medium", "High"];

export default function StudentTaskPlannerPage({ setActiveTab }) {
  const { activeStudent } = useStudent();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    today_tasks: 0,
    today_completed: 0,
    weekly_goals: 0,
    weekly_completed: 0,
    overall_completion_pct: 0,
    daily_completion_pct: 0,
    weekly_completion_pct: 0
  });

  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Skill Learning",
    is_weekly_goal: false,
    start_date: new Date().toISOString().split("T")[0],
    deadline: new Date().toISOString().split("T")[0],
    status: "Not Started",
    priority: "Medium"
  });

  useEffect(() => {
    if (activeStudent?.student_id) {
      loadTasks();
    }
  }, [activeStudent, activeFilter, categoryFilter]);

  const loadTasks = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const res = await getStudentTasks(activeStudent.student_id, {
        filter: activeFilter,
        category: categoryFilter
      });
      if (res?.success) {
        setTasks(res.tasks || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.warn("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (prefill = {}) => {
    setEditingTask(null);
    setFormData({
      title: prefill.title || "",
      description: prefill.description || "",
      category: prefill.category || "Skill Learning",
      is_weekly_goal: prefill.is_weekly_goal || false,
      start_date: new Date().toISOString().split("T")[0],
      deadline: prefill.deadline || new Date().toISOString().split("T")[0],
      status: "Not Started",
      priority: prefill.priority || "Medium"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category || "Skill Learning",
      is_weekly_goal: task.is_weekly_goal || false,
      start_date: task.start_date || "",
      deadline: task.deadline || "",
      status: task.status || "Not Started",
      priority: task.priority || "Medium"
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Task title is required.");
      return;
    }

    try {
      if (editingTask) {
        await updateStudentTask(activeStudent.student_id, editingTask.id, formData);
      } else {
        await createStudentTask(activeStudent.student_id, formData);
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to save task.");
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus = task.status === "Completed" ? "Not Started" : "Completed";
      await toggleStudentTaskStatus(activeStudent.student_id, task.id, nextStatus);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteStudentTask(activeStudent.student_id, taskId);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to delete task.");
    }
  };

  const filterTabs = [
    { key: "all", label: "All Tasks", count: stats.total_tasks },
    { key: "today", label: "Today's Tasks", count: stats.today_tasks },
    { key: "weekly", label: "Weekly Goals", count: stats.weekly_goals },
    { key: "pending", label: "Pending", count: stats.pending_tasks },
    { key: "completed", label: "Completed", count: stats.completed_tasks },
    { key: "overdue", label: "Overdue", count: stats.overdue_tasks, isAlert: stats.overdue_tasks > 0 }
  ];

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
                <CalendarCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Student Task Planner & Daily Study Goals
                </h1>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                  Plan daily milestones, weekly goals, track assignment deadlines, and build steady placement readiness habits.
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
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI & Progress Card Grid */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        {/* Overall Completion */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Overall Completion</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--light-lavender)", color: "var(--primary-lavender)" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{stats.overall_completion_pct}%</div>
          <div style={{ marginTop: "10px" }}>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${stats.overall_completion_pct}%`, backgroundColor: "var(--primary-lavender)" }}
              />
            </div>
          </div>
          <div className="kpi-subtext" style={{ marginTop: "6px" }}>
            {stats.completed_tasks} of {stats.total_tasks} tasks finished
          </div>
        </div>

        {/* Daily Tasks Progress */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Today's Progress</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value">{stats.daily_completion_pct}%</div>
          <div style={{ marginTop: "10px" }}>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${stats.daily_completion_pct}%`, backgroundColor: "#10b981" }}
              />
            </div>
          </div>
          <div className="kpi-subtext" style={{ marginTop: "6px" }}>
            {stats.today_completed} of {stats.today_tasks} due today completed
          </div>
        </div>

        {/* Weekly Goals Progress */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Weekly Goals</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--very-light-lavender)", color: "var(--primary-lavender)" }}>
              <Target size={18} />
            </div>
          </div>
          <div className="kpi-value">{stats.weekly_completion_pct}%</div>
          <div style={{ marginTop: "10px" }}>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${stats.weekly_completion_pct}%`, backgroundColor: "var(--primary-lavender)" }}
              />
            </div>
          </div>
          <div className="kpi-subtext" style={{ marginTop: "6px" }}>
            {stats.weekly_completed} of {stats.weekly_goals} goals achieved
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        <div className="kpi-card" style={{ borderLeft: stats.overdue_tasks > 0 ? "4px solid #ef4444" : "1px solid var(--border-subtle)" }}>
          <div className="kpi-header">
            <span className="kpi-label">Overdue Tasks</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: stats.overdue_tasks > 0 ? "#fef2f2" : "var(--bg-subtle)", color: stats.overdue_tasks > 0 ? "#ef4444" : "var(--text-muted)" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: stats.overdue_tasks > 0 ? "#ef4444" : "var(--text-main)" }}>
            {stats.overdue_tasks}
          </div>
          <div className="kpi-subtext" style={{ marginTop: "6px" }}>
            {stats.overdue_tasks > 0 ? "Needs immediate attention!" : "All scheduled deadlines clean"}
          </div>
        </div>
      </div>

      {/* Main Tasks Board Card */}
      <div className="card">
        {/* Filters Toolbar */}
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
          {/* Filter Tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {filterTabs.map((t) => {
              const isActive = activeFilter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveFilter(t.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    border: isActive ? "1px solid var(--primary-lavender)" : "1px solid var(--border-subtle)",
                    backgroundColor: isActive ? "var(--light-lavender)" : "#ffffff",
                    color: isActive ? "var(--primary-lavender)" : "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      backgroundColor: isActive ? "var(--primary-lavender)" : "#f1f5f9",
                      color: isActive ? "#ffffff" : "var(--text-muted)"
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Dropdown Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.82rem" }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading your task planner...
          </div>
        ) : tasks.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              backgroundColor: "var(--very-light-lavender)",
              borderRadius: "12px",
              border: "1px dashed var(--border-strong)"
            }}
          >
            <FolderOpen size={40} style={{ color: "var(--primary-lavender)", margin: "0 auto 12px", opacity: 0.7 }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No tasks found in this view
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 16px" }}>
              Start by creating your first daily study task, weekly placement goal, or project milestone to stay consistent.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tasks.map((task) => {
              const isDone = task.status === "Completed";
              const isOverdue = task.is_overdue;
              const isToday = task.is_today;

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "10px",
                    backgroundColor: isDone ? "#fafafa" : "#ffffff",
                    border: isOverdue
                      ? "1px solid #fecaca"
                      : isDone
                      ? "1px solid #e2e8f0"
                      : "1px solid var(--border-subtle)",
                    boxShadow: "0 1px 3px rgba(81, 68, 119, 0.04)",
                    transition: "all 0.15s ease",
                    gap: "14px"
                  }}
                >
                  {/* Left: Checkbox & Info */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        color: isDone ? "#10b981" : "var(--primary-lavender)",
                        marginTop: "2px"
                      }}
                    >
                      {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: isDone ? "var(--text-muted)" : "var(--text-main)",
                            textDecoration: isDone ? "line-through" : "none"
                          }}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`badge ${
                            task.priority === "High"
                              ? "badge-red"
                              : task.priority === "Medium"
                              ? "badge-yellow"
                              : "badge-gray"
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        {/* Category Badge */}
                        <span className="badge badge-purple">
                          {task.category}
                        </span>

                        {/* Weekly Goal Badge */}
                        {task.is_weekly_goal && (
                          <span className="badge badge-blue">
                            Weekly Goal
                          </span>
                        )}

                        {/* Overdue Badge */}
                        {isOverdue && (
                          <span className="badge badge-red" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <AlertCircle size={12} />
                            Overdue
                          </span>
                        )}

                        {/* Today Badge */}
                        {isToday && !isDone && (
                          <span className="badge badge-yellow" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} />
                            Due Today
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          style={{
                            fontSize: "0.84rem",
                            color: isDone ? "var(--text-dim)" : "var(--text-muted)",
                            margin: "4px 0 8px",
                            lineHeight: 1.4
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Dates footer */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                        {task.start_date && (
                          <span>
                            Start: <strong>{task.start_date}</strong>
                          </span>
                        )}
                        <span>
                          Deadline: <strong style={{ color: isOverdue ? "#ef4444" : "var(--text-main)" }}>{task.deadline}</strong>
                        </span>
                        <span>
                          Status: <strong style={{ color: isDone ? "#10b981" : "var(--primary-lavender)" }}>{task.status}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Task"
                      style={{ padding: "6px 10px" }}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-secondary btn-sm"
                      title="Delete Task"
                      style={{ padding: "6px 10px", color: "#ef4444" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                {editingTask ? "Edit Task / Goal" : "Create New Task / Goal"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Solve 5 SQL Joins problems / Finish React hooks module"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add notes, resources, or specific sub-topics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setFormData({
                        ...formData,
                        category: cat,
                        is_weekly_goal: cat === "Weekly Goal" ? true : formData.is_weekly_goal
                      });
                    }}
                    className="form-select"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "28px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                    <input
                      type="checkbox"
                      checked={formData.is_weekly_goal}
                      onChange={(e) => setFormData({ ...formData, is_weekly_goal: e.target.checked })}
                    />
                    <span>Mark as Weekly Major Goal</span>
                  </label>
                </div>
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
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
