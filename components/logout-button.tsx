'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionSafe } from '@/lib/session-context'
import { LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function LogoutButton() {
  const { user, signOut: authSignOut, loading } = useAuth()
  const sessionContext = useSessionSafe()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  // Check for session in multiple places - always show logout button if ANY session exists
  useEffect(() => {
    // Check AuthContext user
    if (user) {
      setHasSession(true)
      return
    }

    // Check session context
    if (sessionContext?.sessionData?.email) {
      setHasSession(true)
      return
    }

    // Check localStorage for any session data
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('dreamscale_session')
      const currentEmail = localStorage.getItem('dreamscale_current_email')
      if (sessionData || currentEmail) {
        setHasSession(true)
        return
      }
    }

    // If auth is still loading, wait a bit
    if (loading) {
      return
    }

    // Only hide if we're sure there's no session
    setHasSession(false)
  }, [user, sessionContext?.sessionData?.email, loading])

  const handleLogout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🔴 Logout button clicked!', { user: !!user, hasSession: hasSession })
    
    // Prevent default and stop propagation to avoid double-clicks
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Prevent multiple simultaneous logout attempts
    if (isLoggingOut) {
      console.log('⚠️ Logout already in progress, ignoring duplicate click')
      return
    }
    
    setIsLoggingOut(true)
    console.log('🔴 Logging out...')
    
    try {
      // Step 1: Clear session context first
      if (sessionContext) {
        sessionContext.clearSession()
      }
      
      // Step 2: Sign out from Supabase
      if (supabase) {
        try {
          await supabase.auth.signOut()
          console.log('✅ Signed out from Supabase')
        } catch (supabaseError) {
          console.error('Error signing out from Supabase:', supabaseError)
          // Continue with logout even if Supabase signOut fails
        }
      }
      
      // Step 3: Clear all localStorage and sessionStorage
      if (typeof window !== 'undefined') {
        // Clear all DreamScale-related data
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('dreamscale_') || 
              key.startsWith('hypeos:') || 
              key.startsWith('bizora:') ||
              key === 'onboardingCompleted' ||
              key === 'onboardingData') {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
        console.log('✅ Cleared all storage')
      }
      
      // Step 4: Use AuthContext signOut if available (it will clear state)
      if (authSignOut) {
        await authSignOut()
        console.log('✅ AuthContext signOut completed')
      }
      
      // Step 5: Force redirect to login page
      console.log('🔄 Redirecting to /login')
      if (typeof window !== 'undefined') {
        // Use replace to prevent back button from going to previous page
        window.location.replace('/login')
      }
    } catch (error) {
      console.error('❌ Error during logout:', error)
      // Even on error, clear everything and redirect
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
        handleLogout(e)
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
