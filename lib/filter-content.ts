import { DISCOVER_CONTENT, type DiscoverContent } from './discover-content'

export interface UserOnboardingData {
  industry?: string | string[] | null
  businessStage?: string | string[] | null
  challenges?: string | string[]
  goals?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | null
  hobbies?: string[]
  biggestGoal?: string | string[]
}

export interface ScoredContent extends DiscoverContent {
  score: number
  matchReasons?: string[]
}

/**
 * Get personalized content based on user onboarding data
 * Returns content sorted by relevance score (highest first)
 */
export function getPersonalizedContent(
  userData: UserOnboardingData
): ScoredContent[] {
  if (!userData || Object.keys(userData).length === 0) {
    // Return all content if no user data
    return DISCOVER_CONTENT.map(content => ({
      ...content,
      score: 0,
      matchReasons: []
    }))
  }

  const scoredContent = DISCOVER_CONTENT.map(content => {
    const { score, reasons } = calculateScore(content, userData)
    return {
      ...content,
      score,
      matchReasons: reasons
    }
  })

  // Filter out content with score 0 and sort by score (descending)
  return scoredContent
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
}

/**
 * Calculate relevance score for content based on user data
 * Higher score = more relevant
 */
function calculateScore(
  content: DiscoverContent,
  userData: UserOnboardingData
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Industry match (high weight - 50 points)
  if (userData.industry) {
    const industries = Array.isArray(userData.industry)
      ? userData.industry
      : [userData.industry]
    
    const industryMatches = industries.filter(industry =>
      content.tags.industries.some(tag =>
        tag.toLowerCase().includes(industry.toLowerCase()) ||
        industry.toLowerCase().includes(tag.toLowerCase()) ||
        tag === 'All Industries'
      )
    )

    if (industryMatches.length > 0) {
      score += 50
      reasons.push(`Industry match: ${industryMatches.join(', ')}`)
    }
  }

  // Business stage match (medium-high weight - 30 points)
  if (userData.businessStage) {
    const stages = Array.isArray(userData.businessStage)
      ? userData.businessStage
      : [userData.businessStage]

    const stageMatches = stages.filter(stage => {
      const stageLower = stage.toLowerCase()
      return content.tags.businessStages.some(tag => {
        const tagLower = tag.toLowerCase()
        return (
          tagLower.includes(stageLower) ||
          stageLower.includes(tagLower) ||
          tag === 'All Stages'
        )
      })
    })

    if (stageMatches.length > 0) {
      score += 30
      reasons.push(`Business stage match: ${stageMatches.join(', ')}`)
    }
  }

  // Challenges match (high weight - 10 points per match)
  if (userData.challenges) {
    const challenges = Array.isArray(userData.challenges)
      ? userData.challenges
      : [userData.challenges]

    const challengeMatches = challenges.filter(challenge =>
      content.tags.challenges.some(tag =>
        tag.toLowerCase().includes(challenge.toLowerCase()) ||
        challenge.toLowerCase().includes(tag.toLowerCase()) ||
        tag === 'All Challenges'
      )
    )

    if (challengeMatches.length > 0) {
      score += challengeMatches.length * 10
      reasons.push(`Challenge match: ${challengeMatches.join(', ')}`)
    }
  }

  // Goals match (medium weight - 15 points per match)
  if (userData.goals && content.tags.goals) {
    const goalMatches = userData.goals.filter(goal =>
      content.tags.goals!.some(tag =>
        tag.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(tag.toLowerCase())
      )
    )

    if (goalMatches.length > 0) {
      score += goalMatches.length * 15
      reasons.push(`Goal match: ${goalMatches.join(', ')}`)
    }
  }

  // Biggest goal match (very high weight - 25 points)
  if (userData.biggestGoal && content.tags.goals) {
    const biggestGoal = Array.isArray(userData.biggestGoal)
      ? userData.biggestGoal[0]
      : userData.biggestGoal

    const biggestGoalMatch = content.tags.goals.some(tag =>
      tag.toLowerCase().includes(biggestGoal.toLowerCase()) ||
      biggestGoal.toLowerCase().includes(tag.toLowerCase())
    )

    if (biggestGoalMatch) {
      score += 25
      reasons.push(`Biggest goal match: ${biggestGoal}`)
    }
  }

  // Experience level match (medium weight - 20 points)
  if (userData.experienceLevel && content.tags.experienceLevels) {
    const levelMatch = content.tags.experienceLevels.includes(
      userData.experienceLevel
    )

    if (levelMatch) {
      score += 20
      reasons.push(`Experience level match: ${userData.experienceLevel}`)
    }
  }

  // Hobbies match (low-medium weight - 5 points per match)
  if (userData.hobbies && content.tags.hobbies) {
    const hobbyMatches = userData.hobbies.filter(hobby =>
      content.tags.hobbies!.some(tag =>
        tag.toLowerCase().includes(hobby.toLowerCase()) ||
        hobby.toLowerCase().includes(tag.toLowerCase())
      )
    )

    if (hobbyMatches.length > 0) {
      score += hobbyMatches.length * 5
      reasons.push(`Hobby match: ${hobbyMatches.join(', ')}`)
    }
  }

  return { score, reasons }
}

/**
 * Get content by ID
 */
export function getContentById(id: string): DiscoverContent | undefined {
  return DISCOVER_CONTENT.find(content => content.id === id)
}

/**
 * Get all content (for fallback or admin use)
 */
export function getAllContent(): DiscoverContent[] {
  return DISCOVER_CONTENT
}
