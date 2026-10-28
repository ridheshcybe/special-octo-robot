"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DailyNoteData } from "@/lib/prepmeup/dailyNotes";

export function DailyNotificationBanner() {
  const [dailyNote, setDailyNote] = useState<DailyNoteData | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/daily-note")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.ok && res.data) {
          setDailyNote(res.data);
          const dismissedId = localStorage.getItem("pmu_dismissed_notif_id");
          if (dismissedId !== res.data.notification?.id) {
            setDismissed(false);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (dailyNote?.notification?.id) {
      localStorage.setItem("pmu_dismissed_notif_id", dailyNote.notification.id);
    }
    setDismissed(true);
  };

  if (dismissed || !dailyNote) return null;

  return (
    <div
      style={{
        backgroundColor: "#17171b",
        borderBottom: "1px solid #ff3b1d",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 40,
        boxShadow: "0 4px 20px rgba(255, 59, 29, 0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 59, 29, 0.2)",
            color: "#ff3b1d",
            fontSize: "13px",
            flexShrink: 0,
            animation: "pulse 2s infinite",
          }}
        >
          🔔
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#ff3b1d",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            New Daily Drop:
          </span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#f3f1ea" }}>
            {dailyNote.topic}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              color: "#4ade80",
              backgroundColor: "rgba(34,197,94,0.12)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            +{dailyNote.xpReward} XP
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link
          href="/prepmeup/dashboard#daily-capsule"
          onClick={() => {
            const el = document.getElementById("daily-capsule");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="font-mono"
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            backgroundColor: "#ff3b1d",
            color: "#08080a",
            padding: "5px 12px",
            borderRadius: "4px",
            textDecoration: "none",
            display: "inline-block",
            transition: "opacity 0.2s",
          }}
        >
          Study Capsule &amp; Quiz →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#807f78",
            cursor: "pointer",
            fontSize: "14px",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
