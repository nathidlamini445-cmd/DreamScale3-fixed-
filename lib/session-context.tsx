'use client'

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import * as supabaseData from './supabase-data'
import { createClient } from './supabase/client'

const supabase = createClient()

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
  /** True while the signed-in user's session row is loading from Supabase (or localStorage path). */
  isLoadingSession: boolean
  /** True once we have completed at least one signed-in session hydration attempt. */
  hasHydratedUserSession: boolean
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

/** Phase-1 load uses abortSignal in loadSessionData; keep this as a safety net only. */
const SUPABASE_LOAD_SAFETY_MS = 22_000

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const userId = clerkUser?.id ?? null
  const loadGenRef = React.useRef(0)
  /** After a full load failure, skip re-fetching for a short window so logs don’t spam and the API isn’t hammered. */
  const supabaseParallelLoadBlockedUntilRef = React.useRef(0)
  const [sessionData, setSessionData] = useState<SessionData>(INITIAL_DATA)
  const [mounted, setMounted] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState(false)
  const [hasHydratedUserSession, setHasHydratedUserSession] = useState(false)

  // Load data for a specific email (from Supabase if authenticated, localStorage otherwise)
  // Depends on userId only — `user` object identity changes on TOKEN_REFRESHED and would retrigger loads forever.
  const loadUserData = useCallback(async (email: string | null) => {
    const gen = ++loadGenRef.current

    setIsLoadingFromSupabase(true)

    try {
      if (!email) {
        if (gen === loadGenRef.current) {
          setSessionData(INITIAL_DATA)
          setIsSessionActive(false)
        }
        return
      }

      // If user is authenticated, load from Supabase
      if (userId) {
        try {
          if (Date.now() < supabaseParallelLoadBlockedUntilRef.current) {
            if (gen === loadGenRef.current) {
              setSessionData((prev) => ({ ...prev, email: email ?? prev.email }))
              setIsSessionActive(false)
            }
            return
          }

          // Phase 1: user_sessions only — fetch aborts after 20s so the tab never hangs forever
          let safetyTimer: ReturnType<typeof setTimeout> | undefined
          const safetyTimeout = new Promise<never>((_, reject) => {
            safetyTimer = setTimeout(
              () => reject(new Error('Supabase data load timeout')),
              SUPABASE_LOAD_SAFETY_MS
            )
          })

          let sessionDataFromDB: any = null
          try {
            sessionDataFromDB = await Promise.race([
              supabaseData.loadSessionData(userId),
              safetyTimeout,
            ])
            if (safetyTimer !== undefined) clearTimeout(safetyTimer)
          } catch (timeoutErr) {
            if (safetyTimer !== undefined) clearTimeout(safetyTimer)
            supabaseParallelLoadBlockedUntilRef.current = Date.now() + 60_000
            console.warn(
              `⚠️ Supabase core session failed or timed out (safety ${SUPABASE_LOAD_SAFETY_MS / 1000}s)`
            )
            throw timeoutErr
          }

          if (gen !== loadGenRef.current) return

          supabaseParallelLoadBlockedUntilRef.current = 0

          const partialMerged: SessionData = {
            email,
            calendarEvents: [],
            hypeos: INITIAL_DATA.hypeos,
            chat: { conversations: [] },
            systems: { systems: [], savedSOPs: [] },
            entrepreneurProfile:
              sessionDataFromDB?.entrepreneurProfile ?? INITIAL_DATA.entrepreneurProfile,
            dailyMood: null,
            tasksData: undefined,
            ...sessionDataFromDB,
          }

          setSessionData(partialMerged)
          setIsSessionActive(true)
          console.log(`✅ Loaded core session from Supabase for user: ${email}`)

          // Phase 2: remaining tables (non-blocking; failures don’t wipe session)
          const hydrateGen = gen
          void (async () => {
            try {
              const today = new Date().toISOString().split('T')[0]
              const results = await Promise.allSettled([
                supabaseData.loadCalendarEvents(userId),
                supabaseData.loadHypeOSData(userId),
                supabaseData.loadChatConversations(userId),
                supabaseData.loadSystemsData(userId),
                supabaseData.loadDailyMood(userId, today),
                supabaseData.loadTasksData(userId).catch((err) => {
                  if (err?.message?.includes('406') || err?.status === 406) {
                    console.warn('⚠️ Tasks data table not accessible (406) - skipping')
                    return null
                  }
                  throw err
                }),
              ])

              if (hydrateGen !== loadGenRef.current) return

              const [
                calendarRes,
                hypeosRes,
                chatRes,
                systemsRes,
                moodRes,
                tasksRes,
              ] = results

              const calendarEvents =
                calendarRes.status === 'fulfilled' ? calendarRes.value : []
              const hypeosData =
                hypeosRes.status === 'fulfilled' ? hypeosRes.value : null
              const chatConversations =
                chatRes.status === 'fulfilled' ? chatRes.value : []
              const systemsData =
                systemsRes.status === 'fulfilled' ? systemsRes.value : null
              const dailyMood =
                moodRes.status === 'fulfilled' ? moodRes.value : null
              const tasksData =
                tasksRes.status === 'fulfilled' ? tasksRes.value : null

              if (systemsData) {
                console.log('📦 Systems data from Supabase (background hydrate):', {
                  hasData: !!systemsData,
                  systemsLength: Array.isArray(systemsData.systems) ? systemsData.systems.length : 'N/A',
                })
              }

              setSessionData((prev) => ({
                ...prev,
                calendarEvents: calendarEvents || [],
                hypeos: hypeosData || prev.hypeos,
                chat: { conversations: chatConversations || [] },
                systems: {
                  systems: systemsData?.systems || prev.systems?.systems || [],
                  savedSOPs: systemsData?.savedSOPs || prev.systems?.savedSOPs || [],
                },
                dailyMood: dailyMood
                  ? {
                      date: dailyMood.date,
                      mood: dailyMood.mood,
                      timestamp: dailyMood.timestamp,
                    }
                  : prev.dailyMood,
                tasksData: tasksData ?? prev.tasksData,
              }))
              console.log(`✅ Hydrated extended Supabase data for user: ${email}`)
            } catch (e) {
              console.warn('⚠️ Extended session hydrate error:', e)
            }
          })()

          return
        } catch (supabaseError) {
          console.error('Error loading from Supabase:', supabaseError)
          supabaseParallelLoadBlockedUntilRef.current = Date.now() + 60_000
          if (gen === loadGenRef.current) {
            const freshData = { ...INITIAL_DATA, email }
            setSessionData(freshData)
            setIsSessionActive(false)
            console.log(`🆕 Starting fresh session (Supabase error) — saves disabled to prevent loop`)
          }
          return
        }
      }

      // Only use localStorage for unauthenticated users
      const storageKey = getStorageKey(email)
      const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

      if (gen !== loadGenRef.current) return

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
      if (gen === loadGenRef.current) {
        const freshData = { ...INITIAL_DATA, email: email ?? null }
        setSessionData(freshData)
        setIsSessionActive(!userId)
      }
    } finally {
      if (gen === loadGenRef.current) {
        setIsLoadingFromSupabase(false)
      }
    }
  }, [userId])

  /**
   * Before paint: mark session as loading for signed-in users so OnboardingGuard does not
   * redirect to /onboarding while entrepreneurProfile is still the initial empty shape.
   * (Avoids dashboard → onboarding → dashboard flicker on refresh.)
   */
  useLayoutEffect(() => {
    if (!clerkLoaded) return
    if (userId && clerkUser?.primaryEmailAddress?.emailAddress) {
      setIsLoadingFromSupabase(true)
    } else {
      setIsLoadingFromSupabase(false)
    }
  }, [clerkLoaded, userId, clerkUser?.primaryEmailAddress?.emailAddress])

  // Sync Clerk user (name and email) to session context when user signs in
  useEffect(() => {
    if (!mounted || !clerkUser) return

    const profileEmail = clerkUser.primaryEmailAddress?.emailAddress ?? null
    const profileName =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      null

    // Update email if it's different
    if (profileEmail && profileEmail !== currentEmail) {
      setCurrentEmail(profileEmail.toLowerCase().trim())
    }

    // ALWAYS update session data with user information if available
    if (profileEmail || profileName) {
      setSessionData((prev) => {
        const onboardingDone = prev.entrepreneurProfile?.onboardingCompleted === true

        // After onboarding, keep "What should we call you?" — do not replace with Clerk legal name.
        if (onboardingDone) {
          if (profileEmail && prev.email !== profileEmail) {
            return { ...prev, email: profileEmail }
          }
          return prev
        }

        const currentName = prev.entrepreneurProfile?.name
        const needsUpdate =
          (profileEmail && prev.email !== profileEmail) ||
          (profileName && profileName !== currentName)

        if (!needsUpdate) return prev

        console.log('🔄 Syncing profile name to session context:', {
          oldName: currentName,
          newName: profileName,
          fromClerk: true,
        })

        return {
          ...prev,
          email: profileEmail || prev.email,
          entrepreneurProfile: {
            ...prev.entrepreneurProfile,
            name: profileName || prev.entrepreneurProfile?.name || null,
          },
        }
      })
    }
  }, [mounted, clerkUser, currentEmail])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset hydration marker whenever auth identity changes.
  useEffect(() => {
    setHasHydratedUserSession(false)
  }, [userId])

  /**
   * Single funnel for signed-in users — previously two effects both called `loadUserData`
   * while `currentEmail` was still null, causing duplicate 12s loads and log spam.
   */
  useEffect(() => {
    if (!mounted || !clerkLoaded || !userId) return
    const email = clerkUser?.primaryEmailAddress?.emailAddress
    if (!email) return

    const normalizedEmail = email.toLowerCase().trim()

    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(normalizedEmail)
      localStorage.removeItem(storageKey)
      localStorage.removeItem('dreamscale_current_email')
      localStorage.removeItem(`hypeos:tasks`)
      localStorage.removeItem(`hypeos:miniWins`)
      localStorage.removeItem(`hypeos:user`)
      localStorage.removeItem(`hypeos:allGoals`)
      localStorage.removeItem(`hypeos:quests`)
      localStorage.removeItem(`bizora:conversations_${normalizedEmail}`)
    }

    setCurrentEmail(normalizedEmail)
    loadUserData(normalizedEmail)
      .catch(() => {
        // loadUserData already handles and logs failures; keep this no-op catch
      })
      .finally(() => {
        setHasHydratedUserSession(true)
      })
    console.log('✅ Authenticated user — loading session from Supabase')
  }, [mounted, clerkLoaded, userId, clerkUser?.primaryEmailAddress?.emailAddress, loadUserData])

  // Unauthenticated: localStorage / legacy session only
  useEffect(() => {
    if (!mounted || !clerkLoaded || userId) return

    try {
      const lastEmail = localStorage.getItem('dreamscale_current_email')
      if (lastEmail) {
        setCurrentEmail(lastEmail)
        loadUserData(lastEmail)
      } else {
        const legacySession = localStorage.getItem('dreamscale_session')
        if (legacySession) {
          try {
            const parsedData = JSON.parse(legacySession)
            if (parsedData.email) {
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
  }, [mounted, clerkLoaded, userId, loadUserData])

  // Save data whenever it changes (to Supabase if authenticated, localStorage otherwise)
  useEffect(() => {
    if (!mounted || !currentEmail || isLoadingFromSupabase) return
    
    // Always save onboarding completion status, even if session isn't "active" yet
    const shouldSave = isSessionActive || sessionData?.entrepreneurProfile?.onboardingCompleted === true
    
    if (!shouldSave) return

    const saveData = async () => {
      try {
        // If user is authenticated, ONLY save to Supabase (no localStorage)
        if (userId) {
          try {
            // Save all data to Supabase in parallel
            await Promise.all([
              supabaseData.saveSessionData(userId, {
                entrepreneurProfile: sessionData.entrepreneurProfile,
                hasSeenWelcome: sessionData.hasSeenWelcome
              }),
              sessionData.calendarEvents.length > 0 && supabaseData.saveCalendarEvents(userId, sessionData.calendarEvents),
              sessionData.hypeos && supabaseData.saveHypeOSData(userId, sessionData.hypeos),
              sessionData.chat?.conversations && sessionData.chat.conversations.length > 0 && 
                supabaseData.saveChatConversations(userId, sessionData.chat.conversations),
              // CRITICAL: Only save systems if it has actual data (not empty array)
              sessionData.systems && 
              sessionData.systems.systems && 
              Array.isArray(sessionData.systems.systems) && 
              sessionData.systems.systems.length > 0 &&
              supabaseData.saveSystemsData(userId, sessionData.systems),
              sessionData.dailyMood && supabaseData.saveDailyMood(
                userId,
                sessionData.dailyMood.mood,
                sessionData.dailyMood.date,
                sessionData.dailyMood.timestamp
              ),
              sessionData.tasksData && supabaseData.saveTasksData(userId, sessionData.tasksData)
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
  }, [sessionData, mounted, isSessionActive, currentEmail, userId, isLoadingFromSupabase])

  const updateEmail = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    
    // If email changed and user is authenticated, data is already in Supabase
    // No need to save to localStorage - Supabase is the source of truth
    if (currentEmail && currentEmail !== normalizedEmail && !userId) {
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
  }, [currentEmail, sessionData, loadUserData, userId])

  const updateCalendarEvents = useCallback(async (events: any[]) => {
    setSessionData(prev => ({ 
      ...prev, 
      calendarEvents: events 
    }))
    
    // Save to Supabase immediately if authenticated
    if (userId) {
      try {
        await supabaseData.saveCalendarEvents(userId, events)
      } catch (error) {
        console.error('Error saving calendar events to Supabase:', error)
      }
    }
  }, [userId])

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
    if (userId) {
      try {
        // CRITICAL: Use the updated state (after setSessionData) to ensure we save the latest data
        // The saveHypeOSData function will load existing data and merge, so we can pass partial updates
        await supabaseData.saveHypeOSData(userId, {
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
  }, [userId, sessionData.hypeos])

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
    if (userId && data.conversations && Array.isArray(data.conversations) && data.conversations.length > 0) {
      try {
        await supabaseData.saveChatConversations(userId, data.conversations)

        // Reload conversations to get Supabase UUIDs (replaces client-side Date.now() IDs)
        // This ensures subsequent saves can match by ID
        const savedConversations = await supabaseData.loadChatConversations(userId)
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
    } else if (userId && data.conversations && data.conversations.length === 0) {
      console.warn('⚠️ Skipping save of empty conversations array to prevent data loss')
    }
  }, [userId, sessionData.chat])

  const updateSystemsData = useCallback(async (data: any) => {
    // CRITICAL: Don't update session state with empty systems array
    // If systems is being passed and it's empty, skip the state update
    if (data.systems !== undefined && Array.isArray(data.systems) && data.systems.length === 0) {
      console.error('🚨 BLOCKED: updateSystemsData attempted to set empty systems array in session state! Skipping state update.', {
        userId,
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
    if (userId) {
      try {
        // Only pass what's being updated - saveSystemsData will merge with existing data
        const updatePayload: any = {}

        // Only include systems if they're being updated
        if (data.systems !== undefined) {
          // CRITICAL SAFEGUARD: BLOCK empty arrays - don't pass them to saveSystemsData
          if (Array.isArray(data.systems) && data.systems.length === 0) {
            console.error('🚨 BLOCKED: updateSystemsData called with empty systems array! Skipping save to prevent data loss.', {
              userId,
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
          await supabaseData.saveSystemsData(userId, updatePayload)
          console.log('✅ Saved systems data to Supabase:', {
            systems: updatePayload.systems?.length || 'preserved',
            sops: updatePayload.savedSOPs?.length || 'preserved'
          })
        }
      } catch (error) {
        console.error('❌ Error saving systems data to Supabase:', error)
      }
    }
  }, [userId])

  const updateEntrepreneurProfile = useCallback(async (data: Partial<SessionData['entrepreneurProfile']>) => {
    setSessionData(prev => {
      const updatedProfile = {
        ...prev.entrepreneurProfile,
        ...data
      }
      
      // CRITICAL: Save entrepreneurProfile to Supabase user_sessions table for authenticated users
      if (userId) {
        // Save asynchronously without blocking
        supabaseData.saveSessionData(userId, {
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
      if (data.name !== undefined && userId) {
        supabase
          .from('user_profiles')
          .update({ full_name: data.name || null })
          .eq('id', userId)
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
  }, [userId])

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
    if (userId) {
      try {
        await supabaseData.saveDailyMood(userId, mood, today, timestamp)
      } catch (error) {
        console.error('Error saving daily mood to Supabase:', error)
      }
    }
  }, [userId])

  const updateTasksData = useCallback(async (data: { daily: any[], weekly: any[], monthly: any[], yearly: any[] }) => {
    setSessionData(prev => ({ 
      ...prev, 
      tasksData: data
    }))

    // Save to Supabase immediately if authenticated
    if (userId) {
      try {
        await supabaseData.saveTasksData(userId, data)
      } catch (error) {
        console.error('Error saving tasks data to Supabase:', error)
      }
    }
  }, [userId])

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
        isSessionActive,
        isLoadingSession: isLoadingFromSupabase,
        hasHydratedUserSession
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
