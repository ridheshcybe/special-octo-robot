import Link from "next/link";
import { notFound } from "next/navigation";
import { getPmuSubjectDetail } from "../../../_lib/queries";
import { SubjectTabsClient } from "./SubjectTabsClient";

export const revalidate = 60;

interface SubjectDetailPageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectSlug } = await params;
  const detail = await getPmuSubjectDetail(subjectSlug);

  if (!detail) {
    notFound();
  }

  const { subject, modules, sampleNote, pastPapers } = detail;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <Link
          href="/prepmeup/subjects"
          className="font-mono"
          style={{ fontSize: "12px", fontWeight: 600, color: "#a19f95", textDecoration: "none" }}
        >
          ← Back to All Semester 1 Subjects
        </Link>
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">{subject.code}</span>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#4ade80",
              backgroundColor: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              padding: "3px 10px",
              borderRadius: "4px",
            }}
          >
            {subject.credit_units} Credits • All Sample &amp; Full Unit Notes Unlocked
          </span>
        </div>
        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          {subject.title}
        </h1>
        <p style={{ marginTop: "10px", maxWidth: "740px", fontSize: "14px", lineHeight: 1.65, color: "#a19f95" }}>
          {subject.description}
        </p>
      </div>

      {/* Interactive Tabs View */}
      <SubjectTabsClient
        subjectCode={subject.code}
        subjectTitle={subject.title}
        modules={modules}
        sampleNote={sampleNote}
        pastPapers={pastPapers}
      />
    </div>
  );
}
