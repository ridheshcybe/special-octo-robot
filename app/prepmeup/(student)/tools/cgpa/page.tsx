"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GRADE_POINT_MAP, SEMESTER_1_DEFAULT_SUBJECTS } from "../../../_lib/academicConstants";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";

interface SubjectRow {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface SemesterEntry {
  id: string;
  semLabel: string;
  credits: number;
  sgpa: number;
}

export default function SgpaAndCgpaCalculatorPage() {
  const [mode, setMode] = useState<"sgpa" | "cgpa">("sgpa");

  // --- SGPA State ---
  const [subjects, setSubjects] = useState<SubjectRow[]>(() =>
    SEMESTER_1_DEFAULT_SUBJECTS.map((s, i) => ({
      id: `init-${i}`,
      name: s.name,
      credits: s.credits,
      grade: s.defaultGrade,
    }))
  );
  const [newSubName, setNewSubName] = useState("");
  const [newSubCredits, setNewSubCredits] = useState<number>(4);
  const [newSubGrade, setNewSubGrade] = useState<string>("A+");

  // --- Multi-Semester CGPA State ---
  const [pastSemesters, setPastSemesters] = useState<SemesterEntry[]>([
    { id: "sem-2", semLabel: "Semester 2 (Projected / Target)", credits: 20, sgpa: 9.1 },
  ]);
  const [includeSem1FromAbove, setIncludeSem1FromAbove] = useState(true);

  const pointsLookup = useMemo(() => {
    const map = new Map<string, number>();
    GRADE_POINT_MAP.forEach((g) => map.set(g.grade, g.points));
    return map;
  }, []);

  const { sgpaNum, sgpaFormatted, totalCredits, totalGradePoints } = useMemo(() => {
    let credSum = 0;
    let pointsSum = 0;

    subjects.forEach((sub) => {
      const pts = pointsLookup.get(sub.grade) ?? 0;
      const c = Number(sub.credits) || 0;
      credSum += c;
      pointsSum += c * pts;
    });

    const num = credSum > 0 ? pointsSum / credSum : 0;
    return {
      sgpaNum: num,
      sgpaFormatted: num.toFixed(2),
      totalCredits: credSum,
      totalGradePoints: pointsSum,
    };
  }, [subjects, pointsLookup]);

  const { cgpaFormatted, cgpaTotalCredits, cgpaWeightedSum } = useMemo(() => {
    let credSum = includeSem1FromAbove ? totalCredits : 0;
    let weightedSum = includeSem1FromAbove ? totalCredits * sgpaNum : 0;

    pastSemesters.forEach((sem) => {
      const c = Number(sem.credits) || 0;
      const g = Math.min(10, Math.max(0, Number(sem.sgpa) || 0));
      credSum += c;
      weightedSum += c * g;
    });

    const cgpa = credSum > 0 ? weightedSum / credSum : 0;
    return {
      cgpaFormatted: cgpa.toFixed(2),
      cgpaTotalCredits: credSum,
      cgpaWeightedSum: weightedSum.toFixed(1),
    };
  }, [includeSem1FromAbove, totalCredits, sgpaNum, pastSemesters]);

  const updateSubject = (id: string, field: "credits" | "grade" | "name", val: string | number) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newSubName.trim() || `Course #${subjects.length + 1}`;
    setSubjects((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: label,
        credits: Number(newSubCredits) || 3,
        grade: newSubGrade,
      },
    ]);
    setNewSubName("");
  };

  const resetToDefault = () => {
    setSubjects(
      SEMESTER_1_DEFAULT_SUBJECTS.map((s, i) => ({
        id: `reset-${i}-${Date.now()}`,
        name: s.name,
        credits: s.credits,
        grade: s.defaultGrade,
      }))
    );
  };

  const addSemesterRow = () => {
    const nextNum = pastSemesters.length + 2;
    setPastSemesters((prev) => [
      ...prev,
      {
        id: `sem-${Date.now()}`,
        semLabel: `Semester ${nextNum}`,
        credits: 20,
        sgpa: 8.8,
      },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">🎯 10-Point AICTE Relative Grading</span>
            <Link
              href="/prepmeup/tools/rank-percentile"
              className="font-mono"
              style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none", fontWeight: 700 }}
            >
              Switch to Rank &amp; Percentile Predictor →
            </Link>
          </div>
          <Link href="/prepmeup" className="font-mono" style={{ fontSize: "12px", color: "#a19f95", textDecoration: "none" }}>
            ← Back to PrepMeUp Home
          </Link>
        </div>

        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 0.96,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          SGPA &amp; Cumulative CGPA Calculator
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "680px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Compute your exact Semester 1 SGPA from course credits and letter grades, or switch to the Multi-Semester CGPA tab to project your cumulative B.Tech GPA.
        </p>

        {/* Mode Switcher Tabs */}
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setMode("sgpa")}
            className={mode === "sgpa" ? "pmu-btn-primary" : "pmu-btn-secondary"}
          >
            1. Semester SGPA Calculator (Live: {sgpaFormatted})
          </button>
          <button
            type="button"
            onClick={() => setMode("cgpa")}
            className={mode === "cgpa" ? "pmu-btn-primary" : "pmu-btn-secondary"}
          >
            2. Multi-Semester Cumulative CGPA (Live: {cgpaFormatted})
          </button>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Left 2 Columns: Interactive Course / Semester Rows */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "20px" }}>
          {mode === "sgpa" ? (
            <div className="pmu-card" style={{ padding: "26px" }}>
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
                  <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                    Subject Credits &amp; Grade Mapping
                  </h2>
                  <p style={{ fontSize: "12px", color: "#a19f95", marginTop: "4px" }}>
                    Change any credit value or letter grade dropdown below — your SGPA updates instantaneously.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="pmu-btn-secondary"
                  style={{ padding: "7px 14px", fontSize: "11px" }}
                >
                  ↺ Reset Default Subjects
                </button>
              </div>

              {/* Subject Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {subjects.map((s, idx) => {
                  const pts = pointsLookup.get(s.grade) ?? 0;
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "8px",
                        border: "1px solid #26262c",
                        backgroundColor: "#08080a",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                        <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", fontWeight: 700 }}>
                          0{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateSubject(s.id, "name", e.target.value)}
                          className="pmu-input"
                          style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600 }}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        {/* Credits Select */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", textTransform: "uppercase" }}>
                            Credits:
                          </span>
                          <select
                            value={s.credits}
                            onChange={(e) => updateSubject(s.id, "credits", Number(e.target.value))}
                            className="pmu-input font-mono"
                            style={{ width: "74px", padding: "7px 10px", fontSize: "12px" }}
                          >
                            {[1, 2, 3, 4, 5, 6].map((c) => (
                              <option key={c} value={c}>
                                {c} Cr
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Grade Select */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", textTransform: "uppercase" }}>
                            Grade:
                          </span>
                          <select
                            value={s.grade}
                            onChange={(e) => updateSubject(s.id, "grade", e.target.value)}
                            className="pmu-input font-mono"
                            style={{
                              width: "125px",
                              padding: "7px 10px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#ff3b1d",
                              borderColor: "rgba(255,59,29,0.4)",
                            }}
                          >
                            {GRADE_POINT_MAP.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.grade} ({g.points} pts)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Earned Points Pill */}
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "11px",
                            color: "#4ade80",
                            backgroundColor: "rgba(34,197,94,0.1)",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            minWidth: "58px",
                            textAlign: "center",
                          }}
                        >
                          {s.credits * pts} pts
                        </span>

                        {/* Remove Row */}
                        <button
                          type="button"
                          onClick={() => removeSubject(s.id)}
                          style={{
                            height: "30px",
                            width: "30px",
                            borderRadius: "6px",
                            border: "1px solid #26262c",
                            backgroundColor: "#17171b",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          title="Remove subject"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Subject Form */}
              <form
                onSubmit={addSubject}
                style={{
                  marginTop: "22px",
                  paddingTop: "18px",
                  borderTop: "1px solid #26262c",
                }}
              >
                <span className="pmu-label">Add Elective / Lab Course</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. Engineering Workshop / AI Lab"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="pmu-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <select
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="pmu-input font-mono"
                    style={{ width: "110px" }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>
                        {c} Credits
                      </option>
                    ))}
                  </select>
                  <select
                    value={newSubGrade}
                    onChange={(e) => setNewSubGrade(e.target.value)}
                    className="pmu-input font-mono"
                    style={{ width: "120px" }}
                  >
                    {GRADE_POINT_MAP.map((g) => (
                      <option key={g.grade} value={g.grade}>
                        {g.grade} ({g.points} pts)
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="pmu-btn-primary" style={{ padding: "10px 18px" }}>
                    + Add Subject
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Multi-Semester CGPA Calculator View */
            <div className="pmu-card" style={{ padding: "26px" }}>
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
                  <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                    Multi-Semester Cumulative CGPA Planner
                  </h2>
                  <p style={{ fontSize: "12px", color: "#a19f95", marginTop: "4px" }}>
                    Combine your Semester 1 SGPA with target or completed semesters to compute your cumulative B.Tech CGPA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSemesterRow}
                  className="pmu-btn-primary"
                  style={{ padding: "8px 14px", fontSize: "11px" }}
                >
                  + Add Semester
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Auto-linked Semester 1 Row */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,59,29,0.4)",
                    backgroundColor: "rgba(255,59,29,0.06)",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 700, color: "#f3f1ea" }}>
                    <input
                      type="checkbox"
                      checked={includeSem1FromAbove}
                      onChange={(e) => setIncludeSem1FromAbove(e.target.checked)}
                    />
                    <span>Semester 1 (Linked from Subject SGPA Tab)</span>
                  </label>
                  <div className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", fontWeight: 700 }}>
                    {totalCredits} Credits • SGPA: {sgpaFormatted}
                  </div>
                </div>

                {/* Additional Semesters */}
                {pastSemesters.map((sem) => (
                  <div
                    key={sem.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "8px",
                      border: "1px solid #26262c",
                      backgroundColor: "#08080a",
                    }}
                  >
                    <input
                      type="text"
                      value={sem.semLabel}
                      onChange={(e) =>
                        setPastSemesters((prev) =>
                          prev.map((x) => (x.id === sem.id ? { ...x, semLabel: e.target.value } : x))
                        )
                      }
                      className="pmu-input"
                      style={{ flex: 1, minWidth: "180px", fontSize: "13px", fontWeight: 600 }}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                        Credits:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={sem.credits}
                        onChange={(e) =>
                          setPastSemesters((prev) =>
                            prev.map((x) => (x.id === sem.id ? { ...x, credits: Number(e.target.value) } : x))
                          )
                        }
                        className="pmu-input font-mono"
                        style={{ width: "80px" }}
                      />

                      <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                        SGPA:
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={10}
                        value={sem.sgpa}
                        onChange={(e) =>
                          setPastSemesters((prev) =>
                            prev.map((x) => (x.id === sem.id ? { ...x, sgpa: Number(e.target.value) } : x))
                          )
                        }
                        className="pmu-input font-mono"
                        style={{ width: "90px", color: "#ff3b1d", fontWeight: 700 }}
                      />

                      <button
                        type="button"
                        onClick={() => setPastSemesters((prev) => prev.filter((x) => x.id !== sem.id))}
                        style={{
                          height: "32px",
                          width: "32px",
                          borderRadius: "6px",
                          border: "1px solid #26262c",
                          backgroundColor: "#17171b",
                          color: "#f87171",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mathematical Formula Card (LaTeX Rendered) */}
          <div className="pmu-card" style={{ padding: "22px" }}>
            <RichMathMarkdown
              content={`### Governing AICTE SGPA & CGPA Equations
$$\\text{SGPA} = \\frac{\\sum_{i=1}^{n} (C_i \\cdot G_i)}{\\sum_{i=1}^{n} C_i}, \\qquad \\text{CGPA} = \\frac{\\sum_{k=1}^{m} (\\text{Credits}_k \\cdot \\text{SGPA}_k)}{\\sum_{k=1}^{m} \\text{Credits}_k}$$`}
            />
          </div>
        </div>

        {/* Right Column: Live Scorecard & Grade Reference */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="pmu-card-highlight" style={{ padding: "26px" }}>
            <span className="pmu-badge">
              {mode === "sgpa" ? "Live Semester 1 SGPA" : "Live Cumulative CGPA"}
            </span>

            <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span className="font-display" style={{ fontSize: "64px", lineHeight: 1, color: "#f3f1ea" }}>
                {mode === "sgpa" ? sgpaFormatted : cgpaFormatted}
              </span>
              <span className="font-mono" style={{ fontSize: "16px", color: "#807f78" }}>
                / 10.00
              </span>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid #26262c",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                <span>Semester 1 SGPA:</span>
                <strong className="font-mono" style={{ color: "#f3f1ea" }}>{sgpaFormatted} ({totalCredits} Cr)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                <span>Cumulative CGPA:</span>
                <strong className="font-mono" style={{ color: "#ff6a3d" }}>{cgpaFormatted} ({cgpaTotalCredits} Cr)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                <span>Total Credit Points:</span>
                <strong className="font-mono" style={{ color: "#4ade80" }}>
                  {mode === "sgpa" ? totalGradePoints : cgpaWeightedSum} pts
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "rgba(255,59,29,0.14)",
                border: "1px solid rgba(255,59,29,0.35)",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#ff3b1d",
              }}
            >
              {Number(mode === "sgpa" ? sgpaFormatted : cgpaFormatted) >= 9.0
                ? "🌟 Dean's Honor Roll Distinction"
                : Number(mode === "sgpa" ? sgpaFormatted : cgpaFormatted) >= 8.0
                ? "✨ First Class With Distinction"
                : "✓ Good Academic Standing"}
            </div>
          </div>

          {/* 10-Point Grade Scale Reference */}
          <div className="pmu-card" style={{ padding: "22px" }}>
            <h3 className="font-display" style={{ fontSize: "18px", textTransform: "uppercase", color: "#f3f1ea", marginBottom: "12px" }}>
              AICTE 10-Point Grade Scale
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {GRADE_POINT_MAP.map((g) => (
                <div
                  key={g.grade}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    paddingBottom: "6px",
                    borderBottom: "1px solid rgba(243,241,234,0.06)",
                  }}
                >
                  <strong className="font-mono" style={{ color: "#f3f1ea", width: "36px" }}>{g.grade}</strong>
                  <span style={{ color: "#a19f95", flex: 1 }}>{g.description}</span>
                  <span className="font-mono" style={{ color: "#ff3b1d", fontWeight: 700 }}>{g.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
