import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateCourseByInstructor,
  createCourseByInstructor,
  saveLessonByInstructor,
  getInstructorCourses,
  getInstructorMentorshipRequests,
} from "@/app/prepmeup/_lib/trackStore";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const instructorSession = cookieStore.get("pmu_instructor_session");
    const adminSession = cookieStore.get("pmu_admin_session");

    if (!instructorSession?.value && !adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Instructor or Admin session required." },
        { status: 401 }
      );
    }

    let instructorSlug = "dr-aravind-vaidya";
    if (instructorSession?.value) {
      try {
        const parsed = JSON.parse(instructorSession.value);
        instructorSlug = parsed.slug || "dr-aravind-vaidya";
      } catch {}
    } else if (adminSession?.value) {
      instructorSlug = "admin";
    }

    const body = await req.json();
    const { action, courseSlug, courseData, lessonData, sessionId, sessionStatus } = body;

    // 1. Update Course
    if (action === "update_course") {
      const res = updateCourseByInstructor(instructorSlug, courseSlug, courseData);
      if (!res.success) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 403 });
      }
      return NextResponse.json({ ok: true, course: res.course });
    }

    // 2. Create Course (Created in Draft status)
    if (action === "create_course") {
      const res = createCourseByInstructor(instructorSlug, courseData);
      if (!res.success) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, course: res.course });
    }

    // 3. Save / Update Lesson
    if (action === "save_lesson") {
      const res = saveLessonByInstructor(instructorSlug, courseSlug, lessonData);
      if (!res.success) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 403 });
      }
      return NextResponse.json({ ok: true, lesson: res.lesson });
    }

    // 4. Update Mentorship Request Status
    if (action === "update_mentorship_status") {
      const requests = getInstructorMentorshipRequests(instructorSlug);
      const targetSession = requests.find((s) => s.id === sessionId);
      if (targetSession && sessionStatus) {
        targetSession.status = sessionStatus;
        return NextResponse.json({ ok: true, session: targetSession });
      }
      return NextResponse.json({ ok: false, error: "Mentorship session not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
