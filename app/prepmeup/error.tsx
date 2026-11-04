"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PrepMeUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PrepMeUp Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: 'var(--font-onest, "Onest", sans-serif)',
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#111114",
          border: "1px solid rgba(243, 241, 234, 0.15)",
          padding: "3rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-anton, "Anton", sans-serif)',
            fontSize: "clamp(3.5rem, 8vw, 5rem)",
            color: "#ff3b1d",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          ANOMALY
        </div>
        <div
          style={{
            fontFamily: 'var(--font-anton, "Anton", sans-serif)',
            fontSize: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Execution Interrupted
        </div>
        <p
          style={{
            color: "#807f78",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          PrepMeUp encountered an unexpected condition while processing syllabus resources.
          Our logging pipeline has indexed this incident.
        </p>

        {error.digest && (
          <div
            style={{
              fontSize: "0.75rem",
              fontFamily: "monospace",
              color: "#ff3b1d",
              background: "#17171b",
              padding: "0.5rem 1rem",
              border: "1px solid rgba(255, 59, 29, 0.2)",
            }}
          >
            REF: {error.digest}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            width: "100%",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "0.85rem 1.5rem",
              backgroundColor: "#ff3b1d",
              color: "#ffffff",
              border: "none",
              fontFamily: 'var(--font-anton, "Anton", sans-serif)',
              fontSize: "1rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
          >
            Try Again
          </button>
          <Link
            href="/prepmeup/dashboard"
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "0.85rem 1.5rem",
              backgroundColor: "transparent",
              color: "#f3f1ea",
              border: "1px solid rgba(243, 241, 234, 0.2)",
              fontFamily: 'var(--font-anton, "Anton", sans-serif)',
              fontSize: "1rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
