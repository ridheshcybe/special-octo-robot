import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructorBySlug, getInstructorCourses } from "../../_lib/trackStore";

interface Props {
  params: Promise<{ instructorSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { instructorSlug } = await params;
  const instructor = getInstructorBySlug(instructorSlug);
  if (!instructor) return { title: "Instructor Profile | PrepMeUp AI" };
  return {
    title: `${instructor.fullName} | PrepMeUp AI`,
    description: instructor.bio,
  };
}

export default async function InstructorProfilePage({ params }: Props) {
  const { instructorSlug } = await params;
  const instructor = getInstructorBySlug(instructorSlug);

  if (!instructor) {
    notFound();
  }

  const courses = getInstructorCourses(instructor.slug);

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <Link href="/prepmeup/tracks" style={{ color: "#807f78", textDecoration: "none" }}>Tracks</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>Instructors</span>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>{instructor.fullName}</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="pmu-card" style={{ padding: "36px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "28px" }}>
            <div style={{ width: "110px", height: "110px", borderRadius: "50%", overflow: "hidden", border: "3px solid #ff3b1d", flexShrink: 0 }}>
              <img
                src={instructor.avatarUrl}
                alt={instructor.fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="pmu-badge" style={{ backgroundColor: "rgba(0, 230, 118, 0.15)", color: "#00e676" }}>
                  Verified PhD Faculty
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  ⭐ {instructor.rating || 4.95} Rating • {instructor.studentsMentored || 140}+ Mentored
                </span>
              </div>

              <h1 className="font-display" style={{ fontSize: "clamp(30px, 4.5vw, 44px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
                {instructor.fullName}
              </h1>
              <p className="font-mono" style={{ fontSize: "15px", color: "#ff6a3d", marginTop: "2px" }}>
                {instructor.title}
              </p>

              <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#08080a", borderRadius: "6px", border: "1px solid rgba(243, 241, 234, 0.08)", display: "inline-block" }}>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Credentials: </span>
                <span style={{ fontSize: "13px", color: "#f3f1ea" }}>{instructor.qualifications}</span>
              </div>

              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#807f78", marginTop: "16px" }}>
                {instructor.bio}
              </p>

              {/* Expertise Badges */}
              <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Specializations:</span>
                {instructor.expertise.map((exp) => (
                  <span key={exp} className="pmu-badge" style={{ backgroundColor: "#17171b", color: "#f3f1ea", fontSize: "11px" }}>
                    {exp}
                  </span>
                ))}
              </div>

              {/* Social / External Links */}
              <div style={{ marginTop: "20px", display: "flex", gap: "14px", alignItems: "center" }}>
                {instructor.linkedinUrl && (
                  <a
                    href={instructor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono"
                    style={{ fontSize: "12px", color: "#00e676", textDecoration: "none" }}
                  >
                    LinkedIn Profile ↗
                  </a>
                )}
                {instructor.githubUrl && (
                  <a
                    href={instructor.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono"
                    style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none" }}
                  >
                    GitHub Repositories ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Courses Section */}
        <div style={{ marginTop: "36px" }}>
          <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginBottom: "16px" }}>
            Assigned Courses ({courses.length})
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {courses.map((course) => (
              <div key={course.slug} className="pmu-card" style={{ padding: "26px", border: "1px solid rgba(255, 59, 29, 0.25)" }}>
                <span className="pmu-badge">{course.format.toUpperCase()}</span>
                <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#807f78", marginTop: "6px", lineHeight: "1.6" }}>
                  {course.subtitle}
                </p>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                    5 Modules • ₹{course.priceInr}
                  </span>
                  <Link
                    href={`/prepmeup/courses/${course.slug}`}
                    className="pmu-btn-primary"
                    style={{ padding: "8px 16px", fontSize: "12px" }}
                  >
                    Explore Course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
