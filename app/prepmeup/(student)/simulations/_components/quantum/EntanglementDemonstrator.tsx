"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

type BellStateType = "phi_plus" | "phi_minus" | "psi_plus" | "psi_minus";

export function EntanglementDemonstrator() {
  const [bellState, setBellState] = useState<BellStateType>("phi_plus");
  const [qubitAMeasured, setQubitAMeasured] = useState<number | null>(null);
  const [qubitBMeasured, setQubitBMeasured] = useState<number | null>(null);
  const [shotStats, setShotStats] = useState<{ "00": number; "01": number; "10": number; "11": number; total: number } | null>(null);

  // Measure Qubit A
  const measureQubitA = () => {
    const outcomeA = Math.random() < 0.5 ? 0 : 1;
    setQubitAMeasured(outcomeA);

    // Instantaneous non-local collapse on Qubit B based on Bell state
    let outcomeB = outcomeA;
    if (bellState === "phi_plus" || bellState === "phi_minus") {
      outcomeB = outcomeA; // Correlated: 00 or 11
    } else {
      outcomeB = outcomeA === 0 ? 1 : 0; // Anti-correlated: 01 or 10
    }
    setQubitBMeasured(outcomeB);
  };

  // Run 1024 Shots
  const run1024Shots = () => {
    let c00 = 0;
    let c01 = 0;
    let c10 = 0;
    let c11 = 0;
    for (let i = 0; i < 1024; i++) {
      const a = Math.random() < 0.5 ? 0 : 1;
      let b = a;
      if (bellState === "phi_plus" || bellState === "phi_minus") {
        b = a;
      } else {
        b = a === 0 ? 1 : 0;
      }
      if (a === 0 && b === 0) c00++;
      else if (a === 0 && b === 1) c01++;
      else if (a === 1 && b === 0) c10++;
      else c11++;
    }
    setShotStats({ "00": c00, "01": c01, "10": c10, "11": c11, total: 1024 });
  };

  const resetAll = () => {
    setQubitAMeasured(null);
    setQubitBMeasured(null);
    setShotStats(null);
  };

  const stateDetails: Record<BellStateType, { name: string; formula: string; correlation: string }> = {
    phi_plus: {
      name: "|Φ+⟩",
      formula: "\\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}",
      correlation: "Strictly Parallel (00 or 11)",
    },
    phi_minus: {
      name: "|Φ-⟩",
      formula: "\\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}",
      correlation: "Parallel with π Relative Phase (00 or 11)",
    },
    psi_plus: {
      name: "|Ψ+⟩",
      formula: "\\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}",
      correlation: "Strictly Anti-Correlated (01 or 10)",
    },
    psi_minus: {
      name: "|Ψ-⟩ (Singlet)",
      formula: "\\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}",
      correlation: "Anti-Correlated Singlet (01 or 10)",
    },
  };

  return (
    <div className="pmu-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">Module 3: Simulation</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
              EPR Non-Locality & Bell States
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "28px", marginTop: "8px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Entanglement & Bell State Demonstrator
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Synthesize maximally entangled bipartite qubit pairs and verify non-local measurement collapse.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={resetAll} className="pmu-btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Reset
          </button>
          <Link href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q3-02" className="pmu-btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Lesson 3.2 Notes →
          </Link>
        </div>
      </div>

      {/* Bell State Selection */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {(["phi_plus", "phi_minus", "psi_plus", "psi_minus"] as BellStateType[]).map((st) => (
          <button
            key={st}
            onClick={() => {
              setBellState(st);
              resetAll();
            }}
            className={bellState === st ? "pmu-btn-primary" : "pmu-btn-secondary"}
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            {stateDetails[st].name}
          </button>
        ))}
      </div>

      {/* Interactive Telemetry Workbench */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Entangled Pair Live Visualization */}
        <div style={{ backgroundColor: "#111114", border: "1px solid rgba(243, 241, 234, 0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>Active Bell Basis Pair:</span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>{stateDetails[bellState].correlation}</span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.1)", textAlign: "center", marginBottom: "20px" }}>
            <RichMathMarkdown content={`$$${stateDetails[bellState].name} = ${stateDetails[bellState].formula}$$`} />
          </div>

          {/* Connected Pair Animation */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "24px 0", position: "relative" }}>
            {/* Qubit A */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  backgroundColor: qubitAMeasured !== null ? (qubitAMeasured === 0 ? "#00e676" : "#ff3b1d") : "#17171b",
                  border: "2px solid #f3f1ea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <span className="font-display" style={{ fontSize: "24px", color: qubitAMeasured !== null ? "#08080a" : "#f3f1ea" }}>
                  {qubitAMeasured !== null ? `|${qubitAMeasured}⟩` : "q_A"}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", marginTop: "8px" }}>
                Qubit A (Sender)
              </span>
            </div>

            {/* Entanglement Line */}
            <div style={{ flex: 1, height: "4px", margin: "0 14px", background: "linear-gradient(90deg, #ff3b1d, #00e676, #ff6a3d)", borderRadius: "2px", opacity: 0.8 }} />

            {/* Qubit B */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  backgroundColor: qubitBMeasured !== null ? (qubitBMeasured === 0 ? "#00e676" : "#ff3b1d") : "#17171b",
                  border: "2px solid #f3f1ea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <span className="font-display" style={{ fontSize: "24px", color: qubitBMeasured !== null ? "#08080a" : "#f3f1ea" }}>
                  {qubitBMeasured !== null ? `|${qubitBMeasured}⟩` : "q_B"}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", marginTop: "8px" }}>
                Qubit B (Receiver)
              </span>
            </div>
          </div>

          <button
            onClick={measureQubitA}
            className="pmu-btn-primary"
            style={{ width: "100%", marginTop: "12px", padding: "12px", fontSize: "14px", backgroundColor: "#ff3b1d" }}
          >
            ⚡ Measure Qubit A (Triggers Instant Collapse on B)
          </button>
        </div>

        {/* 1024-Shot Measurement Distribution */}
        <div style={{ backgroundColor: "#111114", border: "1px solid rgba(243, 241, 234, 0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>Correlation Telemetry (1024 Shots)</span>
          </div>

          <button
            onClick={run1024Shots}
            className="pmu-btn-secondary"
            style={{ width: "100%", padding: "10px", fontSize: "13px" }}
          >
            🔬 Sample 1,024 Shots on Entangled Pair
          </button>

          {shotStats && (
            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {(["00", "01", "10", "11"] as const).map((key) => {
                const count = shotStats[key];
                const pct = ((count / shotStats.total) * 100).toFixed(1);
                return (
                  <div key={key} style={{ textAlign: "center", padding: "10px 4px", backgroundColor: "#08080a", borderRadius: "6px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                    <div className="font-display" style={{ fontSize: "18px", color: count > 0 ? "#00e676" : "#807f78" }}>
                      |{key}⟩
                    </div>
                    <div className="font-mono" style={{ fontSize: "14px", fontWeight: "bold", color: "#f3f1ea", marginTop: "4px" }}>
                      {count}
                    </div>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#ff6a3d" }}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "20px", fontSize: "13px", lineHeight: "1.6", color: "#807f78" }}>
            Notice that for $|\\Phi^+\\rangle$, zero counts appear for $|01\\rangle$ and $|10\\rangle$. The particles exhibit 100% mutual information, violating classical local hidden variable theories.
          </div>
        </div>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px" }}>
        <h4 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "6px" }}>
          The EPR Paradox & Non-Separability
        </h4>
        <RichMathMarkdown content={`An entangled state cannot be written as a product state of individual subsystems:
$$|\\Phi^+\\rangle \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$$
When Alice measures qubit $A$, the state instantaneously projects onto either $|00\\rangle$ or $|11\\rangle$. While this provides instantaneous correlations, it does not permit faster-than-light signaling because Alice cannot choose which outcome occurs (No-Communication Theorem).`} />
      </div>
    </div>
  );
}
