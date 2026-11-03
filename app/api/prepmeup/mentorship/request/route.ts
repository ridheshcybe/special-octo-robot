import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { requestMentorshipSession } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";

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

    return NextResponse.json({
      ok: true,
      message: "Mentorship session requested successfully. Awaiting faculty confirmation.",
      session: result.session,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
