'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionSafe } from '@/lib/session-context'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { user, signOut } = useAuth()
  const sessionContext = useSessionSafe()

  if (!user) return null

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        // Clear session data
        if (sessionContext) {
          sessionContext.clearSession()
        }
        // Sign out from Supabase
        await signOut()
      } catch (error) {
        console.error('Error signing out:', error)
        alert('Failed to sign out. Please try again.')
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  )
}
