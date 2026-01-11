'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, Flame, Zap, Trophy, ArrowRight, Clock, AlertTriangle, ArrowLeft, Calendar, TrendingUp, DollarSign, User, Rocket, BookOpen, Building, Dumbbell, Palette, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'

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

// Onboarding Wizard Component (proper design)
function OnboardingWizard({ onComplete }: { onComplete: (userData: User) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalDescription: '',
    category: '',
    timeline: '',
    targetValue: '',
    currentValue: ''
  })

  const categories = [
    { value: 'revenue', label: 'Revenue Growth', icon: DollarSign, description: 'Increase monthly income and business revenue' },
    { value: 'audience', label: 'Audience Building', icon: User, description: 'Grow your social media following and email list' },
    { value: 'product', label: 'Product Launch', icon: Rocket, description: 'Create and launch a new product or service' },
    { value: 'marketing', label: 'Marketing Campaign', icon: TrendingUp, description: 'Run successful marketing campaigns' },
    { value: 'skills', label: 'Skill Development', icon: Target, description: 'Learn new skills and improve existing ones' },
    { value: 'content', label: 'Content Creation', icon: BookOpen, description: 'Build a content strategy and create engaging content' },
    { value: 'business', label: 'Business Growth', icon: Building, description: 'Scale your business operations and team' },
    { value: 'fitness', label: 'Health & Fitness', icon: Dumbbell, description: 'Improve physical and mental health' },
    { value: 'creative', label: 'Creative Projects', icon: Palette, description: 'Complete creative projects and artistic goals' },
    { value: 'learning', label: 'Learning & Education', icon: GraduationCap, description: 'Master new subjects and gain certifications' }
  ]

  const timelines = [
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3 Months' },
    { value: '6-months', label: '6 Months' },
    { value: '1-year', label: '1 Year' }
  ]

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLoading(true)
      
      setTimeout(() => {
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
      }, 1000)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Target className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              <div className="absolute inset-0 animate-spin">
                <div className="w-16 h-16 border-2 border-gray-200 dark:border-gray-800 border-t-gray-900 dark:border-t-gray-100 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
            Setting Up Your Journey
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We're preparing your personalized Venture Quest experience
          </p>
          
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse"
                style={{ animationDelay: `${dot * 0.3}s` }}
              />
            ))}
          </div>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
            This will only take a moment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
            Welcome to Venture Quest
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Let's set up your goals and start your journey to success
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep 
                      ? 'bg-gray-900 dark:bg-white' 
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <Card className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span>What do you want to achieve?</span>
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Be specific about what you want to create or accomplish in the next few months
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="goalTitle">Your Main Goal</Label>
                  <Input
                    id="goalTitle"
                    placeholder="e.g., Launch my online course and earn R15k/month"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({...formData, goalTitle: e.target.value})}
                    className="mt-1 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    What specific outcome do you want to achieve?
                  </p>
                </div>

                <div>
                  <Label htmlFor="goalDescription">Why is this important to you?</Label>
                  <Textarea
                    id="goalDescription"
                    placeholder="Describe your motivation and what success looks like for you..."
                    value={formData.goalDescription}
                    onChange={(e) => setFormData({...formData, goalDescription: e.target.value})}
                    className="mt-1 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">What's your main focus area?</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="mt-1 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Choose your primary focus area" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <SelectItem 
                            key={category.value} 
                            value={category.value}
                            className="text-gray-900 dark:text-white focus:bg-gray-50 dark:focus:bg-gray-800"
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white">{category.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span>Set Your Timeline & Success Metrics</span>
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Define when you want to achieve this and how you'll measure success
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="timeline">How long do you want to achieve this?</Label>
                  <Select value={formData.timeline} onValueChange={(value) => setFormData({...formData, timeline: value})}>
                    <SelectTrigger className="mt-1 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Choose your timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800">
                      {timelines.map((timeline) => (
                        <SelectItem 
                          key={timeline.value} 
                          value={timeline.value}
                          className="text-gray-900 dark:text-white focus:bg-gray-50 dark:focus:bg-gray-800"
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <span className="font-medium text-gray-900 dark:text-white">{timeline.label}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {timeline.value === '1-month' && 'Quick wins & momentum'}
                              {timeline.value === '3-months' && 'Solid foundation & growth'}
                              {timeline.value === '6-months' && 'Significant progress & results'}
                              {timeline.value === '1-year' && 'Major transformation & mastery'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentValue">Where are you now?</Label>
                    <Input
                      id="currentValue"
                      placeholder="e.g., R2,500/month, 100 followers, 0 products"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                      className="mt-1 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your current baseline
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="targetValue">Where do you want to be?</Label>
                    <Input
                      id="targetValue"
                      placeholder="e.g., R15,000/month, 10k followers, 3 products"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                      className="mt-1 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your target achievement
                    </p>
                  </div>
                </div>

                {/* Goal Preview */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                    Your Goal Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      {(() => {
                        const category = categories.find(c => c.value === formData.category)
                        const Icon = category?.icon || Target
                        return (
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded">
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        )
                      })()}
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{formData.goalTitle || 'Your goal'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span>Timeline: {timelines.find(t => t.value === formData.timeline)?.label || 'Not set'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span>Progress: {formData.currentValue || 'Current'} → {formData.targetValue || 'Target'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium text-gray-900 dark:text-white"
            >
              Back
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!formData.goalTitle || !formData.category)) ||
                (currentStep === 2 && (!formData.timeline || !formData.targetValue))
              }
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border dark:border-gray-700 font-medium disabled:opacity-50"
            >
              {currentStep === 2 ? (
                <>
                  Start My Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VentureQuestPage() {
  const sessionContext = useSessionSafe()
  const { user: authUser } = useAuth()
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

  // Function to load user data - extracted for reuse
  const loadUserData = () => {
    // CRITICAL: For authenticated users, use session context (Supabase data)
    // For unauthenticated users, check localStorage
    if (authUser?.id) {
      // Authenticated user - get data from session context
      const hypeosData = sessionContext?.sessionData?.hypeos
      const goalsList = hypeosData?.allGoals || []
      const userData = hypeosData?.user
      
      const hasValidGoal = (goalsList.length > 0 && goalsList[0]?.goalTitle && goalsList[0].goalTitle.trim() !== '') ||
                          (userData?.goalTitle && userData.goalTitle.trim() !== '')
      
      if (hasValidGoal) {
        setUser(userData || goalsList[0])
        setShowOnboarding(false)
      } else {
        setShowOnboarding(true)
      }
      setIsLoading(false)
      return
    }
    
    // Only check localStorage for unauthenticated users
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
  }

  useEffect(() => {
    loadUserData()
  }, [authUser?.id, sessionContext?.sessionData?.hypeos])

  // Listen for storage changes and session updates to auto-refresh
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamscale_session') {
        loadUserData()
      }
    }

    // Listen for visibility changes (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserData()
      }
    }

    // Poll for changes every 2 seconds (for same-tab updates)
    const interval = setInterval(() => {
      loadUserData()
    }, 2000)

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [authUser?.id, sessionContext?.sessionData?.hypeos])

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
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
        <SidebarNav />
        <main className="pl-64 min-h-screen flex items-center justify-center overflow-y-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39d2c0]"></div>
        </main>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
        <SidebarNav />
        <main className="pl-64 min-h-screen bg-gray-50 dark:bg-slate-950 overflow-y-auto">
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        </main>
      </div>
    )
  }

  // Show dashboard if user has data
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      <SidebarNav />
      <main className="pl-64 overflow-y-auto">
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

