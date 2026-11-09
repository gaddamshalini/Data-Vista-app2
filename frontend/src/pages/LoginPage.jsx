import React, { useState } from "react";
import {
  Activity,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { request } from "../services/api";

export default function LoginPage({ onOpenRegister }) {
  const { login, isBackendConnected } = useStudent();

  // mode: "login" | "set_password"
  const [mode, setMode] = useState("login");

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set password fields
  const [spStudentId, setSpStudentId] = useState("");
  const [spCurrentPw, setSpCurrentPw] = useState("");
  const [spNewPw, setSpNewPw] = useState("");
  const [spConfirmPw, setSpConfirmPw] = useState("");
  const [spShowNew, setSpShowNew] = useState(false);
  const [spSuccessMsg, setSpSuccessMsg] = useState("");
  const [spError, setSpError] = useState("");
  const [spSubmitting, setSpSubmitting] = useState(false);

  // ── Login submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const idToUse = identifier.trim();
    if (!idToUse) {
      setErrorMsg("Please enter your Student ID or Registered Email.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      const pwToUse = password.trim() || "password123";
      await login(idToUse, pwToUse, "student");
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
      await login(studentId, "password123", "student");
    } catch (err) {
      setErrorMsg(err.message || `Could not sign in with ${studentId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Set password submit ─────────────────────────────────────────────────
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setSpError("");
    setSpSuccessMsg("");

    if (!spStudentId.trim()) { setSpError("Please enter your Student ID."); return; }
    if (!spCurrentPw.trim()) { setSpError("Please enter your current password."); return; }
    if (spNewPw.length < 6)  { setSpError("New password must be at least 6 characters."); return; }
    if (spNewPw !== spConfirmPw) { setSpError("New passwords do not match."); return; }

    try {
      setSpSubmitting(true);
      const res = await request("/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: spStudentId.trim().toUpperCase(),
          current_password: spCurrentPw.trim(),
          new_password: spNewPw.trim()
        })
      });
      if (res.success) {
        setSpSuccessMsg("Password updated successfully! You can now log in with your new password.");
        setSpStudentId(""); setSpCurrentPw(""); setSpNewPw(""); setSpConfirmPw("");
      } else {
        setSpError(res.error || "Failed to update password.");
      }
    } catch (err) {
      setSpError(err.message || "Failed to update password. Check your current password.");
    } finally {
      setSpSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", width: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#514477",
      backgroundImage: "radial-gradient(circle at 50% 10%, #685797 0%, #352B50 80%)",
      padding: "24px",
      fontFamily: "var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)"
    }}>
      <div style={{
        width: "100%", maxWidth: "480px", backgroundColor: "#ffffff",
        borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(41,36,58,0.45)",
        overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)"
      }}>

        {/* ── Brand Banner ── */}
        <div style={{
          backgroundColor: "#423663", padding: "26px 28px 20px",
          textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.12)"
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #7563A8, #9B88D0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", margin: "0 auto 12px",
            boxShadow: "0 4px 14px rgba(117,99,168,0.4)"
          }}>
            <Activity size={26} strokeWidth={2.5} />
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "1.35rem", fontWeight: 800, letterSpacing: "0.5px", margin: 0 }}>
            DATA VISTA
          </h1>
          <div style={{ color: "#EAE5F5", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "4px" }}>
            INTELLIGENCE PLATFORM
          </div>

          {/* Mode tabs */}
          <div style={{
            display: "flex", backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "8px", padding: "4px", marginTop: "18px", gap: "4px"
          }}>
            <button type="button" onClick={() => { setMode("login"); setErrorMsg(""); setSpError(""); setSpSuccessMsg(""); }}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "6px", border: "none",
                backgroundColor: mode === "login" ? "#7563A8" : "transparent",
                color: mode === "login" ? "#ffffff" : "#EAE5F5",
                fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}>
              <User size={15} /> Student Login
            </button>
            <button type="button" onClick={() => { setMode("set_password"); setErrorMsg(""); setSpError(""); setSpSuccessMsg(""); }}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "6px", border: "none",
                backgroundColor: mode === "set_password" ? "#7563A8" : "transparent",
                color: mode === "set_password" ? "#ffffff" : "#EAE5F5",
                fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}>
              <KeyRound size={15} /> Set Password
            </button>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div style={{ padding: "28px" }}>

          {/* ════ LOGIN MODE ════ */}
          {mode === "login" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Sign In to Your Student Account
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  Enter your Student ID and password to access your profile and all platform features.
                </p>
              </div>

              {errorMsg && (
                <div style={{
                  padding: "10px 14px", backgroundColor: "#fef2f2", color: "#b91c1c",
                  borderRadius: "8px", fontSize: "0.82rem", marginBottom: "18px",
                  display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fecaca"
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Student ID */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Student ID or College Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="e.g. CS2024001 or student@college.edu"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      style={{
                        width: "100%", height: "42px", padding: "0 12px 0 38px",
                        border: "1px solid #cbd5e1", borderRadius: "8px",
                        fontSize: "0.88rem", outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <User size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>Password</label>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Default: password123</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%", height: "42px", padding: "0 40px 0 38px",
                        border: "1px solid #cbd5e1", borderRadius: "8px",
                        fontSize: "0.88rem", outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: "5px" }}>
                    First time? Use <strong>password123</strong> then go to <button type="button" onClick={() => setMode("set_password")}
                      style={{ background: "none", border: "none", color: "#7563A8", fontWeight: 700, cursor: "pointer", fontSize: "0.73rem", padding: 0 }}>
                      Set Password</button> to change it.
                  </p>
                </div>

                <button type="submit" disabled={isSubmitting}
                  style={{
                    width: "100%", height: "44px", backgroundColor: "#7563A8", color: "#ffffff",
                    border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(117,99,168,0.35)"
                  }}>
                  {isSubmitting ? "Signing in..." : "Sign In to Platform"} <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick demo logins */}
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={13} color="#7563A8" /> Quick Demo Access
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { id: "CS2024001", name: "Aarav Sharma", branch: "CSE" },
                    { id: "CS2024002", name: "Priya Patel", branch: "AI & ML" },
                    { id: "CS2024003", name: "Rohan Verma", branch: "Data Science" },
                  ].map((s) => (
                    <button key={s.id} type="button" onClick={() => handleQuickLogin(s.id)}
                      style={{
                        padding: "8px 12px", backgroundColor: "#ffffff",
                        border: "1px solid #E6E1EF", borderRadius: "6px",
                        fontSize: "0.8rem", color: "#29243A", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                      }}>
                      <span><strong>{s.name}</strong> ({s.id} • {s.branch})</span>
                      <span style={{ color: "#7563A8", fontWeight: 600, fontSize: "0.75rem" }}>Login →</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Register */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button type="button" onClick={onOpenRegister}
                  style={{ background: "none", border: "none", color: "#7563A8", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <UserPlus size={14} /> New student? Register your profile here
                </button>
              </div>
            </>
          )}

          {/* ════ SET PASSWORD MODE ════ */}
          {mode === "set_password" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Set Your Password
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  First-time login? Enter your Student ID and current password (<strong>password123</strong>), then set a new password.
                </p>
              </div>

              {spError && (
                <div style={{
                  padding: "10px 14px", backgroundColor: "#fef2f2", color: "#b91c1c",
                  borderRadius: "8px", fontSize: "0.82rem", marginBottom: "16px",
                  display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fecaca"
                }}>
                  <AlertCircle size={16} /><span>{spError}</span>
                </div>
              )}

              {spSuccessMsg && (
                <div style={{
                  padding: "10px 14px", backgroundColor: "#ecfdf5", color: "#065f46",
                  borderRadius: "8px", fontSize: "0.82rem", marginBottom: "16px",
                  display: "flex", alignItems: "center", gap: "8px", border: "1px solid #a7f3d0"
                }}>
                  <CheckCircle2 size={16} /><span>{spSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSetPassword}>
                {/* Student ID */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Student ID
                  </label>
                  <div style={{ position: "relative" }}>
                    <input type="text" placeholder="e.g. CS2024001" value={spStudentId}
                      onChange={(e) => setSpStudentId(e.target.value)} required
                      style={{ width: "100%", height: "42px", padding: "0 12px 0 38px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    <User size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                  </div>
                </div>

                {/* Current password */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Current Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(use password123 if first time)</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input type="password" placeholder="Current password" value={spCurrentPw}
                      onChange={(e) => setSpCurrentPw(e.target.value)} required
                      style={{ width: "100%", height: "42px", padding: "0 12px 0 38px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                  </div>
                </div>

                {/* New password */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    New Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(min 6 characters)</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input type={spShowNew ? "text" : "password"} placeholder="New password" value={spNewPw}
                      onChange={(e) => setSpNewPw(e.target.value)} required minLength={6}
                      style={{ width: "100%", height: "42px", padding: "0 40px 0 38px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                    <button type="button" onClick={() => setSpShowNew(!spShowNew)}
                      style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                      {spShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input type="password" placeholder="Confirm new password" value={spConfirmPw}
                      onChange={(e) => setSpConfirmPw(e.target.value)} required
                      style={{ width: "100%", height: "42px", padding: "0 12px 0 38px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    <Lock size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#94a3b8" }} />
                  </div>
                  {spNewPw && spConfirmPw && spNewPw !== spConfirmPw && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "4px" }}>Passwords do not match.</p>
                  )}
                  {spNewPw && spConfirmPw && spNewPw === spConfirmPw && (
                    <p style={{ fontSize: "0.75rem", color: "#059669", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} /> Passwords match.
                    </p>
                  )}
                </div>

                <button type="submit" disabled={spSubmitting}
                  style={{
                    width: "100%", height: "44px", backgroundColor: "#059669", color: "#ffffff",
                    border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    cursor: spSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                  }}>
                  {spSubmitting ? "Updating..." : "Update Password"} <KeyRound size={16} />
                </button>
              </form>

              <div style={{ marginTop: "18px", textAlign: "center" }}>
                <button type="button" onClick={() => setMode("login")}
                  style={{ background: "none", border: "none", color: "#7563A8", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
