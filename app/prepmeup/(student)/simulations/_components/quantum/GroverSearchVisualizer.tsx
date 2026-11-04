"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

export function GroverSearchVisualizer() {
  const [numQubits, setNumQubits] = useState<2 | 3>(2);
  const totalItems = numQubits === 2 ? 4 : 8; // 2^n
  const [targetIndex, setTargetIndex] = useState<number>(2); // Default target |10>
  const [stepIndex, setStepIndex] = useState<number>(0); // 0: Init, 1: Oracle, 2: Diffusion

  // Initial uniform superposition: 1/sqrt(N)
  const initialAmp = 1 / Math.sqrt(totalItems);

  // Compute amplitudes at each step
  const getAmplitudes = () => {
    const amps = new Array(totalItems).fill(initialAmp);

    if (stepIndex === 0) {
      return amps; // All +1/sqrt(N)
    }

    // Step 1: Oracle flips target amplitude to negative
    amps[targetIndex] = -initialAmp;

    if (stepIndex === 1) {
      return amps;
    }

    // Step 2: Diffusion operator: inversion about the mean
    // Mean = sum(amps) / N
    const sum = amps.reduce((acc, v) => acc + v, 0);
    const mean = sum / totalItems;
    // New amp_i = 2*mean - amp_i
    return amps.map((a) => 2 * mean - a);
  };

  const currentAmplitudes = getAmplitudes();

  const handleNextStep = () => {
    setStepIndex((prev) => (prev < 2 ? prev + 1 : 0));
  };

  const resetAll = () => {
    setStepIndex(0);
  };

  const stepLabels = [
    { title: "Step 0: Uniform Superposition", desc: "Hadamard transform applied to all qubits. All items share identical amplitude 1/√N." },
    { title: "Step 1: Phase Oracle (U_f)", desc: "The oracle recognizes target state and inverts its phase (-1), leaving other states unaffected." },
    { title: "Step 2: Diffusion Operator (2|s⟩⟨s| - I)", desc: "Inversion about the mean amplitude. Target amplitude is amplified; un-marked states diminish." },
  ];

  return (
    <div className="pmu-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">Module 4: Simulation</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
              Quadratic Speedup O(√N)
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "28px", marginTop: "8px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Grover&apos;s Search Algorithm Visualizer
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Trace quantum amplitude amplification through phase oracle marking and geometric diffusion reflection.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={resetAll} className="pmu-btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Reset Search
          </button>
          <Link href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q4-02" className="pmu-btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Lesson 4.2 Notes →
          </Link>
        </div>
      </div>

      {/* Target Item Selection & Qubit Size */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "14px", backgroundColor: "#111114", borderRadius: "10px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Database Size:</span>
          {[2, 3].map((n) => (
            <button
              key={n}
              onClick={() => {
                setNumQubits(n as 2 | 3);
                setTargetIndex(0);
                setStepIndex(0);
              }}
              className={numQubits === n ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              {n} Qubits ({Math.pow(2, n)} Items)
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Mark Secret Item:</span>
          {Array.from({ length: totalItems }).map((_, idx) => {
            const bin = idx.toString(2).padStart(numQubits, "0");
            return (
              <button
                key={bin}
                onClick={() => {
                  setTargetIndex(idx);
                  setStepIndex(0);
                }}
                className={targetIndex === idx ? "pmu-btn-primary" : "pmu-btn-secondary"}
                style={{ padding: "4px 8px", fontSize: "11px", fontFamily: "monospace" }}
              >
                |{bin}⟩
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Navigator */}
      <div style={{ backgroundColor: "#17171b", border: "1px solid rgba(243, 241, 234, 0.1)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="font-mono" style={{ fontSize: "12px", color: "#00e676", textTransform: "uppercase" }}>
              {stepLabels[stepIndex].title}
            </span>
            <p style={{ fontSize: "13px", color: "#f3f1ea", marginTop: "4px" }}>
              {stepLabels[stepIndex].desc}
            </p>
          </div>
          <button
            onClick={handleNextStep}
            className="pmu-btn-primary"
            style={{ padding: "10px 20px", fontSize: "13px", backgroundColor: "#ff6a3d" }}
          >
            {stepIndex === 2 ? "↺ Restart Grover Loop" : "Next Step →"}
          </button>
        </div>
      </div>

      {/* Amplitude & Probability Visual Bars */}
      <div style={{ backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.12)", borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
            Quantum Amplitudes (Real Axis) & Measurement Probabilities:
          </span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
            Target: |{targetIndex.toString(2).padStart(numQubits, "0")}⟩
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${totalItems}, 1fr)`, gap: "12px", alignItems: "center" }}>
          {currentAmplitudes.map((amp, idx) => {
            const bin = idx.toString(2).padStart(numQubits, "0");
            const prob = amp * amp;
            const isTarget = idx === targetIndex;
            const heightPercent = Math.min(100, Math.abs(amp) * 100);

            return (
              <div key={bin} style={{ textAlign: "center" }}>
                {/* Positive/Negative Amplitude Graph */}
                <div style={{ height: "140px", position: "relative", backgroundColor: "#111114", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {/* Zero line */}
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", backgroundColor: "rgba(243, 241, 234, 0.2)" }} />

                  {/* Amplitude Bar */}
                  {amp >= 0 ? (
                    <div style={{ height: "50%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div
                        style={{
                          width: "70%",
                          height: `${(amp / 1.0) * 100}%`,
                          backgroundColor: isTarget ? "#00e676" : "#ff6a3d",
                          borderRadius: "3px 3px 0 0",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: "50%", marginTop: "50%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                      <div
                        style={{
                          width: "70%",
                          height: `${(Math.abs(amp) / 1.0) * 100}%`,
                          backgroundColor: "#ff3b1d",
                          borderRadius: "0 0 3px 3px",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", marginTop: "8px", color: isTarget ? "#00e676" : "#f3f1ea" }}>
                  |{bin}⟩ {isTarget ? "🎯" : ""}
                </div>

                <div className="font-mono" style={{ fontSize: "11px", color: isTarget ? "#00e676" : "#807f78", marginTop: "2px" }}>
                  P: {(prob * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px" }}>
        <h4 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "6px" }}>
          Amplitude Amplification Mechanics
        </h4>
        <RichMathMarkdown content={`Grover's iteration operator alternates between the phase oracle and the diffusion transform:
$$G = (2|s\\rangle\\langle s| - I) U_f$$
For $N = 4$ items ($2$ qubits), exactly one Grover iteration ($R \\approx \\frac{\\pi}{4}\\sqrt{4} = 1$) rotates the initial superposition state vector $|s\\rangle$ with 100% fidelity onto the marked state $|\\omega\\rangle$.`} />
      </div>
    </div>
  );
}
