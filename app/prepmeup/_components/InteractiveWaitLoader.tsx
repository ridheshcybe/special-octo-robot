"use client";

import React, { useState, useEffect } from "react";

const TRIVIA_CARDS = [
  {
    subject: "ACM-101 • Linear Algebra",
    question: "If matrix A has eigenvalues 2, 4, and 5, what is the trace and determinant of A?",
    answer: "Trace = 2 + 4 + 5 = 11 • Determinant = 2 × 4 × 5 = 40",
  },
  {
    subject: "PYT-102 • Python Internals",
    question: "What is the time complexity of checking `x in my_set` vs `x in my_list` in Python?",
    answer: "Set lookup is O(1) average (hash table), while List lookup is O(n) linear scan.",
  },
  {
    subject: "BEE-103 • Circuit Theorems",
    question: "When does Maximum Power Transfer occur in a DC resistive network?",
    answer: "When Load Resistance equals Thevenin Resistance (R_L = R_th), giving P_max = V_th² / (4·R_th).",
  },
  {
    subject: "COA-104 • Computer Architecture",
    question: "Which hazard occurs when two pipeline stages attempt to use the same hardware unit simultaneously?",
    answer: "Structural Hazard (solved by separate Instruction and Data caches — Harvard split).",
  },
];

interface InteractiveWaitLoaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function InteractiveWaitLoader({
  title = "Synthesizing Academic Workspace…",
  subtitle = "Play with the interactive Logic Gate & Flashcard Sandbox while your request completes!",
  compact = false,
}: InteractiveWaitLoaderProps) {
  // Interactive Logic Gate Mini-Game state
  const [inputA, setInputA] = useState<0 | 1>(1);
  const [inputB, setInputB] = useState<0 | 1>(0);
  const [gateType, setGateType] = useState<"AND" | "OR" | "XOR" | "NAND">("XOR");
  const [score, setScore] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 92 ? 35 : prev + 11));
    }, 650);
    return () => clearInterval(timer);
  }, []);

  const computeOutput = (): 0 | 1 => {
    if (gateType === "AND") return inputA && inputB ? 1 : 0;
    if (gateType === "OR") return inputA || inputB ? 1 : 0;
    if (gateType === "XOR") return inputA !== inputB ? 1 : 0;
    return !(inputA && inputB) ? 1 : 0;
  };

  const outBit = computeOutput();

  const handleBitToggle = (which: "A" | "B") => {
    if (which === "A") setInputA((p) => (p === 1 ? 0 : 1));
    else setInputB((p) => (p === 1 ? 0 : 1));
    setScore((s) => s + 10);
    setPulseCount((c) => c + 1);
  };

  const currentCard = TRIVIA_CARDS[cardIndex % TRIVIA_CARDS.length];

  return (
    <div
      className="pmu-card-highlight"
      style={{
        padding: compact ? "20px" : "28px",
        maxWidth: compact ? "100%" : "720px",
        margin: compact ? "0" : "24px auto",
      }}
    >
      {/* Header & Animated Progress Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#ff3b1d",
              boxShadow: "0 0 12px #ff3b1d",
            }}
          />
          <span className="font-display" style={{ fontSize: compact ? "20px" : "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
            {title}
          </span>
        </div>
        <span className="pmu-badge">⚡ Interactive Wait Lab • Score: {score} XP</span>
      </div>

      <p style={{ marginTop: "6px", fontSize: "12px", color: "#a19f95" }}>{subtitle}</p>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: "14px",
          height: "6px",
          width: "100%",
          backgroundColor: "#17171b",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #ff3b1d, #ff6a3d)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Interactive Mini-Games Grid */}
      <div className="pmu-grid-2" style={{ marginTop: "20px", gap: "16px" }}>
        {/* Mini-Game 1: Clickable Digital Logic Gate Simulator */}
        <div
          style={{
            backgroundColor: "#08080a",
            border: "1px solid #26262c",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase" }}>
              🎮 Mini-Lab: Toggle Logic Gate
            </span>
            <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>
              Pulses: {pulseCount}
            </span>
          </div>

          {/* Gate Type Selector */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
            {(["AND", "OR", "XOR", "NAND"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGateType(g);
                  setScore((s) => s + 5);
                }}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  borderRadius: "4px",
                  border: gateType === g ? "1px solid #ff3b1d" : "1px solid #26262c",
                  backgroundColor: gateType === g ? "rgba(255,59,29,0.18)" : "#111114",
                  color: gateType === g ? "#ff3b1d" : "#a19f95",
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Interactive Inputs -> Output */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleBitToggle("A")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: inputA ? "1px solid #22c55e" : "1px solid #26262c",
                  backgroundColor: inputA ? "rgba(34,197,94,0.15)" : "#111114",
                  color: inputA ? "#4ade80" : "#807f78",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Input A = {inputA} (Click)
              </button>
              <button
                type="button"
                onClick={() => handleBitToggle("B")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: inputB ? "1px solid #22c55e" : "1px solid #26262c",
                  backgroundColor: inputB ? "rgba(34,197,94,0.15)" : "#111114",
                  color: inputB ? "#4ade80" : "#807f78",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Input B = {inputB} (Click)
              </button>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px dashed rgba(255,59,29,0.4)",
                backgroundColor: "#111114",
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: 700,
                color: "#f3f1ea",
                textAlign: "center",
              }}
            >
              {gateType}
              <div style={{ fontSize: "10px", color: "#807f78" }}>GATE</div>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: outBit ? "2px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: outBit ? "rgba(255,59,29,0.2)" : "#111114",
                color: outBit ? "#ff3b1d" : "#807f78",
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              OUT: {outBit}
              <div style={{ fontSize: "10px" }}>{outBit ? "⚡ HIGH" : "LOW"}</div>
            </div>
          </div>
        </div>

        {/* Mini-Game 2: Rapid Exam Flashcard Flipper */}
        <div
          style={{
            backgroundColor: "#08080a",
            border: "1px solid #26262c",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff6a3d", textTransform: "uppercase" }}>
                🧠 Rapid Exam Booster
              </span>
              <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>
                {currentCard.subject}
              </span>
            </div>

            <p style={{ fontSize: "12px", fontWeight: 600, color: "#f3f1ea", lineHeight: 1.5 }}>
              {flipped ? (
                <span style={{ color: "#4ade80" }}>✓ Answer: {currentCard.answer}</span>
              ) : (
                <span>Q: {currentCard.question}</span>
              )}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => {
                setFlipped(!flipped);
                setScore((s) => s + 15);
              }}
              className="pmu-btn-secondary"
              style={{ flex: 1, padding: "6px 10px", fontSize: "11px" }}
            >
              {flipped ? "Hide Answer" : "Reveal Answer (+15 XP)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFlipped(false);
                setCardIndex((i) => i + 1);
                setScore((s) => s + 5);
              }}
              className="pmu-btn-primary"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              Next Card →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
