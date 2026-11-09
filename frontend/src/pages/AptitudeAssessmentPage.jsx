import React, { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
  History,
  Calculator,
  Compass,
  MessageSquare,
  Sparkles,
  Layers
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getAptitudeCategories,
  startAptitudeAssessment,
  submitAptitudeAssessment,
  getAptitudeAssessmentHistory
} from "../services/api";

const CATEGORY_META = {
  "Quantitative Aptitude": {
    icon: <Calculator size={22} color="#2563eb" />,
    badgeBg: "#eff6ff",
    badgeColor: "#1d4ed8",
    description: "Evaluates arithmetic, time & work, probability, percentages, speed-distance & algebraic aptitude."
  },
  "Logical Reasoning": {
    icon: <Compass size={22} color="#7c3aed" />,
    badgeBg: "#f5f3ff",
    badgeColor: "#6d28d9",
    description: "Evaluates blood relations, direction sense, syllogisms, series, seating arrangements & critical thinking."
  },
  "Verbal Ability": {
    icon: <MessageSquare size={22} color="#059669" />,
    badgeBg: "#ecfdf5",
    badgeColor: "#047857",
    description: "Evaluates vocabulary, grammatical accuracy, error spotting, sentence completion & analytical reading."
  }
};

export default function AptitudeAssessmentPage() {
  const { activeStudent } = useStudent();

  // State: "selection" | "test" | "result" | "history"
  const [stage, setStage] = useState("selection");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  useEffect(() => {
    loadCategories();
    if (activeStudent?.student_id) {
      loadHistory();
    }
  }, [activeStudent]);

  const loadCategories = async () => {
    try {
      const res = await getAptitudeCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn("Error loading aptitude categories:", err);
    }
  };

  const loadHistory = async () => {
    if (!activeStudent?.student_id) return;
    try {
      setLoadingHistory(true);
      const res = await getAptitudeAssessmentHistory(activeStudent.student_id);
      if (res.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.warn("Error loading aptitude history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartTest = async (categoryChoice = "all") => {
    if (!activeStudent?.student_id) {
      alert("Please select or register a student profile first.");
      return;
    }

    try {
      setSelectedCategory(categoryChoice);
      setLoadingTest(true);
      setAnswers({});
      setCurrentIndex(0);
      setResultData(null);

      const res = await startAptitudeAssessment(activeStudent.student_id, categoryChoice);
      if (res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
        setStage("test");
      } else {
        alert(res.error || "Unable to start aptitude assessment.");
      }
    } catch (err) {
      alert(err.message || "Failed to start aptitude assessment.");
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
        category: selectedCategory,
        answers: answers
      };

      const res = await submitAptitudeAssessment(payload);
      if (res.success) {
        setResultData(res);
        setStage("result");
        loadHistory();
      } else {
        alert(res.error || "Failed to submit aptitude assessment.");
      }
    } catch (err) {
      alert(err.message || "Error submitting assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aptitude-assessment-page" style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7c3aed"
                }}
              >
                <Brain size={20} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Placement Aptitude Assessment
              </h1>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0 0" }}>
              Evaluate Quantitative Aptitude, Logical Reasoning, and Verbal Ability to prepare for campus recruitment tests.
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
              <Sparkles size={14} /> Test Options
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("history");
                loadHistory();
              }}
              className={`btn btn-sm ${stage === "history" ? "btn-primary" : "btn-secondary"}`}
            >
              <History size={14} /> Past Attempts ({historyList.length})
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: SELECTION */}
      {stage === "selection" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Comprehensive Placement Test Card */}
          <div
            className="card"
            style={{
              padding: "26px",
              background: "linear-gradient(135deg, #101B35, #1D3B70)",
              color: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(16, 27, 53, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ maxWidth: "600px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255, 255, 255, 0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, marginBottom: "10px" }}>
                  <Layers size={14} /> Recommended Campus Diagnostic
                </div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                  Complete 3-in-1 Aptitude Evaluation
                </h2>
                <p style={{ fontSize: "0.88rem", color: "#B8C4D9", lineHeight: 1.5, margin: 0 }}>
                  Take a comprehensive 10-question placement screening assessment covering <strong>Quantitative Aptitude</strong> (4 questions), <strong>Logical Reasoning</strong> (3 questions), and <strong>Verbal Ability</strong> (3 questions).
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleStartTest("all")}
                disabled={loadingTest}
                className="btn"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "12px 24px",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
                }}
              >
                {loadingTest ? "Starting..." : "Start Comprehensive Test"} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Category-Specific Practice */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "14px" }}>
              Or Practice by Individual Aptitude Category
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
              {categories.map((c) => {
                const meta = CATEGORY_META[c.category] || {};
                return (
                  <div
                    key={c.category}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            backgroundColor: meta.badgeBg || "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {meta.icon || <Brain size={22} />}
                        </div>
                        <span
                          style={{
                            backgroundColor: meta.badgeBg,
                            color: meta.badgeColor,
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          10 MCQs
                        </span>
                      </div>

                      <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "6px" }}>
                        {c.category}
                      </h4>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "16px" }}>
                        {meta.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartTest(c.category)}
                      className="btn btn-secondary"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontWeight: 600
                      }}
                    >
                      Practice {c.category} <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: TEST IN PROGRESS (1 QUESTION AT A TIME) */}
      {stage === "test" && questions.length > 0 && (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Header Card */}
          <div className="card" style={{ marginBottom: "16px", padding: "14px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--primary-navy)" }}>
                  {selectedCategory === "all" ? "Comprehensive Aptitude Assessment" : selectedCategory}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Question {currentIndex + 1} of {questions.length} • Category: <strong>{questions[currentIndex]?.category}</strong>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "#f1f5f9",
                    color: "#334155"
                  }}
                >
                  Topic: {questions[currentIndex]?.topic || questions[currentIndex]?.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Exit test? Your answers will not be recorded.")) {
                      setStage("selection");
                    }
                  }}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  backgroundColor: "#7c3aed",
                  transition: "width 0.2s ease"
                }}
              />
            </div>
          </div>

          {/* Current Question */}
          {(() => {
            const currentQ = questions[currentIndex];
            const currentSelected = answers[currentQ.id];

            return (
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px" }}>
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#7c3aed",
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
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#6d28d9", fontWeight: 700, textTransform: "uppercase" }}>
                      {currentQ.category}
                    </span>
                    <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.5, margin: "4px 0 0 0" }}>
                      {currentQ.question}
                    </p>
                  </div>
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
                          border: isPicked ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                          backgroundColor: isPicked ? "rgba(124, 58, 237, 0.05)" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: isPicked ? "2px solid #7c3aed" : "1.5px solid #cbd5e1",
                            backgroundColor: isPicked ? "#7c3aed" : "#ffffff",
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
                            color: isPicked ? "#101B35" : "#334155",
                            fontWeight: isPicked ? 600 : 400
                          }}
                        >
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Controls */}
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
                            backgroundColor: isCurrent ? "#7c3aed" : answered ? "#10b981" : "#cbd5e1",
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
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed" }}
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
                        padding: "8px 20px"
                      }}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Assessment"} <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STAGE 3: RESULT & EXPLANATIONS */}
      {stage === "result" && resultData && (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Result Card */}
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
                backgroundColor: resultData.percentage >= 80 ? "#f0fdf4" : resultData.percentage >= 50 ? "#f5f3ff" : "#fef2f2",
                color: resultData.percentage >= 80 ? "#16a34a" : resultData.percentage >= 50 ? "#7c3aed" : "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <Award size={38} />
            </div>

            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--primary-navy)", marginBottom: "4px" }}>
              Aptitude Assessment Completed!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Placement readiness benchmark: <strong>{resultData.performance_level}</strong>
            </p>

            {/* Score Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                maxWidth: "680px",
                margin: "0 auto 24px"
              }}
            >
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Overall Score</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--primary-navy)", marginTop: "4px" }}>
                  {resultData.score} / {resultData.total_questions}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "0.72rem", color: "#1d4ed8", fontWeight: 600, textTransform: "uppercase" }}>Quantitative</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>
                  {resultData.quantitative_score}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f5f3ff", borderRadius: "8px", border: "1px solid #ddd6fe" }}>
                <div style={{ fontSize: "0.72rem", color: "#6d28d9", fontWeight: 600, textTransform: "uppercase" }}>Logical</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#5b21b6", marginTop: "4px" }}>
                  {resultData.logical_score}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: "0.72rem", color: "#047857", fontWeight: 600, textTransform: "uppercase" }}>Verbal</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#065f46", marginTop: "4px" }}>
                  {resultData.verbal_score}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleStartTest(selectedCategory)}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, backgroundColor: "#7c3aed" }}
              >
                <RotateCcw size={15} /> Retake Test (New Questions)
              </button>
              <button
                type="button"
                onClick={() => setStage("selection")}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
              >
                Back to Tests
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "16px" }}>
              Detailed Review & Step-by-Step Solutions
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
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.is_correct ? <CheckCircle size={18} color="#16a34a" /> : <XCircle size={18} color="#dc2626" />}
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                          Question {idx + 1}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>• {item.category} ({item.topic})</span>
                      </div>
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
                      {item.is_correct ? "Correct" : "Incorrect"}
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

                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "#f8fafc",
                      borderLeft: "4px solid #7c3aed",
                      fontSize: "0.82rem",
                      color: "#334155"
                    }}
                  >
                    <strong>Solution / Explanation:</strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: HISTORY */}
      {stage === "history" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                Aptitude Assessment History
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Past tests and category score breakdowns for {activeStudent.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStage("selection")}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: "#7c3aed" }}
            >
              Take Another Test
            </button>
          </div>

          {loadingHistory ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Loading history...</p>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <HelpCircle size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#334155" }}>
                No aptitude assessments recorded yet
              </p>
              <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Take the comprehensive placement assessment to establish your baseline scores.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                    <th style={{ padding: "10px 12px" }}>Date</th>
                    <th style={{ padding: "10px 12px" }}>Score</th>
                    <th style={{ padding: "10px 12px" }}>Quant</th>
                    <th style={{ padding: "10px 12px" }}>Logical</th>
                    <th style={{ padding: "10px 12px" }}>Verbal</th>
                    <th style={{ padding: "10px 12px" }}>Percentage</th>
                    <th style={{ padding: "10px 12px" }}>Readiness</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((att) => (
                    <tr key={att.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", color: "#64748b", fontSize: "0.82rem" }}>
                        {att.completed_at ? new Date(att.completed_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "var(--primary-navy)" }}>
                        {att.score} / {att.total_questions}
                      </td>
                      <td style={{ padding: "12px", color: "#1e40af", fontWeight: 600 }}>
                        {att.quantitative_score}
                      </td>
                      <td style={{ padding: "12px", color: "#5b21b6", fontWeight: 600 }}>
                        {att.logical_score}
                      </td>
                      <td style={{ padding: "12px", color: "#065f46", fontWeight: 600 }}>
                        {att.verbal_score}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "var(--brand-blue)" }}>
                        {att.percentage}%
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            backgroundColor:
                              att.percentage >= 80 ? "#dcfce7" : att.percentage >= 50 ? "#eff6ff" : "#fee2e2",
                            color:
                              att.percentage >= 80 ? "#15803d" : att.percentage >= 50 ? "#1d4ed8" : "#b91c1c"
                          }}
                        >
                          {att.performance_level}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleStartTest("all")}
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
