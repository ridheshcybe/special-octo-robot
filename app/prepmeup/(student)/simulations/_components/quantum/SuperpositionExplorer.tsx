"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

export function SuperpositionExplorer() {
  // Slider for superposition angle theta (0 to PI)
  // |psi> = cos(theta/2)|0> + sin(theta/2)|1>
  const [thetaDegrees, setThetaDegrees] = useState<number>(90); // default to Hadamard (90 deg = equal superposition)
  const [shotCount, setShotCount] = useState<number>(100);
  const [measuredCounts, setMeasuredCounts] = useState<{ count0: number; count1: number; total: number } | null>(null);

  const thetaRad = (thetaDegrees * Math.PI) / 180;
  const alpha = Math.cos(thetaRad / 2);
  const beta = Math.sin(thetaRad / 2);
  const prob0 = alpha * alpha;
  const prob1 = beta * beta;

  const setHadamard = () => {
    setThetaDegrees(90);
    setMeasuredCounts(null);
  };

  const setGround = () => {
    setThetaDegrees(0);
    setMeasuredCounts(null);
  };

  const setExcited = () => {
    setThetaDegrees(180);
    setMeasuredCounts(null);
  };

  const runShots = () => {
    let c0 = 0;
    let c1 = 0;
    for (let i = 0; i < shotCount; i++) {
      if (Math.random() < prob0) {
        c0++;
      } else {
        c1++;
      }
    }
    setMeasuredCounts({ count0: c0, count1: c1, total: shotCount });
  };

  const resetAll = () => {
    setThetaDegrees(90);
    setShotCount(100);
    setMeasuredCounts(null);
  };

  return (
    <div className="pmu-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">Module 1: Simulation 2</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
              Born Rule & Statistical Collapse
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "28px", marginTop: "8px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Superposition Explorer & Shot Engine
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Investigate quantum interference, tune probability amplitudes, and execute repeated measurement shots.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={resetAll} className="pmu-btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Reset Simulation
          </button>
          <Link href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q1-02" className="pmu-btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Lesson 1.2 Notes →
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Controls & Amplitude Tuning */}
        <div style={{ backgroundColor: "#111114", border: "1px solid rgba(243, 241, 234, 0.08)", borderRadius: "12px", padding: "20px" }}>
          <label className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
            Quick State Presets
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={setGround} className="pmu-btn-secondary" style={{ flex: 1, padding: "8px 4px", fontSize: "12px" }}>
              |0⟩ Ground
            </button>
            <button onClick={setHadamard} className="pmu-btn-primary" style={{ flex: 1, padding: "8px 4px", fontSize: "12px" }}>
              |+⟩ Hadamard
            </button>
            <button onClick={setExcited} className="pmu-btn-secondary" style={{ flex: 1, padding: "8px 4px", fontSize: "12px" }}>
              |1⟩ Excited
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontFamily: "monospace", marginBottom: "6px" }}>
              <span>Superposition Angle θ:</span>
              <span style={{ color: "#ff6a3d", fontWeight: "bold" }}>{thetaDegrees}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={thetaDegrees}
              onChange={(e) => {
                setThetaDegrees(Number(e.target.value));
                setMeasuredCounts(null);
              }}
              style={{ width: "100%", accentColor: "#ff3b1d", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#807f78", marginTop: "4px" }}>
              <span>θ = 0° (|0⟩)</span>
              <span>θ = 90° (50/50 |+⟩)</span>
              <span>θ = 180° (|1⟩)</span>
            </div>
          </div>

          {/* Theoretical Amplitudes */}
          <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.1)" }}>
            <div className="font-mono" style={{ fontSize: "13px", color: "#f3f1ea" }}>
              <div>State: |ψ⟩ = {alpha.toFixed(3)}|0⟩ + {beta.toFixed(3)}|1⟩</div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#807f78" }}>
                Theoretical P(0) = {(prob0 * 100).toFixed(1)}% &nbsp;|&nbsp; P(1) = {(prob1 * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", height: "18px", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(243, 241, 234, 0.2)" }}>
              <div style={{ width: `${prob0 * 100}%`, backgroundColor: "#00e676", transition: "width 0.2s" }} title={`P(0) = ${(prob0 * 100).toFixed(1)}%`} />
              <div style={{ width: `${prob1 * 100}%`, backgroundColor: "#ff3b1d", transition: "width 0.2s" }} title={`P(1) = ${(prob1 * 100).toFixed(1)}%`} />
            </div>
          </div>
        </div>

        {/* Statistical Measurement Engine */}
        <div style={{ backgroundColor: "#111114", border: "1px solid rgba(243, 241, 234, 0.08)", borderRadius: "12px", padding: "20px" }}>
          <label className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
            Repeated Shot Sampler (AerSimulator Model)
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
            {[10, 100, 500, 1024].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setShotCount(cnt)}
                className={shotCount === cnt ? "pmu-btn-primary" : "pmu-btn-secondary"}
                style={{ flex: 1, padding: "8px 2px", fontSize: "12px" }}
              >
                {cnt} shots
              </button>
            ))}
          </div>

          <button
            onClick={runShots}
            className="pmu-btn-primary"
            style={{ width: "100%", marginTop: "14px", padding: "12px", fontSize: "14px", backgroundColor: "#ff6a3d" }}
          >
            🚀 Fire {shotCount} Experimental Shots
          </button>

          {/* Results Comparison Chart */}
          {measuredCounts && (
            <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.1)" }}>
              <div className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", marginBottom: "8px" }}>
                Empirical Histogram vs Born Rule:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", marginBottom: "2px" }}>
                    <span>Outcome |0⟩: {measuredCounts.count0} / {measuredCounts.total}</span>
                    <span style={{ color: "#00e676", fontWeight: "bold" }}>
                      {((measuredCounts.count0 / measuredCounts.total) * 100).toFixed(1)}% (Theory: {(prob0 * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "#17171b", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(measuredCounts.count0 / measuredCounts.total) * 100}%`, height: "100%", backgroundColor: "#00e676" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", marginBottom: "2px" }}>
                    <span>Outcome |1⟩: {measuredCounts.count1} / {measuredCounts.total}</span>
                    <span style={{ color: "#ff3b1d", fontWeight: "bold" }}>
                      {((measuredCounts.count1 / measuredCounts.total) * 100).toFixed(1)}% (Theory: {(prob1 * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "#17171b", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(measuredCounts.count1 / measuredCounts.total) * 100}%`, height: "100%", backgroundColor: "#ff3b1d" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px" }}>
        <h4 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "6px" }}>
          Superposition & Normalization Law
        </h4>
        <RichMathMarkdown content={`For any single-qubit pure state, the total probability is conserved:
$$P(0) = |\\alpha|^2 = \\cos^2\\left(\\frac{\\theta}{2}\\right), \\quad P(1) = |\\beta|^2 = \\sin^2\\left(\\frac{\\theta}{2}\\right), \\quad P(0) + P(1) = 1$$
As the number of experimental shots $N \\to \\infty$, the relative frequency $N_0 / N$ converges strictly to theoretical probability $|\\alpha|^2$ by the Law of Large Numbers.`} />
      </div>
    </div>
  );
}
