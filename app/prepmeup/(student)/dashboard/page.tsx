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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader
        title={`Welcome back, ${studentName}`}
        subtitle={`Semester ${semester} • ${branch} • ${
          tier === "tier3" ? "VIP 1:1 Pass" : tier === "tier2" ? "Pro Pass" : "Academic Pass"
        }`}
        action={{
          label: "Ask AI tutor",
          href: "/prepmeup/doubts",
        }}
      />

      {/* Primary Focus: Continue + Today's Task */}
      <div className="pmu-grid-2" style={{ gap: "20px" }}>
        <div
          className="pmu-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DB",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", color: "#6F6B62", textTransform: "uppercase" }}>
              Continue where you left off
            </span>
            <h2
              style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17", margin: "6px 0 2px" }}
            >
              {firstSubject ? firstSubject.title : "Semester 1 Core"}
            </h2>
            <p style={{ fontSize: "13.5px", color: "#6F6B62", margin: 0 }}>
              {firstSubject ? `${firstSubject.code} • Resume your notes and practice` : "Resume your active course"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href={firstSubject ? `/prepmeup/subjects/${firstSubject.slug}` : "/prepmeup/subjects"}
              className="pmu-btn-secondary"
            >
              Open subject
            </Link>
            <Link href="/prepmeup/tracks" className="pmu-btn-secondary">
              Browse tracks
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
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DB",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", color: "#6F6B62", textTransform: "uppercase" }}>
              Today&apos;s focus
            </span>
            <h2
              style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17", margin: "6px 0 2px" }}
            >
              {(dailyNote as any)?.topicTitle || "Daily Practice & Revision"}
            </h2>
            <p style={{ fontSize: "13.5px", color: "#6F6B62", margin: 0 }}>
              {dailyNote?.subjectCode
                ? `${dailyNote.subjectCode} • 10-minute concept review`
                : "Complete one topic quiz or review today's capsule"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/prepmeup/quizzes" className="pmu-btn-secondary">
              Take a quiz
            </Link>
            <Link href="/prepmeup/sessions" className="pmu-btn-secondary">
              1:1 Mentorship
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <Section
        title={`Semester ${semester} subjects`}
        action={
          <Link href="/prepmeup/progress" style={{ fontSize: "13px", color: "#6F6B62", textDecoration: "none" }}>
            View progress →
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
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E4DB",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span className="pmu-badge">{subj.code}</span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#6F6B62" }}>
                    {subj.credit_units} credits • {subj.module_count ?? 5} modules
                  </span>
                </div>
                <h3
                  style={{ fontSize: "16px", fontWeight: 700, color: "#1C1A17", marginTop: "8px" }}
                >
                  {subj.title}
                </h3>
                <p style={{ marginTop: "4px", fontSize: "12.5px", lineHeight: 1.5, color: "#6F6B62" }}>
                  {subj.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid #E8E4DB",
                }}
              >
                <span style={{ fontSize: "11px", color: "#6F6B62" }}>
                  LaTeX notes &amp; quizzes
                </span>
                <Link
                  href={`/prepmeup/subjects/${subj.slug}`}
                  style={{ fontSize: "12px", fontWeight: 600, color: "#C2331B", textDecoration: "none" }}
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Study Workbench Strip */}
      <div className="pmu-grid-3">
        {[
          {
            title: "AI doubt tutor",
            sub: "Step-by-step LaTeX & code help",
            href: "/prepmeup/doubts",
            cta: "Ask question →",
          },
          {
            title: "Python coding lab",
            sub: "Browser IDE & test case execution",
            href: "/prepmeup/coding",
            cta: "Open IDE →",
          },
          {
            title: "Visual simulators",
            sub: "Circuit, CPU & quantum interactive models",
            href: "/prepmeup/simulations",
            cta: "Launch simulators →",
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
              gap: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E4DB",
            }}
          >
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1C1A17" }}>
                {tool.title}
              </h3>
              <p style={{ marginTop: "2px", fontSize: "12px", color: "#6F6B62" }}>{tool.sub}</p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#C2331B" }}>
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
