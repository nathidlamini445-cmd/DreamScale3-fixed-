'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useSessionSafe } from '@/lib/session-context'
import { EntrepreneurOnboarding } from '@/components/onboarding/entrepreneur-onboarding'

export function EmailCaptureModal() {
  const sessionContext = useSessionSafe()
  const [localEmail, setLocalEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Only show modal if session is not active and context is available
    if (sessionContext && !sessionContext.isSessionActive) {
      setIsOpen(true)
    }
  }, [sessionContext?.isSessionActive])

  if (!mounted || !sessionContext) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (localEmail.trim()) {
      setIsLoading(true)
      try {
        // Send welcome email
        const response = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: localEmail })
        })

        if (response.ok) {
          console.log('✅ Welcome email sent!')
        } else {
          console.log('Email service unavailable, continuing anyway')
        }
      } catch (error) {
        console.log('Could not send welcome email, but session starting anyway')
      } finally {
        // Always update session and close modal
        sessionContext.updateEmail(localEmail)
        setIsOpen(false)
        setIsLoading(false)
        
        // Check if onboarding is needed
        const needsOnboarding = !sessionContext.sessionData?.entrepreneurProfile?.onboardingCompleted
        if (needsOnboarding) {
          // Small delay to ensure email is saved first
          setTimeout(() => {
            setShowOnboarding(true)
          }, 500)
        }
      }
    }
  }

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to DreamScale</DialogTitle>
            <DialogDescription>
              Enter your email to access your session. Your data will persist across all features (Calendar, Venture Quest, Chats) until you logout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              autoFocus
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Starting session...' : 'Start Session'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Entrepreneur Onboarding Wizard */}
      <EntrepreneurOnboarding isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </>
  )
}
