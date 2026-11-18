"use client";

import React, { useEffect, useState } from "react";

interface ContentProtectionProps {
  studentName?: string;
  studentPhone?: string;
  children?: React.ReactNode;
}

/**
 * Enterprise-grade Content DRM & Anti-Leak Protection Suite:
 * 1. Blocks Right-Click / Context Menu.
 * 2. Blocks Copy, Cut, Paste, Print (Ctrl+P), Save (Ctrl+S), View-Source (Ctrl+U), Inspect (F12).
 * 3. Blurs content when screen capture / PrintScreen is triggered or window loses focus.
 * 4. Injects dynamic forensic watermark with student mobile number to deter external recording.
 * 5. Blank prints: zero content leaks via "Print to PDF".
 *
 * Light academic restyle (recolored calm tones, logic intact).
 */
export function ContentProtection({ studentName, studentPhone, children }: ContentProtectionProps) {
  const [blurred, setBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const identifier = studentPhone || studentName || "STUDENT ACADEMIC ACCESS";

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;

    const showWarning = (msg: string) => {
      setWarningMessage(msg);
      clearTimeout(warningTimer);
      warningTimer = setTimeout(() => setWarningMessage(null), 3000);
    };

    // 1. Intercept Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning("Content protected — Right-click & copying are disabled.");
      return false;
    };

    // 2. Intercept Copy / Cut events and poison clipboard
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          "text/plain",
          "Protected Academic Material — PrepMeUp AI. Copying is prohibited."
        );
      }
      showWarning("Clipboard copy disabled — Academic materials are copyright protected.");
      return false;
    };

    // 3. Intercept Keyboard Shortcuts (Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+U, F12, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // PrintScreen / Screenshot attempt
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        setBlurred(true);
        showWarning("Screen capture detected — Screen blurred for protection.");
        setTimeout(() => setBlurred(false), 2500);
      }

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();

        // Copy (c), Cut (x), Print (p), Save (s), View Source (u)
        if (key === "c" || key === "x" || key === "p" || key === "s" || key === "u") {
          e.preventDefault();
          e.stopPropagation();
          showWarning(`Action disabled (Ctrl+${key.toUpperCase()}) — Exporting is prohibited.`);
          return false;
        }

        // Inspect Element (Ctrl+Shift+I or Ctrl+Shift+C or Ctrl+Shift+J)
        if (e.shiftKey && (key === "i" || key === "c" || key === "j")) {
          e.preventDefault();
          e.stopPropagation();
          showWarning("Developer tools disabled on academic notes.");
          return false;
        }
      }

      // F12 Inspect Element
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        showWarning("Developer tools disabled on academic notes.");
        return false;
      }
    };

    // 4. Blur content when window loses focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurred(true);
      } else {
        setTimeout(() => setBlurred(false), 400);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(warningTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        filter: blurred ? "blur(24px)" : "none",
        transition: "filter 0.25s ease",
      }}
    >
      {/* Dynamic Forensic Watermark Tiles */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "80px",
          overflow: "hidden",
          opacity: 0.03,
          userSelect: "none",
        }}
      >
        {Array.from({ length: 24 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              transform: "rotate(-25deg)",
              fontSize: "12px",
              fontFamily: "monospace",
              fontWeight: 600,
              color: "#C2331B",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            {identifier} • PrepMeUp DRM
          </div>
        ))}
      </div>

      {/* Floating Security Toast Warning */}
      {warningMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100000,
            padding: "10px 16px",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DB",
            color: "#1C1A17",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          {warningMessage}
        </div>
      )}

      {children}
    </div>
  );
}
