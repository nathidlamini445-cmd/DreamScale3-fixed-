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
import { createClient } from '@/lib/supabase/client'

export default function AuthResolvePage() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')
  const supabase = createClient()

  useEffect(() => {
    const resolveAuth = async () => {
      try {
        setStatus('Verifying session...')

        let session: NonNullable<
          Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
        > | null = null
        const deadline = Date.now() + 10000
        while (Date.now() < deadline && !session?.user) {
          const { data: s1 } = await supabase.auth.getSession()
          if (s1.session?.user) {
            session = s1.session
            break
          }
          const { data: u1, error: e1 } = await supabase.auth.getUser()
          if (!e1 && u1.user) {
            const { data: s2 } = await supabase.auth.getSession()
            if (s2.session?.user) {
              session = s2.session
              break
            }
          }
          await new Promise((r) => setTimeout(r, 100))
        }

        if (!session?.user) {
          console.error('❌ [AUTH RESOLVE] No usable session after retries')
          router.replace('/login?error=session_check_failed')
          return
        }

        // Step 2: Session valid — continue routing

        setStatus('Loading profile...')
        
        // Step 3: Fetch or create profile
        // CRITICAL: Missing profile is NOT an error - it's a FIRST-TIME USER case
        let profile = null
        let profileExists = false
        
        console.log('🔍 [AUTH RESOLVE] Starting profile check for user:', {
          userId: session.user.id,
          email: session.user.email
        })
        
        // First, try to fetch existing profile (retry briefly — first query can race with auth/trigger)
        let fetchedProfile: {
          onboarding_completed: boolean | null
          id: string
          email: string | null
          full_name: string | null
        } | null = null
        let profileError: { code?: string; message?: string } | null = null

        for (let preTry = 0; preTry < 3; preTry++) {
          const res = await supabase
            .from('user_profiles')
            .select('onboarding_completed, id, email, full_name')
            .eq('id', session.user.id)
            .maybeSingle()

          fetchedProfile = res.data
          profileError = res.error

          if (fetchedProfile) break
          if (res.error && res.error.code !== 'PGRST116') {
            console.warn('⚠️ [AUTH RESOLVE] Profile fetch attempt', preTry + 1, res.error)
          }
          if (preTry < 2) await new Promise((r) => setTimeout(r, 150))
        }

        if (profileError && profileError.code && profileError.code !== 'PGRST116') {
          console.error('❌ [AUTH RESOLVE] Non-recoverable profile error:', profileError)
        }

        const startedWithNoProfileRow = !fetchedProfile

        console.log('🔍 [AUTH RESOLVE] Profile fetch result:', {
          hasProfile: !!fetchedProfile,
          errorCode: profileError?.code,
          errorMessage: profileError?.message,
          onboardingCompleted: fetchedProfile?.onboarding_completed
        })

        if (!fetchedProfile) {
          // No row yet — first-time sign-up path. Use INSERT only so we never overwrite
          // an existing row’s onboarding_completed with upsert ( that was wiping completed users).
          console.log('🆕 [AUTH RESOLVE] No profile row yet — inserting minimal row')
          setStatus('Creating profile...')

          const { data: inserted, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name:
                session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              onboarding_completed: false,
            })
            .select('onboarding_completed, id, email, full_name')
            .single()

          if (!insertError && inserted) {
            profile = inserted
            profileExists = true
            console.log('✅ [AUTH RESOLVE] Inserted new user_profiles row')
          } else if (
            insertError &&
            (insertError.code === '23505' ||
              insertError.message?.toLowerCase().includes('duplicate') ||
              insertError.message?.toLowerCase().includes('unique'))
          ) {
            // Row appeared (trigger / race / concurrent insert) — fetch it, do not overwrite flags
            console.log('ℹ️ [AUTH RESOLVE] Insert raced or duplicate — fetching existing row')
            await new Promise((r) => setTimeout(r, 120))
            const { data: existing } = await supabase
              .from('user_profiles')
              .select('onboarding_completed, id, email, full_name')
              .eq('id', session.user.id)
              .single()

            if (existing) {
              profile = existing
              profileExists = true
              console.log('✅ [AUTH RESOLVE] Loaded existing profile after insert conflict:', {
                onboardingCompleted: profile.onboarding_completed,
              })
            } else {
              console.warn('⚠️ [AUTH RESOLVE] Could not load profile after insert error')
              profile = { onboarding_completed: false }
            }
          } else {
            console.error('❌ [AUTH RESOLVE] Insert error:', insertError)
            profile = { onboarding_completed: false }
          }
        } else {
          // Profile exists — use it as-is (preserve onboarding_completed from DB)
          profile = fetchedProfile
          profileExists = true
          console.log('✅ [AUTH RESOLVE] Profile found:', {
            id: profile.id,
            email: profile.email,
            onboardingCompleted: profile.onboarding_completed,
          })
          if (profile.onboarding_completed === null || profile.onboarding_completed === undefined) {
            profile.onboarding_completed = false
          }
        }
        
        // CRITICAL: Ensure we have a profile object (even if just default)
        // Missing profile is treated as first-time user (onboarding_completed=false)
        if (!profile) {
          console.warn('⚠️ [AUTH RESOLVE] No profile object - defaulting to first-time user')
          profile = { onboarding_completed: false }
        }

        // Returning users: if a row already existed but we still read onboarding as not done,
        // refetch a few times (read-after-write / replica / cache lag) so sign-in → home works.
        if (!startedWithNoProfileRow && profile?.onboarding_completed !== true) {
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise((r) => setTimeout(r, 180))
            const { data: refetched } = await supabase
              .from('user_profiles')
              .select('onboarding_completed, id, email, full_name')
              .eq('id', session.user.id)
              .maybeSingle()

            if (refetched?.onboarding_completed === true) {
              profile = refetched
              console.log('✅ [AUTH RESOLVE] onboarding_completed=true on refetch attempt', attempt + 1)
              break
            }
          }
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
          willRedirectTo: isOnboarded ? '/dashboard' : '/onboarding',
          isFirstTimeUser: !profileExists || profile?.onboarding_completed === false
        })

        setStatus('Redirecting...')

        // Single hard navigation — multiple stacked redirects caused flicker and occasional races.
        const shouldGoToOnboarding = profile?.onboarding_completed !== true
        const destination = shouldGoToOnboarding ? '/onboarding' : '/dashboard'

        console.log('🚦 [AUTH RESOLVE] REDIRECT:', {
          onboardingCompleted: profile?.onboarding_completed,
          destination,
        })

        if (typeof window !== 'undefined') {
          window.location.replace(destination)
        } else {
          router.replace(destination)
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
