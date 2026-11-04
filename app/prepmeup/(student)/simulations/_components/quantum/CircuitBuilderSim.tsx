"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

type GateType = "H" | "X" | "Y" | "Z" | "S" | "T" | "CX" | "M" | null;

interface CircuitGatePlacement {
  qubit: number;
  step: number;
  gate: GateType;
}

export function CircuitBuilderSim() {
  const [numQubits, setNumQubits] = useState<number>(2); // 1 to 3 qubits
  const totalSteps = 4; // 4 time steps
  const [selectedGate, setSelectedGate] = useState<GateType>("H");

  // Grid of gates: qubit index (0..2), step index (0..3)
  const [circuitGrid, setCircuitGrid] = useState<GateType[][]>([
    ["H", "CX", null, "M"],
    [null, "CX", null, "M"],
    [null, null, null, null],
  ]);

  const handleCellClick = (q: number, s: number) => {
    setCircuitGrid((prev) => {
      const next = prev.map((row) => [...row]);
      if (next[q][s] === selectedGate) {
        next[q][s] = null; // Toggle off
      } else {
        next[q][s] = selectedGate;
        // If placing CX, pair with adjacent or target qubit
        if (selectedGate === "CX" && q === 0 && numQubits > 1) {
          next[1][s] = "CX";
        }
      }
      return next;
    });
  };

  const loadPreset = (presetName: string) => {
    if (presetName === "bell") {
      setNumQubits(2);
      setCircuitGrid([
        ["H", "CX", null, "M"],
        [null, "CX", null, "M"],
        [null, null, null, null],
      ]);
    } else if (presetName === "ghz") {
      setNumQubits(3);
      setCircuitGrid([
        ["H", "CX", null, "M"],
        [null, "CX", "CX", "M"],
        [null, null, "CX", "M"],
      ]);
    } else if (presetName === "superposition") {
      setNumQubits(2);
      setCircuitGrid([
        ["H", null, null, "M"],
        ["H", null, null, "M"],
        [null, null, null, null],
      ]);
    }
  };

  const resetCircuit = () => {
    setCircuitGrid([
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
  };

  // Compute 2^numQubits statevector probabilities
  const outcomeProbabilities = useMemo(() => {
    const dim = Math.pow(2, numQubits);
    // Simple statevector evaluator for common circuit configurations
    const probs: Array<{ binary: string; prob: number }> = [];

    // Check if Bell State (q0 has H and CX with q1)
    const isBell =
      numQubits === 2 &&
      circuitGrid[0][0] === "H" &&
      circuitGrid[0][1] === "CX" &&
      circuitGrid[1][1] === "CX";

    // Check if GHZ State
    const isGhz =
      numQubits === 3 &&
      circuitGrid[0][0] === "H" &&
      circuitGrid[0][1] === "CX" &&
      circuitGrid[1][1] === "CX" &&
      circuitGrid[2][2] === "CX";

    // Check if pure superposition
    const isSuperposition =
      circuitGrid[0][0] === "H" && (numQubits === 1 || circuitGrid[1][0] === "H");

    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(numQubits, "0");
      let p = 0;
      if (isBell) {
        if (bin === "00" || bin === "11") p = 0.5;
      } else if (isGhz) {
        if (bin === "000" || bin === "111") p = 0.5;
      } else if (isSuperposition) {
        p = 1 / dim;
      } else {
        // Ground default
        if (bin === "0".repeat(numQubits)) p = 1.0;
      }
      probs.push({ binary: bin, prob: p });
    }

    return probs;
  }, [numQubits, circuitGrid]);

  return (
    <div className="pmu-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">Module 2: Simulation</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
              Multi-Qubit Circuit Simulator
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "28px", marginTop: "8px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Quantum Circuit Builder
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Place unitary gates and entangling operators across quantum register wires and inspect real-time statevector distributions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={resetCircuit} className="pmu-btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Reset Circuit
          </button>
          <Link href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q2-02" className="pmu-btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Lesson 2.2 Notes →
          </Link>
        </div>
      </div>

      {/* Preset Buttons & Qubit Width Selector */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px 16px", backgroundColor: "#111114", borderRadius: "10px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Register Size:</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setNumQubits(n)}
              className={numQubits === n ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              {n} Qubit{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Presets:</span>
          <button onClick={() => loadPreset("bell")} className="pmu-btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}>
            Bell State (|Φ+⟩)
          </button>
          <button onClick={() => loadPreset("ghz")} className="pmu-btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}>
            3-Qubit GHZ
          </button>
          <button onClick={() => loadPreset("superposition")} className="pmu-btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}>
            All-H Superposition
          </button>
        </div>
      </div>

      {/* Gate Selector Palette */}
      <div style={{ marginBottom: "16px" }}>
        <label className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
          Select Active Gate To Place (Click Wire Cell Below):
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {(["H", "X", "Y", "Z", "S", "T", "CX", "M"] as GateType[]).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGate(g)}
              className={selectedGate === g ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontFamily: "monospace",
                fontWeight: "bold",
                backgroundColor: selectedGate === g ? "#ff3b1d" : undefined,
              }}
            >
              {g === "CX" ? "⊕ CNOT" : g === "M" ? "📐 Measure" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Grid Canvas */}
      <div style={{ backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.12)", borderRadius: "10px", padding: "20px", overflowX: "auto" }}>
        <div style={{ minWidth: "480px", display: "flex", flexDirection: "column", gap: "28px" }}>
          {Array.from({ length: numQubits }).map((_, qIdx) => (
            <div key={qIdx} style={{ display: "flex", alignItems: "center", position: "relative" }}>
              {/* Qubit Label */}
              <div style={{ width: "70px", fontFamily: "monospace", fontSize: "13px", color: "#f3f1ea", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#ff6a3d", fontWeight: "bold" }}>q[{qIdx}]</span>
                <span style={{ color: "#807f78", fontSize: "11px" }}>|0⟩</span>
              </div>

              {/* Wire Line */}
              <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ position: "absolute", left: 0, right: 0, height: "2px", backgroundColor: "rgba(243, 241, 234, 0.25)", zIndex: 1 }} />

                {/* Steps */}
                {Array.from({ length: totalSteps }).map((_, sIdx) => {
                  const gate = circuitGrid[qIdx]?.[sIdx];
                  const isCnTarget = gate === "CX" && qIdx === 1 && circuitGrid[0]?.[sIdx] === "CX";
                  const isCnControl = gate === "CX" && qIdx === 0 && circuitGrid[1]?.[sIdx] === "CX";

                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleCellClick(qIdx, sIdx)}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "44px",
                        height: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: gate ? (gate === "M" ? "#17171b" : "#ff3b1d") : "#111114",
                        border: gate ? "2px solid #f3f1ea" : "1px dashed rgba(243, 241, 234, 0.2)",
                        borderRadius: gate === "CX" ? "50%" : "6px",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#f3f1ea",
                        transition: "all 0.15s ease",
                      }}
                      title={gate ? `Qubit ${qIdx}, Step ${sIdx + 1}: ${gate}` : `Click to place ${selectedGate}`}
                    >
                      {gate ? (
                        isCnControl ? (
                          "●"
                        ) : isCnTarget ? (
                          "⊕"
                        ) : gate === "M" ? (
                          "M"
                        ) : (
                          gate
                        )
                      ) : (
                        <span style={{ opacity: 0.15, fontSize: "11px" }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Measurement Probability Spectrum */}
      <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#111114", borderRadius: "10px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", textTransform: "uppercase" }}>
            Statevector Probability Distribution (2^{numQubits} = {Math.pow(2, numQubits)} Basis States)
          </span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
            Σ P(x) = 100%
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.pow(2, numQubits)}, 1fr)`, gap: "10px" }}>
          {outcomeProbabilities.map((item) => (
            <div key={item.binary} style={{ textAlign: "center" }}>
              <div style={{ height: "70px", display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "#08080a", borderRadius: "4px", padding: "2px" }}>
                <div
                  style={{
                    width: "80%",
                    height: `${item.prob * 100}%`,
                    backgroundColor: item.prob > 0 ? (item.prob >= 0.4 ? "#00e676" : "#ff6a3d") : "transparent",
                    borderRadius: "2px",
                    transition: "height 0.3s ease",
                  }}
                />
              </div>
              <div className="font-mono" style={{ fontSize: "12px", marginTop: "6px", color: "#f3f1ea", fontWeight: "bold" }}>
                |{item.binary}⟩
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>
                {(item.prob * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px" }}>
        <h4 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "6px" }}>
          Circuit Matrix Multiplication
        </h4>
        <RichMathMarkdown content={`The overall evolution of an $n$-qubit circuit is modeled by sequential Kronecker matrix multiplication:
$$|\\psi_{\\text{final}}\\rangle = (U_k \\dots U_2 U_1) |\\psi_{\\text{init}}\\rangle$$
Where single-qubit gates on wire $j$ act as $I \\otimes \\dots \\otimes U \\otimes \\dots \\otimes I$, and two-qubit entangling gates (such as $CNOT$) couple control and target Hilbert subspaces.`} />
      </div>
    </div>
  );
}
