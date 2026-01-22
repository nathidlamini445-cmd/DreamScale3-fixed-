import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RECOMMENDATION_TEMPLATES, getNextStage, type RecommendationTemplate } from '@/lib/recommendation-templates'

// Increase timeout for this API route (Next.js 13+)
// Note: For Vercel deployments, Pro plan allows up to 300 seconds, Hobby plan is limited to 60 seconds
export const maxDuration = 60 // 60 seconds - optimized for faster generation

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
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    // Reduced max tokens - shorter output needed
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '2000')
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

    // STEP 1: Select exactly 3 relevant templates (FAST - no AI needed)
    let selectedTemplates: RecommendationTemplate[]
    try {
      selectedTemplates = selectRelevantTemplates(onboardingData, requestDifferent)
      if (!selectedTemplates || selectedTemplates.length === 0) {
        console.error('No templates selected - using fallback')
        selectedTemplates = RECOMMENDATION_TEMPLATES.slice(0, 3)
      }
      // Ensure we have exactly 3 templates
      if (selectedTemplates.length < 3) {
        const remaining = RECOMMENDATION_TEMPLATES
          .filter(t => !selectedTemplates.some(st => st.id === t.id))
          .slice(0, 3 - selectedTemplates.length)
        selectedTemplates = [...selectedTemplates, ...remaining]
      }
      selectedTemplates = selectedTemplates.slice(0, 3) // Ensure max 3
      console.log(`✅ Selected exactly ${selectedTemplates.length} templates:`, selectedTemplates.map(t => t.id))
    } catch (error) {
      console.error('Error selecting templates:', error)
      selectedTemplates = RECOMMENDATION_TEMPLATES.slice(0, 3)
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

    // STEP 2: Personalize each template SEQUENTIALLY with shorter prompts
    console.log('🔄 Starting sequential AI personalization for exactly 3 recommendations...')
    const startTime = Date.now()
    const personalizedRecommendations = []

    for (let i = 0; i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i]
      try {
        console.log(`🔄 Personalizing template ${i + 1}/3: ${template.id}`)
        const templateStartTime = Date.now()
        
        // Focused prompt that emphasizes user's challenges
        const challengesText = challenges.length > 0 
          ? challenges.join(', ') 
          : 'their business challenges'
        
        const prompt = `You are a business advisor helping ${businessName}, an ${industry || 'early-stage'} business at the ${businessStage || 'early'} stage.

Their MAIN CHALLENGES are: ${challengesText}
Their goal: ${revenueGoal || 'growing their business'}

Create a personalized recommendation based on this template:
Title: "${template.baseTitle}"
Category: ${template.category}

IMPORTANT: Focus on solving their specific challenges: ${challengesText}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Personalized title that mentions ${businessName} and addresses: ${challengesText}",
  "description": "1-2 sentences explaining why this recommendation directly addresses their challenges: ${challengesText}",
  "explanation": "3-4 sentences explaining how this helps ${businessName} solve: ${challengesText}. Be specific about their ${industry || 'industry'} and ${businessStage || 'stage'}.",
  "whyItMatters": "2-3 sentences on why solving ${challengesText} matters for ${businessName}'s success",
  "howToStart": ["Step 1: Specific action for ${businessName}", "Step 2: Next action", "Step 3: Final action", "Step 4: Additional step"]
}

Return ONLY the JSON object, nothing else.`

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Template timeout')), 20000) // 20 seconds per template
          )
        ])

        const text = result.response.text()
        // Clean up JSON - remove markdown code blocks if present
        let cleanedText = text.trim()
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        }
        // Remove any leading/trailing whitespace or newlines
        cleanedText = cleanedText.replace(/^[\s\n]*/, '').replace(/[\s\n]*$/, '')
        
        const personalized = JSON.parse(cleanedText)
        
        personalizedRecommendations.push({
          id: template.id,
          title: personalized.title || template.baseTitle,
          description: personalized.description || `This recommendation helps ${businessName} address their challenges.`,
          explanation: personalized.explanation || `This is a strategic recommendation for ${businessName} in ${industry || 'their industry'}.`,
          whyItMatters: personalized.whyItMatters || `This matters for ${businessName} because it addresses their specific challenges.`,
          howToStart: Array.isArray(personalized.howToStart) && personalized.howToStart.length > 0 
            ? personalized.howToStart 
            : ['Step 1: Get started', 'Step 2: Implement', 'Step 3: Review'],
          feature: template.feature,
          featureLink: template.featureLink,
          icon: template.icon,
          priority: template.priority,
          category: template.category,
          estimatedTime: '30 minutes to 2 hours',
          impact: `Tailored for ${businessName}`
        })
        
        const templateDuration = ((Date.now() - templateStartTime) / 1000).toFixed(1)
        console.log(`✅ Template ${i + 1}/3 done in ${templateDuration}s`)
        
      } catch (error) {
        console.error(`❌ Error on template ${template.id}:`, error)
        // Use fallback - ensure we still get 3 recommendations
        const fallback = createFallbackRecommendation(template, onboardingData)
        personalizedRecommendations.push(fallback)
        console.log(`⚠️ Using fallback for template ${template.id}`)
      }
    }

    // Ensure we have exactly 3 recommendations
    if (personalizedRecommendations.length < 3) {
      console.warn(`⚠️ Only got ${personalizedRecommendations.length} recommendations, filling to 3...`)
      const existingIds = personalizedRecommendations.map(r => r.id)
      const additionalTemplates = RECOMMENDATION_TEMPLATES
        .filter(t => !existingIds.includes(t.id))
        .slice(0, 3 - personalizedRecommendations.length)
      
      for (const template of additionalTemplates) {
        personalizedRecommendations.push(createFallbackRecommendation(template, onboardingData))
      }
    }

    // Ensure exactly 3 (no more, no less)
    const finalRecommendations = personalizedRecommendations.slice(0, 3)
    
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
 * Select 3 relevant recommendation templates based on user's onboarding data
 */
function selectRelevantTemplates(onboardingData: any, requestDifferent: boolean): RecommendationTemplate[] {
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
    // When requesting different recommendations, use a rotation strategy
    // Skip the top 3 templates and select from the next best matches
    const skipCount = 3
    const topThreeIds = sortedTemplates.slice(0, skipCount).map(item => item.template.id)
    
    // Get candidates that are NOT in the top 3
    const differentCandidates = sortedTemplates
      .filter(item => !topThreeIds.includes(item.template.id))
      .sort((a, b) => {
        // Still prioritize by score, but add some randomness for variety
        const scoreDiff = b.score - a.score
        // If scores are close (within 5 points), randomize
        if (Math.abs(scoreDiff) <= 5) {
          return Math.random() - 0.5
        }
        return scoreDiff
      })
    
    // Take the best 3 from the different candidates
    if (differentCandidates.length >= 3) {
      selected = differentCandidates.slice(0, 3).map(item => item.template)
    } else {
      // If we don't have enough different candidates, take what we have and fill from all
      selected = differentCandidates.map(item => item.template)
      // Fill remaining from all templates (excluding already selected)
      const remaining = scoredTemplates
        .filter(item => !selected.some(st => st.id === item.template.id))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3 - selected.length)
        .map(item => item.template)
      selected.push(...remaining)
    }
    
    console.log(`🔄 Generating DIFFERENT recommendations (skipped top 3, selected: ${selected.map(t => t.id).join(', ')})`)
  } else {
    // Normal selection: take top 3
    selected = sortedTemplates
      .slice(0, 3)
      .map(item => item.template)
    console.log(`✅ Generating initial recommendations (selected: ${selected.map(t => t.id).join(', ')})`)
  }

  // If we don't have 3, fill with highest scoring templates regardless of requirements
  if (selected.length < 3) {
    const remaining = scoredTemplates
      .filter(item => !selected.some(st => st.id === item.template.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3 - selected.length)
      .map(item => item.template)
    selected.push(...remaining)
  }

  // Ensure we have exactly 3 templates
  const final = selected.slice(0, 3)
  
  // If we still don't have 3, fill with highest scoring templates
  if (final.length < 3) {
    const remaining = scoredTemplates
      .filter(item => !final.some(st => st.id === item.template.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3 - final.length)
      .map(item => item.template)
    final.push(...remaining)
  }
  
  return final.slice(0, 3) // Ensure exactly 3
}

