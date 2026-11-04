import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { hasCyberSemesterPass } from "@/lib/prepmeup/access";
import {
  CYBER_COURSE_ID,
  CYBER_COURSE_SLUG,
  CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
  CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
  CYBER_SEMESTER_MONTHS,
  claimCyberEarlyAdopterSeat,
  createCyberMentorshipPack,
  createCyberOrder,
  getCyberEarlyAdopterCount,
  getCyberEarlyAdopterLimit,
  getCyberProductPriceInPaise,
  grantCyberEnrollment,
} from "@/app/prepmeup/_lib/cyberStore";
import {
  createCyberRazorpayClient,
  getCyberRazorpayCredentials,
  isCyberRazorpayConfigured,
} from "@/lib/prepmeup/cyberRazorpay";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please sign in to continue CyberSecurity enrollment." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const productType =
      body.productType === "mentorship_pack" ? "mentorship_pack" : "semester_pass";

    // Never accept an arbitrary course slug from the client.
    if (body.courseSlug && body.courseSlug !== CYBER_COURSE_SLUG) {
      return NextResponse.json(
        { ok: false, error: "Unknown CyberSecurity course." },
        { status: 400 }
      );
    }

    const wantsEarlyAdopter = Boolean(body.claimEarlyAdopter) && productType === "semester_pass";

    const checkoutLimit = await checkDurableRateLimit({
      bucketKey: "cyber_checkout",
      identifier: `${studentId}_${ip}`,
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!checkoutLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many checkout attempts. Please try again in ${checkoutLimit.retryAfterSec}s.`,
        },
        { status: 429, headers: { "Retry-After": String(checkoutLimit.retryAfterSec || 60) } }
      );
    }

    if (productType === "semester_pass" && hasCyberSemesterPass(studentId, CYBER_COURSE_SLUG)) {
      return NextResponse.json(
        {
          ok: false,
          alreadyPurchased: true,
          error: "You already have an active CyberSecurity Semester Pass.",
        },
        { status: 400 }
      );
    }

    const serviceClient = createPmuServiceClient();
    const canWriteDb = Boolean(serviceClient) && UUID_RE.test(studentId);

    // ------------------------------------------------------------------
    // Early Adopter: first N Semester Passes are 100% off (server-side only)
    // ------------------------------------------------------------------
    if (wantsEarlyAdopter) {
      const claimLimit = await checkDurableRateLimit({
        bucketKey: "cyber_early_adopter_claim",
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

      const limit = getCyberEarlyAdopterLimit();
      let redemptionNumber: number | undefined;
      let alreadyClaimed = false;
      let exhausted = false;

      // Durable atomic claim in Postgres when available.
      if (canWriteDb) {
        try {
          const { data, error } = await serviceClient!.rpc("pmu_claim_cyber_early_adopter", {
            p_user_id: studentId,
            p_course_id: CYBER_COURSE_ID,
            p_limit: limit,
          });

          if (!error && data) {
            const payload = data as Record<string, any>;
            if (payload.exhausted || payload.code === "SEATS_EXHAUSTED") {
              exhausted = true;
            } else {
              redemptionNumber = Number(payload.redemptionNumber || payload.redemption_number);
              alreadyClaimed = Boolean(payload.alreadyClaimed || payload.already_claimed);
            }
          }
        } catch {
          // Fall through to the in-process atomic counter.
        }
      }

      if (!exhausted && !redemptionNumber) {
        const claim = claimCyberEarlyAdopterSeat(studentId, CYBER_COURSE_SLUG, limit);
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

      if (exhausted) {
        return NextResponse.json(
          {
            ok: false,
            earlyAdopterUnavailable: true,
            remainingSeats: 0,
            error: "All Early Adopter seats have been claimed. Enroll at the standard ₹999 price.",
          },
          { status: 409 }
        );
      }

      // Activation happens only here, after the atomic claim succeeded.
      grantCyberEnrollment({
        userId: studentId,
        courseId: CYBER_COURSE_SLUG,
        accessType: "semester_pass",
        months: CYBER_SEMESTER_MONTHS,
        source: "early_adopter",
      });

      if (CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS > 0) {
        createCyberMentorshipPack({
          userId: studentId,
          courseId: CYBER_COURSE_SLUG,
          totalSessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
          validityDays: CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
          packType: "semester_pass_included",
        });
      }

      if (canWriteDb) {
        try {
          await serviceClient!.from("pmu_course_enrollments").insert({
            user_id: studentId,
            course_id: CYBER_COURSE_ID,
            access_type: "semester_pass",
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + CYBER_SEMESTER_MONTHS * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
          await serviceClient!.from("pmu_cyber_mentorship_packs").insert({
            user_id: studentId,
            course_id: CYBER_COURSE_ID,
            pack_type: "semester_pass_included",
            total_sessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
            used_sessions: 0,
            status: "active",
            expires_at: new Date(
              Date.now() + CYBER_PASS_MENTORSHIP_VALIDITY_DAYS * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        } catch {
          // Durable mirroring is best effort; the claim itself is authoritative.
        }
      }

      return NextResponse.json({
        ok: true,
        earlyAdopterClaimed: true,
        alreadyClaimed,
        redemptionNumber,
        amount: 0,
        currency: "INR",
        productType: "semester_pass",
        message: `Early Adopter seat #${redemptionNumber} confirmed. CyberSecurity Semester Pass is active for 6 months.`,
      });
    }

    // ------------------------------------------------------------------
    // Standard paid checkout — price is always computed server-side.
    // ------------------------------------------------------------------
    const amountInPaise = getCyberProductPriceInPaise(productType);

    if (!isCyberRazorpayConfigured() && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          ok: false,
          error: "CyberSecurity payment gateway is not configured. Please try again later.",
        },
        { status: 503 }
      );
    }

    let razorpayOrderId = `order_cyber_sandbox_${Date.now()}_${Math.random()
      .toString(16)
      .substring(2, 6)}`;

    const rzpClient = createCyberRazorpayClient();
    if (rzpClient) {
      const rzpOrder = await rzpClient.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `cyb_${Date.now()}`,
        notes: {
          productType,
          courseSlug: CYBER_COURSE_SLUG,
        },
      });
      if (rzpOrder?.id) razorpayOrderId = rzpOrder.id;
    }

    const order = createCyberOrder({
      userId: studentId,
      courseId: CYBER_COURSE_SLUG,
      productType,
      razorpayOrderId,
      amountInPaise,
      metadata: { source: "checkout" },
    });

    if (canWriteDb) {
      try {
        await serviceClient!.from("pmu_cyber_orders").insert({
          user_id: studentId,
          course_id: CYBER_COURSE_ID,
          product_type: productType,
          razorpay_order_id: razorpayOrderId,
          amount_in_paise: amountInPaise,
          currency: "INR",
          status: "created",
          metadata: { localOrderId: order.id, source: "checkout" },
        });
      } catch {
        // Best-effort mirror.
      }
    }

    const { keyId } = getCyberRazorpayCredentials();

    return NextResponse.json({
      ok: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      productType,
      keyId: process.env.NEXT_PUBLIC_CYBER_RAZORPAY_KEY_ID || keyId,
      earlyAdopterSeatsRemaining: Math.max(
        0,
        getCyberEarlyAdopterLimit() - getCyberEarlyAdopterCount(CYBER_COURSE_SLUG)
      ),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to initialize CyberSecurity checkout." },
      { status: 500 }
    );
  }
}
