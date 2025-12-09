"use client"

import { Card } from "@/components/ui/card"
import { Flame, Clock, Target } from "lucide-react"
import { useEffect, useState } from "react"

interface User {
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string | Date
  goalTitle?: string
  hypePoints?: number
}

export function VentureQuestCard() {
  const [user, setUser] = useState<User | null>(null)
  const [motivationalMessage, setMotivationalMessage] = useState<string>("")
  const [subMessage, setSubMessage] = useState<string>("")
  const [hoursUntilMidnight, setHoursUntilMidnight] = useState<number>(24)

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('hypeos:user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          setUser(parsed)
          calculateMessages(parsed)
        } else {
          setMotivationalMessage("🚀 Start your journey today")
          setSubMessage("✨ Build your first streak")
        }
      } catch (e) {
        console.warn('Failed to load Venture Quest user data', e)
        setMotivationalMessage("🚀 Start your journey today")
        setSubMessage("✨ Build your first streak")
      }
    }
  }

  const calculateMessages = (userData: User) => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentStreak = userData.currentStreak || 0
    
    // Calculate hours until midnight
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const hoursRemaining = Math.max(0, (midnight.getTime() - now.getTime()) / (1000 * 60 * 60))
    setHoursUntilMidnight(Math.floor(hoursRemaining))

    // Check if user was active today
    let wasActiveToday = false
    if (userData.lastActiveDate) {
      const lastActive = new Date(userData.lastActiveDate)
      const today = new Date()
      const sameDay = lastActive.getDate() === today.getDate() &&
                     lastActive.getMonth() === today.getMonth() &&
                     lastActive.getFullYear() === today.getFullYear()
      wasActiveToday = sameDay
    }

    // Calculate days since last active
    let daysSinceLastActive = 0
    if (userData.lastActiveDate) {
      const lastActive = new Date(userData.lastActiveDate)
      const today = new Date()
      const daysDiff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )
      daysSinceLastActive = daysDiff
    }

    // Determine messages based on streak status and time
    if (currentStreak === 0) {
      // No streak - encourage to start
      setMotivationalMessage("💪 I know you can do this")
      setSubMessage("🚀 Start your first streak today")
    } else if (daysSinceLastActive > 3) {
      // Streak broken - been away for days - SAD EMOJIS
      setMotivationalMessage("😢 Please come back")
      setSubMessage(`😔 Your ${currentStreak}-day streak is waiting`)
    } else if (daysSinceLastActive > 1) {
      // Streak about to break - missed yesterday
      setMotivationalMessage("🔥 Your streak needs you!")
      setSubMessage("⚡ Hop on to keep it alive")
    } else if (!wasActiveToday && currentStreak > 0) {
      // Has a streak but hasn't been active today - URGENT based on time
      if (hoursRemaining <= 2) {
        // Very urgent - less than 2 hours left
        setMotivationalMessage("⏰ Your streak is about to break!")
        setSubMessage(`🚨 Only ${Math.floor(hoursRemaining * 60)} minutes left - hop on now!`)
      } else if (hoursRemaining <= 6) {
        // Urgent - less than 6 hours left
        setMotivationalMessage("⚠️ Don't let your streak break")
        setSubMessage(`⏳ ${Math.floor(hoursRemaining)} hours left - get back on track!`)
      } else if (currentHour >= 18) {
        // Evening - remind them
        setMotivationalMessage("🌙 Almost there - don't break the chain")
        setSubMessage(`⏰ ${Math.floor(hoursRemaining)} hours left to maintain your streak`)
      } else {
        // Still have time but remind them
        setMotivationalMessage("🔥 Keep your streak alive")
        setSubMessage(`💪 You're on a ${currentStreak}-day streak - don't let it break`)
      }
    } else if (wasActiveToday && currentStreak > 0) {
      // Active today - celebrate and motivate
      if (currentStreak >= 30) {
        setMotivationalMessage("👑 Nothing can stop you now!")
        setSubMessage(`🏆 ${currentStreak} days strong - you're legendary`)
      } else if (currentStreak >= 14) {
        setMotivationalMessage("⚡ You're unstoppable!")
        setSubMessage(`🔥 ${currentStreak} days of consistency - keep it going`)
      } else if (currentStreak >= 7) {
        setMotivationalMessage("🔥 Nothing can stop you now!")
        setSubMessage(`💪 ${currentStreak} days strong - you're on fire`)
      } else if (currentStreak >= 3) {
        setMotivationalMessage("🚀 Keep the momentum going!")
        setSubMessage(`✨ ${currentStreak} days down - you're building something great`)
      } else {
        setMotivationalMessage("💪 You're building something great!")
        setSubMessage(`🌟 ${currentStreak} days strong - keep it up`)
      }
    } else {
      // Default
      setMotivationalMessage("🚀 Start your journey today")
      setSubMessage("✨ Build your first streak")
    }
  }

  useEffect(() => {
    loadUserData()

    // Update hours remaining every minute
    const interval = setInterval(() => {
      loadUserData() // Reload to recalculate messages
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const hoursRemaining = Math.max(0, (midnight.getTime() - now.getTime()) / (1000 * 60 * 60))
      setHoursUntilMidnight(Math.floor(hoursRemaining))
    }, 60000) // Update every minute

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hypeos:user') {
        loadUserData()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const currentStreak = user?.currentStreak || 0
  const hasActiveStreak = currentStreak > 0

  return (
    <div className="venture-quest-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Venture Quest</h2>
      </div>

      <Card 
        className="p-6 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hasActiveStreak 
                ? "bg-orange-100 dark:bg-orange-900/30" 
                : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <Flame className={`w-5 h-5 ${
                hasActiveStreak 
                  ? "text-orange-500" 
                  : "text-gray-400"
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
                <span className={`text-lg font-bold ${
                  hasActiveStreak 
                    ? "text-orange-600 dark:text-orange-400" 
                    : "text-gray-500"
                }`}>
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          </div>
          {!hasActiveStreak && (
            <Target className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Motivational Message */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-base font-semibold text-foreground mb-1">
            {motivationalMessage}
          </p>
          <p className="text-sm text-muted-foreground">
            {subMessage}
          </p>
        </div>

        {/* Additional Info */}
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-muted-foreground">
            {user.longestStreak > 0 && (
              <span>Longest: {user.longestStreak} days</span>
            )}
            {user.goalTitle && (
              <span className="truncate max-w-[200px]">Goal: {user.goalTitle}</span>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
