// Supabase removed - using localStorage fallback only

export const supabase = null

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

