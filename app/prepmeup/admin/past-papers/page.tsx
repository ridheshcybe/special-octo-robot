"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PastPaperItem {
  id: string;
  exam_year: number;
  exam_type: string;
  title: string;
  file_path: string;
  solution_path?: string | null;
  is_published: boolean;
  subject?: { title: string; code: string };
}

export default function AdminPastPapersPage() {
  const [papers, setPapers] = useState<PastPaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [subjectId, setSubjectId] = useState("e1111111-1111-4111-8111-111111111111");
  const [examYear, setExamYear] = useState(2024);
  const [examType, setExamType] = useState<any>("End-Semester");
  const [title, setTitle] = useState("");
  const [filePath, setFilePath] = useState("");
  const [solutionPath, setSolutionPath] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/past-papers");
      const data = await res.json();
      if (data.ok) {
        setPapers(data.papers || []);
      }
    } catch {
      // Dev mode fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/prepmeup/admin/past-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          examYear: Number(examYear),
          examType,
          title,
          filePath: filePath || `past-papers/${subjectId}/${examYear}-${examType.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          solutionPath: solutionPath || null,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save past paper.");
      }

      setStatusMsg({ type: "success", text: "Past paper added successfully!" });
      setShowAddModal(false);
      fetchPapers();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
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
              University Past Papers (PYQ)
            </h1>
            <p style={{ color: "#807f78", margin: "4px 0 0", fontSize: "15px" }}>
              Catalog semester question papers, solution rubrics, and map questions to syllabus modules.
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
            + Upload New PYQ
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

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807f78" }}>Loading question papers...</div>
        ) : papers.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              background: "#111114",
              borderRadius: "14px",
              border: "1px dashed rgba(243,241,234,0.15)",
            }}
          >
            <p style={{ color: "#f3f1ea", fontSize: "16px", fontWeight: 600 }}>No past question papers uploaded yet.</p>
            <p style={{ color: "#807f78", fontSize: "14px", maxWidth: "450px", margin: "8px auto 20px" }}>
              Upload previous year question papers (End-Sem, MST 1, MST 2) with solution rubrics for in-app viewing.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {papers.map((p) => (
              <div
                key={p.id}
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
                      {p.exam_year} • {p.exam_type}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: p.is_published ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
                        color: p.is_published ? "#4ade80" : "#facc15",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {p.is_published ? "ACTIVE" : "DRAFT"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{p.title}</h3>
                  <p style={{ color: "#807f78", fontSize: "12px", margin: 0 }}>
                    File: {p.file_path} {p.solution_path ? "• Includes Solution Rubric" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add PYQ */}
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
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px" }}>Add University Past Paper</h2>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
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
                    <option value="e1111111-1111-4111-8111-111111111111">AM101: Applied Computational Mathematics</option>
                    <option value="e2222222-2222-4222-8222-222222222222">CS101: Python Programming</option>
                    <option value="e3333333-3333-4333-8333-333333333333">EE101: Basic Electrical Engineering</option>
                    <option value="e4444444-4444-4444-8444-444444444444">CS102: Computer Organisation and Architecture</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                      Exam Year
                    </label>
                    <input
                      type="number"
                      value={examYear}
                      onChange={(e) => setExamYear(parseInt(e.target.value, 10))}
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
                      Exam Type
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
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
                      <option value="End-Semester">End-Semester</option>
                      <option value="Mid-Semester Test 1">Mid-Semester Test 1</option>
                      <option value="Mid-Semester Test 2">Mid-Semester Test 2</option>
                      <option value="Model Paper">Model Paper</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Paper Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024 End-Semester Question Paper"
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

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Storage File Path (Private Bucket)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. past-papers/am101/2024-endsem.pdf"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
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

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    Publish immediately to students
                  </label>
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
                    disabled={submitting}
                    style={{
                      padding: "10px 20px",
                      background: submitting ? "#555" : "linear-gradient(135deg, #ff3b1d, #ff6a3d)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Saving..." : "Add Past Paper"}
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
