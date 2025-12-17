"use client"

import { Card } from "@/components/ui/card"
import { Flame, Clock, Target, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useSessionSafe } from "@/lib/session-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface User {
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string | Date
  goalTitle?: string
  goalTarget?: string
  timeline?: string
  hypePoints?: number
  hasCompletedOnboarding?: boolean
}

export function VentureQuestCard() {
  const sessionContext = useSessionSafe()
  const [user, setUser] = useState<User | null>(null)
  const [motivationalMessage, setMotivationalMessage] = useState<string>("")
  const [subMessage, setSubMessage] = useState<string>("")
  const [hoursUntilMidnight, setHoursUntilMidnight] = useState<number>(24)
  const [isStreakInDanger, setIsStreakInDanger] = useState<boolean>(false)

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      try {
        // First, try to load from session context (most reliable)
        const sessionUser = sessionContext?.sessionData?.hypeos?.user
        
        if (sessionUser && sessionUser.goalTitle && sessionUser.hasCompletedOnboarding) {
          // User has real onboarding data - use it
          const userData = {
            currentStreak: sessionUser.currentStreak || 0,
            longestStreak: sessionUser.longestStreak || 0,
            lastActiveDate: sessionUser.lastActiveDate,
            goalTitle: sessionUser.goalTitle,
            goalTarget: sessionUser.goalTarget,
            timeline: sessionUser.timeline,
            hypePoints: sessionUser.hypePoints || 0,
            hasCompletedOnboarding: true
          }
          setUser(userData)
          console.log('📊 Loaded user data:', { goalTarget: userData.goalTarget, timeline: userData.timeline })
          calculateMessages({
            currentStreak: sessionUser.currentStreak || 0,
            longestStreak: sessionUser.longestStreak || 0,
            lastActiveDate: sessionUser.lastActiveDate,
            goalTitle: sessionUser.goalTitle,
            hypePoints: sessionUser.hypePoints || 0
          })
          return
        }
        
        // Check localStorage as fallback, but only if it has valid onboarding data
        const savedUser = localStorage.getItem('hypeos:user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          // Only use if it has a real goal title (not generic/default)
          if (parsed.goalTitle && parsed.goalTitle.trim() !== '' && 
              parsed.goalTitle !== '10k a month' && 
              parsed.goalTitle !== 'Earn R10k/month' &&
              parsed.hasCompletedOnboarding) {
            setUser({
              currentStreak: parsed.currentStreak || 0,
              longestStreak: parsed.longestStreak || 0,
              lastActiveDate: parsed.lastActiveDate,
              goalTitle: parsed.goalTitle,
              goalTarget: parsed.goalTarget,
              timeline: parsed.timeline,
              hypePoints: parsed.hypePoints || 0,
              hasCompletedOnboarding: true
            })
            calculateMessages(parsed)
            return
          }
        }
        
        // No valid user data - show get started message
        setUser(null)
        setMotivationalMessage("🚀 Start your journey today")
        setSubMessage("✨ Create your first goal and build your streak")
      } catch (e) {
        console.warn('Failed to load Venture Quest user data', e)
        setUser(null)
        setMotivationalMessage("🚀 Start your journey today")
        setSubMessage("✨ Create your first goal and build your streak")
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
    let streakInDanger = false
    if (currentStreak === 0) {
      // No streak - encourage to start
      setMotivationalMessage("💪 Ready to start your journey?")
      setSubMessage("🚀 Complete your first task to begin your streak")
    } else if (daysSinceLastActive > 3) {
      // Streak broken - been away for days - but only show if streak is real
      if (currentStreak > 0 && wasActiveToday === false) {
        setMotivationalMessage("🔥 Welcome back!")
        setSubMessage(`💪 Let's build a new ${currentStreak > 0 ? currentStreak : ''}-day streak`)
      } else {
        setMotivationalMessage("💪 Ready to start your journey?")
        setSubMessage("🚀 Complete your first task to begin your streak")
      }
    } else if (daysSinceLastActive > 1) {
      // Streak about to break - missed yesterday
      streakInDanger = true
      setMotivationalMessage("🔥 Your streak needs you!")
      setSubMessage("⚡ Hop on to keep it alive")
    } else if (!wasActiveToday && currentStreak > 0) {
      // Has a streak but hasn't been active today - URGENT based on time
      streakInDanger = true // Streak is in danger!
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
    
    // Set the danger state after all conditions
    setIsStreakInDanger(streakInDanger)
    if (streakInDanger) {
      console.log('🔥 Streak is in danger - shimmer effect should be active')
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
      if (e.key === 'hypeos:user' || e.key === 'dreamscale_session') {
        loadUserData()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [sessionContext?.sessionData?.hypeos?.user])

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
          <p className={`text-sm font-semibold ${isStreakInDanger ? 'shimmer-text' : 'text-muted-foreground'}`} style={isStreakInDanger ? { color: 'rgb(255, 140, 0)' } : undefined}>
            {subMessage}
          </p>
        </div>

        {/* Additional Info */}
        {user && user.goalTitle && user.goalTitle.trim() !== '' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-muted-foreground gap-2">
            {user.longestStreak > 0 && (
              <span>Longest: {user.longestStreak} days</span>
            )}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {user.goalTitle && user.goalTitle !== '10k a month' && user.goalTitle !== 'Earn R10k/month' && (
                <span className="truncate max-w-[200px]">Goal: {user.goalTitle}</span>
              )}
              {user.goalTarget && (
                <span className="text-muted-foreground whitespace-nowrap">
                  {user.goalTarget}
                  {user.timeline && (
                    <> in {user.timeline === '1-month' ? '1 month' : 
                           user.timeline === '3-months' ? '3 months' : 
                           user.timeline === '6-months' ? '6 months' : 
                           user.timeline === '1-year' ? '1 year' : user.timeline}</>
                  )}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation Button - Always show */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/hypeos" className="block">
            <Button 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border dark:border-gray-700 font-medium"
            >
              {user ? (
                <>
                  Go to Venture Quest
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Get Started with Venture Quest
                </>
              )}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
