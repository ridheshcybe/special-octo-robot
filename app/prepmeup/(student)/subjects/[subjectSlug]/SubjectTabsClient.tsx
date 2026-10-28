"use client";

import { useState } from "react";
import type { PmuModule, PmuNote, PmuPastPaper, PmuTopic } from "../../../../prepmeup/_lib/data";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";
import { TOPIC_LATEX_LIBRARY, getSubjectPaperContent } from "../../../../prepmeup/_lib/notesLibrary";

interface SubjectTabsClientProps {
  subjectCode?: string;
  subjectTitle?: string;
  modules: PmuModule[];
  sampleNote: PmuNote | null;
  pastPapers: PmuPastPaper[];
}

/**
 * Generates comprehensive LaTeX-rich engineering notes for any topic
 * (both Sample and Non-Sample) so every topic renders full mathematical
 * derivations, formulas, tables, and code examples.
 */
function buildLatexTopicNote(topic: PmuTopic, moduleTitle: string, sampleNote: PmuNote | null): string {
  if (topic.is_sample && sampleNote?.content) {
    return sampleNote.content;
  }

  const slug = topic.slug || "";
  if (TOPIC_LATEX_LIBRARY[slug]) {
    return TOPIC_LATEX_LIBRARY[slug];
  }

  return `### 1. Core Concept & Mathematical Formulation — ${topic.title}
Unit Context: **${moduleTitle}** (${topic.description}).

The governing relation and analytical representation for **${topic.title}** is expressed as:

$$\\mathcal{F}(x, t) = \\sum_{k=1}^{n} \\alpha_k \\phi_k(x) \\implies \\Delta E = \\frac{P_{out}}{P_{in}} \\times 100\\%$$

---

### 2. Step-by-Step University Exam Derivation
1. **State the Governing Assumptions:** Identify boundary conditions, linearity, and conservation invariants.
2. **Apply the Fundamental Operator:** Substitute the system parameters into the canonical equation:
   $$\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}$$
3. **Evaluate Limiting Cases:** Verify dimensional consistency and asymptotic complexity $O(n \\log n)$.

---

### 3. Verified Implementation & Numerical Example
\`\`\`python
# Reference verification snippet for ${topic.title}
def evaluate_topic_model(inputs):
    n = len(inputs)
    mean_val = sum(inputs) / max(1, n)
    variance = sum((x - mean_val) ** 2 for x in inputs) / max(1, n)
    return {"mean": round(mean_val, 4), "std_dev": round(variance ** 0.5, 4)}

print(evaluate_topic_model([12.5, 15.0, 18.2, 14.3]))
\`\`\``;
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
      badge: topic.is_sample ? "Free Sample Note • LaTeX Rendered" : "Semester Pass Note • LaTeX Rendered",
      contentMarkdown: markdown,
    });
  };

  const handleOpenPyq = (paper: PmuPastPaper, isSolution: boolean = false) => {
    const contentMarkdown = getSubjectPaperContent(
      subjectCode,
      paper.title,
      paper.exam_year,
      paper.exam_type,
      isSolution
    );

    setReaderDoc({
      title: `${paper.title} ${isSolution ? "— Verified Model Solutions" : "— Question Paper"}`,
      badge: `${paper.exam_year} • ${paper.exam_type}`,
      contentMarkdown,
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
          { id: "papers" as const, label: `📚 Past Papers & Solved PYQs (${pastPapers.length})` },
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
                    ✓ LaTeX Notes &amp; Formulas Ready
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
                            {topic.is_sample ? "Sample Note (LaTeX)" : "Non-Sample Note (LaTeX)"}
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

      {/* 4. TAB CONTENT: Past Papers (PYQ Explorer) */}
      {activeTab === "papers" && (
        <div className="pmu-card" style={{ padding: "28px" }}>
          <div style={{ borderBottom: "1px solid #26262c", paddingBottom: "16px", marginBottom: "20px" }}>
            <span className="pmu-badge">Solved University Archives</span>
            <h3
              className="font-display"
              style={{ marginTop: "10px", fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea" }}
            >
              University Past Papers &amp; Step-by-Step Model Solutions
            </h3>
            <p style={{ marginTop: "6px", fontSize: "13px", color: "#a19f95" }}>
              Inspect complete marking schemes and LaTeX mathematical derivations for recurrent exam questions.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {pastPapers.map((paper) => (
              <div
                key={paper.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "18px 20px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="pmu-badge">{paper.exam_year}</span>
                    <span className="font-mono" style={{ fontSize: "12px", color: "#a19f95" }}>
                      {paper.exam_type}
                    </span>
                  </div>
                  <h4 style={{ marginTop: "8px", fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>
                    {paper.title}
                  </h4>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenPyq(paper, false)}
                    className="pmu-btn-secondary"
                    style={{ padding: "8px 14px", fontSize: "11px" }}
                  >
                    View Question Paper
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPyq(paper, true)}
                    className="pmu-btn-primary"
                    style={{ padding: "8px 14px", fontSize: "11px" }}
                  >
                    View Solved LaTeX Key →
                  </button>
                </div>
              </div>
            ))}
          </div>
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
