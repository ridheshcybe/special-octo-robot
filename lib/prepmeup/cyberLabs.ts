/**
 * lib/prepmeup/cyberLabs.ts — CyberSecurity labs services
 * 
 * Lab management, student attempts, progress tracking, and incident cases.
 * All functions use the service-role client; key never exposed to browser.
 */

// Internal — imported by api routes/handlers, NOT by client components.
import { createServiceRoleClient } from './db';
import type { ServiceRoleClient } from './db';
import { AccessResult } from './access';

// -------------------------------------------------------
// CyberSecurity labs listing
// -------------------------------------------------------

/**
 * List all cybersecurity labs (published only for students).
 */
export async function listCyberLabsPublished(
  client: ServiceRoleClient
): Promise<{ ok: true; labs: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_labs') as any)
    .select('*, instructor:pmu_admins(full_name)')
    .eq('status', 'published');

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, labs: data };
}

/**
 * List all cybersecurity labs (including draft for admins).
 */
export async function listCyberLabsAll(
  client: ServiceRoleClient
): Promise<{ ok: true; labs: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_labs') as any)
    .select('*, instructor:pmu_admins(full_name)');

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, labs: data };
}

// -------------------------------------------------------
// Lab tasks listing
// -------------------------------------------------------

/**
 * List tasks for a specific cyber lab.
 */
export async function listLabTasks(
  client: ServiceRoleClient,
  labId: string
): Promise<{ ok: true; tasks: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_lab_tasks') as any)
    .select('*')
    .eq('lab_id', labId)
    .order('task_number');

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, tasks: data };
}

// -------------------------------------------------------
// Student lab attempt
// -------------------------------------------------------

/**
 * Start a new lab attempt for a student.
 * Creates an 'in_progress' attempt record.
 */
export async function startLabAttempt(
  client: ServiceRoleClient,
  userId: string,
  taskId: string
): Promise<{ ok: true; attempt: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_lab_attempts') as any)
    .upsert(
      {
        user_id: userId,
        task_id: taskId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        max_attempts: 3,
      },
      { onConflict: 'user_id, task_id' }
    )
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, attempt: data };
}

// -------------------------------------------------------
// Submit lab attempt
// -------------------------------------------------------

/**
 * Submit a lab attempt with a score.
 */
export async function submitLabAttempt(
  client: ServiceRoleClient,
  attemptId: string,
  score: number
): Promise<{ ok: true; attempt: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_lab_attempts') as any)
    .update({
      status: 'submitted',
      completed_at: new Date().toISOString(),
      score: score,
    })
    .eq('id', attemptId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, attempt: data };
}

// -------------------------------------------------------
// Lab progress tracking
// -------------------------------------------------------

/**
 * Get or create lab progress record for a user+lab combo.
 */
export async function getLabProgress(
  client: ServiceRoleClient,
  userId: string,
  labId: string
): Promise<{ ok: true; progress: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_lab_progress') as any)
    .upsert(
      {
        user_id: userId,
        lab_id: labId,
        progress_percentage: 0,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, lab_id' }
    )
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, progress: data };
}

// -------------------------------------------------------
// Update lab progress percentage
// -------------------------------------------------------

/**
 * Update lab progress percentage (called after task completion).
 */
export async function updateLabProgress(
  client: ServiceRoleClient,
  userId: string,
  labId: string,
  percentage: number
): Promise<{ ok: true; progress: any } | { ok: false; error: string }> {
  // Cap at 100%
  const capped = Math.min(Math.max(percentage, 0), 100);

  const { data, error } = (await client
    .from('pmu_cyber_lab_progress') as any)
    .update({
      progress_percentage: capped,
      last_activity_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('lab_id', labId)
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, progress: data };
}

// -------------------------------------------------------
// Lab acceptances (student acknowledges lab rules)
// -------------------------------------------------------

/**
 * Record a lab acceptance (student acknowledges).
 */
export async function recordLabAcceptance(
  client: ServiceRoleClient,
  userId: string,
  labTaskId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Upsert: record acceptance, prevent duplicate
  const { error } = (await client
    .from('pmu_lab_acceptances') as any)
    .upsert(
      {
        user_id: userId,
        lab_task_id: labTaskId,
        accepted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, lab_task_id' }
    );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// -------------------------------------------------------
// CyberSecurity incident cases
// -------------------------------------------------------

/**
 * Create a new incident case (admin only).
 */
export async function createIncidentCase(
  client: ServiceRoleClient,
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<{ ok: true; case: any } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_incident_cases') as any)
    .insert({
      title,
      description,
      severity,
      status: 'open',
      reported_by: (await client.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, case: data };
}

// -------------------------------------------------------
// Admin: list/resolve incident cases
// -------------------------------------------------------

/**
 * Admin list all incident cases.
 */
export async function adminListIncidentCases(
  client: ServiceRoleClient
): Promise<{ ok: true; cases: any[] } | { ok: false; error: string }> {
  const { data, error } = (await client
    .from('pmu_cyber_incident_cases') as any)
    .select('*, reported_by:pmu_admins(full_name), resolved_by:pmu_admins(resolved_name)');

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, cases: data };
}

/**
 * Admin resolve an incident case.
 */
export async function adminResolveIncidentCase(
  client: ServiceRoleClient,
  caseId: string,
  resolvedSeverity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = (await client
    .from('pmu_cyber_incident_cases') as any)
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      severity: resolvedSeverity,
    })
    .eq('id', caseId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}