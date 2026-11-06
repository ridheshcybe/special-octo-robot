/**
 * PrepMeUp AI — Phase S1-A signed admin sessions.
 *
 * Admin identity is carried in a single HMAC-SHA256 signed token:
 *
 *     base64url(payload).base64url(signature)
 *
 * The payload is never trusted without a valid signature, and a role claim is
 * only accepted from `role === "admin"`. Verification uses Web Crypto so the
 * same module runs in the Node.js server runtime and in Edge middleware.
 *
 * This file must stay free of Node-only and Next-only imports so that it can be
 * compiled and unit-tested in isolation (see tests/phase-s1a-security-core.test.cjs).
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PMU_ADMIN_SESSION_COOKIE = "pmu-admin-session";
export const PMU_ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours
const CLOCK_SKEW_SECONDS = 60;
const MIN_SECRET_LENGTH = 32;

/**
 * Development-only fallback secret. It is deliberately *not* accepted in
 * production: `getPmuSessionSecret()` returns null there, which makes both
 * signing and verification fail closed.
 */
const DEV_FALLBACK_SECRET = "pmu-development-only-session-secret-do-not-ship";

export interface PmuAdminSessionPayload {
  /** Authenticated admin user id. */
  sub: string;
  /** Only admins may hold this token. */
  role: "admin";
  /** Issued-at, seconds since epoch. */
  iat: number;
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Unique session id (rotated on every login). */
  jti: string;
  email?: string;
  fullName?: string;
}

export interface PmuAdminSessionInput {
  sub: string;
  email?: string;
  fullName?: string;
  ttlSeconds?: number;
}

export type PmuAdminRequestDecision =
  | { status: 200; session: PmuAdminSessionPayload }
  | { status: 401; reason: "missing_session" | "invalid_session" }
  | { status: 403; reason: "cross_origin_request" }
  | { status: 503; reason: "session_secret_missing" };

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSignBase64Url(body: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function hmacVerifyBase64Url(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await importHmacKey(secret);
    // crypto.subtle.verify performs a constant-time comparison internally.
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      encoder.encode(body)
    );
  } catch {
    return false;
  }
}

/**
 * Returns the signing secret, or null when it is unusable.
 *
 * Production requires `PMU_SESSION_SECRET` with at least 32 characters. Outside
 * production a fixed development secret keeps local login working; the value is
 * rejected in production by `validatePmuEnv()`.
 */
export function getPmuSessionSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret = env.PMU_SESSION_SECRET?.trim();
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
  if ((env.NODE_ENV || "development") !== "production") return DEV_FALLBACK_SECRET;
  return null;
}

/**
 * Issues a fresh signed admin session. Returns null when no usable secret is
 * configured, so callers fail closed instead of writing an unsigned cookie.
 */
export async function signPmuAdminSession(
  input: PmuAdminSessionInput,
  options: { secret?: string | null; now?: number } = {}
): Promise<string | null> {
  const secret = options.secret === undefined ? getPmuSessionSecret() : options.secret;
  if (!secret) return null;

  const nowMs = options.now ?? Date.now();
  const iat = Math.floor(nowMs / 1000);
  const ttl = Math.max(60, Math.floor(input.ttlSeconds ?? PMU_ADMIN_SESSION_MAX_AGE_SECONDS));

  const payload: PmuAdminSessionPayload = {
    sub: input.sub,
    role: "admin",
    iat,
    exp: iat + ttl,
    jti: crypto.randomUUID(),
    ...(input.email ? { email: input.email } : {}),
    ...(input.fullName ? { fullName: input.fullName } : {}),
  };

  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await hmacSignBase64Url(body, secret);
  return `${body}.${signature}`;
}

/**
 * Verifies signature, shape, role and expiry. Returns null for anything that is
 * not a valid, unexpired admin session.
 */
export async function verifyPmuAdminSessionToken(
  token: string | null | undefined,
  options: { secret?: string | null; now?: number } = {}
): Promise<PmuAdminSessionPayload | null> {
  if (!token) return null;

  const secret = options.secret === undefined ? getPmuSessionSecret() : options.secret;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  if (!body || !signature) return null;

  const signatureValid = await hmacVerifyBase64Url(body, signature, secret);
  if (!signatureValid) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(base64UrlToBytes(body)));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const payload = parsed as Partial<PmuAdminSessionPayload>;

  if (payload.role !== "admin") return null;
  if (typeof payload.sub !== "string" || payload.sub.trim().length === 0) return null;
  if (typeof payload.jti !== "string" || payload.jti.trim().length === 0) return null;
  if (typeof payload.exp !== "number" || typeof payload.iat !== "number") return null;

  const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);
  if (payload.exp <= nowSeconds) return null;
  if (payload.iat > nowSeconds + CLOCK_SKEW_SECONDS) return null;

  return payload as PmuAdminSessionPayload;
}

function hostsMatch(origin: string, hostHeader: string | null | undefined): boolean {
  const host = (hostHeader || "").split(",")[0].trim().toLowerCase();
  if (!host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

/**
 * Single source of truth for "may this request act as a PrepMeUp admin?".
 *
 * Pure and dependency-free so the security suite can prove forged, tampered,
 * expired, missing, student and cross-origin requests are all rejected.
 */
export async function evaluatePmuAdminRequest(params: {
  token?: string | null;
  secret?: string | null;
  /** Full origin (or referer) supplied by the browser. */
  origin?: string | null;
  /** Request host header, used to detect cross-origin CSRF attempts. */
  host?: string | null;
  method?: string;
  now?: number;
}): Promise<PmuAdminRequestDecision> {
  const secret = params.secret === undefined ? getPmuSessionSecret() : params.secret;
  if (!secret) return { status: 503, reason: "session_secret_missing" };

  if (!params.token) return { status: 401, reason: "missing_session" };

  const session = await verifyPmuAdminSessionToken(params.token, {
    secret,
    now: params.now,
  });
  if (!session) return { status: 401, reason: "invalid_session" };

  const method = (params.method || "GET").toUpperCase();
  if (MUTATING_METHODS.has(method) && params.origin) {
    // Same-site CSRF defence for cookie-authenticated admin mutations.
    if (!hostsMatch(params.origin, params.host)) {
      return { status: 403, reason: "cross_origin_request" };
    }
  }

  return { status: 200, session };
}
