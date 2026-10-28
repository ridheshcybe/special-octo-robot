import Link from "next/link";
import { Eyebrow } from "@/components/site/Eyebrow";
import { getPmuSubjects } from "../../_lib/queries";

export const revalidate = 60;

export default async function SubjectsPage() {
  const subjects = await getPmuSubjects();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div>
        <div className="pmu-eyebrow">
          <span className="pmu-eyebrow-dot" aria-hidden="true" />
          <span>Curriculum Explorer</span>
        </div>
        <h1 className="pmu-section-title" style={{ marginTop: "0.5rem" }}>
          Semester 1 Subjects
        </h1>
        <p className="pmu-section-lead">
          Explore detailed modules, verified chapter notes, derivations, and university past papers (PYQs).
        </p>
      </div>

      {/* Subject Grid */}
      <div className="pmu-grid-2">
        {subjects.map((sub) => (
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

              {/* Completion Indicator Placeholder */}
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
                  <span style={{ fontWeight: 600, color: "#f3f1ea" }}>0% Complete</span>
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
                  <div style={{ height: "100%", width: "0%", backgroundColor: "#ff3b1d" }} />
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
                {sub.module_count ?? 4} Modules • Notes &amp; Solved PYQs
              </span>
              <Link href={`/prepmeup/subjects/${sub.slug}`} className="pmu-btn-sm">
                Open Subject →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
