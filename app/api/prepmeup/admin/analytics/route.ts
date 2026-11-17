import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/app/prepmeup/_lib/adminAuth";
import {
  getAllAppUsers,
  getAppOverallMetrics,
  getGlobalActivityFeed,
  recordUserPresence,
  recordGlobalActivity,
} from "@/app/prepmeup/_lib/studentStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();

    if (!adminSession) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const metrics = getAppOverallMetrics();
    let users = getAllAppUsers();
    const activities = getGlobalActivityFeed();

    // The file-backed presence store (registered_users.json) is reset whenever a
    // new build is deployed, which made signed-up students vanish from the
    // directory. Supabase `pmu_profiles` is the durable source of truth, so merge
    // every profile in and keep presence data from the file store where present.
    try {
      const supabase = createPmuServiceClient();
      if (supabase) {
        const { data: profiles } = await supabase
          .from("pmu_profiles")
          .select("*")
          .limit(5000);
        if (profiles && profiles.length > 0) {
          const byKey = new Map(users.map((u) => [String(u.target || u.id).toLowerCase(), u]));
          const byId = new Map(users.map((u) => [u.id, u]));
          for (const p of profiles as any[]) {
            const phone = p.phone ? String(p.phone) : "";
            const email = p.email ? String(p.email) : "";
            const target = email || phone || p.id;
            const existing =
              byId.get(p.id) ||
              (email && byKey.get(email.toLowerCase())) ||
              (phone && (byKey.get(phone) || byKey.get(phone.replace(/^\+/, ""))));
            if (existing) continue;
            const createdAt = p.created_at || p.updated_at || new Date(0).toISOString();
            users.push({
              id: p.id,
              name: p.full_name || "Student",
              target,
              type: email ? "email" : "phone",
              college: p.college || "",
              branch: p.branch || "",
              role: p.role === "admin" ? "admin" : "student",
              tier: "Free Student",
              registeredAt: createdAt,
              lastSeenAt: p.updated_at || createdAt,
              lastActivity: "Registered",
              currentPath: "",
              isOnline: false,
              stats: { quizzesCompleted: 0, doubtsAsked: 0, codingSubmissions: 0, studyMinutes: 0 },
            } as any);
          }
          metrics.totalRegisteredUsers = Math.max(metrics.totalRegisteredUsers, users.length, profiles.length);
          metrics.emailRegistrationsCount = users.filter((u) => u.type === "email").length;
          metrics.phoneRegistrationsCount = users.filter((u) => u.type === "phone").length;
        }
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      metrics,
      users,
      activities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load admin analytics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, payload } = body;

    if (action === "heartbeat" && payload?.userId) {
      const updatedUser = recordUserPresence({
        userId: payload.userId,
        name: payload.name,
        target: payload.target,
        type: payload.type,
        college: payload.college,
        branch: payload.branch,
        page: payload.page,
        activity: payload.activity,
        tier: payload.tier,
      });

      return NextResponse.json({ ok: true, user: updatedUser });
    }

    if (action === "log_activity" && payload) {
      recordGlobalActivity({
        userId: payload.userId || "usr_guest",
        userName: payload.userName || "Student",
        userTarget: payload.userTarget || "Guest",
        actionType: payload.actionType || "study",
        title: payload.title || "Student Activity",
        details: payload.details || "",
        subjectCode: payload.subjectCode,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to record analytics action" },
      { status: 500 }
    );
  }
}
