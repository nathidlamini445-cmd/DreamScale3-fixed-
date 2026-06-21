'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearGuestWorkspaceSession,
  loadGuestWorkspaceSession,
  saveGuestWorkspaceSession,
  type GuestWorkspaceSession,
} from '@/lib/workspace/guest-session'
import type { WorkspaceCollaboratorRole } from '@/lib/workspace/roles'

export type GuestTeammate = {
  id: string
  displayName: string
  role: string
  roleLabel: string
  joinedAt: string | null
}

export type GuestWorkspaceState = {
  session: GuestWorkspaceSession | null
  memberId: string | null
  role: WorkspaceCollaboratorRole | 'owner'
  roleLabel: string
  teammates: GuestTeammate[]
  loading: boolean
  ready: boolean
  refresh: () => Promise<void>
  updateDisplayName: (name: string) => Promise<boolean>
  signOut: () => void
}

const GuestWorkspaceContext = createContext<GuestWorkspaceState | null>(null)

export function GuestWorkspaceProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GuestWorkspaceSession | null>(() => {
    if (typeof window === 'undefined') return null
    return loadGuestWorkspaceSession()
  })
  const [memberId, setMemberId] = useState<string | null>(null)
  const [role, setRole] = useState<WorkspaceCollaboratorRole | 'owner'>('member')
  const [roleLabel, setRoleLabel] = useState('Member')
  const [teammates, setTeammates] = useState<GuestTeammate[]>([])
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const loaded = loadGuestWorkspaceSession()
    setSession(loaded)
    if (!loaded?.inviteToken) {
      setReady(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/guest/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: loaded.inviteToken }),
      })
      if (!res.ok) {
        // Keep local guest session so navigation still works if the API hiccups
        setSession(loaded)
        return
      }
      const data = await res.json()
      const nextSession: GuestWorkspaceSession = {
        ...loaded,
        workspaceName: data.workspaceName ?? loaded.workspaceName,
        displayName: data.displayName ?? loaded.displayName,
      }
      saveGuestWorkspaceSession(nextSession)
      setSession(nextSession)
      setMemberId(data.memberId ?? null)
      setRole(
        data.role === 'admin' || data.role === 'viewer' || data.role === 'owner'
          ? data.role
          : 'member'
      )
      setRoleLabel(data.roleLabel ?? 'Member')
      setTeammates(data.teammates ?? [])
    } catch {
      /* keep local session */
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateDisplayName = useCallback(
    async (name: string): Promise<boolean> => {
      if (!session?.inviteToken || !name.trim()) return false
      const res = await fetch('/api/guest/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteToken: session.inviteToken,
          displayName: name.trim(),
        }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const updated = { ...session, displayName: data.displayName as string }
      saveGuestWorkspaceSession(updated)
      setSession(updated)
      await refresh()
      return true
    },
    [session, refresh]
  )

  const signOut = useCallback(() => {
    clearGuestWorkspaceSession()
    setSession(null)
    window.location.href = '/login'
  }, [])

  const value = useMemo(
    () => ({
      session,
      memberId,
      role,
      roleLabel,
      teammates,
      loading,
      ready,
      refresh,
      updateDisplayName,
      signOut,
    }),
    [
      session,
      memberId,
      role,
      roleLabel,
      teammates,
      loading,
      ready,
      refresh,
      updateDisplayName,
      signOut,
    ]
  )

  return (
    <GuestWorkspaceContext.Provider value={value}>{children}</GuestWorkspaceContext.Provider>
  )
}

export function useGuestWorkspace(): GuestWorkspaceState {
  const ctx = useContext(GuestWorkspaceContext)
  if (!ctx) {
    throw new Error('useGuestWorkspace must be used within GuestWorkspaceProvider')
  }
  return ctx
}

export function useGuestWorkspaceSafe(): GuestWorkspaceState | null {
  return useContext(GuestWorkspaceContext)
}
