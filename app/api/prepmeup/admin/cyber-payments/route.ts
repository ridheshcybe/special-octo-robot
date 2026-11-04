import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  CYBER_COURSE_ID,
  CYBER_COURSE_SLUG,
  createCyberMentorshipPack,
  getAllCyberEarlyAdopterRedemptions,
  getAllCyberEnrollments,
  getAllCyberMentorshipPacks,
  getAllCyberOrders,
  getAllCyberPayments,
  getCyberRevenueSummary,
  grantCyberEnrollment,
  revokeCyberEnrollment,
} from "@/app/prepmeup/_lib/cyberStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

function isAdmin(cookieStore: { get(name: string): { value: string } | undefined }): boolean {
  const adminSession = cookieStore.get("pmu-admin-session");
  if (!adminSession?.value) return false;
  try {
    const parsed = JSON.parse(adminSession.value);
    return parsed?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: admin privileges required." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      revenueSummary: getCyberRevenueSummary(),
      orders: getAllCyberOrders(),
      payments: getAllCyberPayments(),
      enrollments: getAllCyberEnrollments(),
      mentorshipPacks: getAllCyberMentorshipPacks(),
      earlyAdopterRedemptions: getAllCyberEarlyAdopterRedemptions(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load CyberSecurity payment records." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "grant_access") {
      const userId = String(body.userId || "").trim();
      if (!userId) {
        return NextResponse.json({ ok: false, error: "userId is required." }, { status: 400 });
      }

      const months = Math.min(24, Math.max(1, Number(body.months) || 6));
      const enrollment = grantCyberEnrollment({
        userId,
        courseId: CYBER_COURSE_SLUG,
        accessType: "admin_granted",
        months,
        source: "admin_grant",
      });

      let pack;
      if (Number(body.mentorshipSessions) > 0) {
        pack = createCyberMentorshipPack({
          userId,
          courseId: CYBER_COURSE_SLUG,
          totalSessions: Math.min(10, Math.floor(Number(body.mentorshipSessions))),
          validityDays: 180,
          packType: "single_session",
        });
      }

      const serviceClient = createPmuServiceClient();
      if (serviceClient && UUID_RE.test(userId)) {
        try {
          await serviceClient.from("pmu_course_enrollments").insert({
            user_id: userId,
            course_id: CYBER_COURSE_ID,
            access_type: "admin_granted",
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + months * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        } catch {
          // Best-effort mirror.
        }
      }

      return NextResponse.json({
        ok: true,
        enrollment,
        pack,
        message: "CyberSecurity access granted.",
      });
    }

    if (action === "revoke_access") {
      const enrollmentId = String(body.enrollmentId || "").trim();
      const userId = String(body.userId || "").trim();

      if (!enrollmentId && !userId) {
        return NextResponse.json(
          { ok: false, error: "enrollmentId or userId is required." },
          { status: 400 }
        );
      }

      const success = revokeCyberEnrollment(enrollmentId || userId);
      if (!success) {
        return NextResponse.json(
          { ok: false, error: "No active CyberSecurity enrollment found." },
          { status: 404 }
        );
      }

      const serviceClient = createPmuServiceClient();
      if (serviceClient && enrollmentId && UUID_RE.test(enrollmentId)) {
        try {
          await serviceClient
            .from("pmu_course_enrollments")
            .update({ status: "revoked", updated_at: new Date().toISOString() })
            .eq("id", enrollmentId)
            .eq("course_id", CYBER_COURSE_ID);
        } catch {
          // Best-effort mirror.
        }
      }

      return NextResponse.json({ ok: true, message: "CyberSecurity access revoked." });
    }

    return NextResponse.json({ ok: false, error: "Invalid admin action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process admin action." },
      { status: 500 }
    );
  }
}
