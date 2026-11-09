import React, { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Target,
  Sparkles,
  Award,
  FileText,
  FileSearch,
  MapPin,
  LogOut,
  X,
  AlertTriangle,
  Code,
  Brain,
  BarChart2,
  ShieldCheck,
  ExternalLink,
  CalendarCheck,
  Terminal,
  MessageSquare,
  Cpu
} from "lucide-react";
import { useStudent } from "../context/StudentContext";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenSwitcher,
  mobileOpen,
  onCloseMobile
}) {
  const { activeStudent, logout, isAdmin } = useStudent();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navGroups = [
    {
      group: "CORE WORKSPACE",
      items: [
        { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
        { id: "profile", label: "Student Profile", icon: UserCheck },
        { id: "resume_builder", label: "Resume Builder", icon: FileText }
      ]
    },
    {
      group: "ANALYTICS & MARKET INTELLIGENCE",
      items: [
        { id: "placement_analytics", label: "Placement Analytics", icon: GraduationCap },
        { id: "job_market", label: "Job Market Analytics", icon: Briefcase },
        { id: "skill_trends", label: "Skill Demand Trends", icon: TrendingUp }
      ]
    },
    {
      group: "CAREER & SKILL DIAGNOSIS",
      items: [
        { id: "career_recommendation", label: "Career Recommendation", icon: Target },
        { id: "skill_gap", label: "Skill Gap Analyzer", icon: Sparkles },
        { id: "career_roadmap", label: "Career Roadmap", icon: MapPin }
      ]
    },
    {
      group: "INTERNSHIP ECOSYSTEM",
      items: [
        { id: "free_internships", label: "Free Internship Opportunities", icon: ExternalLink },
        { id: "internship_analytics", label: "Internship Analytics", icon: Award },
        { id: "internship_matching", label: "Internship Matching & Quality", icon: Briefcase },
        ...(isAdmin ? [{ id: "admin_dashboard", label: "Admin Dashboard", icon: ShieldCheck }] : [])
      ]
    },
    {
      group: "AI & ML FEATURES",
      items: [
        { id: "placement_readiness", label: "Placement Readiness (ML)", icon: Cpu },
        { id: "resume_matcher", label: "Resume Matcher (NLP)", icon: FileSearch }
      ]
    },
    {
      group: "STUDENT DEVELOPMENT & PERFORMANCE",
      items: [
        { id: "task_planner", label: "Student Task Planner", icon: CalendarCheck },
        { id: "coding_tracker", label: "Coding Practice Tracker", icon: Terminal },
        { id: "mock_interview", label: "Mock Interview Practice", icon: MessageSquare },
        { id: "skill_assessment", label: "Skill Assessment Test", icon: Code },
        { id: "aptitude_assessment", label: "Aptitude Assessment Test", icon: Brain },
        { id: "learning_progress", label: "Learning Progress Tracker", icon: Target },
        { id: "performance_insights", label: "Performance Insights", icon: BarChart2 }
      ]
    }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="mobile-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(11, 19, 41, 0.65)",
            zIndex: 99,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: "260px",
          height: "100vh",
          backgroundColor: "#514477",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 100,
          overflow: "hidden",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "2px 0 16px rgba(41, 36, 58, 0.25)"
        }}
      >
        {/* Fixed Header: Logo & Platform Title */}
        <div
          style={{
            padding: "20px 20px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7563A8, #9B88D0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(117, 99, 168, 0.4)",
                flexShrink: 0
              }}
            >
              <Activity size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "0.2px",
                  lineHeight: 1.2
                }}
              >
                DATA VISTA
              </div>
              <div
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: "#EAE5F5",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  marginTop: "2px"
                }}
              >
                INTELLIGENCE PLATFORM
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                background: "none",
                border: "none",
                color: "#EAE5F5",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <nav
          className="sidebar-nav"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#B9AED6",
                  padding: "6px 12px",
                  letterSpacing: "0.08em"
                }}
              >
                {group.group}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`nav-item-btn ${isActive ? "active" : ""}`}
                      style={{
                        height: "44px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "0 14px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: isActive ? "#6B5B96" : "transparent",
                        color: isActive ? "#FFFFFF" : "#EAE5F5",
                        fontSize: "0.86rem",
                        fontWeight: isActive ? 600 : 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                        position: "relative",
                        borderLeft: isActive ? "3px solid #EAE5F5" : "3px solid transparent",
                        boxSizing: "border-box"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "#5F508C";
                          e.currentTarget.style.color = "#FFFFFF";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#EAE5F5";
                        }
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: isActive ? "#FFFFFF" : "#D2C7EA",
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Fixed Footer: Active Student & Logout */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "#423663",
            flexShrink: 0
          }}
        >
          {/* Active Student Mini-Card */}
          <div
            style={{
              padding: "10px",
              backgroundColor: "#4C3E70",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#7563A8",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                {activeStudent?.profile_photo ? (
                  <img
                    src={activeStudent.profile_photo}
                    alt={activeStudent.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  activeStudent?.name ? activeStudent.name.charAt(0) : "S"
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {activeStudent ? activeStudent.name : "Select Student"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#EAE5F5", fontWeight: 600 }}>
                  ID: {activeStudent ? activeStudent.student_id : "N/A"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSwitcher}
              title="Switch Student Profile"
              style={{
                padding: "3px 8px",
                fontSize: "0.72rem",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Switch
            </button>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: "100%",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
          >
            <LogOut size={15} />
            <span>Sign Out / Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px"
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "400px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Confirm Sign Out
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>
                  DATA VISTA Session Management
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.86rem", color: "#334155", lineHeight: 1.5, marginBottom: "20px" }}>
              Are you sure you want to log out of DATA VISTA? You will be redirected to the sign-in page to authenticate again.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#ffffff",
                  padding: "8px 16px"
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
