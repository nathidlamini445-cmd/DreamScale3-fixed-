import type { TeamMember } from '@/lib/teams-types'

type WorkspaceApiMember = {
  id: string
  email: string
  display_name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'pending' | 'active' | 'removed'
}

function roleToWorkStyle(role: WorkspaceApiMember['role']): string {
  switch (role) {
    case 'owner':
      return 'decisive, strategic'
    case 'admin':
      return 'organized, process-driven'
    case 'viewer':
      return 'observant, advisory'
    default:
      return 'collaborative, hands-on'
  }
}

export function workspaceMemberToTeamMember(m: WorkspaceApiMember): TeamMember {
  const name =
    (m.display_name && m.display_name.trim()) ||
    m.email.split('@')[0] ||
    'Teammate'

  return {
    id: `ws-${m.id}`,
    name,
    role: m.role === 'owner' ? 'Founder / Owner' : m.role.charAt(0).toUpperCase() + m.role.slice(1),
    email: m.email,
    strengths: [],
    workStyle: roleToWorkStyle(m.role),
    communicationPreference: 'collaborative',
    skills: m.role === 'admin' ? ['Operations', 'Coordination'] : [],
    workload: m.status === 'pending' ? 0 : 50,
    performanceHistory: [],
  }
}

export async function fetchWorkspaceTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch('/api/workspace', { credentials: 'include', cache: 'no-store' })
  if (!res.ok) return []

  const data = (await res.json()) as {
    workspaces?: { members?: WorkspaceApiMember[] }[]
  }

  const seen = new Set<string>()
  const imported: TeamMember[] = []

  for (const ws of data.workspaces ?? []) {
    for (const m of ws.members ?? []) {
      if (m.status === 'removed') continue
      const key = m.email.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      imported.push(workspaceMemberToTeamMember(m))
    }
  }

  return imported
}

export function mergeTeamMembers(
  existing: TeamMember[],
  incoming: TeamMember[]
): { merged: TeamMember[]; added: number } {
  const byEmail = new Map(
    existing
      .filter((m) => m.email)
      .map((m) => [m.email!.toLowerCase(), m])
  )
  const byName = new Map(existing.map((m) => [m.name.toLowerCase(), m]))

  let added = 0
  const merged = [...existing]

  for (const member of incoming) {
    const emailKey = member.email?.toLowerCase()
    if (emailKey && byEmail.has(emailKey)) continue
    if (byName.has(member.name.toLowerCase())) continue
    merged.push(member)
    if (emailKey) byEmail.set(emailKey, member)
    byName.set(member.name.toLowerCase(), member)
    added++
  }

  return { merged, added }
}
