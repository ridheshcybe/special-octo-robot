"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AdminQuizItem {
  id: string;
  title: string;
  quiz_type: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  subject?: { title: string; code: string };
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<AdminQuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("e1111111-1111-4111-8111-111111111111");
  const [duration, setDuration] = useState(15);
  const [totalMarks, setTotalMarks] = useState(5);
  const [passingMarks, setPassingMarks] = useState(3);
  const [quizType, setQuizType] = useState("topic");
  const [isPublished, setIsPublished] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/quizzes");
      const data = await res.json();
      if (data.ok) {
        setQuizzes(data.quizzes || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Mock/Service creation
    const newQuiz: AdminQuizItem = {
      id: "quiz-" + Date.now(),
      title,
      quiz_type: quizType,
      duration_minutes: duration,
      total_marks: totalMarks,
      is_published: isPublished,
      subject: { title: "Applied Computational Mathematics", code: "AM101" },
    };

    setQuizzes([newQuiz, ...quizzes]);
    setStatusMsg({ type: "success", text: "New examination quiz published successfully!" });
    setShowAddModal(false);
    setTitle("");
  };

  return (
    <div className="pmu-page" style={{ minHeight: "100vh", background: "#08080a", color: "#f3f1ea", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <Link href="/prepmeup/admin" style={{ color: "#ff6a3d", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              ← Back to Admin Console
            </Link>
            <h1 style={{ fontFamily: "var(--font-anton, sans-serif)", fontSize: "36px", letterSpacing: "0.02em", margin: "8px 0 0" }}>
              Exam Arena &amp; Quiz Manager
            </h1>
            <p style={{ color: "#807f78", margin: "4px 0 0", fontSize: "15px" }}>
              Configure timed exams, assemble questions from the question bank, and monitor cohort test performance.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #ff3b1d, #ff6a3d)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Create New Quiz
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "24px",
              border: `1px solid ${statusMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              background: statusMsg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: statusMsg.type === "success" ? "#4ade80" : "#f87171",
              fontSize: "14px",
            }}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Quizzes List */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807f78" }}>Loading quizzes...</div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {quizzes.map((q) => (
              <div
                key={q.id}
                style={{
                  background: "#111114",
                  border: "1px solid rgba(243,241,234,0.1)",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: "rgba(255,106,61,0.15)",
                        color: "#ff6a3d",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {q.quiz_type.toUpperCase()}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: q.is_published ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
                        color: q.is_published ? "#4ade80" : "#facc15",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {q.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{q.title}</h3>
                  <p style={{ color: "#807f78", fontSize: "12px", margin: 0 }}>
                    Duration: {q.duration_minutes} Mins • Total Marks: {q.total_marks}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href={`/prepmeup/quizzes/${q.id}`}
                    target="_blank"
                    style={{
                      padding: "8px 16px",
                      background: "#17171b",
                      border: "1px solid rgba(243,241,234,0.2)",
                      borderRadius: "6px",
                      color: "#f3f1ea",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: "13px",
                    }}
                  >
                    Preview Runner ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Quiz */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
            }}
          >
            <div
              style={{
                width: "520px",
                background: "#111114",
                border: "1px solid rgba(243,241,234,0.15)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px" }}>Create Timed Exam Quiz</h2>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. End-Sem Comprehensive Mock Test"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#17171b",
                      border: "1px solid rgba(243,241,234,0.15)",
                      borderRadius: "6px",
                      color: "#f3f1ea",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#17171b",
                        border: "1px solid rgba(243,241,234,0.15)",
                        borderRadius: "6px",
                        color: "#f3f1ea",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                      Quiz Type
                    </label>
                    <select
                      value={quizType}
                      onChange={(e) => setQuizType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#17171b",
                        border: "1px solid rgba(243,241,234,0.15)",
                        borderRadius: "6px",
                        color: "#f3f1ea",
                        fontSize: "13px",
                      }}
                    >
                      <option value="topic">Topic Challenge</option>
                      <option value="module">Module Test</option>
                      <option value="subject">Subject Mock</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#17171b",
                        border: "1px solid rgba(243,241,234,0.15)",
                        borderRadius: "6px",
                        color: "#f3f1ea",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#17171b",
                        border: "1px solid rgba(243,241,234,0.15)",
                        borderRadius: "6px",
                        color: "#f3f1ea",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: "10px 16px",
                      background: "transparent",
                      border: "1px solid rgba(243,241,234,0.2)",
                      color: "#807f78",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #ff3b1d, #ff6a3d)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Publish Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
