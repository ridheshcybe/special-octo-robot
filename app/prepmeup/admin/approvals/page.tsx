"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";

interface ApprovalItem {
  id: string;
  itemType: "lesson" | "quiz" | "question" | "ai_draft";
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  instructorSlug: string;
  title: string;
  summary: string;
  submittedAt: string;
  status: "pending_review" | "approved" | "published" | "rejected";
  reviewComments?: string;
}

export default function AdminApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/approvals");
      const data = await res.json();
      if (res.ok && data.ok) {
        setItems(data.items || []);
      } else {
        setErrorMsg(data.error || "Failed to load approval queue.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to connect to approval service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReview = async (
    itemId: string,
    action: "approve" | "reject" | "publish",
    comments = ""
  ) => {
    setActionLoadingId(itemId);
    try {
      const res = await fetch("/api/prepmeup/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action, comments }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? data.item : item))
        );
      } else {
        alert(data.error || "Failed to update item status.");
      }
    } catch (err: any) {
      alert(err.message || "Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType !== "all" && item.itemType !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = items.filter((i) => i.status === "pending_review").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="pmu-card" style={{ padding: "26px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">🛡️ Faculty &amp; AI Content Governance</span>
            <span className="font-mono" style={{ fontSize: "11px", color: pendingCount > 0 ? "#ff6a3d" : "#4ade80" }}>
              {pendingCount} Item{pendingCount === 1 ? "" : "s"} Requiring Review
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/prepmeup/admin" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
              ← Admin Dashboard
            </Link>
            <Link href="/prepmeup/admin/quizzes" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
              Manage Quizzes
            </Link>
          </div>
        </div>

        <h1
          className="font-display"
          style={{
            marginTop: "14px",
            fontSize: "clamp(28px, 4vw, 40px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          Curriculum &amp; AI Approval Queue
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "700px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          In accordance with the PrepMeUp AI pedagogical rules, all instructor lessons, quiz questions, and AI-synthesized derivations remain in draft status until verified and approved by the lead administrator.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.4)",
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "#fca5a5",
            fontSize: "13px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="pmu-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Filter by Type:
          </span>
          {["all", "lesson", "quiz", "question", "ai_draft"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className="font-mono"
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                borderRadius: "4px",
                border: filterType === t ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: filterType === t ? "rgba(255,59,29,0.15)" : "#08080a",
                color: filterType === t ? "#ff6a3d" : "#a19f95",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
            Status:
          </span>
          {["all", "pending_review", "approved", "published", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className="font-mono"
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                borderRadius: "4px",
                border: filterStatus === s ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: filterStatus === s ? "rgba(255,59,29,0.15)" : "#08080a",
                color: filterStatus === s ? "#ff6a3d" : "#a19f95",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <InteractiveWaitLoader
          title="Loading Approval Submissions…"
          subtitle="Fetching instructor submissions and AI synthesis drafts."
        />
      ) : filteredItems.length === 0 ? (
        <div
          className="pmu-card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#807f78",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
          <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase" }}>
            No Matching Submissions Found
          </h3>
          <p style={{ fontSize: "13px", marginTop: "6px" }}>
            All items have been reviewed or no items match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredItems.map((item) => {
            const isPending = item.status === "pending_review";
            const isApproved = item.status === "approved";
            const isPublished = item.status === "published";
            const isActionLoading = actionLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="pmu-card"
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  border: isPending
                    ? "1px solid rgba(255,106,61,0.4)"
                    : isPublished
                    ? "1px solid rgba(74,222,128,0.3)"
                    : "1px solid #26262c",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="pmu-badge font-mono" style={{ textTransform: "uppercase" }}>
                      {item.itemType.replace("_", " ")}
                    </span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      Course: {item.courseTitle}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          item.status === "published"
                            ? "rgba(74,222,128,0.2)"
                            : item.status === "approved"
                            ? "rgba(59,130,246,0.2)"
                            : item.status === "rejected"
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(255,106,61,0.2)",
                        color:
                          item.status === "published"
                            ? "#4ade80"
                            : item.status === "approved"
                            ? "#60a5fa"
                            : item.status === "rejected"
                            ? "#f87171"
                            : "#ff6a3d",
                      }}
                    >
                      {item.status.toUpperCase().replace("_", " ")}
                    </span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase" }}>
                    {item.title}
                  </h3>
                  <p style={{ marginTop: "6px", fontSize: "13.5px", lineHeight: 1.6, color: "#a19f95" }}>
                    {item.summary}
                  </p>
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#807f78" }}>
                    Submitted by: <strong style={{ color: "#f3f1ea" }}>{item.instructorName}</strong>
                  </div>
                </div>

                {item.reviewComments && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "#0d0d10",
                      border: "1px dashed #26262c",
                      fontSize: "12px",
                      color: "#a19f95",
                    }}
                  >
                    <strong>Review Note:</strong> {item.reviewComments}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid #1f1f24" }}>
                  {item.status !== "published" && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReview(item.id, "publish", "Verified and published to student curriculum.")}
                      className="pmu-btn-primary"
                      style={{ padding: "6px 14px", fontSize: "11.5px" }}
                    >
                      {isActionLoading ? "Processing…" : "🚀 Approve & Publish Live"}
                    </button>
                  )}

                  {item.status === "pending_review" && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReview(item.id, "approve", "Approved by lead admin.")}
                      className="pmu-btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "11.5px" }}
                    >
                      ✓ Approve (Keep Draft)
                    </button>
                  )}

                  {item.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => {
                        const note = prompt("Enter reason for rejection or revisions required:");
                        if (note !== null) {
                          handleReview(item.id, "reject", note || "Requires pedagogical revision.");
                        }
                      }}
                      className="pmu-btn-secondary"
                      style={{
                        padding: "6px 14px",
                        fontSize: "11.5px",
                        borderColor: "rgba(239,68,68,0.4)",
                        color: "#f87171",
                      }}
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
