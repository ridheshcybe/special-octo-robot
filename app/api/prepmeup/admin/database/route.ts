import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/app/prepmeup/_lib/adminAuth";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import {
  getAllAppUsers,
  getGlobalActivityFeed,
  adminUpdateAppUser,
  adminDeleteAppUser,
} from "@/app/prepmeup/_lib/studentStore";
import {
  getAllUnifiedOrders,
  getAllUnifiedPayments,
  getAllAccessEntitlements,
  getAllTracks,
  getAllCourses,
} from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const tables: Record<string, any[]> = {
      local_users: getAllAppUsers(),
      unified_orders: getAllUnifiedOrders(),
      unified_payments: getAllUnifiedPayments(),
      access_entitlements: getAllAccessEntitlements(),
      tracks: getAllTracks(),
      courses: getAllCourses(),
      activity_log: getGlobalActivityFeed(),
    };

    const supabase = createPmuServiceClient();
    if (supabase) {
      for (const tableName of ["pmu_profiles", "pmu_subjects", "pmu_notes"]) {
        try {
          const { data } = await supabase.from(tableName).select("*").limit(500);
          if (data) tables[tableName] = data;
        } catch {}
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      tables,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load database snapshot." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required." }, { status: 400 });
    }

    const supabase = createPmuServiceClient();

    if (action === "update_user") {
      const updated = adminUpdateAppUser(userId, updates || {});

      if (supabase) {
        try {
          const isEmail = updates?.type === "email" || String(updates?.target || "").includes("@");
          await supabase
            .from("pmu_profiles")
            .update({
              ...(updates?.name !== undefined ? { full_name: updates.name } : {}),
              ...(updates?.target !== undefined
                ? isEmail
                  ? { email: updates.target }
                  : { phone: updates.target }
                : {}),
              ...(updates?.college !== undefined ? { college: updates.college } : {}),
              ...(updates?.branch !== undefined ? { branch: updates.branch } : {}),
              ...(updates?.role !== undefined ? { role: updates.role } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        } catch {}
      }

      return NextResponse.json({ ok: true, user: updated });
    }

    if (action === "toggle_ban") {
      const isBanned = Boolean(body.isBanned);
      const updated = adminUpdateAppUser(userId, { isBanned });

      if (supabase) {
        try {
          await supabase.auth.admin.updateUserById(userId, {
            ban_duration: isBanned ? "87600h" : "none",
          });
        } catch {}
      }

      return NextResponse.json({ ok: true, user: updated });
    }

    if (action === "delete_user") {
      adminDeleteAppUser(userId);
      if (supabase) {
        try {
          await supabase.from("pmu_profiles").delete().eq("id", userId);
          await supabase.auth.admin.deleteUser(userId);
        } catch {}
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to execute database action." },
      { status: 500 }
    );
  }
}
