import { getInviteByToken, type InviteDetails } from '@/lib/workspace/store'

export async function resolveGuestInvite(
  token: string
): Promise<InviteDetails | null> {
  const trimmed = typeof token === 'string' ? token.trim() : ''
  if (!trimmed) return null
  return getInviteByToken(trimmed)
}
