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
import { Target, Flame, Zap, Trophy, ArrowRight, Clock, AlertTriangle, ArrowLeft, Calendar, TrendingUp, DollarSign, User, Rocket, BookOpen, Building, Dumbbell, Palette, GraduationCap, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [allGoals, setAllGoals] = useState<User[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCreatingNewGoal, setIsCreatingNewGoal] = useState(false) // Flag to prevent auto-close
  const [isLoading, setIsLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null)
  const [streakMessage, setStreakMessage] = useState<string>('')
  const [streakInDanger, setStreakInDanger] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [taskGenerationProgress, setTaskGenerationProgress] = useState(0)

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
    // CRITICAL: If user is actively creating a new goal, don't interfere!
    if (isCreatingNewGoal) {
      console.log('⏳ User is creating new goal, skipping data reload')
      return
    }
    
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
        setAllGoals(goalsList)
        // Only hide onboarding if not explicitly creating a new goal
        if (!showOnboarding) {
          setShowOnboarding(false)
        }
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
            setAllGoals(goalsList)
            // Only hide onboarding if not explicitly creating a new goal
            if (!showOnboarding) {
              setShowOnboarding(false)
            }
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
  
  // Delete goal function
  const handleDeleteGoal = () => {
    if (!user) return
    
    const goalId = user.goalTitle + '-' + user.category
    const updatedGoals = allGoals.filter(g => (g.goalTitle + '-' + g.category) !== goalId)
    
    // Update state
    setAllGoals(updatedGoals)
    setShowDeleteConfirm(false)
    
    // If there are remaining goals, switch to the first one
    if (updatedGoals.length > 0) {
      setUser(updatedGoals[0])
    } else {
      setUser(null)
      setShowOnboarding(true)
    }
    
    // Save to session context
    if (sessionContext?.updateHypeOSData) {
      sessionContext.updateHypeOSData({
        user: updatedGoals.length > 0 ? updatedGoals[0] : null,
        allGoals: updatedGoals,
        tasks: [],
        miniWins: [],
        quests: []
      })
    }
    
    // Save to localStorage
    try {
      if (typeof window !== 'undefined') {
        const existingSession = localStorage.getItem('dreamscale_session')
        const sessionToUpdate = existingSession ? JSON.parse(existingSession) : {}
        sessionToUpdate.hypeos = {
          ...sessionToUpdate.hypeos,
          user: updatedGoals.length > 0 ? updatedGoals[0] : null,
          allGoals: updatedGoals
        }
        localStorage.setItem('dreamscale_session', JSON.stringify(sessionToUpdate))
        console.log('✅ Goal deleted! Remaining goals:', updatedGoals.length)
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  useEffect(() => {
    // Don't reload data if user is actively creating a new goal
    if (isCreatingNewGoal || showOnboarding) {
      console.log('⏸️ Skipping data reload - user is in onboarding')
      return
    }
    loadUserData()
  }, [authUser?.id])

  // Listen for storage changes - BUT NOT when creating a new goal
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Don't set up polling if user is creating a new goal
    if (isCreatingNewGoal || showOnboarding) {
      console.log('⏸️ Polling paused - user is creating new goal')
      return
    }

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamscale_session' && !isCreatingNewGoal && !showOnboarding) {
        loadUserData()
      }
    }

    // Listen for visibility changes (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isCreatingNewGoal && !showOnboarding) {
        loadUserData()
      }
    }

    // Poll for changes every 5 seconds (reduced frequency, and only when not creating)
    const interval = setInterval(() => {
      if (!isCreatingNewGoal && !showOnboarding) {
        loadUserData()
      }
    }, 5000)

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [authUser?.id, isCreatingNewGoal, showOnboarding])

  const handleOnboardingComplete = async (userData: User) => {
    // Reset the creating flag
    setIsCreatingNewGoal(false)
    setShowOnboarding(false)
    setUser(userData)
    
    // Show loading screen and generate AI tasks
    setIsGeneratingTasks(true)
    setTaskGenerationProgress(0)
    
    // Get existing goals to ADD to them (not replace)
    let existingGoals: User[] = allGoals.length > 0 ? [...allGoals] : []
    let existingTasks: any[] = []
    let existingMiniWins: any[] = []
    let existingQuests: any[] = []
    
    try {
      if (typeof window !== 'undefined') {
        const existingSession = localStorage.getItem('dreamscale_session')
        if (existingSession) {
          const parsed = JSON.parse(existingSession)
          // Only use localStorage goals if state is empty
          if (existingGoals.length === 0) {
            existingGoals = parsed?.hypeos?.allGoals || []
          }
          existingTasks = parsed?.hypeos?.tasks || []
          existingMiniWins = parsed?.hypeos?.miniWins || []
          existingQuests = parsed?.hypeos?.quests || []
        }
      }
    } catch (e) {
      console.error('Error loading existing goals:', e)
    }
    
    // Check if goal already exists (by title + category)
    const goalId = userData.goalTitle + '-' + userData.category
    const existingIndex = existingGoals.findIndex(g => (g.goalTitle + '-' + g.category) === goalId)
    
    let updatedGoals: User[]
    if (existingIndex >= 0) {
      // Update existing goal
      updatedGoals = [...existingGoals]
      updatedGoals[existingIndex] = userData
    } else {
      // Add new goal
      updatedGoals = [...existingGoals, userData]
    }
    
    // Update state with all goals
    setAllGoals(updatedGoals)
    
    // Generate AI tasks using Bizora AI / Task Generation API
    const startTime = Date.now()
    try {
      setTaskGenerationProgress(10)
      console.log('🤖 Starting AI task generation for goal:', userData.goalTitle)
      
      // Get entrepreneur profile from session if available
      const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
      
      // Prepare onboarding data for AI
      const onboardingData = {
        businessName: entrepreneurProfile?.businessName || userData.goalTitle || 'their business',
        industry: entrepreneurProfile 
          ? (Array.isArray(entrepreneurProfile.industry) 
              ? entrepreneurProfile.industry[0] 
              : entrepreneurProfile.industry || 'General')
          : (userData.category || 'General'),
        businessStage: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.businessStage) 
              ? entrepreneurProfile.businessStage[0] 
              : entrepreneurProfile.businessStage || 'Early Stage')
          : 'Early Stage',
        challenges: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.challenges) 
              ? entrepreneurProfile.challenges 
              : (entrepreneurProfile.challenges ? [entrepreneurProfile.challenges] : []))
          : [],
        revenueGoal: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.revenueGoal) 
              ? entrepreneurProfile.revenueGoal[0] 
              : entrepreneurProfile.revenueGoal)
          : userData.goalTarget,
        biggestGoal: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.biggestGoal)
              ? entrepreneurProfile.biggestGoal[0] 
              : entrepreneurProfile.biggestGoal || userData.goalTitle)
          : userData.goalTitle,
        targetMarket: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.targetMarket) 
              ? entrepreneurProfile.targetMarket[0] 
              : entrepreneurProfile.targetMarket)
          : undefined,
        teamSize: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.teamSize) 
              ? entrepreneurProfile.teamSize[0] 
              : entrepreneurProfile.teamSize)
          : undefined,
        monthlyRevenue: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.monthlyRevenue) 
              ? entrepreneurProfile.monthlyRevenue[0] 
              : entrepreneurProfile.monthlyRevenue)
          : undefined,
        primaryRevenue: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.primaryRevenue) 
              ? entrepreneurProfile.primaryRevenue[0] 
              : entrepreneurProfile.primaryRevenue)
          : undefined,
        growthStrategy: entrepreneurProfile
          ? (Array.isArray(entrepreneurProfile.growthStrategy) 
              ? entrepreneurProfile.growthStrategy[0] 
              : entrepreneurProfile.growthStrategy)
          : undefined
      }
      
      // Simulate progress while API call happens (for better UX)
      setTaskGenerationProgress(20)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setTaskGenerationProgress(40)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Give AI more time
      
      // Call AI task generation API
      console.log('📤 Calling AI task generation API with data:', onboardingData)
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingData })
      })
      
      setTaskGenerationProgress(65)
      await new Promise(resolve => setTimeout(resolve, 2000)) // More processing time
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error || !data.tasks) {
        throw new Error(data.error || 'Invalid response from AI')
      }
      
      setTaskGenerationProgress(75)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert AI tasks to HypeOS format (use daily tasks, select 4)
      const dailyTasks = data.tasks.daily || []
      const selectedTasks = dailyTasks.slice(0, 4).map((task: any, index: number) => ({
        id: index + 1,
        title: task.title,
        description: task.description || '',
        completed: false,
        points: task.priority === 'high' ? 250 : task.priority === 'medium' ? 150 : 100,
        impact: (task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        category: task.category?.toLowerCase() || 'general',
        estimatedTime: '45 min',
        howToComplete: undefined
      }))
      
      // Use AI-generated mini wins if available
      if (data.miniWins && Array.isArray(data.miniWins) && data.miniWins.length > 0) {
        existingMiniWins = data.miniWins.map((win: any, index: number) => ({
          id: index + 1,
          title: win.title || `Mini win ${index + 1}`,
          description: win.description || '',
          completed: false,
          points: win.points || 25,
          time: win.time || '5 min',
          category: win.category?.toLowerCase() || 'general',
          difficulty: 'easy' as const
        }))
        console.log('✅ AI mini wins generated:', existingMiniWins.length, existingMiniWins)
      } else {
        // If AI didn't generate mini wins, create personalized ones based on goal
        console.warn('⚠️ No mini wins from AI, creating personalized ones based on goal')
        const goalTitle = userData.goalTitle || 'your goal'
        existingMiniWins = [
          { id: 1, title: `Quick research on ${goalTitle}`, completed: false, points: 25, time: '5 min', category: 'research', difficulty: 'easy' as const },
          { id: 2, title: 'Write down one action step for today', completed: false, points: 30, time: '3 min', category: 'planning', difficulty: 'easy' as const },
          { id: 3, title: 'Engage with 3 posts in your niche', completed: false, points: 20, time: '2 min', category: 'engagement', difficulty: 'easy' as const }
        ]
        console.log('✅ Created fallback mini wins:', existingMiniWins.length)
      }
      
      // Use AI-generated quests if available
      if (data.quests && Array.isArray(data.quests) && data.quests.length > 0) {
        existingQuests = data.quests.map((quest: any, index: number) => ({
          id: `quest-${index + 1}`,
          title: quest.title || `Quest ${index + 1}`,
          description: quest.description || '',
          current: 0,
          target: quest.target || 3,
          completed: false,
          reward: quest.reward || 25,
          type: quest.type || 'tasks'
        }))
        console.log('✅ AI quests generated:', existingQuests.length, existingQuests)
      } else {
        // If AI didn't generate quests, create default ones
        console.warn('⚠️ No quests from AI, creating default ones')
        existingQuests = [
          { id: 'quest-1', title: 'Earn 50 XP', description: 'Complete tasks to earn experience points', current: 0, target: 50, completed: false, reward: 25, type: 'xp' },
          { id: 'quest-2', title: 'Complete 3 tasks', description: 'Finish your daily task list', current: 0, target: 3, completed: false, reward: 30, type: 'tasks' },
          { id: 'quest-3', title: 'Complete 2 high-impact tasks', description: 'Focus on high-impact activities', current: 0, target: 2, completed: false, reward: 40, type: 'performance' },
          { id: 'quest-4', title: 'Get 5 in a row correct', description: 'Complete tasks without skipping', current: 0, target: 5, completed: false, reward: 35, type: 'streak' }
        ]
        console.log('✅ Created fallback quests:', existingQuests.length)
      }
      
      // Use generated tasks instead of existing ones
      existingTasks = selectedTasks
      
      setTaskGenerationProgress(100)
      console.log('✅ AI task generation successful:', selectedTasks.length, 'tasks')
      console.log('✅ AI mini wins generated:', existingMiniWins.length)
      console.log('✅ AI quests generated:', existingQuests.length)
      
      // Ensure minimum 50 seconds total wait time for proper generation
      const minWaitTime = 50000 // 50 seconds
      const elapsed = Date.now() - startTime
      const remainingWait = Math.max(0, minWaitTime - elapsed)
      
      if (remainingWait > 0) {
        // Show progress animation during wait
        const progressSteps = 20
        const stepTime = remainingWait / progressSteps
        for (let i = 0; i < progressSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepTime))
          // Keep progress at 100% but show we're finalizing
        }
      }
      
    } catch (error: any) {
      console.warn('⚠️ AI task generation failed, will use generic tasks:', error.message)
      // Continue with empty tasks - HypeOS will generate generic ones
      setTaskGenerationProgress(100)
      
      // Still wait ~50 seconds even on error for consistent UX
      const minWaitTime = 50000
      const elapsed = Date.now() - startTime
      const remainingWait = Math.max(0, minWaitTime - elapsed)
      if (remainingWait > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingWait))
      }
    }
    
    // CRITICAL: Ensure we always have mini wins and quests (even if AI didn't generate them)
    if (existingMiniWins.length === 0) {
      console.warn('⚠️ No mini wins found, creating fallback ones')
      existingMiniWins = [
        { id: 1, title: `Quick research on ${userData.goalTitle}`, completed: false, points: 25, time: '5 min', category: 'research', difficulty: 'easy' as const },
        { id: 2, title: 'Write down one action step', completed: false, points: 30, time: '3 min', category: 'planning', difficulty: 'easy' as const },
        { id: 3, title: 'Engage with 3 posts in your niche', completed: false, points: 20, time: '2 min', category: 'engagement', difficulty: 'easy' as const }
      ]
    }
    
    if (existingQuests.length === 0) {
      console.warn('⚠️ No quests found, creating fallback ones')
      existingQuests = [
        { id: 'quest-1', title: 'Earn 50 XP', description: 'Complete tasks to earn experience points', current: 0, target: 50, completed: false, reward: 25, type: 'xp' },
        { id: 'quest-2', title: 'Complete 3 tasks', description: 'Finish your daily task list', current: 0, target: 3, completed: false, reward: 30, type: 'tasks' },
        { id: 'quest-3', title: 'Complete 2 high-impact tasks', description: 'Focus on high-impact activities', current: 0, target: 2, completed: false, reward: 40, type: 'performance' },
        { id: 'quest-4', title: 'Get 5 in a row correct', description: 'Complete tasks without skipping', current: 0, target: 5, completed: false, reward: 35, type: 'streak' }
      ]
    }
    
    console.log('💾 Final data to save:', {
      tasks: existingTasks.length,
      miniWins: existingMiniWins.length,
      quests: existingQuests.length
    })
    
    // Save to session with generated tasks
    if (sessionContext?.updateHypeOSData) {
      sessionContext.updateHypeOSData({
        user: userData,
        allGoals: updatedGoals,
        tasks: existingTasks,
        miniWins: existingMiniWins,
        quests: existingQuests
      })
      console.log('✅ Saved to session context')
    }
    
    // Also save to localStorage
    try {
      if (typeof window !== 'undefined') {
        const existingSession = localStorage.getItem('dreamscale_session')
        const sessionToUpdate = existingSession ? JSON.parse(existingSession) : {}
        sessionToUpdate.hypeos = {
          ...sessionToUpdate.hypeos,
          user: userData,
          allGoals: updatedGoals,
          tasks: existingTasks,
          miniWins: existingMiniWins,
          quests: existingQuests
        }
        localStorage.setItem('dreamscale_session', JSON.stringify(sessionToUpdate))
        console.log('✅ Goal and tasks saved to localStorage!', {
          goals: updatedGoals.length, 
          tasks: existingTasks.length,
          miniWins: existingMiniWins.length,
          quests: existingQuests.length
        })
      }
    } catch (error) {
      console.error('Error saving Venture Quest data:', error)
    }
    
    // Hide loading and redirect to HypeOS
    setIsGeneratingTasks(false)
    router.push('/hypeos')
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

  if (isGeneratingTasks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <SidebarNav />
        <main className="pl-64 min-h-screen flex items-center justify-center">
          <div className="max-w-2xl w-full text-center space-y-8 px-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/Logo.png" 
                  alt="DreamScale Logo" 
                  width={80} 
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Generating Your Personalized Tasks
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our AI is analyzing your goal and creating custom tasks just for you...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${taskGenerationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {taskGenerationProgress < 30 && "Connecting to AI..."}
                {taskGenerationProgress >= 30 && taskGenerationProgress < 60 && "Analyzing your business context..."}
                {taskGenerationProgress >= 60 && taskGenerationProgress < 80 && "Generating personalized tasks..."}
                {taskGenerationProgress >= 80 && taskGenerationProgress < 100 && "Finalizing your task list..."}
                {taskGenerationProgress >= 100 && "Almost ready!"}
              </p>
            </div>

            {/* Animated Icons */}
            <div className="flex justify-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-pulse">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.2s' }}>
                <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.4s' }}>
                <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">What's happening?</strong>
                <br />
                We're using AI to understand your business goal and create tasks that are specifically tailored to help you achieve it. This usually takes about 30 seconds.
              </p>
            </div>
          </div>
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

            {/* All Goals - Scrollable List */}
            {allGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Goals ({allGoals.length})
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {allGoals.map((goal, index) => (
                    <Card 
                      key={goal.goalTitle + '-' + goal.category + '-' + index}
                      className={`border bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 ${
                        user?.goalTitle === goal.goalTitle ? 'border-blue-500 dark:border-blue-600' : 'border-gray-200 dark:border-gray-800'
                      }`}
                      onClick={() => {
                        setUser(goal);
                        router.push('/hypeos');
                      }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            {user?.goalTitle === goal.goalTitle ? 'Current Goal' : `Goal ${index + 1}`}
                          </div>
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              setUser(goal); // Set the goal to delete
                              setShowDeleteConfirm(true);
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                            title="Delete this goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {goal.goalTitle}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Target: {goal.goalTarget || 'N/A'} | Timeline: {goal.timeline || 'N/A'}
                          </p>
                        </div>
                        {goal.goalProgress !== undefined && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium text-gray-900 dark:text-white">{goal.goalProgress}%</span>
                            </div>
                            <Progress value={goal.goalProgress} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Delete Confirmation Modal - Sleek Design */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-md mx-4 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Decorative Top Bar */}
                  <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>
                  
                  <div className="p-6">
                    {/* Header with Icon */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 mb-4 shadow-lg">
                        <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Delete Goal?
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This action cannot be undone
                      </p>
                    </div>

                    {/* Goal Preview */}
                    <div className="mb-5">
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
                              Goal to delete
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white break-words mb-1">
                              {user?.goalTitle}
                            </p>
                            {user?.goalTarget && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Target: {user.goalTarget}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Warning Message */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                          All progress, tasks, and data associated with this goal will be <span className="font-semibold">permanently removed</span>.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium h-11 rounded-lg transition-all"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteGoal}
                        className="flex-1 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-11 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Goal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Set New Goal clicked');
                  setIsCreatingNewGoal(true); // Prevent auto-reload from closing the form
                  setShowOnboarding(true);
                }}
                className="h-10 px-5 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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

