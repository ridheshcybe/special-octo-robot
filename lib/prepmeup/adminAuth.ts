import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  evaluatePmuAdminRequest,
  PMU_ADMIN_SESSION_COOKIE,
  type PmuAdminSessionPayload,
} from "./session";

/**
 * PrepMeUp AI — Phase S1-A admin authorization.
 *
 * Every admin API route and admin server component must call `requirePmuAdmin()`
 * (or `getPmuAdminIdentity()`), not rely on middleware alone.
 */

export type PmuAuditEvent =
  | "admin_login_success"
  | "admin_login_failure"
  | "admin_login_blocked"
  | "admin_logout"
  | "admin_session_invalid"
  | "admin_session_missing"
  | "admin_session_secret_missing"
  | "admin_permission_denied";

const SENSITIVE_KEY_PATTERN = /pass|secret|token|authorization|cookie|apikey|api_key/i;

/**
 * Structured audit log. Emits one JSON line per event to the server log sink
 * (Vercel/Docker log drain). Never includes passwords, tokens or cookie values.
 */
export function logPmuAudit(
  event: PmuAuditEvent,
  details: Record<string, unknown> = {}
): void {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    safe[key] = value;
  }

  console.log(
    "[pmu-audit]",
    JSON.stringify({ event, at: new Date().toISOString(), ...safe })
  );
}

/**
 * Resolves the verified admin session, or null. Authorization is decided from
 * the signed token only — never from a client-supplied role claim.
 */
export async function getPmuAdminIdentity(): Promise<PmuAdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PMU_ADMIN_SESSION_COOKIE)?.value;
  const decision = await evaluatePmuAdminRequest({ token });
  return decision.status === 200 ? decision.session : null;
}

/**
 * Guard for route handlers. Returns a ready-to-return error response, or null
 * when the request is an authenticated admin request.
 *
 * Pass `req` for state-changing handlers so the same-origin CSRF check applies.
 */
export async function requirePmuAdmin(req?: NextRequest): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PMU_ADMIN_SESSION_COOKIE)?.value;

  const decision = await evaluatePmuAdminRequest({
    token,
    method: req?.method,
    origin: req?.headers.get("origin") ?? req?.headers.get("referer"),
    host: req?.headers.get("host") ?? req?.headers.get("x-forwarded-host"),
  });

  if (decision.status === 200) return null;

  if (decision.status === 401) {
    logPmuAudit(token ? "admin_session_invalid" : "admin_session_missing", {
      reason: decision.reason,
      path: req?.nextUrl?.pathname,
    });
  } else if (decision.status === 403) {
    logPmuAudit("admin_permission_denied", {
      reason: decision.reason,
      method: req?.method,
      path: req?.nextUrl?.pathname,
    });
  } else {
    logPmuAudit("admin_session_secret_missing", {
      path: req?.nextUrl?.pathname,
    });
  }

  const error =
    decision.status === 403
      ? "Forbidden: cross-origin admin request rejected."
      : decision.status === 503
        ? "Admin authentication is not configured."
        : "Unauthorized: Admin privileges required.";

  const response = NextResponse.json({ ok: false, error }, { status: decision.status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

// ---------------------------------------------------------------------------
// Admin login throttling
//
// The durable limiter in `lib/prepmeup/ratelimit.ts` throttles attempts; this
// adds a failure-based lockout so a valid password still cannot be brute-forced
// through a long attempt budget. Counters are per-instance by design (the
// durable limiter remains the cross-instance control).
// ---------------------------------------------------------------------------

const FAILURE_LOCK_THRESHOLD = 5;
const FAILURE_LOCK_MS = 15 * 60 * 1000;
const failureCounters = new Map<string, { count: number; lockedUntil: number }>();

export function adminLoginLockRemainingMs(key: string, now: number = Date.now()): number {
  const entry = failureCounters.get(key);
  if (!entry) return 0;
  if (entry.lockedUntil > now) return entry.lockedUntil - now;
  if (entry.lockedUntil > 0) failureCounters.delete(key);
  return 0;
}

export function recordAdminLoginFailure(key: string, now: number = Date.now()): void {
  const entry = failureCounters.get(key) ?? { count: 0, lockedUntil: 0 };
  const count = entry.count + 1;
  failureCounters.set(key, {
    count,
    lockedUntil: count >= FAILURE_LOCK_THRESHOLD ? now + FAILURE_LOCK_MS : 0,
  });
}

export function clearAdminLoginFailures(key: string): void {
  failureCounters.delete(key);
}
