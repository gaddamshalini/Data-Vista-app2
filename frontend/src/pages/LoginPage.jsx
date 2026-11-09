import React, { useState } from "react";
import {
  Activity,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserPlus,
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { useStudent } from "../context/StudentContext";

export default function LoginPage({ onOpenRegister }) {
  const { login, allStudents, isBackendConnected } = useStudent();
  const [authRole, setAuthRole] = useState("student"); // "student" or "admin"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const idToUse = identifier.trim() || (authRole === "admin" ? "admin" : "");
    if (!idToUse) {
      setErrorMsg(authRole === "admin" ? "Please enter Admin username." : "Please enter your Student ID or Registered Email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      const pwToUse = password.trim() || (authRole === "admin" ? "admin123" : "password123");
      await login(idToUse, pwToUse, authRole);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (studentId) => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      setIdentifier(studentId);
      setPassword("password123");
      setAuthRole("student");
      await login(studentId, "password123", "student");
    } catch (err) {
      setErrorMsg(err.message || `Could not sign in with ${studentId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      setIdentifier("admin");
      setPassword("admin123");
      setAuthRole("admin");
      await login("admin", "admin123", "admin");
    } catch (err) {
      setErrorMsg(err.message || "Could not sign in as Admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#514477",
        backgroundImage: "radial-gradient(circle at 50% 10%, #685797 0%, #352B50 80%)",
        padding: "24px",
        fontFamily: "var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(41, 36, 58, 0.45)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)"
        }}
      >
        {/* Brand Banner Header */}
        <div
          style={{
            backgroundColor: "#423663",
            padding: "26px 28px 20px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7563A8, #9B88D0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              margin: "0 auto 12px",
              boxShadow: "0 4px 14px rgba(117, 99, 168, 0.4)"
            }}
          >
            <Activity size={26} strokeWidth={2.5} />
          </div>
          <h1
            style={{
              color: "#ffffff",
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              margin: 0
            }}
          >
            DATA VISTA
          </h1>
          <div
            style={{
              color: "#EAE5F5",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              marginTop: "4px"
            }}
          >
            INTELLIGENCE PLATFORM
          </div>

          {/* Role Switcher Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "4px",
              marginTop: "18px",
              gap: "4px"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthRole("student");
                setErrorMsg("");
                setIdentifier("");
                setPassword("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: authRole === "student" ? "#7563A8" : "transparent",
                color: authRole === "student" ? "#ffffff" : "#EAE5F5",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
            >
              <GraduationCap size={15} /> Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthRole("admin");
                setErrorMsg("");
                setIdentifier("admin");
                setPassword("admin123");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: authRole === "admin" ? "#7563A8" : "transparent",
                color: authRole === "admin" ? "#ffffff" : "#EAE5F5",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
            >
              <ShieldCheck size={15} /> Admin Portal
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: "28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {authRole === "admin" ? "Administrator Sign In" : "Sign In to Your Student Account"}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px", margin: "4px 0 0 0" }}>
              {authRole === "admin"
                ? "Access institutional analytics, student dossiers and assessment oversight."
                : "Enter your student credentials to access profile, diagnostics, assessments and resumes."}
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                borderRadius: "8px",
                fontSize: "0.82rem",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #fecaca"
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px"
                }}
              >
                {authRole === "admin" ? "Admin Username" : "Student ID or College Email"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder={authRole === "admin" ? "admin" : "e.g. CS2024001 or student@college.edu"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "13px",
                    color: "#94a3b8"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#334155"
                  }}
                >
                  Password
                </label>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {authRole === "admin" ? "Default: admin123" : "Default: password123"}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 38px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "13px",
                    color: "#94a3b8"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "#7563A8",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
                boxShadow: "0 4px 12px rgba(117, 99, 168, 0.35)"
              }}
            >
              {isSubmitting ? "Signing in..." : authRole === "admin" ? "Enter Admin Dashboard" : "Sign In to Platform"} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #f1f5f9" }}>
            <div
              style={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Sparkles size={13} color="#7563A8" /> Quick Demo One-Click Access
            </div>

            {authRole === "admin" ? (
              <button
                type="button"
                onClick={handleAdminQuickLogin}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#F5F2FA",
                  border: "1px solid #E6E1EF",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "#29243A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontWeight: 600
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={16} color="#7563A8" />
                  <span>Sign In as System Administrator (admin / admin123)</span>
                </div>
                <span style={{ color: "#7563A8" }}>Launch →</span>
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("CS2024001")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #E6E1EF",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#29243A",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span><strong>Aarav Sharma</strong> (CS2024001 • CSE)</span>
                  <span style={{ color: "#7563A8", fontWeight: 600, fontSize: "0.75rem" }}>Login →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("CS2024002")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #E6E1EF",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#29243A",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span><strong>Priya Patel</strong> (CS2024002 • AI & ML)</span>
                  <span style={{ color: "#7563A8", fontWeight: 600, fontSize: "0.75rem" }}>Login →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("CS2024003")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #E6E1EF",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#29243A",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span><strong>Rohan Verma</strong> (CS2024003 • Data Science)</span>
                  <span style={{ color: "#7563A8", fontWeight: 600, fontSize: "0.75rem" }}>Login →</span>
                </button>
              </div>
            )}
          </div>

          {/* New Registration Button */}
          {authRole === "student" && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                type="button"
                onClick={onOpenRegister}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7563A8",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <UserPlus size={14} /> New student? Register your profile here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
