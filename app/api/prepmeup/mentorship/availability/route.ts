import { NextRequest, NextResponse } from "next/server";
import { getAvailableMentorshipSlots } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("courseSlug") || "quantum-computing-foundations";
    const slots = getAvailableMentorshipSlots(courseSlug);

    return NextResponse.json({
      ok: true,
      courseSlug,
      slots,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
