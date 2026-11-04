import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { getCyberMentorshipPacks } from "@/app/prepmeup/_lib/trackStore";
import { canBookCyberMentorship } from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to check mentorship entitlements." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const packs = getCyberMentorshipPacks(studentId);
    const availableSessions = packs.reduce(
      (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
      0
    );
    const canBook = canBookCyberMentorship(studentId);

    return NextResponse.json({
      ok: true,
      packs,
      availableSessions,
      canBook,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load mentorship status." },
      { status: 500 }
    );
  }
}
