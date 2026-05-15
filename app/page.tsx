'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Root URL is a lightweight entry point only (no dashboard bundle).
 * Unauthenticated visitors always see /login first; signed-in visitors go through /auth/resolve.
 */
export default function RootEntryPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [label, setLabel] = useState('Loading…')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (cancelled) return
        if (session?.user) {
          setLabel('Signing you in…')
          router.replace('/auth/resolve')
        } else {
          router.replace('/login')
        }
      } catch {
        if (!cancelled) router.replace('/login')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
