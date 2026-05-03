/**
 * rate-limit.ts
 * Lightweight in-process sliding-window rate limiter.
 *
 * Limits each userId to `maxRequests` POST requests within a `windowMs`
 * rolling window. Uses a globalThis-guarded Map so the counter survives
 * Next.js hot-reloads in development without resetting.
 *
 * For production at scale, replace this with a Redis-backed solution
 * (e.g. @upstash/ratelimit) — this implementation is single-instance only.
 */

interface WindowEntry {
  count: number;
  windowStart: number;
}

const globalForRL = globalThis as unknown as { rlStore?: Map<string, WindowEntry> };
const store: Map<string, WindowEntry> = globalForRL.rlStore ?? new Map();
if (process.env.NODE_ENV !== "production") globalForRL.rlStore = store;

export interface RateLimitOptions {
  /** Rolling window duration in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
  /** Maximum requests allowed per window per key. Default: 10. */
  maxRequests?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (ms) when the window resets
}

/**
 * Check whether `key` (typically a userId or IP) is within the rate limit.
 * Call this at the top of a route handler; return 429 if `allowed` is false.
 */
export function checkRateLimit(
  key: string,
  { windowMs = 60_000, maxRequests = 10 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}
