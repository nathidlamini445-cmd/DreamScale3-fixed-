'use client'

/**
 * SINGLE AUTH RESOLVER - The ONLY place that makes auth routing decisions
 * 
 * This route:
 * 1. Checks session
 * 2. Fetches profile
 * 3. Decides: onboarding vs home vs login
 * 4. Redirects to the correct destination
 * 
 * NO OTHER FILE MAY MAKE AUTH-BASED REDIRECTS
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthResolvePage() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')
  const supabase = createClient()

  useEffect(() => {
    const resolveAuth = async () => {
      try {
        setStatus('Verifying session...')
        
        // Step 1: Get session (with timeout)
        let session = null
        try {
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 10000)
          )
          
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any
          session = result?.data?.session
        } catch (error) {
          console.error('❌ [AUTH RESOLVE] Session check failed:', error)
          router.replace('/login?error=session_check_failed')
          return
        }

        // Step 2: No session = redirect to login
        if (!session || !session.user) {
          console.log('🚫 [AUTH RESOLVE] No session - redirecting to login')
          router.replace('/login')
          return
        }

        setStatus('Loading profile...')
        
        // Step 3: Fetch or create profile
        // CRITICAL: Missing profile is NOT an error - it's a FIRST-TIME USER case
        let profile = null
        let profileExists = false
        
        console.log('🔍 [AUTH RESOLVE] Starting profile check for user:', {
          userId: session.user.id,
          email: session.user.email
        })
        
        // First, try to fetch existing profile
        const { data: fetchedProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, id, email, full_name')
          .eq('id', session.user.id)
          .single()
        
        console.log('🔍 [AUTH RESOLVE] Profile fetch result:', {
          hasProfile: !!fetchedProfile,
          errorCode: profileError?.code,
          errorMessage: profileError?.message,
          onboardingCompleted: fetchedProfile?.onboarding_completed
        })
        
        if (profileError?.code === 'PGRST116' || !fetchedProfile) {
          // Profile doesn't exist - this is NORMAL for first-time users (signup)
          // CRITICAL: This is NOT an error - it's expected behavior for signup
          console.log('🆕 [AUTH RESOLVE] Profile does not exist - FIRST-TIME USER (signup case)')
          console.log('🆕 [AUTH RESOLVE] Creating profile with onboarding_completed=false')
          setStatus('Creating profile...')
          
          // Immediately create profile using upsert (handles race conditions with database trigger)
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              onboarding_completed: false // CRITICAL: Always false for new users
            }, {
              onConflict: 'id'
            })
            .select()
            .single()
          
          if (createError) {
            // If duplicate key error, trigger likely created it - fetch it
            if (createError.code === '23505' || createError.message?.includes('duplicate')) {
              console.log('ℹ️ [AUTH RESOLVE] Profile already exists (likely created by trigger) - fetching it')
              // Wait a moment for trigger to complete, then fetch
              await new Promise(resolve => setTimeout(resolve, 500))
              
              const { data: triggerProfile } = await supabase
                .from('user_profiles')
                .select('onboarding_completed, id, email, full_name')
                .eq('id', session.user.id)
                .single()
              
              if (triggerProfile) {
                profile = triggerProfile
                profileExists = true
                console.log('✅ [AUTH RESOLVE] Profile found after trigger creation:', {
                  onboardingCompleted: profile.onboarding_completed,
                  type: typeof profile.onboarding_completed
                })
                // CRITICAL: Ensure onboarding_completed is false for new users
                // If trigger created it with wrong value, fix it
                if (profile.onboarding_completed === true) {
                  console.warn('⚠️ [AUTH RESOLVE] Profile has onboarding_completed=true but should be false - fixing it')
                  await supabase
                    .from('user_profiles')
                    .update({ onboarding_completed: false })
                    .eq('id', session.user.id)
                  profile.onboarding_completed = false
                  console.log('✅ [AUTH RESOLVE] Fixed onboarding_completed to false')
                }
              } else {
                // Still no profile - create a default one for routing
                console.warn('⚠️ [AUTH RESOLVE] Profile not found after trigger - using default')
                profile = { onboarding_completed: false }
              }
            } else {
              // Other error - log but continue with default (treat as first-time user)
              console.error('❌ [AUTH RESOLVE] Error creating profile:', createError)
              console.log('🆕 [AUTH RESOLVE] Treating as first-time user (onboarding_completed=false)')
              profile = { onboarding_completed: false }
            }
          } else if (newProfile) {
            // Profile created successfully
            profile = newProfile
            profileExists = true
            console.log('✅ [AUTH RESOLVE] Profile created successfully:', {
              id: profile.id,
              email: profile.email,
              onboardingCompleted: profile.onboarding_completed,
              type: typeof profile.onboarding_completed
            })
            // CRITICAL: Double-check onboarding_completed is false
            if (profile.onboarding_completed === true) {
              console.warn('⚠️ [AUTH RESOLVE] New profile has onboarding_completed=true - fixing to false')
              await supabase
                .from('user_profiles')
                .update({ onboarding_completed: false })
                .eq('id', session.user.id)
              profile.onboarding_completed = false
            }
          } else {
            // No profile returned - use default
            console.warn('⚠️ [AUTH RESOLVE] No profile returned from create - using default')
            profile = { onboarding_completed: false }
          }
        } else if (fetchedProfile) {
          // Profile exists - use it
          profile = fetchedProfile
          profileExists = true
          console.log('✅ [AUTH RESOLVE] Profile found:', {
            id: profile.id,
            email: profile.email,
            onboardingCompleted: profile.onboarding_completed,
            type: typeof profile.onboarding_completed
          })
          // CRITICAL: If profile exists but onboarding_completed is null/undefined, treat as false
          if (profile.onboarding_completed === null || profile.onboarding_completed === undefined) {
            console.warn('⚠️ [AUTH RESOLVE] Profile has null/undefined onboarding_completed - treating as false')
            profile.onboarding_completed = false
          }
        } else {
          // Fallback - should not happen, but treat as first-time user
          console.warn('⚠️ [AUTH RESOLVE] Unexpected state - no profile found or created')
          profile = { onboarding_completed: false }
        }
        
        // CRITICAL: Ensure we have a profile object (even if just default)
        // Missing profile is treated as first-time user (onboarding_completed=false)
        if (!profile) {
          console.warn('⚠️ [AUTH RESOLVE] No profile object - defaulting to first-time user')
          profile = { onboarding_completed: false }
        }

        // Step 4: Make routing decision
        // CRITICAL: Only route to home if onboarding_completed is EXPLICITLY true
        // All other cases (false, null, undefined) → route to onboarding
        const isOnboarded = profile?.onboarding_completed === true

        console.log('🔍 [AUTH RESOLVE] Final routing decision:', {
          userId: session.user.id,
          email: session.user.email,
          hasProfile: !!profile,
          profileId: profile?.id,
          onboardingCompleted: profile?.onboarding_completed,
          isOnboarded,
          willRedirectTo: isOnboarded ? '/' : '/onboarding',
          isFirstTimeUser: !profileExists || profile?.onboarding_completed === false
        })

        setStatus('Redirecting...')

        // Wait a moment for any state to settle and ensure redirect happens
        await new Promise(resolve => setTimeout(resolve, 500))

        // Step 5: Redirect based on onboarding status
        // CRITICAL: Missing profile or onboarding_completed=false → onboarding
        // Only onboarding_completed=true → home
        
        // CRITICAL: Force check - if onboarding_completed is not EXPLICITLY true, go to onboarding
        const shouldGoToOnboarding = profile?.onboarding_completed !== true
        
        console.log('🚦 [AUTH RESOLVE] REDIRECT DECISION:', {
          onboardingCompleted: profile?.onboarding_completed,
          isOnboarded,
          shouldGoToOnboarding,
          profileType: typeof profile?.onboarding_completed,
          profileValue: profile?.onboarding_completed,
          willRedirectTo: shouldGoToOnboarding ? '/onboarding' : '/'
        })
        
        if (shouldGoToOnboarding) {
          console.log('🆕 [AUTH RESOLVE] ⚠️ REDIRECTING TO ONBOARDING ⚠️')
          console.log('🆕 [AUTH RESOLVE] Profile state:', {
            exists: profileExists,
            hasId: !!profile?.id,
            onboardingCompleted: profile?.onboarding_completed,
            onboardingCompletedType: typeof profile?.onboarding_completed
          })
          
          // CRITICAL: Use MULTIPLE redirect methods to ensure it happens
          // Some browsers or React might block one method, so we try all
          if (typeof window !== 'undefined') {
            console.log('🆕 [AUTH RESOLVE] Attempting MULTIPLE redirect methods to /onboarding')
            
            // Method 1: window.location.href (hard redirect - cannot be blocked)
            console.log('🆕 [AUTH RESOLVE] Method 1: window.location.href')
            window.location.href = '/onboarding'
            
            // Method 2: window.location.replace (also hard redirect)
            setTimeout(() => {
              console.log('🆕 [AUTH RESOLVE] Method 2: window.location.replace')
              window.location.replace('/onboarding')
            }, 50)
            
            // Method 3: router.replace (Next.js router)
            setTimeout(() => {
              console.log('🆕 [AUTH RESOLVE] Method 3: router.replace')
              router.replace('/onboarding')
            }, 100)
            
            // Method 4: Force navigation (last resort)
            setTimeout(() => {
              console.log('🆕 [AUTH RESOLVE] Method 4: window.location.assign')
              window.location.assign('/onboarding')
            }, 150)
          } else {
            console.log('🆕 [AUTH RESOLVE] Using router.replace for redirect to /onboarding')
            router.replace('/onboarding')
          }
        } else {
          console.log('✅ [AUTH RESOLVE] User onboarded - redirecting to / (home page)')
          // Use window.location for a hard redirect to ensure it happens
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          } else {
            router.replace('/')
          }
        }

      } catch (error) {
        console.error('❌ [AUTH RESOLVE] Fatal error:', error)
        router.replace('/login?error=auth_resolve_failed')
      }
    }

    resolveAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF] mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
      </div>
    </div>
  )
}
