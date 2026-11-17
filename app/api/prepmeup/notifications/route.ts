import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getActiveNotificationsForUser } from "@/lib/prepmeup/notifications";
import { hasActiveAllAccess } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("pmu-session")?.value;

    let userTarget = "";
    let isPaidUser = false;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        userTarget = parsed.email || parsed.phone || parsed.id || "";
        const tier = String(parsed.tier || "").toLowerCase();
        isPaidUser =
          tier.includes("tier2") ||
          tier.includes("tier3") ||
          tier.includes("paid") ||
          tier.includes("pro") ||
          tier.includes("vip") ||
          (userTarget ? hasActiveAllAccess(userTarget) : false);
      } catch {}
    }

    const notifications = getActiveNotificationsForUser({
      userTarget,
      isPaidUser,
    });

    return NextResponse.json({
      ok: true,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load notifications." },
      { status: 500 }
    );
  }
}
