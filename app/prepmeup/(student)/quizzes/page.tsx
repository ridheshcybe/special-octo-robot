"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  quiz_type: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  subject_title?: string;
  module_number?: number;
  is_free_preview?: boolean;
  track?: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<"btech-cse-aiml" | "quantum-computing">("btech-cse-aiml");

  useEffect(() => {
    setLoading(true);
    const url =
      selectedTrack === "quantum-computing"
        ? "/api/prepmeup/quizzes?track=quantum-computing"
        : "/api/prepmeup/quizzes";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setQuizzes(data.quizzes || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedTrack]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">⚡ Adaptive Exam Arena</span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
              {selectedTrack === "quantum-computing" ? "Track: Quantum Computing Foundations" : "Track: B.Tech CSE AI/ML • Semester 1"}
            </span>
          </div>

          {/* Track Switcher */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setSelectedTrack("btech-cse-aiml")}
              className="font-mono"
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "6px",
                border: selectedTrack === "btech-cse-aiml" ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: selectedTrack === "btech-cse-aiml" ? "rgba(255,59,29,0.15)" : "#08080a",
                color: selectedTrack === "btech-cse-aiml" ? "#ff6a3d" : "#807f78",
                cursor: "pointer",
              }}
            >
              B.Tech CSE AI/ML
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrack("quantum-computing")}
              className="font-mono"
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "6px",
                border: selectedTrack === "quantum-computing" ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: selectedTrack === "quantum-computing" ? "rgba(255,59,29,0.15)" : "#08080a",
                color: selectedTrack === "quantum-computing" ? "#ff6a3d" : "#807f78",
                cursor: "pointer",
              }}
            >
              ⚛️ Quantum Computing (5 Quizzes)
            </button>
          </div>
        </div>

        <h1
          className="font-display"
          style={{
            marginTop: "16px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          {selectedTrack === "quantum-computing" ? "Quantum Assessment Arena" : "Topic-Wise Quiz Arena"}
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "680px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          {selectedTrack === "quantum-computing"
            ? "Assess your mastery of single & multi-qubit systems, entanglement, Qiskit quantum algorithms, and error mitigation. Complete all 5 module assessments to qualify for certificate issuance."
            : "Practice timed challenges, numerical calculation problems, and Python coding tests. Every submission generates an instant confirmation receipt, error diagnostics, and step-by-step LaTeX faculty solutions."}
        </p>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <InteractiveWaitLoader
          title="Loading Quiz Arena Challenges…"
          subtitle="Flip a rapid revision flashcard or test the logic gate while quizzes load!"
        />
      ) : (
        <div className="pmu-grid-3">
          {quizzes.map((q) => {
            const isQuantum = q.track === "quantum-computing";
            const isFree = Boolean(q.is_free_preview);

            return (
              <div
                key={q.id}
                className="pmu-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "20px",
                  border: isFree ? "1px solid rgba(74,222,128,0.35)" : "1px solid #26262c",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className="pmu-badge">{q.quiz_type.replace("_", " ")}</span>
                      {isQuantum && isFree && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(74,222,128,0.2)",
                            color: "#4ade80",
                            fontWeight: 700,
                          }}
                        >
                          FREE PREVIEW
                        </span>
                      )}
                      {isQuantum && !isFree && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(255,59,29,0.15)",
                            color: "#ff6a3d",
                            fontWeight: 700,
                          }}
                        >
                          LOCKED • ENROLLED ONLY
                        </span>
                      )}
                    </div>
                    <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700, color: "#ff6a3d" }}>
                      ⏱ {q.duration_minutes} Mins
                    </span>
                  </div>

                  <h3
                    className="font-display"
                    style={{
                      marginTop: "14px",
                      fontSize: "22px",
                      lineHeight: 1.15,
                      textTransform: "uppercase",
                      color: "#f3f1ea",
                    }}
                  >
                    {q.title}
                  </h3>
                  <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
                    {q.description}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid #26262c", paddingTop: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#a19f95",
                      marginBottom: "14px",
                    }}
                  >
                    <span>
                      Max Marks: <strong style={{ color: "#f3f1ea" }}>{q.total_marks}</strong>
                    </span>
                    <span>
                      Passing: <strong style={{ color: "#4ade80" }}>{q.passing_marks} Marks</strong>
                    </span>
                  </div>

                  <Link
                    href={`/prepmeup/quizzes/${q.id}`}
                    className={isFree || !isQuantum ? "pmu-btn-primary" : "pmu-btn-secondary"}
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    {isFree
                      ? "Take Free Diagnostic Quiz →"
                      : isQuantum
                      ? "Enter Quantum Assessment →"
                      : "Enter Quiz Arena →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
