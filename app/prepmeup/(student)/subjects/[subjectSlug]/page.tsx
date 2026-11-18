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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "24px", backgroundColor: "#FFFFFF", border: "1px solid #E8E4DB" }}>
        <Link
          href="/prepmeup/subjects"
          style={{ fontSize: "13px", fontWeight: 500, color: "#6F6B62", textDecoration: "none" }}
        >
          ← Back to Semester 1 subjects
        </Link>
        <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span className="pmu-badge">{subject.code}</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "#C2331B",
              backgroundColor: "#F6E7E3",
              border: "1px solid #E8E4DB",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {subject.credit_units} credits • Syllabus &amp; notes
          </span>
        </div>
        <h1
          style={{
            marginTop: "10px",
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#1C1A17",
            letterSpacing: "-0.015em",
          }}
        >
          {subject.title}
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "700px", fontSize: "14px", lineHeight: 1.6, color: "#6F6B62" }}>
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
