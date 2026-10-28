import Link from "next/link";
import { cookies } from "next/headers";
import { getPmuSubjects } from "../../_lib/queries";
import { BetaFeedbackExtractor } from "../../_components/BetaFeedbackExtractor";
import { DailyNoteCapsule } from "../../_components/DailyNoteCapsule";
import { getStoredDailyNote } from "@/lib/prepmeup/dailyNotes";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pmu-session")?.value;
  const subjects = await getPmuSubjects();
  const dailyNote = getStoredDailyNote();

  let studentName = "Engineering Student";
  let branch = "B.Tech CSE AI/ML";
  let semester = 1;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.fullName?.trim()) studentName = parsed.fullName.trim();
      if (parsed.branch?.trim()) branch = parsed.branch.trim();
      if (parsed.currentSemester) semester = Number(parsed.currentSemester);
    } catch {
      // Fallback defaults
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Top Banner */}
      <div
        className="pmu-card-highlight"
        style={{
          padding: "28px 32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span className="pmu-badge">Semester {semester} Pass Active</span>
            <span
              className="font-mono"
              style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a19f95" }}
            >
              {branch}
            </span>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: "#f3f1ea",
            }}
          >
            Welcome Back, <span style={{ color: "#ff3b1d" }}>{studentName}</span>
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#a19f95", maxWidth: "620px" }}>
            Your Semester 1 B.Tech CSE AI/ML study workspace is unlocked. Pick up where you left off across notes,
            AI doubt solving, adaptive quizzes, and browser coding labs.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/prepmeup/doubts" className="pmu-btn-primary">
            Ask AI Doubt Tutor →
          </Link>
          <Link href="/prepmeup/quizzes" className="pmu-btn-secondary">
            Practice Quiz Arena
          </Link>
        </div>
      </div>

      {/* Aggressive Beta Tester Feedback & Testimonial Extractor */}
      <BetaFeedbackExtractor studentName={studentName} />

      {/* Daily High-Yield Academic Capsule (Updated Daily with Notes, Quiz & Summary) */}
      <DailyNoteCapsule initialData={dailyNote} />

      {/* Quick KPI Strip */}
      <div className="pmu-grid-4">
        {[
          { label: "Active Subjects", value: "06", sub: "28 Core Modules Unlocked" },
          { label: "AI Doubt Quota", value: "24/7", sub: "Step-by-Step LaTeX & Code" },
          { label: "Interactive Labs", value: "15+", sub: "Atlas Suite, BEE & Python Sims" },
          { label: "Pass Status", value: "PRO", sub: "180-Day Semester 1 Access" },
        ].map((stat) => (
          <div key={stat.label} className="pmu-card" style={{ padding: "22px" }}>
            <span
              className="font-mono"
              style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#807f78" }}
            >
              {stat.label}
            </span>
            <div
              className="font-display"
              style={{ fontSize: "38px", lineHeight: 1, color: "#f3f1ea", marginTop: "8px" }}
            >
              {stat.value}
            </div>
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#a19f95" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Core Semester 1 Subjects */}
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div>
            <span
              className="font-mono"
              style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff3b1d" }}
            >
              Curriculum Tracks
            </span>
            <h2
              className="font-display"
              style={{ fontSize: "28px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "4px" }}
            >
              Semester 1 Core Subjects
            </h2>
          </div>
          <Link
            href="/prepmeup/subjects"
            className="font-mono"
            style={{ fontSize: "12px", textTransform: "uppercase", color: "#ff3b1d", textDecoration: "none" }}
          >
            View Full Syllabus Catalog →
          </Link>
        </div>

        <div className="pmu-grid-2">
          {subjects.map((subj) => (
            <div
              key={subj.slug}
              className="pmu-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "18px" }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span className="pmu-badge">{subj.code}</span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                    {subj.credit_units} Credits • {subj.module_count ?? 4} Modules
                  </span>
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "14px" }}
                >
                  {subj.title}
                </h3>
                <p style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
                  {subj.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "14px",
                  borderTop: "1px solid #26262c",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                  {subj.module_count ?? 4} Modules • Notes &amp; Solved PYQs
                </span>
                <Link
                  href={`/prepmeup/subjects/${subj.slug}`}
                  className="pmu-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "11px" }}
                >
                  Study Notes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Practice & AI Tools */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <span
            className="font-mono"
            style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff3b1d" }}
          >
            Practice & Execution
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: "28px",
              textTransform: "uppercase",
              color: "#f3f1ea",
              marginTop: "4px",
            }}
          >
            Interactive Study Engines &amp; Visual Labs
          </h2>
        </div>

        {/* Featured Visual Atlas & Interactive Laboratory */}
        <div
          className="pmu-card-highlight"
          style={{
            padding: "26px 30px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 59, 29, 0.4)",
            backgroundColor: "#111114",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "9999px",
                  backgroundColor: "#ff3b1d",
                  boxShadow: "0 0 10px #ff3b1d",
                }}
              />
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase" }}>
                Visual Engineering Atlas &amp; Laboratory
              </span>
              <span className="pmu-badge">5 Interactive Canvas Suites</span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/prepmeup/simulations/atlas"
                className="pmu-btn-primary"
                style={{ padding: "8px 18px", fontSize: "11px" }}
              >
                Launch Atlas Lab →
              </Link>
              <Link
                href="/prepmeup/simulations"
                className="pmu-btn-secondary"
                style={{ padding: "8px 14px", fontSize: "11px" }}
              >
                All 15+ Simulators →
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea", margin: "2px 0" }}>
              Semester 1 Interactive Knowledge Atlas
            </h3>
            <p style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.6, maxWidth: "780px" }}>
              Step through live vector transformations, RLC series resonance curves on a dual-channel oscilloscope, and cycle-by-cycle RISC 5-stage CPU pipeline hazard execution with hardware forwarding.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid #26262c" }}>
            {[
              { label: "🌌 Curriculum Galaxy", href: "/prepmeup/simulations/atlas" },
              { label: "📐 ACM Matrix Vector Field", href: "/prepmeup/simulations/atlas-acm" },
              { label: "⚡ BEEE AC Oscilloscope", href: "/prepmeup/simulations/atlas-beee" },
              { label: "💻 COA CPU Pipeline", href: "/prepmeup/simulations/atlas-coa" },
              { label: "🏛️ IKS Heritage Timeline", href: "/prepmeup/simulations/atlas-iks" },
            ].map((m, idx) => (
              <Link
                key={idx}
                href={m.href}
                style={{
                  fontSize: "11px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "1px solid #26262c",
                  backgroundColor: "#17171b",
                  color: "#f3f1ea",
                  textDecoration: "none",
                  fontFamily: "monospace",
                }}
              >
                {m.label} →
              </Link>
            ))}
          </div>
        </div>

        <div className="pmu-grid-3">
          {[
            {
              title: "AI Doubt Solver",
              tag: "Gemini 2.5 Flash",
              desc: "Ask any engineering math derivation, Python traceback, or circuit analysis question and get structured LaTeX solutions.",
              href: "/prepmeup/doubts",
              cta: "Open Doubt Tutor →",
            },
            {
              title: "Python Coding Lab",
              tag: "Pyodide WASM",
              desc: "Execute Python 3.11 code directly in your browser with automated unit-test grading and AI line-by-line debugging.",
              href: "/prepmeup/coding",
              cta: "Launch Python IDE →",
            },
            {
              title: "Hardware & Circuit Sims",
              tag: "15+ Interactive Labs",
              desc: "Step through Ohm's Law, Kirchhoff's loops, AC oscilloscopes, CPU pipeline stages, and Python memory visualizers.",
              href: "/prepmeup/simulations",
              cta: "Launch Simulations Hub →",
            },
            {
              title: "Adaptive Quiz Arena",
              tag: "Exam Prep",
              desc: "Timed module-wise MCQ and numerical drills with instant explanations and accuracy breakdowns.",
              href: "/prepmeup/quizzes",
              cta: "Start Practice Quiz →",
            },
            {
              title: "Mastery & Analytics",
              tag: "Progress Tracker",
              desc: "Monitor topic completion, quiz accuracy trends, and personalized weak-area revision recommendations.",
              href: "/prepmeup/progress",
              cta: "View Progress →",
            },
            {
              title: "SGPA & Rank Calculators",
              tag: "Academic Utilities",
              desc: "Calculate your Semester 1 SGPA/CGPA and estimate your batch percentile from internal and end-sem scores.",
              href: "/prepmeup/tools/cgpa",
              cta: "Open Calculators →",
            },
          ].map((tool) => (
            <div
              key={tool.title}
              className="pmu-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
            >
              <div>
                <span className="pmu-badge">{tool.tag}</span>
                <h3
                  className="font-display"
                  style={{ fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "12px" }}
                >
                  {tool.title}
                </h3>
                <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>{tool.desc}</p>
              </div>
              <Link href={tool.href} className="pmu-btn-secondary" style={{ width: "100%" }}>
                {tool.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
