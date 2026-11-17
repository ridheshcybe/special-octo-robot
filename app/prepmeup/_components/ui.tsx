import React from "react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * Single display heading per page with optional subtitle and one primary action.
 */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "16px",
        paddingBottom: "24px",
        borderBottom: "1px solid rgba(243, 241, 234, 0.1)",
      }}
    >
      <div style={{ maxWidth: "680px" }}>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "#f3f1ea",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "15px",
              lineHeight: 1.5,
              color: "#807f78",
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Link href={action.href} className="pmu-btn-primary">
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className="pmu-btn-primary">
            {action.label}
          </button>
        ))}
    </header>
  );
}

interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Calm content section with 24px card padding and 16px internal spacing.
 */
export function Section({ title, action, children }: SectionProps) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#807f78",
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export interface StatItem {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "error";
}

const TONE_COLOR: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "#f3f1ea",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#f87171",
};

/**
 * Minimal stat row without decorative emoji or glowing pills.
 */
export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "16px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="pmu-card"
          style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <span style={{ fontSize: "13px", color: "#807f78" }}>{item.label}</span>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: TONE_COLOR[item.tone || "default"],
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * Clean centered empty state with optional single action.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="pmu-card"
      style={{
        padding: "40px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <p style={{ fontSize: "16px", fontWeight: 600, color: "#f3f1ea", margin: 0 }}>{title}</p>
      {description && (
        <p style={{ fontSize: "14px", color: "#807f78", maxWidth: "420px", margin: 0 }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: "8px" }}>
          {action.href ? (
            <Link href={action.href} className="pmu-btn-secondary">
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className="pmu-btn-secondary">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
