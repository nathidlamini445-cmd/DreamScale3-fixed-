'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Target, Flame, Zap, Trophy, ArrowRight, Clock, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSessionSafe } from '@/lib/session-context'

interface User {
  name?: string
  level?: number
  hypePoints?: number
  currentStreak?: number
  longestStreak?: number
  goalProgress?: number
  goalTitle?: string
  goalTarget?: string
  goalCurrent?: string
  category?: string
  timeline?: string
  hasCompletedOnboarding?: boolean
  lastActiveDate?: string
}

// Simple Onboarding Component
function SimpleOnboardingWizard({ onComplete }: { onComplete: (userData: User) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    goalTitle: '',
    category: '',
    timeline: '',
    targetValue: '',
    currentValue: ''
  })

  const categories = [
    { value: 'revenue', label: 'Revenue Growth' },
    { value: 'audience', label: 'Audience Building' },
    { value: 'product', label: 'Product Launch' },
    { value: 'marketing', label: 'Marketing Campaign' },
    { value: 'skills', label: 'Skill Development' },
    { value: 'business', label: 'Business Growth' }
  ]

  const timelines = [
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3 Months' },
    { value: '6-months', label: '6 Months' },
    { value: '1-year', label: '1 Year' }
  ]

  const handleSubmit = () => {
    const userData: User = {
      name: 'User',
      level: 1,
      hypePoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      goalProgress: 0,
      goalTitle: formData.goalTitle,
      goalTarget: formData.targetValue,
      goalCurrent: formData.currentValue,
      category: formData.category,
      timeline: formData.timeline,
      hasCompletedOnboarding: true
    }
    onComplete(userData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Venture Quest! 🚀
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your first goal and start building your streak
        </p>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's your goal?
            </label>
            <input
              type="text"
              value={formData.goalTitle}
              onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
              placeholder="e.g., Earn $10k/month"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select timeline</option>
              {timelines.map(timeline => (
                <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!formData.goalTitle || !formData.category || !formData.timeline}
            className="w-full bg-[#39d2c0] hover:bg-[#39d2c0]/90 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Value
            </label>
            <input
              type="text"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              placeholder="e.g., $10,000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Value
            </label>
            <input
              type="text"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              placeholder="e.g., $2,000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.targetValue || !formData.currentValue}
              className="flex-1 bg-[#39d2c0] hover:bg-[#39d2c0]/90 text-white"
            >
              Create Goal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VentureQuestPage() {
  const sessionContext = useSessionSafe()
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null)
  const [streakMessage, setStreakMessage] = useState<string>('')
  const [streakInDanger, setStreakInDanger] = useState(false)

  // Calculate time remaining until streak breaks
  useEffect(() => {
    if (!user || !user.lastActiveDate) {
      setTimeRemaining(null)
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const lastActive = new Date(user.lastActiveDate || now)
      
      // Get start of today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      // Get start of tomorrow (when streak would break)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Calculate time remaining until midnight
      const msRemaining = tomorrow.getTime() - now.getTime()
      const hoursRemaining = msRemaining / (1000 * 60 * 60)
      const hours = Math.floor(hoursRemaining)
      const minutes = Math.floor((hoursRemaining - hours) * 60)
      
      setTimeRemaining({ hours, minutes })
      
      // Check if user was active today
      const wasActiveToday = lastActive >= today
      const currentStreak = user.currentStreak || 0
      
      if (!wasActiveToday && currentStreak > 0) {
        setStreakInDanger(true)
        if (hoursRemaining <= 2) {
          setStreakMessage(`Only ${hours * 60 + minutes} minutes left - hop on now!`)
        } else if (hoursRemaining <= 6) {
          setStreakMessage(`${hours} hours left - get back on track!`)
        } else {
          setStreakMessage(`${hours} hours left to maintain your streak`)
        }
      } else if (wasActiveToday && currentStreak > 0) {
        setStreakInDanger(false)
        setStreakMessage(`Great job! Keep it going tomorrow`)
      } else {
        setStreakInDanger(false)
        setStreakMessage('')
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    // Check if user has Venture Quest data
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dreamscale_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          const hypeosData = parsed?.hypeos
          const goalsList = hypeosData?.allGoals || []
          const userData = hypeosData?.user
          
          // Check if they have a valid goal
          const hasValidGoal = (goalsList.length > 0 && goalsList[0]?.goalTitle && goalsList[0].goalTitle.trim() !== '') ||
                              (userData?.goalTitle && userData.goalTitle.trim() !== '')
          
          if (hasValidGoal) {
            // Show dashboard
            setUser(userData || goalsList[0])
            setShowOnboarding(false)
          } else {
            // Show onboarding
            setShowOnboarding(true)
          }
        } else {
          // No session data - show onboarding
          setShowOnboarding(true)
        }
      } catch (e) {
        console.error('Error loading Venture Quest data:', e)
        setShowOnboarding(true)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const handleOnboardingComplete = (userData: User) => {
    setUser(userData)
    setShowOnboarding(false)
    
    // Save to session
    if (sessionContext?.updateHypeOSData) {
      sessionContext.updateHypeOSData({
        user: userData,
        allGoals: [userData],
        tasks: [],
        miniWins: [],
        quests: []
      })
    }
    
    // Also save to localStorage
    try {
      if (typeof window !== 'undefined') {
        const existingSession = localStorage.getItem('dreamscale_session')
        const sessionToUpdate = existingSession ? JSON.parse(existingSession) : {}
        sessionToUpdate.hypeos = {
          ...sessionToUpdate.hypeos,
          user: userData,
          allGoals: [userData],
          tasks: [],
          miniWins: [],
          quests: []
        }
        localStorage.setItem('dreamscale_session', JSON.stringify(sessionToUpdate))
      }
    } catch (error) {
      console.error('Error saving Venture Quest data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="pl-64">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39d2c0]"></div>
          </div>
        </main>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="pl-64">
          <div className="p-8">
            <SimpleOnboardingWizard onComplete={handleOnboardingComplete} />
          </div>
        </main>
      </div>
    )
  }

  // Show dashboard if user has data
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SidebarNav />
      <main className="pl-64">
        <div className="p-8">
          <div className="max-w-5xl space-y-8">
            {/* Header with Back Button */}
            <div className="space-y-4">
              <Link href="/tasks">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Venture Quest
                </h1>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`${streakInDanger ? 'border-2 border-orange-500 dark:border-orange-500' : 'border border-gray-200 dark:border-gray-800'} bg-white dark:bg-slate-900`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Flame className={`w-6 h-6 ${streakInDanger ? 'text-orange-500' : 'text-orange-500'}`} />
                    <div>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user?.currentStreak || 0}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">days</span>
                    </div>
                  </div>
                  {timeRemaining && streakInDanger && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {timeRemaining.hours > 0 
                            ? `${timeRemaining.hours}h ${timeRemaining.minutes}m left`
                            : `${timeRemaining.minutes}m left`
                          }
                        </span>
                      </div>
                      {streakMessage && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {streakMessage}
                        </p>
                      )}
                    </div>
                  )}
                  {timeRemaining && !streakInDanger && user?.currentStreak && user.currentStreak > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {timeRemaining.hours > 0 
                            ? `${timeRemaining.hours}h ${timeRemaining.minutes}m until next check-in`
                            : `${timeRemaining.minutes}m until next check-in`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Hype Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user?.hypePoints || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Longest Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <div>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user?.longestStreak || 0}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Goal */}
            {user?.goalTitle && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-5 h-5" />
                    Current Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {user.goalTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Target: {user.goalTarget || 'N/A'} | Timeline: {user.timeline || 'N/A'}
                    </p>
                  </div>
                  {user.goalProgress !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user.goalProgress}%</span>
                      </div>
                      <Progress value={user.goalProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Link href="/hypeos" className="flex-1">
                <Button variant="outline" className="w-full h-10">
                  Go to Full Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowOnboarding(true)}
                className="h-10 px-5"
              >
                Set New Goal
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

