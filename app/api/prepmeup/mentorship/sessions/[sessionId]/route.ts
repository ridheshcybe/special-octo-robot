import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateMentorshipSession,
  getStudentMentorshipSessions,
  rescheduleMentorshipSession,
} from "@/app/prepmeup/_lib/trackStore";
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
    const { action, studentNotes, newSlotId } = body;

    // Verify session belongs to this student
    const identifier = identity.email || identity.phone || identity.canonicalId;
    const mySessions = getStudentMentorshipSessions(identifier);
    const session = mySessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Session not found." }, { status: 404 });
    }

    // 1. Reschedule action: moves slot without refunding or re-consuming credits
    if (action === "reschedule") {
      if (!newSlotId) {
        return NextResponse.json(
          { ok: false, error: "newSlotId is required for rescheduling." },
          { status: 400 }
        );
      }

      const res = rescheduleMentorshipSession(sessionId, newSlotId, identifier);
      if (!res.success) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        message: "Mentorship session rescheduled successfully without modifying pack credits.",
        session: res.session,
      });
    }

    // 2. Cancellation action: refunds credit once if not already completed/refunded
    if (action === "cancel") {
      if (session.status === "cancelled") {
        return NextResponse.json({
          ok: true,
          message: "Session is already cancelled.",
          session,
          refunded: false,
        });
      }

      const updated = updateMentorshipSession(sessionId, { status: "cancelled" });
      return NextResponse.json({
        ok: true,
        session: updated.session,
        refunded: !session.isRefunded && session.status !== "completed",
      });
    }

    // 3. Update notes
    if (studentNotes) {
      const updated = updateMentorshipSession(sessionId, { studentNotes });
      return NextResponse.json({ ok: true, session: updated.session });
    }

    return NextResponse.json({ ok: false, error: "Invalid update action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
