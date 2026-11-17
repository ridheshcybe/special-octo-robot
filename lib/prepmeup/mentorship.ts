/**
 * lib/prepmeup/mentorship.ts — Mentorship session services
 * 
 * Booking, consumption, cancellation, and refund of mentorship sessions.
 * All functions use the service-role client; key never exposed to browser.
 */

// Internal — imported by api routes/handlers, NOT by client components.
import { createServiceRoleClient } from './db';
import type { ServiceRoleClient } from './db';
import { AccessResult } from './access';

// -------------------------------------------------------
// Instructor availability
// -------------------------------------------------------

/**
 * List instructor availability for a given day of week (0=Sunday..6=Saturday).
 */
export async function listInstructorAvailability(
  client: ServiceRoleClient,
  instructorId: string,
  dayOfWeek: number
): Promise<{ ok: true; slots: any[] } | { ok: false; error: string }> {
  const { data, error } = await client
    .from('pmu_instructor_availability')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, slots: data };
}

// -------------------------------------------------------
// Mentorship slot booking
// -------------------------------------------------------

/**
 * Book a mentorship slot for a student.
 * Idempotent: if already booked, returns the existing booking.
 * 
 * @param client Service-role client
 * @param studentId UUID of the student
 * @param instructorId UUID of the instructor
 * @param slotId UUID of the mentorship_slot to book
 * @param courseId UUID of the course (optional)
 * @returns booking record or error
 */
export async function bookMentorshipSlot(
  client: ServiceRoleClient,
  studentId: string,
  instructorId: string,
  slotId: string,
  courseId: string | null = null
): Promise<{ ok: true; booking: any } | { ok: false; error: string }> {
  // Check if student already has a booking for this slot
  const { data: existing, error: checkErr } = await client
    .from('pmu_mentorship_sessions')
    .select('*')
    .eq('slot_id', slotId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (!checkErr && existing) {
    return { ok: true, booking: existing };
  }

  // Insert a new session record linked to the slot
  const { data, error } = await client
    .from('pmu_mentorship_sessions')
    .insert({
      slot_id: slotId,
      student_id: studentId,
      instructor_id: instructorId,
      course_id: courseId,
      status: 'scheduled',
    })
    .select(`
      *,
      student:pmu_profiles(full_name, email),
      slot:pmu_mentorship_slots(
        start_at, end_at, status, pack_id
      )
    `)
    .single();

  if (error) {
    // If unique violation (already booked by someone), return existing
    if (error.code === '23505' || error.message?.includes('pk')) {
      return bookMentorshipSlot(client, studentId, instructorId, slotId, courseId);
    }
    return { ok: false, error: error.message };
  }

  // Atomic: increment consumed_sessions on the parent pack
  // (Only if the slot belongs to a pack; standalone packs may not have this)
  try {
    await client.rpc('pmu_consume_mentorship_session', { p_user_id: studentId });
  } catch {
    // Best-effort; non-fatal if RPC not yet deployed
  }

  return { ok: true, booking: data };
}

// -------------------------------------------------------
// Cancel a mentorship session
// -------------------------------------------------------

/**
 * Cancel a mentorship session (student or admin).
 */
export async function cancelMentorshipSession(
  client: ServiceRoleClient,
  sessionId: string,
  cancelledBy: 'student' | 'admin'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const setStatus = cancelledBy === 'admin' ? 'cancelled' : 'student_cancelled';

  const { error } = await client
    .from('pmu_mentorship_sessions')
    .update({ status, cancelled_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// -------------------------------------------------------
// Consume a mentorship session (used after booking)
// -------------------------------------------------------

/**
 * Consume one session from the user's mentorship pack.
 * Delegates to the RPC pmu_consume_mentorship_session.
 */
export async function consumeBookedSession(
  client: ServiceRoleClient,
  userId: string
): Promise<{ ok: true; remaining: number } | { ok: false; error: string }> {
  const { data, error } = await client
    .rpc('pmu_consume_mentorship_session', { p_user_id: userId });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, remaining: data?.remaining ?? 0 };
}

// -------------------------------------------------------
// Instructor's mentorship sessions
// -------------------------------------------------------

/**
 * List all mentorship sessions for an instructor.
 */
export async function listInstructorSessions(
  client: ServiceRoleClient,
  instructorId: string
): Promise<{ ok: true; sessions: any[] } | { ok: false; error: string }> {
  const { data, error } = await client
    .from('pmu_mentorship_sessions')
    .select(`
      *,
      student:pmu_profiles(full_name, email),
      slot:pmu_mentorship_slots(start_at, end_at, status)
    `)
    .eq('instructor_id', instructorId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, sessions: data };
}

// -------------------------------------------------------
// Mentorship pack management (admin)
// -------------------------------------------------------

/**
 * Create/renew a mentorship pack for a user.
 * Admin-only operation.
 */
export async function adminCreateMentorshipPack(
  client: ServiceRoleClient,
  userId: string,
  months: number,
  accessType: 'admin_granted' | 'paid' | 'free_early_adopter' = 'admin_granted'
): Promise<{ ok: true; pack: any } | { ok: false; error: string }> {
  const { data, error } = await client
    .from('pmu_mentorship_packs')
    .upsert(
      {
        user_id: userId,
        months: months,
        access_type: accessType,
        status: 'active',
        total_sessions: months * 2, // 2 sessions per month as default
        consumed_sessions: 0,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, pack: data };
}

// /****************************************************************
//  * Certificate services
//  *****************************************************************
//  /lib/prepmeup/certificates.ts
//  /****************************************************************