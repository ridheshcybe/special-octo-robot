import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateMentorshipSession, getStudentMentorshipSessions } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, studentNotes } = body;

    // Verify session belongs to this student
    const identifier = identity.email || identity.phone || identity.canonicalId;
    const mySessions = getStudentMentorshipSessions(identifier);
    const session = mySessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Session not found." }, { status: 404 });
    }

    if (action === "cancel") {
      const updated = updateMentorshipSession(sessionId, { status: "cancelled" });
      return NextResponse.json({ ok: true, session: updated.session });
    }

    if (studentNotes) {
      const updated = updateMentorshipSession(sessionId, { studentNotes });
      return NextResponse.json({ ok: true, session: updated.session });
    }

    return NextResponse.json({ ok: false, error: "Invalid update action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
