/**
 * Supabase Client Exports
 * 
 * IMPORTANT: This file only exports client-side helpers and types.
 * DO NOT import server helpers from this file - import directly from '@/lib/supabase/server'
 * 
 * For client components, use: import { createClient } from '@/lib/supabase/client'
 * For server components/route handlers, use: import { createClient } from '@/lib/supabase/server'
 * 
 * NOTE: Server helper is NOT re-exported here to prevent client-side bundling issues.
 */

// Re-export client helper (for client components)
export { createClient as createClient } from './supabase/client'

// NOTE: Server helper is NOT re-exported to prevent 'next/headers' from being bundled in client code
// Server components/route handlers must import directly: import { createClient } from '@/lib/supabase/server'

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
