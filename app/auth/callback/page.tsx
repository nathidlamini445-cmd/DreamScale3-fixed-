'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Auth Callback Page
 * 
 * This page handles both OAuth and magic link callbacks.
 * - OAuth: Server-side route handler (app/auth/callback/route.ts) handles code exchange
 * - Magic links: Client-side SDK automatically processes hash fragments
 * RouteGuard will then check onboarding status and route appropriately.
 */
export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      // Check if this is a magic link (has hash fragment)
      // Magic links use hash fragments which are only available client-side
      if (window.location.hash) {
        console.log('🔗 Magic link detected - Supabase SDK will handle automatically')
        setStatus('Verifying magic link...')
        
        // Supabase SDK with detectSessionInUrl: true will automatically process the hash
        // Wait for the session to be established (check multiple times with longer timeout)
        let sessionEstablished = false
        for (let i = 0; i < 20; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: { session }, error } = await supabase.auth.getSession()
          if (session && session.user) {
            sessionEstablished = true
            console.log('✅ Magic link authentication successful - session established')
            setStatus('Waiting for profile to load...')
            
            // Wait for profile to be created/loaded (important for RouteGuard)
            // Check profile multiple times
            let profileReady = false
            for (let j = 0; j < 10; j++) {
              await new Promise(resolve => setTimeout(resolve, 500))
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .single()
              
              if (profile || j === 9) { // Profile exists or timeout
                profileReady = true
                console.log('✅ Profile ready - redirecting...')
                break
              }
            }
            
            setStatus('Authentication successful! Redirecting...')
            // Wait a bit more to ensure AuthContext has processed everything
            await new Promise(resolve => setTimeout(resolve, 2000))
            router.replace('/auth/resolve')
            return
          }
          if (error) {
            console.error('Error getting session:', error)
          }
        }
        
        if (!sessionEstablished) {
          console.error('❌ Magic link authentication failed - no session after 10 seconds')
          setStatus('Authentication failed. Redirecting to login...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          router.replace('/login?error=authentication_failed')
        }
        return
      }

      // For OAuth, the server-side route handler already processed the code
      // Redirect to auth resolver - it will handle routing decisions
      setStatus('Completing OAuth authentication...')
      console.log('🔄 OAuth callback - redirecting to auth resolver...')
      
      // Wait for session to be established and profile to be ready
      let sessionReady = false
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && session.user) {
          sessionReady = true
          console.log('✅ OAuth session established')
          
          // Wait for profile to be ready
          for (let j = 0; j < 10; j++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single()
            
            if (profile || j === 9) {
              console.log('✅ Profile ready - redirecting to auth resolver')
              // Wait a bit more to ensure AuthContext has processed everything
              await new Promise(resolve => setTimeout(resolve, 2000))
              router.replace('/auth/resolve')
              return
            }
          }
        }
        if (error) {
          console.error('Error getting session:', error)
        }
      }
      
      if (!sessionReady) {
        console.error('❌ OAuth session not ready after timeout')
        setStatus('Authentication timeout. Redirecting...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.replace('/login?error=authentication_timeout')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF] mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
      </div>
    </div>
  )
}
