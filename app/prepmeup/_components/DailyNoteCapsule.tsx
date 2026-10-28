"use client";

import React, { useEffect, useState } from "react";
import type { DailyNoteData, DailyQuizQuestion } from "@/lib/prepmeup/dailyNotes";
import { RichMathMarkdown } from "./RichMathMarkdown";

export function DailyNoteCapsule({ initialData }: { initialData?: DailyNoteData }) {
  const [data, setData] = useState<DailyNoteData | null>(initialData || null);
  const [activeTab, setActiveTab] = useState<"summary" | "notes" | "quiz">("summary");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!initialData) {
      fetch("/api/prepmeup/daily-note")
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res?.ok && res.data) {
            setData(res.data);
            checkCompletion(res.data.id);
          }
        })
        .catch(() => {});
    } else {
      checkCompletion(initialData.id);
    }
  }, [initialData]);

  const checkCompletion = (capsuleId: string) => {
    try {
      const completed = JSON.parse(localStorage.getItem("pmu_completed_capsules") || "[]");
      if (completed.includes(capsuleId)) {
        setIsCompleted(true);
      }
    } catch {}
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (quizSubmitted[qId]) return; // locked after submit
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheckQuestion = (q: DailyQuizQuestion) => {
    if (quizAnswers[q.id] === undefined) return;
    setQuizSubmitted((prev) => ({ ...prev, [q.id]: true }));

    const isCorrect = quizAnswers[q.id] === q.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Check if all questions are now submitted
    if (data) {
      const allDone = data.quiz.every(
        (item) => item.id === q.id || quizSubmitted[item.id]
      );
      if (allDone) {
        setIsCompleted(true);
        try {
          const completed = JSON.parse(localStorage.getItem("pmu_completed_capsules") || "[]");
          if (!completed.includes(data.id)) {
            completed.push(data.id);
            localStorage.setItem("pmu_completed_capsules", JSON.stringify(completed));
          }
        } catch {}
      }
    }
  };

  if (!data) {
    return (
      <div id="daily-capsule" className="pmu-card" style={{ padding: "28px", textAlign: "center" }}>
        <p className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
          Loading today&apos;s daily academic capsule…
        </p>
      </div>
    );
  }

  return (
    <section
      id="daily-capsule"
      className="pmu-card-highlight"
      style={{
        borderRadius: "16px",
        padding: "28px 32px",
        border: "1px solid rgba(255, 59, 29, 0.4)",
        backgroundColor: "#111114",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Banner Tag & Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#ff3b1d",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: "#ff3b1d",
                display: "inline-block",
                boxShadow: "0 0 8px #ff3b1d",
              }}
            />
            Today&apos;s Daily Academic Capsule
          </span>
          <span className="pmu-badge">{data.subjectCode} • {data.subjectTitle}</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
            📅 {data.date} • ⏱️ {data.readTimeMinutes} Min Read
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              color: isCompleted ? "#4ade80" : "#fbbf24",
              backgroundColor: isCompleted ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
              padding: "4px 10px",
              borderRadius: "4px",
              fontWeight: 700,
            }}
          >
            {isCompleted ? "✓ Completed (+50 XP)" : `⭐ Earn +${data.xpReward} XP`}
          </span>
        </div>
      </div>

      {/* Capsule Topic Title */}
      <h2
        className="font-display"
        style={{
          fontSize: "clamp(24px, 3.5vw, 36px)",
          lineHeight: 1.1,
          textTransform: "uppercase",
          color: "#f3f1ea",
          marginBottom: "16px",
        }}
      >
        {data.topic}
      </h2>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid #26262c",
          paddingBottom: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className="font-mono"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "summary" ? "1px solid #ff3b1d" : "1px solid #26262c",
            backgroundColor: activeTab === "summary" ? "rgba(255,59,29,0.12)" : "#17171b",
            color: activeTab === "summary" ? "#ff3b1d" : "#a19f95",
            transition: "all 0.2s",
          }}
        >
          ⚡ 60-Second Exam Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className="font-mono"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "notes" ? "1px solid #ff3b1d" : "1px solid #26262c",
            backgroundColor: activeTab === "notes" ? "rgba(255,59,29,0.12)" : "#17171b",
            color: activeTab === "notes" ? "#ff3b1d" : "#a19f95",
            transition: "all 0.2s",
          }}
        >
          📖 Deep High-Yield Notes &amp; Derivations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quiz")}
          className="font-mono"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "quiz" ? "1px solid #ff3b1d" : "1px solid #26262c",
            backgroundColor: activeTab === "quiz" ? "rgba(255,59,29,0.12)" : "#17171b",
            color: activeTab === "quiz" ? "#ff3b1d" : "#a19f95",
            transition: "all 0.2s",
          }}
        >
          🎯 Daily Diagnostic Quiz ({data.quiz.length} Qs)
        </button>
      </div>

      {/* Tab 1: 60-Second Exam Summary */}
      {activeTab === "summary" && (
        <div style={{ backgroundColor: "#08080a", border: "1px solid #26262c", borderRadius: "10px", padding: "20px" }}>
          <h3
            className="font-mono"
            style={{ fontSize: "12px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase", marginBottom: "12px" }}
          >
            High-Yield Exam Takeaways (Must Memorize)
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "18px", color: "#f3f1ea" }}>
            {data.summary.map((point, idx) => (
              <li key={idx} style={{ fontSize: "14px", lineHeight: 1.6 }}>
                <RichMathMarkdown content={point} />
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className="pmu-btn-primary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              Read Full Worked Derivation →
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className="pmu-btn-secondary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              Take 3-Question Quiz →
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Deep High-Yield Notes */}
      {activeTab === "notes" && (
        <div style={{ backgroundColor: "#08080a", border: "1px solid #26262c", borderRadius: "10px", padding: "24px" }}>
          <RichMathMarkdown content={data.notesMarkdown} />
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #26262c", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
              Ready to verify what you learned?
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className="pmu-btn-primary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              Start Diagnostic Quiz →
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Diagnostic Quiz */}
      {activeTab === "quiz" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {data.quiz.map((q, qIndex) => {
            const isAnswered = quizSubmitted[q.id];
            const selectedIdx = quizAnswers[q.id];
            const isCorrect = selectedIdx === q.correctIndex;

            return (
              <div
                key={q.id}
                style={{
                  backgroundColor: "#08080a",
                  border: isAnswered
                    ? isCorrect
                      ? "1px solid rgba(34, 197, 94, 0.4)"
                      : "1px solid rgba(239, 68, 68, 0.4)"
                    : "1px solid #26262c",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span className="pmu-badge">Question {qIndex + 1} of {data.quiz.length}</span>
                  {isAnswered && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: isCorrect ? "#4ade80" : "#ef4444",
                      }}
                    >
                      {isCorrect ? "✓ Correct (+15 XP)" : "✕ Incorrect"}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "15px", color: "#f3f1ea", marginBottom: "14px", lineHeight: 1.6 }}>
                  <RichMathMarkdown content={q.question} />
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedIdx === oIdx;
                    let optBg = "#111114";
                    let optBorder = "#26262c";
                    let optColor = "#f3f1ea";

                    if (isAnswered) {
                      if (oIdx === q.correctIndex) {
                        optBg = "rgba(34, 197, 94, 0.15)";
                        optBorder = "#22c55e";
                        optColor = "#4ade80";
                      } else if (isSelected && !isCorrect) {
                        optBg = "rgba(239, 68, 68, 0.15)";
                        optBorder = "#ef4444";
                        optColor = "#f87171";
                      }
                    } else if (isSelected) {
                      optBg = "rgba(255, 59, 29, 0.12)";
                      optBorder = "#ff3b1d";
                      optColor = "#ff3b1d";
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        disabled={isAnswered}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          borderRadius: "6px",
                          border: `1px solid ${optBorder}`,
                          backgroundColor: optBg,
                          color: optColor,
                          cursor: isAnswered ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "14px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "4px",
                            backgroundColor: "#17171b",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <RichMathMarkdown content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isAnswered ? (
                  <button
                    type="button"
                    onClick={() => handleCheckQuestion(q)}
                    disabled={selectedIdx === undefined}
                    className="pmu-btn-primary"
                    style={{
                      fontSize: "12px",
                      padding: "8px 16px",
                      opacity: selectedIdx === undefined ? 0.5 : 1,
                      cursor: selectedIdx === undefined ? "not-allowed" : "pointer",
                    }}
                  >
                    Check Answer →
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 16px",
                      backgroundColor: "#111114",
                      borderRadius: "6px",
                      borderLeft: `3px solid ${isCorrect ? "#22c55e" : "#ef4444"}`,
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: isCorrect ? "#4ade80" : "#ef4444",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Step-by-Step LaTeX Explanation:
                    </span>
                    <div style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.5 }}>
                      <RichMathMarkdown content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isCompleted && (
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="font-display" style={{ fontSize: "18px", color: "#4ade80", textTransform: "uppercase" }}>
                  🎉 Daily Capsule Completed!
                </span>
                <p style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                  Score: {score} / {data.quiz.length} • You have earned +50 XP and updated your study streak.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "6px 14px",
                  backgroundColor: "#22c55e",
                  color: "#08080a",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Review Summary
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
