'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from './supabase-data'

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
  const { user } = useAuth()
  const [sessionData, setSessionData] = useState<SessionData>(INITIAL_DATA)
  const [mounted, setMounted] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState(false)

  // Load data for a specific email (from Supabase if authenticated, localStorage otherwise)
  const loadUserData = useCallback(async (email: string | null) => {
    if (!email) {
      setSessionData(INITIAL_DATA)
      setIsSessionActive(false)
      return
    }

    setIsLoadingFromSupabase(true)

    try {
      // If user is authenticated, load from Supabase
      if (user?.id) {
        try {
          // Load all data from Supabase in parallel
          const [
            sessionDataFromDB,
            calendarEvents,
            hypeosData,
            chatConversations,
            systemsData,
            dailyMood,
            tasksData
          ] = await Promise.all([
            supabaseData.loadSessionData(user.id),
            supabaseData.loadCalendarEvents(user.id),
            supabaseData.loadHypeOSData(user.id),
            supabaseData.loadChatConversations(user.id),
            supabaseData.loadSystemsData(user.id),
            supabaseData.loadDailyMood(user.id, new Date().toISOString().split('T')[0]),
            supabaseData.loadTasksData(user.id)
          ])

          // Merge all data into session data
          const mergedData: SessionData = {
            email: email,
            calendarEvents: calendarEvents || [],
            hypeos: hypeosData || INITIAL_DATA.hypeos,
            chat: {
              conversations: chatConversations || []
            },
            systems: systemsData || INITIAL_DATA.systems,
            entrepreneurProfile: sessionDataFromDB?.entrepreneurProfile || INITIAL_DATA.entrepreneurProfile,
            dailyMood: dailyMood ? {
              date: dailyMood.date,
              mood: dailyMood.mood,
              timestamp: dailyMood.timestamp
            } : null,
            tasksData: tasksData || undefined,
            ...sessionDataFromDB
          }

          setSessionData(mergedData)
          setIsSessionActive(true)
          console.log(`✅ Loaded data from Supabase for user: ${email}`)

          // Migrate localStorage data to Supabase if it exists and is newer
          const storageKey = getStorageKey(email)
          const localStored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
          if (localStored) {
            try {
              const localData = JSON.parse(localStored)
              // Check if local data is more recent or has data not in Supabase
              // This is a simple migration - in production, you'd want more sophisticated logic
              console.log('📦 Found localStorage data, will sync to Supabase on next save')
            } catch (e) {
              console.warn('Error parsing localStorage data for migration:', e)
            }
          }
        } catch (supabaseError) {
          console.error('Error loading from Supabase, falling back to localStorage:', supabaseError)
          // Fall through to localStorage fallback
        }
      }

      // Fallback to localStorage (for unauthenticated users or if Supabase fails)
      const storageKey = getStorageKey(email)
      const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      
      if (stored) {
        const parsedData = JSON.parse(stored)
        parsedData.email = email
        setSessionData(parsedData)
        setIsSessionActive(true)
        console.log(`✅ Loaded data from localStorage for email: ${email}`)
      } else {
        // No existing data - start fresh
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
    } finally {
      setIsLoadingFromSupabase(false)
    }
  }, [user])

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

  // Save data whenever it changes (to Supabase if authenticated, localStorage otherwise)
  useEffect(() => {
    if (!mounted || !currentEmail || isLoadingFromSupabase) return
    
    // Always save onboarding completion status, even if session isn't "active" yet
    const shouldSave = isSessionActive || sessionData?.entrepreneurProfile?.onboardingCompleted === true
    
    if (!shouldSave) return

    const saveData = async () => {
      try {
        // If user is authenticated, save to Supabase
        if (user?.id) {
          try {
            // Save all data to Supabase in parallel
            await Promise.all([
              supabaseData.saveSessionData(user.id, {
                entrepreneurProfile: sessionData.entrepreneurProfile,
                hasSeenWelcome: sessionData.hasSeenWelcome
              }),
              sessionData.calendarEvents.length > 0 && supabaseData.saveCalendarEvents(user.id, sessionData.calendarEvents),
              sessionData.hypeos && supabaseData.saveHypeOSData(user.id, sessionData.hypeos),
              sessionData.chat?.conversations && sessionData.chat.conversations.length > 0 && 
                supabaseData.saveChatConversations(user.id, sessionData.chat.conversations),
              sessionData.systems && supabaseData.saveSystemsData(user.id, sessionData.systems),
              sessionData.dailyMood && supabaseData.saveDailyMood(
                user.id,
                sessionData.dailyMood.mood,
                sessionData.dailyMood.date,
                sessionData.dailyMood.timestamp
              ),
              sessionData.tasksData && supabaseData.saveTasksData(user.id, sessionData.tasksData)
            ])
            console.log(`💾 Saved session data to Supabase for user: ${currentEmail}`)
          } catch (supabaseError) {
            console.error('Error saving to Supabase, falling back to localStorage:', supabaseError)
            // Fall through to localStorage fallback
          }
        }

        // Always save to localStorage as backup
        const storageKey = getStorageKey(currentEmail)
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
        localStorage.setItem('dreamscale_current_email', currentEmail)
        console.log(`💾 Saved session to localStorage for email: ${currentEmail}`)
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }

    // Debounce saves to avoid too many writes
    const timeoutId = setTimeout(saveData, 500)
    return () => clearTimeout(timeoutId)
  }, [sessionData, mounted, isSessionActive, currentEmail, user, isLoadingFromSupabase])

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

  const updateCalendarEvents = useCallback(async (events: any[]) => {
    setSessionData(prev => ({ 
      ...prev, 
      calendarEvents: events 
    }))
    
    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        await supabaseData.saveCalendarEvents(user.id, events)
      } catch (error) {
        console.error('Error saving calendar events to Supabase:', error)
      }
    }
  }, [user])

  const updateHypeOSData = useCallback(async (data: any) => {
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

    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        const currentHypeos = sessionData.hypeos
        await supabaseData.saveHypeOSData(user.id, {
          ...currentHypeos,
          ...data,
          tasks: data.tasks !== undefined ? data.tasks : currentHypeos?.tasks,
          miniWins: data.miniWins !== undefined ? data.miniWins : currentHypeos?.miniWins,
          quests: data.quests !== undefined ? data.quests : currentHypeos?.quests,
          allGoals: data.allGoals !== undefined ? data.allGoals : currentHypeos?.allGoals,
          redeemedRewards: data.redeemedRewards !== undefined ? data.redeemedRewards : currentHypeos?.redeemedRewards,
          user: data.user !== undefined ? data.user : currentHypeos?.user
        })
      } catch (error) {
        console.error('Error saving HypeOS data to Supabase:', error)
      }
    }
  }, [user, sessionData.hypeos])

  const updateChatData = useCallback(async (data: any) => {
    setSessionData(prev => ({ 
      ...prev, 
      chat: { ...prev.chat, ...data }
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id && data.conversations) {
      try {
        await supabaseData.saveChatConversations(user.id, data.conversations)
      } catch (error) {
        console.error('Error saving chat data to Supabase:', error)
      }
    }
  }, [user])

  const updateSystemsData = useCallback(async (data: any) => {
    setSessionData(prev => ({ 
      ...prev, 
      systems: { ...prev.systems, ...data }
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        const currentSystems = sessionData.systems
        await supabaseData.saveSystemsData(user.id, {
          ...currentSystems,
          ...data
        })
      } catch (error) {
        console.error('Error saving systems data to Supabase:', error)
      }
    }
  }, [user, sessionData.systems])

  const updateEntrepreneurProfile = useCallback((data: Partial<SessionData['entrepreneurProfile']>) => {
    setSessionData(prev => ({
      ...prev,
      entrepreneurProfile: {
        ...prev.entrepreneurProfile,
        ...data
      }
    }))
  }, [])

  const updateDailyMood = useCallback(async (mood: string) => {
    const today = new Date().toISOString().split('T')[0]
    const timestamp = Date.now()
    
    setSessionData(prev => ({ 
      ...prev, 
      dailyMood: {
        date: today,
        mood,
        timestamp
      }
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        await supabaseData.saveDailyMood(user.id, mood, today, timestamp)
      } catch (error) {
        console.error('Error saving daily mood to Supabase:', error)
      }
    }
  }, [user])

  const updateTasksData = useCallback(async (data: { daily: any[], weekly: any[], monthly: any[], yearly: any[] }) => {
    setSessionData(prev => ({ 
      ...prev, 
      tasksData: data
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        await supabaseData.saveTasksData(user.id, data)
      } catch (error) {
        console.error('Error saving tasks data to Supabase:', error)
      }
    }
  }, [user])

  const updateSessionData = useCallback((key: string, data: any) => {
    setSessionData(prev => ({ ...prev, [key]: data }))
  }, [])

  const clearSession = useCallback(() => {
    // Clear current session state
    setSessionData(INITIAL_DATA)
    setIsSessionActive(false)
    
    // Get current email before clearing
    const emailToClear = currentEmail || sessionData?.email
    
    // Clear all localStorage data for this email
    if (emailToClear) {
      const storageKey = getStorageKey(emailToClear)
      localStorage.removeItem(storageKey)
      console.log(`🗑️ Cleared data for email: ${emailToClear}`)
    }
    
    // Clear legacy session storage
    localStorage.removeItem('dreamscale_session')
    localStorage.removeItem('dreamscale_current_email')
    
    // Clear onboarding-related localStorage
    localStorage.removeItem('onboardingData')
    localStorage.removeItem('onboardingCompleted')
    localStorage.removeItem('onboardingTimestamp')
    
    // Clear other related localStorage items
    localStorage.removeItem('dreamscale_has_interacted_with_tasks')
    localStorage.removeItem('showTasksAfterOnboarding')
    
    // Clear all email-keyed sessions (in case there are multiple)
    // This is a cleanup for any orphaned sessions
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('dreamscale_session_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing email-keyed sessions:', error)
    }
    
    setCurrentEmail(null)
    console.log('🚪 Logged out - all session data cleared')
  }, [currentEmail, sessionData?.email])

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
