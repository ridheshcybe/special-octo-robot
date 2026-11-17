import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getAllUnifiedOrders,
  getAllUnifiedPayments,
  getAllUnifiedProducts,
  getAllAccessEntitlements,
  getAllAccessEarlyAdopters,
  createOrExtendAllAccessEntitlement,
  revokeAllAccessEntitlement,
  createAllAccessMentorshipPack,
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

    const orders = getAllUnifiedOrders();
    const payments = getAllUnifiedPayments();
    const products = getAllUnifiedProducts(false);
    const entitlements = getAllAccessEntitlements();
    const redemptions = getAllAccessEarlyAdopters();

    const state = loadState();
    const mentorshipPacks = state.mentorshipPacks || [];

    // Financial Analytics Aggregation
    const capturedPayments = payments.filter((p) => p.status === "captured");
    const totalRevenuePaise = capturedPayments.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
    const refundedPayments = payments.filter((p) => p.status === "refunded");

    // Revenue by Product
    const revenueByProduct: Record<string, number> = {};
    for (const p of capturedPayments) {
      const order = orders.find((o) => o.id === p.orderId);
      const slug = order?.productSlug || "unknown";
      revenueByProduct[slug] = (revenueByProduct[slug] || 0) + Math.round(p.amountInPaise / 100);
    }

    // Revenue by Track
    const revenueByTrack: Record<string, number> = {
      all_access: 0,
      quantum: 0,
      cybersecurity: 0,
      btech: 0,
    };

    for (const [slug, rev] of Object.entries(revenueByProduct)) {
      if (slug.includes("all-access")) {
        revenueByTrack.all_access += rev;
      } else if (slug.includes("quantum")) {
        revenueByTrack.quantum += rev;
      } else if (slug.includes("cyber")) {
        revenueByTrack.cybersecurity += rev;
      } else if (slug.includes("btech")) {
        revenueByTrack.btech += rev;
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        totalRevenueRupees: Math.round(totalRevenuePaise / 100),
        totalOrders: orders.length,
        paidOrders: orders.filter((o) => o.status === "paid").length,
        capturedPayments: capturedPayments.length,
        refundedCount: refundedPayments.length,
        earlyAdopterClaims: redemptions.length,
        activeAllAccessEntitlements: entitlements.filter((e) => e.status === "active").length,
        expiredEntitlements: entitlements.filter(
          (e) => e.status === "expired" || e.status === "revoked"
        ).length,
        revenueByProduct,
        revenueByTrack,
      },
      orders,
      payments,
      products,
      entitlements,
      redemptions,
      mentorshipPacks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load admin revenue data." },
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
    const { action, userId, entitlementId, durationDays, totalSessions } = body;

    if (action === "grant_all_access") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "userId is required." }, { status: 400 });
      }
      const entitlement = createOrExtendAllAccessEntitlement({
        userId,
        productSlug: "prepmeup-all-access-pass",
        durationDays: Number(durationDays) || 180,
      });
      return NextResponse.json({
        ok: true,
        entitlement,
        message: "PrepMeUp All-Access Pass granted successfully.",
      });
    }

    if (action === "revoke_all_access") {
      if (!entitlementId) {
        return NextResponse.json(
          { ok: false, error: "entitlementId is required." },
          { status: 400 }
        );
      }
      const success = revokeAllAccessEntitlement(entitlementId);
      return NextResponse.json({
        ok: success,
        message: success
          ? "All-Access entitlement revoked successfully."
          : "Failed to revoke entitlement.",
      });
    }

    if (action === "grant_mentorship") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "userId is required." }, { status: 400 });
      }
      const pack = createAllAccessMentorshipPack({
        userId,
        totalSessions: Number(totalSessions) || 1,
        durationDays: Number(durationDays) || 90,
      });
      return NextResponse.json({
        ok: true,
        pack,
        message: "All-Access mentorship pack granted successfully.",
      });
    }

    return NextResponse.json({ ok: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Admin action failed." },
      { status: 500 }
    );
  }
}
