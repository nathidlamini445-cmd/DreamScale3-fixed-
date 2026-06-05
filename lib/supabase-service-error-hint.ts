/**
 * Maps Supabase PostgREST / GoTrue-ish errors to actionable hints for operators.
 */
export function hintForSupabaseServiceError(message: string): string | undefined {
  const m = (message || '').toLowerCase()
  if (
    m.includes('invalid api key') ||
    m.includes('api key') ||
    m.includes('jwt') ||
    m.includes('invalid bearer') ||
    m.includes('jwt secret')
  ) {
    return (
      'Set SUPABASE_SERVICE_ROLE_KEY in .env.local to the service_role secret from Supabase → Project Settings → API. ' +
      'It must not be the anon/public key. Use one line, no quotes, no trailing spaces. Restart npm run dev after saving.'
    )
  }
  if (
    m.includes('uuid') ||
    m.includes('foreign key') ||
    m.includes('fkey') ||
    m.includes('violates foreign key')
  ) {
    return (
      'If user IDs are Clerk strings (user_…), run supabase-clerk-user-id-user-sessions.sql in the Supabase SQL editor.'
    )
  }
  return undefined
}
