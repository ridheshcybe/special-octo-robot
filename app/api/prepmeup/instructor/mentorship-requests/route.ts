import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getInstructorMentorshipRequests } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const instructorSession = cookieStore.get("pmu_instructor_session");
    const adminSession = cookieStore.get("pmu_admin_session");

    if (!instructorSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Instructor access required." }, { status: 401 });
    }

    let instructorSlug = "dr-aravind-vaidya";
    if (instructorSession?.value) {
      try {
        const parsed = JSON.parse(instructorSession.value);
        instructorSlug = parsed.slug || "dr-aravind-vaidya";
      } catch {}
    }

    const requests = getInstructorMentorshipRequests(instructorSlug);

    return NextResponse.json({
      ok: true,
      requests,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
