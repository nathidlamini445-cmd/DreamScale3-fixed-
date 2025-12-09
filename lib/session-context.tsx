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
  }
  chat: {
    conversations: any[]
  }
  systems: {
    systems: any[]
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
    quests: []
  },
  chat: {
    conversations: []
  },
  systems: {
    systems: []
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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionData, setSessionData] = useState<SessionData>(INITIAL_DATA)
  const [mounted, setMounted] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    try {
      const stored = localStorage.getItem('dreamscale_session')
      if (stored) {
        const parsedData = JSON.parse(stored)
        setSessionData(parsedData)
        setIsSessionActive(!!parsedData.email)
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Always save onboarding completion status, even if session isn't "active" yet
      // This ensures onboarding completion persists
      const shouldSave = isSessionActive || sessionData?.entrepreneurProfile?.onboardingCompleted === true
      
      if (shouldSave) {
        try {
          console.log('💾 Saving session to localStorage:', sessionData)
          localStorage.setItem('dreamscale_session', JSON.stringify(sessionData))
        } catch (error) {
          console.error('Error saving session:', error)
        }
      }
    }
  }, [sessionData, mounted, isSessionActive])

  const updateEmail = useCallback((email: string) => {
    setSessionData(prev => ({ ...prev, email }))
    setIsSessionActive(true)
  }, [])

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

  const updateSessionData = useCallback((key: string, data: any) => {
    setSessionData(prev => ({ ...prev, [key]: data }))
  }, [])

  const clearSession = useCallback(() => {
    setSessionData(INITIAL_DATA)
    setIsSessionActive(false)
    localStorage.removeItem('dreamscale_session')
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
