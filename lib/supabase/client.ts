'use client'

import { processLock } from '@supabase/auth-js'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Single browser-side GoTrue client per tab. A module-level cache avoids
 * duplicate clients if the bundler ever evaluates this module more than once.
 *
 * We use {@link processLock} instead of the default Navigator Lock API so React
 * Strict Mode / overlapping refresh + session calls don't throw
 * "Lock … was released because another request stole it" in dev.
 */
let browserClient: SupabaseClient | undefined

/**
 * Client-side Supabase client for:
 * - Client Components
 * - Client-side hooks
 *
 * Uses cookies for PKCE code verifier storage (accessible server-side)
 */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        lock: processLock,
      },
    }
  )
  return browserClient
}
