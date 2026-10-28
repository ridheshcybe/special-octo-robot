"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DraftItem {
  id: string;
  draft_type: "notes" | "questions";
  prompt_summary: string;
  status: "pending_review" | "approved" | "rejected";
  created_at: string;
  generated_content: any;
  subject?: { title: string; code: string };
  topic?: { title: string };
}

export default function AdminAiDraftsPage() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending_review");
  const [selectedDraft, setSelectedDraft] = useState<DraftItem | null>(null);
  const [editedText, setEditedText] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Generation Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubjectTitle, setGenSubjectTitle] = useState("Applied Computational Mathematics");
  const [genSubjectId, setGenSubjectId] = useState("e1111111-1111-4111-8111-111111111111");
  const [genModuleTitle, setGenModuleTitle] = useState("Module 1: Linear Algebra & Matrix Calculus");
  const [genTopicTitle, setGenTopicTitle] = useState("Eigenvalues, Eigenvectors & Spectral Decomposition");
  const [genDraftType, setGenDraftType] = useState<"notes" | "questions">("notes");
  const [genLoading, setGenLoading] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prepmeup/admin/ai-drafts?status=${filterStatus}&draftType=${filterType}`);
      const data = await res.json();
      if (data.ok) {
        setDrafts(data.drafts || []);
      }
    } catch {
      // In dev fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [filterType, filterStatus]);

  const handleOpenReview = (draft: DraftItem) => {
    setSelectedDraft(draft);
    if (draft.draft_type === "notes") {
      setEditedText(draft.generated_content.markdown || "");
    } else {
      setEditedText(JSON.stringify(draft.generated_content, null, 2));
    }
    setReviewComments("");
    setStatusMsg(null);
  };

  const handleReviewAction = async (action: "approved" | "rejected") => {
    if (!selectedDraft) return;
    setActionLoading(true);
    setStatusMsg(null);

    try {
      let finalContent: any = selectedDraft.generated_content;
      if (selectedDraft.draft_type === "notes") {
        finalContent = { ...selectedDraft.generated_content, markdown: editedText };
      } else {
        try {
          finalContent = JSON.parse(editedText);
        } catch {
          throw new Error("Invalid JSON in edited question payload.");
        }
      }

      const res = await fetch("/api/prepmeup/admin/ai-drafts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          action,
          comments: reviewComments,
          editedContent: finalContent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to process review.");
      }

      setStatusMsg({
        type: "success",
        text: `Draft has been marked as ${action.toUpperCase()}${action === "approved" ? " and published to live curriculum!" : "."}`,
      });

      setSelectedDraft(null);
      fetchDrafts();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setStatusMsg(null);

    try {
      const payload: any = {
        draftType: genDraftType,
        subjectId: genSubjectId,
        subjectTitle: genSubjectTitle,
        moduleTitle: genModuleTitle,
        topicTitle: genTopicTitle,
      };

      if (genDraftType === "questions") {
        payload.count = 5;
        payload.difficulty = "medium";
        payload.types = ["mcq_single", "numerical", "short_answer"];
      }

      const res = await fetch("/api/prepmeup/admin/ai-drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate AI draft.");
      }

      setShowGenModal(false);
      setStatusMsg({ type: "success", text: "New AI draft generated and queued for review!" });
      fetchDrafts();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="pmu-page" style={{ minHeight: "100vh", background: "#08080a", color: "#f3f1ea", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <Link href="/prepmeup/admin" style={{ color: "#ff6a3d", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              ← Back to Admin Console
            </Link>
            <h1 style={{ fontFamily: "var(--font-anton, sans-serif)", fontSize: "36px", letterSpacing: "0.02em", margin: "8px 0 0" }}>
              AI Content Drafts & Publishing Review
            </h1>
            <p style={{ color: "#807f78", margin: "4px 0 0", fontSize: "15px" }}>
              All AI-generated notes and questions enter pending review. Review, edit, and publish verified content to students.
            </p>
          </div>

          <button
            onClick={() => setShowGenModal(true)}
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
            + Generate New AI Draft
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

        {/* Filter Toolbar */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            background: "#111114",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(243,241,234,0.1)",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#807f78" }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: "#17171b",
                border: "1px solid rgba(243,241,234,0.15)",
                color: "#f3f1ea",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved & Published</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#807f78" }}>Draft Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: "#17171b",
                border: "1px solid rgba(243,241,234,0.15)",
                color: "#f3f1ea",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="all">All Types</option>
              <option value="notes">Notes Draft</option>
              <option value="questions">Questions Batch</option>
            </select>
          </div>
        </div>

        {/* Drafts List or Empty State */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807f78" }}>Loading drafts pipeline...</div>
        ) : drafts.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              background: "#111114",
              borderRadius: "14px",
              border: "1px dashed rgba(243,241,234,0.15)",
            }}
          >
            <p style={{ color: "#f3f1ea", fontSize: "16px", fontWeight: 600 }}>No drafts found for the selected filter.</p>
            <p style={{ color: "#807f78", fontSize: "14px", maxWidth: "450px", margin: "8px auto 20px" }}>
              Click &quot;Generate New AI Draft&quot; to prompt Gemini 2.5 Flash for complete university notes or verified practice questions.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              style={{
                padding: "10px 18px",
                background: "#ff3b1d",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Generate First Draft
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {drafts.map((d) => (
              <div
                key={d.id}
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
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: d.draft_type === "notes" ? "rgba(59,130,246,0.2)" : "rgba(168,85,247,0.2)",
                        color: d.draft_type === "notes" ? "#60a5fa" : "#c084fc",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {d.draft_type}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        background:
                          d.status === "approved"
                            ? "rgba(34,197,94,0.15)"
                            : d.status === "rejected"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(234,179,8,0.15)",
                        color: d.status === "approved" ? "#4ade80" : d.status === "rejected" ? "#f87171" : "#facc15",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {d.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{d.prompt_summary}</h3>
                  <p style={{ color: "#807f78", fontSize: "12px", margin: 0 }}>
                    Generated {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenReview(d)}
                  style={{
                    padding: "8px 18px",
                    background: "#17171b",
                    border: "1px solid rgba(243,241,234,0.2)",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Review &amp; Edit Drawer →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Side Review Drawer */}
        {selectedDraft && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "680px",
              maxWidth: "90vw",
              background: "#111114",
              borderLeft: "1px solid rgba(243,241,234,0.15)",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.8)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Review Draft: {selectedDraft.draft_type}</h2>
              <button
                onClick={() => setSelectedDraft(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#807f78",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#807f78", fontSize: "13px", margin: "0 0 16px" }}>
              Inspect and edit markdown formulas or answers. Approving will publish the content to the live student portal.
            </p>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              style={{
                flex: 1,
                width: "100%",
                background: "#08080a",
                border: "1px solid rgba(243,241,234,0.15)",
                borderRadius: "8px",
                color: "#f3f1ea",
                fontFamily: "monospace",
                fontSize: "13px",
                padding: "16px",
                resize: "none",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Review notes / feedback comments (optional)..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#17171b",
                  border: "1px solid rgba(243,241,234,0.15)",
                  borderRadius: "6px",
                  color: "#f3f1ea",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                disabled={actionLoading}
                onClick={() => handleReviewAction("rejected")}
                style={{
                  padding: "10px 20px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                Reject Draft
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleReviewAction("approved")}
                style={{
                  padding: "10px 24px",
                  background: "#22c55e",
                  border: "none",
                  color: "#08080a",
                  borderRadius: "6px",
                  fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading ? "Publishing..." : "Approve & Publish Live"}
              </button>
            </div>
          </div>
        )}

        {/* Modal: Generate New AI Draft */}
        {showGenModal && (
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
                width: "500px",
                background: "#111114",
                border: "1px solid rgba(243,241,234,0.15)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px" }}>Generate with Gemini 2.5 Flash</h2>

              <form onSubmit={handleGenerateNew}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Content Type
                  </label>
                  <select
                    value={genDraftType}
                    onChange={(e: any) => setGenDraftType(e.target.value)}
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
                    <option value="notes">Complete Comprehensive Notes (5-Section Rigor)</option>
                    <option value="questions">Verified Question Bank (MCQ, Numerical, Rubrics)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={genSubjectTitle}
                    onChange={(e) => setGenSubjectTitle(e.target.value)}
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

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Module Scope
                  </label>
                  <input
                    type="text"
                    value={genModuleTitle}
                    onChange={(e) => setGenModuleTitle(e.target.value)}
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

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Specific Topic
                  </label>
                  <input
                    type="text"
                    value={genTopicTitle}
                    onChange={(e) => setGenTopicTitle(e.target.value)}
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

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
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
                    disabled={genLoading}
                    style={{
                      padding: "10px 20px",
                      background: genLoading ? "#555" : "linear-gradient(135deg, #ff3b1d, #ff6a3d)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: 700,
                      cursor: genLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {genLoading ? "Generating with Gemini..." : "Generate AI Draft"}
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
