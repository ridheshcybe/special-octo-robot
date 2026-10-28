"use client";

import React, { useState } from "react";

interface StackFrame {
  name: string;
  n: number;
  status: string;
  ret: string;
  isActive: boolean;
}

interface TraceStep {
  action: string;
  line: number;
  stack: StackFrame[];
  console: string;
  note: string;
}

export function CallStackSim() {
  const [nVal, setNVal] = useState<3 | 4>(3);
  const [step, setStep] = useState(0);

  // Dynamic recursion traces for n = 3 and n = 4
  const tracesN3: TraceStep[] = [
    {
      action: "Initial Invocation: fact(3)",
      line: 1,
      stack: [{ name: "fact(n=3)", n: 3, status: "Evaluates n <= 1 (False). Calls fact(2)...", ret: "waiting...", isActive: true }],
      console: ">>> fact(3) pushed to Call Stack\n[Line 1] Calling fact(n=3)",
      note: "A new activation frame for fact(3) is pushed onto the stack. It cannot complete until fact(2) returns.",
    },
    {
      action: "Recursive Call: fact(2)",
      line: 3,
      stack: [
        { name: "fact(n=3)", n: 3, status: "Suspended: waiting for fact(2)", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Evaluates n <= 1 (False). Calls fact(1)...", ret: "waiting...", isActive: true },
      ],
      console: ">>> fact(3) pushed to Call Stack\n>>> fact(2) pushed to Call Stack\n[Line 3] Calling fact(n=2)",
      note: "Stack depth grows to 2. fact(3) remains suspended in memory while fact(2) executes.",
    },
    {
      action: "Recursive Call: fact(1) — Base Case Reached!",
      line: 2,
      stack: [
        { name: "fact(n=3)", n: 3, status: "Suspended: waiting for fact(2)", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Suspended: waiting for fact(1)", ret: "2 * fact(1)", isActive: false },
        { name: "fact(n=1)", n: 1, status: "Base case reached: n <= 1 -> returns 1", ret: "1", isActive: true },
      ],
      console: ">>> fact(3) pushed to Call Stack\n>>> fact(2) pushed to Call Stack\n>>> fact(1) pushed [BASE CASE REACHED]\n[Line 2] Base condition true -> returns 1",
      note: "Base condition (n <= 1) evaluates to True! The recursion stops descending and begins unwinding (popping).",
    },
    {
      action: "Stack Unwinding: fact(1) pops and returns 1 to fact(2)",
      line: 3,
      stack: [
        { name: "fact(n=3)", n: 3, status: "Suspended: waiting for fact(2)", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Resumed! Receives 1. Computes 2 * 1 = 2", ret: "2", isActive: true },
      ],
      console: ">>> fact(1) returned 1 [Frame Popped from Stack]\n[Line 3] fact(2) resumes: 2 * 1 = 2",
      note: "fact(1)'s activation record is deallocated. Return value 1 substitutes into fact(2).",
    },
    {
      action: "Stack Unwinding: fact(2) pops and returns 2 to fact(3)",
      line: 3,
      stack: [
        { name: "fact(n=3)", n: 3, status: "Resumed! Receives 2. Computes 3 * 2 = 6", ret: "6", isActive: true },
      ],
      console: ">>> fact(2) returned 2 [Frame Popped from Stack]\n[Line 3] fact(3) resumes: 3 * 2 = 6",
      note: "fact(2) finishes execution and pops. fact(3) resumes with value 2 to compute 3 * 2 = 6.",
    },
    {
      action: "Final Completion: fact(3) returns 6. Call Stack Cleaned!",
      line: 3,
      stack: [],
      console: ">>> fact(3) returned 6 [All Frames Cleaned]\n[Execution Finished Successfully] Final Result: 6",
      note: "The original caller receives 6. All stack frames are released from memory (O(1) residual space).",
    },
  ];

  const tracesN4: TraceStep[] = [
    {
      action: "Initial Invocation: fact(4)",
      line: 1,
      stack: [{ name: "fact(n=4)", n: 4, status: "Evaluates n <= 1 (False). Calls fact(3)...", ret: "waiting...", isActive: true }],
      console: ">>> fact(4) pushed to Call Stack\n[Line 1] Calling fact(n=4)",
      note: "Top-level call fact(4) enters the call stack at depth 1.",
    },
    {
      action: "Recursive Call: fact(3)",
      line: 3,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Suspended: waiting for fact(3)", ret: "4 * fact(3)", isActive: false },
        { name: "fact(n=3)", n: 3, status: "Evaluates n <= 1 (False). Calls fact(2)...", ret: "waiting...", isActive: true },
      ],
      console: ">>> fact(4) pushed\n>>> fact(3) pushed\n[Line 3] Calling fact(n=3)",
      note: "Stack grows to depth 2.",
    },
    {
      action: "Recursive Call: fact(2)",
      line: 3,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Suspended: waiting for fact(3)", ret: "4 * fact(3)", isActive: false },
        { name: "fact(n=3)", n: 3, status: "Suspended: waiting for fact(2)", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Evaluates n <= 1 (False). Calls fact(1)...", ret: "waiting...", isActive: true },
      ],
      console: ">>> fact(4) pushed\n>>> fact(3) pushed\n>>> fact(2) pushed\n[Line 3] Calling fact(n=2)",
      note: "Stack grows to depth 3.",
    },
    {
      action: "Recursive Call: fact(1) — Base Case!",
      line: 2,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Suspended: waiting for fact(3)", ret: "4 * fact(3)", isActive: false },
        { name: "fact(n=3)", n: 3, status: "Suspended: waiting for fact(2)", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Suspended: waiting for fact(1)", ret: "2 * fact(1)", isActive: false },
        { name: "fact(n=1)", n: 1, status: "Base case reached: returns 1", ret: "1", isActive: true },
      ],
      console: ">>> fact(1) reached base case [Depth 4 Peak]",
      note: "Maximum recursion depth of 4 reached. Unwinding begins.",
    },
    {
      action: "Unwinding: fact(1) -> 1 to fact(2)",
      line: 3,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Suspended", ret: "4 * fact(3)", isActive: false },
        { name: "fact(n=3)", n: 3, status: "Suspended", ret: "3 * fact(2)", isActive: false },
        { name: "fact(n=2)", n: 2, status: "Resumed: 2 * 1 = 2", ret: "2", isActive: true },
      ],
      console: ">>> fact(1) popped -> returned 1\n>>> fact(2) resumes: 2",
      note: "fact(1) pops. fact(2) computes 2.",
    },
    {
      action: "Unwinding: fact(2) -> 2 to fact(3)",
      line: 3,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Suspended", ret: "4 * fact(3)", isActive: false },
        { name: "fact(n=3)", n: 3, status: "Resumed: 3 * 2 = 6", ret: "6", isActive: true },
      ],
      console: ">>> fact(2) popped -> returned 2\n>>> fact(3) resumes: 6",
      note: "fact(2) pops. fact(3) computes 6.",
    },
    {
      action: "Unwinding: fact(3) -> 6 to fact(4)",
      line: 3,
      stack: [
        { name: "fact(n=4)", n: 4, status: "Resumed: 4 * 6 = 24", ret: "24", isActive: true },
      ],
      console: ">>> fact(3) popped -> returned 6\n>>> fact(4) resumes: 24",
      note: "fact(3) pops. fact(4) computes 4 * 6 = 24.",
    },
    {
      action: "Final Completion: fact(4) returns 24",
      line: 3,
      stack: [],
      console: ">>> fact(4) returned 24 [All Frames Cleaned]\n[Execution Finished Successfully] Final Result: 24",
      note: "Execution completes with return value 24. Stack depth is now 0.",
    },
  ];

  const trace = nVal === 3 ? tracesN3 : tracesN4;
  const current = trace[Math.min(step, trace.length - 1)];

  const handleNChange = (newN: 3 | 4) => {
    setNVal(newN);
    setStep(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "8px 0" }}>
      {/* 1. Header Toolbar with Mode Switcher & Progress Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "22px 26px",
          borderRadius: "12px",
          border: "1px solid rgba(243,241,234,0.12)",
          backgroundColor: "#111114",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge pmu-badge-accent">
              Step {step + 1} of {trace.length}
            </span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
              ● Stack Depth: {current.stack.length}
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              marginTop: "8px",
              fontSize: "22px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#f3f1ea",
            }}
          >
            {current.action}
          </h2>
          <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95", maxWidth: "600px" }}>
            {current.note}
          </p>
        </div>

        {/* Input Switcher & Step Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "6px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
              Input (n):
            </span>
            {[3, 4].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleNChange(val as 3 | 4)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  border: nVal === val ? "1px solid #ff3b1d" : "1px solid #26262c",
                  backgroundColor: nVal === val ? "rgba(255,59,29,0.15)" : "#17171b",
                  color: nVal === val ? "#ff6a3d" : "#a19f95",
                  cursor: "pointer",
                }}
              >
                n = {val}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(0)}
            className="pmu-btn-secondary"
            style={{ padding: "7px 14px", fontSize: "11px" }}
          >
            ↺ Reset
          </button>
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="pmu-btn-secondary"
            style={{ padding: "7px 14px", fontSize: "11px" }}
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={step === trace.length - 1}
            onClick={() => setStep((s) => Math.min(trace.length - 1, s + 1))}
            className="pmu-btn-primary"
            style={{ padding: "8px 18px", fontSize: "12px" }}
          >
            Step Forward →
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ height: "4px", width: "100%", borderRadius: "9999px", backgroundColor: "#17171b", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${((step + 1) / trace.length) * 100}%`,
            backgroundColor: "#ff3b1d",
            transition: "width 0.25s ease",
          }}
        />
      </div>

      {/* 2. Main Visual Workspace: Stack Tower + Code & Log */}
      <div className="pmu-grid-2" style={{ alignItems: "start", gap: "24px" }}>
        {/* Left: Dynamic Call Stack (LIFO Tower) */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(243,241,234,0.12)",
            backgroundColor: "#111114",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
                Active Memory Region
              </span>
              <h3 className="font-display" style={{ marginTop: "2px", fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Call Stack (LIFO Tower)
              </h3>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor: current.stack.length > 0 ? "rgba(255,59,29,0.12)" : "rgba(34,197,94,0.12)",
                color: current.stack.length > 0 ? "#ff6a3d" : "#4ade80",
                fontWeight: 700,
              }}
            >
              {current.stack.length} Active {current.stack.length === 1 ? "Frame" : "Frames"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              gap: "12px",
              minHeight: "280px",
              borderRadius: "10px",
              backgroundColor: "#08080a",
              padding: "20px",
              border: "1px solid #26262c",
              justifyContent: current.stack.length === 0 ? "center" : "flex-start",
              alignItems: current.stack.length === 0 ? "center" : "stretch",
            }}
          >
            {current.stack.length === 0 ? (
              <div style={{ textAlign: "center", color: "#807f78", fontFamily: "monospace", fontSize: "13px" }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>✓</span>
                [Stack Empty — All Frames Popped]
                <div style={{ fontSize: "11px", color: "#a19f95", marginTop: "4px" }}>
                  Execution finished. Final value returned to caller.
                </div>
              </div>
            ) : (
              current.stack.map((frame, idx) => {
                const isTop = idx === current.stack.length - 1;
                return (
                  <div
                    key={`${frame.name}-${idx}`}
                    style={{
                      borderRadius: "8px",
                      border: isTop ? "2px solid #ff3b1d" : "1px solid #26262c",
                      backgroundColor: isTop ? "rgba(255,59,29,0.08)" : "#17171b",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      boxShadow: isTop ? "0 4px 20px rgba(255,59,29,0.2)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "3px",
                            backgroundColor: isTop ? "#ff3b1d" : "#26262c",
                            color: isTop ? "#08080a" : "#f3f1ea",
                          }}
                        >
                          {isTop ? "ACTIVE TOP FRAME" : `FRAME #${idx + 1}`}
                        </span>
                        <strong className="font-mono" style={{ fontSize: "14px", color: "#f3f1ea" }}>
                          {frame.name}
                        </strong>
                      </div>
                      <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: frame.ret.includes("waiting") ? "#ff6a3d" : "#4ade80" }}>
                        Return: {frame.ret}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "#a19f95", margin: 0 }}>
                      {frame.status}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Python Source Code with Live Highlight & Execution Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Synchronized Code Viewer */}
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(243,241,234,0.12)",
              backgroundColor: "#111114",
              padding: "22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
                Active Python Source
              </span>
              <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                recursion.py
              </span>
            </div>

            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #26262c",
                backgroundColor: "#08080a",
                padding: "14px 16px",
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: 1.8,
              }}
            >
              {[
                { num: 1, code: "def fact(n):" },
                { num: 2, code: "    if n <= 1: return 1  # Base Case" },
                { num: 3, code: "    return n * fact(n - 1)  # Recursive Step" },
              ].map((line) => {
                const isCurrentLine = current.line === line.num;
                return (
                  <div
                    key={line.num}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: isCurrentLine ? "rgba(255,59,29,0.18)" : "transparent",
                      color: isCurrentLine ? "#ff6a3d" : "#d4d2c8",
                      fontWeight: isCurrentLine ? 700 : 400,
                    }}
                  >
                    <span style={{ color: "#52525b", width: "16px", textAlign: "right", userSelect: "none" }}>
                      {line.num}
                    </span>
                    <span>{line.code}</span>
                    {isCurrentLine && (
                      <span style={{ fontSize: "10px", color: "#ff3b1d", marginLeft: "auto", textTransform: "uppercase" }}>
                        ◀ EXECUTING
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal / Call Trace Log */}
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(243,241,234,0.12)",
              backgroundColor: "#111114",
              padding: "22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
                Interactive Terminal Output
              </span>
              <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>
                STDOUT
              </span>
            </div>

            <pre
              style={{
                margin: 0,
                borderRadius: "8px",
                border: "1px solid #26262c",
                backgroundColor: "#08080a",
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: 1.7,
                color: "#4ade80",
                minHeight: "120px",
                whiteSpace: "pre-wrap",
              }}
            >
              {current.console}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
