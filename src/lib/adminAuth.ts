/**
 * Admin authorization + a lightweight in-memory rate limiter.
 *
 * The rate limiter is per-server-instance and best-effort — it exists to
 * stop accidental hammering of paid third-party APIs from the import
 * routes, not as a hardened security boundary. For real abuse protection
 * put the import routes behind proper auth or a gateway.
 */
import { NextRequest, NextResponse } from "next/server";

/** Extracts the admin token from a request (header or query param). */
export function getAdminToken(req: NextRequest): string | null {
  return (
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token") ??
    null
  );
}

/**
 * Returns a 401 NextResponse if the request is not authorized, else null.
 *
 * If ADMIN_TOKEN is unset we allow access ONLY in development, and refuse
 * in production so a misconfigured deploy never exposes the admin surface.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Admin is disabled: ADMIN_TOKEN is not set on the server." },
        { status: 503 }
      );
    }
    return null; // dev convenience only
  }
  if (getAdminToken(req) !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/* ── rate limiter ─────────────────────────────────────────────────── */
const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding-window-ish limiter. Returns a 429 response if the key has
 * exceeded `limit` calls within `windowMs`, else null.
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
