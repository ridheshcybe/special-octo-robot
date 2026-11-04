import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAvailableMentorshipSlots } from "@/app/prepmeup/_lib/trackStore";

const AvailabilitySchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  durationMinutes: z.number().default(45),
  supportedTypes: z.array(z.string()).default(["quantum_doubt_clearing", "quantum_interview_prep", "career_guidance"]),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const instructorSession = cookieStore.get("pmu_instructor_session");
    const adminSession = cookieStore.get("pmu_admin_session");

    if (!instructorSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Instructor access required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = AvailabilitySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ ok: false, error: parse.error.issues[0]?.message }, { status: 400 });
    }

    const slots = getAvailableMentorshipSlots();
    // Simulate slot creation in CMS state
    const newSlot = {
      id: `slot-dyn-${Date.now()}`,
      instructorId: "e0000000-0000-0000-0000-000000000001",
      instructorName: "Dr. Aravind Vaidya, PhD",
      courseSlug: "quantum-computing-foundations",
      startAt: parse.data.startAt,
      endAt: parse.data.endAt,
      durationMinutes: parse.data.durationMinutes,
      timezone: "Asia/Kolkata",
      status: "available" as const,
      supportedTypes: parse.data.supportedTypes,
    };

    return NextResponse.json({
      ok: true,
      message: "New faculty mentorship availability slot published.",
      slot: newSlot,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
