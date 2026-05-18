'use client'

import { Button } from "@/components/ui/button"
import { HelpCircle, MessageSquare, Settings } from "lucide-react"
import { UpgradeDropdown } from "@/components/upgrade-dropdown"
import { LogoutButton } from "@/components/logout-button"
import { useSessionSafe } from "@/lib/session-context"
import { useLanguageSafe } from "@/lib/language-context"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

function firstAlphabeticTokenFromEmail(email: string | null | undefined): string | null {
  if (!email?.includes('@')) return null
  const local = email.split('@')[0] ?? ''
  const tokens = local.split(/[\s._+\-]+/).filter(Boolean)
  for (const t of tokens) {
    const letters = t.replace(/\d+$/, '').replace(/[^a-zA-Z]/g, '')
    if (letters.length >= 2) {
      return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase()
    }
  }
  return null
}

interface HeaderProps {
  onSettingsClick?: () => void
}

type ProfileNameMeta = {
  loading: boolean
  onboardingCompleted: boolean
  preferredName: string | null
}

export function Header({ onSettingsClick }: HeaderProps = {}) {
  const sessionContext = useSessionSafe()
  const { t } = useLanguageSafe()
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? null

  const [profileMeta, setProfileMeta] = useState<ProfileNameMeta | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setProfileMeta(null)
      return
    }
    let cancelled = false
    setProfileMeta({ loading: true, onboardingCompleted: false, preferredName: null })
    void (async () => {
      try {
        const res = await fetch('/api/me/onboarding-status', {
          credentials: 'same-origin',
          cache: 'no-store',
        })
        if (cancelled) return
        if (!res.ok) {
          setProfileMeta({ loading: false, onboardingCompleted: false, preferredName: null })
          return
        }
        const b = (await res.json()) as {
          onboardingCompleted?: boolean
          preferredName?: string | null
        }
        if (cancelled) return
        const p = typeof b.preferredName === 'string' ? b.preferredName.trim() : ''
        setProfileMeta({
          loading: false,
          onboardingCompleted: b.onboardingCompleted === true,
          preferredName: p || null,
        })
      } catch {
        if (!cancelled) {
          setProfileMeta({ loading: false, onboardingCompleted: false, preferredName: null })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const friendlyFallbackFirst = () => 'Friend'

  const sessionName = sessionContext?.sessionData?.entrepreneurProfile?.name?.trim() || null
  const sessionLoading = sessionContext?.isLoadingSession === true
  const profileLoading = Boolean(user?.id && (!profileMeta || profileMeta.loading))

  /** "What should we call you?" — session JSON and/or user_profiles.user_name */
  const effectivePreferredName = sessionName || profileMeta?.preferredName || null

  /**
   * Prefer chosen name from onboarding. While session or profile fetch is in flight and we
   * don't have that name yet, do not fall back to email-derived or Clerk name (avoids "Leonardo" flash).
   */
  const displayFirstName: string | null = (() => {
    if (effectivePreferredName) {
      const first = effectivePreferredName.split(/\s+/)[0]
      return first || null
    }
    if (sessionLoading || profileLoading) return null

    if (profileMeta?.onboardingCompleted) {
      return friendlyFallbackFirst()
    }

    const clerkFull = user?.fullName?.trim() || null
    if (clerkFull) {
      const first = clerkFull.split(/\s+/)[0]
      return first || null
    }
    if (user?.firstName?.trim()) return user.firstName.trim()
    return firstAlphabeticTokenFromEmail(email)
  })()

  const namePending =
    !!user?.id && displayFirstName === null && (sessionLoading || profileLoading)

  const userInitialSource =
    effectivePreferredName ||
    (!sessionLoading && !profileLoading
      ? user?.fullName?.trim() ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
        email ||
        null
      : null)

  const [hasVisitedBefore, setHasVisitedBefore] = useState<boolean>(false)
  const [returningMessage, setReturningMessage] = useState<string>("")
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  
  // Debug: Log name sources - only log once when name changes
  useEffect(() => {
    if (userInitialSource) {
      console.log('✅ Header: Resolved display:', userInitialSource, {
        fromSessionContext: !!sessionName,
        fromProfileApi: !!(profileMeta?.preferredName && !sessionName),
        fromClerkName:
          !sessionLoading && !profileLoading && (!!user?.fullName || !!user?.firstName),
      })
    } else if (user) {
      console.warn('⚠️ Header: User logged in but no name resolved', {
        sessionName,
        profilePreferredName: profileMeta?.preferredName,
        clerkName: user.fullName,
        userEmail: email,
        namePending,
      })
    }
  }, [
    userInitialSource,
    sessionName,
    profileMeta?.preferredName,
    user,
    email,
    namePending,
    sessionLoading,
    profileLoading,
  ])
  
  // Check if user has visited before using visit count
  useEffect(() => {
    if (typeof window !== 'undefined' && isFirstLoad) {
      // Check if they've visited before
      const visitCount = localStorage.getItem('dreamscale_visit_count')
      const count = visitCount ? parseInt(visitCount) : 0
      
      if (count === 0) {
        // First visit ever - ALWAYS show "Welcome" only, never returning messages
        setHasVisitedBefore(false)
        setReturningMessage("") // Clear any returning message to ensure first-time users never see it
        // Increment count for next time
        localStorage.setItem('dreamscale_visit_count', '1')
      } else {
        // Returning user - show random creative message
        const creativeMessages = [
          "Welcome back",
          "Let's get back at it",
          "Ready to build something great?",
          "Time to make it happen",
          "Your next breakthrough awaits",
          "Let's turn ideas into reality",
          "Back to creating magic",
          "Ready to scale new heights?",
          "Time to dream bigger",
          "Let's build the future",
          "Your vision, your moment",
          "Ready to make waves?",
          "Back to the grind",
          "Let's create something extraordinary",
          "Time to execute",
          "Ready to innovate?",
          "Back to building your empire",
          "Let's make today count",
          "Time to level up",
          "Ready to disrupt?",
          "Back to chasing dreams",
          "Let's turn ambition into action",
          "Time to make moves",
          "Ready to conquer?",
          "Back to the journey",
          "Let's build something legendary",
          "Time to make an impact",
          "Ready to transform?",
          "Back to making history",
          "Let's create your legacy"
        ]
        const randomMessage = creativeMessages[Math.floor(Math.random() * creativeMessages.length)]
        setReturningMessage(randomMessage)
        setHasVisitedBefore(true)
        // Increment count
        localStorage.setItem('dreamscale_visit_count', (count + 1).toString())
      }
      setIsFirstLoad(false)
    }
  }, [isFirstLoad])

  const resolveGreetingFirstName = (): string =>
    displayFirstName || friendlyFallbackFirst()

  const getGreetingMessage = () => {
    const firstName = namePending ? '' : resolveGreetingFirstName()

    if (hasVisitedBefore && returningMessage) {
      if (returningMessage.endsWith('?')) {
        return {
          before: `${returningMessage.slice(0, -1)}, `,
          name: firstName,
          after: '?',
        }
      }
      if (returningMessage.endsWith('!')) {
        return {
          before: `${returningMessage.slice(0, -1)}, `,
          name: firstName,
          after: '!',
        }
      }
      return {
        before: `${returningMessage}, `,
        name: firstName,
        after: '!',
      }
    }

    return {
      before: 'Welcome, ',
      name: firstName,
      after: '!',
    }
  }
  
  const greetingParts = getGreetingMessage()
  
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4 mt-1">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">
            <span>{greetingParts.before}</span>
            {namePending ? (
              <span
                className="inline-block h-9 min-w-[5rem] rounded-md bg-gray-200 dark:bg-gray-600 animate-pulse align-[-0.15em]"
                aria-label="Loading your name"
              />
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 animate-pulse">
                {greetingParts.name}
              </span>
            )}
            <span>{greetingParts.after}</span>
          </h1>
          <p className="text-gray-600 dark:text-white mt-2">{t("common.whatAreWeCreatingToday")}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onSettingsClick}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800">
            <MessageSquare className="w-5 h-5" />
          </Button>
          <UpgradeDropdown />
          <LogoutButton />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-[#39d2c0]/30 text-[#39d2c0] hover:bg-[#39d2c0]/40 hover:text-white font-semibold text-sm"
          >
            {userInitialSource ? userInitialSource.charAt(0).toUpperCase() : '?'}
          </Button>
        </div>
      </div>
    </header>
  )
}
