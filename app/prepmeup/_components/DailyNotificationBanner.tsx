"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DailyNoteData } from "@/lib/prepmeup/dailyNotes";
import type { CustomNotification } from "@/lib/prepmeup/notifications";

export function DailyNotificationBanner() {
  const [customNotif, setCustomNotif] = useState<CustomNotification | null>(null);
  const [dailyNote, setDailyNote] = useState<DailyNoteData | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/prepmeup/notifications").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/prepmeup/daily-note").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([notifRes, dailyRes]) => {
      const dismissedRaw = localStorage.getItem("pmu_dismissed_notif_ids") || "";
      const dismissedSet = new Set(dismissedRaw.split(",").filter(Boolean));
      const legacyDismissed = localStorage.getItem("pmu_dismissed_notif_id");
      if (legacyDismissed) dismissedSet.add(legacyDismissed);

      const activeCustom: CustomNotification[] = notifRes?.ok ? notifRes.notifications || [] : [];
      const topCustom = activeCustom.find((n) => !dismissedSet.has(n.id));

      if (topCustom) {
        setCustomNotif(topCustom);
        setDismissed(false);
        return;
      }

      if (dailyRes?.ok && dailyRes.data) {
        setDailyNote(dailyRes.data);
        const dailyId = dailyRes.data.notification?.id;
        if (dailyId && !dismissedSet.has(dailyId)) {
          setDismissed(false);
        }
      }
    });
  }, []);

  const handleDismiss = () => {
    const activeId = customNotif?.id || dailyNote?.notification?.id;
    if (activeId) {
      const prev = (localStorage.getItem("pmu_dismissed_notif_ids") || "")
        .split(",")
        .filter(Boolean);
      if (!prev.includes(activeId)) prev.push(activeId);
      localStorage.setItem("pmu_dismissed_notif_ids", prev.slice(-30).join(","));
      localStorage.setItem("pmu_dismissed_notif_id", activeId);
    }
    setDismissed(true);
  };

  if (dismissed || (!customNotif && !dailyNote)) return null;

  // Render Admin Custom Broadcast Notification if active
  if (customNotif) {
    const accentColor =
      customNotif.category === "success"
        ? "#4ade80"
        : customNotif.category === "mentorship"
        ? "#fbbf24"
        : customNotif.category === "alert"
        ? "#ef4444"
        : "#ff3b1d";

    return (
      <div
        style={{
          backgroundColor: "#141418",
          borderBottom: `1px solid ${accentColor}`,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#08080a",
              backgroundColor: accentColor,
              padding: "2px 6px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {customNotif.category}
          </span>
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#f3f1ea" }}>
            {customNotif.title}
          </span>
          <span style={{ fontSize: "12px", color: "#a19f95" }}>
            — {customNotif.message}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {customNotif.ctaHref && (
            <Link
              href={customNotif.ctaHref}
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: accentColor,
                color: "#08080a",
                padding: "4px 10px",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              {customNotif.ctaLabel || "Open →"}
            </Link>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: "#807f78",
              cursor: "pointer",
              fontSize: "13px",
              padding: "2px 6px",
            }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (!dailyNote) return null;

  return (
    <div
      style={{
        backgroundColor: "#141418",
        borderBottom: "1px solid rgba(255, 59, 29, 0.5)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
        <span
          className="font-mono"
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#ff6a3d",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          🔔 Daily Capsule:
        </span>
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#f3f1ea" }}>
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

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            backgroundColor: "#ff3b1d",
            color: "#08080a",
            padding: "4px 10px",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          Open →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#807f78",
            cursor: "pointer",
            fontSize: "13px",
            padding: "2px 6px",
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
