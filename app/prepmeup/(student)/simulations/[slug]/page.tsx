"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { SIMULATIONS_REGISTRY } from "../../../_lib/simulationsData";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";

// BEE Simulation Components
import { OhmsLawSim } from "../_components/bee/OhmsLawSim";
import { ResistorNetworkSim } from "../_components/bee/ResistorNetworkSim";
import { PowerEnergySim } from "../_components/bee/PowerEnergySim";
import { ACWaveformSim } from "../_components/bee/ACWaveformSim";
import { KirchhoffSim } from "../_components/bee/KirchhoffSim";

// Python Simulation Components
import { VariableMemorySim } from "../_components/python/VariableMemorySim";
import { LoopExecutionSim } from "../_components/python/LoopExecutionSim";
import { CallStackSim } from "../_components/python/CallStackSim";
import { DataStructureSim } from "../_components/python/DataStructureSim";
import { CodeTracingSim } from "../_components/python/CodeTracingSim";
import { AtlasSimViewer } from "../_components/AtlasSimViewer";
import { DynamicInteractiveSim } from "../../../_components/DynamicInteractiveSim";

interface SimulationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SimulationRunnerPage({ params }: SimulationPageProps) {
  const { slug } = use(params);
  const [activeSim, setActiveSim] = useState<any>(() => SIMULATIONS_REGISTRY[slug] || null);
  const [loading, setLoading] = useState(!SIMULATIONS_REGISTRY[slug]);

  // If not found in static registry, fetch from dynamic persistent storage API
  useEffect(() => {
    if (activeSim) return;

    let isMounted = true;
    const fetchSim = async () => {
      try {
        const res = await fetch(`/api/prepmeup/simulations?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (isMounted && json.ok && json.simulation) {
          setActiveSim(json.simulation);
        }
      } catch (err) {
        console.warn("[SimRunner] Could not load dynamic simulation:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSim();
    return () => {
      isMounted = false;
    };
  }, [slug, activeSim]);

  if (loading) {
    return (
      <div className="pmu-card" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚡</div>
        <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea" }}>
          Initializing Interactive Engineering Workbench...
        </h3>
        <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "4px" }}>
          Loading dynamic parameter bindings and LaTeX models for {slug}.
        </p>
      </div>
    );
  }

  if (!activeSim) {
    return (
      <div className="pmu-card" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
        <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea" }}>
          Simulation Workbench Not Found
        </h3>
        <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "6px", maxWidth: "460px", margin: "6px auto 20px" }}>
          The requested simulator "{slug}" is not currently in the registered catalog or persistent storage.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Link href="/prepmeup/simulations" className="pmu-btn-primary" style={{ padding: "10px 18px", fontSize: "12px" }}>
            ← Browse All Simulators
          </Link>
          <Link href="/prepmeup/admin/content-studio" className="pmu-btn-secondary" style={{ padding: "10px 18px", fontSize: "12px" }}>
            Generate New in Studio →
          </Link>
        </div>
      </div>
    );
  }

  const renderSimComponent = () => {
    switch (activeSim.componentKey) {
      case "OhmsLawSim":
        return <OhmsLawSim />;
      case "ResistorNetworkSim":
        return <ResistorNetworkSim />;
      case "PowerEnergySim":
        return <PowerEnergySim />;
      case "ACWaveformSim":
        return <ACWaveformSim />;
      case "KirchhoffSim":
        return <KirchhoffSim />;
      case "VariableMemorySim":
        return <VariableMemorySim />;
      case "LoopExecutionSim":
        return <LoopExecutionSim />;
      case "CallStackSim":
        return <CallStackSim />;
      case "DataStructureSim":
        return <DataStructureSim />;
      case "CodeTracingSim":
        return <CodeTracingSim />;
      case "AtlasSimViewer":
        return <AtlasSimViewer slug={slug} />;
      case "DynamicInteractiveSim":
      default:
        return (
          <DynamicInteractiveSim
            title={activeSim.title}
            subjectCode={activeSim.subjectCode}
            theoryFormula={activeSim.theoryFormula}
            theoryGuide={activeSim.theoryGuide}
            simType={
              activeSim.simType ||
              (activeSim.subjectCode === "CSE1004" ? "protocol" :
               activeSim.subjectCode === "CSE1001" ? "matrix" :
               activeSim.subjectCode === "CSE1002" ? "circuit" :
               activeSim.subjectCode === "CSE1003" ? "pipeline" :
               activeSim.subjectCode === "CSE1005" ? "algorithm" : "interactive_lab")
            }
            controls={activeSim.controls}
            initialState={activeSim.initialState}
            checkpoints={activeSim.checkpoints}
          />
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Navigation & Header Card */}
      <div
        className="pmu-card"
        style={{
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <Link
            href="/prepmeup/simulations"
            className="font-mono"
            style={{ fontSize: "12px", fontWeight: 600, color: "#a19f95", textDecoration: "none" }}
          >
            ← Back to All Engineering Simulators
          </Link>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">{activeSim.subjectCode}</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#a19f95" }}>
              {activeSim.subjectName || activeSim.subjectCode} • {activeSim.difficulty || "Intermediate"}
            </span>
            {activeSim.isCustom && (
              <span style={{ fontSize: "10px", color: "#38bdf8", backgroundColor: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                🤖 AI Synthesized
              </span>
            )}
          </div>
          <h1
            className="font-display"
            style={{
              marginTop: "10px",
              fontSize: "clamp(26px, 3.5vw, 38px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              color: "#f3f1ea",
            }}
          >
            {activeSim.title}
          </h1>
        </div>

        <Link
          href={`/prepmeup/subjects/${activeSim.subjectSlug || "applied-computational-mathematics"}`}
          className="pmu-btn-secondary"
        >
          📖 View Subject LaTeX Notes →
        </Link>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Interactive Sandbox Area (Spans 2 columns) */}
        <div style={{ gridColumn: "span 2" }}>
          <div className="pmu-card" style={{ padding: "20px" }}>
            {renderSimComponent()}
          </div>
        </div>

        {/* Theory & Pedagogical Guide Sidebar (LaTeX Rendered) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="pmu-card" style={{ padding: "24px" }}>
            <span className="pmu-badge">Mathematical Model</span>
            <h3
              className="font-display"
              style={{ marginTop: "10px", fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea" }}
            >
              Theory &amp; Governing Equations
            </h3>
            <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95" }}>
              Analytical principles modeled in this interactive visualizer:
            </p>

            <div style={{ marginTop: "12px" }}>
              <RichMathMarkdown content={`$$${activeSim.theoryFormula || "y = f(x)"}$$`} />
            </div>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #26262c" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
                Key Exam Concepts:
              </span>
              <div style={{ marginTop: "8px" }}>
                {Array.isArray(activeSim.theoryGuide) && activeSim.theoryGuide.length > 0 ? (
                  <RichMathMarkdown content={activeSim.theoryGuide.map((g: string) => `- ${g}`).join("\n")} />
                ) : (
                  <div style={{ fontSize: "12px", color: "#a19f95" }}>
                    • Manipulate controls in real time to observe dynamic equilibrium and parameter sensitivity.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "20px" }}>
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
              ⚡ Browser-Native Runtime
            </span>
            <p style={{ marginTop: "6px", fontSize: "12.5px", lineHeight: 1.6, color: "#a19f95" }}>
              This simulator executes directly in your browser using reactive SVG vectors, HTML5 Canvas, and real-time state evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
