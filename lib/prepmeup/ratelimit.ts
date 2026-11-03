import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkAndIncrementDurableRateLimit } from "@/app/prepmeup/_lib/trackStore";

export type RateLimitType =
  | "otp_send"
  | "otp_verify"
  | "early_adopter_claim"
  | "quantum_checkout"
  | "ai_tutor"
  | "ai_doubts"
  | "cert_pdf"
  | "cert_verify"
  | "public_stats";

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  windowSeconds: number;
  upstashWindow: `${number} m` | `${number} h` | `${number} s`;
}

export const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
  // 1. OTP send: max 3 per phone/IP per 10 minutes
  otp_send: { requests: 3, windowMs: 10 * 60 * 1000, windowSeconds: 600, upstashWindow: "10 m" },
  // 2. OTP verify: max 5 attempts per OTP request
  otp_verify: { requests: 5, windowMs: 10 * 60 * 1000, windowSeconds: 600, upstashWindow: "10 m" },
  // 3. Early-adopter claim: max 5 attempts per user/IP per hour
  early_adopter_claim: { requests: 5, windowMs: 60 * 60 * 1000, windowSeconds: 3600, upstashWindow: "1 h" },
  // 4. Quantum checkout: max 10 attempts per user/IP per hour
  quantum_checkout: { requests: 10, windowMs: 60 * 60 * 1000, windowSeconds: 3600, upstashWindow: "1 h" },
  // 5. AI tutor / doubts: max 20 requests per student/IP per 10 minutes
  ai_tutor: { requests: 20, windowMs: 10 * 60 * 1000, windowSeconds: 600, upstashWindow: "10 m" },
  ai_doubts: { requests: 20, windowMs: 10 * 60 * 1000, windowSeconds: 600, upstashWindow: "10 m" },
  // 6. Certificate PDF generation: max 10 requests per user per hour
  cert_pdf: { requests: 10, windowMs: 60 * 60 * 1000, windowSeconds: 3600, upstashWindow: "1 h" },
  // 7. Public certificate verification: max 30 requests per IP per minute
  cert_verify: { requests: 30, windowMs: 60 * 1000, windowSeconds: 60, upstashWindow: "1 m" },
  // 8. Public stats: max 60 requests per IP per minute
  public_stats: { requests: 60, windowMs: 60 * 1000, windowSeconds: 60, upstashWindow: "1 m" },
};

let redisClient: Redis | null = null;
let ratelimiters: Partial<Record<RateLimitType, Ratelimit>> = {};

function getUpstashLimiter(type: RateLimitType): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }

  if (!ratelimiters[type]) {
    const config = RATE_LIMIT_CONFIGS[type];
    ratelimiters[type] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(config.requests, config.upstashWindow),
      analytics: true,
      prefix: `pmu_ratelimit_${type}`,
    });
  }

  return ratelimiters[type] || null;
}

export interface CheckRateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  retryAfterSec?: number;
}

/**
 * Checks rate limiting via Upstash Redis if configured,
 * otherwise falls back seamlessly to PostgreSQL `pmu_rate_limit_events` table,
 * and finally to atomic TrackStore state.
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType
): Promise<CheckRateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  const now = Date.now();
  const sanitizedId = identifier.trim().toLowerCase() || "anonymous";

  // 1. Try Upstash Redis
  const upstashLimiter = getUpstashLimiter(type);
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(sanitizedId);
      const retryAfterSec = res.success
        ? undefined
        : Math.max(1, Math.ceil((res.reset - now) / 1000));
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
        retryAfterSec,
      };
    } catch (err) {
      console.warn("[pmu_ratelimit] Upstash call failed, falling back to Postgres:", err);
    }
  }

  // 2. Fallback to Postgres `pmu_rate_limit_events` table
  try {
    const supabase = createPmuServiceClient();
    if (supabase) {
      const { data: record, error } = await supabase
        .from("pmu_rate_limit_events")
        .select("id, count, window_start, expires_at")
        .eq("bucket_key", type)
        .eq("identifier", sanitizedId)
        .maybeSingle();

      if (!error) {
        if (!record || new Date(record.expires_at).getTime() <= now) {
          const expiresAtIso = new Date(now + config.windowMs).toISOString();
          await supabase.from("pmu_rate_limit_events").upsert(
            {
              bucket_key: type,
              identifier: sanitizedId,
              count: 1,
              window_start: new Date(now).toISOString(),
              expires_at: expiresAtIso,
            },
            { onConflict: "bucket_key,identifier" }
          );
          return {
            success: true,
            remaining: config.requests - 1,
            reset: now + config.windowMs,
          };
        }

        if (record.count >= config.requests) {
          const retryAfterSec = Math.max(
            1,
            Math.ceil((new Date(record.expires_at).getTime() - now) / 1000)
          );
          return {
            success: false,
            remaining: 0,
            reset: new Date(record.expires_at).getTime(),
            retryAfterSec,
          };
        }

        await supabase
          .from("pmu_rate_limit_events")
          .update({ count: record.count + 1 })
          .eq("id", record.id);

        return {
          success: true,
          remaining: Math.max(0, config.requests - (record.count + 1)),
          reset: new Date(record.expires_at).getTime(),
        };
      }
    }
  } catch {
    // Proceed to TrackStore atomic fallback
  }

  // 3. Fallback to atomic file-backed TrackStore
  const atomic = checkAndIncrementDurableRateLimit({
    bucketKey: type,
    identifier: sanitizedId,
    limit: config.requests,
    windowSeconds: config.windowSeconds,
  });

  return {
    success: atomic.allowed,
    remaining: atomic.remaining,
    reset: now + (atomic.retryAfterSec || config.windowSeconds) * 1000,
    retryAfterSec: atomic.retryAfterSec,
  };
}

// Re-export checkDurableRateLimit matching app/prepmeup/_lib/rateLimit signature
export async function checkDurableRateLimit(params: {
  bucketKey: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ allowed: boolean; remaining: number; retryAfterSec?: number }> {
  const result = await checkRateLimit(
    params.identifier,
    (params.bucketKey as RateLimitType) || "ai_doubts"
  );
  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfterSec: result.retryAfterSec,
  };
}
