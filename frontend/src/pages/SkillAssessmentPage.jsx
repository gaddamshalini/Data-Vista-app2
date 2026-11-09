import React, { useState, useEffect } from "react";
import {
  Code,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  BarChart2,
  Check,
  AlertTriangle,
  History
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getSkillAssessmentList,
  startSkillAssessment,
  submitSkillAssessment,
  getSkillAssessmentHistory
} from "../services/api";

const SKILL_ICONS = {
  Python: "🐍",
  Java: "☕",
  C: "⚡",
  SQL: "🗄️",
  HTML: "🌐",
  CSS: "🎨",
  JavaScript: "📜",
  React: "⚛️",
  "Machine Learning": "🤖",
  "Data Analytics": "📊"
};

export default function SkillAssessmentPage() {
  const { activeStudent } = useStudent();

  // State: "selection" | "test" | "result" | "history"
  const [stage, setStage] = useState("selection");
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [searchSkill, setSearchSkill] = useState("");

  // Test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);

  // Result state
  const [resultData, setResultData] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load available skills
  useEffect(() => {
    loadSkills();
    if (activeStudent?.student_id) {
      loadHistory();
    }
  }, [activeStudent]);

  const loadSkills = async () => {
    try {
      const res = await getSkillAssessmentList();
      if (res.success && res.skills) {
        setSkillsList(res.skills);
      }
    } catch (err) {
      console.warn("Error loading skill assessment list:", err);
    }
  };

  const loadHistory = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoadingHistory(true);
      const res = await getSkillAssessmentHistory(activeStudent.student_id);
      if (res.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.warn("Error loading skill test history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartTest = async (skillName) => {
    if (!activeStudent?.student_id) {
      alert("Please select or register a student profile first.");
      return;
    }

    try {
      setSelectedSkill(skillName);
      setLoadingTest(true);
      setAnswers({});
      setCurrentIndex(0);
      setResultData(null);

      const res = await startSkillAssessment(skillName, activeStudent.student_id);
      if (res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
        setStage("test");
      } else {
        alert(res.error || "Unable to start assessment for this skill.");
      }
    } catch (err) {
      alert(err.message || "Failed to start skill assessment.");
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit now?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        student_id: activeStudent.student_id,
        skill: selectedSkill,
        answers: answers
      };

      const res = await submitSkillAssessment(payload);
      if (res.success) {
        setResultData(res);
        setStage("result");
        loadHistory();
      } else {
        alert(res.error || "Failed to submit assessment.");
      }
    } catch (err) {
      alert(err.message || "Error submitting assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skillsList.filter((s) =>
    s.name.toLowerCase().includes(searchSkill.toLowerCase())
  );

  return (
    <div className="skill-assessment-page" style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Page Header */}
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
                <Code size={20} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Technical Skill Assessments
              </h1>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0 0" }}>
              Validate your technical competency across 10 in-demand domains with 10-question MCQ diagnostic evaluations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                setStage("selection");
                setResultData(null);
              }}
              className={`btn btn-sm ${stage === "selection" ? "btn-primary" : "btn-secondary"}`}
            >
              <Sparkles size={14} /> Available Skills
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("history");
                loadHistory();
              }}
              className={`btn btn-sm ${stage === "history" ? "btn-primary" : "btn-secondary"}`}
            >
              <History size={14} /> Attempt History ({historyList.length})
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: SKILL SELECTION */}
      {stage === "selection" && (
        <div>
          {/* Search Bar */}
          <div className="card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search technical skills (e.g. Python, SQL, React, Machine Learning)..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                Showing <strong>{filteredSkills.length}</strong> skills
              </span>
            </div>
          </div>

          {/* Skill Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "18px"
            }}
          >
            {filteredSkills.map((s) => {
              // Find student's best score in this skill if any
              const pastAttempts = historyList.filter((h) => h.skill === s.name);
              const latestAttempt = pastAttempts[0];

              return (
                <div
                  key={s.name}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    position: "relative"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "2rem",
                          lineHeight: 1,
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        {SKILL_ICONS[s.name] || "💻"}
                      </div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          fontSize: "0.75rem",
                          fontWeight: 600
                        }}
                      >
                        10 MCQs • 4 Options
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "4px" }}>
                      {s.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Evaluates language syntax, runtime execution, data structures, and best practices.
                    </p>

                    {latestAttempt && (
                      <div
                        style={{
                          padding: "6px 10px",
                          backgroundColor: latestAttempt.percentage >= 80 ? "#f0fdf4" : latestAttempt.percentage >= 50 ? "#eff6ff" : "#fef2f2",
                          borderRadius: "6px",
                          border: `1px solid ${latestAttempt.percentage >= 80 ? "#bbf7d0" : latestAttempt.percentage >= 50 ? "#bfdbfe" : "#fecaca"}`,
                          fontSize: "0.78rem",
                          marginBottom: "14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>Latest: <strong>{latestAttempt.score}/10</strong> ({latestAttempt.percentage}%)</span>
                        <span style={{ fontWeight: 700 }}>{latestAttempt.skill_level}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartTest(s.name)}
                    disabled={loadingTest}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontWeight: 600
                    }}
                  >
                    {latestAttempt ? "Retake Assessment" : "Start Assessment"} <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 2: ACTIVE TEST (1 QUESTION AT A TIME) */}
      {stage === "test" && questions.length > 0 && (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Test Meta Header */}
          <div className="card" style={{ marginBottom: "16px", padding: "14px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.3rem" }}>{SKILL_ICONS[selectedSkill] || "💻"}</span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                    {selectedSkill} Technical Assessment
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "#f1f5f9",
                    color: "#334155"
                  }}
                >
                  Difficulty: {questions[currentIndex]?.difficulty || "Medium"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to exit? Your progress in this test will not be saved.")) {
                      setStage("selection");
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Exit Test
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  backgroundColor: "var(--brand-blue)",
                  transition: "width 0.2s ease"
                }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ = questions[currentIndex];
            const currentSelected = answers[currentQ.id];

            return (
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "22px" }}>
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-navy)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      flexShrink: 0
                    }}
                  >
                    {currentIndex + 1}
                  </span>
                  <p
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      lineHeight: 1.5,
                      margin: 0
                    }}
                  >
                    {currentQ.question}
                  </p>
                </div>

                {/* 4 Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                  {currentQ.options.map((opt) => {
                    const isPicked = currentSelected === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQ.id, opt.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          border: isPicked ? "2px solid var(--brand-blue)" : "1px solid #e2e8f0",
                          backgroundColor: isPicked ? "rgba(37, 99, 235, 0.05)" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: isPicked ? "2px solid var(--brand-blue)" : "1.5px solid #cbd5e1",
                            backgroundColor: isPicked ? "var(--brand-blue)" : "#ffffff",
                            color: isPicked ? "#ffffff" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            flexShrink: 0
                          }}
                        >
                          {opt.key}
                        </div>
                        <span
                          style={{
                            fontSize: "0.92rem",
                            color: isPicked ? "var(--primary-navy)" : "#334155",
                            fontWeight: isPicked ? 600 : 400
                          }}
                        >
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Navigation Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      visibility: currentIndex === 0 ? "hidden" : "visible"
                    }}
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {questions.map((q, idx) => {
                      const answered = !!answers[q.id];
                      const isCurrent = idx === currentIndex;
                      return (
                        <div
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: isCurrent
                              ? "var(--brand-blue)"
                              : answered
                              ? "#10b981"
                              : "#cbd5e1",
                            cursor: "pointer"
                          }}
                          title={`Question ${idx + 1}${answered ? " (Answered)" : ""}`}
                        />
                      );
                    })}
                  </div>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn-primary"
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="btn"
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 20px",
                        boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
                      }}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Test"} <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STAGE 3: RESULT & BREAKDOWN */}
      {stage === "result" && resultData && (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Result Summary Scorecard */}
          <div
            className="card"
            style={{
              padding: "32px",
              textAlign: "center",
              marginBottom: "24px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0"
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor:
                  resultData.percentage >= 80
                    ? "#f0fdf4"
                    : resultData.percentage >= 50
                    ? "#eff6ff"
                    : "#fef2f2",
                color:
                  resultData.percentage >= 80
                    ? "#16a34a"
                    : resultData.percentage >= 50
                    ? "var(--brand-blue)"
                    : "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <Award size={38} />
            </div>

            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "4px" }}>
              {selectedSkill} Assessment Completed!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Assessment results saved to your persistent student performance dossier.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
                maxWidth: "520px",
                margin: "0 auto 24px"
              }}
            >
              <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Score</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-navy)", marginTop: "4px" }}>
                  {resultData.score} / {resultData.total_questions}
                </div>
              </div>

              <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Accuracy</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--brand-blue)", marginTop: "4px" }}>
                  {resultData.percentage}%
                </div>
              </div>

              <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Proficiency</div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    marginTop: "6px",
                    color:
                      resultData.skill_level === "Advanced"
                        ? "#16a34a"
                        : resultData.skill_level === "Intermediate"
                        ? "#2563eb"
                        : "#dc2626"
                  }}
                >
                  {resultData.skill_level}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleStartTest(selectedSkill)}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
              >
                <RotateCcw size={15} /> Retake Test (Fresh Questions)
              </button>
              <button
                type="button"
                onClick={() => setStage("selection")}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
              >
                Choose Another Skill
              </button>
            </div>
          </div>

          {/* Detailed Question Breakdown with Explanations */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "16px" }}>
              Question-by-Question Review & Explanations
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {resultData.breakdown?.map((item, idx) => (
                <div
                  key={item.question_id || idx}
                  style={{
                    padding: "18px",
                    borderRadius: "10px",
                    border: `1px solid ${item.is_correct ? "#bbf7d0" : "#fecaca"}`,
                    backgroundColor: item.is_correct ? "#fcfdfc" : "#fffbfa"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {item.is_correct ? (
                        <CheckCircle size={18} color="#16a34a" />
                      ) : (
                        <XCircle size={18} color="#dc2626" />
                      )}
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                        Question {idx + 1}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: item.is_correct ? "#dcfce7" : "#fee2e2",
                        color: item.is_correct ? "#15803d" : "#b91c1c"
                      }}
                    >
                      {item.is_correct ? "Correct (+1)" : "Incorrect (0)"}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b", marginBottom: "12px" }}>
                    {item.question}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                    {item.options.map((opt) => {
                      const isUserChoice = item.user_answer === opt.key;
                      const isCorrectChoice = item.correct_answer === opt.key;

                      let bg = "#ffffff";
                      let border = "#e2e8f0";
                      let color = "#334155";

                      if (isCorrectChoice) {
                        bg = "#dcfce7";
                        border = "#86efac";
                        color = "#15803d";
                      } else if (isUserChoice && !item.is_correct) {
                        bg = "#fee2e2";
                        border = "#fca5a5";
                        color = "#b91c1c";
                      }

                      return (
                        <div
                          key={opt.key}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: bg,
                            border: `1px solid ${border}`,
                            color: color,
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <strong>{opt.key}:</strong> {opt.text}
                          {isCorrectChoice && <span style={{ marginLeft: "auto", fontSize: "0.72rem", fontWeight: 700 }}>✓ Correct</span>}
                          {isUserChoice && !isCorrectChoice && <span style={{ marginLeft: "auto", fontSize: "0.72rem", fontWeight: 700 }}>✗ Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Note */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "#f8fafc",
                      borderLeft: "4px solid var(--brand-blue)",
                      fontSize: "0.82rem",
                      color: "#334155"
                    }}
                  >
                    <strong>Explanation:</strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: ATTEMPT HISTORY */}
      {stage === "history" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Student Skill Assessment History
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                All completed MCQ assessments for {activeStudent.name} ({activeStudent.student_id})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStage("selection")}
              className="btn btn-primary btn-sm"
            >
              Take Another Assessment
            </button>
          </div>

          {loadingHistory ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Loading history...</p>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <HelpCircle size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#334155" }}>
                No assessments taken yet
              </p>
              <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Choose a skill from the catalog and test your coding knowledge to record your proficiency score.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                    <th style={{ padding: "10px 12px" }}>Skill</th>
                    <th style={{ padding: "10px 12px" }}>Score</th>
                    <th style={{ padding: "10px 12px" }}>Percentage</th>
                    <th style={{ padding: "10px 12px" }}>Proficiency Level</th>
                    <th style={{ padding: "10px 12px" }}>Date Completed</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((att) => (
                    <tr key={att.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--primary-navy)" }}>
                        <span style={{ marginRight: "6px" }}>{SKILL_ICONS[att.skill] || "💻"}</span>
                        {att.skill}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <strong>{att.score}</strong> / {att.total_questions}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontWeight: 600, color: "var(--brand-blue)" }}>{att.percentage}%</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            backgroundColor:
                              att.skill_level === "Advanced"
                                ? "#dcfce7"
                                : att.skill_level === "Intermediate"
                                ? "#eff6ff"
                                : "#fee2e2",
                            color:
                              att.skill_level === "Advanced"
                                ? "#15803d"
                                : att.skill_level === "Intermediate"
                                ? "#1d4ed8"
                                : "#b91c1c"
                          }}
                        >
                          {att.skill_level}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#64748b", fontSize: "0.82rem" }}>
                        {att.completed_at ? new Date(att.completed_at).toLocaleString() : "N/A"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleStartTest(att.skill)}
                          className="btn btn-secondary btn-sm"
                        >
                          <RotateCcw size={12} /> Retake
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
