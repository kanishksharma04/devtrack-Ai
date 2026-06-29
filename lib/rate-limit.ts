import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

// ---------------------------------------------------------------------------
// In-memory fallback used when Redis is unavailable.
// This is per-instance and not globally enforced, but better than nothing.
// ---------------------------------------------------------------------------
const _inMemory = new Map<string, { count: number; resetAt: number }>();

function inMemoryCheck(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfter?: number; remaining?: number; limit?: number } {
  const now = Date.now();
  const entry = _inMemory.get(key);
  if (!entry || now > entry.resetAt) {
    _inMemory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, limit };
  }
  if (entry.count >= limit) {
    return {
      success: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      remaining: 0,
      limit,
    };
  }
  entry.count += 1;
  return { success: true, remaining: limit - entry.count, limit };
}

// ---------------------------------------------------------------------------
// Lazily-created Upstash limiters (reuse across warm invocations)
// ---------------------------------------------------------------------------
let _analyzeLimiter: Ratelimit | null = null;
let _syncLimiter: Ratelimit | null = null;

function getAnalyzeLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_analyzeLimiter) {
    const perHour = parseInt(process.env.RATE_LIMIT_ANALYZE_PER_HOUR || "5", 10);
    _analyzeLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(perHour, "1 h"),
      prefix: "rl:analyze",
      analytics: false,
    });
  }
  return _analyzeLimiter;
}

function getSyncLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_syncLimiter) {
    const perWindow = parseInt(process.env.RATE_LIMIT_SYNC_PER_10MIN || "3", 10);
    _syncLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(perWindow, "10 m"),
      prefix: "rl:sync",
      analytics: false,
    });
  }
  return _syncLimiter;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
  remaining?: number;
  limit?: number;
  reset?: number;
}

/**
 * Check the per-user sliding-window limit for /api/analyze.
 * Default: 5 requests per hour (configurable via RATE_LIMIT_ANALYZE_PER_HOUR).
 * Falls back to in-memory if Redis is unavailable (logs a warning).
 */
export async function checkAnalyzeLimit(userId: string): Promise<RateLimitResult> {
  const limiter = getAnalyzeLimiter();
  if (!limiter) {
    console.warn("[rate-limit] Redis unavailable — falling back to in-memory for analyze");
    const perHour = parseInt(process.env.RATE_LIMIT_ANALYZE_PER_HOUR || "5", 10);
    return inMemoryCheck(`analyze:${userId}`, perHour, 3_600_000);
  }
  const { success, limit, remaining, reset } = await limiter.limit(userId);
  return {
    success,
    limit,
    remaining,
    reset,
    retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
  };
}

/**
 * Check the per-user sliding-window limit for /api/sync.
 * Default: 3 requests per 10 minutes (configurable via RATE_LIMIT_SYNC_PER_10MIN).
 */
export async function checkSyncLimit(userId: string): Promise<RateLimitResult> {
  const limiter = getSyncLimiter();
  if (!limiter) {
    console.warn("[rate-limit] Redis unavailable — falling back to in-memory for sync");
    const perWindow = parseInt(process.env.RATE_LIMIT_SYNC_PER_10MIN || "3", 10);
    return inMemoryCheck(`sync:${userId}`, perWindow, 10 * 60_000);
  }
  const { success, limit, remaining, reset } = await limiter.limit(userId);
  return {
    success,
    limit,
    remaining,
    reset,
    retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
  };
}
