"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PmuSubject } from "../../_lib/data";

interface SubjectsGridClientProps {
  subjects: PmuSubject[];
}

export function SubjectsGridClient({ subjects }: SubjectsGridClientProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/prepmeup/progress", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && Array.isArray(data.stats?.subjectsProgress)) {
          const map: Record<string, number> = {};
          for (const item of data.stats.subjectsProgress) {
            map[item.code] = typeof item.completion === "number" ? item.completion : 0;
          }
          setProgressMap(map);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pmu-grid-2">
      {subjects.map((sub) => {
        const completion = progressMap[sub.code] ?? 0;

        return (
          <div key={sub.code} className="pmu-card">
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }} aria-hidden="true">
                    {sub.icon}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 600, color: "#807f78" }}>
                    {sub.code}
                  </span>
                </span>
                <span
                  style={{
                    borderRadius: "0.25rem",
                    backgroundColor: "rgba(255,59,29,0.12)",
                    padding: "0.25rem 0.625rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#ff3b1d",
                  }}
                >
                  {sub.credit_units} Credits
                </span>
              </div>

              <h2
                style={{
                  marginTop: "1rem",
                  fontFamily: 'var(--font-anton), "Anton", sans-serif',
                  fontSize: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  color: "#f3f1ea",
                }}
              >
                {sub.title}
              </h2>

              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.8125rem",
                  lineHeight: 1.6,
                  color: "#807f78",
                }}
              >
                {sub.description}
              </p>

              {/* Dynamic Live Progress Bar driven by real student progress */}
              <div style={{ marginTop: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.6875rem",
                    color: "#807f78",
                    marginBottom: "0.375rem",
                  }}
                >
                  <span>Progress</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: completion >= 100 ? "#4ade80" : completion > 0 ? "#ff6a3d" : "#f3f1ea",
                    }}
                  >
                    {completion}% Complete
                  </span>
                </div>
                <div
                  style={{
                    height: "0.375rem",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "9999px",
                    backgroundColor: "#17171b",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.max(0, completion))}%`,
                      backgroundColor: completion >= 100 ? "#4ade80" : "#ff3b1d",
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid rgba(243,241,234,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#807f78" }}>
                {sub.module_count ?? 5} Modules • Notes &amp; Solved PYQs
              </span>
              <Link href={`/prepmeup/subjects/${sub.slug}`} className="pmu-btn-sm">
                Open Subject →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
