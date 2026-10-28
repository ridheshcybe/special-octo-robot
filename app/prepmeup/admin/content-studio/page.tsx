"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";
import { DailyCapsuleAdminStudio } from "./_components/DailyCapsuleAdminStudio";

interface PublishedItem {
  id: string;
  contentType: "note" | "module" | "topic" | "pyq" | "quiz";
  subjectCode: string;
  subjectTitle: string;
  title: string;
  moduleNumber?: number;
  readingTimeMin?: number;
  isSample: boolean;
  contentMarkdown: string;
  publishedAt: string;
}

const TEMPLATES: Record<string, string> = {
  note: `### 1. Fundamental Definition & Axioms
Let $V$ be a vector space over field $\\mathbb{R}$. A subset $W \\subseteq V$ is a **subspace** if:

$$\\forall \\mathbf{u}, \\mathbf{v} \\in W, \\; \\forall \\alpha, \\beta \\in \\mathbb{R} \\implies \\alpha \\mathbf{u} + \\beta \\mathbf{v} \\in W$$

---

### 2. University Exam Derivation & Proof
Using the governing characteristic equation:

$$\\det(A - \\lambda I) = 0 \\implies A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$

---

### 3. Step-by-Step Python Verification
\`\`\`python
import numpy as np

A = np.array([[2, 1], [1, 2]])
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)
\`\`\``,

  module: `### Module Overview & Syllabus Structure
Unit Focus: **Linear Algebra, Matrix Decompositions & Vector Calculus**.

| Week | Lecture Topic | Key Mathematical Focus |
| :--- | :--- | :--- |
| **01** | Vector Spaces & Linear Independence | $\\text{rank}(A) + \\text{nullity}(A) = n$ |
| **02** | Eigenvalues & Diagonalization | $A\\mathbf{x} = \\lambda\\mathbf{x}$ |
| **03** | Singular Value Decomposition (SVD) | $A = U \\Sigma V^T$ |`,

  pyq: `### University Question Paper & Step-by-Step Model Solutions
**Assessment:** Winter 2025 End-Semester Examination • Max Marks: 60

#### Q1 (a) [5 Marks]: Prove Euler's Homogeneous Function Theorem
If $u = f(x, y)$ is a homogeneous function of degree $n$, then:

$$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = n u$$

**Model Solution:**
1. Let $x = tx_0$ and $y = ty_0$.
2. By definition of homogeneous functions of degree $n$:
   $$f(tx, ty) = t^n f(x, y)$$
3. Differentiating with respect to $t$ and evaluating at $t = 1$ yields the required theorem. $\\blacksquare$`,

  quiz: `### Practice Test Question
**Problem Statement:**
Given matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$, what are the eigenvalues $\\lambda_1, \\lambda_2$?

- **Option A:** $\\lambda_1 = 1, \\lambda_2 = 3$ (Correct)
- **Option B:** $\\lambda_1 = 0, \\lambda_2 = 4$
- **Option C:** $\\lambda_1 = 2, \\lambda_2 = 2$
- **Option D:** $\\lambda_1 = -1, \\lambda_2 = 5$

**Detailed Mathematical Justification:**
$$\\det(A - \\lambda I) = (2 - \\lambda)^2 - 1 = \\lambda^2 - 4\\lambda + 3 = 0 \\implies (\\lambda - 1)(\\lambda - 3) = 0$$`,
};

export default function ContentStudioPage() {
  const [contentType, setContentType] = useState<"note" | "module" | "topic" | "pyq" | "quiz">("note");
  const [subjectCode, setSubjectCode] = useState("ACM-101");
  const [subjectTitle, setSubjectTitle] = useState("Applied Computational Mathematics");
  const [title, setTitle] = useState("Singular Value Decomposition (SVD) & Matrix Decompositions");
  const [moduleNumber, setModuleNumber] = useState(1);
  const [readingTimeMin, setReadingTimeMin] = useState(20);
  const [isSample, setIsSample] = useState(true);
  const [contentMarkdown, setContentMarkdown] = useState(TEMPLATES.note);

  const [publishing, setPublishing] = useState(false);
  const [publishedItems, setPublishedItems] = useState<PublishedItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const subjectOptions = [
    { code: "ACM-101", title: "Applied Computational Mathematics" },
    { code: "PYT-102", title: "Python Programming" },
    { code: "BEE-103", title: "Basic Electrical Engineering" },
    { code: "COA-104", title: "Computer Organisation & Architecture" },
  ];

  const fetchPublished = async () => {
    try {
      const res = await fetch("/api/prepmeup/admin/content-studio");
      const json = await res.json();
      if (json.ok && json.items) {
        setPublishedItems(json.items);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPublished();
  }, []);

  const handleContentTypeChange = (type: "note" | "module" | "topic" | "pyq" | "quiz") => {
    setContentType(type);
    if (TEMPLATES[type]) {
      setContentMarkdown(TEMPLATES[type]);
    }
  };

  const handleSubjectChange = (code: string) => {
    setSubjectCode(code);
    const matched = subjectOptions.find((s) => s.code === code);
    if (matched) setSubjectTitle(matched.title);
  };

  const handleInsertSnippet = (snippet: string) => {
    setContentMarkdown((prev) => prev + "\n\n" + snippet);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentMarkdown.trim()) {
      setToastMsg({ type: "error", text: "Please enter both a title and markdown content." });
      return;
    }

    setPublishing(true);
    setToastMsg(null);

    try {
      const res = await fetch("/api/prepmeup/admin/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          subjectCode,
          subjectTitle,
          title,
          moduleNumber,
          readingTimeMin,
          isSample,
          contentMarkdown,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to publish content.");
      }

      setToastMsg({
        type: "success",
        text: `✓ "${title}" uploaded and published live! Directus CMS cache revalidated.`,
      });

      fetchPublished();
    } catch (err: any) {
      setToastMsg({ type: "error", text: err.message || "Failed to publish." });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/prepmeup/admin/content-studio?id=${id}`, { method: "DELETE" });
      setPublishedItems((prev) => prev.filter((x) => x.id !== id));
      setToastMsg({ type: "success", text: "Item removed from published live stream." });
    } catch {}
  };

  return (
    <div className="pmu-container" style={{ paddingTop: "2.5rem", paddingBottom: "4.5rem", maxWidth: "1360px" }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/prepmeup/admin" className="font-mono" style={{ fontSize: "12px", color: "#a19f95", textDecoration: "none" }}>
            ← Back to Admin Center
          </Link>
          <span style={{ color: "#26262c" }}>/</span>
          <span className="pmu-badge pmu-badge-accent">Live Content Studio</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href="https://cms.ridheshcybe.dpdns.org"
            target="_blank"
            rel="noreferrer"
            className="pmu-btn-secondary"
            style={{ padding: "6px 14px", fontSize: "11px" }}
          >
            Directus CMS ↗
          </a>
          <Link
            href="/prepmeup/subjects"
            className="pmu-btn-secondary"
            style={{ padding: "6px 14px", fontSize: "11px" }}
          >
            View Public Notes ↗
          </Link>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            textTransform: "uppercase",
            lineHeight: 1,
            color: "#f3f1ea",
          }}
        >
          Syllabus &amp; Content Studio
        </h1>
        <p style={{ marginTop: "8px", fontSize: "13.5px", color: "#a19f95", maxWidth: "780px" }}>
          Author, typeset, and preview engineering syllabus notes, mathematical theorems, exam solutions, and quizzes with real-time LaTeX rendering before publishing live to the student portal and Directus CMS.
        </p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "14px 18px",
            borderRadius: "8px",
            border: toastMsg.type === "success" ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(239,68,68,0.4)",
            backgroundColor: toastMsg.type === "success" ? "rgba(3,46,21,0.3)" : "rgba(70,8,9,0.3)",
            color: toastMsg.type === "success" ? "#86efac" : "#fca5a5",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toastMsg.text}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: "14px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Live AI Daily Capsule Generator & Broadcast Studio */}
      <DailyCapsuleAdminStudio />

      {/* Main Studio Workspace: Form Controls + Split-Pane Editor */}
      <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Control Bar: Content Type & Subject */}
        <div
          className="pmu-card"
          style={{
            padding: "22px 26px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Content Type Selector */}
          <div>
            <label className="pmu-label">1. Select Content Type to Author</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
              {[
                { id: "note" as const, label: "📝 LaTeX Study Note" },
                { id: "module" as const, label: "📖 Syllabus Unit / Module" },
                { id: "pyq" as const, label: "📚 Solved Past Paper (PYQ)" },
                { id: "quiz" as const, label: "🎯 Practice Quiz Question" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleContentTypeChange(tab.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: contentType === tab.id ? "2px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: contentType === tab.id ? "rgba(255,59,29,0.14)" : "#08080a",
                    color: contentType === tab.id ? "#ff6a3d" : "#a19f95",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject & Metadata Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label className="pmu-label">Subject Code &amp; Title</label>
              <select
                value={subjectCode}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="pmu-input"
                style={{ fontSize: "13px" }}
              >
                {subjectOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code}: {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pmu-label">Module / Unit Number</label>
              <select
                value={moduleNumber}
                onChange={(e) => setModuleNumber(Number(e.target.value))}
                className="pmu-input font-mono"
                style={{ fontSize: "13px" }}
              >
                {[1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    Unit / Module 0{m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pmu-label">Estimated Reading / Study Time</label>
              <select
                value={readingTimeMin}
                onChange={(e) => setReadingTimeMin(Number(e.target.value))}
                className="pmu-input font-mono"
                style={{ fontSize: "13px" }}
              >
                {[10, 15, 20, 25, 30, 45].map((mins) => (
                  <option key={mins} value={mins}>
                    ~{mins} minutes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pmu-label">Access Gating</label>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#f3f1ea", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="isSample"
                    checked={isSample}
                    onChange={() => setIsSample(true)}
                  />
                  <span>Free Sample Note</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#f3f1ea", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="isSample"
                    checked={!isSample}
                    onChange={() => setIsSample(false)}
                  />
                  <span>Semester Pass (Paid)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="pmu-label">Content Title / Topic Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Eigenvalues, Cayley-Hamilton & Matrix Diagonalization"
              className="pmu-input"
              style={{ fontSize: "14px", fontWeight: 700 }}
              required
            />
          </div>
        </div>

        {/* Quick LaTeX & Snippet Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            padding: "12px 18px",
            borderRadius: "8px",
            border: "1px solid #26262c",
            backgroundColor: "#111114",
          }}
        >
          <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#807f78", textTransform: "uppercase" }}>
            Insert Snippet:
          </span>
          {[
            { label: "Display Equation $$...$$", snippet: "$$A = U \\Sigma V^T$$" },
            { label: "Fraction \\frac{a}{b}", snippet: "$$\\frac{\\partial f}{\\partial x}$$" },
            { label: "Summation \\sum", snippet: "$$\\sum_{i=1}^{n} (C_i \\cdot G_i)$$" },
            { label: "Matrix [2x2]", snippet: "$$A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$" },
            { label: "Python Code", snippet: "```python\ndef solve_matrix(a):\n    return np.linalg.det(a)\n```" },
            { label: "Derivation Table", snippet: "| Step | Formula | Status |\n| :--- | :--- | :--- |\n| **1** | $\\det(A - \\lambda I) = 0$ | Verified |" },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleInsertSnippet(s.snippet)}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid #26262c",
                backgroundColor: "#17171b",
                fontSize: "11px",
                color: "#ff6a3d",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              + {s.label}
            </button>
          ))}
        </div>

        {/* Split-Pane: Editor on Left, Live LaTeX Preview on Right */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px", alignItems: "stretch" }}>
          {/* Left Pane: Markdown / LaTeX Source Editor */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "10px",
              border: "1px solid #26262c",
              backgroundColor: "#111114",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid #26262c",
                backgroundColor: "#17171b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase" }}>
                  Source Editor
                </span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                  (Markdown + LaTeX)
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                {contentMarkdown.length} chars
              </span>
            </div>

            <textarea
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              placeholder="Write your markdown and LaTeX formulas here..."
              style={{
                width: "100%",
                minHeight: "480px",
                flex: 1,
                padding: "18px 20px",
                borderRadius: 0,
                border: "none",
                outline: "none",
                backgroundColor: "#08080a",
                color: "#f3f1ea",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                lineHeight: 1.65,
                resize: "vertical",
              }}
            />
          </div>

          {/* Right Pane: Real-Time Live LaTeX Preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "10px",
              border: "1px solid rgba(255,59,29,0.35)",
              backgroundColor: "#111114",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid #26262c",
                backgroundColor: "#17171b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" }}>
                  Live LaTeX Preview
                </span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                  (What Students See)
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: isSample ? "rgba(255,59,29,0.15)" : "rgba(34,197,94,0.15)",
                  color: isSample ? "#ff3b1d" : "#4ade80",
                  textTransform: "uppercase",
                }}
              >
                {isSample ? "Free Sample" : "Semester Pass"}
              </span>
            </div>

            <div style={{ flex: 1, padding: "24px", overflowY: "auto", minHeight: "480px", backgroundColor: "#0c0c0f" }}>
              {/* Document Header in Preview */}
              <div style={{ borderBottom: "1px solid #26262c", paddingBottom: "14px", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="pmu-badge">{subjectCode}</span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                    Unit 0{moduleNumber} • ~{readingTimeMin} mins
                  </span>
                </div>
                <h3
                  className="font-display"
                  style={{ marginTop: "10px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}
                >
                  {title || "Untitled Document"}
                </h3>
              </div>

              {/* Rendered Body */}
              <RichMathMarkdown content={contentMarkdown} />
            </div>
          </div>
        </div>

        {/* Action Button: Publish & Upload */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingTop: "12px" }}>
          <div style={{ fontSize: "12px", color: "#807f78" }}>
            🔒 Upon publishing, this content is synchronized directly into Directus CMS and deployed live to student viewers immediately.
          </div>

          <button
            type="submit"
            disabled={publishing}
            className="pmu-btn-primary"
            style={{ padding: "14px 28px", fontSize: "13px" }}
          >
            {publishing ? "Uploading & Revalidating Directus CMS…" : "🚀 Publish to Live Site & Sync Directus CMS →"}
          </button>
        </div>
      </form>

      {/* Published Content Listing / Management Table */}
      <div className="pmu-card" style={{ marginTop: "3.5rem", padding: "26px" }}>
        <div style={{ borderBottom: "1px solid #26262c", paddingBottom: "14px", marginBottom: "18px" }}>
          <h2 className="font-display" style={{ fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea" }}>
            Recently Published Content &amp; Directus Records ({publishedItems.length})
          </h2>
          <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95" }}>
            Items created or updated through the Content Studio.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {publishedItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                padding: "16px 20px",
                borderRadius: "8px",
                border: "1px solid #26262c",
                backgroundColor: "#08080a",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="pmu-badge">{item.subjectCode}</span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", fontWeight: 700 }}>
                    {item.contentType}
                  </span>
                  <strong style={{ fontSize: "14.5px", color: "#f3f1ea" }}>{item.title}</strong>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: item.isSample ? "rgba(255,59,29,0.15)" : "rgba(34,197,94,0.15)",
                      color: item.isSample ? "#ff3b1d" : "#4ade80",
                    }}
                  >
                    {item.isSample ? "Free Sample" : "Paid Pass"}
                  </span>
                </div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "#807f78" }}>
                  Published: <span className="font-mono">{new Date(item.publishedAt).toLocaleString("en-IN")}</span> • Reading Time: ~{item.readingTimeMin} mins
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  href="/prepmeup/subjects"
                  className="pmu-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "11px" }}
                >
                  View Live ↗
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    backgroundColor: "rgba(70,8,9,0.3)",
                    color: "#fca5a5",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Remove ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
