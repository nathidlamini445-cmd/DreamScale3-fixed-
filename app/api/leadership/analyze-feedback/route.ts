import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { feedback, source, relationship } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are an expert leadership development coach analyzing 360° feedback.
Provide EXTENSIVE, COMPREHENSIVE analysis with detailed insights and actionable development plans.
Return ONLY valid JSON in this exact format:
{
  "categories": ["category 1", "category 2", "category 3", "category 4"],
  "patterns": ["pattern 1", "pattern 2", "pattern 3", "pattern 4", "pattern 5", "pattern 6"],
  "growthAreas": [
    {
      "area": "Growth area name",
      "description": "Detailed description of why this is a growth area",
      "impact": "Impact on leadership effectiveness",
      "priority": "High/Medium/Low",
      "specificActions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
      "resources": ["resource 1", "resource 2", "resource 3"],
      "timeline": "Timeline (e.g., 30 days, 3 months)",
      "successMetrics": ["metric 1", "metric 2"]
    }
  ],
  "strengths": [
    {
      "strength": "Strength name",
      "description": "Detailed description",
      "howToLeverage": "How to leverage this strength",
      "examples": ["example 1", "example 2"]
    }
  ],
  "themes": ["theme 1", "theme 2", "theme 3", "theme 4"],
  "sentimentAnalysis": {
    "overall": "Positive/Neutral/Negative",
    "breakdown": {
      "positive": ["positive aspect 1", "positive aspect 2"],
      "constructive": ["constructive feedback 1", "constructive feedback 2"],
      "concerns": ["concern 1", "concern 2"]
    }
  },
  "developmentPlan": [
    {
      "area": "Development area name",
      "description": "Why this area needs development",
      "actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
      "resources": ["resource 1", "resource 2"],
      "timeline": "Timeline (e.g., 30 days, 3 months)",
      "successMetrics": ["metric 1", "metric 2", "metric 3"],
      "checkIns": ["check-in 1", "check-in 2"]
    }
  ],
  "quickWins": ["quick win 1", "quick win 2", "quick win 3"],
  "longTermGoals": ["goal 1", "goal 2", "goal 3"],
  "recommendations": "Comprehensive 3-4 paragraph recommendation with overall assessment and next steps"
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Analyze this 360° feedback and provide EXTENSIVE, COMPREHENSIVE insights:

Feedback: ${feedback}
Source: ${source}
Relationship: ${relationship}

Provide DETAILED analysis including:
1. Categories this feedback falls into (e.g., Communication, Decision-making, Team Management, Vision, Execution, etc.) - 3-5 categories
2. Patterns identified in the feedback (5-7 patterns) - look for recurring themes
3. Growth areas that need attention (4-6 areas) - each with detailed description, impact, priority, specific actions (5+), resources, timeline, and success metrics
4. Strengths mentioned (3-5 strengths) - each with description, how to leverage, and examples
5. Overall themes across the feedback (3-5 themes)
6. Sentiment analysis (overall sentiment and breakdown of positive, constructive, and concerns)
7. A comprehensive development plan with 3-5 focus areas, each with:
   - Detailed description
   - 5+ specific actionable steps
   - Resources needed
   - Timeline
   - Success metrics
   - Check-in points
8. Quick wins (2-4 immediate actions that can show progress)
9. Long-term goals (2-4 goals for sustained improvement)
10. Comprehensive recommendation (3-4 paragraphs) with overall assessment and strategic next steps

Be VERY SPECIFIC, ACTIONABLE, and CONSTRUCTIVE. Focus on leadership effectiveness, growth, and measurable outcomes.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let analysis
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse feedback analysis:', parseError)
      analysis = {
        categories: ['Leadership', 'Communication'],
        patterns: ['Pattern identified in feedback'],
        growthAreas: ['Area for improvement'],
        strengths: ['Strength mentioned'],
        developmentPlan: [
          {
            area: 'Leadership Development',
            actions: ['Action 1', 'Action 2'],
            timeline: '3 months'
          }
        ]
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Feedback analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze feedback' },
      { status: 500 }
    )
  }
}

