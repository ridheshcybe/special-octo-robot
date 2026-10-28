"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";
import { InteractiveWaitLoader } from "../../../_components/InteractiveWaitLoader";

interface QuizRunnerPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default function QuizRunnerPage({ params }: QuizRunnerPageProps) {
  const { quizId } = use(params);

  const [screen, setScreen] = useState<"preview" | "running" | "completed">("preview");
  const [loading, setLoading] = useState(false);
  const [quizMeta, setQuizMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Active Runner State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [resultData, setResultData] = useState<any>(null);
  const [submittedAt, setSubmittedAt] = useState<string>("");

  // 1. Start Quiz Attempt
  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prepmeup/quizzes/${quizId}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to start quiz.");
      }

      setQuizMeta(data.data.quiz);
      setQuestions(data.data.questions);
      setAttemptId(data.data.attemptId);
      setAnswers({});
      setMarkedForReview({});
      setCurrentIndex(0);
      setSecondsRemaining((data.data.quiz.duration_minutes || 15) * 60);
      setScreen("running");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Countdown Timer
  useEffect(() => {
    if (screen !== "running") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  // 3. Periodic Auto-Save
  useEffect(() => {
    if (screen !== "running" || !attemptId) return;

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/prepmeup/quizzes/${quizId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            answers,
            timeSpentSeconds: (quizMeta?.duration_minutes || 15) * 60 - secondsRemaining,
          }),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [answers, secondsRemaining, screen, attemptId, quizId, quizMeta]);

  // 4. Submit Final
  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prepmeup/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpentSeconds: (quizMeta?.duration_minutes || 15) * 60 - secondsRemaining,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit answers.");
      }

      setResultData(data.data);
      setSubmittedAt(new Date().toLocaleTimeString());
      setScreen("completed");
      setShowSubmitModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];

  // --------------------------------------------------------------------------
  // SCREEN 1: PRE-QUIZ PREVIEW & INSTRUCTIONS
  // --------------------------------------------------------------------------
  if (screen === "preview") {
    return (
      <div style={{ maxWidth: "740px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        <Link
          href="/prepmeup/quizzes"
          className="font-mono"
          style={{ fontSize: "12px", fontWeight: 600, color: "#a19f95", textDecoration: "none" }}
        >
          ← Back to Quiz Arena Directory
        </Link>

        {loading ? (
          <InteractiveWaitLoader
            title="Initializing Quiz Arena…"
            subtitle="Warm up with the digital logic gate while your question set loads!"
          />
        ) : (
          <div className="pmu-card-highlight" style={{ padding: "32px" }}>
            <span className="pmu-badge">Examination Instructions</span>
            <h1
              className="font-display"
              style={{ marginTop: "12px", fontSize: "36px", textTransform: "uppercase", color: "#f3f1ea" }}
            >
              Ready to Start Quiz Challenge
            </h1>
            <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
              This timed examination simulates university mid-semester and end-semester grading conditions with instant step-by-step error analysis and LaTeX solutions upon submission.
            </p>

            <div
              className="pmu-grid-3"
              style={{
                marginTop: "24px",
                padding: "18px",
                borderRadius: "8px",
                border: "1px solid #26262c",
                backgroundColor: "#08080a",
                textAlign: "center",
              }}
            >
              <div>
                <div className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
                  Duration
                </div>
                <div className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", marginTop: "4px" }}>
                  15 Mins
                </div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
                  Questions
                </div>
                <div className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", marginTop: "4px" }}>
                  5 Items
                </div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
                  Passing Criteria
                </div>
                <div className="font-display" style={{ fontSize: "28px", color: "#4ade80", marginTop: "4px" }}>
                  60%
                </div>
              </div>
            </div>

            <ul
              style={{
                marginTop: "20px",
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "13px",
                color: "#d6d3cb",
                lineHeight: 1.6,
              }}
            >
              <li><strong>Real-Time Auto-Save:</strong> Your selected options sync continuously.</li>
              <li><strong>Submission Confirmation Receipt:</strong> Receive an official submission receipt with attempt ID and score summary.</li>
              <li><strong>Error &amp; Solution Review:</strong> Every question displays exact error analysis and LaTeX derivations after submission.</li>
            </ul>

            <button
              type="button"
              onClick={handleStartQuiz}
              className="pmu-btn-primary"
              style={{ width: "100%", marginTop: "24px" }}
            >
              Start Timed Quiz Now →
            </button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 3: COMPLETED RESULT, SUBMISSION CONFIRMATION & ERROR/EXPLANATION REVIEW
  // --------------------------------------------------------------------------
  if (screen === "completed" && resultData) {
    const wrongCount = (resultData.breakdown || []).filter((b: any) => !b.isCorrect).length;
    return (
      <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* 1. Explicit Submission Confirmation Banner */}
        <div
          style={{
            borderRadius: "10px",
            border: "2px solid #22c55e",
            backgroundColor: "rgba(3, 46, 21, 0.35)",
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                height: "42px",
                width: "42px",
                borderRadius: "9999px",
                backgroundColor: "#22c55e",
                color: "#08080a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: "22px", textTransform: "uppercase", color: "#4ade80" }}>
                Quiz Submitted &amp; Graded Successfully!
              </h3>
              <p className="font-mono" style={{ fontSize: "12px", color: "#bbf7d0", marginTop: "2px" }}>
                Attempt ID: #{attemptId || "ATT-VERIFIED"} • Submitted at {submittedAt || "Just now"} • Saved to Progress Analytics
              </p>
            </div>
          </div>

          <span
            className="font-mono"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#08080a",
              border: "1px solid rgba(34,197,94,0.4)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            STATUS: CONFIRMED
          </span>
        </div>

        {/* 2. Score Card Banner */}
        <div className="pmu-card-highlight" style={{ padding: "32px", textAlign: "center" }}>
          <span
            className="font-mono"
            style={{
              padding: "5px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              backgroundColor: resultData.passed ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
              color: resultData.passed ? "#4ade80" : "#f87171",
            }}
          >
            {resultData.passed ? "🏆 QUIZ PASSED • MASTERY VERIFIED" : "⚠️ REVISION RECOMMENDED"}
          </span>

          <h2
            className="font-display"
            style={{ marginTop: "14px", fontSize: "52px", lineHeight: 1, textTransform: "uppercase", color: "#f3f1ea" }}
          >
            {resultData.score} / {resultData.totalMarks} Marks
          </h2>
          <p className="font-mono" style={{ marginTop: "8px", fontSize: "15px", color: "#ff6a3d", fontWeight: 700 }}>
            Overall Accuracy: {resultData.percentage}% • {wrongCount === 0 ? "Zero Mistakes!" : `${wrongCount} Question(s) With Errors Flagged Below`}
          </p>

          <div style={{ marginTop: "22px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            <button type="button" onClick={() => setScreen("preview")} className="pmu-btn-secondary">
              ↺ Retake Quiz
            </button>
            <Link href="/prepmeup/progress" className="pmu-btn-primary">
              View in Progress Dashboard →
            </Link>
          </div>
        </div>

        {/* 3. Detailed Error Analysis & Step-by-Step Faculty Solution List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="font-display" style={{ fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea" }}>
            Detailed Solution Key &amp; Error Diagnostics
          </h3>

          {resultData.breakdown?.map((item: any, i: number) => {
            const isCorrect = Boolean(item.isCorrect);
            const wasUnanswered = item.studentAnswer === null || item.studentAnswer === undefined || item.studentAnswer === "";

            return (
              <div
                key={i}
                className="pmu-card"
                style={{
                  padding: "24px",
                  borderColor: isCorrect ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #26262c",
                    paddingBottom: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="pmu-badge">Question 0{i + 1}</span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: isCorrect ? "#4ade80" : "#f87171",
                      }}
                    >
                      {isCorrect ? "✓ CORRECT RESPONSE" : wasUnanswered ? "✕ UNANSWERED (SKIPPED)" : "✕ INCORRECT RESPONSE (ERROR DETECTED)"}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: isCorrect ? "#4ade80" : "#f87171" }}>
                    {item.marksAwarded} / {item.totalMarks} Marks
                  </span>
                </div>

                {/* Question Prompt */}
                <div style={{ marginBottom: "16px" }}>
                  <RichMathMarkdown content={item.questionText} />
                </div>

                {/* Your Answer vs Correct Answer */}
                <div className="pmu-grid-2" style={{ gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: isCorrect ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(239,68,68,0.4)",
                      backgroundColor: isCorrect ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.08)",
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", color: "#a19f95", display: "block" }}>
                      Your Submitted Answer:
                    </span>
                    <strong style={{ fontSize: "13.5px", color: isCorrect ? "#4ade80" : "#f87171", marginTop: "4px", display: "block" }}>
                      {!wasUnanswered ? String(item.studentAnswer) : "No Answer Submitted (Blank)"}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(34,197,94,0.35)",
                      backgroundColor: "rgba(34,197,94,0.06)",
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", color: "#a19f95", display: "block" }}>
                      Verified Correct Answer:
                    </span>
                    <strong style={{ fontSize: "13.5px", color: "#4ade80", marginTop: "4px", display: "block" }}>
                      {String(item.correctAnswer)}
                    </strong>
                  </div>
                </div>

                {/* Error Diagnostic Box if Incorrect */}
                {!isCorrect && (
                  <div
                    style={{
                      marginBottom: "14px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.35)",
                      backgroundColor: "rgba(70,8,9,0.28)",
                      fontSize: "12.5px",
                      color: "#fca5a5",
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>⚠️ Submission Error Diagnostic:</strong>{" "}
                    {wasUnanswered
                      ? "You left this item blank before submitting. In university exams with zero negative marking, always evaluate boundary conditions to eliminate 2 distractors."
                      : `Your response ("${String(item.studentAnswer)}") did not match the expected value ("${String(item.correctAnswer)}"). Review the step-by-step derivation below to fix this conceptual gap.`}
                  </div>
                )}

                {/* Step-by-Step Faculty Solution & Derivation */}
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "8px",
                    border: "1px solid #26262c",
                    borderLeft: "3px solid #ff3b1d",
                    backgroundColor: "#08080a",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d", display: "block", marginBottom: "6px" }}>
                    📖 Faculty Step-by-Step Explanation &amp; Derivation:
                  </span>
                  <RichMathMarkdown content={item.explanation} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: ACTIVE EXAM RUNNER
  // --------------------------------------------------------------------------
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Sticky Header with Timer & Auto-Save */}
      <div
        className="pmu-card"
        style={{
          padding: "18px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderColor: "rgba(255,59,29,0.4)",
        }}
      >
        <div>
          <span className="pmu-badge">
            Question 0{currentIndex + 1} of 0{questions.length}
          </span>
          <h2 className="font-display" style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
            {quizMeta?.title}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: saveStatus === "saved" ? "#4ade80" : "#ff6a3d" }}>
            {saveStatus === "saving" ? "☁ Syncing..." : "✓ Progress Saved"}
          </span>

          <div
            className="font-mono"
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid rgba(255,59,29,0.45)",
              backgroundColor: "#08080a",
              fontSize: "15px",
              fontWeight: 700,
              color: "#ff6a3d",
            }}
          >
            ⏱ {formatTime(secondsRemaining)}
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="pmu-btn-primary"
            style={{ padding: "9px 18px", fontSize: "12px" }}
          >
            Submit Quiz ✓
          </button>
        </div>
      </div>

      {/* Runner Grid */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Main Question Card (Spans 2 columns) */}
        <div style={{ gridColumn: "span 2" }}>
          {currentQ && (
            <div className="pmu-card" style={{ padding: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #26262c",
                  paddingBottom: "14px",
                  marginBottom: "18px",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#a19f95" }}>
                  Type: {currentQ.question_type.replace("_", " ")} • {currentQ.marks} Mark(s)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMarkedForReview({
                      ...markedForReview,
                      [currentQ.id]: !markedForReview[currentQ.id],
                    })
                  }
                  style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: markedForReview[currentQ.id] ? "#facc15" : "#a19f95",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {markedForReview[currentQ.id] ? "★ Marked for Review" : "☆ Mark for Review"}
                </button>
              </div>

              {/* Question Prompt */}
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#f3f1ea", marginBottom: "22px" }}>
                <RichMathMarkdown content={currentQ.question_text} />
              </div>

              {/* RENDERER: MCQ */}
              {currentQ.question_type === "mcq_single" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentQ.options?.map((opt: string, i: number) => {
                    const isSelected = answers[currentQ.id] === opt;
                    const optionLetter = String.fromCharCode(65 + i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "16px 18px",
                          borderRadius: "8px",
                          textAlign: "left",
                          border: isSelected ? "2px solid #ff3b1d" : "1px solid #26262c",
                          backgroundColor: isSelected ? "rgba(255,59,29,0.12)" : "#08080a",
                          color: "#f3f1ea",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{
                            height: "28px",
                            width: "28px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: isSelected ? "#ff3b1d" : "#17171b",
                            color: isSelected ? "#08080a" : "#a19f95",
                            flexShrink: 0,
                          }}
                        >
                          {optionLetter}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: isSelected ? 700 : 500 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* RENDERER: Numerical Input */}
              {currentQ.question_type === "numerical" && (
                <div style={{ marginTop: "16px" }}>
                  <label className="pmu-label">Enter Numerical Value (Decimals Accepted):</label>
                  <input
                    type="number"
                    step="any"
                    value={answers[currentQ.id] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="e.g. 12.5"
                    className="pmu-input font-mono"
                    style={{ maxWidth: "280px", fontSize: "15px" }}
                  />
                </div>
              )}

              {/* RENDERER: Python Coding */}
              {currentQ.question_type === "coding" && (
                <div style={{ marginTop: "16px" }}>
                  <label className="pmu-label">Python Solution Code:</label>
                  <textarea
                    rows={6}
                    value={answers[currentQ.id] ?? currentQ.initial_code ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    className="pmu-input font-mono"
                  />
                </div>
              )}

              {/* Navigation Controls */}
              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "18px",
                  borderTop: "1px solid #26262c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="pmu-btn-secondary"
                  style={{ opacity: currentIndex === 0 ? 0.35 : 1 }}
                >
                  ← Previous Question
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="pmu-btn-primary"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="pmu-btn-primary"
                    style={{ backgroundColor: "#22c55e", color: "#08080a" }}
                  >
                    Finish &amp; Submit Quiz ✓
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question Palette Sidebar */}
        <div className="pmu-card" style={{ padding: "24px" }}>
          <h4 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
            Question Palette
          </h4>
          <p style={{ fontSize: "12px", color: "#a19f95", marginTop: "4px" }}>
            Click any number to jump directly to that question:
          </p>

          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
              const isMarked = markedForReview[q.id];
              const isCurrent = currentIndex === idx;

              let border = "1px solid #26262c";
              let bg = "#08080a";
              let color = "#a19f95";

              if (isCurrent) {
                border = "2px solid #ff3b1d";
                bg = "#ff3b1d";
                color = "#08080a";
              } else if (isMarked) {
                border = "1px solid #facc15";
                bg = "rgba(250,204,21,0.18)";
                color = "#fde047";
              } else if (isAnswered) {
                border = "1px solid #22c55e";
                bg = "rgba(34,197,94,0.18)";
                color = "#4ade80";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className="font-mono"
                  style={{
                    height: "40px",
                    borderRadius: "6px",
                    border,
                    backgroundColor: bg,
                    color,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #26262c",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "12px",
              color: "#a19f95",
            }}
          >
            <div>🟢 Answered ({Object.keys(answers).filter((k) => answers[k] !== "").length})</div>
            <div>🟡 Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</div>
            <div>⚪ Unvisited / Blank ({questions.length - Object.keys(answers).filter((k) => answers[k] !== "").length})</div>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="pmu-btn-primary"
            style={{ width: "100%", marginTop: "20px" }}
          >
            Submit Examination →
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.85)",
            padding: "20px",
          }}
        >
          <div className="pmu-card-highlight" style={{ maxWidth: "460px", width: "100%", padding: "28px", textAlign: "center" }}>
            <span className="pmu-badge">Final Submission Check</span>
            <h3 className="font-display" style={{ marginTop: "10px", fontSize: "28px", textTransform: "uppercase", color: "#f3f1ea" }}>
              Confirm &amp; Submit Quiz?
            </h3>
            <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
              You have answered <strong>{Object.keys(answers).filter((k) => answers[k] !== "").length}</strong> out of{" "}
              <strong>{questions.length}</strong> questions. Submitting will lock your attempt, generate your confirmation receipt, and reveal step-by-step solutions and error diagnostics.
            </p>

            <div style={{ marginTop: "22px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="pmu-btn-secondary"
              >
                Return to Questions
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitFinal}
                className="pmu-btn-primary"
                style={{ backgroundColor: "#22c55e", color: "#08080a" }}
              >
                {submitting ? "Grading Attempt…" : "✓ Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
