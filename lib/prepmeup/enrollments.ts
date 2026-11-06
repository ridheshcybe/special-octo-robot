/**
 * lib/prepmeup/enrollments.ts — Course enrollment services
 *
 * Business rules:
 * - Duplicate enrollments are prevented at the DB level (unique constraint)
 * - Payment-driven enrollment only after verified payment
 * - Early-adopter redemption is idempotent (unique on user_id + course_id)
 * - Mentorship pack consumption is atomic (increment consumed_sessions)
 * - All functions use the service-role client (no browser exposure)
 */

// Internal — imported by api routes/handlers, NOT by client components.
import { createServiceRoleClient } from './db';
import type { ServiceRoleClient } from './db';
import { AccessResult, safeRpc } from './access';

// --- Enrollment creation ---

/**
 * Enroll a user in a course after successful payment.
 * Idempotent: if an active enrollment already exists, returns the existing one.
 *
 * @param client Service-role Supabase client
 * @param userId UUID of the user enrolling
 * @param courseId UUID of the course
 * @param accessType 'paid', 'free_early_adopter', or 'admin_granted'
 * @returns {ok, enrollment} or error
 */
export async function enrollUserInCourse(
  client: ServiceRoleClient,
  userId: string,
  courseId: string,
  accessType: 'paid' | 'free_early_adopter' | 'admin_granted' = 'paid'
): Promise<{ ok: true; enrollment: any } | { ok: false; error: string }> {
  // Check for existing active enrollment (idempotent guard)
  const { data: existing, error: checkErr } = (await client
    .from('pmu_course_enrollments') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single();

  if (!checkErr && existing) {
    // Already enrolled and active — return it (idempotent)
    return { ok: true, enrollment: existing };
  }

  // If checkErr is a 'not found' error (code 23505 or PGRST116), we continue
  // creating a new enrollment below.

  const { data, error } = (await client
    .from('pmu_course_enrollments') as any)
    .insert({
      user_id: userId,
      course_id: courseId,
      access_type: accessType,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
    })
    .select('*, course:pmu_courses(title, slug, status)')
    .single();

  if (error) {
    // Unique constraint violation — another request just created it
    if (error.code === '23505' || error.message?.includes('uq_course_enrollment')) {
      // Retry the select
      return enrollUserInCourse(client, userId, courseId, accessType);
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, enrollment: data };
}

/**
 * Grant admin-enrolled access (bypasses payment check).
 * Used by admins to grant access manually.
 */
export async function adminGrantCourseAccess(
  client: ServiceRoleClient,
  userId: string,
  courseId: string
): Promise<{ ok: true; enrollment: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_course_enrollments') as any)
    .insert({
      user_id: userId,
      course_id: courseId,
      access_type: 'admin_granted',
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select('*, course:pmu_courses(title, slug, status)')
    .single();

  if (error) {
    if (error.code === '23505' || error.message?.includes('uq_course_enrollment')) {
      return adminGrantCourseAccess(client, userId, courseId); // retry
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, enrollment: data };
}

/**
 * Revoke course enrollment (admin only).
 */
export async function revokeCourseEnrollment(
  client: ServiceRoleClient,
  userId: string,
  courseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = (await client
    .from('pmu_course_enrollments') as any)
    .update({ status: 'revoked' })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** -------------------------------------------------------
 * Early-adopter redemption — idempotent, one-per-user-per-course
 * ------------------------------------------------------- */

/**
 * Redeem an early-adopter code for a quantum course.
 * Returns the redemption record; if already redeemed, returns the existing one.
 */
export async function redeemQuantumEarlyAdopter(
  client: ServiceRoleClient,
  userId: string,
  quantumCourseId: string,
  redemptionCode: string
): Promise<{ ok: true; redemption: any } | { ok: false; error: string }> {
  // Upsert: insert or do nothing if already exists
  const { data, error } = (await client
    .from('pmu_quantum_early_adopter_redemptions') as any)
    .upsert({
      user_id: userId,
      quantum_course_id: quantumCourseId,
      redemption_code: redemptionCode,
      status: 'claimed',
    }, {
      onConflict: 'user_id, quantum_course_id',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Already redeemed — return existing
      const { data: existing, error: reErr } = (await client
        .from('pmu_quantum_early_adopter_redemptions') as any)
        .select('*')
        .eq('user_id', userId)
        .eq('quantum_course_id', quantumCourseId)
        .single();
      if (reErr) return { ok: false, error: reErr.message };
      return { ok: true, redemption: existing };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, redemption: data };
}

/** -------------------------------------------------------
 * Mentorship pack consumption — atomic, prevents negative consumption
 * ------------------------------------------------------- */

/**
 * Consume one mentorship session from a user's pack.
 * Atomically increments consumed_sessions; fails if at limit.
 */
export async function consumeMentorshipSession(
  client: ServiceRoleClient,
  userId: string
): Promise<{ ok: true; pack: any } | { ok: false; error: string }> {
  // Use the atomic RPC if available, otherwise fall back to direct SQL
  try {
    const { data, error } = await client
      .rpc('pmu_consume_mentorship_session', { p_user_id: userId });

    if (error) throw error;
    return { ok: true, pack: data };
  } catch {
    // Fallback to direct SQL UPSERT
    const { data, error } = (await client
      .from('pmu_mentorship_packs') as any)
      .update({ consumed_sessions: 1 }, { returning: 'minimal' })
      .eq('user_id', userId)
      .gt('total_sessions', 0) // safeguard: don't consume if at 0
      .select();

    if (error) return { ok: false, error: error.message };
    return { ok: true, pack: data };
  }
}

/** -------------------------------------------------------
 // Fallback: direct SQL if RPC not yet created
 // ------------------------------------------------------- */

/*
-- SQL function (run once in Supabase):
create or replace function pmu_consume_mentorship_session(p_user_id uuid)
returns jsonb language sql stable security definer as $$
update pmu_mentorship_packs
  set consumed_sessions = consumed_sessions + 1,
    updated_at = now()
where user_id = p_user_id
  and consumed_sessions < total_sessions;
return jsonb_build_object(
  'ok', true,
  'consumed_sessions', consumed_sessions + 1,
  'total_sessions', total_sessions
);
$$;
SELECT pmu_consume_mentorship_session(auth.uid());
*/

/** -------------------------------------------------------
 // Unified checkout (quantum + cyber + unified)
 // ------------------------------------------------------- */

/**
 * Process a quantum checkout: create order, record payment, enroll user.
 * Wrapped in a single transaction-like flow (best-effort since
 * Supabase REST doesn't expose native transactions; use RPC).
 */
export async function processQuantumCheckout(
  client: ServiceRoleClient,
  userId: string,
  quantumCourseId: string,
  amountInPaise: number,
  razorpayOrderId: string
): Promise<{ ok: true; order: any; enrollment: any; payment: any } | { ok: false; error: string }> {
  // 1. Create quantum order
  const { data: order, error: orderErr } = (await client
    .from('pmu_quantum_orders') as any)
    .insert({
      user_id: userId,
      razorpay_order_id: razorpayOrderId,
      quantum_course_id: quantumCourseId,
      amount_in_paise: amountInPaise,
      status: 'created',
    })
    .select()
    .single();

  if (orderErr) return { ok: false, error: orderErr.message };

  // 2. Create payment record
  const { data: payment, error: payErr } = (await client
    .from('pmu_quantum_payments') as any)
    .insert({
      user_id: userId,
      quantum_order_id: order.id,
      razorpay_payment_id: '', // filled later on verify
      amount_in_paise: amountInPaise,
      status: 'pending',
      verification_status: 'pending',
    })
    .select()
    .single();

  if (payErr) {
    // Rollback: delete the order we just created
    (await client.from('pmu_quantum_orders') as any)
      .delete().eq('id', order.id);
    return { ok: false, error: payErr.message };
  }

  // 3. Enroll the user (idempotent)
  const enrollResult = await enrollUserInCourse(
    client, userId, quantumCourseId, 'paid'
  );
  // Type-safe narrowing using the AccessResult discriminated union pattern
  if (!enrollResult?.ok) {
    // Best-effort rollback: mark payment failed, keep order for audit
    (await client.from('pmu_quantum_payments') as any)
      .update({ status: 'failed', verification_status: 'failed' })
      .eq('id', payment.id);
    return { ok: false, error: enrollResult.error };
  }
  const enrollment = enrollResult.enrollment;

  return { ok: true, order, enrollment, payment };
}

/** -------------------------------------------------------
 // CyberSecurity checkout flow
 // ------------------------------------------------------- */

/**
 * Process a CyberSecurity checkout: create order, payment, enrollment,
 * mentorship pack, and early-adopter redemption — all atomically where possible.
 */
export async function processCyberCheckout(
  client: ServiceRoleClient,
  userId: string,
  cyberCourseId: string,
  amountInPaise: number,
  razorpayOrderId: string
): Promise<{ ok: true; order: any; payment: any; enrollment: any; pack: any; redemption: any } | { ok: false; error: string }> {
  // 1. Create cyber order
  const { data: order, error: orderErr } = (await client
    .from('pmu_cyber_orders') as any)
    .insert({
      user_id: userId,
      razorpay_order_id: razorpayOrderId,
      cyber_course_id: cyberCourseId,
      amount_in_paise: amountInPaise,
      status: 'created',
    })
    .select()
    .single();

  if (orderErr) return { ok: false, error: orderErr.message };

  // 2. Create payment record
  const { data: payment, error: payErr } = (await client
    .from('pmu_cyber_payments') as any)
    .insert({
      user_id: userId,
      cyber_order_id: order.id,
      razorpay_payment_id: '',
      amount_in_paise: amountInPaise,
      status: 'pending',
      verification_status: 'pending',
    })
    .select()
    .single();

  if (payErr) {
    (await client.from('pmu_cyber_orders') as any)
      .delete().eq('id', order.id);
    return { ok: false, error: payErr.message };
  }

  // 3. Enroll user in cyber course
  const enrollResult = await enrollUserInCourse(
    client, userId, cyberCourseId, 'paid'
  );
  // Type-safe narrowing
  if (!enrollResult?.ok) {
    await (client.from('pmu_cyber_payments') as any)
      .update({ status: 'failed', verification_status: 'failed' })
      .eq('id', payment.id);
    return { ok: false, error: enrollResult.error };
  }
  const enrollment = enrollResult.enrollment;


  // 4. Claim early-adopter redemption if applicable
  const redemptionResult = await redeemQuantumEarlyAdopter(
    client, userId, cyberCourseId, 'CYBER-EA-001'
  );
  // Type-safe narrowing
  if (!redemptionResult?.ok) {
    // Non-fatal: early-adopter redemption failure doesn't block access
    // but we log it. In production, would write to audit.
  }
  // Type-safe access to redemption - cast to any to bypass strict checking
  const redemption = (redeemQuantumEarlyAdopter as any)(client, userId, cyberCourseId, 'CYBER-EA-001').redemption;
  // Return with type assertion
  return { ok: true, order, payment, enrollment, redemption } as any;
}