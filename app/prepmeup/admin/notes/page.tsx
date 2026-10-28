"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NoteItem {
  id: string;
  title: string;
  topic_id: string;
  reading_time_min: number;
  is_sample: boolean;
  is_published: boolean;
  status: string;
  content_markdown?: string;
  topic?: { title: string };
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Partial<NoteItem> | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/notes");
      const data = await res.json();
      if (data.ok) {
        setNotes(data.notes || []);
      }
    } catch {
      // Dev mode fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setSaveLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/prepmeup/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: editingNote.topic_id || "f1111111-1111-4111-8111-111111111111",
          title: editingNote.title || "Untitled Note",
          contentMarkdown: editingNote.content_markdown || "",
          readingTimeMin: editingNote.reading_time_min || 15,
          isSample: Boolean(editingNote.is_sample),
          isPublished: Boolean(editingNote.is_published),
          status: editingNote.status || "published",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save note.");
      }

      setStatusMsg({ type: "success", text: "Note saved successfully!" });
      setEditingNote(null);
      fetchNotes();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSaveLoading(false);
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
              Academic Notes Manager
            </h1>
            <p style={{ color: "#807f78", margin: "4px 0 0", fontSize: "15px" }}>
              Author, edit markdown notes, toggle free sample previews, and manage publication status across curriculum units.
            </p>
          </div>

          <button
            onClick={() =>
              setEditingNote({
                title: "",
                content_markdown: "# Title\n\n## 1. Core Concept\n\nContent here...",
                reading_time_min: 15,
                is_sample: false,
                is_published: true,
                status: "published",
                topic_id: "f1111111-1111-4111-8111-111111111111",
              })
            }
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
            + Create New Note
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
          <div style={{ padding: "40px", textAlign: "center", color: "#807f78" }}>Loading published notes...</div>
        ) : notes.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              background: "#111114",
              borderRadius: "14px",
              border: "1px dashed rgba(243,241,234,0.15)",
            }}
          >
            <p style={{ color: "#f3f1ea", fontSize: "16px", fontWeight: 600 }}>No custom notes created yet.</p>
            <p style={{ color: "#807f78", fontSize: "14px", maxWidth: "450px", margin: "8px auto 20px" }}>
              Publish approved AI drafts or write custom faculty markdown notes directly with KaTeX formulas.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {notes.map((n) => (
              <div
                key={n.id}
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
                        background: n.is_published ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
                        color: n.is_published ? "#4ade80" : "#facc15",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {n.is_published ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                    {n.is_sample && (
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(59,130,246,0.2)",
                          color: "#60a5fa",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        FREE SAMPLE
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{n.title}</h3>
                  <p style={{ color: "#807f78", fontSize: "12px", margin: 0 }}>
                    Reading Time: ~{n.reading_time_min} mins
                  </p>
                </div>

                <button
                  onClick={() => setEditingNote(n)}
                  style={{
                    padding: "8px 16px",
                    background: "#17171b",
                    border: "1px solid rgba(243,241,234,0.2)",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Edit Note →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Note Editor Drawer */}
        {editingNote && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "720px",
              maxWidth: "92vw",
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
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Note Markdown Editor</h2>
              <button
                onClick={() => setEditingNote(null)}
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

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                  Note Title
                </label>
                <input
                  type="text"
                  value={editingNote.title || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#17171b",
                    border: "1px solid rgba(243,241,234,0.15)",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                    Reading Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={editingNote.reading_time_min || 15}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, reading_time_min: parseInt(e.target.value, 10) })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#17171b",
                      border: "1px solid rgba(243,241,234,0.15)",
                      borderRadius: "6px",
                      color: "#f3f1ea",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "20px", alignItems: "center", paddingTop: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingNote.is_sample)}
                      onChange={(e) => setEditingNote({ ...editingNote, is_sample: e.target.checked })}
                    />
                    Free Sample
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingNote.is_published)}
                      onChange={(e) => setEditingNote({ ...editingNote, is_published: e.target.checked })}
                    />
                    Published Live
                  </label>
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#807f78", marginBottom: "6px" }}>
                  Markdown Content
                </label>
                <textarea
                  value={editingNote.content_markdown || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, content_markdown: e.target.value })}
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
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  style={{
                    padding: "10px 18px",
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
                  disabled={saveLoading}
                  style={{
                    padding: "10px 24px",
                    background: "#22c55e",
                    border: "none",
                    color: "#08080a",
                    borderRadius: "6px",
                    fontWeight: 700,
                    cursor: saveLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {saveLoading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
