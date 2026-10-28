"use client";

import React, { useState, useEffect } from "react";
import type { DailyNoteData } from "@/lib/prepmeup/dailyNotes";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

const SUBJECTS = [
  { code: "CSE1001", title: "Applied Computational Mathematics" },
  { code: "CSE1002", title: "Basic Electrical & Electronics Engineering" },
  { code: "CSE1003", title: "Computer Organization & Architecture" },
  { code: "CSE1004", title: "Fundamental Web Technologies" },
  { code: "CSE1005", title: "Python for Engineers" },
  { code: "CSE1006", title: "Indian Knowledge Systems" },
];

const PRESET_TOPICS = [
  {
    topic: "Booth's Multiplication Algorithm with Step-by-Step Register Trace",
    code: "CSE1003",
    title: "Computer Organization & Architecture",
  },
  {
    topic: "Cayley-Hamilton Theorem & Matrix Inverse Shortcut",
    code: "CSE1001",
    title: "Applied Computational Mathematics",
  },
  {
    topic: "Series Resonance, Quality Factor (Q) & Bandwidth in RLC Circuits",
    code: "CSE1002",
    title: "Basic Electrical & Electronics Engineering",
  },
  {
    topic: "IEEE-754 32-bit Single Precision Conversion with Bias 127",
    code: "CSE1003",
    title: "Computer Organization & Architecture",
  },
  {
    topic: "Python Generators, Yield Expression & Memory Optimization",
    code: "CSE1005",
    title: "Python for Engineers",
  },
  {
    topic: "Vedic Nikhilam Sutra & Ancient Indian Metallurgy (Wootz Steel)",
    code: "CSE1006",
    title: "Indian Knowledge Systems",
  },
];

export function DailyCapsuleAdminStudio() {
  const [topic, setTopic] = useState("");
  const [subjectCode, setSubjectCode] = useState("CSE1001");
  const [subjectTitle, setSubjectTitle] = useState("Applied Computational Mathematics");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<DailyNoteData | null>(null);
  const [activeDailyNote, setActiveDailyNote] = useState<DailyNoteData | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewTab, setPreviewTab] = useState<"summary" | "notes" | "quiz">("summary");

  const loadActiveNote = async () => {
    try {
      const res = await fetch("/api/prepmeup/daily-note");
      const json = await res.json();
      if (json.ok && json.data) {
        setActiveDailyNote(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    loadActiveNote();
  }, []);

  const handleSelectSubject = (code: string) => {
    const s = SUBJECTS.find((sub) => sub.code === code);
    if (s) {
      setSubjectCode(s.code);
      setSubjectTitle(s.title);
    }
  };

  const handleSelectPreset = (p: typeof PRESET_TOPICS[0]) => {
    setTopic(p.topic);
    setSubjectCode(p.code);
    setSubjectTitle(p.title);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setStatusMsg({ type: "error", text: "Please enter a topic to generate a daily note." });
      return;
    }

    setIsGenerating(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/prepmeup/admin/daily-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic: topic.trim(),
          subjectCode,
          subjectTitle,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setGeneratedNote(json.data);
        setStatusMsg({
          type: "success",
          text: `Generated daily capsule for "${json.data.topic}"! Review below and click "Broadcast to All Students".`,
        });
      } else {
        throw new Error(json.error || "Failed to generate daily note");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to generate note" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedNote) return;

    setIsPublishing(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/prepmeup/admin/daily-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          data: generatedNote,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setActiveDailyNote(json.data);
        setStatusMsg({
          type: "success",
          text: "🚀 Capsule published and broadcast to all students! The notification banner is now active across the platform.",
        });
      } else {
        throw new Error(json.error || "Failed to publish daily note");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to publish note" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="pmu-card-highlight"
      style={{
        borderRadius: "16px",
        padding: "26px 30px",
        border: "1px solid rgba(255, 59, 29, 0.4)",
        backgroundColor: "#111114",
        marginBottom: "28px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#ff3b1d",
              boxShadow: "0 0 10px #ff3b1d",
            }}
          />
          <h2
            className="font-display"
            style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea", margin: 0 }}
          >
            🔥 Daily High-Yield Capsule &amp; Broadcast Hub
          </h2>
        </div>

        {activeDailyNote && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
              Currently Active:
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "#4ade80",
                backgroundColor: "rgba(34,197,94,0.12)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              {activeDailyNote.topic}
            </span>
          </div>
        )}
      </div>

      <p style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.6, marginBottom: "20px" }}>
        Tell the AI any topic from DYPIU Semester 1 curriculum. The system instantly drafts high-yield LaTeX notes, a worked numerical proof, 3 diagnostic quiz questions, and a 60-second summary, and broadcasts a global alert to all student dashboards.
      </p>

      {/* Status Alert */}
      {statusMsg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "18px",
            fontSize: "13px",
            backgroundColor: statusMsg.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            color: statusMsg.type === "success" ? "#4ade80" : "#f87171",
            border: `1px solid ${statusMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Topic Input & Subject Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
          <div>
            <label className="pmu-label">Target Subject</label>
            <select
              value={subjectCode}
              onChange={(e) => handleSelectSubject(e.target.value)}
              className="pmu-input"
              style={{ marginTop: "4px", width: "100%" }}
            >
              {SUBJECTS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}: {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pmu-label">Topic / Concept to Generate</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Booth's Multiplication Algorithm or Cayley-Hamilton Theorem"
              className="pmu-input"
              style={{ marginTop: "4px", width: "100%" }}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
            Quick DYPIU High-Yield Presets:
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
            {PRESET_TOPICS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "1px solid #26262c",
                  backgroundColor: "#17171b",
                  color: "#a19f95",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p.code}: {p.topic.slice(0, 32)}…
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="pmu-btn-primary"
            style={{
              padding: "10px 22px",
              fontSize: "13px",
              opacity: isGenerating || !topic.trim() ? 0.6 : 1,
              cursor: isGenerating || !topic.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isGenerating ? "⚡ Generating High-Yield Capsule via Groq AI…" : "⚡ Generate Daily Note, Quiz & Summary with AI →"}
          </button>
        </div>
      </div>

      {/* Generated Preview & Broadcast Action */}
      {generatedNote && (
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            backgroundColor: "#08080a",
            borderRadius: "10px",
            border: "1px solid #26262c",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <span className="pmu-badge">Generated Preview</span>
              <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", marginTop: "6px" }}>
                {generatedNote.topic}
              </h3>
              <p className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                {generatedNote.subjectCode} • {generatedNote.subjectTitle} • ⏱️ {generatedNote.readTimeMinutes} Min Read
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#ff3b1d",
                color: "#08080a",
                fontWeight: 700,
                fontSize: "12px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                cursor: isPublishing ? "not-allowed" : "pointer",
                boxShadow: "0 0 16px rgba(255, 59, 29, 0.4)",
              }}
            >
              {isPublishing ? "Publishing…" : "🚀 Broadcast to All Students (+50 XP Drop) →"}
            </button>
          </div>

          {/* Preview Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #26262c", paddingBottom: "10px", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setPreviewTab("summary")}
              className="font-mono"
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                borderRadius: "4px",
                backgroundColor: previewTab === "summary" ? "rgba(255,59,29,0.12)" : "transparent",
                color: previewTab === "summary" ? "#ff3b1d" : "#807f78",
                border: previewTab === "summary" ? "1px solid #ff3b1d" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              60s Summary ({generatedNote.summary.length})
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("notes")}
              className="font-mono"
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                borderRadius: "4px",
                backgroundColor: previewTab === "notes" ? "rgba(255,59,29,0.12)" : "transparent",
                color: previewTab === "notes" ? "#ff3b1d" : "#807f78",
                border: previewTab === "notes" ? "1px solid #ff3b1d" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              Full LaTeX Notes
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("quiz")}
              className="font-mono"
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                borderRadius: "4px",
                backgroundColor: previewTab === "quiz" ? "rgba(255,59,29,0.12)" : "transparent",
                color: previewTab === "quiz" ? "#ff3b1d" : "#807f78",
                border: previewTab === "quiz" ? "1px solid #ff3b1d" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              Quiz Questions ({generatedNote.quiz.length})
            </button>
          </div>

          {previewTab === "summary" && (
            <ul style={{ paddingLeft: "18px", color: "#f3f1ea", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {generatedNote.summary.map((s, idx) => (
                <li key={idx}><RichMathMarkdown content={s} /></li>
              ))}
            </ul>
          )}

          {previewTab === "notes" && (
            <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "8px" }}>
              <RichMathMarkdown content={generatedNote.notesMarkdown} />
            </div>
          )}

          {previewTab === "quiz" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {generatedNote.quiz.map((q, idx) => (
                <div key={q.id} style={{ padding: "12px", backgroundColor: "#111114", borderRadius: "6px", border: "1px solid #26262c" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f3f1ea", marginBottom: "8px" }}>
                    Q{idx + 1}: <RichMathMarkdown content={q.question} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px", color: "#a19f95" }}>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "4px",
                          backgroundColor: oIdx === q.correctIndex ? "rgba(34,197,94,0.12)" : "#17171b",
                          border: oIdx === q.correctIndex ? "1px solid #22c55e" : "1px solid #26262c",
                          color: oIdx === q.correctIndex ? "#4ade80" : "#a19f95",
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. <RichMathMarkdown content={opt} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
