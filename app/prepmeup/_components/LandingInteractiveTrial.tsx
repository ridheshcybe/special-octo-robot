"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RichMathMarkdown } from "./RichMathMarkdown";

export function LandingInteractiveTrial() {
  const [activeTab, setActiveTab] = useState<"simulator" | "ai_doubt" | "squad">("simulator");

  // Simulator sub-mode: "circuit" | "python"
  const [simMode, setSimMode] = useState<"circuit" | "python">("circuit");
  const [voltage, setVoltage] = useState<number>(24);
  const [r1, setR1] = useState<number>(4);
  const [r2, setR2] = useState<number>(8);

  // Python loop tracer state
  const [pyN, setPyN] = useState<number>(5);
  const [pyStep, setPyStep] = useState<number>(5);

  // Guest AI Doubt state
  const [doubtInput, setDoubtInput] = useState<string>(
    "Find A⁻¹ for a 2×2 matrix using Cayley-Hamilton Theorem"
  );
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    subject: string;
    answerMarkdown: string;
    used?: number;
    limit?: number;
  } | null>({
    subject: "CSE1001 • Applied Computational Mathematics",
    answerMarkdown: `### Cayley-Hamilton Theorem — 60-Second Exam Derivation

Every square matrix $A$ satisfies its own characteristic equation $\\det(A - \\lambda I) = 0$.

1. **For $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$:** Trace $= 4$, Determinant $= 3 \\implies \\lambda^2 - 4\\lambda + 3 = 0$.
2. **Substitute $\\lambda \\to A$:** $A^2 - 4A + 3I = 0 \\implies 3I = 4A - A^2$.
3. **Multiply by $A^{-1}$:**
   $$A^{-1} = \\frac{1}{3}(4I - A) = \\frac{1}{3}\\begin{bmatrix} 2 & -1 \\\\ -1 & 2 \\end{bmatrix}$$`,
  });
  const [aiError, setAiError] = useState<string | null>(null);

  // Referral banner state
  const [detectedRef, setDetectedRef] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase();
      setDetectedRef(cleanRef);
      try {
        localStorage.setItem("pmu_referral_code", cleanRef);
      } catch {}
      fetch("/api/prepmeup/growth/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "track_referral",
          refCode: cleanRef,
          eventType: "click",
        }),
      }).catch(() => {});
    }
  }, []);

  const totalR = r1 + r2;
  const currentI = totalR > 0 ? voltage / totalR : 0;
  const v1 = currentI * r1;
  const v2 = currentI * r2;
  const powerTotal = voltage * currentI;
  const maxPowerRLoad = r1;
  const maxPowerTransfer = r1 > 0 ? (voltage * voltage) / (4 * r1) : 0;

  const activePyStep = Math.min(pyStep, pyN);
  const pySum = (activePyStep * (activePyStep + 1)) / 2;

  const handleRunGuestDoubt = async (presetKey?: string, customPrompt?: string) => {
    setAiLoading(true);
    setAiError(null);
    const qText = customPrompt ?? doubtInput;
    if (customPrompt) setDoubtInput(customPrompt);

    try {
      const res = await fetch("/api/prepmeup/growth/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "guest_ai_trial",
          question: qText,
          presetKey,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setAiError(json.error || "Could not run guest AI trial.");
      } else {
        setAiResult({
          subject: json.data.subject,
          answerMarkdown: json.data.answerMarkdown,
          used: json.data.quota?.used,
          limit: json.data.quota?.limit,
        });
      }
    } catch {
      setAiError("Network error while reaching AI Doubt Copilot.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section
      id="trial"
      style={{
        borderBottom: "1px solid #26262c",
        backgroundColor: "#0c0c10",
        padding: "64px 0",
        scrollMarginTop: "80px",
      }}
    >
      <div className="pmu-shell">
        {detectedRef && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(34,197,94,0.45)",
              backgroundColor: "rgba(34,197,94,0.1)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13.5px", color: "#d1fae5" }}>
              🎁 <strong>Classmate Referral Activated ({detectedRef}):</strong> Your friend invited you! Code{" "}
              <code className="font-mono" style={{ color: "#4ade80", fontWeight: 700 }}>
                {detectedRef}
              </code>{" "}
              is saved for an automatic ₹30 discount at checkout.
            </div>
            <Link
              href={`/prepmeup/checkout?tier=tier2&code=${encodeURIComponent(detectedRef)}`}
              className="pmu-btn-primary"
              style={{
                padding: "8px 16px",
                fontSize: "11px",
                backgroundColor: "#22c55e",
                color: "#08080a",
              }}
            >
              Claim Referral Discount →
            </Link>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <span className="pmu-badge">⚡ Zero-Login Interactive Sandbox</span>
            <h2
              className="font-display"
              style={{
                marginTop: "12px",
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 0.96,
                textTransform: "uppercase",
                color: "#f3f1ea",
              }}
            >
              Test-Drive the Lab &amp; AI Copilot Right Now
            </h2>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#a19f95", maxWidth: "660px" }}>
              Don&apos;t just take our word for it — drag the live circuit sliders, step through Python loop memory, or ask a Semester 1 engineering doubt below without logging in.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { id: "simulator" as const, label: "⚡ 1. Live Interactive Simulator" },
              { id: "ai_doubt" as const, label: "🤖 2. Try Free AI Doubt Solver" },
              { id: "squad" as const, label: "👥 3. Study Squad Pass (₹149/Friend)" },
            ].map((t) => {
              const isAct = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className="font-mono"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isAct ? "1px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: isAct ? "#ff3b1d" : "#111114",
                    color: isAct ? "#08080a" : "#f3f1ea",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: LIVE INTERACTIVE SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="pmu-card-highlight" style={{ padding: "28px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                paddingBottom: "16px",
                borderBottom: "1px solid #26262c",
                marginBottom: "22px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setSimMode("circuit")}
                  className={simMode === "circuit" ? "pmu-btn-primary" : "pmu-btn-secondary"}
                  style={{ padding: "8px 16px", fontSize: "11px" }}
                >
                  ⚡ CSE1002: KVL Voltage Divider &amp; Max Power Lab
                </button>
                <button
                  type="button"
                  onClick={() => setSimMode("python")}
                  className={simMode === "python" ? "pmu-btn-primary" : "pmu-btn-secondary"}
                  style={{ padding: "8px 16px", fontSize: "11px" }}
                >
                  🐍 CSE1005: Python Loop Accumulator Tracer
                </button>
              </div>
              <Link
                href="/prepmeup/simulations"
                className="font-mono"
                style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none", fontWeight: 700 }}
              >
                Explore All 17 Interactive Labs →
              </Link>
            </div>

            {simMode === "circuit" ? (
              <div className="pmu-grid-2" style={{ gap: "24px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#a19f95" }}>DC Source Voltage ($V_S$):</span>
                      <strong className="font-mono" style={{ color: "#ff3b1d" }}>{voltage} V</strong>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={60}
                      step={2}
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#ff3b1d" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#a19f95" }}>Source Resistance ($R_1 / R_{"th"}$):</span>
                      <strong className="font-mono" style={{ color: "#4ade80" }}>{r1} Ω</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={r1}
                      onChange={(e) => setR1(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#22c55e" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#a19f95" }}>Load Resistance ($R_2 / R_L$):</span>
                      <strong className="font-mono" style={{ color: "#38bdf8" }}>{r2} Ω</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={r2}
                      onChange={(e) => setR2(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#38bdf8" }}
                    />
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      backgroundColor: "#08080a",
                      border: "1px solid #26262c",
                      fontSize: "12.5px",
                      color: "#d6d3cb",
                    }}
                  >
                    💡 <strong>Live Exam Insight:</strong> When R₂ = R₁ = {maxPowerRLoad} Ω, Maximum Power Transfer occurs (P_max = V_S² / (4·R₁) = {maxPowerTransfer.toFixed(2)} W).
                    {r1 === r2 ? " 🎯 Matched for Max Power Transfer!" : ` Set R₂ to ${r1} Ω to hit peak load power!`}
                  </div>
                </div>

                {/* Live Telemetry Readout Card */}
                <div
                  style={{
                    padding: "22px",
                    borderRadius: "12px",
                    backgroundColor: "#08080a",
                    border: "1px solid rgba(255,59,29,0.35)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#ff3b1d", textTransform: "uppercase", fontWeight: 700 }}>
                      Live KVL Mesh &amp; Telemetry Output
                    </span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                      ΣV = {voltage}V − {v1.toFixed(1)}V − {v2.toFixed(1)}V = 0.0V ✓
                    </span>
                  </div>

                  <div className="pmu-grid-2" style={{ gap: "12px" }}>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
                        Loop Current (I)
                      </span>
                      <div className="font-display" style={{ fontSize: "30px", color: "#f3f1ea", marginTop: "4px" }}>
                        {currentI.toFixed(2)} A
                      </div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
                        Drop V₁ / V₂
                      </span>
                      <div className="font-display" style={{ fontSize: "30px", color: "#4ade80", marginTop: "4px" }}>
                        {v1.toFixed(1)}V / {v2.toFixed(1)}V
                      </div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
                        Load Power (I²·R₂)
                      </span>
                      <div className="font-display" style={{ fontSize: "30px", color: "#38bdf8", marginTop: "4px" }}>
                        {(currentI * currentI * r2).toFixed(2)} W
                      </div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", textTransform: "uppercase" }}>
                        Total Circuit Power
                      </span>
                      <div className="font-display" style={{ fontSize: "30px", color: "#ff6a3d", marginTop: "4px" }}>
                        {powerTotal.toFixed(2)} W
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pmu-grid-2" style={{ gap: "24px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#a19f95" }}>Loop Bound <code>n</code> in <code>range(1, n + 1)</code>:</span>
                      <strong className="font-mono" style={{ color: "#ff3b1d" }}>n = {pyN}</strong>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      value={pyN}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPyN(val);
                        setPyStep(val);
                      }}
                      style={{ width: "100%", accentColor: "#ff3b1d" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#a19f95" }}>Scrub Execution Iteration (Step <code>i</code>):</span>
                      <strong className="font-mono" style={{ color: "#4ade80" }}>
                        Iteration {activePyStep} of {pyN}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={pyN}
                      value={activePyStep}
                      onChange={(e) => setPyStep(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#22c55e" }}
                    />
                  </div>

                  <pre
                    className="font-mono"
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      backgroundColor: "#08080a",
                      border: "1px solid #26262c",
                      fontSize: "12.5px",
                      color: "#f3f1ea",
                      overflowX: "auto",
                    }}
                  >
                    {`total = 0\nfor i in range(1, ${pyN} + 1):  # i = ${activePyStep}\n    total += i               # total = ${pySum}\nprint(total)                 # Output: ${(pyN * (pyN + 1)) / 2}`}
                  </pre>
                </div>

                <div
                  style={{
                    padding: "22px",
                    borderRadius: "12px",
                    backgroundColor: "#08080a",
                    border: "1px solid rgba(34,197,94,0.35)",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", textTransform: "uppercase", fontWeight: 700 }}>
                    Live Stack Frame &amp; Accumulator State
                  </span>
                  <div className="pmu-grid-2" style={{ gap: "12px", marginTop: "14px" }}>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>Current Loop Variable i</span>
                      <div className="font-display" style={{ fontSize: "32px", color: "#f3f1ea", marginTop: "4px" }}>
                        i = {activePyStep}
                      </div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#111114", border: "1px solid #26262c" }}>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#807f78" }}>Accumulator (total)</span>
                      <div className="font-display" style={{ fontSize: "32px", color: "#4ade80", marginTop: "4px" }}>
                        {pySum}
                      </div>
                    </div>
                  </div>
                  <p className="font-mono" style={{ marginTop: "14px", fontSize: "12px", color: "#a19f95" }}>
                    Trace: {Array.from({ length: activePyStep }, (_, idx) => idx + 1).join(" + ")} = {pySum}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRY FREE AI DOUBT SOLVER */}
        {activeTab === "ai_doubt" && (
          <div className="pmu-card-highlight" style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
              <div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#ff3b1d", textTransform: "uppercase", fontWeight: 700 }}>
                  🤖 Instant Guest AI Doubt Copilot (KaTeX Step-by-Step)
                </span>
                <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "4px" }}>
                  Click a popular Semester 1 exam question or type your own below:
                </p>
              </div>
              {aiResult?.used && (
                <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                  Free Guest Trial {aiResult.used} / {aiResult.limit || 5} Used Today
                </span>
              )}
            </div>

            {/* 1-Click Preset Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {[
                { key: "cayley", label: "📐 Cayley-Hamilton 2×2 Matrix Inverse" },
                { key: "thevenin", label: "⚡ Thevenin & Max Power Transfer" },
                { key: "pipeline", label: "💻 5-Stage RISC Pipeline RAW Hazard" },
                { key: "python", label: "🐍 Python Mutable Default Arg Trap" },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleRunGuestDoubt(p.key, p.label)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "6px",
                    border: "1px solid #26262c",
                    backgroundColor: "#111114",
                    color: "#f3f1ea",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Question Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Ask any Semester 1 ACM, BEEE, COA, Web, Python, or IKS question..."
                className="pmu-input"
                style={{ flex: 1, minWidth: "240px" }}
              />
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleRunGuestDoubt(undefined, doubtInput)}
                className="pmu-btn-primary"
              >
                {aiLoading ? "Solving with LaTeX…" : "Solve Step-by-Step →"}
              </button>
            </div>

            {aiError && (
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", fontSize: "13px", marginBottom: "16px" }}>
                {aiError}
              </div>
            )}

            {aiResult && (
              <div style={{ padding: "22px", borderRadius: "10px", backgroundColor: "#08080a", border: "1px solid #26262c" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid #26262c" }}>
                  <span className="pmu-badge">{aiResult.subject}</span>
                  <Link
                    href="/prepmeup/doubts"
                    className="font-mono"
                    style={{ fontSize: "12px", color: "#ff3b1d", textDecoration: "none", fontWeight: 700 }}
                  >
                    Open Full AI Doubt Workspace &amp; Save History →
                  </Link>
                </div>
                <RichMathMarkdown content={aiResult.answerMarkdown} />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 3-FRIEND STUDY SQUAD PASS */}
        {activeTab === "squad" && (
          <div className="pmu-card-highlight" style={{ padding: "30px" }}>
            <div className="pmu-grid-2" style={{ gap: "24px", alignItems: "center" }}>
              <div>
                <span className="pmu-badge" style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#4ade80", borderColor: "rgba(34,197,94,0.4)" }}>
                  🔥 New Campus Group Offer • Save ₹148
                </span>
                <h3 className="font-display" style={{ fontSize: "34px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "12px" }}>
                  3-Friend Study Squad Pass: ₹449 Total (₹149 / Student)
                </h3>
                <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: 1.65, color: "#a19f95" }}>
                  Why study alone? Grab the <strong>3-Friend Study Squad Bundle</strong> at checkout. Your Tier 2 Pro Pass activates immediately, and you receive <strong>2 instant 100%-off Squad Invite Codes</strong> (<code>SQUAD-XXXX-1</code> &amp; <code>SQUAD-XXXX-2</code>) to forward to your two hostel roommates or lab partners on WhatsApp!
                </p>
                <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <Link href="/prepmeup/checkout?tier=tier2_squad" className="pmu-btn-primary">
                    Unlock 3-Friend Squad Pass (₹449) →
                  </Link>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      "Hey! Want to split the PrepMeUp B.Tech Sem-1 Study Squad Pass? It's ₹449 for 3 Tier 2 Pro Passes (₹149 each instead of ₹199) with all 93 topic notes, AI Doubt Solver, 17 simulators + 1:1 mentor session: https://prepmeupai.in/prepmeup/checkout?tier=tier2_squad"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pmu-btn-secondary"
                    style={{ borderColor: "rgba(34,197,94,0.45)", color: "#4ade80" }}
                  >
                    📲 Ask 2 Friends on WhatsApp
                  </a>
                </div>
              </div>

              <div style={{ padding: "22px", borderRadius: "12px", backgroundColor: "#08080a", border: "1px solid #26262c", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid #26262c" }}>
                  <span style={{ fontSize: "13px", color: "#a19f95" }}>3 × Individual Tier 2 Pro Passes</span>
                  <span className="font-mono" style={{ fontSize: "14px", color: "#807f78", textDecoration: "line-through" }}>₹597</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid #26262c" }}>
                  <span style={{ fontSize: "13px", color: "#f3f1ea", fontWeight: 700 }}>3-Friend Study Squad Bundle</span>
                  <span className="font-mono" style={{ fontSize: "18px", color: "#4ade80", fontWeight: 700 }}>₹449 (₹149/friend)</span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#a19f95", lineHeight: 1.55 }}>
                  ✓ <strong>Seat 1 (You):</strong> Activated immediately upon checkout.<br />
                  ✓ <strong>Seats 2 &amp; 3 (Roommates):</strong> Receive 2 single-use <code>SQUAD-XXXX</code> codes on your receipt to redeem for ₹0!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
