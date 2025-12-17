'use client'

import { Button } from "@/components/ui/button"
import { HelpCircle, MessageSquare, Settings } from "lucide-react"
import { UpgradeDropdown } from "@/components/upgrade-dropdown"
import { useSessionSafe } from "@/lib/session-context"
import { useLanguageSafe } from "@/lib/language-context"
import { useEffect, useState } from "react"

interface HeaderProps {
  onSettingsClick?: () => void
}

export function Header({ onSettingsClick }: HeaderProps = {}) {
  const sessionContext = useSessionSafe()
  const { t } = useLanguageSafe()
  const userName = sessionContext?.sessionData?.entrepreneurProfile?.name
  const [hasVisitedBefore, setHasVisitedBefore] = useState<boolean>(false)
  const [returningMessage, setReturningMessage] = useState<string>("")
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  
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
  }, [isFirstLoad, t])
  
  // Determine welcome message
  // First-time users (hasVisitedBefore = false) ALWAYS see "Welcome"
  // Returning users (hasVisitedBefore = true) see random creative messages
  const welcomeText = hasVisitedBefore ? returningMessage : t("common.welcome")
  
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4 mt-1">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">
            {userName ? (
              <>
                {/* First-time users always see "Welcome", returning users see creative messages */}
                {welcomeText + ", "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 animate-pulse">{userName}</span>
                {"!"}
              </>
            ) : (
              <>
            {/* First-time users always see "Welcome to", returning users see creative messages */}
            {hasVisitedBefore && returningMessage ? (
              returningMessage.endsWith("?") || returningMessage.endsWith("!")
                ? returningMessage + " " + t("common.welcomeTo") + " "
                : returningMessage + " to "
            ) : t("common.welcomeTo") + " "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 animate-pulse">{"DreamScale"}</span>
              </>
            )}
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
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-[#39d2c0]/30 text-[#39d2c0] hover:bg-[#39d2c0]/40 hover:text-white"
          >
            {"?"}
          </Button>
        </div>
      </div>
    </header>
  )
}
