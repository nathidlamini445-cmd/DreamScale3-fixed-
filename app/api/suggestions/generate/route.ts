import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RECOMMENDATION_TEMPLATES, getNextStage, type RecommendationTemplate } from '@/lib/recommendation-templates'

const ROADMAP_RECOMMENDATION_COUNT = 5

// Increase timeout for this API route (Next.js 13+)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { onboardingData, requestDifferent } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '3000')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.8')

    // Extract onboarding data comprehensively
    const businessName = onboardingData?.businessName || 'their business'
    const industry = Array.isArray(onboardingData?.industry) 
      ? onboardingData.industry[0] 
      : onboardingData?.industry
    const businessStage = Array.isArray(onboardingData?.businessStage) 
      ? onboardingData.businessStage[0] 
      : onboardingData?.businessStage
    const challenges = Array.isArray(onboardingData?.challenges) 
      ? onboardingData.challenges 
      : (onboardingData?.challenges ? [onboardingData.challenges] : [])
    const targetMarket = Array.isArray(onboardingData?.targetMarket) 
      ? onboardingData.targetMarket[0] 
      : onboardingData?.targetMarket
    const revenueGoal = Array.isArray(onboardingData?.revenueGoal) 
      ? onboardingData.revenueGoal[0] 
      : onboardingData?.revenueGoal
    const teamSize = Array.isArray(onboardingData?.teamSize) 
      ? onboardingData.teamSize[0] 
      : onboardingData?.teamSize
    const monthlyRevenue = Array.isArray(onboardingData?.monthlyRevenue) 
      ? onboardingData.monthlyRevenue[0] 
      : onboardingData?.monthlyRevenue
    const biggestGoal = Array.isArray(onboardingData?.biggestGoal) 
      ? onboardingData.biggestGoal[0] 
      : onboardingData?.biggestGoal
    const primaryRevenue = Array.isArray(onboardingData?.primaryRevenue) 
      ? onboardingData.primaryRevenue[0] 
      : onboardingData?.primaryRevenue
    const customerAcquisition = Array.isArray(onboardingData?.customerAcquisition) 
      ? onboardingData.customerAcquisition[0] 
      : onboardingData?.customerAcquisition
    const growthStrategy = Array.isArray(onboardingData?.growthStrategy) 
      ? onboardingData.growthStrategy[0] 
      : onboardingData?.growthStrategy
    const keyMetrics = Array.isArray(onboardingData?.keyMetrics) 
      ? onboardingData.keyMetrics[0] 
      : onboardingData?.keyMetrics
    const name = onboardingData?.name || ''

    // STEP 1: Select roadmap templates (FAST — no AI)
    let selectedTemplates: RecommendationTemplate[]
    try {
      selectedTemplates = selectRelevantTemplates(onboardingData, requestDifferent)
      if (!selectedTemplates || selectedTemplates.length === 0) {
        selectedTemplates = RECOMMENDATION_TEMPLATES.slice(0, ROADMAP_RECOMMENDATION_COUNT)
      }
      if (selectedTemplates.length < ROADMAP_RECOMMENDATION_COUNT) {
        const remaining = RECOMMENDATION_TEMPLATES.filter(
          (t) => !selectedTemplates.some((st) => st.id === t.id)
        ).slice(0, ROADMAP_RECOMMENDATION_COUNT - selectedTemplates.length)
        selectedTemplates = [...selectedTemplates, ...remaining]
      }
      selectedTemplates = selectedTemplates.slice(0, ROADMAP_RECOMMENDATION_COUNT)
      console.log(
        `✅ Selected ${selectedTemplates.length} templates:`,
        selectedTemplates.map((t) => t.id)
      )
    } catch (error) {
      console.error('Error selecting templates:', error)
      selectedTemplates = RECOMMENDATION_TEMPLATES.slice(0, ROADMAP_RECOMMENDATION_COUNT)
    }

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    })

    // Helper function to create fallback recommendation
    const createFallbackRecommendation = (template: RecommendationTemplate, onboardingData: any) => {
      const challengesText = challenges.length > 0 ? challenges.join(', ') : 'their business challenges'
      
      return {
        id: template.id,
        title: template.baseTitle
          .replace(/\[Industry\]/g, industry || 'their industry')
          .replace(/\[Stage\]/g, businessStage || 'their stage')
          .replace(/\[Current Revenue\]/g, monthlyRevenue || 'their current revenue')
          .replace(/\[Goal Revenue\]/g, revenueGoal || 'their revenue goal')
          .replace(/\[Current MRR\]/g, monthlyRevenue || 'their current MRR')
          .replace(/\[Goal MRR\]/g, revenueGoal || 'their goal MRR')
          .replace(/\[Team Size\]/g, teamSize || 'their team size')
          .replace(/\[Target Market\]/g, targetMarket || 'their target market')
          .replace(/\[Acquisition Method\]/g, customerAcquisition || 'their acquisition method')
          .replace(/\[Revenue Model\]/g, primaryRevenue || 'their revenue model')
          .replace(/\[Key Metric\]/g, keyMetrics || 'their key metrics')
          .replace(/\[Growth Strategy\]/g, growthStrategy || 'their growth strategy')
          .replace(/\[Next Stage\]/g, getNextStage(businessStage || 'Early Stage')),
        description: `This recommendation helps ${businessName} address their challenges: ${challengesText}`,
        explanation: `For ${businessName}${industry ? ` in ${industry}` : ''}${businessStage ? ` at the ${businessStage} stage` : ''}, this recommendation addresses your challenges: ${challengesText}. This is a strategic approach to help you overcome these obstacles and move toward your goals.`,
        whyItMatters: `Addressing ${challengesText} is crucial for ${businessName}'s success. This recommendation provides a clear path forward to tackle these challenges systematically.`,
        howToStart: [
          `Step 1: Navigate to ${template.featureLink} to access the ${template.feature} feature`,
          `Step 2: Review your current situation related to: ${challengesText}`,
          `Step 3: Start implementing the first actionable step`,
          `Step 4: Track your progress and adjust as needed`
        ],
        feature: template.feature,
        featureLink: template.featureLink,
        icon: template.icon,
        priority: template.priority,
        category: template.category,
        estimatedTime: '30 minutes to 2 hours',
        impact: `Addresses ${challengesText} for ${businessName}`
      }
    }

    // STEP 2: Personalize templates in parallel (faster with gemini-2.5-flash)
    console.log(`🔄 Personalizing ${selectedTemplates.length} roadmap items in parallel...`)
    const startTime = Date.now()
    const challengesText =
      challenges.length > 0 ? challenges.join(', ') : 'their business challenges'

    const personalizeTemplate = async (template: RecommendationTemplate, index: number) => {
      try {
        const prompt = `You are a business advisor helping ${businessName}, an ${industry || 'early-stage'} business at the ${businessStage || 'early'} stage.

Their MAIN CHALLENGES: ${challengesText}
Their goal: ${revenueGoal || biggestGoal || 'growing their business'}
Team size: ${teamSize || 'unknown'}

Create roadmap milestone ${index + 1} of ${ROADMAP_RECOMMENDATION_COUNT} based on:
Title template: "${template.baseTitle}"
Category: ${template.category}
DreamScale feature: ${template.feature} (${template.featureLink})

Focus on solving: ${challengesText}. Steps must be specific, actionable, and mention ${template.feature} where relevant.

Return ONLY valid JSON:
{
  "title": "Personalized title for ${businessName}",
  "description": "1-2 sentences",
  "explanation": "3-5 sentences tailored to ${industry || 'their industry'}",
  "whyItMatters": "2-3 sentences",
  "howToStart": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."]
}`

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Template timeout')), 25000)
          ),
        ])

        let cleanedText = result.response.text().trim()
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        }
        const personalized = JSON.parse(cleanedText)

        return {
          id: template.id,
          title: personalized.title || template.baseTitle,
          description:
            personalized.description ||
            `This recommendation helps ${businessName} address their challenges.`,
          explanation:
            personalized.explanation ||
            `Strategic recommendation for ${businessName} in ${industry || 'their industry'}.`,
          whyItMatters:
            personalized.whyItMatters ||
            `This matters for ${businessName} because it addresses ${challengesText}.`,
          howToStart:
            Array.isArray(personalized.howToStart) && personalized.howToStart.length > 0
              ? personalized.howToStart
              : createFallbackRecommendation(template, onboardingData).howToStart,
          feature: template.feature,
          featureLink: template.featureLink,
          icon: template.icon,
          priority: template.priority,
          category: template.category,
          estimatedTime: '30 minutes to 2 hours',
          impact: `Tailored for ${businessName}`,
        }
      } catch (error) {
        console.error(`❌ Error on template ${template.id}:`, error)
        return createFallbackRecommendation(template, onboardingData)
      }
    }

    const personalizedRecommendations = await Promise.all(
      selectedTemplates.map((template, i) => personalizeTemplate(template, i))
    )

    let finalRecommendations = personalizedRecommendations.slice(0, ROADMAP_RECOMMENDATION_COUNT)

    if (finalRecommendations.length < ROADMAP_RECOMMENDATION_COUNT) {
      const existingIds = finalRecommendations.map((r) => r.id)
      const additionalTemplates = RECOMMENDATION_TEMPLATES.filter(
        (t) => !existingIds.includes(t.id)
      ).slice(0, ROADMAP_RECOMMENDATION_COUNT - finalRecommendations.length)
      for (const template of additionalTemplates) {
        finalRecommendations.push(createFallbackRecommendation(template, onboardingData))
      }
    }

    finalRecommendations = finalRecommendations.slice(0, ROADMAP_RECOMMENDATION_COUNT)
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Generated exactly ${finalRecommendations.length} personalized recommendations in ${totalDuration}s`)

    return NextResponse.json({ recommendations: finalRecommendations })
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Select roadmap recommendation templates based on user's onboarding data
 */
function selectRelevantTemplates(onboardingData: any, requestDifferent: boolean): RecommendationTemplate[] {
  const count = ROADMAP_RECOMMENDATION_COUNT
  const challenges = Array.isArray(onboardingData?.challenges) 
    ? onboardingData.challenges 
    : (onboardingData?.challenges ? [onboardingData.challenges] : [])
  const businessStage = Array.isArray(onboardingData?.businessStage) 
    ? onboardingData.businessStage[0] 
    : onboardingData?.businessStage
  const industry = Array.isArray(onboardingData?.industry) 
    ? onboardingData.industry[0] 
    : onboardingData?.industry
  const targetMarket = Array.isArray(onboardingData?.targetMarket) 
    ? onboardingData.targetMarket[0] 
    : onboardingData?.targetMarket
  const teamSize = Array.isArray(onboardingData?.teamSize) 
    ? onboardingData.teamSize[0] 
    : onboardingData?.teamSize
  const revenueModel = Array.isArray(onboardingData?.primaryRevenue) 
    ? onboardingData.primaryRevenue[0] 
    : onboardingData?.primaryRevenue
  const acquisitionMethod = Array.isArray(onboardingData?.customerAcquisition) 
    ? onboardingData.customerAcquisition[0] 
    : onboardingData?.customerAcquisition
  const growthStrategy = Array.isArray(onboardingData?.growthStrategy) 
    ? onboardingData.growthStrategy[0] 
    : onboardingData?.growthStrategy
  const keyMetrics = Array.isArray(onboardingData?.keyMetrics) 
    ? onboardingData.keyMetrics[0] 
    : onboardingData?.keyMetrics
  const monthlyRevenue = Array.isArray(onboardingData?.monthlyRevenue) 
    ? onboardingData.monthlyRevenue[0] 
    : onboardingData?.monthlyRevenue
  const hasRevenue = monthlyRevenue && monthlyRevenue !== 'Under $1K' && monthlyRevenue !== 'Other'

  // Score each template based on how well it matches the user's profile
  const scoredTemplates = RECOMMENDATION_TEMPLATES.map(template => {
    let score = 0
    const criteria = template.selectionCriteria

    // Challenge matching (highest weight)
    if (criteria.challenges && challenges.length > 0) {
      const matchingChallenges = challenges.filter((c: string) => 
        criteria.challenges!.some((tc: string) => 
          c.toLowerCase().includes(tc.toLowerCase()) || tc.toLowerCase().includes(c.toLowerCase())
        )
      )
      score += matchingChallenges.length * 10
    }

    // Business stage matching
    if (criteria.businessStage && businessStage) {
      if (criteria.businessStage.includes(businessStage)) {
        score += 8
      }
    }

    // Has revenue requirement
    if (criteria.hasRevenue !== undefined) {
      if (criteria.hasRevenue === hasRevenue) {
        score += 5
      } else {
        score -= 10 // Penalize if requirement doesn't match
      }
    }

    // Team size matching
    if (criteria.teamSize && teamSize) {
      if (criteria.teamSize.includes(teamSize)) {
        score += 5
      }
    }

    // Priority boost
    if (template.priority === 'high') {
      score += 3
    }

    return { template, score }
  })

  // Sort by score (highest first)
  const sortedTemplates = scoredTemplates
    .filter(item => item.score >= 0) // Only include templates that match requirements
    .sort((a, b) => b.score - a.score)

  let selected: RecommendationTemplate[] = []

  if (requestDifferent) {
    const skipCount = count
    const topIds = sortedTemplates.slice(0, skipCount).map((item) => item.template.id)
    const differentCandidates = sortedTemplates
      .filter((item) => !topIds.includes(item.template.id))
      .sort((a, b) => {
        const scoreDiff = b.score - a.score
        if (Math.abs(scoreDiff) <= 5) return Math.random() - 0.5
        return scoreDiff
      })

    if (differentCandidates.length >= count) {
      selected = differentCandidates.slice(0, count).map((item) => item.template)
    } else {
      selected = differentCandidates.map((item) => item.template)
      const remaining = scoredTemplates
        .filter((item) => !selected.some((st) => st.id === item.template.id))
        .sort((a, b) => b.score - a.score)
        .slice(0, count - selected.length)
        .map((item) => item.template)
      selected.push(...remaining)
    }
  } else {
    selected = sortedTemplates.slice(0, count).map((item) => item.template)
  }

  if (selected.length < count) {
    const remaining = scoredTemplates
      .filter((item) => !selected.some((st) => st.id === item.template.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, count - selected.length)
      .map((item) => item.template)
    selected.push(...remaining)
  }

  const final = selected.slice(0, count)
  if (final.length < count) {
    const remaining = scoredTemplates
      .filter((item) => !final.some((st) => st.id === item.template.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, count - final.length)
      .map((item) => item.template)
    final.push(...remaining)
  }

  return final.slice(0, count)
}

