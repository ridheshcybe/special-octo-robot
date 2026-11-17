import crypto from "node:crypto";
import { cookies } from "next/headers";

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: "admin";
  fullName: string;
  exp: number;
  sig?: string;
}

function getSigningSecret(): string {
  return (
    process.env.PMU_ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "pmu-fallback-signing-key-change-me"
  );
}

function computeHmac(data: string): string {
  return crypto.createHmac("sha256", getSigningSecret()).update(data).digest("base64url");
}

/**
 * Signs an admin session payload with HMAC-SHA256.
 * Outputs JSON so Edge middleware (`JSON.parse`) and server routes (`requireAdmin`) both work.
 */
export function signAdminSession(
  payload: Omit<AdminSessionPayload, "exp" | "sig">,
  ttlSeconds = 60 * 60 * 12
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const canonical = `${payload.userId}:${payload.email}:admin:${exp}`;
  const sig = computeHmac(canonical);
  return JSON.stringify({
    userId: payload.userId,
    email: payload.email,
    role: "admin",
    fullName: payload.fullName,
    exp,
    sig,
  });
}

/**
 * Verifies an HMAC-SHA256 signed admin session cookie.
 */
export function verifyAdminSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;

  // Support JSON cookie with `sig`
  if (token.startsWith("{")) {
    try {
      const parsed = JSON.parse(token) as AdminSessionPayload;
      if (parsed.role !== "admin" || !parsed.email) return null;
      if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
      if (parsed.sig && parsed.exp) {
        const canonical = `${parsed.userId}:${parsed.email}:admin:${parsed.exp}`;
        const expected = computeHmac(canonical);
        const sigBuf = Buffer.from(parsed.sig);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  }

  // Also support legacy `base64url.hmac` format
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expected = computeHmac(encoded);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSessionPayload;
    if (parsed.role !== "admin" || !parsed.email) return null;
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the `pmu-admin-session` cookie from the current request.
 */
export async function requireAdmin(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("pmu-admin-session")?.value;
  return verifyAdminSession(raw);
}
