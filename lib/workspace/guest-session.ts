export type GuestWorkspaceSession = {
  inviteToken: string
  workspaceId: string
  workspaceName: string
  email: string
  displayName: string
  joinedAt: string
}

export const GUEST_WORKSPACE_STORAGE_KEY = 'dreamscale_guest_workspace'

export function saveGuestWorkspaceSession(session: GuestWorkspaceSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_WORKSPACE_STORAGE_KEY, JSON.stringify(session))
}

export function loadGuestWorkspaceSession(): GuestWorkspaceSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GUEST_WORKSPACE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GuestWorkspaceSession
  } catch {
    return null
  }
}

export function clearGuestWorkspaceSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_WORKSPACE_STORAGE_KEY)
}
