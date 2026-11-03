/**
 * Rate Limiter for PrepMeUp AI Auth & Sensitive Endpoints.
 * Phase C0 Hardened: Durable Rate Limiting with Redis REST, Supabase, and TrackStore atomic fallbacks.
 * 
 * Supports:
 * 1. Upstash Redis REST API (zero latency over HTTP, distributed across serverless instances)
 *    Configured via `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`.
 * 2. Supabase PostgreSQL `pmu_rate_limit_events` table (durable across instances).
 * 3. Atomic TrackStore file-backed sliding window fallback.
 */

import { checkAndIncrementDurableRateLimit } from "./trackStore";
import { createPmuServiceClient } from "./supabaseServer";

interface RateRecord {
  timestamps: number[];
}

const phoneRequestMap = new Map<string, RateRecord>();
const ipRequestMap = new Map<string, RateRecord>();
const otpVerifyAttemptMap = new Map<string, { attempts: number; expiresAt: number }>();

// Periodic cleanup for in-memory fallback
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of phoneRequestMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) phoneRequestMap.delete(key);
    }
    for (const [key, record] of ipRequestMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60 * 60 * 1000);
      if (record.timestamps.length === 0) ipRequestMap.delete(key);
    }
    for (const [phone, record] of otpVerifyAttemptMap.entries()) {
      if (now > record.expiresAt) otpVerifyAttemptMap.delete(phone);
    }
  }, 5 * 60 * 1000);
}

/**
 * Execute Upstash Redis command via REST API if configured
 */
async function upstashCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result as T;
  } catch {
    return null;
  }
}

export interface DurableRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
}

/**
 * General-purpose durable rate limit function
 */
export async function checkDurableRateLimit({
  bucketKey,
  identifier,
  limit,
  windowSeconds,
}: {
  bucketKey: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): Promise<DurableRateLimitResult> {
  const sanitizedId = identifier.trim().toLowerCase() || "anonymous";

  // 1. Upstash Redis Check
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (upstashUrl) {
    const key = `pmu:rl:${bucketKey}:${sanitizedId}`;
    const now = Date.now();
    try {
      await upstashCommand(["ZREMRANGEBYSCORE", key, "-inf", now - windowSeconds * 1000]);
      const count = await upstashCommand<number>(["ZCARD", key]);

      if (count !== null && count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.max(1, Math.floor(windowSeconds / 2)),
        };
      }

      await upstashCommand(["ZADD", key, now, `${now}_${Math.random()}`]);
      await upstashCommand(["EXPIRE", key, windowSeconds]);
      return {
        allowed: true,
        remaining: Math.max(0, limit - ((count || 0) + 1)),
      };
    } catch {
      // Fallback to database / file store
    }
  }

  // 2. Supabase DB Check if service role is available
  const serviceClient = createPmuServiceClient();
  if (serviceClient) {
    try {
      const nowIso = new Date().toISOString();
      const { data: existing } = await serviceClient
        .from("pmu_rate_limit_events")
        .select("*")
        .eq("bucket_key", bucketKey)
        .eq("identifier", sanitizedId)
        .maybeSingle();

      const nowMs = Date.now();
      if (!existing || new Date(existing.expires_at).getTime() <= nowMs) {
        // Upsert new window
        const expiresAtIso = new Date(nowMs + windowSeconds * 1000).toISOString();
        await serviceClient.from("pmu_rate_limit_events").upsert(
          {
            bucket_key: bucketKey,
            identifier: sanitizedId,
            count: 1,
            window_start: nowIso,
            expires_at: expiresAtIso,
          },
          { onConflict: "bucket_key,identifier" }
        );
        return { allowed: true, remaining: limit - 1 };
      }

      if (existing.count >= limit) {
        const retryAfterSec = Math.max(
          1,
          Math.ceil((new Date(existing.expires_at).getTime() - nowMs) / 1000)
        );
        return { allowed: false, remaining: 0, retryAfterSec };
      }

      await serviceClient
        .from("pmu_rate_limit_events")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      return { allowed: true, remaining: limit - (existing.count + 1) };
    } catch {
      // Fallback to trackStore
    }
  }

  // 3. Durable File-backed / In-Memory atomic TrackStore
  const res = checkAndIncrementDurableRateLimit({
    bucketKey,
    identifier: sanitizedId,
    limit,
    windowSeconds,
  });

  return {
    allowed: res.allowed,
    remaining: res.remaining,
    retryAfterSec: res.retryAfterSec,
  };
}

/**
 * Check rate limit for sending OTPs to a specific mobile number or email:
 * Default: 3 attempts per 10 minutes (600s).
 */
export async function checkPhoneOtpRateLimit(phone: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const result = await checkDurableRateLimit({
    bucketKey: "otp_send_phone",
    identifier: phone,
    limit: 3,
    windowSeconds: 10 * 60,
  });
  return { allowed: result.allowed, retryAfterSec: result.retryAfterSec };
}

/**
 * Check rate limit per client IP address for OTP sending:
 * Default: 10 per 10 minutes.
 */
export async function checkIpOtpRateLimit(ip: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const result = await checkDurableRateLimit({
    bucketKey: "otp_send_ip",
    identifier: ip,
    limit: 10,
    windowSeconds: 10 * 60,
  });
  return { allowed: result.allowed, retryAfterSec: result.retryAfterSec };
}

/**
 * Record an OTP verification attempt for a phone number or email.
 * Allows maximum 5 failed attempts per OTP code window (10 minutes).
 * Now backed durably by checkDurableRateLimit across serverless instances.
 */
export async function recordOtpVerificationAttempt(
  phone: string
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfterSec?: number }> {
  const res = await checkDurableRateLimit({
    bucketKey: "otp_verify",
    identifier: phone,
    limit: 5,
    windowSeconds: 10 * 60,
  });
  return {
    allowed: res.allowed,
    remainingAttempts: res.remaining,
    retryAfterSec: res.retryAfterSec,
  };
}

/**
 * Aliases for backwards compatibility with verification handlers
 */
export async function checkAndIncrementVerifyAttempts(
  phone: string
): Promise<{ allowed: boolean; attemptsLeft: number; retryAfterSec?: number }> {
  const res = await recordOtpVerificationAttempt(phone);
  return { allowed: res.allowed, attemptsLeft: res.remainingAttempts, retryAfterSec: res.retryAfterSec };
}

export function resetVerifyAttempts(phone: string): void {
  otpVerifyAttemptMap.delete(phone);
}

export const checkIpRateLimit = checkIpOtpRateLimit;

/**
 * Clear verification attempts upon successful OTP validation.
 */
export function resetOtpVerificationAttempts(phone: string): void {
  otpVerifyAttemptMap.delete(phone);
}
