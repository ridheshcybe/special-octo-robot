import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");

    // Optional admin security check or public telemetry check
    const metrics = getAppOverallMetrics();
    let users = getAllAppUsers();
    const activities = getGlobalActivityFeed();

    // 0. Synchronize directly with Upstash cloud storage before compiling metrics
    try {
      const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
      const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      if (upstashUrl && upstashToken) {
        const cloudRes = await fetch(`${upstashUrl}/get/pmu_app_users_v2`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
          cache: "no-store",
        });
        const cloudJson = await cloudRes.json();
        if (cloudJson?.result) {
          const parsedCloudUsers = JSON.parse(cloudJson.result);
          if (Array.isArray(parsedCloudUsers)) {
            const userMap = new Map<string, any>();
            for (const u of users) {
              if (u && u.id) userMap.set(u.id, u);
            }
            for (const cu of parsedCloudUsers) {
              if (cu && cu.id) userMap.set(cu.id, cu);
            }
            users = Array.from(userMap.values());
            metrics.totalRegisteredUsers = Math.max(metrics.totalRegisteredUsers, users.length);
          }
        }
      }
    } catch {}

    // If Supabase is connected, check real profile count
    try {
      const supabase = createPmuServiceClient();
      if (supabase) {
        const { count: profileCount } = await supabase
          .from("pmu_profiles")
          .select("id", { count: "exact", head: true });
        if (profileCount && profileCount > 0) {
          metrics.totalRegisteredUsers = Math.max(metrics.totalRegisteredUsers, profileCount);
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
