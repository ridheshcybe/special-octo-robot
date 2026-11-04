import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import type { UnifiedEntitlement, UnifiedOrder } from "@/app/prepmeup/_lib/unifiedStore";

/**
 * Best-effort durable mirroring for Phase C3.
 *
 * The file-backed unified store is authoritative for the running app; these
 * helpers copy the same records into the `pmu_*` tables once the PrepMeUp
 * Supabase service-role key is configured. Every failure is swallowed because
 * checkout verification and webhook delivery must stay idempotent and retriable.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCanonicalUuid(value: string | null | undefined): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
}

export async function mirrorUnifiedOrder(order: UnifiedOrder): Promise<void> {
  const client = createPmuServiceClient();
  if (!client || !isCanonicalUuid(order.userId) || !isCanonicalUuid(order.productId)) return;

  try {
    await client.from("pmu_unified_orders").insert({
      user_id: order.userId,
      product_id: order.productId,
      razorpay_order_id: order.razorpayOrderId,
      amount_in_paise: order.amountInPaise,
      currency: order.currency,
      status: order.status,
      metadata: { ...order.metadata, localOrderId: order.id, productSlug: order.productSlug },
    });
  } catch {
    // Best-effort only.
  }
}

export async function mirrorUnifiedOrderStatus(
  razorpayOrderId: string,
  status: string
): Promise<void> {
  const client = createPmuServiceClient();
  if (!client) return;

  try {
    await client
      .from("pmu_unified_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", razorpayOrderId);
  } catch {
    // Best-effort only.
  }
}

export async function mirrorUnifiedPayment(params: {
  order: UnifiedOrder;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  status: string;
  verificationStatus: string;
  webhookStatus: string;
}): Promise<void> {
  const client = createPmuServiceClient();
  if (!client || !isCanonicalUuid(params.order.userId)) return;

  try {
    const { data: dbOrder } = await client
      .from("pmu_unified_orders")
      .select("id")
      .eq("razorpay_order_id", params.order.razorpayOrderId)
      .maybeSingle();

    if (!dbOrder?.id) return;

    const { error } = await client.from("pmu_unified_payments").insert({
      order_id: dbOrder.id,
      user_id: params.order.userId,
      razorpay_payment_id: params.razorpayPaymentId,
      razorpay_signature: params.razorpaySignature || null,
      amount_in_paise: params.amountInPaise,
      currency: "INR",
      status: params.status,
      verification_status: params.verificationStatus,
      webhook_status: params.webhookStatus,
    });

    if (error) {
      await client
        .from("pmu_unified_payments")
        .update({
          status: params.status,
          verification_status: params.verificationStatus,
          webhook_status: params.webhookStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_payment_id", params.razorpayPaymentId);
    }
  } catch {
    // Best-effort only.
  }
}

export async function mirrorUnifiedPaymentWebhookStatus(
  razorpayPaymentId: string,
  status: "captured" | "failed" | "refunded"
): Promise<void> {
  const client = createPmuServiceClient();
  if (!client || !razorpayPaymentId) return;

  try {
    await client
      .from("pmu_unified_payments")
      .update({ webhook_status: "processed", status, updated_at: new Date().toISOString() })
      .eq("razorpay_payment_id", razorpayPaymentId);
  } catch {
    // Best-effort only.
  }
}

/**
 * Mirrors one entitlement row. The unique-per-(user, product, active) lookup
 * keeps repeated webhook/verification calls from stacking duplicate rows.
 */
export async function mirrorUnifiedEntitlement(entitlement: UnifiedEntitlement): Promise<void> {
  const client = createPmuServiceClient();
  if (!client || !isCanonicalUuid(entitlement.userId) || !isCanonicalUuid(entitlement.productId)) {
    return;
  }

  try {
    const { data: existing } = await client
      .from("pmu_all_access_entitlements")
      .select("id")
      .eq("user_id", entitlement.userId)
      .eq("product_id", entitlement.productId)
      .eq("status", "active")
      .maybeSingle();

    const payload = {
      user_id: entitlement.userId,
      product_id: entitlement.productId,
      included_track_ids: entitlement.includedTrackIds,
      included_course_ids: entitlement.includedCourseIds,
      starts_at: entitlement.startsAt,
      expires_at: entitlement.expiresAt,
      status: entitlement.status,
      metadata: {
        productSlug: entitlement.productSlug,
        kind: entitlement.kind,
        sessionsTotal: entitlement.sessionsTotal ?? null,
        sessionsUsed: entitlement.sessionsUsed ?? 0,
        localEntitlementId: entitlement.id,
      },
    };

    if (existing?.id) {
      await client
        .from("pmu_all_access_entitlements")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await client.from("pmu_all_access_entitlements").insert(payload);
    }
  } catch {
    // Best-effort only.
  }
}

export async function mirrorWebhookEvent(params: {
  provider: string;
  eventId: string;
  eventType: string;
  payload: unknown;
  status: string;
}): Promise<boolean> {
  const client = createPmuServiceClient();
  if (!client) return false;

  try {
    const { error } = await client.from("pmu_webhook_events").insert({
      provider: params.provider,
      event_id: params.eventId,
      event_type: params.eventType,
      payload: params.payload,
      status: params.status,
      attempts: 1,
      received_at: new Date().toISOString(),
    });

    return Boolean(error?.code === "23505" || error?.message?.includes("duplicate"));
  } catch {
    return false;
  }
}

export async function updateMirroredWebhookEvent(
  provider: string,
  eventId: string,
  status: string
): Promise<void> {
  const client = createPmuServiceClient();
  if (!client) return;

  try {
    await client
      .from("pmu_webhook_events")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("provider", provider)
      .eq("event_id", eventId);
  } catch {
    // Best-effort only.
  }
}
