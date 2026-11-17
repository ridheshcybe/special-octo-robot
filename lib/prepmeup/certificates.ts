/**
 * lib/prepmeup/certificates.ts — Certificate services
 *
 * Certificate issuance, verification, and duplication prevention.
 * All functions use the service-role client; key never exposed to browser.
 */

// Internal — imported by api routes/handlers, NOT by client components.
import { createServiceRoleClient } from './db';
import type { ServiceRoleClient } from './db';
import { AccessResult } from './access';

// -------------------------------------------------------
// Certificate issuance
// -------------------------------------------------------

/**
 * Issue a certificate to a user for a completed course.
 * Idempotent: if a certificate already exists for this user+course,
 * returns the existing one without creating a duplicate.
 *
 * @param client Service-role client
 * @param userId UUID of the user
 * @param courseId UUID of the course
 * @param certificateCode Unique code for the certificate
 * @returns certificate record or error
 */
export async function issueCertificate(
  client: ServiceRoleClient,
  userId: string,
  courseId: string,
  certificateCode: string
): Promise<{ ok: true; certificate: any } | { ok: false; error: string }> {
  // Check if certificate already exists for this user+course
  const { data: existing, error: checkErr } = (await client
    .from('pmu_certificates') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!checkErr && existing) {
    // Certificate already issued — return it (idempotent)
    return { ok: true, certificate: existing };
  }

  // Create new certificate
  const { data, error } = (await client
    .from('pmu_certificates') as any)
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_code: certificateCode,
      issue_date: new Date().toISOString(),
      status: 'active',
      verification_count: 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || error.message?.includes('certificate_code')) {
      // Race condition — another request just created it
      return issueCertificate(client, userId, courseId, certificateCode);
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, certificate: data };
}

// -------------------------------------------------------
// Certificate verification
// -------------------------------------------------------

/**
 * Verify a certificate code — returns certificate details without
 * exposing sensitive user data beyond what's needed for display.
 */
export async function verifyCertificateCode(
  client: ServiceRoleClient,
  certificateCode: string
): Promise<{ ok: true; certificate: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_certificates') as any)
    .select('*, user:pmu_profiles(full_name, email), course:pmu_courses(title, slug)')
    .eq('certificate_code', certificateCode)
    .single();

  if (error) {
    return { ok: false, error: 'Invalid certificate code' };
  }
  // Increment verification count
  const certData = data as { verification_count: number; id: string };
  await (client.from('pmu_certificates') as any)
    .update({ verification_count: certData.verification_count + 1 })
    .eq('id', certData.id);

  return { ok: true, certificate: data };
}

// -------------------------------------------------------
// List user's certificates
// -------------------------------------------------------

/**
 * List all certificates for a user.
 */
export async function listUserCertificates(
  client: ServiceRoleClient,
  userId: string
): Promise<{ ok: true; certificates: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_certificates') as any)
    .select('*, course:pmu_courses(title, slug, status)')
    .eq('user_id', userId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, certificates: data };
}

// -------------------------------------------------------
// Admin: list all pending/revoked certificates
// -------------------------------------------------------

/**
 * Admin list of certificates needing attention.
 */
export async function adminListCertificatesForReview(
  client: ServiceRoleClient
): Promise<{ ok: true; certificates: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_certificates') as any)
    .select('*, user:pmu_profiles(full_name, email), course:pmu_courses(title, slug)')
    .eq('status', 'pending') // if you use pending status
    .or('status.eq.revoked');

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, certificates: data };
}