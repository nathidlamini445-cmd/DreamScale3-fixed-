'use client'

import { createBrowserClient } from '@supabase/ssr'

let warnedMissingEnv = false

function assertEnv(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (url && key) return

  const msg =
    'DreamScale: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — add them to .env.local'

  console.error(msg)

  if (typeof window !== 'undefined' && !warnedMissingEnv) {
    warnedMissingEnv = true
    alert(
      `${msg}\n\nRestart the dev server after saving .env.local.\nDocs: Supabase Dashboard → Settings → API.`
    )
  }

  throw new Error(msg)
}

/**
 * Browser Supabase client (PKCE, cookie-backed session chunks for SSR).
 */
export function createClient() {
  assertEnv()
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  )
}
