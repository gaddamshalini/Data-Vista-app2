import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Code,
  Users,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  History,
  Lightbulb,
  Check,
  Star,
  Layers
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getInterviewDomains,
  getInterviewQuestions,
  saveInterviewPractice,
  getInterviewHistory
} from "../services/api";

const DOMAIN_ICONS = {
  Python: "🐍",
  Java: "☕",
  C: "⚡",
  SQL: "🗄️",
  "HTML and CSS": "🌐",
  JavaScript: "📜",
  React: "⚛️",
  "Machine Learning": "🤖",
  "Data Analytics": "📊"
};

export default function MockInterviewPage({ setActiveTab }) {
  const { activeStudent } = useStudent();

  // Mode: "my_skills" | "technical" | "hr" | "history"
  const [activeMode, setActiveMode] = useState("my_skills");

  // Technical Domain Selection
  const [techDomains, setTechDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("Python");

  // Derived: which domains match student skills
  const studentSkillDomains = (() => {
    const DOMAIN_MAP = {
      "Python": "Python",
      "Java": "Java",
      "C": "C",
      "SQL": "SQL",
      "HTML/CSS": "HTML and CSS",
      "HTML": "HTML and CSS",
      "CSS": "HTML and CSS",
      "JavaScript": "JavaScript",
      "TypeScript": "JavaScript",
      "React": "React",
      "Machine Learning": "Machine Learning",
      "Deep Learning": "Machine Learning",
      "Scikit-learn": "Machine Learning",
      "Pandas": "Data Analytics",
      "NumPy": "Data Analytics",
      "Power BI": "Data Analytics",
      "Tableau": "Data Analytics",
      "Data Analytics": "Data Analytics",
    };
    const skills = activeStudent?.skills || [];
    const matched = new Set();
    skills.forEach((sk) => {
      const key = Object.keys(DOMAIN_MAP).find(
        (k) => k.toLowerCase() === sk.toLowerCase() ||
               sk.toLowerCase().includes(k.toLowerCase())
      );
      if (key) matched.add(DOMAIN_MAP[key]);
    });
    return Array.from(matched);
  })();

  // Questions and Practice State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStats, setHistoryStats] = useState({
    total_practiced: 0,
    technical_practiced: 0,
    hr_practiced: 0,
    total_available_tech: 0,
    total_available_hr: 0,
    tech_completion_pct: 0,
    hr_completion_pct: 0
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadDomains();
    if (activeStudent?.student_id) {
      loadHistory();
    }
  }, [activeStudent]);

  useEffect(() => {
    if (activeMode === "my_skills") {
      if (studentSkillDomains.length > 0) {
        loadQuestions("Technical", null, studentSkillDomains);
      }
    } else if (activeMode === "technical") {
      loadQuestions("Technical", selectedDomain);
    } else if (activeMode === "hr") {
      loadQuestions("HR", "HR Behavioral");
    } else if (activeMode === "history") {
      loadHistory();
    }
  }, [activeMode, selectedDomain, activeStudent]);

  const loadDomains = async () => {
    try {
      const res = await getInterviewDomains();
      if (res?.success && Array.isArray(res.technical_domains)) {
        setTechDomains(res.technical_domains);
      }
    } catch (err) {
      console.warn("Failed to load interview domains:", err);
    }
  };

  const loadQuestions = async (type, domain, skillDomains) => {
    try {
      setLoadingQuestions(true);
      setShowSampleAnswer(false);
      setCurrentIndex(0);
      setSaveSuccessMsg("");

      const params = {
        interview_type: type,
        student_id: activeStudent?.student_id || ""
      };

      if (domain) {
        params.domain = domain;
      }

      // For my_skills mode send skills so backend filters domains
      if (skillDomains && skillDomains.length > 0) {
        params.skills = skillDomains.join(",");
      }

      const res = await getInterviewQuestions(params);

      if (res?.success && Array.isArray(res.questions)) {
        setQuestions(res.questions);
        if (res.questions.length > 0) {
          setStudentAnswer(res.questions[0].saved_answer || "");
        } else {
          setStudentAnswer("");
        }
      }
    } catch (err) {
      console.warn("Failed to load interview questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadHistory = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoadingHistory(true);
      const res = await getInterviewHistory(activeStudent.student_id);
      if (res?.success) {
        setHistoryRecords(res.records || []);
        if (res.stats) setHistoryStats(res.stats);
      }
    } catch (err) {
      console.warn("Failed to load interview history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setStudentAnswer(questions[nextIdx]?.saved_answer || "");
      setShowSampleAnswer(false);
      setSaveSuccessMsg("");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setStudentAnswer(questions[prevIdx]?.saved_answer || "");
      setShowSampleAnswer(false);
      setSaveSuccessMsg("");
    }
  };

  const handleSaveResponse = async () => {
    if (!activeStudent?.student_id) {
      alert("Please select a student profile first.");
      return;
    }
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    try {
      setIsSaving(true);
      const res = await saveInterviewPractice(activeStudent.student_id, {
        question_id: currentQ.id,
        student_answer: studentAnswer
      });

      if (res?.success) {
        // Mark current question as practiced in local state
        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === currentIndex ? { ...q, is_practiced: true, saved_answer: studentAnswer } : q
          )
        );
        setShowSampleAnswer(true);
        setSaveSuccessMsg("Answer saved to practice history!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
        loadHistory();
      }
    } catch (err) {
      alert(err.message || "Failed to save response.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentQ = questions[currentIndex];

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
                <MessageSquare size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Mock Interview Practice (Technical & HR Behavioral)
                </h1>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                  Practice beginner-level domain questions, type your answers, study expert sample responses, and prepare for campus placement interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveMode("my_skills")}
              className="btn"
              style={{
                backgroundColor: activeMode === "my_skills" ? "#059669" : "var(--very-light-lavender)",
                color: activeMode === "my_skills" ? "#ffffff" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Star size={16} />
              <span>My Skills</span>
              {studentSkillDomains.length > 0 && (
                <span style={{
                  background: activeMode === "my_skills" ? "rgba(255,255,255,0.25)" : "#059669",
                  color: "#fff",
                  borderRadius: "20px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "1px 7px"
                }}>
                  {studentSkillDomains.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("technical")}
              className="btn"
              style={{
                backgroundColor: activeMode === "technical" ? "var(--primary-lavender)" : "var(--very-light-lavender)",
                color: activeMode === "technical" ? "#ffffff" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Code size={16} />
              <span>All Technical</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("hr")}
              className="btn"
              style={{
                backgroundColor: activeMode === "hr" ? "var(--primary-lavender)" : "var(--very-light-lavender)",
                color: activeMode === "hr" ? "#ffffff" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Users size={16} />
              <span>HR Behavioral</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("history")}
              className="btn"
              style={{
                backgroundColor: activeMode === "history" ? "var(--primary-lavender)" : "var(--very-light-lavender)",
                color: activeMode === "history" ? "#ffffff" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <History size={16} />
              <span>Practice History</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: TECHNICAL OR HR PRACTICE */}
      {activeMode !== "history" ? (
        <div>
          {/* My Skills info strip */}
          {activeMode === "my_skills" && (
            <div className="card" style={{ padding: "14px 20px", marginBottom: "16px", backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={16} color="#059669" />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#065f46" }}>
                    Questions based on {activeStudent?.name}'s skills:
                  </span>
                </div>
                {studentSkillDomains.length > 0 ? (
                  studentSkillDomains.map((d) => (
                    <span key={d} style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem",
                      fontWeight: 600, backgroundColor: "#059669", color: "#fff"
                    }}>
                      {d}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    No matching technical skills found in profile. Add skills like Python, SQL, React etc.
                  </span>
                )}
                {studentSkillDomains.length > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                    {questions.length} questions loaded
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Domain Badges (if technical all-domains mode) */}
          {activeMode === "technical" && (
            <div className="card" style={{ padding: "14px 20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Select Technical Domain:
                </span>
                {techDomains.map((d) => {
                  const isSelected = selectedDomain === d.domain;
                  return (
                    <button
                      key={d.domain}
                      type="button"
                      onClick={() => setSelectedDomain(d.domain)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        border: isSelected ? "1px solid var(--primary-lavender)" : "1px solid var(--border-subtle)",
                        backgroundColor: isSelected ? "var(--light-lavender)" : "#ffffff",
                        color: isSelected ? "var(--primary-lavender)" : "var(--text-main)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <span>{DOMAIN_ICONS[d.domain] || "💻"}</span>
                      <span>{d.domain}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Practice Card */}
          {loadingQuestions ? (
            <div className="card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading interview questions...
            </div>
          ) : !currentQ ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No interview questions available for this domain.</p>
            </div>
          ) : (
            <div className="card" style={{ position: "relative" }}>
              {/* Question Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge-purple" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="badge badge-blue">
                    {currentQ.domain_or_category}
                  </span>                  {currentQ.is_practiced && (
                    <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={13} />
                      Practiced
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Difficulty: <strong style={{ color: "var(--primary-lavender)" }}>{currentQ.difficulty || "Beginner"}</strong>
                </div>
              </div>

              {/* Question Text */}
              <div
                style={{
                  backgroundColor: "var(--very-light-lavender)",
                  padding: "18px 22px",
                  borderRadius: "10px",
                  borderLeft: "4px solid var(--primary-lavender)",
                  marginBottom: "20px"
                }}
              >
                <h2 style={{ fontSize: "1.18rem", fontWeight: 700, color: "var(--text-main)", margin: 0, lineHeight: 1.45 }}>
                  {currentQ.question}
                </h2>
              </div>

              {/* Student Answer Textarea */}
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Your Prepared Answer:</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 400 }}>
                    Type your concise response as you would explain it to a recruiter
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your explanation or thoughts here..."
                  className="form-textarea"
                  style={{ fontSize: "0.9rem", lineHeight: 1.5 }}
                />
              </div>

              {/* Save & Action Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleSaveResponse}
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <Save size={16} />
                    <span>{isSaving ? "Saving..." : "Save Answer & Reveal Sample"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                    className="btn btn-secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Lightbulb size={16} />
                    <span>{showSampleAnswer ? "Hide Sample Answer" : "Show Sample Answer & Tips"}</span>
                  </button>
                </div>

                {saveSuccessMsg && (
                  <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Check size={16} /> {saveSuccessMsg}
                  </span>
                )}
              </div>

              {/* Sample Answer & Recruiter Tips Reveal */}
              {showSampleAnswer && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "24px"
                  }}
                >
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary-lavender)", fontWeight: 700, fontSize: "0.92rem", marginBottom: "6px" }}>
                      <Sparkles size={16} />
                      <span>Model Answer (Beginner Friendly):</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.55, whiteSpace: "pre-line", margin: 0 }}>
                      {currentQ.sample_answer}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px", marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706", fontWeight: 700, fontSize: "0.86rem", marginBottom: "4px" }}>
                      <Lightbulb size={15} />
                      <span>What Recruiters Look For:</span>
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                      {currentQ.explanation_tips}
                    </p>
                  </div>
                </div>
              )}

              {/* Question Navigation Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-subtle)"
                }}
              >
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div style={{ display: "flex", gap: "4px" }}>
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setStudentAnswer(q.saved_answer || "");
                        setShowSampleAnswer(false);
                      }}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        border: idx === currentIndex ? "2px solid var(--primary-lavender)" : "1px solid var(--border-subtle)",
                        backgroundColor: idx === currentIndex ? "var(--light-lavender)" : q.is_practiced ? "#ecfdf5" : "#ffffff",
                        color: idx === currentIndex ? "var(--primary-lavender)" : q.is_practiced ? "#10b981" : "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        cursor: "pointer"
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW: PRACTICE HISTORY */
        <div>
          {/* History KPI Cards */}
          <div className="kpi-grid" style={{ marginBottom: "20px" }}>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Practiced</span>
                <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--light-lavender)", color: "var(--primary-lavender)" }}>
                  <Award size={18} />
                </div>
              </div>
              <div className="kpi-value">{historyStats.total_practiced}</div>
              <div className="kpi-subtext">Questions completed and saved</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Technical Readiness</span>
                <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
                  <Code size={18} />
                </div>
              </div>
              <div className="kpi-value">{historyStats.tech_completion_pct}%</div>
              <div style={{ marginTop: "10px" }}>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${historyStats.tech_completion_pct}%`, backgroundColor: "#10b981" }}
                  />
                </div>
              </div>
              <div className="kpi-subtext" style={{ marginTop: "6px" }}>
                {historyStats.technical_practiced} of {historyStats.total_available_tech} questions practiced
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">HR Behavioral Readiness</span>
                <div className="kpi-icon-wrap" style={{ backgroundColor: "var(--very-light-lavender)", color: "var(--primary-lavender)" }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="kpi-value">{historyStats.hr_completion_pct}%</div>
              <div style={{ marginTop: "10px" }}>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${historyStats.hr_completion_pct}%`, backgroundColor: "var(--primary-lavender)" }}
                  />
                </div>
              </div>
              <div className="kpi-subtext" style={{ marginTop: "6px" }}>
                {historyStats.hr_practiced} of {historyStats.total_available_hr} HR questions prepared
              </div>
            </div>
          </div>

          {/* History Records List */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px" }}>
              Detailed Interview Practice Log
            </h3>

            {loadingHistory ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading practice history...
              </div>
            ) : historyRecords.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No interview questions practiced yet. Select Technical or HR Interview tab to start answering questions.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historyRecords.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 1px 3px rgba(81, 68, 119, 0.04)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="badge badge-purple">{r.question?.interview_type || "Technical"}</span>
                        <span className="badge badge-blue">{r.question?.domain_or_category}</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Practiced: {r.practiced_at ? new Date(r.practiced_at).toLocaleDateString() : "-"}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
                      {r.question?.question}
                    </h4>

                    {r.student_answer ? (
                      <div
                        style={{
                          backgroundColor: "var(--very-light-lavender)",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          color: "var(--text-main)",
                          lineHeight: 1.45,
                          marginBottom: "8px"
                        }}
                      >
                        <strong>Your Saved Answer:</strong> {r.student_answer}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "8px" }}>
                        No written answer saved yet.
                      </div>
                    )}

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--primary-lavender)" }}>Sample Answer:</strong> {r.question?.sample_answer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
