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
Identify patterns, growth areas, strengths, and create actionable development plans.
Return ONLY valid JSON in this exact format:
{
  "categories": ["category 1", "category 2"],
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "growthAreas": ["area 1", "area 2", "area 3"],
  "strengths": ["strength 1", "strength 2"],
  "developmentPlan": [
    {
      "area": "Development area name",
      "actions": ["action 1", "action 2", "action 3"],
      "timeline": "Timeline (e.g., 30 days, 3 months)"
    }
  ]
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Analyze this 360° feedback and provide comprehensive insights:

Feedback: ${feedback}
Source: ${source}
Relationship: ${relationship}

Provide:
1. Categories this feedback falls into (e.g., Communication, Decision-making, Team Management, etc.) - 2-4 categories
2. Patterns identified in the feedback (3-5 patterns)
3. Growth areas that need attention (3-5 areas)
4. Strengths mentioned (2-4 strengths)
5. A detailed development plan with 2-4 focus areas, each with 3-5 specific actionable steps and timelines

Be specific, actionable, and constructive. Focus on leadership effectiveness and growth.

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

