'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type SessionData = {
  email: string | null
  calendarEvents: any[]
  hypeos: {
    user: any
    tasks: any[]
    miniWins: any[]
    quests: any[]
    tasksLastDate?: string | null
    allGoals?: any[]
    redeemedRewards?: Array<{
      rewardId: number
      redeemedAt: string
      downloadLink?: string
      token?: string
    }>
  }
  chat: {
    conversations: any[]
  }
  systems: {
    systems: any[]
    savedSOPs?: Array<{
      id: string
      title: string
      systemName: string
      workflowName: string
      content: string
      timestamp: Date | string
    }>
  }
  entrepreneurProfile: {
    name: string | null
    businessName: string | null
    industry: string | string[] | null
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
    businessStage: string | string[] | null
    revenueGoal: string | string[] | null
    targetMarket: string | string[] | null
    teamSize: string | string[] | null
    primaryRevenue: string | string[] | null
    customerAcquisition: string | string[] | null
    monthlyRevenue: string | string[] | null
    keyMetrics: string | string[] | null
    growthStrategy: string | string[] | null
    biggestGoal: string | string[] | null
    goals: string[]
    challenges: string | string[]
    mindsetAnswers: Record<string, string>
    hobbies: string[]
    favoriteSong: string | null
    onboardingCompleted: boolean
  }
  dailyMood: {
    date: string
    mood: string
    timestamp: number
  } | null
  tasksData?: {
    daily: any[]
    weekly: any[]
    monthly: any[]
    yearly: any[]
  }
  hasSeenWelcome?: boolean
  [key: string]: any
}

type SessionContextType = {
  sessionData: SessionData
  updateEmail: (email: string) => void
  updateCalendarEvents: (events: any[]) => void
  updateHypeOSData: (data: any) => void
  updateChatData: (data: any) => void
  updateSystemsData: (data: any) => void
  updateEntrepreneurProfile: (data: Partial<SessionData['entrepreneurProfile']>) => void
  updateDailyMood: (mood: string) => void
  updateTasksData: (data: { daily: any[], weekly: any[], monthly: any[], yearly: any[] }) => void
  updateSessionData: (key: string, data: any) => void
  clearSession: () => void
  isSessionActive: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const INITIAL_DATA: SessionData = {
  email: null,
  calendarEvents: [],
  hypeos: {
    user: null,
    tasks: [],
    miniWins: [],
    quests: [],
    redeemedRewards: []
  },
  chat: {
    conversations: []
  },
  systems: {
    systems: [],
    savedSOPs: []
  },
  entrepreneurProfile: {
    name: null,
    businessName: null,
    industry: null,
    experienceLevel: null,
    businessStage: null,
    revenueGoal: null,
    targetMarket: null,
    teamSize: null,
    primaryRevenue: null,
    customerAcquisition: null,
    monthlyRevenue: null,
    keyMetrics: null,
    growthStrategy: null,
    biggestGoal: null,
    goals: [],
    challenges: [],
    mindsetAnswers: {},
    hobbies: [],
    favoriteSong: null,
    onboardingCompleted: false
  },
  dailyMood: null
}

// Helper function to get storage key for a specific email
function getStorageKey(email: string | null): string {
  if (!email) return 'dreamscale_session'
  // Normalize email (lowercase, trim) for consistent storage
  const normalizedEmail = email.toLowerCase().trim()
  return `dreamscale_session_${normalizedEmail}`
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionData, setSessionData] = useState<SessionData>(INITIAL_DATA)
  const [mounted, setMounted] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  // Load data for a specific email
  const loadUserData = useCallback((email: string | null) => {
    if (!email) {
      setSessionData(INITIAL_DATA)
      setIsSessionActive(false)
      return
    }

    try {
      const storageKey = getStorageKey(email)
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        const parsedData = JSON.parse(stored)
        // Ensure email is set in the loaded data
        parsedData.email = email
        setSessionData(parsedData)
        setIsSessionActive(true)
        console.log(`✅ Loaded data for email: ${email}`)
      } else {
        // No existing data for this email - start fresh
        const freshData = { ...INITIAL_DATA, email }
        setSessionData(freshData)
        setIsSessionActive(true)
        console.log(`🆕 Starting fresh session for new email: ${email}`)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // On error, start fresh
      const freshData = { ...INITIAL_DATA, email }
      setSessionData(freshData)
      setIsSessionActive(true)
    }
  }, [])

  // Initial load - check for any existing session
  useEffect(() => {
    setMounted(true)
    
    try {
      // First, check if there's a current email stored
      const lastEmail = localStorage.getItem('dreamscale_current_email')
      if (lastEmail) {
        setCurrentEmail(lastEmail)
        loadUserData(lastEmail)
      } else {
        // Check for legacy session (backward compatibility)
        const legacySession = localStorage.getItem('dreamscale_session')
        if (legacySession) {
          try {
            const parsedData = JSON.parse(legacySession)
            if (parsedData.email) {
              // Migrate legacy session to email-keyed storage
              const storageKey = getStorageKey(parsedData.email)
              localStorage.setItem(storageKey, legacySession)
              localStorage.setItem('dreamscale_current_email', parsedData.email)
              setCurrentEmail(parsedData.email)
              loadUserData(parsedData.email)
            }
          } catch (e) {
            console.error('Error migrating legacy session:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial session:', error)
    }
  }, [loadUserData])

  // Save data whenever it changes (for the current email)
  useEffect(() => {
    if (mounted && currentEmail) {
      // Always save onboarding completion status, even if session isn't "active" yet
      // This ensures onboarding completion persists
      const shouldSave = isSessionActive || sessionData?.entrepreneurProfile?.onboardingCompleted === true
      
      if (shouldSave) {
        try {
          const storageKey = getStorageKey(currentEmail)
          console.log(`💾 Saving session for email: ${currentEmail}`)
          localStorage.setItem(storageKey, JSON.stringify(sessionData))
          // Also store the current email for quick lookup
          localStorage.setItem('dreamscale_current_email', currentEmail)
        } catch (error) {
          console.error('Error saving session:', error)
        }
      }
    }
  }, [sessionData, mounted, isSessionActive, currentEmail])

  const updateEmail = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    
    // If email changed, save current data first, then load new user's data
    if (currentEmail && currentEmail !== normalizedEmail) {
      // Save current user's data before switching
      const storageKey = getStorageKey(currentEmail)
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
        console.log(`💾 Saved data for previous email: ${currentEmail}`)
      } catch (error) {
        console.error('Error saving previous user data:', error)
      }
    }
    
    // Load data for the new email
    setCurrentEmail(normalizedEmail)
    loadUserData(normalizedEmail)
  }, [currentEmail, sessionData, loadUserData])

  const updateCalendarEvents = useCallback((events: any[]) => {
    setSessionData(prev => ({ 
      ...prev, 
      calendarEvents: events 
    }))
  }, [])

  const updateHypeOSData = useCallback((data: any) => {
    setSessionData(prev => {
      // Deep merge to ensure tasks, miniWins, and other arrays are properly preserved
      const updatedHypeos = {
        ...prev.hypeos,
        ...data,
        // Ensure arrays are properly replaced, not merged
        tasks: data.tasks !== undefined ? data.tasks : prev.hypeos?.tasks,
        miniWins: data.miniWins !== undefined ? data.miniWins : prev.hypeos?.miniWins,
        quests: data.quests !== undefined ? data.quests : prev.hypeos?.quests,
        allGoals: data.allGoals !== undefined ? data.allGoals : prev.hypeos?.allGoals,
        redeemedRewards: data.redeemedRewards !== undefined ? data.redeemedRewards : prev.hypeos?.redeemedRewards,
        user: data.user !== undefined ? data.user : prev.hypeos?.user
      };
      
      return {
        ...prev,
        hypeos: updatedHypeos
      };
    });
  }, [])

  const updateChatData = useCallback((data: any) => {
    setSessionData(prev => ({ 
      ...prev, 
      chat: { ...prev.chat, ...data }
    }))
  }, [])

  const updateSystemsData = useCallback((data: any) => {
    setSessionData(prev => ({ 
      ...prev, 
      systems: { ...prev.systems, ...data }
    }))
  }, [])

  const updateEntrepreneurProfile = useCallback((data: Partial<SessionData['entrepreneurProfile']>) => {
    setSessionData(prev => ({
      ...prev,
      entrepreneurProfile: {
        ...prev.entrepreneurProfile,
        ...data
      }
    }))
  }, [])

  const updateDailyMood = useCallback((mood: string) => {
    const today = new Date().toISOString().split('T')[0]
    setSessionData(prev => ({ 
      ...prev, 
      dailyMood: {
        date: today,
        mood,
        timestamp: Date.now()
      }
    }))
  }, [])

  const updateTasksData = useCallback((data: { daily: any[], weekly: any[], monthly: any[], yearly: any[] }) => {
    setSessionData(prev => ({ 
      ...prev, 
      tasksData: data
    }))
  }, [])

  const updateSessionData = useCallback((key: string, data: any) => {
    setSessionData(prev => ({ ...prev, [key]: data }))
  }, [])

  const clearSession = useCallback(() => {
    // Clear current session but keep email-keyed data stored
    // This allows user to log back in with same email and see their data
    setSessionData(INITIAL_DATA)
    setIsSessionActive(false)
    setCurrentEmail(null)
    localStorage.removeItem('dreamscale_current_email')
    // Note: We don't remove the email-keyed data - it stays for when they log back in
    console.log('🚪 Logged out - session cleared, but data preserved for email')
  }, [])

  return (
    <SessionContext.Provider 
      value={{ 
        sessionData, 
        updateEmail, 
        updateCalendarEvents,
        updateHypeOSData,
        updateChatData,
        updateSystemsData,
        updateEntrepreneurProfile,
        updateDailyMood,
        updateTasksData,
        updateSessionData,
        clearSession,
        isSessionActive
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

// Safe hook that returns null if not in provider (for optional usage)
export function useSessionSafe() {
  const context = useContext(SessionContext)
  return context
}
