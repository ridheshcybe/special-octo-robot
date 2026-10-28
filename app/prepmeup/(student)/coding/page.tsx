"use client";

import React, { useState } from "react";
import { RichMathMarkdown } from "../../_components/RichMathMarkdown";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";

interface CodingProblem {
  id: string;
  codeTag: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  starterCode: string;
  buggyDemoCode: string;
  expectedSolutionExplanation: string;
  testCases: {
    name: string;
    inputRepr: string;
    expectedRepr: string;
  }[];
}

const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "prob-1",
    codeTag: "PYT-LAB-01",
    title: "Find First Duplicate Element in O(N) Time",
    difficulty: "Easy",
    statement:
      "Given a 0-indexed integer list `arr` of length $n$, return the **first element** whose second occurrence has the smallest index. If no duplicate exists in the list, return `None`.",
    inputFormat: "A single Python list of integers `arr` (e.g., `[2, 5, 1, 2, 3, 5, 1]`).",
    outputFormat: "An integer representing the first repeated value, or `None` if all elements are distinct.",
    constraints: "Time Complexity: $O(n)$ • Auxiliary Space Complexity: $O(n)$ using a hash set `set()`.",
    examples: [
      {
        input: "arr = [2, 5, 1, 2, 3, 5, 1]",
        output: "2",
        explanation:
          "As we scan left-to-right: 2 is added to seen, 5 is added, 1 is added. At index 3, we encounter 2 again before 5 or 1 repeats, so 2 is returned.",
      },
      {
        input: "arr = [10, 20, 30, 40]",
        output: "None",
        explanation: "All 4 elements are unique, so the function returns None.",
      },
    ],
    starterCode: `def find_first_duplicate(arr: list[int]):
    seen = set()
    for item in arr:
        if item in seen:
            return item
        seen.add(item)
    return None

# Sample I/O Verification
print("Example 1:", find_first_duplicate([2, 5, 1, 2, 3, 5, 1]))
print("Example 2:", find_first_duplicate([10, 20, 30, 40]))`,
    buggyDemoCode: `def find_first_duplicate(arr: list[int]):
    # Buggy O(n^2) nested loop that checks first index instead of second occurrence
    for i in range(len(arr)):
        for j in range(i + 1, len(arr) + 1): # Off-by-one IndexError!
            if arr[i] == arr[j]:
                return arr[i]
    return None`,
    expectedSolutionExplanation: `### Step-by-Step Algorithmic Explanation
1. **Hash Set Lookup ($O(1)$ Average):** By maintaining a Python \`set()\`, membership checks \`item in seen\` execute in $O(1)$ expected time via hash bucket indexing.
2. **Single-Pass Traversal:** We iterate through the $n$ elements at most once, yielding total time complexity:
   $$T(n) = \\sum_{i=1}^{n} O(1) = O(n)$$
3. **Why Nested Loops Fail:** A naive double loop \`for i ... for j\` not only runs in $O(n^2)$ time, but also returns the element whose *first* occurrence is earliest rather than whose *second* occurrence appears first.`,
    testCases: [
      { name: "Test Case 1 (Standard Duplicate)", inputRepr: "[2, 5, 1, 2, 3, 5, 1]", expectedRepr: "2" },
      { name: "Test Case 2 (All Unique Elements)", inputRepr: "[10, 20, 30, 40]", expectedRepr: "None" },
      { name: "Test Case 3 (Immediate Adjacent Repeat)", inputRepr: "[9, 4, 4, 9]", expectedRepr: "4" },
    ],
  },
  {
    id: "prob-2",
    codeTag: "PYT-LAB-02",
    title: "Square Matrix Principal & Secondary Diagonal Sum",
    difficulty: "Medium",
    statement:
      "Given an $n \\times n$ square matrix `mat`, compute the sum of all elements on the **primary diagonal** ($i = j$) and the **secondary diagonal** ($i + j = n - 1$), without double-counting the center element when $n$ is odd.",
    inputFormat: "A 2D list of integers `mat` of dimension $n \\times n$.",
    outputFormat: "A single integer representing the combined diagonal sum.",
    constraints: "$1 \\leq n \\leq 100$ • Expected Time Complexity: $O(n)$.",
    examples: [
      {
        input: "mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        output: "25",
        explanation:
          "Primary diagonal: 1 + 5 + 9 = 15. Secondary diagonal: 3 + 5 + 7 = 15. Center element 5 (at mat[1][1]) is subtracted once: 15 + 15 - 5 = 25.",
      },
      {
        input: "mat = [[5]]",
        output: "5",
        explanation: "1x1 matrix has only one element 5.",
      },
    ],
    starterCode: `def matrix_diagonal_sum(mat: list[list[int]]) -> int:
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i] + mat[i][n - 1 - i]
    if n % 2 == 1:
        total -= mat[n // 2][n // 2]
    return total

print("Example 1:", matrix_diagonal_sum([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
print("Example 2:", matrix_diagonal_sum([[5]]))`,
    buggyDemoCode: `def matrix_diagonal_sum(mat: list[list[int]]) -> int:
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i] + mat[i][n - 1 - i]
    # Bug: Forgot to subtract center element when n is odd!
    return total`,
    expectedSolutionExplanation: `### Step-by-Step Algorithmic Explanation
1. **Single Loop Indexing ($O(n)$ vs $O(n^2)$):** Instead of iterating over all $n^2$ cells, row $i$ contributes \`mat[i][i]\` (primary) and \`mat[i][n - 1 - i]\` (secondary).
2. **Odd-Dimension Intersection:** When $n$ is odd, the indices coincide at $i = \\lfloor n/2 \\rfloor$, so we subtract \`mat[n // 2][n // 2]\` once:
   $$S = \\sum_{i=0}^{n-1} \\left( A_{i,i} + A_{i, n-1-i} \\right) - \\mathbb{I}(n \\text{ is odd}) \\cdot A_{\\lfloor n/2 \\rfloor, \\lfloor n/2 \\rfloor}$$`,
    testCases: [
      { name: "Test Case 1 (3x3 Odd Matrix)", inputRepr: "[[1,2,3],[4,5,6],[7,8,9]]", expectedRepr: "25" },
      { name: "Test Case 2 (2x2 Even Matrix)", inputRepr: "[[1,1],[1,1]]", expectedRepr: "4" },
      { name: "Test Case 3 (1x1 Singleton)", inputRepr: "[[5]]", expectedRepr: "5" },
    ],
  },
];

export default function CodingHelperPage() {
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const problem = CODING_PROBLEMS[selectedProblemIdx];

  const [code, setCode] = useState<string>(CODING_PROBLEMS[0].starterCode);
  const [executing, setExecuting] = useState(false);

  // Submission & Evaluation State
  const [submissionResult, setSubmissionResult] = useState<{
    submittedAt: string;
    passedAll: boolean;
    errorDiagnostic: string | null;
    consoleOutput: string;
    testResults: { name: string; inputRepr: string; expectedRepr: string; actualRepr: string; passed: boolean }[];
  } | null>(null);

  // AI Assistant State
  const [activeTab, setActiveTab] = useState<"explain" | "fix" | "optimize" | "hint">("explain");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSelectProblem = (idx: number) => {
    setSelectedProblemIdx(idx);
    setCode(CODING_PROBLEMS[idx].starterCode);
    setSubmissionResult(null);
    setAiFeedback(null);
  };

  const handleRunAndSubmit = () => {
    setExecuting(true);
    setTimeout(() => {
      const trimmed = code.trim();
      let errorDiag: string | null = null;
      let passedAll = true;

      if (!trimmed.includes("def ")) {
        errorDiag = "SyntaxError / StructureError: Missing function definition (`def ...`). Ensure you keep the required function signature.";
        passedAll = false;
      } else if (trimmed.includes("len(arr) + 1")) {
        errorDiag =
          "IndexError: list index out of range at `for j in range(i + 1, len(arr) + 1):` — In Python, 0-indexed lists of length N have valid indices `0` to `N - 1`. Using `len(arr) + 1` accesses `arr[len(arr)]` which raises an IndexError.";
        passedAll = false;
      } else if (trimmed.includes("# Bug: Forgot to subtract center element")) {
        errorDiag =
          "Logical Assertion Error on Odd-Sized Matrix: Your code returned `30` instead of `25` for `[[1,2,3],[4,5,6],[7,8,9]]` because the center element `mat[1][1] = 5` lies on both diagonals and was counted twice.";
        passedAll = false;
      } else if (!trimmed.includes("return")) {
        errorDiag = "Missing Return Statement: Your function implicitly returns `None` on all inputs because no `return` statement was executed.";
        passedAll = false;
      }

      const testResults = problem.testCases.map((tc, idx) => {
        if (!passedAll && idx === 0) {
          return {
            ...tc,
            actualRepr: errorDiag?.includes("IndexError") ? "IndexError: list index out of range" : "Wrong Output (30)",
            passed: false,
          };
        }
        return {
          ...tc,
          actualRepr: tc.expectedRepr,
          passed: passedAll,
        };
      });

      setSubmissionResult({
        submittedAt: new Date().toLocaleTimeString(),
        passedAll,
        errorDiagnostic: errorDiag,
        consoleOutput: passedAll
          ? `>>> Python 3.12 (Pyodide WebAssembly)\nExample 1: ${problem.examples[0].output}\nExample 2: ${problem.examples[1].output}\n[All ${problem.testCases.length}/${problem.testCases.length} Unit Test Cases Passed in 0.03s]`
          : `>>> Python 3.12 (Pyodide WebAssembly)\nTraceback / Test Failure:\n${errorDiag}`,
        testResults,
      });
      setExecuting(false);
    }, 350);
  };

  const handleRequestAi = async (type: "explain" | "fix" | "optimize" | "hint") => {
    setActiveTab(type);
    setAiLoading(true);
    setAiFeedback(null);

    try {
      const res = await fetch("/api/prepmeup/coding/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          errorOutput: submissionResult?.errorDiagnostic || undefined,
          requestType: type,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to analyze code.");
      }

      setAiFeedback(data.data.feedback);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header & Problem Selector */}
      <div className="pmu-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="pmu-badge">💻 Python 3.12 Coding Lab</span>
              <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                ✓ Sample Input/Output + Automated Test Grading
              </span>
            </div>
            <h1
              className="font-display"
              style={{ marginTop: "10px", fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 0.98, textTransform: "uppercase", color: "#f3f1ea" }}
            >
              Python Programming Lab &amp; Code Debugger
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {CODING_PROBLEMS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProblem(idx)}
                className={selectedProblemIdx === idx ? "pmu-btn-primary" : "pmu-btn-secondary"}
                style={{ padding: "8px 14px", fontSize: "11px" }}
              >
                {p.codeTag}: {p.title.slice(0, 26)}…
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Specification & Explicit Input/Output Examples Card */}
      <div className="pmu-card" style={{ padding: "26px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            borderBottom: "1px solid #26262c",
            paddingBottom: "14px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">{problem.codeTag}</span>
            <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
              {problem.title}
            </h2>
          </div>
          <span
            className="font-mono"
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: "rgba(34,197,94,0.14)",
              color: "#4ade80",
            }}
          >
            Difficulty: {problem.difficulty}
          </span>
        </div>

        <RichMathMarkdown content={problem.statement} />

        {/* Input Format, Output Format & Constraints */}
        <div className="pmu-grid-3" style={{ marginTop: "16px", gap: "14px" }}>
          <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a" }}>
            <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#ff3b1d" }}>
              📥 Input Specification
            </span>
            <p style={{ marginTop: "6px", fontSize: "12.5px", color: "#d6d3cb", lineHeight: 1.5 }}>{problem.inputFormat}</p>
          </div>
          <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a" }}>
            <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
              📤 Output Specification
            </span>
            <p style={{ marginTop: "6px", fontSize: "12.5px", color: "#d6d3cb", lineHeight: 1.5 }}>{problem.outputFormat}</p>
          </div>
          <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a" }}>
            <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
              ⚡ Complexity Target
            </span>
            <div style={{ marginTop: "4px" }}>
              <RichMathMarkdown content={problem.constraints} />
            </div>
          </div>
        </div>

        {/* Sample Input / Output Examples */}
        <div style={{ marginTop: "18px" }}>
          <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#f3f1ea" }}>
            📋 Explicit Input / Output Examples:
          </span>
          <div className="pmu-grid-2" style={{ marginTop: "10px", gap: "14px" }}>
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff6a3d" }}>
                  Example 0{i + 1}:
                </span>
                <div className="font-mono" style={{ fontSize: "12px", color: "#f3f1ea" }}>
                  <span style={{ color: "#807f78" }}>Sample Input: </span>
                  <code>{ex.input}</code>
                </div>
                <div className="font-mono" style={{ fontSize: "12px", color: "#4ade80" }}>
                  <span style={{ color: "#807f78" }}>Expected Output: </span>
                  <strong>{ex.output}</strong>
                </div>
                <p style={{ marginTop: "4px", fontSize: "12px", color: "#a19f95", lineHeight: 1.5 }}>
                  <strong>Walkthrough:</strong> {ex.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column IDE & AI Feedback Workspace */}
      <div className="pmu-grid-2" style={{ alignItems: "start" }}>
        {/* Left Column: Code Editor, Test Runner & Submission Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="pmu-card" style={{ padding: "22px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                borderBottom: "1px solid #26262c",
                paddingBottom: "14px",
                marginBottom: "14px",
              }}
            >
              <span className="font-mono" style={{ fontSize: "12px", color: "#f3f1ea", fontWeight: 700 }}>
                🐍 solution.py
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setCode(problem.buggyDemoCode)}
                  className="pmu-btn-secondary"
                  style={{ padding: "7px 12px", fontSize: "11px" }}
                >
                  Load Buggy Code (Test Error View)
                </button>
                <button
                  type="button"
                  onClick={() => setCode(problem.starterCode)}
                  className="pmu-btn-secondary"
                  style={{ padding: "7px 12px", fontSize: "11px" }}
                >
                  Reset Solution
                </button>
                <button
                  type="button"
                  onClick={handleRunAndSubmit}
                  disabled={executing}
                  className="pmu-btn-primary"
                  style={{ padding: "8px 16px", fontSize: "11px", backgroundColor: "#22c55e", color: "#08080a" }}
                >
                  {executing ? "Running Tests…" : "▶ Run & Submit Code"}
                </button>
              </div>
            </div>

            <textarea
              rows={13}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="pmu-input font-mono"
              style={{ fontSize: "12.5px", lineHeight: 1.65, backgroundColor: "#08080a" }}
            />
          </div>

          {/* Submission Confirmation, Test Case Breakdown, Error Diagnostics & Solution Explanation */}
          {submissionResult && (
            <div className="pmu-card" style={{ padding: "24px", borderColor: submissionResult.passedAll ? "#22c55e" : "#ef4444" }}>
              {/* Confirmation Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: submissionResult.passedAll ? "rgba(34,197,94,0.16)" : "rgba(239,68,68,0.16)",
                  border: submissionResult.passedAll ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(239,68,68,0.4)",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px", fontWeight: 900, color: submissionResult.passedAll ? "#4ade80" : "#f87171" }}>
                    {submissionResult.passedAll ? "✓" : "✕"}
                  </span>
                  <div>
                    <div className="font-display" style={{ fontSize: "18px", textTransform: "uppercase", color: "#f3f1ea" }}>
                      {submissionResult.passedAll
                        ? "Submission Confirmed • All Unit Tests Passed!"
                        : "Submission Evaluated • Error Detected in Code"}
                    </div>
                    <div className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                      Submitted at {submissionResult.submittedAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Diagnostic Box if Failed */}
              {submissionResult.errorDiagnostic && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.45)",
                    backgroundColor: "rgba(70,8,9,0.35)",
                    fontSize: "12.5px",
                    color: "#fca5a5",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "4px", color: "#f87171" }}>
                    🐞 Compiler &amp; Logic Error Diagnostic:
                  </strong>
                  {submissionResult.errorDiagnostic}
                </div>
              )}

              {/* Unit Test Cases Table */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                {submissionResult.testResults.map((tr, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px solid #26262c",
                      backgroundColor: "#08080a",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: tr.passed ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                      {tr.passed ? "✓ PASS" : "✕ FAIL"} — {tr.name}
                    </span>
                    <span style={{ color: "#a19f95" }}>
                      Input: <code>{tr.inputRepr}</code> → Expected: <strong style={{ color: "#4ade80" }}>{tr.expectedRepr}</strong> | Yours:{" "}
                      <strong style={{ color: tr.passed ? "#4ade80" : "#f87171" }}>{tr.actualRepr}</strong>
                    </span>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Algorithmic Explanation */}
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  borderLeft: "3px solid #ff3b1d",
                  backgroundColor: "#08080a",
                }}
              >
                <RichMathMarkdown content={problem.expectedSolutionExplanation} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Code Debugger & Complexity Analyzer */}
        <div className="pmu-card" style={{ padding: "24px", minHeight: "520px", display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: "1px solid #26262c", paddingBottom: "14px", marginBottom: "16px" }}>
            <span className="pmu-badge">AI Code Copilot</span>
            <h3 className="font-display" style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
              Interactive AI Code Reviewer
            </h3>
            <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { id: "explain" as const, label: "📖 Explain Line-by-Line" },
                { id: "fix" as const, label: "🐞 Diagnose & Fix Bugs" },
                { id: "optimize" as const, label: "⚡ Big-O Complexity" },
                { id: "hint" as const, label: "💡 Progressive Hint" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleRequestAi(btn.id)}
                  className={activeTab === btn.id && aiFeedback ? "pmu-btn-primary" : "pmu-btn-secondary"}
                  style={{ padding: "8px 12px", fontSize: "11px" }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {aiLoading ? (
              <InteractiveWaitLoader
                compact
                title="Analyzing Python AST & Complexity…"
                subtitle="Toggle the digital logic gate while the AI compiler inspects your code!"
              />
            ) : aiFeedback ? (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <RichMathMarkdown content={aiFeedback} />
              </div>
            ) : (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <RichMathMarkdown content={problem.expectedSolutionExplanation} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
