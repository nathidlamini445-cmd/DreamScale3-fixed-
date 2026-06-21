/** Public URL paths for Venture Quest (formerly /hypeos). */
export const VENTURE_QUEST_BASE = '/venture-quest'

export function ventureQuestPath(subpath = ''): string {
  if (!subpath) return VENTURE_QUEST_BASE
  const normalized = subpath.startsWith('/') ? subpath.slice(1) : subpath
  return `${VENTURE_QUEST_BASE}/${normalized}`
}
