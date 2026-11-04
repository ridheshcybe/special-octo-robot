"use client";

import React, { useState, useMemo, useEffect } from "react";
import { RichMathMarkdown } from "./RichMathMarkdown";

export interface SimControlDef {
  id: string;
  label: string;
  type: "slider" | "toggle" | "stepper" | "select";
  min?: number;
  max?: number;
  step?: number;
  default: any;
  unit?: string;
  options?: string[];
}

export interface SimCheckpoint {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DynamicInteractiveSimProps {
  title?: string;
  subjectCode?: string;
  simType?: "protocol" | "matrix" | "circuit" | "pipeline" | "algorithm" | "interactive_lab";
  theoryFormula?: string;
  theoryGuide?: string[];
  controls?: SimControlDef[];
  initialState?: Record<string, any>;
  checkpoints?: SimCheckpoint[];
  interactiveMode?: boolean;
}

export function DynamicInteractiveSim({
  title = "Interactive Engineering Simulator",
  subjectCode = "CSE1004",
  simType = "protocol",
  theoryFormula = "\\text{Total Latency} = T_{\\text{DNS}} + 2 \\cdot \\text{RTT}_{\\text{TCP}} + \\text{RTT}_{\\text{TLS}}",
  theoryGuide = [
    "Manipulate the interactive controls below to observe dynamic physical & protocol behavior.",
    "Inspect the real-time calculated metrics bar to verify governing mathematical equations.",
    "Complete the interactive checkpoints to test your understanding.",
  ],
  controls,
  initialState = {},
  checkpoints,
}: DynamicInteractiveSimProps) {
  // Determine canonical or resolved simulation type
  const resolvedType = useMemo(() => {
    if (simType) return simType;
    if (subjectCode === "CSE1001") return "matrix";
    if (subjectCode === "CSE1002") return "circuit";
    if (subjectCode === "CSE1003") return "pipeline";
    if (subjectCode === "CSE1004") return "protocol";
    if (subjectCode === "CSE1005") return "algorithm";
    return "interactive_lab";
  }, [simType, subjectCode]);

  // Robust default controls tailored to simulation type if not provided
  const activeControls: SimControlDef[] = useMemo(() => {
    if (controls && controls.length > 0) return controls;

    if (resolvedType === "circuit") {
      return [
        { id: "voltage", label: "Source Voltage (V)", type: "slider", min: 1, max: 24, step: 0.5, default: 12, unit: "V" },
        { id: "resistance", label: "Load Resistance (R)", type: "slider", min: 1, max: 50, step: 1, default: 10, unit: "Ω" },
        { id: "frequency", label: "AC Wave Frequency", type: "slider", min: 10, max: 200, step: 5, default: 50, unit: "Hz" },
        { id: "acMode", label: "AC Mode (Sine Wave)", type: "toggle", default: true },
      ];
    }

    if (resolvedType === "matrix") {
      return [
        { id: "a11", label: "Matrix a₁₁", type: "slider", min: -4, max: 4, step: 0.5, default: 2 },
        { id: "a12", label: "Matrix a₁₂", type: "slider", min: -4, max: 4, step: 0.5, default: 1 },
        { id: "a21", label: "Matrix a₂₁", type: "slider", min: -4, max: 4, step: 0.5, default: 1 },
        { id: "a22", label: "Matrix a₂₂", type: "slider", min: -4, max: 4, step: 0.5, default: 2 },
        { id: "vectorAngle", label: "Vector Angle θ", type: "slider", min: 0, max: 360, step: 5, default: 45, unit: "°" },
      ];
    }

    if (resolvedType === "pipeline") {
      return [
        { id: "clockStep", label: "Clock Cycle", type: "slider", min: 1, max: 12, step: 1, default: 3, unit: "cycles" },
        { id: "forwarding", label: "Hazard Forwarding", type: "toggle", default: true },
        { id: "branchPredict", label: "Branch Strategy", type: "select", options: ["2-Bit Dynamic (94% Hit)", "Static Always Taken", "No Prediction (3-Cycle Stall)"], default: "2-Bit Dynamic (94% Hit)" },
      ];
    }

    if (resolvedType === "algorithm") {
      return [
        { id: "inputSize", label: "Input Size (N)", type: "slider", min: 10, max: 500, step: 10, default: 100, unit: "items" },
        { id: "algorithm", label: "Algorithm Mode", type: "select", options: ["Merge Sort O(N log N)", "Binary Search O(log N)", "Bubble Sort O(N²)", "Hash Lookup O(1)"], default: "Merge Sort O(N log N)" },
        { id: "optimized", label: "In-Place Optimization", type: "toggle", default: true },
      ];
    }

    if (resolvedType === "interactive_lab") {
      return [
        { id: "paramA", label: "Amplitude / Drive (A)", type: "slider", min: 1, max: 50, step: 1, default: 25, unit: "arb" },
        { id: "paramB", label: "Frequency / Scaling (ω)", type: "slider", min: 1, max: 20, step: 1, default: 5, unit: "rad/s" },
        { id: "damping", label: "Damping Factor (ζ)", type: "slider", min: 0.1, max: 1.5, step: 0.1, default: 0.4, unit: "ratio" },
        { id: "feedback", label: "Active Feedback Loop", type: "toggle", default: true },
      ];
    }

    // Default protocol
    return [
      { id: "rttMs", label: "Network Round-Trip Time (RTT)", type: "slider", min: 10, max: 200, step: 5, default: 40, unit: "ms" },
      { id: "windowSize", label: "TCP Congestion Window (cwnd)", type: "slider", min: 2, max: 32, step: 2, default: 10, unit: "packets" },
      { id: "tlsVersion", label: "TLS Version", type: "select", options: ["TLS 1.3 (1-RTT)", "TLS 1.2 (2-RTT)", "Cleartext HTTP (0-RTT)"], default: "TLS 1.3 (1-RTT)" },
      { id: "packetLoss", label: "Simulate Packet Loss", type: "toggle", default: false },
    ];
  }, [controls, resolvedType]);

  // State initialization
  const [simState, setSimState] = useState<Record<string, any>>(() => {
    const s: Record<string, any> = { ...initialState };
    activeControls.forEach((c) => {
      if (s[c.id] === undefined) s[c.id] = c.default;
    });
    return s;
  });

  // Animation Engine (Continuous 60fps tick for moving electrons, packet beams, sine oscillations)
  const [isPlaying, setIsPlaying] = useState(true);
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimTick((prev) => (prev + 1) % 10000);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleControlChange = (id: string, val: any) => {
    setSimState((prev) => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    const s: Record<string, any> = { ...initialState };
    activeControls.forEach((c) => {
      s[c.id] = c.default;
    });
    setSimState(s);
    setAnimTick(0);
  };

  // ==========================================================================
  // DYNAMIC COMPUTED OUTPUT ENGINES (Tailored to every simulation type)
  // ==========================================================================

  // 1. BEE Circuit Computations
  const circuitMetrics = useMemo(() => {
    const v = Number(simState.voltage ?? 12);
    const r = Math.max(0.5, Number(simState.resistance ?? 10));
    const f = Number(simState.frequency ?? 50);
    const isAc = Boolean(simState.acMode ?? true);

    const current = v / r;
    const power = v * current;
    const periodMs = f > 0 ? (1000 / f).toFixed(1) : "0";
    const vPeak = isAc ? v * Math.SQRT2 : v;
    const isOverheating = power > 20;

    return {
      voltage: v,
      resistance: r,
      current,
      power,
      frequency: f,
      isAc,
      periodMs,
      vPeak,
      isOverheating,
      evalStr: `I = V / R = ${v.toFixed(1)}V / ${r.toFixed(1)}Ω = ${current.toFixed(2)}A  |  P = V × I = ${power.toFixed(1)}W`,
    };
  }, [simState]);

  // 2. FWT Web Protocol Computations
  const protocolMetrics = useMemo(() => {
    const rtt = Number(simState.rttMs ?? 40);
    const cwnd = Number(simState.windowSize ?? 10);
    const isTls13 = String(simState.tlsVersion ?? "TLS 1.3").includes("1.3");
    const isCleartext = String(simState.tlsVersion ?? "").includes("Cleartext");
    const loss = Boolean(simState.packetLoss);

    const dnsTime = 15;
    const tcpTime = rtt;
    const tlsTime = isCleartext ? 0 : isTls13 ? rtt : rtt * 2;
    const lossPenalty = loss ? rtt * 2 : 0;
    const totalHandshake = dnsTime + tcpTime + tlsTime + lossPenalty;
    const roundTrips = 1 + (isCleartext ? 0 : isTls13 ? 1 : 2) + (loss ? 1 : 0);
    const throughputMbps = ((cwnd * 1460 * 8) / (rtt / 1000) / 1_000_000).toFixed(1);

    return {
      rtt,
      cwnd,
      dnsTime,
      tcpTime,
      tlsTime,
      totalHandshake,
      roundTrips,
      lossPenalty,
      throughputMbps,
      evalStr: `T = 15ms (DNS) + ${tcpTime}ms (TCP) + ${tlsTime}ms (TLS)${loss ? ` + ${lossPenalty}ms (RTO)` : ""} = ${totalHandshake}ms`,
    };
  }, [simState]);

  // 3. ACM Matrix Linear Algebra Computations
  const matrixMetrics = useMemo(() => {
    const a = Number(simState.a11 ?? 2);
    const b = Number(simState.a12 ?? 1);
    const c = Number(simState.a21 ?? 1);
    const d = Number(simState.a22 ?? 2);
    const angleRad = ((Number(simState.vectorAngle ?? 45)) * Math.PI) / 180;

    const det = a * d - b * c;
    const trace = a + d;
    const discriminant = trace * trace - 4 * det;
    const isRealEigen = discriminant >= 0;
    const lambda1 = isRealEigen ? (trace + Math.sqrt(discriminant)) / 2 : null;
    const lambda2 = isRealEigen ? (trace - Math.sqrt(discriminant)) / 2 : null;

    const vx = Math.cos(angleRad);
    const vy = Math.sin(angleRad);
    const tx = a * vx + b * vy;
    const ty = c * vx + d * vy;
    const stretchRatio = Math.sqrt(tx * tx + ty * ty);

    return {
      a, b, c, d, det, trace, lambda1, lambda2, isRealEigen, vx, vy, tx, ty, stretchRatio,
      evalStr: `det(A) = (${a})(${d}) - (${b})(${c}) = ${det.toFixed(2)}  |  Trace = ${trace.toFixed(2)}  |  Tx Vector = [${tx.toFixed(2)}, ${ty.toFixed(2)}]`,
    };
  }, [simState]);

  // 4. COA Pipeline Computations
  const pipelineMetrics = useMemo(() => {
    const cycle = Number(simState.clockStep ?? 3);
    const forwarding = Boolean(simState.forwarding ?? true);
    const strategy = String(simState.branchPredict ?? "2-Bit Dynamic");
    const stalls = forwarding ? (strategy.includes("No Prediction") ? 2 : 0) : 2;
    const cpi = (1 + stalls / 5).toFixed(2);
    const mips = (3200 / Number(cpi)).toFixed(0);

    return {
      cycle,
      forwarding,
      stalls,
      cpi,
      mips,
      evalStr: `CPI = 1 + (Stalls / Instructions) = 1 + (${stalls}/5) = ${cpi}  |  Effective Throughput: ${mips} MIPS`,
    };
  }, [simState]);

  // 5. Python / Algorithm Computations
  const algorithmMetrics = useMemo(() => {
    const n = Number(simState.inputSize ?? 100);
    const algo = String(simState.algorithm ?? "Merge Sort O(N log N)");
    const opt = Boolean(simState.optimized ?? true);

    let ops = 0;
    let bigO = "O(N log N)";
    if (algo.includes("O(1)")) {
      ops = 1;
      bigO = "O(1)";
    } else if (algo.includes("O(log N)")) {
      ops = Math.round(Math.log2(n));
      bigO = "O(log N)";
    } else if (algo.includes("O(N²)")) {
      ops = Math.round((n * (n - 1)) / 2 * (opt ? 0.6 : 1.0));
      bigO = "O(N²)";
    } else {
      ops = Math.round(n * Math.log2(n) * (opt ? 0.8 : 1.0));
      bigO = "O(N log N)";
    }

    return {
      n,
      ops,
      bigO,
      evalStr: `Complexity: ${bigO}  |  N = ${n} elements  ➔  Estimated Operations: ${ops.toLocaleString()}`,
    };
  }, [simState]);

  // 6. Universal Interactive Lab Computations
  const labMetrics = useMemo(() => {
    const a = Number(simState.paramA ?? 25);
    const b = Number(simState.paramB ?? 5);
    const zeta = Number(simState.damping ?? 0.4);
    const peak = a * Math.exp(-zeta * 0.5);
    const rms = (a * 0.707).toFixed(1);
    const resonanceFreq = (b / (2 * Math.PI)).toFixed(1);

    return {
      a, b, zeta, peak, rms, resonanceFreq,
      evalStr: `Peak Response = ${peak.toFixed(2)}  |  RMS = ${rms}  |  Natural Freq f₀ = ${resonanceFreq} Hz`,
    };
  }, [simState]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        backgroundColor: "#0d0d11",
        borderRadius: "14px",
        border: "1px solid #26262c",
        padding: "22px",
        color: "#f3f1ea",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      {/* Simulation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ff3b1d",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "rgba(255,59,29,0.12)",
                border: "1px solid rgba(255,59,29,0.25)",
              }}
            >
              {subjectCode}
            </span>
            <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: isPlaying ? "#22c55e" : "#f59e0b",
                  boxShadow: isPlaying ? "0 0 8px #22c55e" : "none",
                }}
              />
              {isPlaying ? "Live Dynamic Engine (60 FPS)" : "Engine Paused"}
            </span>
            <span style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
              Type: {resolvedType}
            </span>
          </div>

          <h3 className="font-display" style={{ fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "4px" }}>
            {title}
          </h3>
        </div>

        {/* Engine Controls: Play/Pause, Step, Reset */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: "6px",
              backgroundColor: isPlaying ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
              border: isPlaying ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(245,158,11,0.4)",
              color: isPlaying ? "#86efac" : "#fde047",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "⏸ Pause Sim" : "▶ Resume Sim"}
          </button>

          <button
            type="button"
            onClick={() => setAnimTick((t) => t + 2)}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              backgroundColor: "#17171b",
              border: "1px solid #26262c",
              color: "#a19f95",
              cursor: "pointer",
            }}
          >
            ⏭ Step
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              backgroundColor: "#17171b",
              border: "1px solid #26262c",
              color: "#a19f95",
              cursor: "pointer",
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Governing Theory Formula Banner */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          backgroundColor: "#111114",
          border: "1px solid rgba(255,59,29,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#ff8c73", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Governing Equation:
          </span>
          <RichMathMarkdown content={`$${theoryFormula}$`} />
        </div>
        <span style={{ fontSize: "11px", color: "#4ade80", fontFamily: "var(--font-mono, monospace)" }}>
          ● Live Mathematical Binding
        </span>
      </div>

      {/* ===================================================================== */}
      {/* 🚀 DYNAMIC OUTPUT TELEMETRY DECK (The Real Output To Show!)          */}
      {/* ===================================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
          backgroundColor: "#08080a",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #1f1f26",
        }}
      >
        {resolvedType === "circuit" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Electric Current (I)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {circuitMetrics.current.toFixed(2)} <span style={{ fontSize: "12px", color: "#a19f95" }}>Amperes</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Power Dissipation (P)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: circuitMetrics.isOverheating ? "#ef4444" : "#ff3b1d", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {circuitMetrics.power.toFixed(1)} <span style={{ fontSize: "12px", color: "#a19f95" }}>Watts</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Thermal State</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: circuitMetrics.isOverheating ? "#f87171" : "#4ade80", marginTop: "4px" }}>
                {circuitMetrics.isOverheating ? "⚠️ Heavy Thermal Load" : "✓ Nominal Dissipation"}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>AC Wave Period (T)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#facc15", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {circuitMetrics.periodMs} <span style={{ fontSize: "12px", color: "#a19f95" }}>ms</span>
              </div>
            </div>
          </>
        )}

        {resolvedType === "protocol" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Total Handshake (T)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {protocolMetrics.totalHandshake} <span style={{ fontSize: "12px", color: "#a19f95" }}>ms</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Round Trips (RTT)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff3b1d", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {protocolMetrics.roundTrips} <span style={{ fontSize: "12px", color: "#a19f95" }}>Round Trips</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Calculated Throughput</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {protocolMetrics.throughputMbps} <span style={{ fontSize: "12px", color: "#a19f95" }}>Mbps</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Network Status</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: simState.packetLoss ? "#ef4444" : "#86efac", marginTop: "4px" }}>
                {simState.packetLoss ? "⚠️ Packet Drop (RTO Active)" : "✓ Fast-Path Stable"}
              </div>
            </div>
          </>
        )}

        {resolvedType === "matrix" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Determinant det(A)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff8c73", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {matrixMetrics.det.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Matrix Trace</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {matrixMetrics.trace.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Eigenvalues (λ)</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: matrixMetrics.isRealEigen ? "#4ade80" : "#f59e0b", marginTop: "4px" }}>
                {matrixMetrics.isRealEigen && matrixMetrics.lambda1 !== null
                  ? `λ₁=${matrixMetrics.lambda1.toFixed(1)}, λ₂=${matrixMetrics.lambda2?.toFixed(1)}`
                  : "Complex Conjugate"}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Invertibility State</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: Math.abs(matrixMetrics.det) > 0.001 ? "#4ade80" : "#ef4444", marginTop: "4px" }}>
                {Math.abs(matrixMetrics.det) > 0.001 ? "✓ Non-Singular (Invertible)" : "⚠️ Singular (Rank Deficient)"}
              </div>
            </div>
          </>
        )}

        {resolvedType === "pipeline" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Cycles Per Instruction</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff8c73", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {pipelineMetrics.cpi} <span style={{ fontSize: "12px", color: "#a19f95" }}>CPI</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Throughput (MIPS)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {pipelineMetrics.mips} <span style={{ fontSize: "12px", color: "#a19f95" }}>MIPS</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Pipeline Hazard Status</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: pipelineMetrics.forwarding ? "#4ade80" : "#ef4444", marginTop: "4px" }}>
                {pipelineMetrics.forwarding ? "✓ Bypassing Enabled (0 Stalls)" : "⚠️ 2-Cycle Bubble Injected"}
              </div>
            </div>
          </>
        )}

        {resolvedType === "algorithm" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Asymptotic Big-O</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#a855f7", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {algorithmMetrics.bigO}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Execution Operations</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {algorithmMetrics.ops.toLocaleString()} <span style={{ fontSize: "12px", color: "#a19f95" }}>ops</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Array Size (N)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {algorithmMetrics.n} <span style={{ fontSize: "12px", color: "#a19f95" }}>items</span>
              </div>
            </div>
          </>
        )}

        {resolvedType === "interactive_lab" && (
          <>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Peak Response</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff8c73", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {labMetrics.peak.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>RMS Energy Output</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {labMetrics.rms}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>Resonant Freq (f₀)</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                {labMetrics.resonanceFreq} <span style={{ fontSize: "12px", color: "#a19f95" }}>Hz</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Live Equation Step-by-Step Evaluator Bar */}
      <div
        style={{
          padding: "8px 14px",
          borderRadius: "6px",
          backgroundColor: "#08080a",
          border: "1px dashed #26262c",
          fontSize: "11px",
          fontFamily: "var(--font-mono, monospace)",
          color: "#4ade80",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <span style={{ color: "#a19f95", fontWeight: 700 }}>⚡ LIVE STEP EVALUATION:</span>
        <span>
          {resolvedType === "circuit" && circuitMetrics.evalStr}
          {resolvedType === "protocol" && protocolMetrics.evalStr}
          {resolvedType === "matrix" && matrixMetrics.evalStr}
          {resolvedType === "pipeline" && pipelineMetrics.evalStr}
          {resolvedType === "algorithm" && algorithmMetrics.evalStr}
          {resolvedType === "interactive_lab" && labMetrics.evalStr}
        </span>
      </div>

      {/* ===================================================================== */}
      {/* 🎨 DYNAMIC REACTIVE CANVAS & CONTROLS SPLIT VIEW                     */}
      {/* ===================================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "16px",
        }}
      >
        {/* Left: Reactive Graphical Canvas */}
        <div
          style={{
            backgroundColor: "#08080a",
            borderRadius: "10px",
            border: "1px solid #1f1f26",
            padding: "16px",
            minHeight: "340px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top Canvas Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a20", paddingBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase", fontWeight: 600 }}>
              Dynamic Visual Canvas • Real-Time Renderer
            </span>
            <span style={{ fontSize: "11px", color: isPlaying ? "#4ade80" : "#f59e0b", fontFamily: "var(--font-mono, monospace)" }}>
              Frame {animTick} • {isPlaying ? "60 FPS Streaming" : "Paused"}
            </span>
          </div>

          {/* 1. BEE CIRCUIT CANVAS */}
          {resolvedType === "circuit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px 0" }}>
              {/* Circuit Loop SVG with Moving Electron Particles */}
              <svg width="100%" height="150" viewBox="0 0 380 150" style={{ backgroundColor: "#0b0b0e", borderRadius: "8px", border: "1px solid #1a1a20" }}>
                {/* Wires */}
                <rect x="40" y="25" width="300" height="100" rx="6" fill="none" stroke="#26262c" strokeWidth="3" />

                {/* Animated Electron Flow Line (Velocity scales with current!) */}
                <rect
                  x="40"
                  y="25"
                  width="300"
                  height="100"
                  rx="6"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="8, 12"
                  strokeDashoffset={-animTick * (circuitMetrics.current * 0.8 + 0.5)}
                  opacity="0.8"
                />

                {/* DC/AC Power Supply on Left Wire */}
                <circle cx="40" cy="75" r="18" fill="#17171b" stroke="#38bdf8" strokeWidth="2" />
                <text x="40" y="80" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">
                  {circuitMetrics.isAc ? "∿" : "±"}
                </text>
                <text x="40" y="110" textAnchor="middle" fill="#807f78" fontSize="10" fontFamily="monospace">
                  {circuitMetrics.voltage}V
                </text>

                {/* Resistor Component on Top Wire (Glows red with thermal heat!) */}
                <rect
                  x="160"
                  y="17"
                  width="60"
                  height="16"
                  rx="3"
                  fill={circuitMetrics.isOverheating ? "rgba(239,68,68,0.4)" : "rgba(255,59,29,0.2)"}
                  stroke={circuitMetrics.isOverheating ? "#ef4444" : "#ff3b1d"}
                  strokeWidth="2"
                  filter={circuitMetrics.isOverheating ? "drop-shadow(0 0 6px #ef4444)" : "none"}
                />
                <text x="190" y="29" textAnchor="middle" fill="#f3f1ea" fontSize="10" fontWeight="bold">
                  {circuitMetrics.resistance} Ω
                </text>

                {/* Oscilloscope Mini Display on Bottom Wire */}
                <rect x="140" y="95" width="100" height="42" rx="4" fill="#08080a" stroke="#22c55e" strokeWidth="1" />
                <path
                  d={Array.from({ length: 20 }, (_, i) => {
                    const x = 145 + i * 4.5;
                    const y = 116 + Math.sin((i + animTick * (circuitMetrics.frequency / 30)) * 0.8) * (circuitMetrics.voltage * 0.6);
                    return `${i === 0 ? "M" : "L"} ${x} ${Math.max(98, Math.min(134, y))}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                />
                <text x="248" y="120" fill="#22c55e" fontSize="9" fontFamily="monospace">
                  {circuitMetrics.frequency}Hz
                </text>
              </svg>

              {/* Status Note */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#a19f95" }}>
                <span>Electrons traveling at speed $\propto$ {circuitMetrics.current.toFixed(2)}A</span>
                <span style={{ color: circuitMetrics.isOverheating ? "#f87171" : "#4ade80" }}>
                  Load Heat: {circuitMetrics.power.toFixed(1)}W
                </span>
              </div>
            </div>
          )}

          {/* 2. FWT PROTOCOL CANVAS */}
          {resolvedType === "protocol" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "12px 0" }}>
              {/* Nodes and Packet Transit Beam */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px" }}>🖥️</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#f3f1ea" }}>Browser</div>
                  <div style={{ fontSize: "9px", color: "#807f78", fontFamily: "monospace" }}>Client Node</div>
                </div>

                {/* Animated Packet Stream Line */}
                <div style={{ flex: 1, margin: "0 14px", position: "relative" }}>
                  <div style={{ height: "3px", backgroundColor: "#1f1f26", width: "100%", borderRadius: "2px" }} />
                  {/* Dynamic Moving Packet */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      left: `${((animTick * 6) % 95) + 2}%`,
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: simState.packetLoss ? "#ef4444" : "#38bdf8",
                      boxShadow: simState.packetLoss ? "0 0 10px #ef4444" : "0 0 10px #38bdf8",
                      transition: "left 0.05s linear",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "10px",
                      color: simState.packetLoss ? "#fca5a5" : "#86efac",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                    }}
                  >
                    {simState.packetLoss ? "❌ Packet Dropped (RTO Retransmit)" : `⚡ Transit (${simState.rttMs}ms RTT)`}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px" }}>🌐</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#f3f1ea" }}>Web Origin</div>
                  <div style={{ fontSize: "9px", color: "#ff3b1d", fontFamily: "monospace" }}>prepmeupai.in</div>
                </div>
              </div>

              {/* Dynamic Handshake Gantt / Waterfall Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#0b0b0e", padding: "10px", borderRadius: "8px", border: "1px solid #1a1a20" }}>
                <div style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>
                  Interactive Handshake Timeline ({protocolMetrics.totalHandshake} ms total)
                </div>
                {/* DNS Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px" }}>
                  <span style={{ width: "80px", color: "#a19f95" }}>1. DNS Lookup</span>
                  <div style={{ width: `${Math.min(100, (protocolMetrics.dnsTime / protocolMetrics.totalHandshake) * 220)}px`, height: "8px", borderRadius: "3px", backgroundColor: "#38bdf8" }} />
                  <span style={{ color: "#38bdf8" }}>{protocolMetrics.dnsTime}ms</span>
                </div>
                {/* TCP Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px" }}>
                  <span style={{ width: "80px", color: "#a19f95" }}>2. TCP 3-Way</span>
                  <div style={{ width: `${Math.min(100, (protocolMetrics.tcpTime / protocolMetrics.totalHandshake) * 220)}px`, height: "8px", borderRadius: "3px", backgroundColor: "#4ade80" }} />
                  <span style={{ color: "#4ade80" }}>{protocolMetrics.tcpTime}ms (1 RTT)</span>
                </div>
                {/* TLS Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px" }}>
                  <span style={{ width: "80px", color: "#a19f95" }}>3. {simState.tlsVersion}</span>
                  <div style={{ width: `${Math.min(100, (protocolMetrics.tlsTime / protocolMetrics.totalHandshake) * 220)}px`, height: "8px", borderRadius: "3px", backgroundColor: "#a855f7" }} />
                  <span style={{ color: "#a855f7" }}>{protocolMetrics.tlsTime}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. ACM MATRIX CANVAS */}
          {resolvedType === "matrix" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", gap: "8px" }}>
              <svg width="240" height="170" viewBox="-6 -6 12 12" style={{ border: "1px solid #1a1a20", borderRadius: "8px", backgroundColor: "#0b0b0e" }}>
                {/* Grid Axes */}
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#26262c" strokeWidth="0.1" />
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#26262c" strokeWidth="0.1" />

                {/* Transformed Unit Square Polygon */}
                <polygon
                  points={`0,0 ${matrixMetrics.a},${-matrixMetrics.c} ${matrixMetrics.a + matrixMetrics.b},${-(matrixMetrics.c + matrixMetrics.d)} ${matrixMetrics.b},${-matrixMetrics.d}`}
                  fill="rgba(255, 59, 29, 0.15)"
                  stroke="#ff3b1d"
                  strokeWidth="0.15"
                />

                {/* Basis Vector i' */}
                <line x1="0" y1="0" x2={matrixMetrics.a} y2={-matrixMetrics.c} stroke="#ff3b1d" strokeWidth="0.3" strokeLinecap="round" />
                {/* Basis Vector j' */}
                <line x1="0" y1="0" x2={matrixMetrics.b} y2={-matrixMetrics.d} stroke="#38bdf8" strokeWidth="0.3" strokeLinecap="round" />

                {/* Interactive Probe Vector */}
                <line x1="0" y1="0" x2={matrixMetrics.vx} y2={-matrixMetrics.vy} stroke="#807f78" strokeWidth="0.15" strokeDasharray="0.3, 0.3" />
                <line x1="0" y1="0" x2={matrixMetrics.tx} y2={-matrixMetrics.ty} stroke="#4ade80" strokeWidth="0.35" strokeLinecap="round" />
              </svg>

              <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)" }}>
                <span style={{ color: "#ff8c73" }}>det(A) = {matrixMetrics.det.toFixed(2)}</span>
                <span style={{ color: "#4ade80" }}>Probe |Ax| = {matrixMetrics.stretchRatio.toFixed(2)}x</span>
                {matrixMetrics.isRealEigen && matrixMetrics.lambda1 !== null && (
                  <span style={{ color: "#38bdf8" }}>λ₁ = {matrixMetrics.lambda1.toFixed(2)}</span>
                )}
              </div>
            </div>
          )}

          {/* 4. COA PIPELINE CANVAS */}
          {resolvedType === "pipeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", textAlign: "center" }}>
                {["IF (Fetch)", "ID (Decode)", "EX (Execute)", "MEM (Memory)", "WB (Writeback)"].map((st, sIdx) => {
                  const isCurrent = sIdx === (pipelineMetrics.cycle + animTick) % 5;
                  return (
                    <div
                      key={st}
                      style={{
                        padding: "12px 4px",
                        borderRadius: "6px",
                        backgroundColor: isCurrent ? "rgba(255,59,29,0.2)" : "#111114",
                        border: isCurrent ? "1px solid #ff3b1d" : "1px solid #26262c",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: isCurrent ? "#ff8c73" : "#807f78",
                        boxShadow: isCurrent ? "0 0 10px rgba(255,59,29,0.3)" : "none",
                      }}
                    >
                      {st}
                    </div>
                  );
                })}
              </div>

              {/* Forwarding Bus Schematic */}
              <div
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  backgroundColor: "#0b0b0e",
                  border: pipelineMetrics.forwarding ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                Forwarding Bypasses:{" "}
                <strong style={{ color: pipelineMetrics.forwarding ? "#4ade80" : "#f87171" }}>
                  {pipelineMetrics.forwarding ? "ACTIVE (EX/MEM ➔ EX bypass operational)" : "DISABLED (2 bubble stalls inserted)"}
                </strong>
              </div>
            </div>
          )}

          {/* 5. PYTHON / ALGORITHM CANVAS */}
          {resolvedType === "algorithm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
              <div style={{ fontSize: "11px", color: "#a19f95" }}>Algorithm Operations Growth Curve:</div>
              {/* Dynamic Operations Bar Chart */}
              <div style={{ display: "flex", alignItems: "flex-end", height: "100px", gap: "6px", backgroundColor: "#0b0b0e", padding: "10px", borderRadius: "8px", border: "1px solid #1a1a20" }}>
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, idx) => {
                  const val = Math.min(100, Math.round(algorithmMetrics.ops * step * 0.08 + 10));
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "100%", height: `${val}px`, borderRadius: "3px 3px 0 0", backgroundColor: idx === 4 ? "#ff3b1d" : "#38bdf8", transition: "height 0.2s" }} />
                      <span style={{ fontSize: "9px", color: "#807f78" }}>{(algorithmMetrics.n * step).toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: "11px", color: "#4ade80", textAlign: "center" }}>
                Operation Complexity: <strong>{algorithmMetrics.bigO}</strong> (N = {algorithmMetrics.n})
              </div>
            </div>
          )}

          {/* 6. UNIVERSAL INTERACTIVE LAB / DYNAMIC CURVE PLOTTER */}
          {resolvedType === "interactive_lab" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
              <svg width="100%" height="150" viewBox="0 0 360 150" style={{ backgroundColor: "#0b0b0e", borderRadius: "8px", border: "1px solid #1a1a20" }}>
                {/* Grid Lines */}
                <line x1="20" y1="75" x2="340" y2="75" stroke="#26262c" strokeWidth="1" />
                <line x1="180" y1="10" x2="180" y2="140" stroke="#26262c" strokeWidth="1" />

                {/* Dynamic Responsive Curve */}
                <path
                  d={Array.from({ length: 80 }, (_, i) => {
                    const x = 20 + i * 4;
                    const t = (i - 40) * 0.2;
                    const a = labMetrics.a * 0.8;
                    const b = labMetrics.b * 0.4;
                    const z = labMetrics.zeta;
                    const phase = animTick * 0.1;
                    const y = 75 - a * Math.sin(b * t + phase) * Math.exp(-Math.abs(t) * z * 0.4);
                    return `${i === 0 ? "M" : "L"} ${x} ${Math.max(15, Math.min(135, y))}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#ff3b1d"
                  strokeWidth="2"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#807f78" }}>
                <span>Damped Waveform Dynamic Response</span>
                <span style={{ color: "#ff8c73" }}>Peak: {labMetrics.peak.toFixed(1)} arb</span>
              </div>
            </div>
          )}

          {/* Dynamic Canvas Footer Status */}
          <div
            style={{
              borderTop: "1px solid #1a1a20",
              paddingTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              fontFamily: "var(--font-mono, monospace)",
              color: "#a19f95",
            }}
          >
            <span>State: <strong style={{ color: "#4ade80" }}>Active Reactive</strong></span>
            <span>Controls: {activeControls.length} bound</span>
          </div>
        </div>

        {/* Right: Interactive Controls Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            backgroundColor: "#111114",
            borderRadius: "10px",
            border: "1px solid #26262c",
            padding: "18px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#f3f1ea" }}>
              Interactive Controls
            </span>
            <span style={{ fontSize: "10px", color: "#ff8c73", fontFamily: "var(--font-mono, monospace)" }}>
              {activeControls.length} Variables
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "280px", paddingRight: "4px" }}>
            {activeControls.map((ctrl) => {
              const currentVal = simState[ctrl.id] ?? ctrl.default;

              if (ctrl.type === "slider") {
                return (
                  <div key={ctrl.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <label style={{ color: "#a19f95" }}>{ctrl.label}</label>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", color: "#ff3b1d", fontWeight: 700 }}>
                        {currentVal} {ctrl.unit || ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min ?? 0}
                      max={ctrl.max ?? 100}
                      step={ctrl.step ?? 1}
                      value={currentVal}
                      onChange={(e) => handleControlChange(ctrl.id, Number(e.target.value))}
                      style={{ accentColor: "#ff3b1d", cursor: "pointer", width: "100%" }}
                    />
                  </div>
                );
              }

              if (ctrl.type === "toggle") {
                return (
                  <div key={ctrl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                    <label style={{ fontSize: "11px", color: "#a19f95" }}>{ctrl.label}</label>
                    <button
                      type="button"
                      onClick={() => handleControlChange(ctrl.id, !currentVal)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: currentVal ? "#ff3b1d" : "#26262c",
                        color: currentVal ? "#08080a" : "#807f78",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {currentVal ? "ON" : "OFF"}
                    </button>
                  </div>
                );
              }

              if (ctrl.type === "select" && ctrl.options) {
                return (
                  <div key={ctrl.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#a19f95" }}>{ctrl.label}</label>
                    <select
                      value={currentVal}
                      onChange={(e) => handleControlChange(ctrl.id, e.target.value)}
                      className="pmu-input"
                      style={{ fontSize: "11px", padding: "6px" }}
                    >
                      {ctrl.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>

      {/* Interactive Checkpoint Challenges */}
      {checkpoints && checkpoints.length > 0 && (
        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f3f1ea", textTransform: "uppercase" }}>
              💡 Interactive Comprehension Checkpoints
            </span>
            <span style={{ fontSize: "10px", color: "#807f78" }}>
              Adjust the controls above to verify your calculations
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {checkpoints.map((cp, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === cp.correctIndex;

              return (
                <div
                  key={qIdx}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#111114",
                    border: isAnswered
                      ? isCorrect
                        ? "1px solid rgba(34,197,94,0.4)"
                        : "1px solid rgba(239,68,68,0.4)"
                      : "1px solid #1f1f26",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#f3f1ea", marginBottom: "8px" }}>
                    Q{qIdx + 1}: {cp.question}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {cp.options.map((opt, oIdx) => {
                      const active = selectedOpt === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                            setShowExplanation((prev) => ({ ...prev, [qIdx]: true }));
                          }}
                          style={{
                            padding: "6px 10px",
                            textAlign: "left",
                            borderRadius: "4px",
                            fontSize: "11px",
                            backgroundColor: active ? (oIdx === cp.correctIndex ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)") : "#17171b",
                            border: active ? (oIdx === cp.correctIndex ? "1px solid #22c55e" : "1px solid #ef4444") : "1px solid #26262c",
                            color: active ? "#f3f1ea" : "#a19f95",
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation[qIdx] && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: isCorrect ? "#86efac" : "#fca5a5",
                        backgroundColor: isCorrect ? "rgba(3,46,21,0.2)" : "rgba(70,8,9,0.2)",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      {isCorrect ? "✓ Correct! " : "✕ Incorrect. "} {cp.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
