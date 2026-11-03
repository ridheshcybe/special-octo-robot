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
    track: "btech-cse-aiml",
  },
  {
    title: "Orthogonal Matrix Eigenvalue Property (|λ| = 1)",
    query: "Prove why all eigenvalues of a real orthogonal matrix Q satisfy |λ| = 1.",
    track: "btech-cse-aiml",
  },
  {
    title: "Thevenin's Theorem & Max Power Transfer Derivation",
    query: "Explain Thevenin's Theorem and derive maximum power P_max = V_th^2 / (4 * R_th).",
    track: "btech-cse-aiml",
  },
  {
    title: "Python List Comprehensions vs Standard Loops",
    query: "How does Python list comprehension compare to a standard for loop in memory allocation and bytecode execution?",
    track: "btech-cse-aiml",
  },
  {
    title: "Bloch Sphere & Polar Angles θ, ϕ Representation",
    query: "Explain single-qubit pure state representation on the Bloch sphere using polar angles theta and phi, and the Born rule measurement probability.",
    track: "quantum-computing",
  },
  {
    title: "Bell State |Φ+⟩ Synthesis with Hadamard and CNOT",
    query: "Derive step-by-step how to create the Bell state |Phi+> starting from |00> using an H gate and CNOT gate.",
    track: "quantum-computing",
  },
  {
    title: "Grover's Algorithm Phase Oracle and Diffusion Operator",
    query: "Explain Grover's search algorithm step-by-step: how the phase oracle marks the target and how the diffusion operator reflects about the mean.",
    track: "quantum-computing",
  },
  {
    title: "Qiskit 1.0 Bell State Circuit Code",
    query: "Show the Python Qiskit code to build a 2-qubit Bell state circuit, measure in computational basis, and simulate on AerSimulator.",
    track: "quantum-computing",
  },
];

export default function DoubtsPage() {
  const [threads, setThreads] = useState<DoubtThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Track switcher (B.Tech CSE AI/ML vs Quantum Computing Foundations)
  const [selectedTrack, setSelectedTrack] = useState<"btech-cse-aiml" | "quantum-computing">("btech-cse-aiml");
  const [selectedModule, setSelectedModule] = useState<number>(1);

  // Composer state
  const [queryText, setQueryText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Applied Computational Mathematics");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [feedbackState, setFeedbackState] = useState<Record<string, "helpful" | "unhelpful">>({});
  const [followUpText, setFollowUpText] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchThreads = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/prepmeup/doubts", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to load doubt history (HTTP ${res.status}).`);
      }
      if (Array.isArray(data.threads)) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !activeThreadId) {
          setActiveThreadId(data.threads[0].id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to load doubt history from storage.");
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
      if (selectedTrack === "quantum-computing") {
        const payload: Record<string, unknown> = {
          question: queryText.trim(),
          moduleNumber: selectedModule,
        };
        if (selectedImage) {
          payload.imageUrl = "data:" + imageMime + ";base64," + selectedImage;
        }

        const res = await fetch("/api/prepmeup/ai/quantum/doubt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to solve quantum doubt.");
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
              is_grounded_in_syllabus: data.data.isGrounded,
              created_at: new Date().toISOString(),
            },
          ],
        };

        setThreads([newThread, ...threads]);
        setActiveThreadId(newThread.id);
        setQueryText("");
        setSelectedImage(null);
      } else {
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
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (doubtId: string, helpful: boolean) => {
    try {
      setFeedbackState((prev) => ({
        ...prev,
        [doubtId]: helpful ? "helpful" : "unhelpful",
      }));
      await fetch("/api/prepmeup/ai/quantum/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId, helpful }),
      });
    } catch {
      // Non-blocking UI
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || !activeThreadId) return;

    setSendingFollowUp(true);
    try {
      const res = await fetch(`/api/prepmeup/ai/quantum/doubt/${activeThreadId}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: followUpText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThreadId) {
              return {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: "m-user-" + Date.now(),
                    sender_type: "student",
                    message_text: followUpText,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: "m-ai-" + Date.now(),
                    sender_type: "ai",
                    message_text: data.reply,
                    created_at: new Date().toISOString(),
                  },
                ],
              };
            }
            return t;
          })
        );
        setFollowUpText("");
      }
    } catch {
      // Ignored
    } finally {
      setSendingFollowUp(false);
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
              ) : errorMsg ? (
                <div
                  role="alert"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.45)",
                    backgroundColor: "rgba(70,8,9,0.28)",
                    fontSize: "12px",
                    color: "#fca5a5",
                  }}
                >
                  <strong style={{ display: "block", color: "#f87171", marginBottom: "4px" }}>
                    ⚠️ Storage Error
                  </strong>
                  <span>{errorMsg}</span>
                  <button
                    type="button"
                    onClick={fetchThreads}
                    className="pmu-btn-secondary"
                    style={{ marginTop: "8px", padding: "6px 10px", fontSize: "11px", width: "100%" }}
                  >
                    ↻ Retry Loading Doubts
                  </button>
                </div>
              ) : filteredThreads.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#807f78", padding: "8px 0" }}>
                  No doubts asked yet under this account. Submit a question on the right or pick a sample prompt below.
                </p>
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
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={() => setSelectedTrack("btech-cse-aiml")}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: selectedTrack === "btech-cse-aiml" ? "1px solid #ff3b1d" : "1px solid #26262c",
                  backgroundColor: selectedTrack === "btech-cse-aiml" ? "rgba(255,59,29,0.15)" : "#08080a",
                  color: selectedTrack === "btech-cse-aiml" ? "#ff6a3d" : "#807f78",
                  cursor: "pointer",
                }}
              >
                B.Tech AI/ML
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrack("quantum-computing")}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: selectedTrack === "quantum-computing" ? "1px solid #ff3b1d" : "1px solid #26262c",
                  backgroundColor: selectedTrack === "quantum-computing" ? "rgba(255,59,29,0.15)" : "#08080a",
                  color: selectedTrack === "quantum-computing" ? "#ff6a3d" : "#807f78",
                  cursor: "pointer",
                }}
              >
                ⚛️ Quantum Track
              </button>
            </div>

            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
              ⚡ Try a High-Yield {selectedTrack === "quantum-computing" ? "Quantum" : "Exam"} Prompt
            </span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {SAMPLE_PROMPTS.filter((p) => p.track === selectedTrack).map((p, idx) => (
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
                <span className="pmu-badge">
                  {selectedTrack === "quantum-computing" ? "⚛️ Quantum AI Tutor RAG" : "✓ Syllabus RAG Grounding"}
                </span>
                <h3 style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: "#f3f1ea" }}>
                  {activeThread?.title || (selectedTrack === "quantum-computing" ? "Ask a Quantum Computing Question" : "Ask a New Engineering Doubt")}
                </h3>
              </div>

              {selectedTrack === "quantum-computing" ? (
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(Number(e.target.value))}
                  className="pmu-input font-mono"
                  style={{ width: "auto", minWidth: "260px", padding: "8px 12px", fontSize: "12px" }}
                >
                  <option value={1}>Mod 1: Mathematical Foundations & Qubits</option>
                  <option value={2}>Mod 2: Quantum Gates & Circuits</option>
                  <option value={3}>Mod 3: Quantum Algorithms & Entanglement</option>
                  <option value={4}>Mod 4: Error Mitigation & Decoherence</option>
                  <option value={5}>Mod 5: Quantum Hardware & NISQ</option>
                </select>
              ) : (
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
              )}
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

                    {/* AI Feedback Thumbs */}
                    {!isStudent && activeThread && (
                      <div
                        style={{
                          marginTop: "14px",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(243,241,234,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                          Was this explanation clear &amp; rigorous?
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleFeedback(activeThread.id, true)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "4px",
                              border: feedbackState[activeThread.id] === "helpful" ? "1px solid #4ade80" : "1px solid #26262c",
                              backgroundColor: feedbackState[activeThread.id] === "helpful" ? "rgba(74,222,128,0.15)" : "#111114",
                              color: feedbackState[activeThread.id] === "helpful" ? "#4ade80" : "#a19f95",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            👍 Helpful
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(activeThread.id, false)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "4px",
                              border: feedbackState[activeThread.id] === "unhelpful" ? "1px solid #f87171" : "1px solid #26262c",
                              backgroundColor: feedbackState[activeThread.id] === "unhelpful" ? "rgba(248,113,113,0.15)" : "#111114",
                              color: feedbackState[activeThread.id] === "unhelpful" ? "#f87171" : "#a19f95",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            👎 Needs Revision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Follow-up question input if thread is active */}
              {activeThread && (
                <form
                  onSubmit={handleFollowUp}
                  style={{
                    display: "flex",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px dashed #26262c",
                    backgroundColor: "#0d0d10",
                  }}
                >
                  <input
                    type="text"
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    placeholder="Ask a quick follow-up on this doubt..."
                    className="pmu-input"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                  />
                  <button
                    type="submit"
                    disabled={sendingFollowUp || !followUpText.trim()}
                    className="pmu-btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "12px", whiteSpace: "nowrap" }}
                  >
                    {sendingFollowUp ? "..." : "Send Follow-Up ↵"}
                  </button>
                </form>
              )}

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
                  placeholder="e.g. Derive the characteristic equation det(A - λI) = 0 or paste your Python function..."
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
