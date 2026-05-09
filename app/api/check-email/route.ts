import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * Returns a constant response indicating the client should authenticate
 * (via magic link or OAuth) and re-check after sign-in. Avoids leaking
 * account existence (account-enumeration) and applies a rate limit.
 *
 * NOTE: this route is in the middleware PUBLIC_ROUTES allow-list because
 * it's used during the login flow before a session exists.
 */
export async function POST(request: NextRequest) {
  try {
    // Strict rate limit: 10 lookups per minute per client to slow enumeration.
    const rateLimited = rateLimit(`check-email:${getClientIp(request)}`, 10, 60_000)
    if (rateLimited) return rateLimited

    const { email } = await request.json().catch(() => ({}))

    if (typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ exists: false, error: 'Invalid email' }, { status: 400 })
    }

    // CONSTANT response — never reveal whether an account exists. The client
    // must authenticate (magic link / OAuth) and inspect its session/profile.
    return NextResponse.json({
      exists: false,
      onboardingCompleted: false,
      requiresAuth: true,
    })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { exists: false, error: 'Failed to check email' },
      { status: 500 }
    )
  }
}

