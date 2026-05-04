import { OnboardingData } from '@/components/onboarding/onboarding-types'

export interface Task {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: 'high' | 'medium' | 'low'
  category: string
  dueDate?: Date
  completed: boolean
  createdAt: Date
}

/**
 * Generate tasks using Gemini AI - personalized and comprehensive
 * Falls back to static tasks if API fails
 */
export async function generateTasksFromOnboardingAI(data: OnboardingData): Promise<{
  daily: Task[]
  weekly: Task[]
  monthly: Task[]
  yearly: Task[]
}> {
  try {
    const response = await fetch('/api/tasks/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ onboardingData: data }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    if (result.tasks) {
      return result.tasks
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Failed to generate tasks with AI, falling back to static tasks:', error)
    // Fall back to static tasks
    return generateTasksFromOnboarding(data)
  }
}

/**
 * Generate static tasks from onboarding data (fallback)
 * Used when AI generation fails or is not available
 */
export function generateTasksFromOnboarding(data: OnboardingData): {
  daily: Task[]
  weekly: Task[]
  monthly: Task[]
  yearly: Task[]
} {
  const industry = Array.isArray(data.industry) ? data.industry[0] : data.industry
  const businessStage = Array.isArray(data.businessStage) ? data.businessStage[0] : data.businessStage
  const challenges = Array.isArray(data.challenges) ? data.challenges : (data.challenges ? [data.challenges] : [])
  const revenueGoal = Array.isArray(data.revenueGoal) ? data.revenueGoal[0] : data.revenueGoal
  const biggestGoal = Array.isArray(data.biggestGoal) ? data.biggestGoal[0] : data.biggestGoal
  const businessName = data.businessName || 'your business'
  const targetMarket = Array.isArray(data.targetMarket) ? data.targetMarket[0] : data.targetMarket
  const teamSize = Array.isArray(data.teamSize) ? data.teamSize[0] : data.teamSize

  const daily: Task[] = []
  const weekly: Task[] = []
  const monthly: Task[] = []
  const yearly: Task[] = []

  // Daily tasks based on challenges
  if (challenges.includes('Customer Acquisition') || challenges.some(c => c.toLowerCase().includes('customer'))) {
    daily.push({
      id: 'daily-1',
      title: 'Reach out to 3 potential customers',
      description: `Contact 3 potential customers in ${industry || 'your industry'}${targetMarket ? ` targeting ${targetMarket}` : ''} through email or social media`,
      type: 'daily',
      priority: 'high',
      category: 'Sales',
      completed: false,
      createdAt: new Date()
    })
  }

  if (challenges.includes('Marketing') || challenges.some(c => c.toLowerCase().includes('marketing'))) {
    daily.push({
      id: 'daily-2',
      title: 'Create and post social media content',
      description: `Share valuable content about ${businessName} on your social platforms to build awareness`,
      type: 'daily',
      priority: 'medium',
      category: 'Marketing',
      completed: false,
      createdAt: new Date()
    })
  }

  // Always add a daily task for tracking
  daily.push({
    id: 'daily-3',
    title: 'Review daily progress and metrics',
    description: `Track your progress toward ${biggestGoal || 'your goals'} and update your metrics`,
    type: 'daily',
    priority: 'high',
    category: 'Analytics',
    completed: false,
    createdAt: new Date()
  })

  // Weekly tasks
  weekly.push({
    id: 'weekly-1',
    title: 'Review and update business metrics',
    description: 'Track your key performance indicators, analyze trends, and adjust strategy accordingly',
    type: 'weekly',
    priority: 'high',
    category: 'Analytics',
    completed: false,
    createdAt: new Date()
  })

  weekly.push({
    id: 'weekly-2',
    title: 'Network with industry professionals',
    description: `Connect with 5 professionals in ${industry || 'your industry'} through LinkedIn, events, or networking groups`,
    type: 'weekly',
    priority: 'medium',
    category: 'Networking',
    completed: false,
    createdAt: new Date()
  })

  if (challenges.includes('Team Building') || challenges.some(c => c.toLowerCase().includes('team'))) {
    weekly.push({
      id: 'weekly-3',
      title: 'Team check-in and alignment',
      description: `Have a team meeting to align on goals, address challenges, and celebrate wins${teamSize ? ` with your ${teamSize} team` : ''}`,
      type: 'weekly',
      priority: 'high',
      category: 'Team',
      completed: false,
      createdAt: new Date()
    })
  }

  // Monthly tasks
  monthly.push({
    id: 'monthly-1',
    title: 'Strategic business review',
    description: `Review progress toward your goal: ${biggestGoal || 'business growth'}. Analyze what's working, what's not, and adjust your strategy.`,
    type: 'monthly',
    priority: 'high',
    category: 'Strategy',
    completed: false,
    createdAt: new Date()
  })

  monthly.push({
    id: 'monthly-2',
    title: 'Financial review and planning',
    description: `Review your revenue progress toward ${revenueGoal || 'your revenue goal'}, analyze expenses, and plan next month's budget`,
    type: 'monthly',
    priority: 'high',
    category: 'Finance',
    completed: false,
    createdAt: new Date()
  })

  monthly.push({
    id: 'monthly-3',
    title: 'Customer feedback analysis',
    description: `Collect and analyze feedback from customers in ${industry || 'your industry'}. Identify patterns and areas for improvement.`,
    type: 'monthly',
    priority: 'medium',
    category: 'Customer Success',
    completed: false,
    createdAt: new Date()
  })

  // Yearly tasks
  yearly.push({
    id: 'yearly-1',
    title: 'Annual business planning',
    description: `Create comprehensive plan for the next year in ${industry || 'your industry'}. Set major milestones, revenue targets, and strategic goals.`,
    type: 'yearly',
    priority: 'high',
    category: 'Planning',
    completed: false,
    createdAt: new Date()
  })

  yearly.push({
    id: 'yearly-2',
    title: 'Annual performance review',
    description: `Review ${businessName}'s performance over the past year. Celebrate wins, learn from challenges, and document key insights.`,
    type: 'yearly',
    priority: 'high',
    category: 'Review',
    completed: false,
    createdAt: new Date()
  })

  yearly.push({
    id: 'yearly-3',
    title: 'Long-term vision and roadmap',
    description: `Define or refine your 3-5 year vision for ${businessName}. Create a roadmap to achieve your long-term goals.`,
    type: 'yearly',
    priority: 'medium',
    category: 'Strategy',
    completed: false,
    createdAt: new Date()
  })

  return { daily, weekly, monthly, yearly }
}

