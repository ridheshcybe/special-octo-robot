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
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/quizzes")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setQuizzes(data.quizzes || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">⚡ Adaptive Exam Arena</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
            B.Tech CSE AI/ML • Semester 1
          </span>
        </div>
        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          Topic-Wise Quiz Arena
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "680px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Practice timed challenges, numerical calculation problems, and Python coding tests. Every submission generates an instant confirmation receipt, error diagnostics, and step-by-step LaTeX faculty solutions.
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
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="pmu-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span className="pmu-badge">{q.quiz_type.replace("_", " ")}</span>
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

                <Link href={`/prepmeup/quizzes/${q.id}`} className="pmu-btn-primary" style={{ width: "100%" }}>
                  Enter Quiz Arena →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
