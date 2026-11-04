import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  getInstructorCourses,
  getInstructorBySlug,
  getCourseModulesAndLessons,
  getInstructorMentorshipRequests,
} from "../_lib/trackStore";
import { getAllAppUsers } from "../_lib/studentStore";
import { InstructorDashboardClient } from "./InstructorDashboardClient";

export const metadata = {
  title: "Instructor Portal | PrepMeUp AI",
  description: "Faculty portal for course creation, module curation, and student mentorship.",
};

export default async function InstructorPortalPage() {
  const cookieStore = await cookies();
  const instructorSession = cookieStore.get("pmu_instructor_session");
  const adminSession = cookieStore.get("pmu_admin_session");
  const studentSession = cookieStore.get("pmu_student_session");

  // Determine role:
  // If user only has student session and neither instructor nor admin session, deny access!
  const isInstructor = Boolean(instructorSession?.value);
  const isAdmin = Boolean(adminSession?.value);

  if (!isInstructor && !isAdmin) {
    return (
      <div className="pmu-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="pmu-card" style={{ maxWidth: "480px", padding: "36px", textAlign: "center", border: "1px solid rgba(255, 59, 29, 0.4)" }}>
          <div style={{ fontSize: "42px", marginBottom: "14px" }}>🛑</div>
          <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
            Faculty Clearance Required
          </span>
          <h1 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
            Instructor Access Only
          </h1>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "8px", lineHeight: "1.6" }}>
            Students are restricted from accessing faculty curriculum controls. Please log in with an authorized instructor profile or return to your student dashboard.
          </p>

          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/prepmeup/instructor/login" className="pmu-btn-primary" style={{ padding: "12px", textAlign: "center", textDecoration: "none" }}>
              Faculty Sign In →
            </Link>
            <Link href="/prepmeup/dashboard" className="pmu-btn-secondary" style={{ padding: "12px", textAlign: "center", textDecoration: "none" }}>
              ← Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load instructor profile & assigned courses
  const instructor = getInstructorBySlug("dr-aravind-vaidya");
  const courses = getInstructorCourses(instructor?.slug || "dr-aravind-vaidya");
  const { modules } = getCourseModulesAndLessons("quantum-computing-foundations");
  const mentorshipRequests = getInstructorMentorshipRequests(instructor?.slug || "dr-aravind-vaidya");
  const allUsers = getAllAppUsers();

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "36px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <InstructorDashboardClient
          instructor={instructor}
          courses={courses}
          modules={modules}
          mentorshipRequests={mentorshipRequests}
          students={allUsers}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
