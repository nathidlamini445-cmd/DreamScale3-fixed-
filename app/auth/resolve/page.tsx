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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthResolvePage() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')

  useEffect(() => {
    const resolveAuth = async () => {
      try {
        if (!supabase) {
          console.error('❌ [AUTH RESOLVE] Supabase not configured')
          router.replace('/login?error=configuration')
          return
        }

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
        
        // Step 3: Fetch profile (with timeout)
        let profile = null
        try {
          const profilePromise = supabase
            .from('user_profiles')
            .select('onboarding_completed, id, email, full_name')
            .eq('id', session.user.id)
            .single()
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile check timeout')), 10000)
          )
          
          const result = await Promise.race([profilePromise, timeoutPromise]) as any
          
          if (result?.error?.code === 'PGRST116' || !result?.data) {
            // Profile doesn't exist - create it
            console.log('🆕 [AUTH RESOLVE] Profile does not exist - creating profile')
            setStatus('Creating profile...')
            
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                onboarding_completed: false
              })
              .select()
              .single()
            
            if (createError) {
              console.error('❌ [AUTH RESOLVE] Error creating profile:', createError)
              // Continue anyway - profile will be created later
              profile = { onboarding_completed: false }
            } else {
              console.log('✅ [AUTH RESOLVE] Profile created')
              profile = newProfile
            }
          } else {
            profile = result.data
          }
        } catch (error) {
          console.error('❌ [AUTH RESOLVE] Profile check failed:', error)
          // Default to not onboarded if we can't check
          profile = { onboarding_completed: false }
        }

        // Step 4: Make routing decision
        const isOnboarded = profile?.onboarding_completed === true

        console.log('🔍 [AUTH RESOLVE] Routing decision:', {
          userId: session.user.id,
          hasProfile: !!profile,
          onboardingCompleted: profile?.onboarding_completed,
          isOnboarded
        })

        setStatus('Redirecting...')

        // Wait a moment for any state to settle
        await new Promise(resolve => setTimeout(resolve, 500))

        // Step 5: Redirect based on onboarding status
        if (!isOnboarded) {
          console.log('🆕 [AUTH RESOLVE] User not onboarded - redirecting to /onboarding')
          router.replace('/onboarding')
        } else {
          console.log('✅ [AUTH RESOLVE] User onboarded - redirecting to /')
          router.replace('/')
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
