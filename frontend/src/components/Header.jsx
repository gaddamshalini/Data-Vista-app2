import React, { useState, useEffect } from "react";
import { Search, UserPlus, RefreshCw, Menu, Bell, ShieldCheck } from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getNotifications } from "../services/api";
import NotificationsModal from "./NotificationsModal";

export default function Header({
  activeTab,
  onSelectTab,
  onOpenRegister,
  onOpenSwitcher,
  onToggleMobileSidebar
}) {
  const { activeStudent, switchStudentByIdOrName, refreshActiveStudent, loading, isBackendConnected, isAdmin } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMsg, setSearchMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const tabTitles = {
    dashboard: "Executive Placement Dashboard",
    profile: "Student Profile Management & Verification",
    resume_builder: "Professional ATS Resume Builder",
    placement_analytics: "College Placement Intelligence & Salary Trends",
    job_market: "Real-Time Job Market & Skill Demand Analytics",
    skill_trends: "Skill Demand Trend Analyzer (Time-Series Trajectory)",
    career_recommendation: "Career Recommendation & Suitability Analysis",
    skill_gap: "Target Career Skill Gap Diagnostics & Priority Ranking",
    career_roadmap: "Personalized Phased Career Roadmap",
    internship_analytics: "Internship Ecosystem & Stipend Intelligence",
    internship_matching: "Profile-Driven Internship Matching & Quality Scores",
    free_internships: "Verified Free Internship Opportunities (Direct Apply)",
    task_planner: "Student Task Planner & Daily Study Goals",
    coding_tracker: "Coding Practice Tracker & Analytical Problem Log",
    mock_interview: "Mock Interview Practice (Technical & HR Behavioral)",
    skill_assessment: "Technical Skill Assessments & MCQ Evaluations",
    aptitude_assessment: "Placement Aptitude Screening Assessment",
    learning_progress: "Learning Progress Tracker & Skill Milestones",
    performance_insights: "Student Performance Insights & Placement Intelligence",
    admin_dashboard: "DATA VISTA Institutional Administration"
  };

  useEffect(() => {
    if (activeStudent?.student_id) {
      loadUnreadCount();
      // Poll every 30 seconds for smart notification updates
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [activeStudent]);

  const loadUnreadCount = async () => {
    if (!activeStudent?.student_id) return;
    try {
      const res = await getNotifications(activeStudent.student_id);
      if (res?.success) {
        setUnreadCount(res.unread_count || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleQuickLookup = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearchMsg("");
      await switchStudentByIdOrName(searchQuery.trim());
      setSearchQuery("");
    } catch (err) {
      setSearchMsg("Student not found");
      setTimeout(() => setSearchMsg(""), 3000);
    }
  };

  return (
    <>
      <header className="top-header">
        <div className="header-left">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="mobile-menu-btn"
            title="Toggle Navigation Menu"
            aria-label="Open navigation menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--primary-navy)",
              borderRadius: "6px",
              display: "none",
              flexShrink: 0
            }}
          >
            <Menu size={24} />
          </button>

          <div>
            <h1 className="header-title">{tabTitles[activeTab] || "DATA VISTA Intelligence"}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px", flexWrap: "wrap" }}>
              {isBackendConnected ? (
                <span className="badge badge-green" title="Backend API is active on port 5000">
                  ● API Online
                </span>
              ) : (
                <span className="badge badge-red" title="Click to retry connecting to port 5000" style={{ cursor: "pointer" }} onClick={refreshActiveStudent}>
                  ● API Offline (Start python app.py)
                </span>
              )}
              {activeStudent && (
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Active Profile: <strong style={{ color: "var(--primary-navy)" }}>{activeStudent.name}</strong> ({activeStudent.student_id}) • {activeStudent.branch}
                </span>
              )}
              {isAdmin && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "10px",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ShieldCheck size={12} /> Admin Mode
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* Quick Student ID or Name Lookup */}
          <form onSubmit={handleQuickLookup} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search Student ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: "200px", paddingLeft: "32px", height: "36px", fontSize: "0.82rem" }}
              />
              <Search size={15} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-dim)" }} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: "36px", whiteSpace: "nowrap" }}>
              Find
            </button>
          </form>

          {searchMsg && (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)" }}>{searchMsg}</span>
          )}

          {/* Smart Notifications Bell */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ position: "relative", height: "36px", width: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: "#ef4444", color: "#ffffff", fontSize: "0.68rem", fontWeight: 800, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button onClick={refreshActiveStudent} className="btn btn-secondary btn-sm" title="Refresh Profile" style={{ height: "36px", flexShrink: 0 }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>

          <button onClick={onOpenRegister} className="btn btn-primary btn-sm" style={{ height: "36px", whiteSpace: "nowrap", flexShrink: 0 }}>
            <UserPlus size={14} />
            <span>New Student</span>
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => {
          setIsNotifOpen(false);
          loadUnreadCount();
        }}
        onNavigate={(tab) => {
          if (onSelectTab) onSelectTab(tab);
        }}
      />
    </>
  );
}
