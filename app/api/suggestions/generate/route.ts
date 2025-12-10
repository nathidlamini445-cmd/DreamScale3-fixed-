import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { onboardingData } = await request.json()

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
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
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

    // Build context for AI
    let contextPrompt = `You are Bizora AI, an expert business consultant. Generate 5 highly personalized, actionable recommendations for an entrepreneur based on their onboarding data.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Entrepreneur Name: ${name || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Business Stage: ${businessStage || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}
- Current Monthly Revenue: ${monthlyRevenue || 'Not specified'}
- Revenue Goal: ${revenueGoal || 'Not specified'}
- Team Size: ${teamSize || 'Not specified'}
- Primary Revenue Model: ${primaryRevenue || 'Not specified'}
- Customer Acquisition Method: ${customerAcquisition || 'Not specified'}
- Growth Strategy: ${growthStrategy || 'Not specified'}
- Key Metrics: ${keyMetrics || 'Not specified'}
- Biggest Goal (6 months): ${biggestGoal || 'Not specified'}
- Main Challenges: ${challenges.length > 0 ? challenges.join(', ') : 'Not specified'}

AVAILABLE FEATURES IN THE APP:
1. Revenue Intelligence (/revenue-intelligence) - Revenue analysis, tracking, optimization
2. Systems (/revenue?tab=systems) - Process documentation, system building, templates
3. Teams (/teams) - Team management, role documentation, team optimization
4. Leadership (/marketplace) - Leadership coaching, decision-making frameworks
5. Bizora AI (/bizora) - AI-powered business insights and research
6. Discover (/discover) - Market research, competitor intelligence
7. Revenue (/revenue) - Revenue tracking and analysis

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5 recommendations - NO MORE, NO LESS
2. Each recommendation MUST be HIGHLY PERSONALIZED - use their business name, industry, challenges, and specific data throughout
3. Make recommendations COMPLETELY DIFFERENT for each user - if two users have different challenges, industries, or stages, they should get DIFFERENT recommendations
4. Each recommendation MUST reference a specific feature in the app (use the feature names and links above)
5. PRIORITIZE their MAIN CHALLENGES - if they mentioned "finding customers", make that the #1 priority recommendation
6. Use their SPECIFIC DATA - reference their revenue goal, team size, industry, target market, etc. in the recommendations
7. Make explanations detailed and easy to understand (3-4 sentences) - some users are older and need clear guidance
8. Make "howToStart" steps VERY SPECIFIC - include exact feature names, what to click, where to go
9. Vary the categories and features - don't give 5 recommendations all about the same thing
10. Consider their business stage - if they're in "Idea/Planning", focus on validation. If "Scaling", focus on systems.

OUTPUT FORMAT (JSON array):
[
  {
    "id": "unique-id-1",
    "title": "Specific, personalized title for ${businessName}",
    "description": "Brief description of what they should do",
    "explanation": "Detailed explanation (3-4 sentences) explaining why this matters for their specific situation, referencing their industry, challenges, and business stage",
    "whyItMatters": "Why this specific recommendation matters for ${businessName} given their context (2-3 sentences)",
    "howToStart": [
      "Step 1: Specific instruction referencing the feature",
      "Step 2: Next specific step",
      "Step 3: Continue with detailed steps",
      "Include 6-8 detailed steps total"
    ],
    "feature": "Feature name (e.g., Revenue Intelligence, Systems, Teams, Leadership, Bizora AI, Discover, Revenue)",
    "featureLink": "/feature-path (e.g., /revenue-intelligence, /revenue?tab=systems, /teams, /marketplace, /bizora, /discover, /revenue)",
    "icon": "icon-name (e.g., dollar, settings, users, crown, compass, target, trending)",
    "priority": "high" or "medium" or "low",
    "category": "Category name (e.g., Revenue, Operations, Team, Leadership, Customer Growth, Strategy)",
    "estimatedTime": "Time estimate (e.g., 30 minutes, 1-2 hours, Ongoing)",
    "impact": "Expected impact description"
  },
  ... (4 more recommendations)
]

IMPORTANT:
- Make each recommendation UNIQUE and SPECIFIC to their situation
- Use their business name, industry, and challenges throughout
- Reference their specific data (revenue goals, team size, etc.)
- Make recommendations actionable with clear steps
- Ensure recommendations are DIFFERENT from generic advice - personalize heavily
- Focus on their MAIN CHALLENGES first
- Only return valid JSON, no additional text`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    })

    const result = await model.generateContent(contextPrompt)
    const response = await result.response
    const text = response.text()

    // Try to extract JSON from the response
    let recommendations
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recommendations = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw response:', text)
      // Fallback: return empty array or try to extract JSON manually
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: text },
        { status: 500 }
      )
    }

    // Validate we have 5 recommendations
    if (!Array.isArray(recommendations) || recommendations.length !== 5) {
      console.error('Invalid recommendations format or count:', recommendations)
      return NextResponse.json(
        { error: 'Invalid recommendations format', recommendations },
        { status: 500 }
      )
    }

    // Ensure all required fields are present
    const validatedRecommendations = recommendations.map((rec: any, index: number) => ({
      id: rec.id || `ai-rec-${index + 1}`,
      title: rec.title || 'Recommendation',
      description: rec.description || '',
      explanation: rec.explanation || '',
      whyItMatters: rec.whyItMatters || '',
      howToStart: Array.isArray(rec.howToStart) ? rec.howToStart : [],
      feature: rec.feature || 'General',
      featureLink: rec.featureLink || '/',
      icon: rec.icon || 'lightbulb',
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
      category: rec.category || 'General',
      estimatedTime: rec.estimatedTime || 'Varies',
      impact: rec.impact || 'Positive impact'
    }))

    return NextResponse.json({ recommendations: validatedRecommendations })
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

