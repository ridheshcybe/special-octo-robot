import Link from "next/link";
import { cookies } from "next/headers";
import { getPmuSubjects } from "../../_lib/queries";
import { DailyNoteCapsule } from "../../_components/DailyNoteCapsule";
import { getStoredDailyNote } from "@/lib/prepmeup/dailyNotes";
import { PageHeader, Section } from "../../_components/ui";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pmu-session")?.value;
  const subjects = await getPmuSubjects();
  const dailyNote = getStoredDailyNote();

  let studentName = "Engineering Student";
  let branch = "B.Tech CSE AI/ML";
  let semester = 1;
  let tier = "tier1";

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.fullName?.trim()) studentName = parsed.fullName.trim();
      if (parsed.branch?.trim()) branch = parsed.branch.trim();
      if (parsed.currentSemester) semester = Number(parsed.currentSemester);
      if (parsed.tier) tier = parsed.tier;
    } catch {
      // Fallback defaults
    }
  }

  const firstSubject = subjects[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <PageHeader
        title={`Welcome back, ${studentName}`}
        subtitle={`Semester ${semester} • ${branch} • ${
          tier === "tier3" ? "VIP 1:1 Pass" : tier === "tier2" ? "Pro Pass" : "Starter Pass"
        }`}
        action={{
          label: "Ask AI Tutor",
          href: "/prepmeup/doubts",
        }}
      />

      {/* Primary Focus: Continue + Today's Task */}
      <div className="pmu-grid-2" style={{ gap: "24px" }}>
        <div
          className="pmu-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#807f78" }}>
              Continue where you left off
            </span>
            <h2
              className="font-display"
              style={{ fontSize: "22px", color: "#f3f1ea", margin: "8px 0 4px", textTransform: "uppercase" }}
            >
              {firstSubject ? firstSubject.title : "Semester 1 Core"}
            </h2>
            <p style={{ fontSize: "14px", color: "#807f78", margin: 0 }}>
              {firstSubject ? `${firstSubject.code} • Pick up your notes and practice` : "Resume your active course"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={firstSubject ? `/prepmeup/subjects/${firstSubject.slug}` : "/prepmeup/subjects"}
              className="pmu-btn-secondary"
            >
              Open Subject
            </Link>
            <Link href="/prepmeup/tracks" className="pmu-btn-secondary">
              Browse Tracks
            </Link>
          </div>
        </div>

        <div
          className="pmu-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#807f78" }}>
              Today&apos;s Task
            </span>
            <h2
              className="font-display"
              style={{ fontSize: "22px", color: "#f3f1ea", margin: "8px 0 4px", textTransform: "uppercase" }}
            >
              {(dailyNote as any)?.topicTitle || "Daily Practice & Revision"}
            </h2>
            <p style={{ fontSize: "14px", color: "#807f78", margin: 0 }}>
              {dailyNote?.subjectCode
                ? `${dailyNote.subjectCode} • 10 min quick review`
                : "Complete one topic quiz or review today's capsule"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/prepmeup/quizzes" className="pmu-btn-secondary">
              Take a Quiz
            </Link>
            <Link href="/prepmeup/sessions" className="pmu-btn-secondary">
              1:1 Mentorship
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <Section
        title={`Semester ${semester} Subjects`}
        action={
          <Link href="/prepmeup/progress" style={{ fontSize: "13px", color: "#807f78", textDecoration: "none" }}>
            View Progress →
          </Link>
        }
      >

        <div className="pmu-grid-3">
          {subjects.map((subj) => (
            <div
              key={subj.slug}
              className="pmu-card"
              style={{
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span className="pmu-badge">{subj.code}</span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                    {subj.credit_units} Credits • {subj.module_count ?? 5} Modules
                  </span>
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "18px", textTransform: "uppercase", color: "#f3f1ea", marginTop: "10px" }}
                >
                  {subj.title}
                </h3>
                <p style={{ marginTop: "4px", fontSize: "12.5px", lineHeight: 1.5, color: "#807f78" }}>
                  {subj.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid #1f1f26",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                  LaTeX Notes &amp; Quizzes
                </span>
                <Link
                  href={`/prepmeup/subjects/${subj.slug}`}
                  style={{ fontSize: "12px", fontWeight: 700, color: "#ff3b1d", textDecoration: "none" }}
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Study Workbench Strip */}
      <div className="pmu-grid-4">
        {[
          {
            title: "AI Doubt Tutor",
            sub: "Step-by-step LaTeX & code help",
            href: "/prepmeup/doubts",
            cta: "Ask Doubt →",
          },
          {
            title: "Python Coding Lab",
            sub: "Browser IDE & AI debugger",
            href: "/prepmeup/coding",
            cta: "Open IDE →",
          },
          {
            title: "Visual Simulators",
            sub: "17+ circuit, CPU & quantum labs",
            href: "/prepmeup/simulations",
            cta: "Launch Labs →",
          },
          {
            title: "SGPA & Rank Tools",
            sub: "AICTE CGPA & cohort predictor",
            href: "/prepmeup/tools/cgpa",
            cta: "Calculate →",
          },
        ].map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="pmu-card"
            style={{
              padding: "16px 18px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div>
              <h3 className="font-display" style={{ fontSize: "17px", textTransform: "uppercase", color: "#f3f1ea" }}>
                {tool.title}
              </h3>
              <p style={{ marginTop: "4px", fontSize: "12px", color: "#807f78" }}>{tool.sub}</p>
            </div>
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff6a3d" }}>
              {tool.cta}
            </span>
          </Link>
        ))}
      </div>

      {/* Daily Revision Capsule */}
      <DailyNoteCapsule initialData={dailyNote} />
    </div>
  );
}
