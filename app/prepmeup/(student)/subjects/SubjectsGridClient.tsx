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
          <div key={sub.code} className="pmu-card" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DB" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 600, color: "#6F6B62" }}>
                    {sub.code}
                  </span>
                </span>
                <span
                  style={{
                    borderRadius: "0.25rem",
                    backgroundColor: "#F6E7E3",
                    border: "1px solid #E8E4DB",
                    padding: "0.2rem 0.5rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: "#C2331B",
                  }}
                >
                  {sub.credit_units} credits
                </span>
              </div>

              <h2
                style={{
                  marginTop: "0.875rem",
                  fontFamily: 'var(--font-onest), "Onest", sans-serif',
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1C1A17",
                }}
              >
                {sub.title}
              </h2>

              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.8125rem",
                  lineHeight: 1.55,
                  color: "#6F6B62",
                }}
              >
                {sub.description}
              </p>

              {/* Progress Bar */}
              <div style={{ marginTop: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.6875rem",
                    color: "#6F6B62",
                    marginBottom: "0.375rem",
                  }}
                >
                  <span>Topic mastery</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: completion >= 100 ? "#1F7A4D" : "#1C1A17",
                    }}
                  >
                    {completion}% complete
                  </span>
                </div>
                <div
                  style={{
                    height: "0.375rem",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "9999px",
                    backgroundColor: "#F4F2ED",
                    border: "1px solid #E8E4DB",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.max(0, completion))}%`,
                      backgroundColor: completion >= 100 ? "#1F7A4D" : "#C2331B",
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
                borderTop: "1px solid #E8E4DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#6F6B62" }}>
                {sub.module_count ?? 5} modules • LaTeX notes &amp; quizzes
              </span>
              <Link href={`/prepmeup/subjects/${sub.slug}`} className="pmu-btn-sm">
                Open subject →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
