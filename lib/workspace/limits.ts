/** Workspace & collaborator limits by plan */

export const FREE_MAX_WORKSPACES = 1
export const PRO_MAX_WORKSPACES = 20

/** Invited collaborators (owner does not count) */
export const FREE_MAX_COLLABORATORS = 1
export const PRO_MAX_COLLABORATORS = 50

export function maxWorkspacesForPlan(isPro: boolean): number {
  return isPro ? PRO_MAX_WORKSPACES : FREE_MAX_WORKSPACES
}

export function maxCollaboratorsForPlan(isPro: boolean): number {
  return isPro ? PRO_MAX_COLLABORATORS : FREE_MAX_COLLABORATORS
}
