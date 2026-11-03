"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

interface Complex {
  re: number;
  im: number;
}

export function QubitBlochVisualizer() {
  // Statevector components: alpha = reA + i*imA, beta = reB + i*imB
  // Initial state: |0> (alpha = 1, beta = 0)
  const [alpha, setAlpha] = useState<Complex>({ re: 1, im: 0 });
  const [beta, setBeta] = useState<Complex>({ re: 0, im: 0 });
  const [history, setHistory] = useState<string[]>(["Initialized |0⟩"]);
  const [lastMeasurement, setLastMeasurement] = useState<number | null>(null);

  // Probabilities: P(0) = |alpha|^2, P(1) = |beta|^2
  const prob0 = Math.max(0, Math.min(1, alpha.re * alpha.re + alpha.im * alpha.im));
  const prob1 = Math.max(0, Math.min(1, beta.re * beta.re + beta.im * beta.im));

  // Compute Bloch angles:
  // |psi> = cos(theta/2)|0> + e^(i*phi)*sin(theta/2)|1>
  // theta = 2 * acos(min(1, sqrt(prob0)))
  const theta = 2 * Math.acos(Math.min(1, Math.sqrt(prob0)));
  // phi from beta / sin(theta/2)
  const sinHalfTheta = Math.sin(theta / 2);
  let phi = 0;
  if (sinHalfTheta > 0.001) {
    phi = Math.atan2(beta.im, beta.re);
    if (phi < 0) phi += 2 * Math.PI;
  }

  // 3D Cartesian coordinates of Bloch vector:
  // x = sin(theta) * cos(phi)
  // y = sin(theta) * sin(phi)
  // z = cos(theta)
  const bx = Math.sin(theta) * Math.cos(phi);
  const by = Math.sin(theta) * Math.sin(phi);
  const bz = Math.cos(theta);

  // Apply Single-Qubit Unitary Gate
  const applyGate = (gateName: string) => {
    setLastMeasurement(null);
    let newA = { ...alpha };
    let newB = { ...beta };

    if (gateName === "X") {
      // Pauli-X: [0 1; 1 0] => swaps alpha and beta
      newA = { ...beta };
      newB = { ...alpha };
    } else if (gateName === "Y") {
      // Pauli-Y: [0 -i; i 0]
      // newA = -i * beta = (beta.im, -beta.re)
      // newB = i * alpha = (-alpha.im, alpha.re)
      newA = { re: beta.im, im: -beta.re };
      newB = { re: -alpha.im, im: alpha.re };
    } else if (gateName === "Z") {
      // Pauli-Z: [1 0; 0 -1]
      newA = { re: alpha.re, im: alpha.im };
      newB = { re: -beta.re, im: -beta.im };
    } else if (gateName === "H") {
      // Hadamard: 1/sqrt(2) * [1 1; 1 -1]
      const invSqrt2 = 1 / Math.SQRT2;
      newA = {
        re: (alpha.re + beta.re) * invSqrt2,
        im: (alpha.im + beta.im) * invSqrt2,
      };
      newB = {
        re: (alpha.re - beta.re) * invSqrt2,
        im: (alpha.im - beta.im) * invSqrt2,
      };
    } else if (gateName === "S") {
      // Phase S: [1 0; 0 i] => alpha unchanged, beta multiplied by i
      newA = { ...alpha };
      newB = { re: -beta.im, im: beta.re };
    } else if (gateName === "T") {
      // Phase T: [1 0; 0 e^(i*pi/4)]
      // e^(i*pi/4) = cos(pi/4) + i*sin(pi/4) = (1+i)/sqrt(2)
      const c = Math.cos(Math.PI / 4);
      const s = Math.sin(Math.PI / 4);
      newA = { ...alpha };
      newB = {
        re: beta.re * c - beta.im * s,
        im: beta.re * s + beta.im * c,
      };
    }

    // Renormalize to avoid floating-point drift
    const norm = Math.sqrt(newA.re ** 2 + newA.im ** 2 + newB.re ** 2 + newB.im ** 2);
    if (norm > 0) {
      newA.re /= norm;
      newA.im /= norm;
      newB.re /= norm;
      newB.im /= norm;
    }

    setAlpha(newA);
    setBeta(newB);
    setHistory((prev) => [`Applied ${gateName} gate`, ...prev.slice(0, 4)]);
  };

  // Measurement in computational Z-basis
  const measureQubit = () => {
    const rand = Math.random();
    const outcome = rand < prob0 ? 0 : 1;
    setLastMeasurement(outcome);

    if (outcome === 0) {
      setAlpha({ re: 1, im: 0 });
      setBeta({ re: 0, im: 0 });
      setHistory((prev) => [`Measured 0 (Collapsed to |0⟩)`, ...prev.slice(0, 4)]);
    } else {
      setAlpha({ re: 0, im: 0 });
      setBeta({ re: 1, im: 0 });
      setHistory((prev) => [`Measured 1 (Collapsed to |1⟩)`, ...prev.slice(0, 4)]);
    }
  };

  // Reset state to |0>
  const resetQubit = () => {
    setAlpha({ re: 1, im: 0 });
    setBeta({ re: 0, im: 0 });
    setLastMeasurement(null);
    setHistory(["Reset to ground state |0⟩"]);
  };

  // SVG 2.5D Isometric Bloch Sphere Projection
  const centerX = 160;
  const centerY = 160;
  const radius = 110;

  // Isometric projection coordinates for Bloch Vector tip:
  // px = centerX + radius * (bx * cos(30°) - by * cos(30°))
  // py = centerY - radius * (bz - (bx + by) * 0.28)
  const px = centerX + radius * (bx * 0.82 - by * 0.52);
  const py = centerY - radius * (bz * 0.88 + (bx - by) * 0.22);

  return (
    <div className="pmu-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge" style={{ backgroundColor: "rgba(0, 230, 118, 0.15)", color: "#00e676", borderColor: "rgba(0, 230, 118, 0.4)" }}>
              ⭐ FREE PREVIEW SIMULATION
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
              Module 1: Essentials
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "28px", marginTop: "8px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Qubit State Visualizer & Bloch Sphere
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Unitary rotations, statevector coordinates, and measurement wavefunction collapse on the 3D Bloch sphere.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={resetQubit}
            className="pmu-btn-secondary"
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            Reset to |0⟩
          </button>
          <Link
            href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q1-04"
            className="pmu-btn-primary"
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            Go to Lesson 1.4 →
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "24px", alignItems: "center" }}>
        {/* Visual 3D Bloch Sphere SVG */}
        <div style={{ backgroundColor: "#111114", border: "1px solid rgba(243, 241, 234, 0.1)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "320px", height: "320px", position: "relative" }}>
            <svg width="320" height="320" viewBox="0 0 320 320" style={{ overflow: "visible" }}>
              {/* Outer Sphere Circle */}
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(243, 241, 234, 0.18)" strokeWidth="2" />

              {/* Equator Ellipse */}
              <ellipse cx={centerX} cy={centerY} rx={radius} ry={radius * 0.32} fill="rgba(255, 59, 29, 0.04)" stroke="rgba(255, 106, 61, 0.35)" strokeDasharray="4 4" strokeWidth="1.5" />

              {/* Z Axis (North |0>, South |1>) */}
              <line x1={centerX} y1={centerY - radius - 20} x2={centerX} y2={centerY + radius + 20} stroke="rgba(243, 241, 234, 0.4)" strokeWidth="1.5" />
              <text x={centerX + 8} y={centerY - radius - 8} fill="#00e676" fontSize="13" fontWeight="bold" fontFamily="monospace">
                |0⟩ (+Z)
              </text>
              <text x={centerX + 8} y={centerY + radius + 18} fill="#ff3b1d" fontSize="13" fontWeight="bold" fontFamily="monospace">
                |1⟩ (-Z)
              </text>

              {/* X & Y Axes */}
              <line x1={centerX - radius * 0.85} y1={centerY + radius * 0.28} x2={centerX + radius * 0.85} y2={centerY - radius * 0.28} stroke="rgba(243, 241, 234, 0.2)" strokeWidth="1" />
              <text x={centerX + radius * 0.88} y={centerY - radius * 0.25} fill="#807f78" fontSize="11" fontFamily="monospace">
                +X
              </text>
              <line x1={centerX - radius * 0.7} y1={centerY - radius * 0.2} x2={centerX + radius * 0.7} y2={centerY + radius * 0.2} stroke="rgba(243, 241, 234, 0.2)" strokeWidth="1" />
              <text x={centerX + radius * 0.72} y={centerY + radius * 0.22} fill="#807f78" fontSize="11" fontFamily="monospace">
                +Y
              </text>

              {/* Vector to current state (Orange glow line) */}
              <line
                x1={centerX}
                y1={centerY}
                x2={px}
                y2={py}
                stroke="#ff6a3d"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Bloch Vector Tip */}
              <circle cx={px} cy={py} r="7" fill="#ff3b1d" stroke="#f3f1ea" strokeWidth="2" />
              <text x={px + 10} y={py - 6} fill="#f3f1ea" fontSize="13" fontWeight="bold" fontFamily="monospace">
                |ψ⟩
              </text>
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "12px", fontSize: "12px", fontFamily: "monospace", color: "#807f78" }}>
            <span>θ: {(theta * 180 / Math.PI).toFixed(1)}°</span>
            <span>φ: {(phi * 180 / Math.PI).toFixed(1)}°</span>
            <span>r: [{(bx).toFixed(2)}, {(by).toFixed(2)}, {(bz).toFixed(2)}]</span>
          </div>
        </div>

        {/* Interactive Controls & State Telemetry */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Unitary Gate Palette */}
          <div>
            <label className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
              Apply Unitary Quantum Gate
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginTop: "8px" }}>
              {[
                { name: "X", desc: "Bit Flip" },
                { name: "Y", desc: "Bit & Phase" },
                { name: "Z", desc: "Phase Flip" },
                { name: "H", desc: "Hadamard" },
                { name: "S", desc: "π/2 Phase" },
                { name: "T", desc: "π/4 Phase" },
              ].map((g) => (
                <button
                  key={g.name}
                  onClick={() => applyGate(g.name)}
                  className="pmu-btn-primary"
                  style={{
                    padding: "12px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                  }}
                  title={g.desc}
                >
                  <span className="font-display" style={{ fontSize: "18px" }}>{g.name}</span>
                  <span style={{ fontSize: "9px", opacity: 0.8 }}>{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Statevector & Probabilities */}
          <div style={{ backgroundColor: "#17171b", border: "1px solid rgba(243, 241, 234, 0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="font-mono" style={{ fontSize: "12px", color: "#f3f1ea" }}>
                Statevector Coefficients:
              </span>
              <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
                |α|² + |β|² = {(prob0 + prob1).toFixed(2)}
              </span>
            </div>

            <div className="font-mono" style={{ fontSize: "13px", padding: "10px", backgroundColor: "#08080a", borderRadius: "6px", border: "1px solid rgba(243, 241, 234, 0.1)" }}>
              <div>α (|0⟩): {alpha.re.toFixed(3)} {alpha.im >= 0 ? `+ ${alpha.im.toFixed(3)}i` : `- ${Math.abs(alpha.im).toFixed(3)}i`}</div>
              <div style={{ marginTop: "4px" }}>β (|1⟩): {beta.re.toFixed(3)} {beta.im >= 0 ? `+ ${beta.im.toFixed(3)}i` : `- ${Math.abs(beta.im).toFixed(3)}i`}</div>
            </div>

            {/* Probability Bars */}
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  <span>P(0) = |α|²</span>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>{(prob0 * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#08080a", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${prob0 * 100}%`, height: "100%", backgroundColor: "#00e676", transition: "width 0.3s ease" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>
                  <span>P(1) = |β|²</span>
                  <span style={{ color: "#ff3b1d", fontWeight: "bold" }}>{(prob1 * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#08080a", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${prob1 * 100}%`, height: "100%", backgroundColor: "#ff3b1d", transition: "width 0.3s ease" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Projective Measurement Action */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={measureQubit}
              className="pmu-btn-primary"
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#00e676",
                color: "#08080a",
                fontWeight: "bold",
              }}
            >
              🎲 Measure Qubit (Collapse)
            </button>
            {lastMeasurement !== null && (
              <div style={{ padding: "8px 16px", backgroundColor: "#111114", border: `2px solid ${lastMeasurement === 0 ? "#00e676" : "#ff3b1d"}`, borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>Collapsed:</span>
                <div className="font-display" style={{ fontSize: "20px", color: lastMeasurement === 0 ? "#00e676" : "#ff3b1d" }}>
                  |{lastMeasurement}⟩
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mathematical Formulation */}
      <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px" }}>
        <h4 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "6px" }}>
          Mathematical Formulation
        </h4>
        <RichMathMarkdown content={`The general pure qubit state parameterization on the Bloch sphere is:
$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$
Where polar angle $\\theta \\in [0, \\pi]$ controls the superposition balance between $|0\\rangle$ and $|1\\rangle$, and azimuthal angle $\\phi \\in [0, 2\\pi)$ represents the relative quantum phase.`} />
      </div>
    </div>
  );
}
