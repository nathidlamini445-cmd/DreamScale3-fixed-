"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { QuickActions } from "@/components/quick-actions"
import { TasksPreview } from "@/components/tasks-preview"
import { EventsTimeline } from "@/components/events-timeline"
import { MotivationalQuotes } from "@/components/motivational-quotes"
import { SettingsModal } from "@/components/settings-modal"
import { EmailCaptureModal } from "@/components/email-capture-modal"
import { LogoutButton } from "@/components/logout-button"
import { PersonalizedGuidance } from "@/components/personalized-guidance"
import { DailyMoodTracker } from "@/components/daily-mood-tracker"
import { AISuggestions } from "@/components/ai-suggestions"
import { useSessionSafe } from "@/lib/session-context"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, authResolved } = useAuth()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showOnboardingMessage, setShowOnboardingMessage] = useState(false)
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const sessionContext = useSessionSafe()
  const supabase = createClient()

  // CRITICAL: Immediate redirect if no user (don't wait for auth to resolve)
  // This prevents black screen for unauthenticated users
  useEffect(() => {
    // Quick check - if we're mounted and there's definitely no user, redirect immediately
    if (mounted && !loading && !user) {
      console.log('🚫 [DASHBOARD] No user detected - redirecting to /auth/resolve immediately')
      router.replace('/auth/resolve')
      return
    }
  }, [mounted, user, loading, router])

  // Timeout after 2 seconds - don't wait forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ [DASHBOARD] Auth check timed out')
      setHasTimedOut(true)
      if (!user) {
        console.log('🚫 [DASHBOARD] No user after timeout - redirecting to /auth/resolve')
        router.replace('/auth/resolve')
      }
    }, 2000)
    return () => clearTimeout(timeout)
  }, [user, router])

  // CRITICAL: If no user after auth resolves, redirect to /auth/resolve
  // /auth/resolve will then route to /login if not authenticated
  useEffect(() => {
    if (!authResolved || loading) {
      return
    }

    if (!user) {
      console.log('🚫 [DASHBOARD] No authenticated user - redirecting to /auth/resolve')
      router.replace('/auth/resolve')
      return
    }
  }, [user, loading, authResolved, router])

  useEffect(() => {
    setMounted(true)
    // Quick initial check - if no user immediately, redirect
    if (!user && !loading) {
      // Small delay to ensure router is ready
      setTimeout(() => {
        router.replace('/auth/resolve')
      }, 100)
    }
    
    // Check if this is the first time and user hasn't interacted with tasks yet
    // Use session context to determine if onboarding was just completed
    if (typeof window !== 'undefined') {
      const hasInteractedWithTasks = localStorage.getItem('dreamscale_has_interacted_with_tasks')
      
      // Check if user just completed onboarding (from session context or check Supabase)
      // For authenticated users, onboarding status comes from Supabase via session context
      const onboardingJustCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted
      
      // Only show if onboarding is complete AND user hasn't interacted with tasks yet
      if (onboardingJustCompleted && !hasInteractedWithTasks) {
        setShowOnboardingMessage(true)
      }
    }
  }, [])

  // Listen for task interactions
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleTaskInteraction = () => {
      localStorage.setItem('dreamscale_has_interacted_with_tasks', 'true')
      setShowOnboardingMessage(false)
    }

    // Listen for custom event when tasks are clicked
    window.addEventListener('dreamscale:task-interaction', handleTaskInteraction)

    // Also check if user has already interacted
    const hasInteracted = localStorage.getItem('dreamscale_has_interacted_with_tasks')
    if (hasInteracted) {
      setShowOnboardingMessage(false)
    }

    return () => {
      window.removeEventListener('dreamscale:task-interaction', handleTaskInteraction)
    }
  }, [])

  const handleSettingsSave = (settings: any) => {
    console.log('Settings saved:', settings)
  }

  // CRITICAL: If timed out, don't show loading - redirect immediately
  if (hasTimedOut && !user) {
    router.replace('/auth/resolve')
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Show loading while auth is resolving or page is mounting (but not if timed out)
  if ((!mounted || loading || !authResolved) && !hasTimedOut) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Show loading if no user (redirect is happening) - but timeout after 1 second
  if (!user && !hasTimedOut) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden flex">
      {/* Fixed Sidebar - Green area - Never scrolls */}
      <SidebarNav />
      
      {/* Scrollable Main Content - Yellow area - Only this scrolls */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto overflow-x-hidden">
        <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
        <div className="p-8 space-y-8">
            {/* Session Info Bar - Always show logout button */}
            {mounted && (
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-center">
                <div className="text-sm">
                  {sessionContext && sessionContext.sessionData.email ? (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">Session Active:</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">{sessionContext.sessionData.email}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white">DreamScale</span>
                  )}
                </div>
                <LogoutButton />
              </div>
            )}
            
            {/* Show onboarding complete message at the top - only first time */}
            {mounted && showOnboardingMessage && (
              <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Onboarding complete
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Scroll down to see your tasks
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('dreamscale_has_interacted_with_tasks', 'true')
                      setShowOnboardingMessage(false)
                    }
                  }}
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  aria-label="Dismiss message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <AISuggestions />
            <DailyMoodTracker />
            <PersonalizedGuidance />
            <QuickActions />
            <TasksPreview />
            <EventsTimeline />
            <MotivationalQuotes />
          </div>
      </main>

      {/* Email Capture Modal */}
      <EmailCaptureModal />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  )
}
