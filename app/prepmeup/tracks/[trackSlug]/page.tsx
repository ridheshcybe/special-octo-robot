import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackBySlug, getCoursesByTrack, getInstructorBySlug } from "../../_lib/trackStore";
import { PageHeader, EmptyState } from "../../_components/ui";
import { PrepMeUpNav } from "../../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../../_components/PrepMeUpFooter";

interface Props {
  params: Promise<{ trackSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);
  if (!track) return { title: "Track Not Found | PrepMeUp AI" };
  return {
    title: `${track.title} Track | PrepMeUp AI`,
    description: track.description,
  };
}

export default async function TrackDetailPage({ params }: Props) {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);

  if (trackSlug === "cybersecurity" || trackSlug === "cloud-computing-aws") {
    const title =
      trackSlug === "cloud-computing-aws" ? "Cloud Computing (AWS)" : "CyberSecurity";
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <PrepMeUpNav />
        <main className="pmu-container" style={{ paddingTop: "40px", paddingBottom: "80px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          <PageHeader title={title} subtitle="Under construction — coming soon." />
          <EmptyState
            title="Coming Soon"
            description={`${title} is currently under construction. Check back soon or explore your active Semester 1 courses.`}
            action={{ label: "Back to Tracks", href: "/prepmeup/tracks" }}
          />
        </main>
        <PrepMeUpFooter />
      </div>
    );
  }

  if (!track) {
    notFound();
  }

  const courses = getCoursesByTrack(track.slug);
  const instructor = getInstructorBySlug("dr-aravind-vaidya");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PrepMeUpNav />

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F6",
          color: "#1C1A17",
          padding: "40px 20px 80px",
          fontFamily: "var(--font-onest), sans-serif",
          flex: 1,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Navigation Breadcrumb */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6F6B62", marginBottom: "8px" }}>
              <Link href="/prepmeup" style={{ color: "#6F6B62", textDecoration: "none" }}>PrepMeUp</Link>
              <span>/</span>
              <Link href="/prepmeup/tracks" style={{ color: "#6F6B62", textDecoration: "none" }}>Tracks</Link>
              <span>/</span>
              <span style={{ color: "#C2331B", fontWeight: 600 }}>{track.title}</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="pmu-badge">
                    {track.badge || "Academic track"}
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#1C1A17", marginTop: "8px", letterSpacing: "-0.02em" }}>
                  {track.title} track
                </h1>
                <p style={{ fontSize: "15px", color: "#6F6B62", maxWidth: "700px", marginTop: "6px", lineHeight: 1.6 }}>
                  {track.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href="/prepmeup/simulations/quantum"
                  className="pmu-btn-secondary"
                  style={{ padding: "10px 18px", fontSize: "13px" }}
                >
                  Quantum simulators
                </Link>
                <Link
                  href="/prepmeup/courses/quantum-computing-foundations/learn"
                  className="pmu-btn-primary"
                  style={{ padding: "10px 20px", fontSize: "13px" }}
                >
                  Start preview
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Course Card */}
          {courses.length > 0 && (
            <div style={{ marginTop: "28px" }}>
              <h2 style={{ fontSize: "12px", color: "#6F6B62", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "12px" }}>
                Track curriculum &amp; primary course
              </h2>

              {courses.map((course) => (
                <div
                  key={course.slug}
                  className="pmu-card"
                  style={{ padding: "28px", border: "1px solid #E8E4DB", backgroundColor: "#FFFFFF" }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                    <div style={{ maxWidth: "720px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                        <span className="pmu-badge">Course 01</span>
                        <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                          Format: Recorded + 1:1 mentorship
                        </span>
                        <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                          Level: {course.level}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#1C1A17", marginTop: "10px" }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#C2331B", fontWeight: 500, marginTop: "2px" }}>
                        {course.subtitle}
                      </p>
                      <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#6F6B62", marginTop: "8px" }}>
                        {course.description}
                      </p>

                      {/* Highlights Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
                        <div style={{ padding: "12px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB" }}>
                          <div style={{ fontSize: "11px", color: "#6F6B62" }}>Modules &amp; lessons</div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1C1A17", marginTop: "2px" }}>
                            5 modules • 20 lessons
                          </div>
                        </div>

                        <div style={{ padding: "12px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB" }}>
                          <div style={{ fontSize: "11px", color: "#6F6B62" }}>Interactive simulators</div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1C1A17", marginTop: "2px" }}>
                            5 visual models
                          </div>
                        </div>

                        <div style={{ padding: "12px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB" }}>
                          <div style={{ fontSize: "11px", color: "#6F6B62" }}>Mentorship &amp; review</div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1C1A17", marginTop: "2px" }}>
                            1:1 live sessions
                          </div>
                        </div>
                      </div>

                      {/* Tools & Frameworks */}
                      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "#6F6B62" }}>Tools covered:</span>
                        {course.tools.map((t) => (
                          <span key={t} className="pmu-badge" style={{ backgroundColor: "#F4F2ED", color: "#1C1A17", fontSize: "11px" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                      <div style={{ padding: "16px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB", textAlign: "center" }}>
                        <span style={{ fontSize: "11px", color: "#6F6B62", textTransform: "uppercase" }}>
                          Course pass
                        </span>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#1C1A17", marginTop: "2px" }}>
                          ₹{course.priceInr}
                        </div>
                        <span style={{ fontSize: "11px", color: "#6F6B62" }}>
                          Included in All-Access
                        </span>
                      </div>

                      <Link
                        href={`/prepmeup/courses/${course.slug}/learn`}
                        className="pmu-btn-primary"
                        style={{ padding: "10px", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
                      >
                        Start preview
                      </Link>
                      <Link
                        href={`/prepmeup/courses/${course.slug}`}
                        className="pmu-btn-secondary"
                        style={{ padding: "10px", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
                      >
                        View syllabus
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructor Preview Section */}
          {instructor && (
            <div style={{ marginTop: "32px" }}>
              <h2 style={{ fontSize: "12px", color: "#6F6B62", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "12px" }}>
                Lead academic instructor
              </h2>
              <div className="pmu-card" style={{ padding: "24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "1.5px solid #E8E4DB", flexShrink: 0 }}>
                    <img src={instructor.avatarUrl} alt={instructor.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17" }}>
                      {instructor.fullName}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#C2331B", marginTop: "1px" }}>
                      {instructor.title}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6F6B62", marginTop: "4px", maxWidth: "560px" }}>
                      {instructor.bio}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/prepmeup/instructors/${instructor.slug}`}
                  className="pmu-btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  Instructor bio →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <PrepMeUpFooter />
    </div>
  );
}
