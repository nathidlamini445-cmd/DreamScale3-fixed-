export const WORKSPACE_COLLABORATOR_ROLES = ['member', 'admin', 'viewer'] as const

export type WorkspaceCollaboratorRole = (typeof WORKSPACE_COLLABORATOR_ROLES)[number]

export type WorkspaceMemberRole = 'owner' | WorkspaceCollaboratorRole

export function isCollaboratorRole(
  role: string
): role is WorkspaceCollaboratorRole {
  return (WORKSPACE_COLLABORATOR_ROLES as readonly string[]).includes(role)
}

export function workspaceRoleLabel(role: string): string {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'admin':
      return 'Admin'
    case 'viewer':
      return 'Viewer'
    case 'member':
    default:
      return 'Member'
  }
}
