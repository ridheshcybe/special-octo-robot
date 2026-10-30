"use client";

import React, { useState, useEffect, useRef } from "react";
import { RichMathMarkdown } from "../../_components/RichMathMarkdown";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";
import { VideoSessionBookingForm } from "../../_components/VideoSessionBookingForm";

interface Message {
  id: string;
  sender_type: "student" | "ai";
  message_text: string;
  image_url?: string;
  extracted_ocr_text?: string;
  is_grounded_in_syllabus?: boolean;
  feedback_helpful?: boolean | null;
  created_at?: string;
}

interface DoubtThread {
  id: string;
  title: string;
  status: string;
  created_at: string;
  messages: Message[];
}

const SAMPLE_PROMPTS = [
  {
    title: "Newton-Raphson Formula & Quadratic Convergence Rate",
    query: "Derive the Newton-Raphson formula x_(n+1) = x_n - f(x_n)/f'(x_n) and state its convergence rate with proof.",
  },
  {
    title: "Orthogonal Matrix Eigenvalue Property (|λ| = 1)",
    query: "Prove why all eigenvalues of a real orthogonal matrix Q satisfy |λ| = 1.",
  },
  {
    title: "Thevenin's Theorem & Max Power Transfer Derivation",
    query: "Explain Thevenin's Theorem and derive maximum power P_max = V_th^2 / (4 * R_th).",
  },
  {
    title: "Python List Comprehensions vs Standard Loops",
    query: "How does Python list comprehension compare to a standard for loop in memory allocation and bytecode execution?",
  },
];

export default function DoubtsPage() {
  const [threads, setThreads] = useState<DoubtThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Composer state
  const [queryText, setQueryText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Applied Computational Mathematics");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/prepmeup/doubts");
      const data = await res.json();
      if (data.ok && data.threads) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !activeThreadId) {
          setActiveThreadId(data.threads[0].id);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId, sending]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit. Please upload a smaller snapshot.");
      return;
    }
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        queryText: queryText.trim(),
        subjectName: selectedSubject,
      };
      if (selectedImage) {
        payload.imageBase64 = selectedImage;
        payload.imageMimeType = imageMime;
      }

      const res = await fetch("/api/prepmeup/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to solve doubt.");
      }

      const newThread: DoubtThread = {
        id: data.data.doubtId,
        title: data.data.title,
        status: "answered",
        created_at: new Date().toISOString(),
        messages: [
          {
            id: "m-user-" + Date.now(),
            sender_type: "student",
            message_text: queryText,
            image_url: selectedImage ? "data:image/jpeg;base64," + selectedImage : undefined,
            created_at: new Date().toISOString(),
          },
          {
            id: "m-ai-" + Date.now(),
            sender_type: "ai",
            message_text: data.data.answer,
            extracted_ocr_text: data.data.extractedOcrText,
            is_grounded_in_syllabus: data.data.isGrounded,
            created_at: new Date().toISOString(),
          },
        ],
      };

      setThreads([newThread, ...threads]);
      setActiveThreadId(newThread.id);
      setQueryText("");
      setSelectedImage(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        className="pmu-card"
        style={{
          padding: "26px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">🤖 Multimodal AI Doubt Tutor</span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
              ✓ LaTeX Math &amp; Code Rendering Active
            </span>
          </div>
          <h1
            className="font-display"
            style={{
              marginTop: "10px",
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              color: "#f3f1ea",
            }}
          >
            24/7 Academic Doubt Assistant
          </h1>
          <p style={{ marginTop: "8px", maxWidth: "640px", fontSize: "13.5px", lineHeight: 1.6, color: "#a19f95" }}>
            Ask any engineering derivation, circuit theorem, or Python bug. Every request and AI solution is formatted with typeset LaTeX equations and runnable code blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowVideoModal(!showVideoModal)}
          className="pmu-btn-primary"
        >
          🎥 Book 1-on-1 Live Video Session (₹100)
        </button>
      </div>

      {/* Optional 1-on-1 Video Session Booking Drawer */}
      {showVideoModal && (
        <div className="pmu-card-highlight" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <span className="pmu-badge">₹100 / Session (45 Mins)</span>
              <h3 className="font-display" style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Reserve a 1-on-1 Live Video Doubt &amp; Mentorship Call
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="pmu-btn-secondary"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              Close ✕
            </button>
          </div>
          <div style={{ maxWidth: "480px" }}>
            <VideoSessionBookingForm />
          </div>
        </div>
      )}

      {/* Split-Pane Layout */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Left Pane: Doubt History & Quick Prompts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="pmu-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff3b1d" }}>
                Doubt History ({filteredThreads.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#4ade80",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                + New Doubt
              </button>
            </div>

            <input
              type="text"
              placeholder="Filter saved doubts…"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pmu-input"
              style={{ marginBottom: "14px", padding: "8px 12px", fontSize: "12px" }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
              {loading ? (
                <p style={{ fontSize: "12px", color: "#807f78" }}>Loading threads…</p>
              ) : (
                filteredThreads.map((t) => {
                  const isActive = activeThread?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveThreadId(t.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: isActive ? "1px solid #ff3b1d" : "1px solid #26262c",
                        backgroundColor: isActive ? "rgba(255,59,29,0.1)" : "#08080a",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
                          ✓ {t.status}
                        </span>
                        <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ marginTop: "6px", fontSize: "12.5px", fontWeight: 700, color: "#f3f1ea" }}>
                        {t.title}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Sample Prompts */}
          <div className="pmu-card" style={{ padding: "20px" }}>
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
              ⚡ Try a High-Yield Exam Prompt
            </span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQueryText(p.query)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#f3f1ea" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#a19f95", marginTop: "3px", lineHeight: 1.4 }}>
                    &ldquo;{p.query}&rdquo;
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Formatted Request/Response Thread & Composer */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="pmu-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "660px" }}>
            {/* Thread Header */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "18px 24px",
                borderBottom: "1px solid #26262c",
                backgroundColor: "#17171b",
              }}
            >
              <div>
                <span className="pmu-badge">✓ Syllabus RAG Grounding</span>
                <h3 style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: "#f3f1ea" }}>
                  {activeThread?.title || "Ask a New Engineering Doubt"}
                </h3>
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="pmu-input font-mono"
                style={{ width: "auto", minWidth: "240px", padding: "8px 12px", fontSize: "12px" }}
              >
                <option value="Applied Computational Mathematics">CSE1001: Applied Mathematics</option>
                <option value="Python Programming">CSE1005: Python Programming</option>
                <option value="Basic Electrical and Electronics Engineering">CSE1002: Basic Electrical & Electronics</option>
                <option value="Computer Organization and Architecture">CSE1003: Computer Architecture</option>
                <option value="Fundamentals of Web Technologies">CSE1004: Web Technologies</option>
                <option value="Indian Science, Engineering and Technology">CSE1006: Indian Science & Technology</option>
              </select>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {activeThread?.messages?.map((m) => {
                const isStudent = m.sender_type === "student";
                return (
                  <div
                    key={m.id}
                    style={{
                      borderRadius: "10px",
                      border: isStudent ? "1px solid rgba(255,59,29,0.45)" : "1px solid #26262c",
                      backgroundColor: isStudent ? "rgba(255,59,29,0.08)" : "#08080a",
                      padding: "20px 22px",
                    }}
                  >
                    {/* Structured Message Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(243,241,234,0.08)",
                        paddingBottom: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className="font-mono"
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            backgroundColor: isStudent ? "#ff3b1d" : "rgba(34,197,94,0.16)",
                            color: isStudent ? "#08080a" : "#4ade80",
                          }}
                        >
                          {isStudent ? "👤 Student Request" : "🤖 PrepMeUp AI Faculty Response"}
                        </span>
                        <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                          {selectedSubject}
                        </span>
                      </div>

                      {!isStudent && (
                        <span className="font-mono" style={{ fontSize: "10px", color: "#4ade80" }}>
                          ✓ Verified LaTeX Derivation
                        </span>
                      )}
                    </div>

                    {m.image_url && (
                      <div style={{ marginBottom: "14px" }}>
                        <img
                          src={m.image_url}
                          alt="Uploaded problem snapshot"
                          style={{ maxHeight: "200px", borderRadius: "8px", border: "1px solid #26262c" }}
                        />
                      </div>
                    )}

                    {/* Formatted Markdown & LaTeX Content for BOTH Request and Response */}
                    <RichMathMarkdown content={m.message_text} />
                  </div>
                );
              })}

              {/* Interactive Fun Loader When Waiting for AI Response */}
              {sending && (
                <InteractiveWaitLoader
                  compact
                  title="AI Tutor Deriving Step-by-Step Solution…"
                  subtitle="Play with the Logic Gate or flip a flashcard while your LaTeX proof is synthesized!"
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer Box */}
            <div style={{ borderTop: "1px solid #26262c", padding: "20px 24px", backgroundColor: "#141418" }}>
              {selectedImage && (
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,59,29,0.35)",
                    backgroundColor: "#08080a",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d" }}>
                    📸 Handwritten / Problem Snapshot Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    style={{ fontSize: "11px", color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    Remove ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSendQuery} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="pmu-label" style={{ marginBottom: 0 }}>
                    Your Question (Supports LaTeX `$...$` and Python code snippets)
                  </span>
                  <label
                    style={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#ff6a3d",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    📷 Attach Problem Photo
                    <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. Derive the characteristic equation det(A - \lambda I) = 0 or paste your Python function..."
                  className="pmu-input"
                  style={{ resize: "vertical", fontFamily: "var(--font-onest), sans-serif" }}
                />

                {/* Live Request Preview when typing math/code */}
                {queryText.trim().length > 0 && (queryText.includes("$") || queryText.includes("```") || queryText.includes("\\")) && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px dashed #26262c",
                      backgroundColor: "#08080a",
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
                      Live Formatted Request Preview:
                    </span>
                    <RichMathMarkdown content={queryText} />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={sending || !queryText.trim()}
                    className="pmu-btn-primary"
                    style={{ opacity: sending || !queryText.trim() ? 0.5 : 1 }}
                  >
                    {sending ? "Solving Doubt…" : "Submit Doubt & Render LaTeX Solution →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
