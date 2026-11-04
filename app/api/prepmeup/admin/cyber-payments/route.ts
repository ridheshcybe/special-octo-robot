import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getAllCyberOrders,
  getAllCyberPayments,
  getAllCyberEnrollments,
  getCyberEarlyAdopterCount,
  createOrExtendCyberEnrollment,
  revokeCyberEnrollment,
  createCyberMentorshipPack,
  getCyberMentorshipPacks,
  loadState,
} from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const orders = getAllCyberOrders();
    const payments = getAllCyberPayments();
    const enrollments = getAllCyberEnrollments();
    const earlyAdopterCount = getCyberEarlyAdopterCount();

    // Compute revenue summary
    const capturedPayments = payments.filter((p) => p.status === "captured");
    const totalRevenuePaise = capturedPayments.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
    const refundedPayments = payments.filter((p) => p.status === "refunded");

    const state = loadState();
    const mentorshipPacks = state.cyberMentorshipPacks || [];

    return NextResponse.json({
      ok: true,
      revenueSummary: {
        totalRevenueRupees: Math.round(totalRevenuePaise / 100),
        totalOrders: orders.length,
        paidOrders: orders.filter((o) => o.status === "paid").length,
        capturedPayments: capturedPayments.length,
        refundedCount: refundedPayments.length,
        earlyAdopterClaims: earlyAdopterCount,
        activeEnrollments: enrollments.filter((e) => e.status === "active").length,
        expiredEnrollments: enrollments.filter(
          (e) => e.status === "expired" || e.status === "revoked"
        ).length,
      },
      orders,
      payments,
      enrollments,
      mentorshipPacks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load CyberSecurity payment admin data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, userId, enrollmentId, totalSessions, months, validityDays } = body;

    if (action === "grant_access") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "User ID is required." }, { status: 400 });
      }
      const enrollment = createOrExtendCyberEnrollment({
        userId,
        accessType: "admin_granted",
        months: Number(months) || 6,
      });
      return NextResponse.json({
        ok: true,
        enrollment,
        message: "CyberSecurity access granted successfully.",
      });
    }

    if (action === "revoke_access") {
      if (!enrollmentId) {
        return NextResponse.json({ ok: false, error: "Enrollment ID is required." }, { status: 400 });
      }
      const success = revokeCyberEnrollment(enrollmentId);
      return NextResponse.json({
        ok: success,
        message: success
          ? "CyberSecurity enrollment revoked successfully."
          : "Failed to revoke enrollment.",
      });
    }

    if (action === "grant_mentorship") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "User ID is required." }, { status: 400 });
      }
      const pack = createCyberMentorshipPack({
        userId,
        totalSessions: Number(totalSessions) || 1,
        durationDays: Number(validityDays) || 90,
      });
      return NextResponse.json({
        ok: true,
        pack,
        message: "CyberSecurity mentorship pack granted successfully.",
      });
    }

    return NextResponse.json({ ok: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process admin action." },
      { status: 500 }
    );
  }
}
