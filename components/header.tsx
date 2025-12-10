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
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  
  // Check if user has visited before (persistent across sessions)
  useEffect(() => {
    if (typeof window !== 'undefined' && isFirstLoad) {
      const visited = localStorage.getItem('dreamscale:hasVisitedBefore')
      if (visited === 'true') {
        // User has visited before - show "Welcome back"
        setHasVisitedBefore(true)
      } else {
        // First visit ever - show "Welcome" and mark it in localStorage
        // But don't change the message during this session
        localStorage.setItem('dreamscale:hasVisitedBefore', 'true')
        setHasVisitedBefore(false) // Keep as false so it shows "Welcome" this session
      }
      setIsFirstLoad(false)
    }
  }, [isFirstLoad])
  
  // Determine welcome message based on first visit
  // Only shows "Welcome back" if they've visited before (checked from localStorage on load)
  // First-time visitors see "Welcome" for the entire session
  const welcomeText = hasVisitedBefore ? t("common.welcomeBack") : t("common.welcome")
  
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4 mt-1">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">
            {userName ? (
              <>
                {welcomeText + ", "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 animate-pulse">{userName}</span>
                {"!"}
              </>
            ) : (
              <>
            {hasVisitedBefore ? t("common.welcomeBack") + " " + t("common.welcomeTo") + " " : t("common.welcomeTo") + " "}
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
