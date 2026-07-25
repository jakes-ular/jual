/**
 * Best-effort in-process rate limiter. Vercel's own WAF rate-limit rule
 * covers login (the highest-value brute-force target), but the plan on this
 * project only allows one active WAF rate-limit rule — so other abuse-prone
 * endpoints (register, checkout, contact, appeals) are throttled here
 * instead. State is per-instance and resets on cold start, so this isn't a
 * hard guarantee under scale, but it stops the common case of a single
 * client hammering an endpoint.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
