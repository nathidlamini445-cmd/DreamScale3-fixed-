"use client"

import { Home, Zap, Atom, Settings, Crown, Users, Layers, Search, BookOpen, DollarSign, MessageSquare, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getNotificationStatus, hasUnseenUpdates, markFeatureAsSeen } from "@/lib/notifications"
import { useLanguageSafe } from "@/lib/language-context"
import { useBizoraLoading } from "@/lib/bizora-loading-context"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguageSafe()
  const { setOpeningBizora } = useBizoraLoading()
  const [savedPulsesCount, setSavedPulsesCount] = useState(0)
  const [notificationUpdate, setNotificationUpdate] = useState(0) // Force re-render when notifications change
  
  const navigationItems = [
    { icon: Home, label: t("nav.home"), labelKey: "Home", href: "/", aiPowered: false },
    { icon: Zap, label: t("nav.discover"), labelKey: "Discover", href: "/discover", aiPowered: false },
    { icon: Atom, label: t("nav.bizoraAI"), labelKey: "Bizora AI", href: "/bizora", aiPowered: true },
    { icon: Settings, label: t("nav.systems"), labelKey: "Systems", href: "/revenue", aiPowered: true },
    { icon: DollarSign, label: t("nav.revenue"), labelKey: "Revenue", href: "/revenue-intelligence", aiPowered: true },
    { icon: Crown, label: t("nav.leadership"), labelKey: "Leadership", href: "/marketplace", aiPowered: true },
    { icon: Users, label: t("nav.teams"), labelKey: "Teams", href: "/teams", aiPowered: true },
    { icon: Search, label: t("nav.competitorIntelligence"), labelKey: "Competitor Intelligence", href: "/dreampulse", aiPowered: true },
    { icon: Play, label: "Tutorial", labelKey: "Tutorial", href: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID", aiPowered: false, isExternal: true },
  ]
  
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
      // Update notifications when relevant data changes
      if (e.key === 'dreamscale:tasks' || e.key === 'dreamscale:reminders' || 
          e.key === 'bizora:conversations') {
        setNotificationUpdate(prev => prev + 1)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(() => {
      loadSavedPulses()
    }, 2000)
    
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
      case "Leadership": return false // Notifications disabled - users create content on their own
      case "Teams": return false // Notifications disabled - users create content on their own
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
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col ${inter.className}`} style={{ position: 'fixed', top: 0, left: 0, height: '100dvh', willChange: 'transform', transform: 'translateZ(0)' }}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
            <Image 
              src="/Logo.png" 
              alt="DreamScale Logo" 
              width={32} 
              height={32} 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 relative inline-block overflow-hidden">
            DreamScale
            <span className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white dark:via-cyan-200 to-transparent opacity-70 dark:opacity-90 animate-text-shimmer-sweep"></span>
            </span>
          </span>
        </div>
      </div>

      {/* Navigation Items - Scrollable if needed */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1" style={{ minHeight: 0, maxHeight: 'calc(100vh - 200px)' }}>
        {navigationItems.map((item, index) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname === item.href || pathname.startsWith(item.href + "/")
          const isDreamPulse = item.labelKey === "Competitor Intelligence"
          const isTutorial = item.labelKey === "Tutorial"
          const isExternal = (item as any).isExternal
          
          return (
            <div key={index} className="space-y-1">
              {isExternal ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                    "!text-blue-600 dark:!text-white !bg-gray-100 dark:!bg-transparent hover:!bg-gray-200 dark:hover:!bg-gray-800"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 !text-blue-600 dark:!text-white" />
                  <span className="flex-1 !text-blue-600 dark:!text-white">{item.label}</span>
                  {isTutorial && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white font-semibold">
                      WATCH
                    </span>
                  )}
                </a>
              ) : (
              <Link
                href={item.href}
                onClick={(e) => {
                  handleNavClick(item.labelKey)
                  // Show loading overlay for Bizora AI only if not already on the page
                  if (item.labelKey === "Bizora AI" && pathname !== "/bizora") {
                    setOpeningBizora(true)
                    // Navigate immediately - overlay will hide quickly when page loads
                    router.push(item.href)
                    e.preventDefault()
                  }
                  // For all other navigation, navigate immediately without delay
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "!bg-Blue-700 dark:!bg-Blue-900 !text-white dark:!text-white ring-2 ring-white/30 shadow-lg" 
                    : "!text-blue-600 dark:!text-white !bg-gray-100 dark:!bg-transparent hover:!bg-gray-200 dark:hover:!bg-gray-800"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "!text-white" : "!text-blue-600 dark:!text-white"
                  )}
                />
                <span 
                  className={cn(
                    "flex-1",
                    item.labelKey === "Bizora AI" && !isActive ? "bizora-ai-text" : "",
                    isActive ? "!text-white" : item.labelKey === "Bizora AI" ? "" : "!text-blue-600 dark:!text-white"
                  )}
                >
                  {item.label}
                </span>
                
                {/* AI Badge */}
                {item.aiPowered && (
                  <span className={cn(
                    "text-[11px] font-bold transition-all duration-300",
                    isActive ? "!text-white dark:!text-white" : "!text-blue-600 dark:!text-white"
                  )}>
                    AI
                  </span>
                )}

                {/* Notification Badge - Red dot for urgent items */}
                {shouldShowNotification(item.labelKey) && (
                  <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
                )}
              </Link>
              )}
              
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

      {/* Feedback Button - Fixed at bottom of sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <Link
          href="/feedback"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <MessageSquare className="w-5 h-5 flex-shrink-0" />
          <span>Feedback</span>
        </Link>
      </div>
    </aside>
  )
}

