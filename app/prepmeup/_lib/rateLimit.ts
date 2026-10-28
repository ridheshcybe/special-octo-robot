/**
 * Rate Limiter for PrepMeUp AI Auth & Sensitive Endpoints.
 * 
 * Supports:
 * 1. Upstash Redis REST API (zero latency over HTTP, distributed across serverless instances)
 *    Configured via `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`.
 * 2. In-memory sliding-window fallback for local development or instances without Upstash.
 */

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

/**
 * Check rate limit for sending OTPs to a specific mobile number:
 * Max 5 attempts per 15 minutes, with a 60-second cooldown between consecutive sends.
 */
export async function checkPhoneOtpRateLimit(phone: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (upstashUrl) {
    const key = `pmu:ratelimit:phone:${phone}`;
    const now = Date.now();
    const windowSec = 15 * 60;

    // Upstash ZREMRANGEBYSCORE + ZADD + ZCOUNT pipeline equivalent
    try {
      await upstashCommand(["ZREMRANGEBYSCORE", key, "-inf", now - windowSec * 1000]);
      const count = await upstashCommand<number>(["ZCARD", key]);

      if (count !== null && count >= 5) {
        return { allowed: false, retryAfterSec: 300 };
      }

      await upstashCommand(["ZADD", key, now, `${now}`]);
      await upstashCommand(["EXPIRE", key, windowSec]);
      return { allowed: true };
    } catch {
      // Fallback cleanly to in-memory if Redis error occurs
    }
  }

  // In-memory sliding window fallback
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;

  let record = phoneRequestMap.get(phone);
  if (!record) {
    record = { timestamps: [] };
    phoneRequestMap.set(phone, record);
  }

  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length > 0) {
    const last = record.timestamps[record.timestamps.length - 1];
    const diff = Math.floor((now - last) / 1000);
    if (diff < 60) {
      return { allowed: false, retryAfterSec: 60 - diff };
    }
  }

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

/**
 * Check rate limit per client IP address. Max 15 OTP requests per hour.
 */
export async function checkIpOtpRateLimit(ip: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (upstashUrl) {
    const key = `pmu:ratelimit:ip:${ip}`;
    const now = Date.now();
    const windowSec = 60 * 60;

    try {
      await upstashCommand(["ZREMRANGEBYSCORE", key, "-inf", now - windowSec * 1000]);
      const count = await upstashCommand<number>(["ZCARD", key]);
      if (count !== null && count >= 15) {
        return { allowed: false, retryAfterSec: 600 };
      }
      await upstashCommand(["ZADD", key, now, `${now}`]);
      await upstashCommand(["EXPIRE", key, windowSec]);
      return { allowed: true };
    } catch {
      // Fallback cleanly
    }
  }

  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 15;

  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(ip, record);
  }

  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

/**
 * Record an OTP verification attempt for a phone number.
 * Allows maximum 5 failed attempts per OTP code window.
 */
export function recordOtpVerificationAttempt(phone: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const maxAttempts = 5;
  const ttlMs = 10 * 60 * 1000;

  let record = otpVerifyAttemptMap.get(phone);
  if (!record || now > record.expiresAt) {
    record = { attempts: 0, expiresAt: now + ttlMs };
    otpVerifyAttemptMap.set(phone, record);
  }

  record.attempts += 1;
  const remaining = Math.max(0, maxAttempts - record.attempts);

  if (record.attempts > maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }

  return { allowed: true, remainingAttempts: remaining };
}

/**
 * Aliases for backwards compatibility with Phase 2 verification handlers
 */
export function checkAndIncrementVerifyAttempts(phone: string): { allowed: boolean; attemptsLeft: number } {
  const res = recordOtpVerificationAttempt(phone);
  return { allowed: res.allowed, attemptsLeft: res.remainingAttempts };
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
