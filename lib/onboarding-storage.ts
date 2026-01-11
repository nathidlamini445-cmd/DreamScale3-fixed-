import { OnboardingData } from '@/components/onboarding/onboarding-types'
import { supabase } from './supabase'

/**
 * Save onboarding completion status to Supabase
 * @param userId - The user's ID from Supabase auth
 */
export async function saveOnboardingData(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID required to save onboarding data')
  }
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      throw new Error(`Failed to save onboarding: ${error.message}`)
    }
  } catch (error) {
    console.error('Failed to save onboarding data:', error)
    throw error
  }
}

/**
 * Load onboarding data from session context (not from localStorage)
 * This is a legacy function - onboarding data is now stored in session context
 */
export function loadOnboardingData(): OnboardingData | null {
  // This function is deprecated - onboarding data is now in session context
  // Keeping for backward compatibility but returning null
  console.warn('loadOnboardingData() is deprecated - use session context instead')
  return null
}

/**
 * Check if onboarding has been completed (from Supabase)
 * @param userId - The user's ID from Supabase auth
 */
export async function isOnboardingCompleted(userId?: string): Promise<boolean> {
  if (!userId) {
    return false
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      return false
    }
    
    return data.onboarding_completed === true
  } catch (error) {
    console.error('Failed to check onboarding status:', error)
    return false
  }
}

/**
 * Clear onboarding data (mark as incomplete in Supabase)
 * @param userId - The user's ID from Supabase auth
 */
export async function clearOnboardingData(userId?: string): Promise<void> {
  if (!userId) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: false })
      .eq('id', userId)
    
    if (error) {
      console.error('Failed to clear onboarding data:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to clear onboarding data:', error)
    throw error
  }
}

/**
 * Save onboarding data to your backend API
 * Replace the URL with your actual API endpoint
 */
export async function saveOnboardingDataToAPI(data: OnboardingData): Promise<boolean> {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save onboarding data to API')
    }
    
    return true
  } catch (error) {
    console.error('Failed to save onboarding data to API:', error)
    return false
  }
}

/**
 * Get user's industry for personalization
 */
export function getUserIndustry(data: OnboardingData): string | null {
  const industry = data.industry
  if (Array.isArray(industry) && industry.length > 0) {
    return industry[0]
  }
  return typeof industry === 'string' ? industry : null
}

/**
 * Get user's business stage for personalization
 */
export function getUserBusinessStage(data: OnboardingData): string | null {
  const stage = data.businessStage
  if (Array.isArray(stage) && stage.length > 0) {
    return stage[0]
  }
  return typeof stage === 'string' ? stage : null
}

/**
 * Get user's challenges for personalized recommendations
 */
export function getUserChallenges(data: OnboardingData): string[] {
  const challenges = data.challenges
  if (Array.isArray(challenges)) {
    return challenges
  }
  return typeof challenges === 'string' ? [challenges] : []
}

/**
 * Get user's name for personalization
 */
export function getUserName(data: OnboardingData): string | null {
  return data.name || null
}

/**
 * Create a context string for AI personalization
 * This can be used to personalize AI responses based on onboarding data
 */
export function createPersonalizationContext(data: OnboardingData): string {
  const name = getUserName(data)
  const industry = getUserIndustry(data)
  const stage = getUserBusinessStage(data)
  const challenges = getUserChallenges(data)
  const businessName = data.businessName
  
  let context = ''
  
  if (name) {
    context += `User's name: ${name}. `
  }
  
  if (businessName) {
    context += `Business name: ${businessName}. `
  }
  
  if (industry) {
    context += `Industry: ${industry}. `
  }
  
  if (stage) {
    context += `Business stage: ${stage}. `
  }
  
  if (challenges.length > 0) {
    context += `Current challenges: ${challenges.join(', ')}. `
  }
  
  if (data.biggestGoal) {
    const goal = Array.isArray(data.biggestGoal) ? data.biggestGoal[0] : data.biggestGoal
    context += `Primary goal: ${goal}. `
  }
  
  return context.trim()
}

