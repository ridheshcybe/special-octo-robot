"use client";

import React, { useState, useEffect } from "react";

interface AtlasSimViewerProps {
  initialTab?: "curriculum" | "acm" | "beee" | "coa" | "iks";
  slug?: string;
}

export function AtlasSimViewer({ initialTab, slug }: AtlasSimViewerProps) {
  // Determine starting tab based on slug or prop
  let defaultTab: "curriculum" | "acm" | "beee" | "coa" | "iks" = "curriculum";
  if (initialTab) {
    defaultTab = initialTab;
  } else if (slug === "atlas-acm") {
    defaultTab = "acm";
  } else if (slug === "atlas-beee") {
    defaultTab = "beee";
  } else if (slug === "atlas-coa") {
    defaultTab = "coa";
  } else if (slug === "atlas-iks") {
    defaultTab = "iks";
  }

  const [currentTab, setCurrentTab] = useState<"curriculum" | "acm" | "beee" | "coa" | "iks">(defaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (slug === "atlas-acm") setCurrentTab("acm");
    else if (slug === "atlas-beee") setCurrentTab("beee");
    else if (slug === "atlas-coa") setCurrentTab("coa");
    else if (slug === "atlas-iks") setCurrentTab("iks");
    else if (slug === "atlas-curriculum") setCurrentTab("curriculum");
  }, [slug]);

  const tabs: { id: "curriculum" | "acm" | "beee" | "coa" | "iks"; label: string; icon: string }[] = [
    { id: "curriculum", label: "Curriculum Galaxy", icon: "🌌" },
    { id: "acm", label: "ACM Matrix & Eigenfield", icon: "📐" },
    { id: "beee", label: "BEEE Oscilloscope Lab", icon: "⚡" },
    { id: "coa", label: "COA 5-Stage CPU Pipeline", icon: "💻" },
    { id: "iks", label: "IKS Heritage Timeline", icon: "🏛️" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderRadius: "14px",
        border: "1px solid #26262c",
        backgroundColor: "#0d0d11",
        overflow: "hidden",
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          padding: "12px 18px",
          backgroundColor: "#111114",
          borderBottom: "1px solid #26262c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: active ? "1px solid #ff3b1d" : "1px solid #26262c",
                  backgroundColor: active ? "#ff3b1d" : "#17171b",
                  color: active ? "#08080a" : "#a19f95",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid #26262c",
              backgroundColor: "#17171b",
              color: "#f3f1ea",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
          </button>

          <a
            href={`/atlas.html?tab=${currentTab}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 59, 29, 0.4)",
              backgroundColor: "rgba(255, 59, 29, 0.1)",
              color: "#ff3b1d",
              fontSize: "11px",
              fontFamily: "monospace",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Open Standalone ↗
          </a>
        </div>
      </div>

      {/* Embedded Interactive Canvas Viewport */}
      <div
        style={{
          position: isFullscreen ? "fixed" : "relative",
          top: isFullscreen ? 0 : "auto",
          left: isFullscreen ? 0 : "auto",
          width: isFullscreen ? "100vw" : "100%",
          height: isFullscreen ? "100vh" : "780px",
          zIndex: isFullscreen ? 99999 : 1,
          backgroundColor: "#08080a",
        }}
      >
        {isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "24px",
              zIndex: 100000,
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #ff3b1d",
              backgroundColor: "#ff3b1d",
              color: "#08080a",
              fontWeight: 700,
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            ✕ Close Fullscreen
          </button>
        )}
        <iframe
          key={currentTab}
          src={`/atlas.html?tab=${currentTab}`}
          title="Interactive Engineering Visual Atlas"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "#08080a",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
