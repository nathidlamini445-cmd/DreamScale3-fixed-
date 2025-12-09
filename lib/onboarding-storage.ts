import { OnboardingData } from '@/components/onboarding/onboarding-types'

/**
 * Save onboarding data to localStorage
 * This allows the data to persist across sessions
 */
export function saveOnboardingData(data: OnboardingData): void {
  try {
    localStorage.setItem('onboardingData', JSON.stringify(data))
    localStorage.setItem('onboardingCompleted', 'true')
    localStorage.setItem('onboardingTimestamp', new Date().toISOString())
  } catch (error) {
    console.error('Failed to save onboarding data:', error)
  }
}

/**
 * Load onboarding data from localStorage
 */
export function loadOnboardingData(): OnboardingData | null {
  try {
    const data = localStorage.getItem('onboardingData')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load onboarding data:', error)
    return null
  }
}

/**
 * Check if onboarding has been completed
 */
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem('onboardingCompleted') === 'true'
  } catch (error) {
    return false
  }
}

/**
 * Clear onboarding data (useful for logout or reset)
 */
export function clearOnboardingData(): void {
  try {
    localStorage.removeItem('onboardingData')
    localStorage.removeItem('onboardingCompleted')
    localStorage.removeItem('onboardingTimestamp')
  } catch (error) {
    console.error('Failed to clear onboarding data:', error)
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

