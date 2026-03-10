import { NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

/**
 * Simple in-memory rate limiter.
 * @param key   Unique identifier (e.g. IP or userId + route)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds (default 60 s)
 * @returns null if allowed, or a 429 NextResponse if rate-limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): NextResponse | null {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  entry.count++
  return null
}

/**
 * Extract a client identifier from a request for rate-limiting.
 * Uses x-forwarded-for, x-real-ip, or falls back to a generic key.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown-client'
}
