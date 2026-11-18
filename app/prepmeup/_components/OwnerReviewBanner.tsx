"use client";

import React, { useState } from "react";

interface OwnerReviewBannerProps {
  id: string;
  blockerNumber: number;
  summary: string;
  detail: string;
}

export function OwnerReviewBanner({
  id,
  blockerNumber,
  summary,
  detail,
}: OwnerReviewBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      role="note"
      aria-label={`Owner review note: Blocker #${blockerNumber}`}
      style={{
        backgroundColor: "#FFFBEB",
        borderBottom: "1px solid #FDE68A",
        color: "#92400E",
        padding: "0.625rem 1rem",
        fontSize: "0.8125rem",
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#D97706",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            !
          </span>
          <div>
            <span style={{ fontWeight: 700, marginRight: "0.375rem" }}>
              Owner Review — Blocker #{blockerNumber}: {summary}
            </span>
            <span style={{ color: "#78350F" }}>{detail}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss owner review note"
          style={{
            background: "transparent",
            border: "none",
            color: "#92400E",
            cursor: "pointer",
            padding: "0.125rem",
            fontSize: "14px",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
