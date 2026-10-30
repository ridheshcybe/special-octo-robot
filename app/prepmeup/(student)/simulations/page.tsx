"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SIMULATIONS_REGISTRY } from "../../_lib/simulationsData";
import { RichMathMarkdown } from "../../_components/RichMathMarkdown";

export default function SimulationsDirectoryPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [allSims, setAllSims] = useState<any[]>(() => Object.values(SIMULATIONS_REGISTRY));

  // Dynamically load custom AI-generated simulations from persistent store
  useEffect(() => {
    let isMounted = true;
    const fetchAllSims = async () => {
      try {
        const res = await fetch("/api/prepmeup/simulations");
        const json = await res.json();
        if (isMounted && json.ok && Array.isArray(json.simulations)) {
          setAllSims(json.simulations);
        }
      } catch (e) {
        console.warn("[Simulations Directory] Fetch error:", e);
      }
    };
    fetchAllSims();
    return () => {
      isMounted = false;
    };
  }, []);

  const simulationsList = allSims.filter((sim) => {
    if (activeTab === "all") return true;
    if (activeTab === "custom") return Boolean(sim.isCustom);
    return sim.category === activeTab;
  });

  const customCount = allSims.filter((s) => s.isCustom).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">🔬 Interactive Lab Workbench</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
            ✓ Browser-Native SVG / Canvas • Real-Time Dynamic Parameter Evaluator
          </span>
        </div>
        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          Engineering Simulations Suite
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "700px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Experiment with interactive BEE electrical circuits, FWT network protocol flows, ACM matrix transformations, and Python memory/execution visualizers. Adjust controls in real time to observe live canvas waveforms and calculated telemetry readouts.
        </p>

        {/* Filter Tabs */}
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {[
            { id: "all", label: `All Simulators (${allSims.length})` },
            ...(customCount > 0 ? [{ id: "custom", label: `🤖 AI Synthesized (${customCount})` }] : []),
            { id: "atlas", label: "🌌 Knowledge Atlas (5)" },
            { id: "bee", label: "⚡ Basic Electrical (BEE)" },
            { id: "python", label: "🐍 Python Programming" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{ padding: "9px 16px", fontSize: "11px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Visual Atlas Spotlight Banner */}
      <div
        className="pmu-card-highlight"
        style={{
          padding: "26px 30px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 59, 29, 0.4)",
          backgroundColor: "#111114",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#ff3b1d",
                boxShadow: "0 0 10px #ff3b1d",
              }}
            />
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase" }}>
              Featured Interactive Engineering Lab
            </span>
            <span className="pmu-badge">Semester 1 Atlas Active</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/prepmeup/simulations/atlas"
              className="pmu-btn-primary"
              style={{ padding: "8px 18px", fontSize: "11px" }}
            >
              Launch Fullscreen Atlas Lab →
            </Link>
          </div>
        </div>

        <p style={{ fontSize: "13.5px", color: "#f3f1ea", lineHeight: 1.6, maxWidth: "800px" }}>
          Interactive visual atlas with direct node-based exploration, dynamic oscilloscope trace generation, and multi-variable equation solvers across all 6 DYPIU Semester 1 modules.
        </p>

        {/* Quick Launch Buttons for Specific Atlas Labs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "10px", borderTop: "1px solid #26262c" }}>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", alignSelf: "center", marginRight: "4px" }}>
            Quick Launch Modules:
          </span>
          {[
            { label: "🌌 Curriculum Galaxy", href: "/prepmeup/simulations/atlas" },
            { label: "📐 ACM Matrix Vector Field", href: "/prepmeup/simulations/atlas-acm" },
            { label: "⚡ BEEE AC Oscilloscope", href: "/prepmeup/simulations/atlas-beee" },
            { label: "💻 COA CPU Pipeline", href: "/prepmeup/simulations/atlas-coa" },
            { label: "🏛️ IKS Heritage Timeline", href: "/prepmeup/simulations/atlas-iks" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              style={{
                fontSize: "11px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid #26262c",
                backgroundColor: "#17171b",
                color: "#f3f1ea",
                textDecoration: "none",
                fontFamily: "monospace",
                transition: "all 0.15s ease",
              }}
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </div>

      {/* Simulators Grid */}
      <div className="pmu-grid-3">
        {simulationsList.map((sim) => (
          <div
            key={sim.slug}
            className="pmu-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span className="pmu-badge">{sim.subjectCode}</span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                  ⏱ ~{sim.estimatedMinutes || 15} mins • {sim.difficulty || "Intermediate"}
                </span>
              </div>

              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                {sim.isCustom && (
                  <span style={{ fontSize: "10px", color: "#38bdf8", backgroundColor: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    🤖 AI Synthesized
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "#4ade80", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  Live Canvas
                </span>
              </div>

              <h3
                className="font-display"
                style={{
                  marginTop: "8px",
                  fontSize: "22px",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  color: "#f3f1ea",
                }}
              >
                {sim.title}
              </h3>

              <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
                {sim.summary}
              </p>

              {sim.theoryFormula && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "8px 12px",
                    backgroundColor: "#08080a",
                    border: "1px solid #1f1f26",
                    borderRadius: "6px",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "10px", color: "#ff8c73", textTransform: "uppercase" }}>
                    Equation:
                  </span>
                  <div style={{ marginTop: "2px" }}>
                    <RichMathMarkdown content={`$${sim.theoryFormula}$`} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href={`/prepmeup/simulations/${sim.slug}`}
                className="pmu-btn-primary"
                style={{ flex: 1, textAlign: "center", padding: "10px 14px", fontSize: "12px" }}
              >
                Launch Simulator →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
