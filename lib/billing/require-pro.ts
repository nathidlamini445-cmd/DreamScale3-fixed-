import { NextResponse } from 'next/server'
import { requireAuth, type AuthenticatedUser } from '@/lib/auth-guard'
import { getProfileSubscriptionForUser } from '@/lib/billing/get-profile-subscription'

export async function requireProUser(): Promise<
  | { user: AuthenticatedUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  const authResult = await requireAuth()
  if (authResult.error) return { error: authResult.error }

  const { alreadyPro } = await getProfileSubscriptionForUser(authResult.user.id)
  if (!alreadyPro) {
    return {
      error: NextResponse.json(
        {
          error: 'DreamScale Pro is required for this feature.',
          code: 'PRO_REQUIRED',
        },
        { status: 403 }
      ),
    }
  }

  return { user: authResult.user }
}
