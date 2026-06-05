import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { guardMonthlyFeature } from './guard'
import type { MonthlyUsageBucket } from './types'
import type { AuthenticatedUser } from '@/lib/auth-guard'

export async function requireMonthlyQuota(
  bucket: MonthlyUsageBucket
): Promise<
  | { user: AuthenticatedUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  const authResult = await requireAuth()
  if (authResult.error) return { error: authResult.error }
  const quotaDenied = await guardMonthlyFeature(authResult.user.id, bucket)
  if (quotaDenied) return { error: quotaDenied }
  return { user: authResult.user }
}
