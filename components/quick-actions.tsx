"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, Crown, Users, Settings } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getNotificationStatus, hasUnseenUpdates, markFeatureAsSeen } from "@/lib/notifications"

const quickActions = [
  {
    icon: DollarSign,
    title: "Revenue",
    description: "AI-powered revenue growth engine",
    iconColor: "text-[#22c55e]", // Green
    href: "/revenue",
    hasNotification: false,
  },
  {
    icon: Crown,
    title: "Leadership",
    description: "AI-powered leadership coaching and tools",
    iconColor: "text-[#f59e0b]", // Amber
    href: "/marketplace",
    hasNotification: false,
  },
  {
    icon: Users,
    title: "Teams",
    description: "AI-powered team optimization and management",
    iconColor: "text-[#3b82f6]", // Blue
    href: "/teams",
    hasNotification: false,
  },
  {
    icon: Settings,
    title: "Systems",
    description: "AI-powered operational systems builder",
    iconColor: "text-[#8b5cf6]", // Purple
    href: "/revenue",
    hasNotification: false,
  },
]

export function QuickActions() {
  const [notifications, setNotifications] = useState({
    hasCalendarReminders: false,
    hasTaskReminders: false,
    hasChatNotifications: false,
    hasWorkflowNotifications: false,
  })
  
  useEffect(() => {
    // Check for notifications on mount and periodically
    const checkNotifications = () => {
      setNotifications(getNotificationStatus())
    }
    
    checkNotifications()
    
    // Check every 30 seconds for new notifications
    const interval = setInterval(checkNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Function to determine if a card should show notification
  const shouldShowNotification = (title: string) => {
    switch (title) {
      case "Revenue": return hasUnseenUpdates('revenue')
      case "Leadership": return hasUnseenUpdates('pitchpoint')
      case "Teams": return hasUnseenUpdates('teams')
      case "Systems": return hasUnseenUpdates('flowmatch')
      default: return false
    }
  }

  // Function to handle card clicks
  const handleCardClick = (title: string) => {
    switch (title) {
      case "Revenue": markFeatureAsSeen('revenue'); break
      case "Leadership": markFeatureAsSeen('pitchpoint'); break
      case "Teams": markFeatureAsSeen('teams'); break
      case "Systems": markFeatureAsSeen('flowmatch'); break
    }
  }
  return (
    <div className="quick-actions">
      <h2 className="text-2xl font-bold mb-6 text-foreground">{"Jump back in"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href} onClick={() => handleCardClick(action.title)}>
            <Card className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 hover:bg-blue-600 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer group relative h-full quick-action-card">
              {/* Red Notification Badge */}
              {shouldShowNotification(action.title) && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm border border-white dark:border-gray-800 z-10">
                </div>
              )}
              
              {/* Icon */}
              <div className="mb-4">
                <action.icon className={`w-8 h-8 ${action.iconColor} transition-colors duration-300`} />
              </div>
              
              {/* Title */}
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-blue-400 transition-colors duration-300">
                {action.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-white group-hover:text-white dark:group-hover:text-blue-400 transition-colors duration-300">
                {action.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
