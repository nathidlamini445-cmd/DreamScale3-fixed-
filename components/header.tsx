'use client'

import { Button } from "@/components/ui/button"
import { HelpCircle, MessageSquare, Settings } from "lucide-react"
import { UpgradeDropdown } from "@/components/upgrade-dropdown"
import { LogoutButton } from "@/components/logout-button"
import { useSessionSafe } from "@/lib/session-context"
import { useLanguageSafe } from "@/lib/language-context"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"

interface HeaderProps {
  onSettingsClick?: () => void
}

export function Header({ onSettingsClick }: HeaderProps = {}) {
  const sessionContext = useSessionSafe()
  const { t } = useLanguageSafe()
  const { user, profile } = useAuth()
  
  // Get user name from multiple sources - prioritize session context, then profile, then auth user
  // Check all possible sources to ensure we get the name
  const userName = sessionContext?.sessionData?.entrepreneurProfile?.name || 
                   profile?.full_name ||
                   user?.user_metadata?.full_name || 
                   user?.user_metadata?.name ||
                   null
  
  const [hasVisitedBefore, setHasVisitedBefore] = useState<boolean>(false)
  const [returningMessage, setReturningMessage] = useState<string>("")
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  
  // Debug: Log name sources - only log once when name changes
  useEffect(() => {
    if (userName) {
      console.log('✅ Header: Found user name:', userName, {
        fromSessionContext: !!sessionContext?.sessionData?.entrepreneurProfile?.name,
        fromProfile: !!profile?.full_name,
        fromUserMetadata: !!user?.user_metadata?.full_name || !!user?.user_metadata?.name
      })
    } else if (user) {
      // Only warn if user is logged in but no name found
      console.warn('⚠️ Header: User logged in but no name found', {
        sessionContextName: sessionContext?.sessionData?.entrepreneurProfile?.name,
        profileName: profile?.full_name,
        userMetadataName: user?.user_metadata?.full_name || user?.user_metadata?.name,
        userEmail: user?.email
      })
    }
  }, [userName])
  
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
  
  // Determine welcome message
  // First-time users (hasVisitedBefore = false) ALWAYS see "Welcome"
  // Returning users (hasVisitedBefore = true) see random creative messages
  const welcomeText = hasVisitedBefore ? returningMessage : t("common.welcome")
  
  // Get user's first name for personalization - check multiple sources
  const userFirstName = userName 
    ? userName.split(' ')[0] 
    : (user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || null)
  
  // Format message based on whether we have a user name
  const getGreetingMessage = () => {
    if (userFirstName) {
      // When we have a name, ALWAYS personalize the message - NEVER show DreamScale
      if (hasVisitedBefore && returningMessage) {
        // For returning users with creative messages, adapt them to work with the name
        if (returningMessage.endsWith("?")) {
          // "Ready to build something great?" -> "Ready to build something great, [Name]?"
          return {
            before: `${returningMessage.slice(0, -1)}, `,
            name: userFirstName,
            after: '?'
          }
        } else if (returningMessage.endsWith("!")) {
          // "Welcome back!" -> "Welcome back, [Name]!"
          return {
            before: `${returningMessage.slice(0, -1)}, `,
            name: userFirstName,
            after: '!'
          }
        } else {
          // Messages like "Welcome back", "Let's get back at it", "Let's build something legendary"
          return {
            before: `${returningMessage}, `,
            name: userFirstName,
            after: '!'
          }
        }
      } else {
        // First-time user with name
        return {
          before: 'Welcome, ',
          name: userFirstName,
          after: '!'
        }
      }
    } else {
      // No name available - use generic message with DreamScale
      if (hasVisitedBefore && returningMessage) {
        return {
          before: `${returningMessage} ${t("common.welcomeTo")} `,
          name: 'DreamScale',
          after: ''
        }
      } else {
        return {
          before: `${t("common.welcomeTo")} `,
          name: 'DreamScale',
          after: ''
        }
      }
    }
  }
  
  const greetingParts = getGreetingMessage()
  
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4 mt-1">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">
            <span>{greetingParts.before}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 animate-pulse">
              {greetingParts.name}
            </span>
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
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </Button>
        </div>
      </div>
    </header>
  )
}
