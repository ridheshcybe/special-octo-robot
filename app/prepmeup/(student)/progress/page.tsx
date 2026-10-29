"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "../../_components/RichMathMarkdown";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";

interface ProgressStats {
  overallCompletion: number;
  averageAccuracy: number;
  totalQuizzesAttempted: number;
  studyHours: number;
  codingSubmissionsCount?: number;
  doubtsCount?: number;
  subjectsProgress: {
    code: string;
    title: string;
    completion: number;
    accuracy: number;
    status: string;
  }[];
  weakTopics: {
    topic: string;
    subject: string;
    accuracy: number;
    reviewUrl: string;
  }[];
  strongTopics: {
    topic: string;
    subject: string;
    accuracy: number;
  }[];
  recentAttempts: {
    id: string;
    quizTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    date: string;
    errorsDetected?: string[];
    explanationMarkdown?: string;
  }[];
}

export default function StudentProgressDashboard() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prepmeup/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStats(data.stats);
          if (data.stats.recentAttempts?.length > 0) {
            setExpandedAttemptId(data.stats.recentAttempts[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <InteractiveWaitLoader
        title="Computing Academic Mastery & Submission Logs…"
        subtitle="Play with the digital logic gate while your progress metrics load!"
      />
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">📈 Semester 1 Mastery Analytics</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
            ✓ Submission Error Diagnostics &amp; Explanations Enabled
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
          Academic Progress, Errors &amp; Submission Review
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "700px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Track subject completion, quiz accuracy trends, and inspect detailed error logs and step-by-step faculty derivations for every recent submission.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="pmu-grid-4">
        <div className="pmu-card" style={{ padding: "22px" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Syllabus Covered
          </span>
          <div className="font-display" style={{ fontSize: "40px", lineHeight: 1, color: "#f3f1ea", marginTop: "8px" }}>
            {stats.overallCompletion}%
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", marginTop: "6px", display: "block" }}>
            ✓ On Schedule
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "22px" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Average Accuracy
          </span>
          <div className="font-display" style={{ fontSize: "40px", lineHeight: 1, color: "#ff6a3d", marginTop: "8px" }}>
            {stats.averageAccuracy}%
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}>
            Across all submissions
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "22px" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Quizzes Completed
          </span>
          <div className="font-display" style={{ fontSize: "40px", lineHeight: 1, color: "#f3f1ea", marginTop: "8px" }}>
            {stats.totalQuizzesAttempted < 10 ? `0${stats.totalQuizzesAttempted}` : stats.totalQuizzesAttempted}
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}>
            Graded &amp; archived
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "22px" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Study Hours Logged
          </span>
          <div className="font-display" style={{ fontSize: "40px", lineHeight: 1, color: "#4ade80", marginTop: "8px" }}>
            {stats.studyHours}h
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}>
            Active in-app time
          </span>
        </div>
      </div>

      {/* Subject-Wise Mastery Bars */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <h2 className="font-display" style={{ fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea" }}>
          Subject-by-Subject Mastery
        </h2>
        <p style={{ marginTop: "4px", fontSize: "13px", color: "#a19f95" }}>
          Unit completion meters and test accuracy across all 4 Semester 1 courses.
        </p>

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {stats.subjectsProgress.map((sub, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                <strong style={{ color: "#f3f1ea" }}>
                  {sub.code}: {sub.title}
                </strong>
                <span className="font-mono" style={{ fontSize: "12px", color: "#a19f95" }}>
                  {sub.completion}% Completed • <strong style={{ color: "#ff6a3d" }}>{sub.accuracy}% Accuracy</strong> ({sub.status})
                </span>
              </div>
              <div style={{ height: "8px", width: "100%", borderRadius: "9999px", backgroundColor: "#17171b", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${sub.completion}%`,
                    background: "linear-gradient(90deg, #ff3b1d, #ff6a3d)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas vs Strong Topics Grid */}
      <div className="pmu-grid-2">
        <div className="pmu-card" style={{ padding: "24px", borderColor: "rgba(239,68,68,0.4)" }}>
          <span className="pmu-badge">⚠️ Priority Revision Needed (&lt; 60% Accuracy)</span>
          <h3 className="font-display" style={{ marginTop: "10px", fontSize: "22px", textTransform: "uppercase", color: "#f87171" }}>
            Weak Areas &amp; Error Hotspots
          </h3>
          <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95" }}>
            Topics where conceptual errors were detected in recent quiz or coding submissions:
          </p>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {stats.weakTopics.length === 0 ? (
              <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a", color: "#807f78", fontSize: "13px" }}>
                ✓ No critical error hotspots detected. Continue practicing topic quizzes!
              </div>
            ) : (
              stats.weakTopics.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    backgroundColor: "#08080a",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f3f1ea" }}>{item.topic}</div>
                    <div className="font-mono" style={{ fontSize: "11px", color: "#f87171", marginTop: "2px" }}>
                      {item.subject} • {item.accuracy}% Accuracy
                    </div>
                  </div>
                  <Link href={item.reviewUrl} className="pmu-btn-secondary" style={{ padding: "7px 12px", fontSize: "11px" }}>
                    Review Notes →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pmu-card" style={{ padding: "24px", borderColor: "rgba(34,197,94,0.4)" }}>
          <span className="pmu-badge" style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
            🏆 Exam Ready (&gt; 90% Accuracy)
          </span>
          <h3 className="font-display" style={{ marginTop: "10px", fontSize: "22px", textTransform: "uppercase", color: "#4ade80" }}>
            Verified Strong Topics
          </h3>
          <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95" }}>
            High-yield topics where your submissions achieved distinction-grade accuracy:
          </p>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {stats.strongTopics.length === 0 ? (
              <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a", color: "#807f78", fontSize: "13px" }}>
                Complete topic quizzes to certify high-yield mastery areas.
              </div>
            ) : (
              stats.strongTopics.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(34,197,94,0.3)",
                    backgroundColor: "#08080a",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f3f1ea" }}>{item.topic}</div>
                    <div className="font-mono" style={{ fontSize: "11px", color: "#4ade80", marginTop: "2px" }}>
                      {item.subject}
                    </div>
                  </div>
                  <span className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80" }}>
                    {item.accuracy}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Submissions with Expandable Error Diagnostics & LaTeX Explanations */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <span className="pmu-badge">Submission Audit Log</span>
        <h2 className="font-display" style={{ marginTop: "10px", fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea" }}>
          Recent Submissions — Errors &amp; Step-by-Step Explanations
        </h2>
        <p style={{ marginTop: "4px", fontSize: "13px", color: "#a19f95" }}>
          Click any recent quiz or coding submission below to inspect flagged errors and LaTeX faculty solutions:
        </p>

        <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {stats.recentAttempts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#a19f95" }}>
              <p style={{ fontSize: "15px", marginBottom: "16px" }}>
                No quiz attempts recorded yet. Attempt a quiz or coding lab to unlock automated error diagnostics and performance analytics!
              </p>
              <Link href="/prepmeup/quizzes" className="pmu-btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                Browse Quizzes &amp; Begin Practice →
              </Link>
            </div>
          ) : (
            stats.recentAttempts.map((a) => {
              const errorsDetected = a.errorsDetected || [];
              const explanationMarkdown =
                a.explanationMarkdown ||
                (errorsDetected.length === 0
                  ? `### Verified Accurate Solution\n\nAll questions in **${a.quizTitle}** were answered correctly!`
                  : `### Solution Review\n\nReview the topic notes and practice questions to strengthen these concepts.`);
              const statusText =
                errorsDetected.length === 0
                  ? `✓ ${a.score}/${a.totalMarks} Correct • Zero Mistakes`
                  : `⚠️ ${errorsDetected.length} Error${errorsDetected.length > 1 ? "s" : ""} Flagged`;
              const isExpanded = expandedAttemptId === a.id;

              return (
                <div
                  key={a.id}
                  style={{
                    borderRadius: "10px",
                    border: isExpanded ? "1px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: "#08080a",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "16px 20px",
                      backgroundColor: "#141418",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>{a.quizTitle}</div>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#a19f95", marginTop: "4px" }}>
                        {a.date} • {statusText}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: "#f3f1ea" }}>
                        {a.score} / {a.totalMarks} Marks ({a.percentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedAttemptId(isExpanded ? null : a.id)}
                        className={isExpanded ? "pmu-btn-primary" : "pmu-btn-secondary"}
                        style={{ padding: "7px 12px", fontSize: "11px" }}
                      >
                        {isExpanded ? "Hide Review ▲" : "View Errors & Explanation ▼"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "20px", borderTop: "1px solid #26262c", display: "flex", flexDirection: "column", gap: "14px" }}>
                      {errorsDetected.length > 0 ? (
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "8px",
                            border: "1px solid rgba(239,68,68,0.4)",
                            backgroundColor: "rgba(70,8,9,0.28)",
                            color: "#fca5a5",
                            fontSize: "12.5px",
                            lineHeight: 1.6,
                          }}
                        >
                          <strong style={{ display: "block", marginBottom: "6px", color: "#f87171" }}>
                            ⚠️ Submission Errors Detected:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {errorsDetected.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid rgba(34,197,94,0.35)",
                            backgroundColor: "rgba(34,197,94,0.1)",
                            color: "#86efac",
                            fontSize: "12.5px",
                          }}
                        >
                          ✓ Zero mistakes detected in this submission! All analytical steps verified.
                        </div>
                      )}

                      <div
                        style={{
                          padding: "16px 18px",
                          borderRadius: "8px",
                          border: "1px solid #26262c",
                          borderLeft: "3px solid #ff3b1d",
                          backgroundColor: "#111114",
                        }}
                      >
                        <RichMathMarkdown content={explanationMarkdown} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
