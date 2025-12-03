"use client"

import { Home, Zap, Atom, Settings, Crown, Users, Layers, Search, BookOpen, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getNotificationStatus, hasUnseenUpdates, markFeatureAsSeen } from "@/lib/notifications"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const navigationItems = [
  { icon: Home, label: "Home", href: "/", aiPowered: false },
  { icon: Zap, label: "Discover", href: "/discover", aiPowered: true },
  { icon: Atom, label: "Bizora AI", href: "/bizora", aiPowered: true },
  { icon: Settings, label: "Systems", href: "/revenue", aiPowered: true },
  { icon: DollarSign, label: "Revenue", href: "/revenue-intelligence", aiPowered: true },
  { icon: Crown, label: "Leadership", href: "/marketplace", aiPowered: true },
  { icon: Users, label: "Teams", href: "/teams", aiPowered: true },
  { icon: Search, label: "Competitor Intelligence", href: "/dreampulse", aiPowered: true },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [savedPulsesCount, setSavedPulsesCount] = useState(0)
  
  // Load saved pulses count from localStorage
  useEffect(() => {
    const loadSavedPulses = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('dreamPulseSavedAnalyses') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          setSavedPulsesCount(Array.isArray(parsed) ? parsed.length : 0)
        } else {
          setSavedPulsesCount(0)
        }
      } catch (e) {
        console.warn('Failed to load saved pulses count', e)
        setSavedPulsesCount(0)
      }
    }

    loadSavedPulses()
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamPulseSavedAnalyses') {
        loadSavedPulses()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(loadSavedPulses, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  
  // Function to determine if a nav item should show notification
  const shouldShowNotification = (label: string) => {
    switch (label) {
      case "Discover": return hasUnseenUpdates('discover')
      case "Bizora AI": return hasUnseenUpdates('bizora')
      case "Systems": return hasUnseenUpdates('flowmatch')
      case "Revenue": return hasUnseenUpdates('revenue')
      case "Leadership": return hasUnseenUpdates('pitchpoint')
      case "Teams": return hasUnseenUpdates('teams')
      default: return false
    }
  }

  // Function to handle navigation clicks
  const handleNavClick = (label: string) => {
    switch (label) {
      case "Discover": markFeatureAsSeen('discover'); break
      case "Bizora AI": markFeatureAsSeen('bizora'); break
      case "Systems": markFeatureAsSeen('flowmatch'); break
      case "Revenue": markFeatureAsSeen('revenue'); break
      case "Leadership": markFeatureAsSeen('pitchpoint'); break
      case "Teams": markFeatureAsSeen('teams'); break
    }
  }
  
  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col ${inter.className}`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 dark:bg-gray-800 rounded-md flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Workspace</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item, index) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname === item.href || pathname.startsWith(item.href + "/")
          const isDreamPulse = item.label === "Competitor Intelligence"
          
          return (
            <div key={index} className="space-y-1">
              <Link
                href={item.href}
                onClick={() => handleNavClick(item.label)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative !text-gray-700 dark:!text-gray-300 !bg-gray-100 dark:!bg-transparent hover:!bg-gray-200 dark:hover:!bg-gray-800",
                  isActive && "!bg-gray-700 dark:!bg-gray-800 !text-white ring-2 ring-white/30 shadow-lg"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "!text-white" : "!text-gray-500 dark:!text-gray-400"
                  )}
                />
                <span className={cn(
                  "flex-1",
                  isActive ? "!text-white" : "!text-gray-700 dark:!text-gray-300"
                )}>{item.label}</span>
                
                {/* AI Badge */}
                {item.aiPowered && (
                  <span className="text-[11px] font-bold !text-white dark:!text-white transition-all duration-300">
                    AI
                  </span>
                )}

                {/* Notification Badge */}
                {shouldShowNotification(item.label) && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                )}
              </Link>
              
              {/* Saved Analysis Button - Only show for DreamPulse */}
              {isDreamPulse && isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dreampulse')
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('dreampulse:viewSaved'))
                    }, 100)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors duration-200 mt-1",
                    savedPulsesCount > 0
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {savedPulsesCount > 0 ? (
                    <span>{savedPulsesCount} Saved</span>
                  ) : (
                    <span>View Saved</span>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

