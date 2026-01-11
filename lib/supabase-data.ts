'use client'

import { createClient } from './supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

// ============================================
// SESSION DATA
// ============================================

export async function saveSessionData(userId: string, sessionData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_data: sessionData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving session data:', error)
    throw error
  }
}

export async function loadSessionData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('session_data')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data?.session_data || null
  } catch (error) {
    console.error('Error loading session data:', error)
    return null
  }
}

// ============================================
// CALENDAR EVENTS
// ============================================

export async function saveCalendarEvents(userId: string, events: any[]): Promise<void> {
  try {
    // Delete existing events
    await supabase
      .from('calendar_events')
      .delete()
      .eq('user_id', userId)

    // Insert new events
    if (events.length > 0) {
      const { error } = await supabase
        .from('calendar_events')
        .insert(events.map(event => ({
          user_id: userId,
          ...event
        })))

      if (error) throw error
    }
  } catch (error) {
    console.error('Error saving calendar events:', error)
    throw error
  }
}

export async function loadCalendarEvents(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading calendar events:', error)
    return []
  }
}

// ============================================
// HYPEOS DATA
// ============================================

export async function saveHypeOSData(userId: string, hypeosData: any): Promise<void> {
  try {
    // CRITICAL: Load existing data first to prevent data loss
    const existingData = await loadHypeOSData(userId)
    
    // Merge with existing data - preserve what's not being updated
    const userData = hypeosData.user !== undefined 
      ? hypeosData.user 
      : (existingData?.user || null)
    
    const tasks = hypeosData.tasks !== undefined 
      ? hypeosData.tasks 
      : (existingData?.tasks || [])
    
    const miniWins = hypeosData.miniWins !== undefined
      ? hypeosData.miniWins
      : (existingData?.miniWins || [])
    
    const quests = hypeosData.quests !== undefined
      ? hypeosData.quests
      : (existingData?.quests || [])
    
    const allGoals = hypeosData.allGoals !== undefined
      ? hypeosData.allGoals
      : (existingData?.allGoals || [])
    
    const tasksLastDate = hypeosData.tasksLastDate !== undefined
      ? hypeosData.tasksLastDate
      : (existingData?.tasksLastDate || null)
    
    const redeemedRewards = hypeosData.redeemedRewards !== undefined
      ? hypeosData.redeemedRewards
      : (existingData?.redeemedRewards || [])
    
    console.log('💾 Saving HypeOS data to Supabase permanently:', {
      userId,
      tasksCount: tasks.length,
      miniWinsCount: miniWins.length,
      questsCount: quests.length,
      allGoalsCount: allGoals.length,
      hasUserData: !!userData
    })
    
    const { error } = await supabase
      .from('hypeos_data')
      .upsert({
        user_id: userId,
        user_data: userData,
        tasks: tasks,
        mini_wins: miniWins,
        quests: quests,
        all_goals: allGoals,
        tasks_last_date: tasksLastDate,
        redeemed_rewards: redeemedRewards,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Supabase error saving HypeOS data:', error)
      throw error
    }
    
    console.log('✅ Successfully saved HypeOS data to Supabase permanently')
  } catch (error) {
    console.error('Error saving HypeOS data:', error)
    throw error
  }
}

export async function loadHypeOSData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('hypeos_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      user: data.user_data,
      tasks: data.tasks || [],
      miniWins: data.mini_wins || [],
      quests: data.quests || [],
      allGoals: data.all_goals || [],
      tasksLastDate: data.tasks_last_date,
      redeemedRewards: data.redeemed_rewards || []
    }
  } catch (error) {
    console.error('Error loading HypeOS data:', error)
    return null
  }
}

// ============================================
// CHAT CONVERSATIONS
// ============================================

export async function saveChatConversations(userId: string, conversations: any[]): Promise<void> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available, skipping save')
      return
    }

    // CRITICAL: Prevent saving empty arrays if we have existing data
    // This prevents accidental data loss
    if (!conversations || conversations.length === 0) {
      console.warn('⚠️ Attempted to save empty conversations array - skipping to prevent data loss')
      return
    }

    // Get existing conversations from database with full data for matching
    const { data: existingConversations, error: fetchError } = await supabase
      .from('chat_conversations')
      .select('id, title, messages, created_at')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error loading existing conversations:', fetchError)
      throw fetchError
    }

    const existingIds = new Set((existingConversations || []).map((c: any) => c.id))
    
    // Create a map to match conversations by content when IDs don't match
    // This handles the case where client uses Date.now() IDs but Supabase uses UUIDs
    const matchByContent = (conv: any, existing: any[]) => {
      const convMessages = Array.isArray(conv.messages) ? conv.messages : []
      const firstMessage = convMessages.length > 0 ? convMessages[0]?.content : null
      const lastMessage = convMessages.length > 0 ? convMessages[convMessages.length - 1]?.content : null
      
      for (const existingConv of existing) {
        const existingMessages = Array.isArray(existingConv.messages) ? existingConv.messages : []
        const existingFirstMessage = existingMessages.length > 0 ? existingMessages[0]?.content : null
        const existingLastMessage = existingMessages.length > 0 ? existingMessages[existingMessages.length - 1]?.content : null
        
        // Match if:
        // 1. Title matches AND
        // 2. First message matches (or both are empty) AND
        // 3. Either: last message matches (conversation updated) OR incoming has more messages (update)
        const titleMatches = conv.title === existingConv.title
        const firstMessageMatches = firstMessage === existingFirstMessage
        const lastMessageMatches = lastMessage && existingLastMessage && lastMessage === existingLastMessage
        const isUpdate = convMessages.length >= existingMessages.length
        
        if (titleMatches && firstMessageMatches && (lastMessageMatches || isUpdate)) {
          return existingConv.id
        }
      }
      return null
    }

    // Process each conversation: update if exists, insert if new
    for (const conv of conversations) {
      const convData = {
        user_id: userId,
        title: conv.title || 'New Conversation',
        messages: conv.messages || []
      }

      let matchedId: string | null = null

      // First try to match by ID (works if client has Supabase UUID)
      if (conv.id && existingIds.has(conv.id)) {
        matchedId = conv.id
      } else {
        // Try to match by content (handles client-side Date.now() IDs)
        matchedId = matchByContent(conv, existingConversations || [])
      }

      if (matchedId) {
        // Update existing conversation
        const { error } = await supabase
          .from('chat_conversations')
          .update(convData)
          .eq('id', matchedId)
          .eq('user_id', userId)

        if (error) {
          console.error(`Error updating conversation ${matchedId}:`, error)
          throw error
        }
      } else {
        // Insert new conversation - Supabase will generate UUID
        const { data: insertedData, error } = await supabase
          .from('chat_conversations')
          .insert(convData)
          .select('id')
          .single()

        if (error) {
          console.error(`Error inserting conversation:`, error)
          throw error
        }

        // Note: The client-side ID won't match the Supabase UUID
        // The client should reload conversations after save to get the correct IDs
        console.log(`Inserted new conversation with Supabase ID: ${insertedData?.id}`)
      }
    }

    // CRITICAL: Don't auto-delete conversations - only delete if explicitly marked for deletion
    // This prevents accidental data loss from race conditions or matching failures
    // If a conversation exists in DB but not in incoming array, it might be:
    // 1. Not loaded yet (race condition)
    // 2. Client-side ID mismatch (Date.now() vs UUID)
    // 3. Temporary state during save
    // So we preserve existing conversations that aren't in the incoming array
    
    // Only delete conversations that are explicitly marked for deletion
    // For now, we don't auto-delete - user must explicitly delete conversations
    // This is safer and prevents data loss
    
    console.log('✅ Saved conversations without auto-deletion (preserving existing data)')
  } catch (error) {
    console.error('Error saving chat conversations:', error)
    throw error
  }
}

export async function loadChatConversations(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // CRITICAL: Map conversations with proper timestamp handling
    return (data || []).map(conv => {
      // Get timestamp from created_at or updated_at
      let timestamp: Date
      if (conv.created_at) {
        timestamp = new Date(conv.created_at)
      } else if (conv.updated_at) {
        timestamp = new Date(conv.updated_at)
      } else {
        // Fallback to current date if no timestamp
        timestamp = new Date()
      }
      
      // Get last message for lastMessage field
      const messages = Array.isArray(conv.messages) ? conv.messages : []
      const lastMessage = messages.length > 0 
        ? (messages[messages.length - 1]?.content || '').substring(0, 50) + '...'
        : 'New conversation'
      
      return {
        id: conv.id,
        title: conv.title || 'New Conversation',
        lastMessage: lastMessage,
        timestamp: timestamp,
        messages: messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? (typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp) : timestamp
        }))
      }
    })
  } catch (error) {
    console.error('Error loading chat conversations:', error)
    return []
  }
}

// ============================================
// SYSTEMS DATA
// ============================================

export async function saveSystemsData(userId: string, systemsData: any): Promise<void> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available, skipping save to Supabase')
      return
    }
    
    // CRITICAL: Log what we're being asked to save BEFORE loading existing data
    console.log('🔍 saveSystemsData called:', {
      userId,
      hasSystems: systemsData.systems !== undefined,
      systemsCount: systemsData.systems?.length ?? 'not provided',
      systemsIsEmpty: Array.isArray(systemsData.systems) && systemsData.systems.length === 0,
      hasSavedSOPs: systemsData.savedSOPs !== undefined,
      savedSOPsCount: systemsData.savedSOPs?.length ?? 'not provided',
      callStack: new Error().stack?.split('\n').slice(1, 4).join(' -> ')
    })
    
    // CRITICAL SAFEGUARD: If explicitly passing empty array, warn
    if (Array.isArray(systemsData.systems) && systemsData.systems.length === 0) {
      console.warn('⚠️ WARNING: saveSystemsData called with empty systems array!', {
        userId,
        stackTrace: new Error().stack?.split('\n').slice(1, 5).join('\n')
      })
    }
    
    // Load existing data first to preserve what's not being updated
    // Add timeout to prevent hanging
    const loadPromise = loadSystemsData(userId)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Load timeout')), 2000)
    )
    
    let existingData: any = null
    try {
      existingData = await Promise.race([loadPromise, timeoutPromise]) as any
      console.log('📦 Loaded existing data:', {
        existingSystemsCount: existingData?.systems?.length || 0,
        existingSOPsCount: existingData?.savedSOPs?.length || 0
      })
    } catch (loadError) {
      console.warn('⚠️ Failed to load existing systems data:', loadError)
      // CRITICAL: If load fails, don't overwrite with empty arrays
      // Only proceed if we have valid data to save
      if (systemsData.systems === undefined && systemsData.savedSOPs === undefined) {
        console.error('❌ Cannot save: Load failed and no data provided - aborting to prevent data loss')
        throw new Error('Failed to load existing data and no new data provided')
      }
      // If we have data to save, continue but preserve existing if we can't load
      existingData = null
    }
    
    // Merge with existing data - only update what's provided, preserve the rest
    // CRITICAL: Don't overwrite with empty arrays if we have existing data
    let systemsToSave: any[]
    if (systemsData.systems !== undefined) {
      // If explicitly provided, use it (even if empty - user might have deleted all)
      systemsToSave = systemsData.systems
    } else if (existingData?.systems) {
      // Preserve existing if not provided
      systemsToSave = existingData.systems
    } else {
      // Default to empty only if no existing data
      systemsToSave = []
    }
    
    let sopsToSave: any[]
    if (systemsData.savedSOPs !== undefined) {
      // If explicitly provided, use it
      sopsToSave = systemsData.savedSOPs
    } else if (existingData?.savedSOPs) {
      // Preserve existing if not provided
      sopsToSave = existingData.savedSOPs
    } else {
      // Default to empty only if no existing data
      sopsToSave = []
    }
    
    // CRITICAL: Safety check - don't save if we're about to overwrite with empty and we have existing data
    if (existingData && systemsToSave.length === 0 && existingData.systems?.length > 0) {
      console.error('🚨 BLOCKED: Attempted to overwrite existing systems with empty array!', {
        existingCount: existingData.systems.length,
        attemptedSave: systemsToSave.length,
        stackTrace: new Error().stack?.split('\n').slice(1, 6).join('\n')
      })
      console.warn('⚠️ Prevented overwriting existing systems with empty array - preserving existing data')
      systemsToSave = existingData.systems
    }
    
    if (existingData && sopsToSave.length === 0 && existingData.savedSOPs?.length > 0) {
      console.error('🚨 BLOCKED: Attempted to overwrite existing SOPs with empty array!', {
        existingCount: existingData.savedSOPs.length,
        attemptedSave: sopsToSave.length
      })
      console.warn('⚠️ Prevented overwriting existing SOPs with empty array - preserving existing data')
      sopsToSave = existingData.savedSOPs
    }
    
    console.log('💾 Saving systems data:', {
      systemsCount: systemsToSave.length,
      sopsCount: sopsToSave.length,
      updatingSystems: systemsData.systems !== undefined,
      updatingSOPs: systemsData.savedSOPs !== undefined,
      existingSystemsCount: existingData?.systems?.length || 0
    })
    
    // Validate data before saving
    if (!Array.isArray(systemsToSave)) {
      console.error('❌ Invalid systems data - not an array:', systemsToSave)
      throw new Error('Systems data must be an array')
    }
    
    if (!Array.isArray(sopsToSave)) {
      console.error('❌ Invalid SOPs data - not an array:', sopsToSave)
      throw new Error('SOPs data must be an array')
    }
    
    // Filter out invalid/corrupted systems (like "ZFD" or empty objects)
    const validSystems = systemsToSave.filter((sys: any) => {
      // Must have at least an id and name
      if (!sys || typeof sys !== 'object') return false
      if (!sys.id || !sys.name) return false
      // Filter out obviously corrupted entries
      if (sys.name === 'ZFD' || sys.id === 'ZFD' || sys.name.trim() === '') return false
      return true
    })
    
    if (validSystems.length !== systemsToSave.length) {
      console.warn(`⚠️ Filtered out ${systemsToSave.length - validSystems.length} invalid systems`)
      systemsToSave = validSystems
    }
    
    const { error } = await supabase
      .from('systems_data')
      .upsert({
        user_id: userId,
        systems: systemsToSave,
        saved_sops: sopsToSave,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Supabase upsert error:', error)
      throw error
    }
    
    console.log('✅ Successfully saved systems data to Supabase:', {
      systems: systemsToSave.length,
      sops: sopsToSave.length
    })
  } catch (error) {
    console.error('❌ Error saving systems data to Supabase:', error)
    // Don't throw - allow fallback to localStorage
    // But log the error for debugging
    throw error
  }
}

export async function loadSystemsData(userId: string): Promise<any | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available, cannot load from Supabase')
      return null
    }
    
    console.log('🔍 Loading systems data from Supabase for user:', userId)
    
    const { data, error } = await supabase
      .from('systems_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is OK, return empty data
        console.log('No systems data found in Supabase for user:', userId)
        return {
          systems: [],
          savedSOPs: []
        }
      } else {
        console.error('❌ Supabase query error:', error)
        throw error
      }
    }
    
    if (!data) {
      console.log('No systems data found in Supabase for user:', userId)
      return {
        systems: [],
        savedSOPs: []
      }
    }

    // CRITICAL: Log what we received for debugging
    console.log('📦 Raw data from Supabase:', {
      hasData: !!data,
      systemsType: typeof data.systems,
      systemsIsArray: Array.isArray(data.systems),
      systemsLength: Array.isArray(data.systems) ? data.systems.length : 'N/A',
      systemsPreview: Array.isArray(data.systems) && data.systems.length > 0 
        ? data.systems[0]?.name || 'No name' 
        : 'Empty'
    })

    // Ensure systems is an array
    let systems = data.systems
    if (!Array.isArray(systems)) {
      console.warn('⚠️ Systems data is not an array, converting:', typeof systems)
      if (systems && typeof systems === 'object') {
        // Try to convert object to array
        systems = Object.values(systems)
      } else {
        systems = []
      }
    }

    // Ensure savedSOPs is an array
    let savedSOPs = data.saved_sops
    if (!Array.isArray(savedSOPs)) {
      if (savedSOPs && typeof savedSOPs === 'object') {
        savedSOPs = Object.values(savedSOPs)
      } else {
        savedSOPs = []
      }
    }

    console.log('✅ Successfully loaded systems data from Supabase:', {
      systemsCount: systems.length,
      sopsCount: savedSOPs.length
    })

    return {
      systems: systems || [],
      savedSOPs: savedSOPs || []
    }
  } catch (error) {
    console.error('❌ Error loading systems data from Supabase:', error)
    return null
  }
}

// ============================================
// REVENUE DATA
// ============================================

export async function saveRevenueData(userId: string, revenueData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('revenue_data')
      .upsert({
        user_id: userId,
        dashboards: revenueData.dashboards || [],
        optimizations: revenueData.optimizations || [],
        pricing_strategies: revenueData.pricingStrategies || [],
        goals: revenueData.goals || [],
        ltv_analyses: revenueData.ltvAnalyses || [],
        scenarios: revenueData.scenarios || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving revenue data:', error)
    throw error
  }
}

export async function loadRevenueData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('revenue_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      dashboards: data.dashboards || [],
      optimizations: data.optimizations || [],
      pricingStrategies: data.pricing_strategies || [],
      goals: data.goals || [],
      ltvAnalyses: data.ltv_analyses || [],
      scenarios: data.scenarios || []
    }
  } catch (error) {
    console.error('Error loading revenue data:', error)
    return null
  }
}

// ============================================
// LEADERSHIP DATA
// ============================================

export async function saveLeadershipData(userId: string, leadershipData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('leadership_data')
      .upsert({
        user_id: userId,
        style_assessment: leadershipData.styleAssessment || null,
        decisions: leadershipData.decisions || [],
        communications: leadershipData.communications || [],
        conflicts: leadershipData.conflicts || [],
        routines: leadershipData.routines || [],
        challenges: leadershipData.challenges || [],
        feedback_360: leadershipData.feedback360 || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving leadership data:', error)
    throw error
  }
}

export async function loadLeadershipData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('leadership_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      styleAssessment: data.style_assessment,
      decisions: data.decisions || [],
      communications: data.communications || [],
      conflicts: data.conflicts || [],
      routines: data.routines || [],
      challenges: data.challenges || [],
      feedback360: data.feedback_360 || []
    }
  } catch (error) {
    console.error('Error loading leadership data:', error)
    return null
  }
}

// ============================================
// TEAMS DATA
// ============================================

export async function saveTeamsData(userId: string, teamsData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('teams_data')
      .upsert({
        user_id: userId,
        dna_analyses: teamsData.dnaAnalyses || [],
        task_assignments: teamsData.taskAssignments || [],
        health_monitors: teamsData.healthMonitors || [],
        cofounder_matches: teamsData.coFounderMatches || [],
        rituals: teamsData.rituals || [],
        members: teamsData.members || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving teams data:', error)
    throw error
  }
}

export async function loadTeamsData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('teams_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      dnaAnalyses: data.dna_analyses || [],
      taskAssignments: data.task_assignments || [],
      healthMonitors: data.health_monitors || [],
      coFounderMatches: data.cofounder_matches || [],
      rituals: data.rituals || [],
      members: data.members || []
    }
  } catch (error) {
    console.error('Error loading teams data:', error)
    return null
  }
}

// ============================================
// FEEDBACK
// ============================================

export async function saveFeedback(userId: string | null, email: string | null, feedbackData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        email: email,
        feedback: feedbackData.feedback,
        category: feedbackData.category,
        priority: feedbackData.priority,
        issues: feedbackData.issues || []
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving feedback:', error)
    throw error
  }
}

export async function loadFeedback(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading feedback:', error)
    return []
  }
}

// ============================================
// TESTIMONIALS
// ============================================

export async function saveTestimonial(userId: string | null, email: string | null, testimonial: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('testimonials')
      .insert({
        user_id: userId,
        email: email,
        testimonial: testimonial
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving testimonial:', error)
    throw error
  }
}

// ============================================
// DAILY MOOD
// ============================================

export async function saveDailyMood(userId: string, mood: string, date: string, timestamp: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('daily_mood')
      .upsert({
        user_id: userId,
        date: date,
        mood: mood,
        timestamp: timestamp
      }, {
        onConflict: 'user_id,date'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving daily mood:', error)
    throw error
  }
}

export async function loadDailyMood(userId: string, date: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('daily_mood')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error('Error loading daily mood:', error)
    return null
  }
}

// ============================================
// TASKS DATA
// ============================================

export async function saveTasksData(userId: string, tasksData: any): Promise<void> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available, skipping save')
      return
    }

    const { error } = await supabase
      .from('tasks_data')
      .upsert({
        user_id: userId,
        daily_tasks: tasksData.daily || [],
        weekly_tasks: tasksData.weekly || [],
        monthly_tasks: tasksData.monthly || [],
        yearly_tasks: tasksData.yearly || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      // Handle 406 Not Acceptable - table might not exist
      if (error.message?.includes('406') || error.status === 406) {
        console.warn('⚠️ Tasks data table not accessible (406). Table may not exist. Please run the complete schema SQL.')
        // Don't throw - allow app to continue with localStorage fallback
        return
      }
      throw error
    }
  } catch (error) {
    console.error('Error saving tasks data:', error)
    // Don't throw - allow fallback to localStorage
    // Log error for debugging but don't break the app
  }
}

export async function loadTasksData(userId: string): Promise<any | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available, cannot load tasks data')
      return null
    }

    const { data, error } = await supabase
      .from('tasks_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Handle "no rows" error gracefully
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is OK, return null
        return null
      }
      
      // Handle 406 Not Acceptable - table might not exist or RLS issue
      if (error.message?.includes('406') || error.status === 406) {
        console.warn('⚠️ Tasks data table not accessible (406). Table may not exist or RLS policies need configuration.')
        return null
      }
      
      // Log other errors but don't throw - allow fallback
      console.error('Error loading tasks data:', error)
      return null
    }
    
    if (!data) return null

    return {
      daily: data.daily_tasks || [],
      weekly: data.weekly_tasks || [],
      monthly: data.monthly_tasks || [],
      yearly: data.yearly_tasks || []
    }
  } catch (error) {
    console.error('Error loading tasks data:', error)
    return null
  }
}

// ============================================
// DREAMPULSE DATA
// ============================================

export async function saveDreamPulseData(userId: string, dreampulseData: any): Promise<void> {
  try {
    // CRITICAL: Load existing data first to prevent data loss
    const existingData = await loadDreamPulseData(userId)
    
    // Merge with existing data - preserve what's not being updated
    const savedAnalyses = dreampulseData.savedAnalyses !== undefined 
      ? dreampulseData.savedAnalyses 
      : (existingData?.savedAnalyses || [])
    
    const competitorMonitoring = dreampulseData.competitorMonitoring !== undefined
      ? dreampulseData.competitorMonitoring
      : (existingData?.competitorMonitoring || {})
    
    console.log('💾 Saving DreamPulse data:', {
      userId,
      savedAnalysesCount: savedAnalyses.length,
      competitorMonitoringKeys: Object.keys(competitorMonitoring).length
    })
    
    const { error } = await supabase
      .from('dreampulse_data')
      .upsert({
        user_id: userId,
        saved_analyses: savedAnalyses,
        competitor_monitoring: competitorMonitoring,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Supabase error saving DreamPulse data:', error)
      throw error
    }
    
    console.log('✅ Successfully saved DreamPulse data to Supabase permanently')
  } catch (error) {
    console.error('Error saving DreamPulse data:', error)
    throw error
  }
}

export async function loadDreamPulseData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('dreampulse_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      savedAnalyses: data.saved_analyses || [],
      competitorMonitoring: data.competitor_monitoring || {}
    }
  } catch (error) {
    console.error('Error loading DreamPulse data:', error)
    return null
  }
}

// ============================================
// USER PREFERENCES
// ============================================

export async function saveUserPreferences(userId: string, preferences: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        theme: preferences.theme || 'light',
        language: preferences.language || 'en',
        notification_settings: preferences.notificationSettings || {},
        email_preferences: preferences.emailPreferences || {},
        ui_preferences: preferences.uiPreferences || {},
        feature_flags: preferences.featureFlags || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving user preferences:', error)
    throw error
  }
}

export async function loadUserPreferences(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      theme: data.theme || 'light',
      language: data.language || 'en',
      notificationSettings: data.notification_settings || {},
      emailPreferences: data.email_preferences || {},
      uiPreferences: data.ui_preferences || {},
      featureFlags: data.feature_flags || {}
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
    return null
  }
}

// ============================================
// USER NOTIFICATIONS
// ============================================

export async function saveUserNotifications(userId: string, notifications: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .upsert({
        user_id: userId,
        feature_seen_status: notifications.featureSeenStatus || {},
        notification_preferences: notifications.notificationPreferences || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving user notifications:', error)
    throw error
  }
}

export async function loadUserNotifications(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      featureSeenStatus: data.feature_seen_status || {},
      notificationPreferences: data.notification_preferences || {}
    }
  } catch (error) {
    console.error('Error loading user notifications:', error)
    return null
  }
}

// ============================================
// EMAIL CAPTURES
// ============================================

export async function saveEmailCapture(userId: string | null, email: string, source: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('email_captures')
      .insert({
        user_id: userId,
        email: email,
        source: source
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving email capture:', error)
    throw error
  }
}

// ============================================
// SKILLDROPS PROGRESS
// ============================================

export async function saveSkillDropsProgress(userId: string, progress: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('skilldrops_progress')
      .upsert({
        user_id: userId,
        completed_lessons: progress.completedLessons || [],
        progress_tracking: progress.progressTracking || {},
        certificates: progress.certificates || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving SkillDrops progress:', error)
    throw error
  }
}

export async function loadSkillDropsProgress(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('skilldrops_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      completedLessons: data.completed_lessons || [],
      progressTracking: data.progress_tracking || {},
      certificates: data.certificates || []
    }
  } catch (error) {
    console.error('Error loading SkillDrops progress:', error)
    return null
  }
}

// ============================================
// PROJECTS DATA
// ============================================

export async function saveProjectsData(userId: string, projects: any[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects_data')
      .upsert({
        user_id: userId,
        projects: projects || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving projects data:', error)
    throw error
  }
}

export async function loadProjectsData(userId: string): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return data.projects || []
  } catch (error) {
    console.error('Error loading projects data:', error)
    return null
  }
}

// ============================================
// FLOWMATCH DATA
// ============================================

export async function saveFlowMatchData(userId: string, flowMatchData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('flowmatch_data')
      .upsert({
        user_id: userId,
        flow_matches: flowMatchData.flowMatches || [],
        preferences: flowMatchData.preferences || {},
        results: flowMatchData.results || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving FlowMatch data:', error)
    throw error
  }
}

export async function loadFlowMatchData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('flowmatch_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      flowMatches: data.flow_matches || [],
      preferences: data.preferences || {},
      results: data.results || []
    }
  } catch (error) {
    console.error('Error loading FlowMatch data:', error)
    return null
  }
}

// ============================================
// SUGGESTIONS/ROADMAP DATA
// ============================================

export async function saveSuggestionsData(userId: string, suggestionsData: {
  mainSuggestions?: any[]
  dailySuggestions?: any[]
  deepFocusAreas?: any[]
  completedSuggestionIds?: string[]
}): Promise<void> {
  try {
    // Load existing data to merge
    const existing = await loadSuggestionsData(userId)
    
    const updateData: any = {
      user_id: userId,
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (suggestionsData.mainSuggestions !== undefined) {
      updateData.main_suggestions = suggestionsData.mainSuggestions
    } else if (existing?.mainSuggestions) {
      updateData.main_suggestions = existing.mainSuggestions
    }

    if (suggestionsData.dailySuggestions !== undefined) {
      updateData.daily_suggestions = suggestionsData.dailySuggestions
    } else if (existing?.dailySuggestions) {
      updateData.daily_suggestions = existing.dailySuggestions
    }

    if (suggestionsData.deepFocusAreas !== undefined) {
      updateData.deep_focus_areas = suggestionsData.deepFocusAreas
    } else if (existing?.deepFocusAreas) {
      updateData.deep_focus_areas = existing.deepFocusAreas
    }

    if (suggestionsData.completedSuggestionIds !== undefined) {
      updateData.completed_suggestion_ids = suggestionsData.completedSuggestionIds
    } else if (existing?.completedSuggestionIds) {
      updateData.completed_suggestion_ids = existing.completedSuggestionIds
    }

    // Set last_generated_at if we're updating suggestions
    if (suggestionsData.mainSuggestions || suggestionsData.dailySuggestions) {
      updateData.last_generated_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('suggestions_data')
      .upsert(updateData, {
        onConflict: 'user_id'
      })

    if (error) throw error
    console.log('✅ Saved suggestions data to Supabase')
  } catch (error) {
    console.error('Error saving suggestions data:', error)
    throw error
  }
}

export async function loadSuggestionsData(userId: string): Promise<{
  mainSuggestions: any[]
  dailySuggestions: any[]
  deepFocusAreas: any[]
  completedSuggestionIds: string[]
  lastGeneratedAt: string | null
} | null> {
  try {
    const { data, error } = await supabase
      .from('suggestions_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    if (!data) return null

    return {
      mainSuggestions: data.main_suggestions || [],
      dailySuggestions: data.daily_suggestions || [],
      deepFocusAreas: data.deep_focus_areas || [],
      completedSuggestionIds: data.completed_suggestion_ids || [],
      lastGeneratedAt: data.last_generated_at || null
    }
  } catch (error) {
    console.error('Error loading suggestions data:', error)
    return null
  }
}

