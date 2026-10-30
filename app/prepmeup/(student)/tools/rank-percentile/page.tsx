"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";

export default function RankPercentilePage() {
  const [userScore, setUserScore] = useState<number>(82);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [cohortAvg, setCohortAvg] = useState<number>(58);
  const [batchSize, setBatchSize] = useState<number>(120);

  const validationError = useMemo(() => {
    if (batchSize < 1) return "Cohort size must be at least 1 student.";
    if (totalMarks <= 0) return "Maximum exam marks must be greater than 0.";
    if (userScore < 0) return "Secured marks cannot be negative.";
    if (userScore > totalMarks) return `Secured marks (${userScore}) cannot exceed maximum marks (${totalMarks}).`;
    if (cohortAvg < 0) return "Cohort average cannot be negative.";
    if (cohortAvg > totalMarks) return `Cohort average (${cohortAvg}) cannot exceed maximum marks (${totalMarks}).`;
    return null;
  }, [batchSize, totalMarks, userScore, cohortAvg]);

  const { percentile, estimatedRank, percentage, zScoreFormatted } = useMemo(() => {
    if (validationError) {
      return { percentile: "--", estimatedRank: "--", percentage: "--", zScoreFormatted: "--" };
    }

    const pct = Math.min(100, Math.max(0, (userScore / totalMarks) * 100));
    const normalizedAvg = Math.min(100, Math.max(0, (cohortAvg / totalMarks) * 100));

    const estimatedStdDev = 15;
    const zScore = (pct - normalizedAvg) / estimatedStdDev;

    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
    const prob =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    const cdf = zScore >= 0 ? 1 - prob : prob;
    const calcPercentile = Math.min(99.9, Math.max(1.0, cdf * 100));
    const rank = Math.min(batchSize, Math.max(1, Math.round(batchSize * (1 - cdf)) || 1));

    return {
      percentile: calcPercentile.toFixed(1),
      estimatedRank: String(rank),
      percentage: pct.toFixed(1),
      zScoreFormatted: (zScore >= 0 ? `+${zScore.toFixed(2)}` : zScore.toFixed(2)),
    };
  }, [userScore, totalMarks, cohortAvg, batchSize, validationError]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">🏆 Cohort Standing Estimator</span>
            <Link
              href="/prepmeup/tools/cgpa"
              className="font-mono"
              style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none", fontWeight: 700 }}
            >
              Switch to SGPA &amp; CGPA Calculator →
            </Link>
          </div>
          <Link href="/prepmeup" className="font-mono" style={{ fontSize: "12px", color: "#a19f95", textDecoration: "none" }}>
            ← Back to PrepMeUp Home
          </Link>
        </div>

        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 0.96,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          Exam Rank &amp; Percentile Predictor
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "680px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Estimate your batch percentile and expected rank in mid-semester or end-semester examinations using Gaussian cohort modeling.
        </p>
      </div>

      {/* Main Grid */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Left 2 Columns: Sliders & Inputs */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="pmu-card" style={{ padding: "26px" }}>
            <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea", marginBottom: "18px" }}>
              Assessment Score Parameters
            </h2>

            <div className="pmu-grid-2" style={{ gap: "20px" }}>
              <div>
                <label htmlFor="userScore" className="pmu-label">
                  Your Secured Marks ({userScore} / {totalMarks})
                </label>
                <input
                  id="userScore"
                  type="number"
                  min={0}
                  max={totalMarks}
                  value={userScore}
                  onChange={(e) => setUserScore(Number(e.target.value))}
                  className="pmu-input font-mono"
                />
                <input
                  type="range"
                  min={0}
                  max={totalMarks}
                  value={userScore}
                  onChange={(e) => setUserScore(Number(e.target.value))}
                  style={{ width: "100%", marginTop: "8px", accentColor: "#ff3b1d" }}
                />
              </div>

              <div>
                <label htmlFor="totalMarks" className="pmu-label">
                  Maximum Exam Marks
                </label>
                <input
                  id="totalMarks"
                  type="number"
                  min={10}
                  max={500}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="pmu-input font-mono"
                />
              </div>

              <div>
                <label htmlFor="cohortAvg" className="pmu-label">
                  Estimated Class Average ({cohortAvg} Marks)
                </label>
                <input
                  id="cohortAvg"
                  type="number"
                  min={0}
                  max={totalMarks}
                  value={cohortAvg}
                  onChange={(e) => setCohortAvg(Number(e.target.value))}
                  className="pmu-input font-mono"
                />
                <input
                  type="range"
                  min={0}
                  max={totalMarks}
                  value={cohortAvg}
                  onChange={(e) => setCohortAvg(Number(e.target.value))}
                  style={{ width: "100%", marginTop: "8px", accentColor: "#ff6a3d" }}
                />
              </div>

              <div>
                <label htmlFor="batchSize" className="pmu-label">
                  Total Batch / Cohort Strength ({batchSize} Students)
                </label>
                <input
                  id="batchSize"
                  type="number"
                  min={10}
                  max={2000}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="pmu-input font-mono"
                />
                <input
                  type="range"
                  min={20}
                  max={600}
                  step={10}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  style={{ width: "100%", marginTop: "8px", accentColor: "#ff6a3d" }}
                />
              </div>
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "24px" }}>
            <RichMathMarkdown
              content={`### Statistical Normal Distribution Model
Your standardized $Z$-score relative to cohort mean $\\mu$ and standard deviation $\\sigma \\approx 15\\%$ is:

$$Z = \\frac{X - \\mu}{\\sigma}, \\qquad \\text{Percentile} = \\Phi(Z) \\times 100\\%, \\qquad \\text{Rank} \\approx \\lceil N \\cdot (1 - \\Phi(Z)) \\rceil$$`}
            />
          </div>
        </div>

        {/* Right Column: Live Standing Scorecard */}
        <div className="pmu-card-highlight" style={{ padding: "28px" }}>
          <span className="pmu-badge">Predicted Standing</span>

          {validationError ? (
            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "8px",
                backgroundColor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.45)",
                color: "#fca5a5",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#f87171", marginBottom: "6px" }}>
                ⚠️ Invalid Assessment Parameters
              </div>
              <div>{validationError}</div>
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#a19f95" }}>
                Gaussian modeling requires secured marks ≤ maximum marks and cohort strength ≥ 1. Adjust inputs on the left to recalculate.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginTop: "18px", display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #26262c", paddingBottom: "18px" }}>
                <div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", textTransform: "uppercase" }}>
                    Batch Percentile
                  </span>
                  <div className="font-display" style={{ fontSize: "54px", lineHeight: 1, color: "#ff3b1d", marginTop: "4px" }}>
                    {percentile}%
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95", textTransform: "uppercase" }}>
                    Estimated Rank
                  </span>
                  <div className="font-display" style={{ fontSize: "42px", lineHeight: 1, color: "#f3f1ea", marginTop: "4px" }}>
                    #{estimatedRank}
                  </div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                    out of {batchSize}
                  </span>
                </div>
              </div>

              {/* Visual Percentile Bar */}
              <div style={{ marginTop: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace", color: "#a19f95", marginBottom: "6px" }}>
                  <span>Cohort Distribution</span>
                  <span style={{ color: "#4ade80" }}>Top {(100 - Number(percentile)).toFixed(1)}%</span>
                </div>
                <div style={{ height: "8px", width: "100%", borderRadius: "9999px", backgroundColor: "#17171b", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${percentile}%`,
                      background: "linear-gradient(90deg, #ff3b1d, #4ade80)",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                  <span>Your Score Percentage:</span>
                  <strong className="font-mono" style={{ color: "#f3f1ea" }}>{percentage}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                  <span>Standardized Z-Score:</span>
                  <strong className="font-mono" style={{ color: "#ff6a3d" }}>{zScoreFormatted} σ</strong>
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255,59,29,0.14)",
                  border: "1px solid rgba(255,59,29,0.35)",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#ff3b1d",
                }}
              >
                {Number(percentile) >= 90
                  ? "🏆 Top 10% Batch Performer (O / A+ Band)"
                  : Number(percentile) >= 75
                  ? "🌟 Upper Quartile Distinction (A+ / A Band)"
                  : "📈 Solid Standing • Room for Revision Boost"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
