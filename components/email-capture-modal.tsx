'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useSessionSafe } from '@/lib/session-context'
import { EntrepreneurOnboarding } from '@/components/onboarding/entrepreneur-onboarding'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function EmailCaptureModal() {
  const sessionContext = useSessionSafe()
  const { user } = useAuth()
  const [localEmail, setLocalEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Don't show email capture modal if:
    // 1. User is authenticated (has logged in with Google/email)
    // 2. Session has an email already
    // 3. Email exists in localStorage
    // 4. Onboarding is not completed (onboarding handles email capture)
    if (!sessionContext) return
    
    const hasEmail = 
      !!user?.email || // User is authenticated
      !!sessionContext.sessionData?.email || // Session has email
      (typeof window !== 'undefined' && !!localStorage.getItem('dreamscale_current_email')) // Email in localStorage
    
    // Check if onboarding is completed - if not, onboarding will handle email capture
    // Use session context and Supabase (via AuthContext) as source of truth
    const onboardingCompleted = sessionContext.sessionData?.entrepreneurProfile?.onboardingCompleted === true
    
    // Only show modal if:
    // - No email exists AND
    // - Session is not active AND
    // - Onboarding is completed (if onboarding not completed, onboarding handles email capture)
    // NEVER show if onboarding is not completed - onboarding will handle email capture
    if (!hasEmail && !sessionContext.isSessionActive && onboardingCompleted) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [sessionContext?.isSessionActive, sessionContext?.sessionData?.email, sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted, user?.email])

  if (!mounted || !sessionContext) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (localEmail.trim()) {
      setIsLoading(true)
      try {
        const normalizedEmail = localEmail.toLowerCase().trim()
        
        // Check if email exists in database (localStorage or Supabase)
        // If email exists AND onboarding completed → Skip onboarding, go to homepage
        // If email is new OR onboarding not completed → Show onboarding
        let emailExistsInDatabase = false
        let onboardingCompleted = false
        
        // Check localStorage first (fast check - indicates they've used this email before)
        const emailKeyedStorage = localStorage.getItem(`dreamscale_session_${normalizedEmail}`)
        if (emailKeyedStorage) {
          try {
            const parsed = JSON.parse(emailKeyedStorage)
            emailExistsInDatabase = true
            onboardingCompleted = parsed?.entrepreneurProfile?.onboardingCompleted === true
            console.log('📧 Email found in localStorage - onboarding completed:', onboardingCompleted)
          } catch (e) {
            emailExistsInDatabase = true
            console.log('📧 Email found in localStorage')
          }
        }
        
        // Check Supabase database if user is authenticated
        if (user?.email?.toLowerCase() === normalizedEmail) {
          try {
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('email, onboarding_completed')
              .eq('id', user.id)
              .single()
            
            if (!error && profile) {
              emailExistsInDatabase = true
              onboardingCompleted = profile.onboarding_completed === true
              console.log('📧 Email found in Supabase database - onboarding completed:', onboardingCompleted)
            }
          } catch (error) {
            console.error('Error checking Supabase:', error)
          }
        }
        
        // Update session with email FIRST (this loads their data if it exists)
        sessionContext.updateEmail(normalizedEmail)
        
        // Send welcome email (non-blocking)
        try {
          const response = await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail })
          })
          if (response.ok) {
            console.log('✅ Welcome email sent!')
          }
        } catch (error) {
          console.log('Could not send welcome email, continuing anyway')
        }
        
        setIsOpen(false)
        setIsLoading(false)
        
        // If email exists in database AND onboarding is completed → Skip onboarding, go straight to homepage
        if (emailExistsInDatabase && onboardingCompleted) {
          console.log('✅ Email exists and onboarding completed - redirecting to homepage')
          // The OnboardingGuard will check and skip onboarding
          // Force a page reload to ensure data is loaded
          window.location.href = '/'
          return
        }
        
        // If email is NEW OR onboarding not completed → Show onboarding
        console.log('🆕 New email or onboarding not completed - showing onboarding')
        setTimeout(() => {
          setShowOnboarding(true)
        }, 500)
        
      } catch (error) {
        console.error('Error in handleSubmit:', error)
        // On error, still update email and show onboarding as fallback
        sessionContext.updateEmail(localEmail)
        setIsOpen(false)
        setIsLoading(false)
        setTimeout(() => {
          setShowOnboarding(true)
        }, 500)
      }
    }
  }

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/resolve`,
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        alert('Failed to sign in with Google. Please try again.')
        setIsSigningIn(false)
      } else {
        // Close the modal - user will be redirected after Google auth
        // The OnboardingGuard will check if onboarding is needed after authentication
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('An error occurred. Please try again.')
      setIsSigningIn(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to DreamScale</DialogTitle>
            <DialogDescription>
              Sign in with Google or enter your email to access your session. Your data will persist across all features (Calendar, Venture Quest, Chats) until you logout.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 h-12"
              disabled={isSigningIn || isLoading}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            {/* Email Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                autoFocus
                required
                disabled={isLoading || isSigningIn}
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || isSigningIn}
              >
                {isLoading ? 'Starting session...' : 'Continue with Email'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entrepreneur Onboarding Wizard */}
      <EntrepreneurOnboarding isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </>
  )
}
