import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { canonicalizeStudentKey } from "@/app/prepmeup/_lib/studentStore";
import {
  getAllUnifiedEarlyAdopterRedemptions,
  getUnifiedEarlyAdopterStatus,
  getUnifiedEntitlementsForUser,
  getUnifiedProductBySlug,
  getUnifiedRevenueReport,
  grantUnifiedAccessByAdmin,
  listUnifiedProducts,
  revokeUnifiedEntitlement,
} from "@/app/prepmeup/_lib/unifiedStore";
import { mirrorUnifiedEntitlement } from "@/lib/prepmeup/unifiedDbMirror";

export const dynamic = "force-dynamic";

/**
 * Admin authorization for PrepMeUp revenue tooling.
 * Requires a parsed `pmu-admin-session` cookie with `role === "admin"`,
 * matching the middleware guard on `/prepmeup/admin/*`.
 */
async function getAdminSession(): Promise<{ email?: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("pmu-admin-session")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.role !== "admin") return null;
    return { email: typeof parsed.email === "string" ? parsed.email : undefined };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const params = req.nextUrl.searchParams;
    const report = getUnifiedRevenueReport({
      productSlug: params.get("product") || undefined,
      userId: params.get("user") || undefined,
      status: params.get("status") || undefined,
      paymentId: params.get("paymentId") || undefined,
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    });

    return NextResponse.json({
      ok: true,
      filters: {
        product: params.get("product") || "",
        user: params.get("user") || "",
        status: params.get("status") || "",
        paymentId: params.get("paymentId") || "",
        from: params.get("from") || "",
        to: params.get("to") || "",
      },
      products: listUnifiedProducts({ includeInactive: true }),
      earlyAdopter: {
        ...getUnifiedEarlyAdopterStatus(),
        redemptions: getAllUnifiedEarlyAdopterRedemptions(),
      },
      ...report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load revenue data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "grant_access" || action === "grant_mentorship") {
      const productSlug =
        typeof body.productSlug === "string" ? body.productSlug : "prepmeup-all-access-pass";
      const product = getUnifiedProductBySlug(productSlug);
      if (!product) {
        return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 400 });
      }

      // Accept an email, phone or canonical id — the store always keys on the
      // canonical student identity.
      const rawUserId = typeof body.userId === "string" ? body.userId.trim() : "";
      if (!rawUserId) {
        return NextResponse.json({ ok: false, error: "userId is required." }, { status: 400 });
      }
      const userId = canonicalizeStudentKey(rawUserId);
      if (!userId) {
        return NextResponse.json({ ok: false, error: "Invalid userId." }, { status: 400 });
      }

      const result = grantUnifiedAccessByAdmin({
        userId,
        productSlug,
        durationDays: Number(body.durationDays) > 0 ? Number(body.durationDays) : undefined,
        mentorshipSessions:
          action === "grant_mentorship" && Number(body.sessions) > 0
            ? Number(body.sessions)
            : undefined,
      });

      if (!result.success || !result.entitlement) {
        return NextResponse.json(
          { ok: false, error: result.error || "Failed to grant access." },
          { status: 400 }
        );
      }

      await mirrorUnifiedEntitlement(result.entitlement);

      return NextResponse.json({
        ok: true,
        entitlement: result.entitlement,
        entitlements: getUnifiedEntitlementsForUser(userId),
        message: `Access granted to ${userId} for ${product.name}.`,
      });
    }

    if (action === "revoke_access") {
      const entitlementId =
        typeof body.entitlementId === "string" ? body.entitlementId.trim() : "";
      if (!entitlementId) {
        return NextResponse.json(
          { ok: false, error: "entitlementId is required." },
          { status: 400 }
        );
      }

      const success = revokeUnifiedEntitlement(entitlementId);
      return NextResponse.json({
        ok: success,
        message: success ? "Entitlement revoked." : "Entitlement not found.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid admin revenue action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process admin revenue action." },
      { status: 500 }
    );
  }
}
