'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from './supabase-data'
import { supabase } from './supabase'

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
  const { user, profile } = useAuth()
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
          // Load all data from Supabase in parallel with timeout
          const loadDataPromise = Promise.all([
            supabaseData.loadSessionData(user.id),
            supabaseData.loadCalendarEvents(user.id),
            supabaseData.loadHypeOSData(user.id),
            supabaseData.loadChatConversations(user.id),
            supabaseData.loadSystemsData(user.id),
            supabaseData.loadDailyMood(user.id, new Date().toISOString().split('T')[0]),
            supabaseData.loadTasksData(user.id).catch(err => {
              // Suppress 406 errors for tasks_data - table might not exist
              if (err?.message?.includes('406') || err?.status === 406) {
                console.warn('⚠️ Tasks data table not accessible (406) - skipping')
                return null
              }
              throw err
            })
          ])
          
          // Add timeout - if Supabase queries take more than 1.5 seconds, fall back to localStorage
          // Reduced timeout to prevent blank screen
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase data load timeout')), 1500)
          )
          
          let [
            sessionDataFromDB,
            calendarEvents,
            hypeosData,
            chatConversations,
            systemsData,
            dailyMood,
            tasksData
          ] = [null, null, null, null, null, null, null]
          
          try {
            [
              sessionDataFromDB,
              calendarEvents,
              hypeosData,
              chatConversations,
              systemsData,
              dailyMood,
              tasksData
            ] = await Promise.race([
              loadDataPromise,
              timeoutPromise
            ]) as any
          } catch (timeoutError) {
            console.warn('⚠️ Supabase data load timed out after 3 seconds - using localStorage')
            throw timeoutError // Fall through to localStorage fallback
          }

          // CRITICAL: Log systems data for debugging
          if (systemsData) {
            console.log('📦 Systems data from Supabase in session context:', {
              hasData: !!systemsData,
              systemsType: typeof systemsData.systems,
              systemsIsArray: Array.isArray(systemsData.systems),
              systemsLength: Array.isArray(systemsData.systems) ? systemsData.systems.length : 'N/A'
            })
          }

          // Merge all data into session data
          const mergedData: SessionData = {
            email: email,
            calendarEvents: calendarEvents || [],
            hypeos: hypeosData || INITIAL_DATA.hypeos,
            chat: {
              conversations: chatConversations || []
            },
            systems: {
              systems: systemsData?.systems || [],
              savedSOPs: systemsData?.savedSOPs || []
            },
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
          setIsLoadingFromSupabase(false)
          return // CRITICAL: Don't fall back to localStorage for authenticated users
        } catch (supabaseError) {
          console.error('Error loading from Supabase:', supabaseError)
          // For authenticated users, don't fall back to localStorage - start fresh
          // This ensures data consistency across devices
          const freshData = { ...INITIAL_DATA, email }
          setSessionData(freshData)
          setIsSessionActive(true)
          console.log(`🆕 Starting fresh session (Supabase error) for authenticated user: ${email}`)
          setIsLoadingFromSupabase(false)
          return
        }
      }

      // Only use localStorage for unauthenticated users
      const storageKey = getStorageKey(email)
      const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      
      if (stored) {
        const parsedData = JSON.parse(stored)
        parsedData.email = email
        setSessionData(parsedData)
        setIsSessionActive(true)
        console.log(`✅ Loaded data from localStorage for unauthenticated user: ${email}`)
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

  // Auto-update email when user signs in with Google (after loadUserData is defined)
  useEffect(() => {
    if (user?.email && mounted) {
      const normalizedEmail = user.email.toLowerCase().trim()
      if (normalizedEmail !== currentEmail) {
        console.log('🔄 Auto-updating session email from authenticated user:', normalizedEmail)
        
        // CRITICAL: Clear localStorage for this email when authenticating
        // This ensures we don't load old localStorage data after login
        if (typeof window !== 'undefined') {
          const storageKey = getStorageKey(normalizedEmail)
          localStorage.removeItem(storageKey)
          localStorage.removeItem('dreamscale_current_email')
          // Also clear HypeOS and Bizora localStorage for this email
          localStorage.removeItem(`hypeos:tasks`)
          localStorage.removeItem(`hypeos:miniWins`)
          localStorage.removeItem(`hypeos:user`)
          localStorage.removeItem(`hypeos:allGoals`)
          localStorage.removeItem(`hypeos:quests`)
          const bizoraKey = `bizora:conversations_${normalizedEmail}`
          localStorage.removeItem(bizoraKey)
          console.log('✅ Cleared localStorage for authenticated user to prevent conflicts')
        }
        
        setCurrentEmail(normalizedEmail)
        loadUserData(normalizedEmail)
      }
    }
  }, [user?.email, currentEmail, mounted, loadUserData])

  // Sync Google profile data (name and email) to session context when user signs in
  // Also sync whenever profile updates (e.g., when user saves name in settings)
  useEffect(() => {
    if (!mounted || !user) return

    // Extract profile data from multiple sources
    const profileEmail = user.email || profile?.email
    const profileName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || null

    // Update email if it's different
    if (profileEmail && profileEmail !== currentEmail) {
      setCurrentEmail(profileEmail.toLowerCase().trim())
    }

    // ALWAYS update session data with profile information if available
    // This ensures the name is synced even if it was updated in settings
    if (profileEmail || profileName) {
      setSessionData(prev => {
        const currentName = prev.entrepreneurProfile?.name
        const needsUpdate = 
          (profileEmail && prev.email !== profileEmail) ||
          (profileName && profileName !== currentName)

        if (!needsUpdate) return prev

        console.log('🔄 Syncing profile name to session context:', {
          oldName: currentName,
          newName: profileName,
          fromProfile: !!profile?.full_name,
          fromUserMetadata: !!user.user_metadata?.full_name || !!user.user_metadata?.name
        })

        return {
          ...prev,
          email: profileEmail || prev.email,
          entrepreneurProfile: {
            ...prev.entrepreneurProfile,
            name: profileName || prev.entrepreneurProfile?.name || null
          }
        }
      })
    }
  }, [mounted, user, profile, currentEmail])

  // Initial load - check for any existing session
  useEffect(() => {
    setMounted(true)
    
    try {
      // CRITICAL: For authenticated users, skip localStorage entirely
      // Load directly from Supabase using the authenticated user's email
      if (user?.id && user?.email) {
        const normalizedEmail = user.email.toLowerCase().trim()
        setCurrentEmail(normalizedEmail)
        loadUserData(normalizedEmail)
        console.log('✅ Authenticated user detected - loading from Supabase only')
        return
      }
      
      // Only check localStorage for unauthenticated users
      const lastEmail = localStorage.getItem('dreamscale_current_email')
      if (lastEmail) {
        setCurrentEmail(lastEmail)
        loadUserData(lastEmail)
      } else {
        // Check for legacy session (backward compatibility) - only for unauthenticated users
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
  }, [loadUserData, user?.id, user?.email])

  // Save data whenever it changes (to Supabase if authenticated, localStorage otherwise)
  useEffect(() => {
    if (!mounted || !currentEmail || isLoadingFromSupabase) return
    
    // Always save onboarding completion status, even if session isn't "active" yet
    const shouldSave = isSessionActive || sessionData?.entrepreneurProfile?.onboardingCompleted === true
    
    if (!shouldSave) return

    const saveData = async () => {
      try {
        // If user is authenticated, ONLY save to Supabase (no localStorage)
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
              // CRITICAL: Only save systems if it has actual data (not empty array)
              sessionData.systems && 
              sessionData.systems.systems && 
              Array.isArray(sessionData.systems.systems) && 
              sessionData.systems.systems.length > 0 &&
              supabaseData.saveSystemsData(user.id, sessionData.systems),
              sessionData.dailyMood && supabaseData.saveDailyMood(
                user.id,
                sessionData.dailyMood.mood,
                sessionData.dailyMood.date,
                sessionData.dailyMood.timestamp
              ),
              sessionData.tasksData && supabaseData.saveTasksData(user.id, sessionData.tasksData)
            ])
            console.log(`💾 Saved session data to Supabase for user: ${currentEmail}`)
            // CRITICAL: Don't save to localStorage for authenticated users
            // This ensures data consistency across devices
            return
          } catch (supabaseError) {
            console.error('Error saving to Supabase:', supabaseError)
            // Don't fall back to localStorage for authenticated users
            // This ensures Supabase is the single source of truth
            return
          }
        }

        // Only save to localStorage for unauthenticated users
        const storageKey = getStorageKey(currentEmail)
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
        localStorage.setItem('dreamscale_current_email', currentEmail)
        console.log(`💾 Saved session to localStorage for unauthenticated user: ${currentEmail}`)
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
    
    // If email changed and user is authenticated, data is already in Supabase
    // No need to save to localStorage - Supabase is the source of truth
    if (currentEmail && currentEmail !== normalizedEmail && !user?.id) {
      // Only save to localStorage for unauthenticated users
      const storageKey = getStorageKey(currentEmail)
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
        console.log(`💾 Saved data for previous unauthenticated email: ${currentEmail}`)
      } catch (error) {
        console.error('Error saving previous user data:', error)
      }
    }
    
    // Load data for the new email (from Supabase if authenticated, localStorage otherwise)
    setCurrentEmail(normalizedEmail)
    loadUserData(normalizedEmail)
  }, [currentEmail, sessionData, loadUserData, user?.id])

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
        // CRITICAL: Use the updated state (after setSessionData) to ensure we save the latest data
        // The saveHypeOSData function will load existing data and merge, so we can pass partial updates
        await supabaseData.saveHypeOSData(user.id, {
          ...data,
          // Explicitly include allGoals and quests to ensure they're saved
          allGoals: data.allGoals !== undefined ? data.allGoals : undefined,
          quests: data.quests !== undefined ? data.quests : undefined,
          tasks: data.tasks !== undefined ? data.tasks : undefined,
          miniWins: data.miniWins !== undefined ? data.miniWins : undefined,
          redeemedRewards: data.redeemedRewards !== undefined ? data.redeemedRewards : undefined,
          user: data.user !== undefined ? data.user : undefined,
          tasksLastDate: data.tasksLastDate !== undefined ? data.tasksLastDate : undefined
        })
        console.log('✅ Saved HypeOS data to Supabase permanently:', {
          hasAllGoals: data.allGoals !== undefined,
          allGoalsCount: data.allGoals?.length || 0,
          hasQuests: data.quests !== undefined,
          questsCount: data.quests?.length || 0
        })
      } catch (error) {
        console.error('❌ Error saving HypeOS data to Supabase:', error)
        // Don't throw - allow UI to continue, but log the error
      }
    }
  }, [user, sessionData.hypeos])

  const updateChatData = useCallback(async (data: any) => {
    // CRITICAL: Don't update with empty arrays if we have existing data
    if (data.conversations && Array.isArray(data.conversations)) {
      const currentConversations = sessionData.chat?.conversations || []
      // If trying to set empty array but we have existing data, preserve existing
      if (data.conversations.length === 0 && currentConversations.length > 0) {
        console.warn('⚠️ Prevented overwriting conversations with empty array - preserving existing data')
        data.conversations = currentConversations
      }
    }
    
    setSessionData(prev => ({ 
      ...prev, 
      chat: { ...prev.chat, ...data }
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id && data.conversations && Array.isArray(data.conversations) && data.conversations.length > 0) {
      try {
        await supabaseData.saveChatConversations(user.id, data.conversations)
        
        // Reload conversations to get Supabase UUIDs (replaces client-side Date.now() IDs)
        // This ensures subsequent saves can match by ID
        const savedConversations = await supabaseData.loadChatConversations(user.id)
        if (savedConversations && savedConversations.length > 0) {
          setSessionData(prev => ({
            ...prev,
            chat: { ...prev.chat, conversations: savedConversations }
          }))
          console.log('✅ Reloaded conversations with Supabase UUIDs:', savedConversations.length)
        }
      } catch (error) {
        console.error('❌ Error saving chat data to Supabase:', error)
        // Don't throw - allow app to continue functioning
      }
    } else if (user?.id && data.conversations && data.conversations.length === 0) {
      console.warn('⚠️ Skipping save of empty conversations array to prevent data loss')
    }
  }, [user, sessionData.chat])

  const updateSystemsData = useCallback(async (data: any) => {
    // CRITICAL: Don't update session state with empty systems array
    // If systems is being passed and it's empty, skip the state update
    if (data.systems !== undefined && Array.isArray(data.systems) && data.systems.length === 0) {
      console.error('🚨 BLOCKED: updateSystemsData attempted to set empty systems array in session state! Skipping state update.', {
        userId: user?.id,
        stackTrace: new Error().stack?.split('\n').slice(1, 6).join('\n')
      })
      // Don't update state with empty array - preserve existing systems
      // Only update other fields if they exist
      if (data.savedSOPs !== undefined) {
        setSessionData(prev => ({ 
          ...prev, 
          systems: { ...prev.systems, savedSOPs: data.savedSOPs }
        }))
      }
      return // Exit early - don't proceed to save
    }
    
    setSessionData(prev => ({ 
      ...prev, 
      systems: { ...prev.systems, ...data }
    }))

    // Save to Supabase immediately if authenticated
    if (user?.id) {
      try {
        // Only pass what's being updated - saveSystemsData will merge with existing data
        const updatePayload: any = {}
        
        // Only include systems if they're being updated
        if (data.systems !== undefined) {
          // CRITICAL SAFEGUARD: BLOCK empty arrays - don't pass them to saveSystemsData
          if (Array.isArray(data.systems) && data.systems.length === 0) {
            console.error('🚨 BLOCKED: updateSystemsData called with empty systems array! Skipping save to prevent data loss.', {
              userId: user.id,
              stackTrace: new Error().stack?.split('\n').slice(1, 6).join('\n')
            })
            // DO NOT add systems to updatePayload - skip this save entirely
            // This prevents the empty array from reaching saveSystemsData
          } else {
            // Only add to payload if it's not an empty array
            updatePayload.systems = data.systems
          }
        }
        
        // Only include savedSOPs if they're being updated
        if (data.savedSOPs !== undefined) {
          updatePayload.savedSOPs = data.savedSOPs
        }
        
        // Only save if there's something to update
        if (Object.keys(updatePayload).length > 0) {
          console.log('💾 updateSystemsData saving to Supabase:', {
            systems: updatePayload.systems?.length ?? 'not provided',
            sops: updatePayload.savedSOPs?.length ?? 'not provided'
          })
          await supabaseData.saveSystemsData(user.id, updatePayload)
          console.log('✅ Saved systems data to Supabase:', {
            systems: updatePayload.systems?.length || 'preserved',
            sops: updatePayload.savedSOPs?.length || 'preserved'
          })
        }
      } catch (error) {
        console.error('❌ Error saving systems data to Supabase:', error)
      }
    }
  }, [user])

  const updateEntrepreneurProfile = useCallback(async (data: Partial<SessionData['entrepreneurProfile']>) => {
    setSessionData(prev => {
      const updatedProfile = {
        ...prev.entrepreneurProfile,
        ...data
      }
      
      // CRITICAL: Save entrepreneurProfile to Supabase user_sessions table for authenticated users
      if (user?.id) {
        // Save asynchronously without blocking
        supabaseData.saveSessionData(user.id, {
          entrepreneurProfile: updatedProfile
        }).then(() => {
          console.log('✅ Saved entrepreneurProfile to Supabase user_sessions:', {
            businessName: updatedProfile.businessName,
            name: updatedProfile.name
          })
        }).catch((error) => {
          console.error('Error saving entrepreneurProfile to Supabase:', error)
        })
      }
      
      // Also update the user_profiles table in Supabase if name is being updated
      if (data.name !== undefined && user?.id) {
        supabase
          .from('user_profiles')
          .update({ full_name: data.name || null })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating user profile name in Supabase:', error)
            } else {
              console.log('✅ Updated user profile name in Supabase:', data.name)
            }
          })
          .catch((error) => {
            console.error('Error updating user profile name:', error)
          })
      }
      
      return {
        ...prev,
        entrepreneurProfile: updatedProfile
      }
    })
  }, [user?.id])

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
    // Clear current session state FIRST
    setSessionData(INITIAL_DATA)
    setIsSessionActive(false)
    setCurrentEmail(null) // Clear current email immediately
    
    // Clear the current email reference - this is critical for logout
    // OnboardingGuard checks for sessionEmail, so clearing this will trigger onboarding
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dreamscale_current_email')
      
      // CRITICAL: Clear ALL DreamScale-related localStorage data to ensure clean logout
      // This prevents old data from loading after re-login
      
      // CRITICAL: Clear sessionStorage to ensure no lingering session flags
      try {
        sessionStorage.clear()
        console.log('✅ Cleared all sessionStorage in clearSession')
      } catch (e) {
        console.error('Error clearing sessionStorage:', e)
      }
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          // Clear all DreamScale session data
          if (key.startsWith('dreamscale_session_') || 
              key.startsWith('dreamscale_') ||
              key.startsWith('hypeos:') ||
              key.startsWith('bizora:') ||
              key === 'onboardingCompleted' ||
              key === 'onboardingData') {
            localStorage.removeItem(key)
          }
        })
        console.log('✅ Cleared all DreamScale localStorage data from session context')
      } catch (e) {
        console.error('Error clearing localStorage data:', e)
      }
      
      // CRITICAL: Clear sessionStorage to ensure no lingering session flags
      try {
        sessionStorage.clear()
        console.log('✅ Cleared all sessionStorage in clearSession')
      } catch (e) {
        console.error('Error clearing sessionStorage:', e)
      }
    }
    
    setCurrentEmail(null) // Clear current email reference
    console.log('🚪 Session cleared completely - user will see welcome/onboarding screen')
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
