"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { onboardingSchema } from "../_lib/validation";

export default function OnboardingPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("B.Tech CSE AI/ML");
  const [currentSemester, setCurrentSemester] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = onboardingSchema.safeParse({
      fullName,
      branch,
      currentSemester,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Please complete all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to update profile.");
        setLoading(false);
        return;
      }

      router.push("/prepmeup/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="pmu-auth-shell">
      <div className="pmu-auth-card" style={{ maxWidth: "32rem" }}>
        <div style={{ textAlign: "center" }}>
          <Link href="/prepmeup" className="pmu-brand-logo">
            <span className="pmu-brand-mark">P</span>
            <span className="pmu-brand-title">
              PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
            </span>
          </Link>
          <div style={{ marginTop: "0.75rem" }}>
            <span className="pmu-pill-accent">Step 2 of 2</span>
          </div>
          <h1
            style={{
              marginTop: "0.75rem",
              fontFamily: 'var(--font-anton), "Anton", sans-serif',
              fontSize: "1.625rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#f3f1ea",
            }}
          >
            Complete Student Profile
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#807f78" }}>
            Customize your academic dashboard for Semester 1 curriculum recommendations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#807f78",
                marginBottom: "0.5rem",
              }}
            >
              Your Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Aryan Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pmu-input"
              required
              autoFocus
            />
          </div>

          <div className="pmu-grid-2" style={{ gap: "1rem" }}>
            <div>
              <label
                htmlFor="branch"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#807f78",
                  marginBottom: "0.5rem",
                }}
              >
                Branch
              </label>
              <input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="pmu-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="currentSemester"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#807f78",
                  marginBottom: "0.5rem",
                }}
              >
                Current Semester
              </label>
              <select
                id="currentSemester"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                className="pmu-input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div
              style={{
                borderRadius: "0.375rem",
                border: "1px solid rgba(239,68,68,0.35)",
                backgroundColor: "rgba(70,8,9,0.3)",
                padding: "0.75rem",
                fontSize: "0.75rem",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="pmu-btn-primary" style={{ width: "100%" }}>
            {loading ? "Saving Profile…" : "Save & Enter Student Dashboard →"}
          </button>
        </form>
      </div>
    </div>
  );
}
