"use client";

import React, { useState } from "react";

export function BetaFeedbackExtractor({ studentName = "Beta Tester" }: { studentName?: string }) {
  const [rating, setRating] = useState(5);
  const [favoriteFeature, setFavoriteFeature] = useState("LaTeX Notes & Derivations");
  const [improvement, setImprovement] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!improvement.trim() && !testimonial.trim()) return;
    setSubmitted(true);
  };

  return (
    <div
      className="pmu-card-highlight"
      style={{
        padding: "24px 28px",
        border: "1px solid rgba(255,59,29,0.45)",
        background: "linear-gradient(135deg, rgba(255,59,29,0.12) 0%, #111114 65%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <span className="pmu-badge pmu-badge-accent">
            🔥 Tier 0 Beta Tester &amp; Testimonial Program (First 10 Free Cohort)
          </span>
          <h2
            className="font-display"
            style={{ marginTop: "8px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}
          >
            Share Your Brutal Beta Feedback &amp; Student Testimonial
          </h2>
          <p style={{ marginTop: "4px", fontSize: "13px", color: "#a19f95" }}>
            As one of our first 10 free beta students, your feedback directly shapes every update—and your testimonial is featured on the Founding Student Wall.
          </p>
        </div>

        {/* Star Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            backgroundColor: "#08080a",
            border: "1px solid #26262c",
          }}
        >
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", marginRight: "4px" }}>
            RATING:
          </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: star <= rating ? "#facc15" : "#3f3f46",
                padding: 0,
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {submitted ? (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid rgba(34,197,94,0.4)",
            backgroundColor: "rgba(3,46,21,0.25)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#4ade80" }}>
              ✓ Beta Feedback &amp; Testimonial Recorded — Thank You, {studentName}!
            </div>
            <p style={{ marginTop: "4px", fontSize: "12px", color: "#86efac" }}>
              Rated {rating}/5 ★ • Favorite Engine: <strong>{favoriteFeature}</strong>
              {testimonial ? ` • "${testimonial}"` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="pmu-btn-secondary"
            style={{ padding: "6px 12px", fontSize: "11px" }}
          >
            Add More Feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pmu-grid-3" style={{ alignItems: "end", gap: "14px" }}>
          <div>
            <label className="pmu-label">1. What Should We Improve Immediately?</label>
            <input
              type="text"
              placeholder="e.g., Add more RK4 solved examples or COA cache questions..."
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              className="pmu-input"
              style={{ fontSize: "12px" }}
            />
          </div>

          <div>
            <label className="pmu-label">2. Your Public Testimonial Quote</label>
            <input
              type="text"
              placeholder="e.g., The LaTeX notes & BEE circuit sims saved my Semester 1 prep!"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="pmu-input"
              style={{ fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={favoriteFeature}
              onChange={(e) => setFavoriteFeature(e.target.value)}
              className="pmu-input"
              style={{ fontSize: "12px", flex: 1 }}
            >
              <option value="LaTeX Notes & Derivations">LaTeX Notes</option>
              <option value="AI Doubt Copilot">AI Doubt Copilot</option>
              <option value="BEE & Python Simulations">Simulations</option>
              <option value="1:1 Human Support">1:1 Human Support</option>
            </select>
            <button type="submit" className="pmu-btn-primary" style={{ whiteSpace: "nowrap", padding: "10px 18px", fontSize: "12px" }}>
              Submit Feedback →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
