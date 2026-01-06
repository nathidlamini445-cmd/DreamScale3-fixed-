'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type UserProfile = {
  id: string
  email: string | null
  full_name: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  onboardingCompleted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if current path is a public route (doesn't require auth)
  const isPublicRoute = pathname === '/login'

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [])

  // Check auth state and fetch profile
  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      if (!supabase) {
        if (mounted) {
          setLoading(false)
        }
        return
      }
      
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
            // Fetch user profile
            const userProfile = await fetchUserProfile(currentSession.user.id)
            if (mounted) {
              setProfile(userProfile)
            }
          } else {
            setProfile(null)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for auth state changes
    if (!supabase) {
      return
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
      if (!mounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        // Wait a moment for the trigger to create the profile if it's a new user
        if (event === 'SIGNED_IN') {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Fetch user profile
        const userProfile = await fetchUserProfile(currentSession.user.id)
        if (mounted) {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  // Redirect unauthenticated users to login (except on public routes)
  useEffect(() => {
    if (loading) return

    if (!user && !isPublicRoute) {
      router.push('/login')
    }
  }, [user, loading, isPublicRoute, router])

  const signOut = useCallback(async () => {
    if (!supabase) {
      router.push('/login')
      return
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      setUser(null)
      setProfile(null)
      setSession(null)
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [router])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signOut,
    onboardingCompleted: profile?.onboarding_completed ?? false
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF]"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

