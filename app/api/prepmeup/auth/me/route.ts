import { NextResponse, type NextRequest } from "next/server";
import { getPmuAuthUser } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const pmuCookie = req.cookies.get("pmu-session")?.value;
    let fallbackProfile = null;
    if (pmuCookie) {
      try {
        fallbackProfile = JSON.parse(pmuCookie);
      } catch {}
    }

    const authUser = await getPmuAuthUser();

    if (!authUser && !fallbackProfile) {
      return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: authUser || {
        userId: fallbackProfile.userId,
        phone: fallbackProfile.phone,
        role: fallbackProfile.role || "student",
        profile: {
          fullName: fallbackProfile.fullName || "",
          college: fallbackProfile.college || "",
          branch: fallbackProfile.branch || "B.Tech CSE AI/ML",
          currentSemester: fallbackProfile.currentSemester || 1,
          isComplete: Boolean(fallbackProfile.isProfileComplete || fallbackProfile.fullName),
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to resolve session." }, { status: 500 });
  }
}
