import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email?: string
}

/**
 * Verifies the Supabase session from cookies and returns the authenticated user.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return { id: user.id, email: user.email }
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
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    }
  }
  return { user }
}
