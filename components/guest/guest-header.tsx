'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

export function GuestHeader() {
  const { session, roleLabel, signOut } = useGuestWorkspace()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">Signed in as guest</p>
        <p className="font-semibold text-gray-900 dark:text-white">
          {session?.displayName ?? 'Guest'}
          <span className="ml-2 text-xs font-medium text-[#005DFF] uppercase tracking-wide">
            {roleLabel}
          </span>
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-500">
        <LogOut className="w-4 h-4 mr-2" />
        Leave workspace
      </Button>
    </header>
  )
}
