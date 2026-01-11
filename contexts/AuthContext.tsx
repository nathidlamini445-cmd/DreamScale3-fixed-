'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
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
  authResolved: boolean // CRITICAL: Explicit auth resolution state
  signOut: () => Promise<void>
  onboardingCompleted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authResolved, setAuthResolved] = useState(false) // CRITICAL: Explicit auth resolution state

  // Fetch user profile from database - Always fresh (no cache for critical checks)
  const fetchUserProfile = useCallback(async (userId: string, useCache: boolean = true) => {
    try {
      // Check cache first (only if useCache is true)
      if (useCache && typeof window !== 'undefined') {
        const cacheKey = `profile_${userId}`
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            // Use cache if less than 5 seconds old
            if (parsed.timestamp && Date.now() - parsed.timestamp < 5000) {
              return parsed.data as UserProfile
            }
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      // Always fetch fresh from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 means no rows returned - profile doesn't exist (new user)
        if (error.code === 'PGRST116') {
          return null
        }
        return null
      }

      // Cache the result (only if useCache is true)
      if (useCache && typeof window !== 'undefined' && data) {
        const cacheKey = `profile_${userId}`
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }))
        } catch (e) {
          // Storage quota exceeded, clear old cache
          try {
            const keys = Object.keys(sessionStorage)
            keys.forEach(key => {
              if (key.startsWith('profile_')) {
                sessionStorage.removeItem(key)
              }
            })
            // Retry
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data,
              timestamp: Date.now()
            }))
          } catch (e2) {
            // Still failed, continue without cache
          }
        }
      }

      return data as UserProfile
    } catch (error) {
      return null
    }
  }, [])

  // Create user profile if it doesn't exist
  const ensureProfileExists = useCallback(async (user: User) => {
    try {
      // Check if profile exists
      const existingProfile = await fetchUserProfile(user.id)
      
      if (existingProfile) {
        return existingProfile
      }

      // Profile doesn't exist - create it
      console.log('🆕 Creating new user profile for:', user.id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          onboarding_completed: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      console.log('✅ Created new user profile:', data.id)
      return data as UserProfile
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
      return null
    }
  }, [fetchUserProfile])

  // Check auth state and fetch profile - CRITICAL: Wait for full resolution
  useEffect(() => {
    let mounted = true

    // CRITICAL: Set authResolved to false at start
    setAuthResolved(false)

    // Maximum timeout: 10 seconds (increased to allow session restoration and magic link processing)
    const globalTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Auth check timed out after 10 seconds - marking as resolved')
        setLoading(false)
        setAuthResolved(true)
      }
    }, 10000)

    const checkAuth = async () => {
      if (!supabase) {
        if (mounted) {
          setLoading(false)
          setAuthResolved(true)
        }
        return
      }
      
      try {
        // CRITICAL: Wait for getSession to fully resolve (no timeout race)
        // This ensures session restoration completes before routing
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            setAuthResolved(true) // CRITICAL: Mark as resolved even on error
          }
          return
        }

        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
            // CRITICAL: Fetch profile fresh (no cache) to ensure latest onboarding status
            try {
              // Wait a moment for any database triggers
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Fetch profile fresh (no cache)
              let userProfile = await fetchUserProfile(currentSession.user.id, false)
              
              // If no profile found, create it
              if (!userProfile) {
                userProfile = await ensureProfileExists(currentSession.user)
              }
              
              if (mounted) {
                setProfile(userProfile)
              }
            } catch (profileError) {
              console.error('Error fetching/creating profile:', profileError)
              // Continue without profile - RouteGuard will handle
            }
          } else {
            setProfile(null)
          }

          // CRITICAL: Only mark as resolved after everything is set
          setLoading(false)
          setAuthResolved(true)
          console.log('✅ [AuthContext] Initial auth state resolved:', {
            hasUser: !!currentSession?.user,
            userId: currentSession?.user?.id
          })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          setLoading(false)
          setAuthResolved(true) // CRITICAL: Mark as resolved even on error
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
      clearTimeout(globalTimeout)
    }

    // Listen for auth state changes
    if (!supabase) {
      return
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
      if (!mounted) return

      // CRITICAL: Handle SIGNED_OUT event explicitly to clear state immediately
      if (event === 'SIGNED_OUT') {
        console.log('🔴 SIGNED_OUT event detected - clearing all auth state')
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        setAuthResolved(true)
        return
      }

      // CRITICAL: On SIGNED_IN, mark as loading until profile is fetched
      if (event === 'SIGNED_IN') {
        setLoading(true)
        setAuthResolved(false)
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        // CRITICAL: On SIGNED_IN, always clear cache and refetch profile fresh
        if (event === 'SIGNED_IN') {
          // Clear profile cache to force fresh fetch
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem(`profile_${currentSession.user.id}`)
            } catch (e) {
              // Ignore cache clear errors
            }
          }
          
          // Wait a moment for any database triggers
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Sync Google profile data (name and email) to user_profiles table
          try {
            const googleName = currentSession.user.user_metadata?.full_name || 
                              currentSession.user.user_metadata?.name ||
                              null
            const googleEmail = currentSession.user.email || null

            // CRITICAL: Always fetch profile fresh (bypass cache)
            const { data: existingProfile, error: fetchError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single()
            
            // If profile doesn't exist, create it
            if (fetchError?.code === 'PGRST116' || !existingProfile) {
              console.log('🆕 [AUTH] Profile does not exist - creating profile')
              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: currentSession.user.id,
                  email: googleEmail,
                  full_name: googleName,
                  onboarding_completed: false
                })
                .select()
                .single()
              
              if (createError) {
                console.error('Error creating profile:', createError)
            } else {
              console.log('✅ [AUTH] Created new user profile')
              if (mounted) {
                setProfile(newProfile as UserProfile)
                setLoading(false)
                setAuthResolved(true)
              }
            }
            } else {
              // Profile exists - update if needed and set profile
              const needsUpdate = 
                (googleName && existingProfile.full_name !== googleName) ||
                (googleEmail && existingProfile.email !== googleEmail) ||
                (!existingProfile.full_name && googleName) ||
                (!existingProfile.email && googleEmail)

              if (needsUpdate) {
                const updateData: { full_name?: string | null; email?: string | null } = {}
                
                if (googleName && existingProfile.full_name !== googleName) {
                  updateData.full_name = googleName
                }
                
                if (googleEmail && existingProfile.email !== googleEmail) {
                  updateData.email = googleEmail
                }

                if (Object.keys(updateData).length > 0) {
                  const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update(updateData)
                    .eq('id', currentSession.user.id)

                  if (updateError) {
                    console.error('Error updating profile with Google data:', updateError)
                  }
                }
              }
              
              // CRITICAL: Always set profile (fresh from DB, not cache)
              if (mounted) {
                setProfile(existingProfile as UserProfile)
                setLoading(false)
                setAuthResolved(true)
                console.log('✅ [AuthContext] Profile loaded after SIGNED_IN:', {
                  userId: currentSession.user.id,
                  onboardingCompleted: existingProfile.onboarding_completed
                })
              }
            }
          } catch (error) {
            console.error('Error syncing Google profile data:', error)
            // Fallback: try to ensure profile exists
            const fallbackProfile = await ensureProfileExists(currentSession.user)
            if (mounted) {
              setProfile(fallbackProfile)
              setLoading(false)
              setAuthResolved(true)
            }
          }
        } else {
          // For other events (TOKEN_REFRESHED, etc.), fetch or create profile
          await new Promise(resolve => setTimeout(resolve, 500))
          const userProfile = await ensureProfileExists(currentSession.user)
          if (mounted) {
            setProfile(userProfile)
            setLoading(false)
            setAuthResolved(true)
          }
        }
      } else {
        // No user - mark as resolved
        if (mounted) {
          setProfile(null)
          setLoading(false)
          setAuthResolved(true)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, ensureProfileExists])

  // REMOVED: All redirect logic removed - individual pages handle their own auth checks
  // Home page checks auth and redirects to /login or /onboarding as needed
  // Onboarding page checks auth and redirects to /login if not authenticated

  const signOut = useCallback(async () => {
    console.log('🔴 SignOut called - clearing all state and redirecting to landing page')
    
    try {
      // Step 1: Clear all local state first
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Step 2: Sign out from Supabase
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Error signing out:', error)
          // Continue with redirect even if signOut fails
        } else {
          console.log('✅ Successfully signed out from Supabase')
        }
      }

      // Step 3: Clear all state
      setUser(null)
      setProfile(null)
      setSession(null)
      
      console.log('✅ All state cleared, redirecting to login page')
      
      // Step 4: Force redirect to login page using window.location
      console.log('🔄 Redirecting to /login using window.location.replace')
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Even on error, clear state and redirect
      setUser(null)
      setProfile(null)
      setSession(null)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('🔄 Redirecting to /login using window.location.replace (error case)')
        window.location.replace('/login')
      }
    }
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  // CRITICAL: onboardingCompleted must be computed from profile.onboarding_completed
  // This ensures RouteGuard always has the correct value
  const value: AuthContextType = React.useMemo(() => {
    const completed = profile?.onboarding_completed === true
    return {
      user,
      profile,
      session,
      loading,
      authResolved,
      signOut,
      onboardingCompleted: completed
    }
  }, [user, profile, session, loading, authResolved, signOut])

  // CRITICAL: Always provide the context value, even during loading
  // This ensures useAuth() never throws an error, preventing "fewer hooks" errors
  // RouteGuard will handle routing, so we don't need loading screen here
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

