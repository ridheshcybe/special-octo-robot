import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { requestMentorshipSession, consumeMentorshipSession } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { canBookQuantumMentorship } from "@/lib/prepmeup/access";

const RequestSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  sessionType: z.enum(["quantum_doubt_clearing", "quantum_interview_prep", "career_guidance"]),
  studentNotes: z.string().min(5, "Please provide brief notes on what you want help with (min 5 characters)"),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required. Please sign in to request 1:1 mentorship." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;

    // Entitlement Guard: verify student has Semester Pass or active Mentorship Pack
    const canBook = canBookQuantumMentorship(studentId);
    if (!canBook) {
      return NextResponse.json(
        {
          ok: false,
          error: "No active 1-on-1 mentorship entitlement found. Please purchase a Quantum Mentorship Pack or enroll in Quantum Semester Pass.",
          requiresEntitlement: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parse = RequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { ok: false, error: parse.error.issues[0]?.message || "Invalid mentorship request." },
        { status: 400 }
      );
    }

    const { slotId, sessionType, studentNotes } = parse.data;

    const result = requestMentorshipSession({
      studentName: identity.fullName || "Quantum Student",
      studentEmail: identity.email || identity.phone || identity.canonicalId,
      slotId,
      sessionType,
      studentNotes,
    });

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    // Consume 1 session from pack
    consumeMentorshipSession(studentId);

    return NextResponse.json({
      ok: true,
      message: "Mentorship session requested successfully. Awaiting faculty confirmation.",
      session: result.session,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
