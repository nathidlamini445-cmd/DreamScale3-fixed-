'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionSafe } from '@/lib/session-context'
import { LogOut, Loader2 } from 'lucide-react'

/** Single path: clear app session context, then AuthProvider signOut (Supabase + storage + redirect). */
export function LogoutButton() {
  const { signOut: authSignOut } = useAuth()
  const sessionContext = useSessionSafe()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      sessionContext?.clearSession()
      await authSignOut()
    } catch (error) {
      console.error('Error during logout:', error)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/login')
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void handleLogout(e)
      }}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      type="button"
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </>
      )}
    </Button>
  )
}
