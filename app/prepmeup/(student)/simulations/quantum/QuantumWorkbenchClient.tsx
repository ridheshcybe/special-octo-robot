"use client";

import React, { useState } from "react";
import { QuantumSimulationMeta } from "@/app/prepmeup/_lib/trackStore";
import { QubitBlochVisualizer } from "../_components/quantum/QubitBlochVisualizer";
import { SuperpositionExplorer } from "../_components/quantum/SuperpositionExplorer";
import { CircuitBuilderSim } from "../_components/quantum/CircuitBuilderSim";
import { EntanglementDemonstrator } from "../_components/quantum/EntanglementDemonstrator";
import { GroverSearchVisualizer } from "../_components/quantum/GroverSearchVisualizer";

interface Props {
  simulations: QuantumSimulationMeta[];
}

export function QuantumWorkbenchClient({ simulations }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>("qubit-state-visualizer");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Simulation Selector Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(243, 241, 234, 0.1)",
        }}
      >
        {simulations.map((sim) => {
          const isActive = sim.slug === activeSlug;
          return (
            <button
              key={sim.slug}
              onClick={() => setActiveSlug(sim.slug)}
              className={isActive ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{
                padding: "10px 18px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                backgroundColor: isActive ? "#ff3b1d" : undefined,
              }}
            >
              <span>{sim.title}</span>
              {sim.isFreePreview && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: isActive ? "rgba(0,0,0,0.3)" : "rgba(0, 230, 118, 0.2)",
                    color: isActive ? "#f3f1ea" : "#00e676",
                    fontWeight: "bold",
                  }}
                >
                  FREE PREVIEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active Simulation */}
      <div>
        {activeSlug === "qubit-state-visualizer" && <QubitBlochVisualizer />}
        {activeSlug === "superposition-explorer" && <SuperpositionExplorer />}
        {activeSlug === "circuit-builder" && <CircuitBuilderSim />}
        {activeSlug === "entanglement-demonstrator" && <EntanglementDemonstrator />}
        {activeSlug === "grover-search" && <GroverSearchVisualizer />}
      </div>
    </div>
  );
}
