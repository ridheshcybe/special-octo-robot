import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { updateMentorshipSession, getInstructorMentorshipRequests } from "@/app/prepmeup/_lib/trackStore";

const SessionUpdateSchema = z.object({
  status: z.enum(["confirmed", "rescheduled", "completed", "cancelled"]).optional(),
  meetingUrl: z.string().url().optional(),
  instructorNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Verify session belongs to this instructor's courses
    const requests = getInstructorMentorshipRequests(instructorSlug);
    const session = requests.find((s) => s.id === sessionId);

    if (!session && !adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Instructors can manage only their own sessions." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parse = SessionUpdateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ ok: false, error: parse.error.issues[0]?.message }, { status: 400 });
    }

    const result = updateMentorshipSession(sessionId, parse.data);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: "Failed to update session." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "Mentorship session updated successfully.",
      session: result.session,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
