"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const claimSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian WhatsApp mobile number"),
});

const BETA_PAIN_POINTS = [
  "Applied Math Derivations (ACM-101)",
  "BEE Circuit Numericals (BEE-103)",
  "Python Coding & Debugging (PYT-102)",
  "COA Pipelining & Cache (COA-104)",
];

export function PricingClaimForm() {
  const [whatsapp, setWhatsapp] = useState("");
  const [betaFeedback, setBetaFeedback] = useState("Applied Math Derivations (ACM-101)");
  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [pledgedBeta, setPledgedBeta] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [postClaimTestimonialSaved, setPostClaimTestimonialSaved] = useState(false);
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = claimSchema.safeParse({
      whatsappNumber: whatsapp,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    if (!pledgedBeta) {
      setError("Tier 0 Free Pass requires joining our Beta Tester & Testimonial cohort.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/payments/claim-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: whatsapp,
          betaFeedback,
          testimonialQuote,
          pledgedBeta: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to claim Tier 0 Free Beta Seat.");
      }

      setClaimResult(data.data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid rgba(34,197,94,0.35)",
          backgroundColor: "rgba(3,46,21,0.25)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto 0.625rem",
              display: "flex",
              height: "2.25rem",
              width: "2.25rem",
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
          <h4
            style={{
              fontFamily: 'var(--font-anton), "Anton", sans-serif',
              fontSize: "1.125rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#f3f1ea",
            }}
          >
            Tier 0 Founding Beta Pass Activated!
          </h4>
          <p style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "#86efac" }}>
            {claimResult?.message || "100% Free Beta Tester Access Unlocked (180 Days)."}
          </p>
          <span
            style={{
              marginTop: "0.5rem",
              display: "inline-block",
              borderRadius: "0.25rem",
              backgroundColor: "#08080a",
              padding: "0.35rem 0.65rem",
              fontFamily: "monospace",
              fontSize: "0.6875rem",
              color: "#ff6a3d",
            }}
          >
            Beta Seat #{claimResult?.claimedSeatNumber || 1}/10 • {claimResult?.remainingSeats ?? 9} Free Seats Left
          </span>
        </div>

        {/* Aggressive Post-Claim Testimonial & Feedback Extraction */}
        <div
          style={{
            borderRadius: "0.5rem",
            border: "1px solid rgba(255,59,29,0.35)",
            backgroundColor: "#08080a",
            padding: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
              ⚡ Founding Beta Tester Wall
            </span>
            <div style={{ display: "flex", gap: "3px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: star <= rating ? "#facc15" : "#3f3f46",
                    padding: 0,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {postClaimTestimonialSaved ? (
            <p style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>
              ✓ Thank you! Your beta feedback &amp; testimonial have been logged on your Founding Beta profile.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                placeholder="Write a 1-line initial impression / testimonial quote..."
                value={testimonialQuote}
                onChange={(e) => setTestimonialQuote(e.target.value)}
                className="pmu-input"
                style={{ fontSize: "11px", padding: "7px 10px" }}
              />
              <button
                type="button"
                onClick={() => setPostClaimTestimonialSaved(true)}
                className="pmu-btn-secondary"
                style={{ padding: "6px 10px", fontSize: "11px", width: "100%" }}
              >
                Submit Founding Beta Feedback &amp; Testimonial ✓
              </button>
            </div>
          )}
        </div>

        <Link href="/prepmeup/dashboard" className="pmu-btn-primary" style={{ width: "100%" }}>
          Enter Student Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {error && (
        <div
          style={{
            borderRadius: "0.5rem",
            border: "1px solid rgba(239,68,68,0.35)",
            backgroundColor: "rgba(70,8,9,0.35)",
            padding: "0.65rem 0.875rem",
            fontSize: "0.75rem",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="whatsapp"
          style={{
            marginBottom: "0.35rem",
            display: "block",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#807f78",
          }}
        >
          WhatsApp Number (For Instant Beta Seat)
        </label>
        <div style={{ display: "flex" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderTopLeftRadius: "0.375rem",
              borderBottomLeftRadius: "0.375rem",
              border: "1px solid rgba(243,241,234,0.16)",
              borderRight: "none",
              backgroundColor: "#17171b",
              padding: "0 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#807f78",
            }}
          >
            +91
          </span>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="pmu-input"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          />
        </div>
      </div>

      {/* Aggressive Feedback Extraction Field */}
      <div>
        <label
          htmlFor="beta-feedback"
          style={{
            marginBottom: "0.35rem",
            display: "block",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#ff6a3d",
          }}
        >
          Beta Feedback: Your #1 Semester 1 Struggle?
        </label>
        <select
          id="beta-feedback"
          value={betaFeedback}
          onChange={(e) => setBetaFeedback(e.target.value)}
          className="pmu-input"
          style={{ fontSize: "0.75rem", padding: "0.55rem 0.75rem" }}
        >
          {BETA_PAIN_POINTS.map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </select>
      </div>

      {/* Beta Tester & Testimonial Pledge */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem",
          padding: "0.625rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(255,59,29,0.28)",
          backgroundColor: "rgba(255,59,29,0.06)",
          cursor: "pointer",
          fontSize: "0.72rem",
          lineHeight: 1.45,
          color: "#d4d2c8",
        }}
      >
        <input
          type="checkbox"
          checked={pledgedBeta}
          onChange={(e) => setPledgedBeta(e.target.checked)}
          style={{ marginTop: "2px", accentColor: "#ff3b1d" }}
        />
        <span>
          <strong>Beta Tester Pledge:</strong> I’ll actively test the platform and share brutal feedback + a short testimonial for my 100% FREE pass.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="pmu-btn-primary"
        style={{ width: "100%", marginTop: "0.15rem" }}
      >
        {loading ? "Allocating Tier 0 Beta Seat…" : "Claim Tier 0: Free Beta Pass (First 10) →"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.6875rem",
          color: "#807f78",
          lineHeight: 1.35,
        }}
      >
        Strict limit: First 10 students get 100% FREE access in exchange for direct product feedback &amp; testimonials.
      </p>
    </form>
  );
}
