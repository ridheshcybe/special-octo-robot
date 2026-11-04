import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  claimUnifiedEarlyAdopterSeat,
  createUnifiedOrder,
  getAllUnifiedEarlyAdopterRedemptions,
  getUnifiedAccessSummary,
  getUnifiedEarlyAdopterLimit,
  getUnifiedEarlyAdopterStatus,
  getUnifiedEntitlementsForUser,
  getUnifiedProductBySlug,
  listUnifiedProducts,
  markUnifiedOrderPaid,
  type UnifiedProduct,
} from "@/app/prepmeup/_lib/unifiedStore";
import {
  createUnifiedRazorpayClient,
  getUnifiedRazorpayCredentials,
  isUnifiedRazorpayConfigured,
} from "@/lib/prepmeup/unifiedRazorpay";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";
import {
  isCanonicalUuid,
  mirrorUnifiedEntitlement,
  mirrorUnifiedOrder,
  mirrorUnifiedPayment,
} from "@/lib/prepmeup/unifiedDbMirror";

export const dynamic = "force-dynamic";

const CTA_BY_SLUG: Record<string, string> = {
  "btech-semester-pass": "Buy B.Tech Pass",
  "quantum-semester-pass": "Buy Quantum",
  "cybersecurity-semester-pass": "Buy CyberSecurity",
  "prepmeup-all-access-pass": "Get All Access",
  "quantum-mentorship-pack": "Buy Quantum Mentorship",
  "cybersecurity-mentorship-pack": "Buy CyberSecurity Mentorship",
  "all-access-mentorship-pack": "Buy All-Access Mentorship",
};

function durationLabel(product: UnifiedProduct): string {
  if (product.durationDays === 180 && product.productType !== "mentorship_pack") {
    return product.slug === "btech-semester-pass" ? "Semester" : "6 months";
  }
  if (product.durationDays === 90) return "90 days";
  return `${product.durationDays} days`;
}

function publicProductView(product: UnifiedProduct, earlyEligible: boolean) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    productType: product.productType,
    priceInPaise: product.priceInPaise,
    priceRupees: Math.round(product.priceInPaise / 100),
    earlyAdopterPriceInPaise: earlyEligible ? 0 : undefined,
    currency: product.currency,
    durationDays: product.durationDays,
    durationLabel: durationLabel(product),
    includedTrackSlugs: product.includedTrackSlugs,
    includedCourseSlugs: product.includedCourseSlugs,
    isEarlyAdopterEligible: product.isEarlyAdopterEligible,
    earlyAdopterLimit: product.earlyAdopterLimit,
    mentorshipSessionsIncluded: product.mentorshipSessionsIncluded,
    features: product.features,
    ctaLabel: CTA_BY_SLUG[product.slug] || "Buy now",
  };
}

function hasActiveAccessForProduct(
  userId: string,
  product: UnifiedProduct,
  summary: ReturnType<typeof getUnifiedAccessSummary>
): boolean {
  if (product.productType === "mentorship_pack") return false;
  if (product.slug === "prepmeup-all-access-pass") {
    return summary.hasAllAccess;
  }
  return product.includedCourseSlugs.every((slug) =>
    summary.accessibleCourseSlugs.includes(slug)
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const userId = identity?.canonicalId || null;

    const earlyAdopter = getUnifiedEarlyAdopterStatus(userId);
    const earlyEligible = earlyAdopter.isAvailable || earlyAdopter.alreadyClaimed;
    const access = userId ? getUnifiedAccessSummary(userId) : null;

    const ownedProductSlugs = userId
      ? [
          ...new Set(
            getUnifiedEntitlementsForUser(userId)
              .filter((e) => e.kind === "course_access" && e.status === "active")
              .map((e) => e.productSlug)
          ),
        ]
      : [];

    return NextResponse.json({
      ok: true,
      products: listUnifiedProducts().map((product) => {
        const productEarlyEligible = product.isEarlyAdopterEligible && earlyEligible;
        const owned = userId
          ? hasActiveAccessForProduct(userId, product, access!)
          : false;
        return {
          ...publicProductView(product, productEarlyEligible),
          owned,
        };
      }),
      earlyAdopter: {
        ...earlyAdopter,
        limit: getUnifiedEarlyAdopterLimit(),
        redemptionCount: getAllUnifiedEarlyAdopterRedemptions().length,
      },
      access,
      ownedProductSlugs,
      signedIn: Boolean(userId),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load PrepMeUp pricing." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please sign in to continue checkout." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const limit = await checkDurableRateLimit({
      bucketKey: "unified_checkout",
      identifier: `${studentId}_${ip}`,
      limit: 12,
      windowSeconds: 60 * 60,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many checkout attempts. Please try again in ${limit.retryAfterSec}s.`,
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec || 60) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const product = getUnifiedProductBySlug(body?.productSlug);
    if (!product) {
      return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 400 });
    }

    const summary = getUnifiedAccessSummary(studentId);
    if (hasActiveAccessForProduct(studentId, product, summary)) {
      return NextResponse.json(
        {
          ok: false,
          alreadyPurchased: true,
          error: `You already have active access for ${product.name}.`,
        },
        { status: 400 }
      );
    }

    const wantsEarlyAdopter =
      product.isEarlyAdopterEligible && body?.claimEarlyAdopter !== false;

    // ------------------------------------------------------------------
    // Early Adopter: first N All-Access passes are 100% off.
    // Redemption is claimed and verified server-side only.
    // ------------------------------------------------------------------
    if (wantsEarlyAdopter) {
      const claimLimit = await checkDurableRateLimit({
        bucketKey: "unified_early_adopter_claim",
        identifier: `${studentId}_${ip}`,
        limit: 5,
        windowSeconds: 60 * 60,
      });
      if (!claimLimit.allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: `Too many early-adopter claim attempts. Try again in ${claimLimit.retryAfterSec}s.`,
          },
          { status: 429, headers: { "Retry-After": String(claimLimit.retryAfterSec || 60) } }
        );
      }

      const seatLimit = product.earlyAdopterLimit || getUnifiedEarlyAdopterLimit();
      let redemptionNumber: number | undefined;
      let alreadyClaimed = false;
      let exhausted = false;

      // Durable, cross-instance atomic claim when Supabase is available.
      const serviceClient = createPmuServiceClient();
      if (serviceClient && isCanonicalUuid(studentId)) {
        try {
          const { data, error } = await serviceClient.rpc(
            "pmu_claim_all_access_early_adopter",
            {
              p_user_id: studentId,
              p_product_id: product.id,
              p_limit: seatLimit,
            }
          );

          if (!error && data) {
            const payload = data as Record<string, any>;
            if (payload.exhausted) {
              exhausted = true;
            } else if (payload.success) {
              redemptionNumber = Number(payload.redemptionNumber);
              alreadyClaimed = Boolean(payload.alreadyClaimed);
            }
          }
        } catch {
          // Fall through to the in-process atomic counter.
        }
      }

      if (!exhausted && !redemptionNumber) {
        const claim = claimUnifiedEarlyAdopterSeat(studentId, product.slug, seatLimit);
        if (claim.exhausted) {
          exhausted = true;
        } else if (claim.success) {
          redemptionNumber = claim.redemptionNumber;
          alreadyClaimed = Boolean(claim.alreadyClaimed);
        } else {
          return NextResponse.json(
            { ok: false, error: claim.error || "Early Adopter claim failed." },
            { status: 400 }
          );
        }
      }

      // Seats can run out between page load and click. In that case we fall
      // through to the normal paid checkout at the catalog price instead of
      // failing the request.
      if (!exhausted) {
      // A seat is single-use. If the redemption already exists but the
      // entitlement is gone (revoked/expired), never mint a second one.
      if (alreadyClaimed) {
        return NextResponse.json(
          {
            ok: false,
            alreadyClaimed: true,
            error:
              "Your Early Adopter seat was already claimed. Please contact support if your access needs to be restored.",
          },
          { status: 409 }
        );
      }

      // Free activation: amount 0, no Razorpay order needed.
      const freeOrder = createUnifiedOrder({
        userId: studentId,
        product,
        razorpayOrderId: `order_unified_free_${Date.now()}_${Math.random()
          .toString(16)
          .substring(2, 6)}`,
        amountInPaise: 0,
        metadata: {
          source: "early_adopter",
          earlyAdopter: true,
          redemptionNumber,
          alreadyClaimed,
        },
      });

      await mirrorUnifiedOrder(freeOrder);

      const paid = markUnifiedOrderPaid({
        razorpayOrderId: freeOrder.razorpayOrderId,
        razorpayPaymentId: `pay_early_adopter_${freeOrder.id}`,
        amountInPaise: 0,
        source: "early_adopter",
      });

      const access = getUnifiedAccessSummary(studentId);
      const entitlements = getUnifiedEntitlementsForUser(studentId).filter(
        (entitlement) => entitlement.sourceOrderId?.startsWith(freeOrder.id)
      );
      for (const entitlement of entitlements) {
        await mirrorUnifiedEntitlement(entitlement);
      }
      await mirrorUnifiedPayment({
        order: freeOrder,
        razorpayPaymentId: `pay_early_adopter_${freeOrder.id}`,
        amountInPaise: 0,
        status: "captured",
        verificationStatus: "verified",
        webhookStatus: "processed",
      });

      return NextResponse.json({
        ok: true,
        freeAccess: true,
        earlyAdopterClaimed: true,
        alreadyClaimed,
        redemptionNumber,
        orderId: freeOrder.razorpayOrderId,
        productSlug: product.slug,
        productName: product.name,
        amount: 0,
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID || null,
        access,
        message: alreadyClaimed
          ? "Your Early Adopter All-Access Pass is already active for 6 months."
          : `Early Adopter seat #${redemptionNumber} confirmed. PrepMeUp All-Access Pass is active for 6 months.`,        alreadyProcessed: paid.alreadyPaid,
      });
      }
    }

    // ------------------------------------------------------------------
    // Standard paid checkout — price always comes from the server catalog.
    // ------------------------------------------------------------------
    if (!isUnifiedRazorpayConfigured() && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "Payment gateway is not configured. Please try again later." },
        { status: 503 }
      );
    }

    let razorpayOrderId = `order_unified_sandbox_${Date.now()}_${Math.random()
      .toString(16)
      .substring(2, 6)}`;

    const rzpClient = createUnifiedRazorpayClient();
    if (rzpClient) {
      try {
        const rzpOrder = await rzpClient.orders.create({
          amount: product.priceInPaise,
          currency: "INR",
          receipt: `uni_${Date.now()}`,
          notes: {
            productSlug: product.slug,
            productType: product.productType,
          },
        });
        if (rzpOrder?.id) razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        // Surface gateway failures as a retryable 502 instead of a generic 500,
        // and keep the provider error server-side only.
        console.error("[UnifiedCheckout] Razorpay order creation failed:", err?.message || err);
        return NextResponse.json(
          {
            ok: false,
            error: "Payment gateway is temporarily unavailable. Please try again in a moment.",
          },
          { status: 502 }
        );
      }
    }

    const order = createUnifiedOrder({
      userId: studentId,
      product,
      razorpayOrderId,
      amountInPaise: product.priceInPaise,
      metadata: { source: "checkout" },
    });

    await mirrorUnifiedOrder(order);

    const { keyId } = getUnifiedRazorpayCredentials();
    const earlyStatus = getUnifiedEarlyAdopterStatus(studentId);

    return NextResponse.json({
      ok: true,
      orderId: razorpayOrderId,
      productSlug: product.slug,
      productName: product.name,
      productType: product.productType,
      amount: product.priceInPaise,
      currency: "INR",
      durationDays: product.durationDays,
      keyId: process.env.NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID || keyId,
      isLiveRazorpay: Boolean(rzpClient),
      earlyAdopterSeatsRemaining: earlyStatus.remainingSeats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to initialize checkout." },
      { status: 500 }
    );
  }
}
