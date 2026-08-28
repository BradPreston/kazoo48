import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

// Module-level (per server process), not persisted anywhere — see the
// multi-instance caveat below.
const buckets = new Map<string, Bucket>();

// Sweep expired buckets occasionally so a long-lived process doesn't leak
// memory. This runs opportunistically on a check rather than on a timer,
// since serverless instances may not stay alive long enough for a timer
// to matter and short-lived ones don't need it at all.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanupAt = 0;

function cleanup(now: number) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  // Set by Vercel/most reverse proxies; the first entry is the original
  // client (later entries are proxies the request passed through).
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) return realIp;
  // No proxy header (e.g. local dev) — fall back to a shared bucket rather
  // than skipping the limit entirely.
  return "unknown";
}

/**
 * Minimal in-memory fixed-window rate limiter, keyed by client IP.
 *
 * This only limits requests seen by *this* server process: on a
 * multi-instance/serverless deployment each instance keeps its own counts
 * (so the effective limit is `limit * live instance count`), and it resets
 * on every cold start. That's an acceptable trade-off for a low-traffic
 * registration form — it stops naive scripted abuse without adding an
 * external dependency. If abuse becomes a real problem, swap this for a
 * shared store (e.g. Upstash Redis via `@upstash/ratelimit`) — every call
 * site takes just an action name, so nothing else has to change.
 */
export async function checkRateLimit(
  action: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<{ allowed: boolean }> {
  const ip = await getClientIp();
  const key = `${action}:${ip}`;
  const now = Date.now();
  cleanup(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false };
  }

  bucket.count += 1;
  return { allowed: true };
}
