import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStudentMentorshipSessions } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const identifier = identity.email || identity.phone || identity.canonicalId;
    const sessions = getStudentMentorshipSessions(identifier);

    return NextResponse.json({
      ok: true,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
