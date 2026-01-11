/**
 * Supabase Client Exports
 * 
 * This file provides a unified export point for Supabase clients.
 * 
 * For client components, use: import { createClient } from '@/lib/supabase/client'
 * For server components/route handlers, use: import { createClient } from '@/lib/supabase/server'
 * 
 * Legacy export maintained for backward compatibility during migration.
 */

// Re-export client helper (for client components)
export { createClient as createClient } from './supabase/client'

// Re-export server helper (for server components/route handlers)
export { createClient as createServerClient } from './supabase/server'

// NOTE: Legacy { supabase } export removed
// All files have been updated to use createClient() directly
// If you see this error, update the import to:
// Client: import { createClient } from '@/lib/supabase/client'
// Server: import { createClient } from '@/lib/supabase/server'

// Database types
export interface CofounderProfileDB {
  id: string
  user_id: string
  name: string
  email?: string
  linkedin_id?: string
  linkedin_url?: string
  profile_picture_url?: string
  skills: string[]
  values: string[]
  availability: 'full-time' | 'part-time' | 'consulting'
  experience: string
  location?: string
  looking_for: string[]
  preferences: {
    equity?: string
    commitment?: string
    workingStyle?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MatchDB {
  id: string
  profile1_id: string
  profile2_id: string
  match_score: number
  analysis: {
    complementarySkills: string[]
    sharedValues: string[]
    potentialChallenges: string[]
    collaborationFit: number
    recommendation: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}
