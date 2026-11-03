import { Eyebrow } from "@/components/site/Eyebrow";
import { getPmuSubjects } from "../../_lib/queries";
import { SubjectsGridClient } from "./SubjectsGridClient";

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

      {/* Subject Grid with Dynamic Real Progress */}
      <SubjectsGridClient subjects={subjects} />
    </div>
  );
}
