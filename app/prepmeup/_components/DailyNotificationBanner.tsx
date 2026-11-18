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
    return (
      <div
        style={{
          backgroundColor: "#F4F2ED",
          borderBottom: "1px solid #E8E4DB",
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
            className="pmu-badge"
            style={{
              fontSize: "10px",
              padding: "2px 6px",
            }}
          >
            {customNotif.category}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1A17" }}>
            {customNotif.title}
          </span>
          <span style={{ fontSize: "12px", color: "#6F6B62" }}>
            — {customNotif.message}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {customNotif.ctaHref && (
            <Link
              href={customNotif.ctaHref}
              className="pmu-btn-sm"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
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
              color: "#6F6B62",
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
        backgroundColor: "#F4F2ED",
        borderBottom: "1px solid #E8E4DB",
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
          className="pmu-badge"
          style={{
            fontSize: "10px",
            color: "#C2331B",
            backgroundColor: "#F6E7E3",
            borderColor: "#E8E4DB",
          }}
        >
          Daily capsule
        </span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1A17" }}>
          {dailyNote.topic}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#1F7A4D",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DB",
            padding: "1px 6px",
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
          className="pmu-btn-sm"
          style={{
            fontSize: "11px",
            padding: "3px 8px",
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
            color: "#6F6B62",
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
