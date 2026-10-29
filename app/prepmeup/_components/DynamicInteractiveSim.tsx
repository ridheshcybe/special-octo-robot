"use client";

import React, { useState, useMemo } from "react";
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
  controls = [
    { id: "rttMs", label: "Network Round-Trip Time (RTT)", type: "slider", min: 10, max: 200, step: 5, default: 40, unit: "ms" },
    { id: "windowSize", label: "TCP Congestion Window (cwnd)", type: "slider", min: 2, max: 32, step: 2, default: 10, unit: "packets" },
    { id: "tlsVersion", label: "TLS Version", type: "select", options: ["TLS 1.3 (1-RTT)", "TLS 1.2 (2-RTT)", "Cleartext HTTP (0-RTT)"], default: "TLS 1.3 (1-RTT)" },
    { id: "packetLoss", label: "Simulate Packet Loss", type: "toggle", default: false },
  ],
  initialState = {},
  checkpoints = [
    {
      question: "How many round trips are required for TCP + TLS 1.3 handshakes before first request byte?",
      options: ["A) 1 RTT", "B) 2 RTT (1 TCP + 1 TLS 1.3)", "C) 3 RTT", "D) 0 RTT"],
      correctIndex: 1,
      explanation: "Standard TCP connection requires 1 RTT (SYN → SYN-ACK), followed by TLS 1.3's single RTT key exchange, totaling 2 RTTs.",
    },
  ],
}: DynamicInteractiveSimProps) {
  // Initialize state from controls defaults + initialState
  const [simState, setSimState] = useState<Record<string, any>>(() => {
    const s: Record<string, any> = { ...initialState };
    controls.forEach((c) => {
      if (s[c.id] === undefined) s[c.id] = c.default;
    });
    // Defaults for matrix if missing
    if (simType === "matrix") {
      if (s.a11 === undefined) s.a11 = 2;
      if (s.a12 === undefined) s.a12 = 1;
      if (s.a21 === undefined) s.a21 = 1;
      if (s.a22 === undefined) s.a22 = 2;
      if (s.vectorAngle === undefined) s.vectorAngle = 45;
    }
    // Defaults for pipeline if missing
    if (simType === "pipeline") {
      if (s.forwarding === undefined) s.forwarding = true;
      if (s.clockStep === undefined) s.clockStep = 3;
    }
    return s;
  });

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleControlChange = (id: string, val: any) => {
    setSimState((prev) => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    const s: Record<string, any> = { ...initialState };
    controls.forEach((c) => {
      s[c.id] = c.default;
    });
    setSimState(s);
    setActiveStep(0);
  };

  // --- Dynamic Protocol Simulation Calculations (Web Tech / CSE1004) ---
  const protocolMetrics = useMemo(() => {
    const rtt = Number(simState.rttMs) || 40;
    const isTls13 = String(simState.tlsVersion).includes("1.3");
    const isCleartext = String(simState.tlsVersion).includes("Cleartext");
    const loss = Boolean(simState.packetLoss);

    const dnsTime = 15;
    const tcpTime = rtt;
    const tlsTime = isCleartext ? 0 : isTls13 ? rtt : rtt * 2;
    const lossPenalty = loss ? rtt * 2 : 0;
    const totalHandshake = dnsTime + tcpTime + tlsTime + lossPenalty;
    const roundTrips = 1 + (isCleartext ? 0 : isTls13 ? 1 : 2) + (loss ? 1 : 0);

    return { dnsTime, tcpTime, tlsTime, totalHandshake, roundTrips, lossPenalty };
  }, [simState]);

  // --- Dynamic Matrix Simulation Calculations (ACM / CSE1001) ---
  const matrixMetrics = useMemo(() => {
    const a = Number(simState.a11 ?? 2);
    const b = Number(simState.a12 ?? 1);
    const c = Number(simState.a21 ?? 1);
    const d = Number(simState.a22 ?? 2);
    const angleRad = ((Number(simState.vectorAngle) || 45) * Math.PI) / 180;

    const det = a * d - b * c;
    const trace = a + d;
    const discriminant = trace * trace - 4 * det;
    const isRealEigen = discriminant >= 0;
    const lambda1 = isRealEigen ? (trace + Math.sqrt(discriminant)) / 2 : null;
    const lambda2 = isRealEigen ? (trace - Math.sqrt(discriminant)) / 2 : null;

    // Vector probe (x, y)
    const vx = Math.cos(angleRad);
    const vy = Math.sin(angleRad);
    const tx = a * vx + b * vy;
    const ty = c * vx + d * vy;

    return { a, b, c, d, det, trace, lambda1, lambda2, isRealEigen, vx, vy, tx, ty };
  }, [simState]);

  // --- Dynamic Circuit / Pipeline Calculations ---
  const pipelineMetrics = useMemo(() => {
    const cycle = Number(simState.clockStep ?? 3);
    const forwarding = Boolean(simState.forwarding ?? true);
    const stalls = forwarding ? 0 : 2;
    const cpi = (1 + stalls / 4).toFixed(2);
    return { cycle, forwarding, stalls, cpi };
  }, [simState]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        backgroundColor: "#0d0d11",
        borderRadius: "12px",
        border: "1px solid #26262c",
        padding: "20px",
        color: "#f3f1ea",
      }}
    >
      {/* Simulation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
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
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
              Live Interactive Sandbox
            </span>
          </div>
          <h3 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "4px" }}>
            {title}
          </h3>
        </div>

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
          ↺ Reset Parameters
        </button>
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
        <span style={{ fontSize: "11px", color: "#807f78" }}>Real-time Parameter Binding</span>
      </div>

      {/* Main Simulation Viewport: Canvas + Controls Split */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "16px",
        }}
      >
        {/* Left: Dynamic Visual Graphical Canvas */}
        <div
          style={{
            backgroundColor: "#08080a",
            borderRadius: "10px",
            border: "1px solid #1f1f26",
            padding: "16px",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Visual Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a20", paddingBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase", fontWeight: 600 }}>
              Dynamic Simulation Canvas
            </span>
            <span style={{ fontSize: "11px", color: "#4ade80", fontFamily: "var(--font-mono, monospace)" }}>
              60 FPS Vector State
            </span>
          </div>

          {/* Canvas Rendering based on simType */}
          {simType === "protocol" && (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Nodes Diagram */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px" }}>🖥️</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#f3f1ea" }}>Client Browser</div>
                  <div style={{ fontSize: "9px", color: "#807f78", fontFamily: "monospace" }}>192.168.1.100</div>
                </div>

                {/* Animated Packet Stream Line */}
                <div style={{ flex: 1, margin: "0 14px", position: "relative" }}>
                  <div style={{ height: "2px", backgroundColor: "#26262c", width: "100%" }} />
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor: simState.packetLoss ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
                      border: simState.packetLoss ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(34,197,94,0.4)",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: simState.packetLoss ? "#fca5a5" : "#86efac",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {simState.packetLoss ? "⚠️ Packet Dropped (RTO Active)" : `⚡ Transit (${simState.rttMs}ms RTT)`}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px" }}>🌐</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#f3f1ea" }}>Web Origin Server</div>
                  <div style={{ fontSize: "9px", color: "#ff3b1d", fontFamily: "monospace" }}>prepmeupai.in:443</div>
                </div>
              </div>

              {/* Handshake Stages Packet Log */}
              <div
                style={{
                  backgroundColor: "#0d0d11",
                  borderRadius: "6px",
                  padding: "10px",
                  border: "1px solid #1a1a20",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "11px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ color: "#38bdf8" }}>1. [DNS] prepmeupai.in ➔ 172.67.142.88 ({protocolMetrics.dnsTime}ms)</div>
                <div style={{ color: "#4ade80" }}>2. [TCP] SYN (seq=100) ➔ SYN-ACK (seq=300, ack=101) ➔ ACK ({protocolMetrics.tcpTime}ms)</div>
                <div style={{ color: "#f59e0b" }}>
                  3. [{simState.tlsVersion}] ClientHello (X25519) ➔ ServerHello (Finished) ({protocolMetrics.tlsTime}ms)
                </div>
                <div style={{ color: "#a855f7" }}>
                  4. [HTTP/2 GET] /index.html ➔ 200 OK (Content-Length: 42 KB)
                </div>
              </div>
            </div>
          )}

          {simType === "matrix" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: "10px" }}>
              <svg width="220" height="150" viewBox="-5 -5 10 10" style={{ border: "1px solid #1a1a20", borderRadius: "6px", backgroundColor: "#0b0b0e" }}>
                {/* Axes */}
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#26262c" strokeWidth="0.1" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#26262c" strokeWidth="0.1" />
                {/* Transformed Basis Vectors */}
                <line x1="0" y1="0" x2={matrixMetrics.a} y2={-matrixMetrics.c} stroke="#ff3b1d" strokeWidth="0.25" strokeLinecap="round" />
                <line x1="0" y1="0" x2={matrixMetrics.b} y2={-matrixMetrics.d} stroke="#38bdf8" strokeWidth="0.25" strokeLinecap="round" />
                {/* Probe Vector */}
                <line x1="0" y1="0" x2={matrixMetrics.vx} y2={-matrixMetrics.vy} stroke="#807f78" strokeWidth="0.15" strokeDasharray="0.3,0.3" />
                <line x1="0" y1="0" x2={matrixMetrics.tx} y2={-matrixMetrics.ty} stroke="#4ade80" strokeWidth="0.3" strokeLinecap="round" />
              </svg>
              <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)" }}>
                <span style={{ color: "#ff8c73" }}>det(A) = {matrixMetrics.det.toFixed(2)}</span>
                <span style={{ color: "#86efac" }}>Trace = {matrixMetrics.trace.toFixed(2)}</span>
                {matrixMetrics.isRealEigen && matrixMetrics.lambda1 !== null && (
                  <span style={{ color: "#38bdf8" }}>λ1 = {matrixMetrics.lambda1.toFixed(2)}, λ2 = {matrixMetrics.lambda2?.toFixed(2)}</span>
                )}
              </div>
            </div>
          )}

          {simType === "pipeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", textAlign: "center" }}>
                {["IF (Fetch)", "ID (Decode)", "EX (Execute)", "MEM (Memory)", "WB (Writeback)"].map((st, sIdx) => {
                  const isCurrent = sIdx === pipelineMetrics.cycle % 5;
                  return (
                    <div
                      key={st}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        backgroundColor: isCurrent ? "rgba(255,59,29,0.2)" : "#111114",
                        border: isCurrent ? "1px solid #ff3b1d" : "1px solid #26262c",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: isCurrent ? "#ff8c73" : "#807f78",
                      }}
                    >
                      {st}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: "11px", color: "#a19f95", textAlign: "center", marginTop: "6px" }}>
                Forwarding: <strong style={{ color: pipelineMetrics.forwarding ? "#4ade80" : "#f87171" }}>{pipelineMetrics.forwarding ? "ENABLED (0 Stalls)" : "DISABLED (2 Bubble Stalls)"}</strong> • Estimated CPI: <strong style={{ color: "#f3f1ea" }}>{pipelineMetrics.cpi}</strong>
              </div>
            </div>
          )}

          {simType !== "protocol" && simType !== "matrix" && simType !== "pipeline" && (
            <div style={{ padding: "20px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "36px" }}>🔬</div>
              <div style={{ fontSize: "12px", color: "#f3f1ea", fontWeight: 600 }}>Active Multi-Variable Simulation Space</div>
              <div style={{ fontSize: "11px", color: "#807f78" }}>Adjust parameters on the right to observe dynamic feedback.</div>
            </div>
          )}

          {/* Dynamic Metrics Footer */}
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
            {simType === "protocol" ? (
              <>
                <span>Total Handshake: <strong style={{ color: "#f3f1ea" }}>{protocolMetrics.totalHandshake} ms</strong></span>
                <span>Round Trips: <strong style={{ color: "#ff3b1d" }}>{protocolMetrics.roundTrips} RTT</strong></span>
                <span>Payload: <strong style={{ color: "#4ade80" }}>42 KB HTTP/2</strong></span>
              </>
            ) : simType === "matrix" ? (
              <>
                <span>Transformed Vector: [{matrixMetrics.tx.toFixed(2)}, {matrixMetrics.ty.toFixed(2)}]</span>
                <span>Area Factor: {Math.abs(matrixMetrics.det).toFixed(2)}x</span>
              </>
            ) : (
              <>
                <span>State: <strong style={{ color: "#4ade80" }}>Steady Active</strong></span>
                <span>Resolution: High Fidelity</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Interactive Controls Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "#111114",
            borderRadius: "10px",
            border: "1px solid #26262c",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#f3f1ea" }}>
              Interactive Controls
            </span>
            <span style={{ fontSize: "10px", color: "#ff8c73", fontFamily: "var(--font-mono, monospace)" }}>
              {controls.length} Variable Inputs
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "240px", paddingRight: "4px" }}>
            {controls.map((ctrl) => {
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
              Adjust the sliders above to verify your answers
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
