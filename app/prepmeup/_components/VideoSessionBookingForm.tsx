"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function VideoSessionBookingForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("Internship & Career Support (Resume, GitHub & Referrals)");
  const [whatsapp, setWhatsapp] = useState("");
  const [slot, setSlot] = useState("Today, 7:00 PM – 7:30 PM IST");
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = whatsapp.trim();
    if (!trimmed) {
      setError("Please enter your student email or mobile number to proceed.");
      return;
    }
    const isEmail = trimmed.includes("@");
    const cleanedPhone = trimmed.replace(/\D/g, "").slice(-10);

    if (!isEmail && !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError("Enter a valid student email address or 10-digit mobile number.");
      return;
    }

    const qs = new URLSearchParams({
      tier: "tier2",
      topic,
      slot,
      ...(isEmail ? { email: trimmed } : { phone: cleanedPhone }),
    });
    router.push(`/prepmeup/checkout?${qs.toString()}`);
  };

  if (booked) {
    return (
      <div
        style={{
          borderRadius: "8px",
          border: "1px solid rgba(34,197,94,0.35)",
          backgroundColor: "rgba(3,46,21,0.25)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            margin: "0 auto 8px",
            display: "flex",
            height: "34px",
            width: "34px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            backgroundColor: "rgba(34,197,94,0.2)",
            color: "#4ade80",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <h4 className="font-display" style={{ fontSize: "18px", textTransform: "uppercase", color: "#f3f1ea" }}>
          Tier 2 (₹199) + 1:1 Human Mentor Reserved!
        </h4>
        <p style={{ marginTop: "6px", fontSize: "12px", color: "#86efac", lineHeight: 1.5 }}>
          Focus: <strong>{topic}</strong>
          <br />
          1:1 Mentor Slot: <strong>{slot}</strong>
        </p>
        <p className="font-mono" style={{ marginTop: "8px", fontSize: "11px", color: "#ff6a3d" }}>
          Tier 2 Activation &amp; 1:1 Meet Link sent to +91 {whatsapp}
        </p>
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/prepmeup/doubts" className="pmu-btn-primary" style={{ width: "100%", padding: "8px", fontSize: "11px" }}>
            Launch Premium AI + 1:1 Doubt Hub →
          </Link>
          <button
            type="button"
            onClick={() => setBooked(false)}
            className="pmu-btn-secondary"
            style={{ width: "100%", padding: "7px", fontSize: "11px" }}
          >
            Change 1:1 Human Mentor Slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {error && (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(239,68,68,0.4)",
            backgroundColor: "rgba(70,8,9,0.35)",
            fontSize: "11px",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label className="pmu-label">1:1 Human &amp; Career Support Focus</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="pmu-input" style={{ fontSize: "12px", padding: "8px 10px" }}>
          <option value="Internship & Career Support (Resume, GitHub & Referrals)">★ Internship &amp; Career Support (₹199 Exclusive)</option>
          <option value="Applied Computational Mathematics (CSE1001)">CSE1001: Applied Mathematics</option>
          <option value="Python Programming & Code Review (CSE1005)">CSE1005: Python Programming</option>
          <option value="Basic Electrical Engineering (CSE1002)">CSE1002: Basic Electrical Engg</option>
          <option value="Computer Organisation & Architecture (CSE1003)">CSE1003: Computer Architecture</option>
        </select>
      </div>

      <div>
        <label className="pmu-label">Preferred 30-minute 1:1 Human Mentor Slot</label>
        <select value={slot} onChange={(e) => setSlot(e.target.value)} className="pmu-input" style={{ fontSize: "12px", padding: "8px 10px" }}>
          <option value="Today, 7:00 PM – 7:30 PM IST">Today, 7:00 PM – 7:30 PM IST</option>
          <option value="Today, 9:00 PM – 9:30 PM IST">Today, 9:00 PM – 9:30 PM IST</option>
          <option value="Tomorrow, 6:00 PM – 6:30 PM IST">Tomorrow, 6:00 PM – 6:30 PM IST</option>
          <option value="Direct WhatsApp + Weekend Deep-Dive">Direct WhatsApp + Weekend Deep-Dive</option>
        </select>
      </div>

      <div>
        <label className="pmu-label">Student Email or WhatsApp Number</label>
        <input
          type="text"
          placeholder="student@dypiu.ac.in or 9876543210"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="pmu-input font-mono"
          style={{ fontSize: "12px", padding: "8px 10px" }}
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>

      <button type="submit" className="pmu-btn-primary" style={{ width: "100%", marginTop: "4px" }}>
        Pay ₹199 via Razorpay (Tier 2 + Career) →
      </button>
    </form>
  );
}
