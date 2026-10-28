import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export type RateLimitType = "otp_send" | "otp_verify" | "ai_doubts" | "public_stats";

interface RateLimitConfig {
  requests: number;
  windowMs: number;
  upstashWindow: `${number} m` | `${number} h` | `${number} s`;
}

const LIMITS: Record<RateLimitType, RateLimitConfig> = {
  // 3 requests per phone / IP per 10 minutes
  otp_send: { requests: 3, windowMs: 10 * 60 * 1000, upstashWindow: "10 m" },
  // 5 attempts per session before invalidation (10 minutes window)
  otp_verify: { requests: 5, windowMs: 10 * 60 * 1000, upstashWindow: "10 m" },
  // 15 AI doubts per student per hour
  ai_doubts: { requests: 15, windowMs: 60 * 60 * 1000, upstashWindow: "1 h" },
  // 60 requests per IP per minute
  public_stats: { requests: 60, windowMs: 60 * 1000, upstashWindow: "1 m" },
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
    const config = LIMITS[type];
    ratelimiters[type] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(config.requests, config.upstashWindow),
      analytics: true,
      prefix: `pmu_ratelimit_${type}`,
    });
  }

  return ratelimiters[type] || null;
}

/**
 * Checks rate limiting via Upstash Redis if configured,
 * otherwise falls back seamlessly to PostgreSQL `pmu_rate_limits` table.
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const config = LIMITS[type];
  const now = Date.now();

  // 1. Try Upstash Redis
  const upstashLimiter = getUpstashLimiter(type);
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("[pmu_ratelimit] Upstash call failed, falling back to Postgres:", err);
    }
  }

  // 2. Fallback to Postgres `pmu_rate_limits` table
  try {
    const supabase = createPmuServiceClient();
    if (!supabase) {
      // Allow if no DB available in local dev
      return { success: true, remaining: config.requests, reset: now + config.windowMs };
    }

    const windowStart = new Date(now - config.windowMs).toISOString();

    // Query active counter for this key and type within current window
    const { data: record, error } = await supabase
      .from("pmu_rate_limits")
      .select("id, count, first_request_at")
      .eq("identifier", identifier)
      .eq("limit_type", type)
      .maybeSingle();

    if (error) {
      // If table does not exist or errors, do not block the user
      return { success: true, remaining: config.requests, reset: now + config.windowMs };
    }

    if (!record) {
      // First hit
      await supabase.from("pmu_rate_limits").insert({
        identifier,
        limit_type: type,
        count: 1,
        first_request_at: new Date(now).toISOString(),
      });
      return {
        success: true,
        remaining: config.requests - 1,
        reset: now + config.windowMs,
      };
    }

    const firstRequestTime = new Date(record.first_request_at).getTime();
    if (now - firstRequestTime > config.windowMs) {
      // Window expired, reset window
      await supabase
        .from("pmu_rate_limits")
        .update({
          count: 1,
          first_request_at: new Date(now).toISOString(),
        })
        .eq("id", record.id);

      return {
        success: true,
        remaining: config.requests - 1,
        reset: now + config.windowMs,
      };
    }

    // Window active
    if (record.count >= config.requests) {
      return {
        success: false,
        remaining: 0,
        reset: firstRequestTime + config.windowMs,
      };
    }

    // Increment count
    await supabase
      .from("pmu_rate_limits")
      .update({
        count: record.count + 1,
      })
      .eq("id", record.id);

    return {
      success: true,
      remaining: config.requests - (record.count + 1),
      reset: firstRequestTime + config.windowMs,
    };
  } catch (pgErr) {
    console.error("[pmu_ratelimit] Postgres fallback failed:", pgErr);
    // Graceful fallback: allow request
    return { success: true, remaining: config.requests, reset: now + config.windowMs };
  }
}
