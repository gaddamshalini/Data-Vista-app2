import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Trash2,
  X,
  AlertCircle,
  FileText,
  Target,
  Code,
  Brain,
  Sparkles,
  CheckCheck
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications
} from "../services/api";

const TYPE_ICONS = {
  profile: <AlertCircle size={18} color="#f59e0b" />,
  resume: <FileText size={18} color="#2563eb" />,
  learning: <Target size={18} color="#10b981" />,
  assessment: <Code size={18} color="#7c3aed" />,
  internship: <Sparkles size={18} color="#06b6d4" />,
  general: <Bell size={18} color="#64748b" />
};

export default function NotificationsModal({ isOpen, onClose, onNavigate }) {
  const { activeStudent } = useStudent();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeStudent?.student_id && isOpen) {
      loadNotifications();
    }
  }, [activeStudent, isOpen]);

  const loadNotifications = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const res = await getNotifications(activeStudent.student_id);
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!activeStudent?.student_id) return;
    try {
      await markAllNotificationsRead(activeStudent.student_id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Mark all read failed:", err);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.warn("Delete failed:", err);
    }
  };

  const handleClearAll = async () => {
    if (!activeStudent?.student_id) return;
    try {
      await clearAllNotifications(activeStudent.student_id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn("Clear all failed:", err);
    }
  };

  const handleClickNotification = (notif) => {
    handleMarkRead(notif.id);
    if (onNavigate) {
      if (notif.type === "profile") onNavigate("profile");
      else if (notif.type === "resume") onNavigate("resume_builder");
      else if (notif.type === "learning") onNavigate("learning_progress");
      else if (notif.type === "assessment") onNavigate("skill_assessment");
      else if (notif.type === "internship") onNavigate("internship_matching");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "90vw",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          cursor: "default"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#101B35",
            color: "#ffffff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={20} color="#38bdf8" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              Smart Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "10px"
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#91A3BD", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div
          style={{
            padding: "10px 16px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem"
          }}
        >
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{
              background: "none",
              border: "none",
              color: unreadCount > 0 ? "var(--brand-blue)" : "#94a3b8",
              cursor: unreadCount > 0 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            style={{
              background: "none",
              border: "none",
              color: notifications.length > 0 ? "#dc2626" : "#94a3b8",
              cursor: notifications.length > 0 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600
            }}
          >
            <Trash2 size={13} /> Clear all
          </button>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Bell size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#334155" }}>
                You're all caught up!
              </p>
              <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                No active notifications or action items for your profile.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: n.is_read ? "1px solid #e2e8f0" : "1.5px solid #bfdbfe",
                    backgroundColor: n.is_read ? "#ffffff" : "#f0f7ff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ marginTop: "2px" }}>
                      {TYPE_ICONS[n.type] || <Bell size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <h4
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: n.is_read ? 600 : 700,
                            color: n.is_read ? "#1e293b" : "#1e40af",
                            margin: 0
                          }}
                        >
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#2563eb",
                              flexShrink: 0
                            }}
                          />
                        )}
                      </div>

                      <p style={{ fontSize: "0.8rem", color: "#475569", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                        {n.message}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recent"}
                        </span>

                        <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                          {!n.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n.id)}
                              style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.74rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(n.id)}
                            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
