'use client'

import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

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
    const { error } = await supabase
      .from('hypeos_data')
      .upsert({
        user_id: userId,
        user_data: hypeosData.user || null,
        tasks: hypeosData.tasks || [],
        mini_wins: hypeosData.miniWins || [],
        quests: hypeosData.quests || [],
        all_goals: hypeosData.allGoals || [],
        tasks_last_date: hypeosData.tasksLastDate || null,
        redeemed_rewards: hypeosData.redeemedRewards || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
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
    // Delete existing conversations
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId)

    // Insert new conversations
    if (conversations.length > 0) {
      const { error } = await supabase
        .from('chat_conversations')
        .insert(conversations.map(conv => ({
          user_id: userId,
          title: conv.title || 'New Conversation',
          messages: conv.messages || []
        })))

      if (error) throw error
    }
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
    return (data || []).map(conv => ({
      id: conv.id,
      title: conv.title,
      messages: conv.messages || []
    }))
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
    const { error } = await supabase
      .from('systems_data')
      .upsert({
        user_id: userId,
        systems: systemsData.systems || [],
        saved_sops: systemsData.savedSOPs || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving systems data:', error)
    throw error
  }
}

export async function loadSystemsData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('systems_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      systems: data.systems || [],
      savedSOPs: data.saved_sops || []
    }
  } catch (error) {
    console.error('Error loading systems data:', error)
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

    if (error) throw error
  } catch (error) {
    console.error('Error saving tasks data:', error)
    throw error
  }
}

export async function loadTasksData(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('tasks_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
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

