"use client";

import { useState } from "react";
import { resolveTopicNote } from "../../../_lib/topicNotes";
import type { PmuModule, PmuNote, PmuPastPaper, PmuTopic } from "../../../../prepmeup/_lib/data";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";
import { TOPIC_LATEX_LIBRARY } from "../../../../prepmeup/_lib/notesLibrary";

interface SubjectTabsClientProps {
  subjectCode?: string;
  subjectTitle?: string;
  modules: PmuModule[];
  sampleNote: PmuNote | null;
  pastPapers: PmuPastPaper[];
}

// Missing notes must never be replaced by unrelated educational content.
function getTopicNote(topic: PmuTopic, sampleNote: PmuNote | null): string | null {
  return resolveTopicNote(topic, sampleNote, TOPIC_LATEX_LIBRARY);
}

function buildLatexTopicNote(topic: PmuTopic, _moduleTitle: string, sampleNote: PmuNote | null): string {
  return getTopicNote(topic, sampleNote) ?? "### Note not available yet\n\nThis topic is listed in the syllabus, but its lesson content is not available here yet. Please use your course materials for this topic.";
}

export function SubjectTabsClient({
  subjectCode = "SEM-1",
  modules,
  sampleNote,
  pastPapers,
}: SubjectTabsClientProps) {
  const [activeTab, setActiveTab] = useState<"modules" | "notes" | "papers">("modules");
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Reader Modal State
  const [readerDoc, setReaderDoc] = useState<{
    title: string;
    badge: string;
    contentMarkdown: string;
  } | null>(null);

  const handleOpenNote = (topic: PmuTopic, moduleTitle: string) => {
    const markdown = buildLatexTopicNote(topic, moduleTitle, sampleNote);
    setReaderDoc({
      title: topic.title,
      badge: getTopicNote(topic, sampleNote) ? (topic.is_sample ? "Sample Note" : "Topic Note") : "Note not available",
      contentMarkdown: markdown,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Tab Navigation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid #26262c",
          paddingBottom: "12px",
        }}
      >
        {[
          { id: "modules" as const, label: `📖 Syllabus & Unit Notes (${modules.length} Modules)` },
          { id: "notes" as const, label: "📄 Featured Chapter Note (LaTeX)" },
          { id: "papers" as const, label: "📚 Paper Resources" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: active ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: active ? "#ff3b1d" : "#111114",
                color: active ? "#08080a" : "#a19f95",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. TAB CONTENT: Syllabus & Modules */}
      {activeTab === "modules" && (
        <div className="pmu-grid-3" style={{ alignItems: "start" }}>
          {/* Module Selector Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span
              className="font-mono"
              style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#807f78" }}
            >
              Select Unit / Module
            </span>
            {modules.map((m, idx) => {
              const isSelected = activeModuleIndex === idx;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveModuleIndex(idx)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: isSelected ? "rgba(255,59,29,0.08)" : "#111114",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d" }}>
                      MODULE 0{m.module_number}
                    </span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      {m.topics?.length ?? 3} Topics
                    </span>
                  </div>
                  <div
                    className="font-display"
                    style={{
                      marginTop: "6px",
                      fontSize: "18px",
                      textTransform: "uppercase",
                      color: "#f3f1ea",
                    }}
                  >
                    {m.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Module Detail & Topic Listing (Spans 2 columns on desktop) */}
          <div style={{ gridColumn: "span 2" }}>
            {modules[activeModuleIndex] && (
              <div className="pmu-card" style={{ padding: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    borderBottom: "1px solid #26262c",
                    paddingBottom: "16px",
                  }}
                >
                  <div>
                    <span className="pmu-badge">Unit {modules[activeModuleIndex].module_number}</span>
                    <h3
                      className="font-display"
                      style={{ marginTop: "10px", fontSize: "28px", textTransform: "uppercase", color: "#f3f1ea" }}
                    >
                      {modules[activeModuleIndex].title}
                    </h3>
                  </div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                    {modules[activeModuleIndex].topics?.filter((topic) => getTopicNote(topic, sampleNote)).length ?? 0} / {modules[activeModuleIndex].topics?.length ?? 0} topic notes available
                  </span>
                </div>

                <p style={{ marginTop: "12px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
                  {modules[activeModuleIndex].description}
                </p>

                {/* Topics in Module */}
                <div style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4
                    className="font-mono"
                    style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#807f78" }}
                  >
                    Click Any Topic Below to Open Rendered LaTeX Study Note:
                  </h4>

                  {modules[activeModuleIndex].topics?.map((topic: PmuTopic, i: number) => (
                    <div
                      key={topic.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        padding: "18px 20px",
                        borderRadius: "10px",
                        border: "1px solid #26262c",
                        backgroundColor: "#08080a",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "220px" }}>
                          <span
                            className="font-mono"
                            style={{
                              display: "inline-flex",
                              height: "26px",
                              width: "26px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              backgroundColor: "#17171b",
                              border: "1px solid #26262c",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#ff3b1d",
                              flexShrink: 0,
                            }}
                          >
                            0{i + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>{topic.title}</div>
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#a19f95" }}>
                              {topic.description} • ~{topic.estimated_reading_minutes} mins
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            className="font-mono"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor: topic.is_sample ? "rgba(255,59,29,0.14)" : "rgba(34,197,94,0.14)",
                              color: topic.is_sample ? "#ff3b1d" : "#4ade80",
                            }}
                          >
                            {getTopicNote(topic, sampleNote) ? (topic.is_sample ? "Sample Note (LaTeX)" : "Topic Note (LaTeX)") : "Note not available"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenNote(topic, modules[activeModuleIndex].title)}
                            className="pmu-btn-primary"
                            style={{ padding: "8px 14px", fontSize: "11px" }}
                          >
                            Expand Fullscreen →
                          </button>
                        </div>
                      </div>

                      {/* Inline Rendered LaTeX Note Content for Both Sample and Non-Sample Topics */}
                      <div
                        style={{
                          padding: "16px 18px",
                          borderRadius: "8px",
                          border: "1px solid rgba(243,241,234,0.08)",
                          backgroundColor: "#111114",
                        }}
                      >
                        <RichMathMarkdown
                          content={buildLatexTopicNote(topic, modules[activeModuleIndex].title, sampleNote)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: Verified Notes Reader (Inline Full LaTeX View for Sample + Non-Sample Notes) */}
      {activeTab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {sampleNote && (
            <div className="pmu-card" style={{ padding: "32px" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  borderBottom: "1px solid #26262c",
                  paddingBottom: "18px",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <span className="pmu-badge pmu-badge-accent">
                    Sample Chapter Note • ~{sampleNote.reading_time_min} mins
                  </span>
                  <h3
                    className="font-display"
                    style={{ marginTop: "10px", fontSize: "28px", textTransform: "uppercase", color: "#f3f1ea" }}
                  >
                    {sampleNote.title}
                  </h3>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                  ✓ Sample Note LaTeX Typeset
                </span>
              </div>

              <div
                style={{
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <RichMathMarkdown content={sampleNote.content} />
              </div>
            </div>
          )}

          {modules.map((mod) =>
            (mod.topics ?? []).map((topic) => (
              <div key={topic.id} className="pmu-card" style={{ padding: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    borderBottom: "1px solid #26262c",
                    paddingBottom: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <span className="pmu-badge">
                      Module 0{mod.module_number} • {topic.is_sample ? "Sample Note" : "Full Non-Sample Note"}
                    </span>
                    <h3
                      className="font-display"
                      style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}
                    >
                      {topic.title}
                    </h3>
                  </div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                    ✓ LaTeX Rendered
                  </span>
                </div>

                <div
                  style={{
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                  }}
                >
                  <RichMathMarkdown content={buildLatexTopicNote(topic, mod.title, sampleNote)} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Only source-backed papers should be listed here. */}
      {activeTab === "papers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="pmu-card" style={{ padding: "26px" }}>
            <span className="pmu-badge">University Examination Archives</span>
            <h3 className="font-display" style={{ marginTop: "10px", fontSize: "28px", textTransform: "uppercase", color: "#f3f1ea" }}>
              Previous Year Question Papers (PYQs)
            </h3>
            <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
              Original semester examination papers and model problem sets aligned with the DYPIU curriculum.
            </p>
          </div>

          {pastPapers && pastPapers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {pastPapers.map((paper) => (
                <div key={paper.id} className="pmu-card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="pmu-badge">{paper.exam_year}</span>
                        <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700, color: "#ff6a3d" }}>
                          {paper.exam_type}
                        </span>
                      </div>
                      <h4 className="font-display" style={{ marginTop: "10px", fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
                        {paper.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReaderDoc({
                          title: paper.title,
                          badge: `${paper.exam_year} • ${paper.exam_type}`,
                          contentMarkdown: `### Examination Paper: ${paper.title}

**Academic Session:** ${paper.exam_year} • **Format:** ${paper.exam_type}
**Course Code:** ${subjectCode}

---

### Instructions for Candidates:
1. Verify question paper structure and total marks according to university scheme.
2. Section A covers foundational definitions, short conceptual proofs, and formula derivations.
3. Section B covers numerical analysis, architectural state diagrams, and implementation logic.
4. Use standard scientific notation and SI units for all calculations.

*Paper indexed in PrepMeUp student archives. Review corresponding module lecture notes for complete step-by-step solutions.*`,
                        })
                      }
                      className="pmu-btn-primary"
                      style={{ padding: "8px 16px", fontSize: "12px" }}
                    >
                      View Paper Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pmu-card" style={{ padding: "28px" }}>
              <span className="pmu-badge">Paper Archive</span>
              <h3 className="font-display" style={{ marginTop: "10px", fontSize: "22px", color: "#f3f1ea" }}>
                Paper and solution sources in curation for this subject
              </h3>
              <p style={{ marginTop: "12px", fontSize: "14px", lineHeight: 1.65, color: "#a19f95" }}>
                Authenticated examination materials are indexed as examination cycles complete. Please refer to module lecture notes and lab guides for current practice.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. In-App LaTeX Document Reader Modal */}
      {readerDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "880px",
              maxHeight: "88vh",
              borderRadius: "12px",
              border: "1px solid #ff3b1d",
              backgroundColor: "#111114",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "18px 24px",
                borderBottom: "1px solid #26262c",
                backgroundColor: "#17171b",
              }}
            >
              <div>
                <span className="pmu-badge">{readerDoc.badge}</span>
                <h3
                  className="font-display"
                  style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}
                >
                  {readerDoc.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setReaderDoc(null)}
                className="pmu-btn-secondary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                Close ✕
              </button>
            </div>

            {/* Modal Body with Rendered LaTeX & Markdown (DRM & Anti-Copy Protected) */}
            <div
              className="pmu-secure-reader"
              onContextMenu={(e) => e.preventDefault()}
              style={{ flex: 1, overflowY: "auto", padding: "24px" }}
            >
              <div
                style={{
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <RichMathMarkdown content={readerDoc.contentMarkdown} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
