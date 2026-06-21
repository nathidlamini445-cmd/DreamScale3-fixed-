'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { GuestHeader } from '@/components/guest/guest-header'
import { GuestSidebarNav } from '@/components/guest/guest-sidebar-nav'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

export function GuestAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, ready, loading } = useGuestWorkspace()

  useEffect(() => {
    document.documentElement.setAttribute('data-guest-page', 'true')
    document.body.setAttribute('data-guest-page', 'true')

    return () => {
      document.documentElement.removeAttribute('data-guest-page')
      document.body.removeAttribute('data-guest-page')
    }
  }, [])

  useEffect(() => {
    if (!ready || loading) return
    if (!session) {
      router.replace('/guest')
    }
  }, [ready, session, loading, router])

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#005DFF]" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-white dark:bg-slate-950 text-foreground">
      <GuestSidebarNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <GuestHeader />
        <main
          data-guest-main
          className="relative z-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
