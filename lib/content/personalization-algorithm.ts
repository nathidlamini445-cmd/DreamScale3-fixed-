// Personalization algorithm for Discover page content
// Scores and ranks content based on user's onboarding data

export interface ContentItem {
  id: string
  title: string
  channel?: string
  entrepreneur?: string
  company?: string
  tags?: string[]
  categories?: string[]
  industry?: string[]
  hobby?: string[]
  businessStage?: string[]
  experienceLevel?: string[]
  goals?: string[]
  challenges?: string[]
  [key: string]: any
}

export interface UserProfile {
  industry?: string | null
  hobbies?: string[]
  businessStage?: string | null
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | null
  goals?: string[]
  challenges?: string | string[]
  biggestGoal?: string | string[]
  mindsetAnswers?: Record<string, string>
  email?: string | null // Add email for better account differentiation
}

// Hobby to content tag mappings
const hobbyContentMap: Record<string, string[]> = {
  'gym': ['fitness', 'health', 'wellness', 'motivation', 'discipline'],
  'music': ['music', 'creativity', 'art', 'entertainment', 'performance'],
  'reading': ['learning', 'education', 'knowledge', 'books', 'intellectual'],
  'cooking': ['food', 'creativity', 'business', 'restaurant', 'culinary'],
  'sports': ['teamwork', 'leadership', 'competition', 'discipline', 'performance'],
  'gaming': ['technology', 'entertainment', 'innovation', 'digital', 'strategy'],
  'art': ['creativity', 'design', 'visual', 'aesthetic', 'artistic'],
  'travel': ['adventure', 'culture', 'exploration', 'global', 'experience'],
  'photography': ['visual', 'creativity', 'art', 'marketing', 'content'],
  'movies': ['storytelling', 'entertainment', 'creativity', 'narrative'],
  'podcasts': ['learning', 'communication', 'content', 'education', 'ideas'],
  'coffee': ['business', 'retail', 'hospitality', 'community', 'experience'],
  'hiking': ['wellness', 'nature', 'adventure', 'mindfulness', 'health'],
  'dancing': ['creativity', 'performance', 'art', 'expression', 'entertainment'],
  'writing': ['content', 'communication', 'storytelling', 'marketing', 'education'],
  'technology': ['tech', 'innovation', 'digital', 'software', 'startup'],
  'networking': ['business', 'connections', 'relationships', 'sales', 'marketing']
}

// Business stage content preferences
const businessStageContentMap: Record<string, string[]> = {
  'idea': ['validation', 'planning', 'starting', 'beginner', 'foundation'],
  'foundation': ['growth', 'customers', 'operations', 'scaling', 'team'],
  'established': ['scaling', 'optimization', 'expansion', 'leadership', 'advanced']
}

// Experience level content preferences
const experienceLevelContentMap: Record<string, string[]> = {
  'beginner': ['basics', 'fundamentals', 'getting-started', 'learning', 'education'],
  'intermediate': ['growth', 'optimization', 'scaling', 'advanced-tactics', 'strategy'],
  'advanced': ['scaling', 'leadership', 'innovation', 'mastery', 'expert']
}

// Goal to content tag mappings
const goalContentMap: Record<string, string[]> = {
  'Increase revenue': ['revenue', 'sales', 'monetization', 'profit', 'growth'],
  'Get more customers': ['customers', 'acquisition', 'marketing', 'sales', 'growth'],
  'Build a team': ['team', 'hiring', 'leadership', 'management', 'culture'],
  'Improve operations': ['operations', 'efficiency', 'systems', 'process', 'optimization'],
  'Launch new products/services': ['product', 'launch', 'innovation', 'development', 'strategy'],
  'Build brand awareness': ['branding', 'marketing', 'awareness', 'visibility', 'promotion'],
  'Scale the business': ['scaling', 'growth', 'expansion', 'operations', 'strategy'],
  'Improve work-life balance': ['balance', 'wellness', 'productivity', 'time-management', 'health'],
  'Learn new skills': ['learning', 'education', 'skills', 'development', 'growth'],
  'Build partnerships': ['partnerships', 'networking', 'collaboration', 'relationships', 'business']
}

// Challenge to content tag mappings
const challengeContentMap: Record<string, string[]> = {
  'Customer Acquisition': ['customers', 'marketing', 'acquisition', 'sales', 'growth'],
  'Product Development': ['product', 'development', 'innovation', 'design', 'creation'],
  'Scaling': ['scaling', 'growth', 'operations', 'systems', 'expansion'],
  'Funding': ['funding', 'finance', 'investment', 'capital', 'money'],
  'Team Building': ['team', 'hiring', 'leadership', 'management', 'culture'],
  'Marketing': ['marketing', 'promotion', 'advertising', 'branding', 'awareness'],
  'Operations': ['operations', 'efficiency', 'systems', 'process', 'management']
}

/**
 * Calculate relevance score for a content item based on user profile
 */
export function calculateContentScore(
  content: ContentItem,
  profile: UserProfile
): number {
  let score = 0

  // Industry match (high weight)
  if (profile.industry && content.industry?.includes(profile.industry)) {
    score += 50
  }

  // Hobby matches (medium-high weight)
  if (profile.hobbies && profile.hobbies.length > 0) {
    profile.hobbies.forEach(hobby => {
      const hobbyTags = hobbyContentMap[hobby.toLowerCase()] || []
      hobbyTags.forEach(tag => {
        if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
          score += 30
        }
      })
      // Direct hobby match
      if (content.hobby?.includes(hobby.toLowerCase())) {
        score += 40
      }
    })
  }

  // Business stage match (medium weight)
  if (profile.businessStage) {
    const stageTags = businessStageContentMap[profile.businessStage] || []
    stageTags.forEach(tag => {
      if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
        score += 25
      }
    })
    if (content.businessStage?.includes(profile.businessStage)) {
      score += 30
    }
  }

  // Experience level match (medium weight)
  if (profile.experienceLevel) {
    const levelTags = experienceLevelContentMap[profile.experienceLevel] || []
    levelTags.forEach(tag => {
      if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
        score += 20
      }
    })
    if (content.experienceLevel?.includes(profile.experienceLevel)) {
      score += 25
    }
  }

  // Goals match (high weight)
  if (profile.goals && profile.goals.length > 0) {
    profile.goals.forEach(goal => {
      const goalTags = goalContentMap[goal] || []
      goalTags.forEach(tag => {
        if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
          score += 35
        }
      })
      if (content.goals?.includes(goal)) {
        score += 40
      }
    })
  }

  // Biggest goal match (very high weight)
  if (profile.biggestGoal) {
    const biggestGoal = Array.isArray(profile.biggestGoal) 
      ? profile.biggestGoal[0] 
      : profile.biggestGoal
    const goalTags = goalContentMap[biggestGoal] || []
    goalTags.forEach(tag => {
      if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
        score += 45
      }
    })
  }

  // Challenges match (high weight)
  if (profile.challenges) {
    const challenges = Array.isArray(profile.challenges) 
      ? profile.challenges 
      : [profile.challenges]
    challenges.forEach(challenge => {
      const challengeTags = challengeContentMap[challenge] || []
      challengeTags.forEach(tag => {
        if (content.tags?.includes(tag) || content.categories?.includes(tag)) {
          score += 35
        }
      })
      if (content.challenges?.includes(challenge)) {
        score += 40
      }
    })
  }

  // Mindset answers match (medium-high weight)
  // Extract keywords from mindset answers and match them
  if (profile.mindsetAnswers) {
    Object.values(profile.mindsetAnswers).forEach(answer => {
      if (answer && typeof answer === 'string') {
        const answerLower = answer.toLowerCase()
        
        // Check if answer contains keywords that match content tags
        content.tags?.forEach(tag => {
          if (answerLower.includes(tag.toLowerCase())) {
            score += 30
          }
        })
        content.categories?.forEach(category => {
          if (answerLower.includes(category.toLowerCase())) {
            score += 30
          }
        })
        
        // Specific matches for common check-in answers
        if (answerLower.includes('customer') || answerLower.includes('clients') || answerLower.includes('getting more customers')) {
          if (content.tags?.includes('customers') || content.tags?.includes('marketing') || content.tags?.includes('sales') || content.goals?.includes('Get more customers')) {
            score += 45
          }
        }
        if (answerLower.includes('growth') || answerLower.includes('scale') || answerLower.includes('scaling')) {
          if (content.tags?.includes('growth') || content.tags?.includes('scaling') || content.goals?.includes('Scale the business')) {
            score += 45
          }
        }
        if (answerLower.includes('team') || answerLower.includes('hiring') || answerLower.includes('building a team')) {
          if (content.tags?.includes('team') || content.tags?.includes('leadership') || content.goals?.includes('Build a team')) {
            score += 45
          }
        }
        if (answerLower.includes('revenue') || answerLower.includes('money') || answerLower.includes('profit') || answerLower.includes('income')) {
          if (content.tags?.includes('revenue') || content.tags?.includes('sales') || content.goals?.includes('Increase revenue')) {
            score += 45
          }
        }
        if (answerLower.includes('operation') || answerLower.includes('process') || answerLower.includes('system')) {
          if (content.tags?.includes('operations') || content.tags?.includes('efficiency') || content.goals?.includes('Improve operations')) {
            score += 45
          }
        }
        if (answerLower.includes('product') || answerLower.includes('launch') || answerLower.includes('service')) {
          if (content.tags?.includes('product') || content.tags?.includes('innovation') || content.goals?.includes('Launch new products/services')) {
            score += 45
          }
        }
        if (answerLower.includes('marketing') || answerLower.includes('brand') || answerLower.includes('awareness')) {
          if (content.tags?.includes('marketing') || content.tags?.includes('branding') || content.goals?.includes('Build brand awareness')) {
            score += 45
          }
        }
        // Match challenges mentioned in answers
        if (answerLower.includes('not getting') || answerLower.includes('lack of') || answerLower.includes('struggling')) {
          // Boost content that addresses these challenges
          if (content.challenges || content.tags?.some(tag => ['customers', 'marketing', 'sales', 'growth'].includes(tag))) {
            score += 40
          }
        }
      }
    })
  }

  return score
}

/**
 * Generate a deterministic but varied seed based on user profile
 * This ensures different accounts get different content even with similar profiles
 * Now includes email/user identifier for better differentiation
 */
function generateUserSeed(profile: UserProfile, userEmail?: string | null): number {
  // Include email in seed generation to differentiate accounts with similar profiles
  const emailHash = userEmail ? userEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
  
  const seedString = JSON.stringify({
    email: userEmail || '',
    emailHash: emailHash,
    industry: profile.industry || '',
    hobbies: (profile.hobbies || []).sort().join(','),
    businessStage: profile.businessStage || '',
    experienceLevel: profile.experienceLevel || '',
    goals: (profile.goals || []).sort().join(','),
    biggestGoal: Array.isArray(profile.biggestGoal) ? profile.biggestGoal[0] : (profile.biggestGoal || ''),
    challenges: Array.isArray(profile.challenges) ? profile.challenges.sort().join(',') : (profile.challenges || ''),
    mindsetKeys: Object.keys(profile.mindsetAnswers || {}).sort().join(','),
    // Add some randomness based on mindset answer values to differentiate further
    mindsetValues: Object.values(profile.mindsetAnswers || {}).join('|').substring(0, 50)
  })
  
  // Simple hash function to convert string to number
  let hash = emailHash // Start with email hash
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Add more variation by mixing in email hash at the end
  return Math.abs(hash + emailHash * 17)
}

/**
 * Shuffle array with seed for deterministic randomness
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  let random = seed
  
  // Simple seeded random number generator
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280
    return random / 233280
  }
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Personalize content list based on user profile
 * Returns sorted list with highest relevance first
 * Keeps _score and _isPersonalized flags for UI display
 * Adds diversity by using account-specific shuffling
 */
export function personalizeContent<T extends ContentItem>(
  contentList: T[],
  profile: UserProfile,
  refreshSeed?: number // Optional seed for refresh functionality
): Array<T & { _score: number; _isPersonalized: boolean; _personalizedRank?: number }> {
  // Check if user has provided any personalization data
  const hasPersonalizationData = !!(
    profile.industry ||
    (profile.hobbies && profile.hobbies.length > 0) ||
    profile.businessStage ||
    profile.experienceLevel ||
    (profile.goals && profile.goals.length > 0) ||
    profile.biggestGoal ||
    profile.challenges ||
    (profile.mindsetAnswers && Object.keys(profile.mindsetAnswers).length > 0)
  )

  // Add scores to content items
  const scoredContent = contentList.map(item => ({
    ...item,
    _score: calculateContentScore(item, profile),
    _isPersonalized: hasPersonalizationData && calculateContentScore(item, profile) > 0
  }))

  // Sort by score (descending), then by views/engagement if available
  const sorted = scoredContent.sort((a, b) => {
    if (b._score !== a._score) {
      return b._score - a._score
    }
    // Secondary sort by views if available
    const aViews = parseInt(a.views?.replace(/[^\d]/g, '') || '0')
    const bViews = parseInt(b.views?.replace(/[^\d]/g, '') || '0')
    return bViews - aViews
  })

  // Group content by score ranges to ensure diversity
  const highScore = sorted.filter(item => item._score >= 100)
  const mediumScore = sorted.filter(item => item._score >= 50 && item._score < 100)
  const lowScore = sorted.filter(item => item._score > 0 && item._score < 50)
  const noScore = sorted.filter(item => item._score === 0)

  // Generate seed for this user/account - now includes email for better differentiation
  const userSeed = refreshSeed !== undefined ? refreshSeed : generateUserSeed(profile, profile.email)
  
  // Shuffle within each score group to add diversity while maintaining relevance
  // Use different seed offsets for each group to ensure variation
  const shuffledHigh = seededShuffle(highScore, userSeed)
  const shuffledMedium = seededShuffle(mediumScore, userSeed + 1000)
  const shuffledLow = seededShuffle(lowScore, userSeed + 2000)
  const shuffledNoScore = seededShuffle(noScore, userSeed + 3000)

  // Interleave high and medium score items for better diversity
  const diversified: typeof sorted = []
  const maxLength = Math.max(shuffledHigh.length, shuffledMedium.length)
  
  for (let i = 0; i < maxLength; i++) {
    if (i < shuffledHigh.length) {
      diversified.push(shuffledHigh[i])
    }
    if (i < shuffledMedium.length && diversified.length < sorted.length) {
      diversified.push(shuffledMedium[i])
    }
  }
  
  // Add remaining items
  diversified.push(...shuffledLow, ...shuffledNoScore)

  // Add personalized rank
  return diversified.map((item, index) => ({
    ...item,
    _personalizedRank: index + 1
  }))
}

/**
 * Get personalized content tags based on user profile
 * Used for generating recommendations
 */
export function getPersonalizedTags(profile: UserProfile): string[] {
  const tags: string[] = []

  // Add industry tag
  if (profile.industry) {
    tags.push(profile.industry)
  }

  // Add hobby tags
  if (profile.hobbies) {
    profile.hobbies.forEach(hobby => {
      const hobbyTags = hobbyContentMap[hobby.toLowerCase()] || []
      tags.push(...hobbyTags)
    })
  }

  // Add business stage tags
  if (profile.businessStage) {
    const stageTags = businessStageContentMap[profile.businessStage] || []
    tags.push(...stageTags)
  }

  // Add experience level tags
  if (profile.experienceLevel) {
    const levelTags = experienceLevelContentMap[profile.experienceLevel] || []
    tags.push(...levelTags)
  }

  // Add goal tags
  if (profile.goals) {
    profile.goals.forEach(goal => {
      const goalTags = goalContentMap[goal] || []
      tags.push(...goalTags)
    })
  }

  // Add challenge tags
  if (profile.challenges) {
    const challenges = Array.isArray(profile.challenges) 
      ? profile.challenges 
      : [profile.challenges]
    challenges.forEach(challenge => {
      const challengeTags = challengeContentMap[challenge] || []
      tags.push(...challengeTags)
    })
  }

  // Remove duplicates and return
  return [...new Set(tags)]
}

