"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSyllabusPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("am101");
  const [file, setFile] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [loading, setLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const subjects = [
    { id: "e1111111-1111-4111-8111-111111111111", code: "AM101", title: "Applied Computational Mathematics" },
    { id: "e2222222-2222-4222-8222-222222222222", code: "CS101", title: "Python Programming & Algorithmic Thinking" },
    { id: "e3333333-3333-4333-8333-333333333333", code: "EE101", title: "Basic Electrical & Electronics Engineering" },
    { id: "e4444444-4444-4444-8444-444444444444", code: "CS102", title: "Computer Organisation and Architecture" },
  ];

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    try {
      const subjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
      const formData = new FormData();
      formData.append("subjectId", subjectObj.id);
      if (file) formData.append("file", file);
      if (syllabusText.trim()) formData.append("extractedText", syllabusText.trim());

      const res = await fetch("/api/prepmeup/admin/syllabus/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to process syllabus.");
      }

      setExtractedData(data.data.extractedStructure);
      setStatusMsg({ type: "success", text: "Syllabus successfully parsed by Gemini AI! Review the modules below." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!extractedData) return;
    setCommitLoading(true);
    setStatusMsg(null);

    try {
      const subjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
      const res = await fetch("/api/prepmeup/admin/syllabus/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subjectObj.id,
          structure: extractedData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to commit curriculum.");
      }

      setStatusMsg({ type: "success", text: "Curriculum committed directly to live database! Topics are now active." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setCommitLoading(false);
    }
  };

  const updateModuleTitle = (mIdx: number, newTitle: string) => {
    const updated = { ...extractedData };
    updated.modules[mIdx].title = newTitle;
    setExtractedData(updated);
  };

  const updateTopicTitle = (mIdx: number, tIdx: number, newTitle: string) => {
    const updated = { ...extractedData };
    updated.modules[mIdx].topics[tIdx].title = newTitle;
    setExtractedData(updated);
  };

  return (
    <div className="pmu-page" style={{ minHeight: "100vh", background: "#08080a", color: "#f3f1ea", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <Link href="/prepmeup/admin" style={{ color: "#ff6a3d", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              ← Back to Admin Console
            </Link>
            <h1 style={{ fontFamily: "var(--font-anton, sans-serif)", fontSize: "36px", letterSpacing: "0.02em", margin: "8px 0 0" }}>
              Syllabus PDF Extractor & Curriculum Builder
            </h1>
            <p style={{ color: "#807f78", margin: "4px 0 0", fontSize: "15px" }}>
              Upload university syllabus PDF or paste text. Gemini 2.5 Flash extracts modules, unit topics, and reference texts into verified structure.
            </p>
          </div>
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

        <div style={{ display: "grid", gridTemplateColumns: extractedData ? "1fr 1fr" : "1fr", gap: "28px" }}>
          {/* Uploader Card */}
          <div
            style={{
              background: "#111114",
              border: "1px solid rgba(243,241,234,0.12)",
              borderRadius: "14px",
              padding: "28px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 20px" }}>1. Upload or Paste Syllabus</h2>

            <form onSubmit={handleExtract}>
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "8px" }}>
                  Target University Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#17171b",
                    border: "1px solid rgba(243,241,234,0.15)",
                    borderRadius: "8px",
                    color: "#f3f1ea",
                    fontSize: "14px",
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "8px" }}>
                  Syllabus Document (PDF or TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#17171b",
                    border: "1px dashed rgba(243,241,234,0.2)",
                    borderRadius: "8px",
                    color: "#807f78",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "8px" }}>
                  Or Paste Raw Syllabus Text
                </label>
                <textarea
                  rows={8}
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  placeholder="Paste module titles, topics, textbooks, and credit distribution here..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#17171b",
                    border: "1px solid rgba(243,241,234,0.15)",
                    borderRadius: "8px",
                    color: "#f3f1ea",
                    fontSize: "13px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? "#555" : "linear-gradient(135deg, #ff3b1d, #ff6a3d)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Extracting with Gemini AI..." : "Extract Curriculum Hierarchy"}
              </button>
            </form>
          </div>

          {/* Extraction Review Column */}
          {extractedData && (
            <div
              style={{
                background: "#111114",
                border: "1px solid rgba(243,241,234,0.12)",
                borderRadius: "14px",
                padding: "28px",
                maxHeight: "750px",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>2. AI Extraction Review</h2>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={commitLoading}
                  style={{
                    padding: "8px 16px",
                    background: "#22c55e",
                    color: "#08080a",
                    fontWeight: 700,
                    borderRadius: "6px",
                    border: "none",
                    cursor: commitLoading ? "not-allowed" : "pointer",
                    fontSize: "13px",
                  }}
                >
                  {commitLoading ? "Committing..." : "Approve & Commit to DB"}
                </button>
              </div>

              <p style={{ color: "#807f78", fontSize: "13px", marginBottom: "20px" }}>
                You can edit module titles and unit names directly before saving.
              </p>

              {extractedData.modules?.map((mod: any, mIdx: number) => (
                <div
                  key={mIdx}
                  style={{
                    background: "#17171b",
                    padding: "16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    border: "1px solid rgba(243,241,234,0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: "rgba(255,59,29,0.15)",
                        color: "#ff6a3d",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Module {mod.moduleNumber}
                    </span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        background: "#08080a",
                        border: "1px solid rgba(243,241,234,0.12)",
                        borderRadius: "6px",
                        color: "#f3f1ea",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div style={{ paddingLeft: "12px", borderLeft: "2px solid rgba(243,241,234,0.1)" }}>
                    {mod.topics?.map((top: any, tIdx: number) => (
                      <div key={tIdx} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0" }}>
                        <span style={{ fontSize: "12px", color: "#807f78", minWidth: "45px" }}>
                          Topic {top.topicNumber}:
                        </span>
                        <input
                          type="text"
                          value={top.title}
                          onChange={(e) => updateTopicTitle(mIdx, tIdx, e.target.value)}
                          style={{
                            flex: 1,
                            padding: "4px 8px",
                            background: "#111114",
                            border: "1px solid rgba(243,241,234,0.08)",
                            borderRadius: "4px",
                            color: "#f3f1ea",
                            fontSize: "12px",
                          }}
                        />
                        <span style={{ fontSize: "11px", color: "#807f78" }}>{top.estimatedReadingMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
