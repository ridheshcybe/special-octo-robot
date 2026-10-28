import { NextResponse, type NextRequest } from "next/server";
import { getPmuAuthUser } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get("pmu-admin-session")?.value;
    if (adminCookie) {
      try {
        const parsed = JSON.parse(adminCookie);
        if (parsed.role === "admin") {
          return NextResponse.json({
            ok: true,
            admin: {
              id: parsed.userId,
              email: parsed.email,
              role: "admin",
              fullName: parsed.fullName || "PrepMeUp Admin",
            },
          });
        }
      } catch {}
    }

    const authUser = await getPmuAuthUser();
    if (authUser && authUser.role === "admin") {
      return NextResponse.json({
        ok: true,
        admin: {
          id: authUser.userId,
          email: authUser.email,
          role: "admin",
          fullName: authUser.profile?.fullName || "PrepMeUp Admin",
        },
      });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to resolve admin session." }, { status: 500 });
  }
}
