import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email?: string
}

/**
 * Verifies the Clerk session and returns the authenticated user.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const user = await currentUser()
    if (!user) return null
    const email = user.primaryEmailAddress?.emailAddress
    return { id: user.id, email: email ?? undefined }
  } catch {
    return null
  }
}

/**
 * Requires authentication on an API route. Returns a 401 response if not authenticated,
 * or the authenticated user if valid.
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getAuthenticatedUser()
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }
  return { user }
}
