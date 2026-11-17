import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getUnifiedProductBySlug,
  createUnifiedOrder,
  hasActiveAllAccess,
  claimAllAccessEarlyAdopterSeat,
  getAllAccessEarlyAdopterRedemption,
  getAllAccessEarlyAdopterCount,
  getQuantumEnrollment,
  getCyberEnrollment,
} from "@/app/prepmeup/_lib/trackStore";
import {
  getUnifiedRazorpayCredentials,
  createUnifiedRazorpayClient,
} from "@/lib/prepmeup/unifiedRazorpay";
import { checkRateLimit } from "@/lib/prepmeup/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("pmu-session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to initiate checkout. Please log in with WhatsApp." },
        { status: 401 }
      );
    }

    let sessionUser: { id: string; phone?: string } = { id: sessionCookie.value };
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed.id || parsed.userId || parsed.phone) {
        sessionUser = {
          id: parsed.id || parsed.userId || parsed.phone,
          phone: parsed.phone,
        };
      }
    } catch {
      sessionUser = { id: sessionCookie.value };
    }

    const userId = sessionUser.id;

    // Rate limiting: 10 attempts per hour
    const rateLimit = await checkRateLimit(userId, "unified_checkout");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many checkout requests. Please wait a few minutes before trying again.",
          rateLimitExceeded: true,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { productSlug, claimEarlyAdopter } = body;

    if (!productSlug) {
      return NextResponse.json(
        { ok: false, error: "productSlug is required for checkout." },
        { status: 400 }
      );
    }

    // 1. Fetch active product
    const product = getUnifiedProductBySlug(productSlug);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { ok: false, error: `Product '${productSlug}' not found or inactive.` },
        { status: 404 }
      );
    }

    // 2. Check for active duplicate access
    if (product.slug === "prepmeup-all-access-pass" && hasActiveAllAccess(userId)) {
      return NextResponse.json(
        {
          ok: false,
          alreadyPurchased: true,
          error: "You already have an active PrepMeUp All-Access Pass with 6-month entitlement.",
        },
        { status: 400 }
      );
    }

    if (product.slug === "quantum-semester-pass") {
      const qEnrollment = getQuantumEnrollment(userId, "quantum-computing-foundations");
      if (qEnrollment && qEnrollment.status === "active") {
        return NextResponse.json(
          {
            ok: false,
            alreadyPurchased: true,
            error: "You already have an active Quantum Semester Pass.",
          },
          { status: 400 }
        );
      }
    }

    if (product.slug === "cybersecurity-semester-pass") {
      const cEnrollment = getCyberEnrollment(
        userId,
        "cybersecurity-foundations-ethical-hacking-soc-ctf"
      );
      if (cEnrollment && cEnrollment.status === "active") {
        return NextResponse.json(
          {
            ok: false,
            alreadyPurchased: true,
            error: "You already have an active CyberSecurity Semester Pass.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Early Adopter 100% Scholarship Path
    if (claimEarlyAdopter && product.isEarlyAdopterEligible) {
      const eaRate = await checkRateLimit(userId, "all_access_early_adopter_claim");
      if (!eaRate.success) {
        return NextResponse.json(
          {
            ok: false,
            error: "Too many early adopter claim attempts. Please wait before retrying.",
          },
          { status: 429 }
        );
      }

      const eaResult = claimAllAccessEarlyAdopterSeat(
        userId,
        product.slug,
        product.earlyAdopterLimit || 10
      );

      if (eaResult.success) {
        // Record ₹0 completed order
        const freeOrder = createUnifiedOrder({
          userId,
          productSlug: product.slug,
          amountInPaise: 0,
          metadata: {
            isEarlyAdopter: true,
            redemptionNumber: eaResult.redemptionNumber,
            claimedAt: new Date().toISOString(),
          },
        });

        return NextResponse.json({
          ok: true,
          earlyAdopterClaimed: true,
          redemptionNumber: eaResult.redemptionNumber,
          orderId: freeOrder.id,
          amount: 0,
          currency: "INR",
          message: `Congratulations! Early Adopter Seat #${eaResult.redemptionNumber} claimed with 100% scholarship.`,
        });
      }

      // If user already claimed, return notice
      const existing = getAllAccessEarlyAdopterRedemption(userId, product.slug);
      if (existing) {
        return NextResponse.json(
          {
            ok: false,
            alreadyPurchased: true,
            error: "You have already claimed an Early Adopter free seat for the All-Access Pass.",
          },
          { status: 400 }
        );
      }
    }

    // 4. Paid Razorpay Checkout Path
    const amountInPaise = product.priceInPaise;
    const creds = getUnifiedRazorpayCredentials();
    const rzpClient = createUnifiedRazorpayClient();

    let razorpayOrderId: string | null = null;

    if (rzpClient) {
      try {
        const orderResponse = await rzpClient.orders.create({
          amount: amountInPaise,
          currency: product.currency || "INR",
          receipt: `rcpt_uni_${Date.now()}_${userId.slice(-6)}`,
          notes: {
            userId,
            productSlug: product.slug,
            productName: product.name,
            platform: "prepmeup-ai-unified",
          },
        });
        razorpayOrderId = orderResponse.id;
      } catch (rzpErr: any) {
        console.error("[Unified Razorpay] Gateway error creating order:", rzpErr);
      }
    }

    if (!razorpayOrderId) {
      // Fallback in test / dev mode
      razorpayOrderId = `order_uni_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
    }

    // 5. Store order in unified state
    const order = createUnifiedOrder({
      userId,
      productSlug: product.slug,
      razorpayOrderId,
      amountInPaise,
      currency: product.currency || "INR",
      metadata: {
        productName: product.name,
        durationDays: product.durationDays,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.razorpayOrderId,
      internalOrderId: order.id,
      amount: order.amountInPaise,
      currency: order.currency,
      keyId: creds.keyId,
      product: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        durationDays: product.durationDays,
      },
    });
  } catch (err: any) {
    console.error("[Unified Checkout] Unexpected checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error during unified checkout." },
      { status: 500 }
    );
  }
}
