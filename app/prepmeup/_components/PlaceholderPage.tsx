import Link from "next/link";
import type { ReactNode } from "react";

interface PlaceholderProps {
  title: string;
  badge?: string;
  description: string;
  icon?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PlaceholderPage({
  title,
  badge = "Phase 1 In Progress",
  description,
  icon,
  backHref = "/prepmeup",
  backLabel = "Back to PrepMeUp AI",
}: PlaceholderProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "70vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      <div className="pmu-auth-card">
        <div
          style={{
            marginBottom: "1rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,59,29,0.1)",
            padding: "0.75rem",
            color: "#ff3b1d",
          }}
        >
          {icon || (
            <svg
              style={{ width: "2rem", height: "2rem" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          )}
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <span className="pmu-pill-accent">{badge}</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-anton), "Anton", sans-serif',
            fontSize: "1.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#f3f1ea",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "0.75rem",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "#807f78",
          }}
        >
          {description}
        </p>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <Link href={backHref} className="pmu-btn-secondary">
            {backLabel}
          </Link>
          <Link href="/prepmeup#pricing" className="pmu-btn-primary">
            Claim Semester Pass
          </Link>
        </div>
      </div>
    </div>
  );
}
