import crypto from "node:crypto";
import { cookies } from "next/headers";

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: "admin";
  fullName: string;
  exp: number;
}

function getSigningSecret(): string {
  return (
    process.env.PMU_ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "pmu-fallback-signing-key-change-me"
  );
}

/**
 * Signs an admin session payload with HMAC-SHA256.
 * Format: base64url(json).base64url(hmac)
 */
export function signAdminSession(payload: Omit<AdminSessionPayload, "exp">, ttlSeconds = 60 * 60 * 12): string {
  const full: AdminSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSigningSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

/**
 * Verifies an HMAC-SHA256 signed admin session cookie.
 */
export function verifyAdminSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expected = crypto.createHmac("sha256", getSigningSecret()).update(encoded).digest("base64url");
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
