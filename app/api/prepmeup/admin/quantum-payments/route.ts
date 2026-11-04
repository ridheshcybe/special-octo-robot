import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getAllQuantumOrders,
  getAllQuantumPayments,
  getAllQuantumEnrollments,
  getEarlyAdopterCount,
  createOrExtendQuantumEnrollment,
  revokeQuantumEnrollment,
  createMentorshipPack,
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

    const orders = getAllQuantumOrders();
    const payments = getAllQuantumPayments();
    const enrollments = getAllQuantumEnrollments();
    const earlyAdopterCount = getEarlyAdopterCount();

    // Compute revenue summary
    const capturedPayments = payments.filter((p) => p.status === "captured");
    const totalRevenuePaise = capturedPayments.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
    const refundedPayments = payments.filter((p) => p.status === "refunded");

    const state = loadState();
    const mentorshipPacks = state.mentorshipPacks || [];

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
        expiredEnrollments: enrollments.filter((e) => e.status === "expired" || e.status === "revoked").length,
      },
      orders,
      payments,
      enrollments,
      mentorshipPacks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load payment admin data." },
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
    const { action, userId, enrollmentId, totalSessions, months } = body;

    if (action === "grant_access") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "User ID is required." }, { status: 400 });
      }
      const enrollment = createOrExtendQuantumEnrollment({
        userId,
        accessType: "admin_granted",
        months: Number(months) || 6,
      });
      return NextResponse.json({ ok: true, enrollment, message: "Quantum access granted successfully." });
    }

    if (action === "revoke_access") {
      if (!enrollmentId) {
        return NextResponse.json({ ok: false, error: "Enrollment ID is required." }, { status: 400 });
      }
      const success = revokeQuantumEnrollment(enrollmentId);
      return NextResponse.json({ ok: success, message: "Quantum enrollment revoked successfully." });
    }

    if (action === "add_mentorship") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "User ID is required." }, { status: 400 });
      }
      const pack = createMentorshipPack({
        userId,
        totalSessions: Number(totalSessions) || 1,
        validityDays: 180,
      });
      return NextResponse.json({ ok: true, pack, message: "Mentorship session entitlement added." });
    }

    return NextResponse.json({ ok: false, error: "Invalid admin payment action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process admin action." },
      { status: 500 }
    );
  }
}
