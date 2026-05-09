import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are an expert leadership coach and organizational psychologist. 
Analyze leadership assessment answers to provide COMPREHENSIVE, DETAILED leadership analysis.
Return ONLY valid JSON in this exact format:
{
  "style": "Leadership style name (e.g., Transformational, Transactional, Servant, Democratic, Autocratic, Laissez-faire)",
  "styleDescription": "Detailed 2-3 paragraph description of this leadership style, what it means, and how it manifests",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5", "strength 6"],
  "blindSpots": ["blind spot 1", "blind spot 2", "blind spot 3", "blind spot 4", "blind spot 5"],
  "adaptations": [
    {
      "situation": "Situation description",
      "recommendedApproach": "Detailed explanation of how to adapt leadership style for this situation",
      "keyActions": ["action 1", "action 2", "action 3"]
    }
  ],
  "communicationStyle": "Detailed description of communication preferences and patterns",
  "decisionMakingApproach": "Detailed description of how decisions are typically made",
  "teamManagementStyle": "Detailed description of how teams are managed and motivated",
  "conflictResolutionStyle": "Detailed description of approach to handling conflicts",
  "developmentAreas": [
    {
      "area": "Development area name",
      "description": "Why this area needs development",
      "specificActions": ["action 1", "action 2", "action 3", "action 4"],
      "resources": ["resource 1", "resource 2"],
      "timeline": "Suggested timeline for improvement"
    }
  ],
  "famousLeaders": ["Leader 1", "Leader 2", "Leader 3"],
  "bestUseCases": ["Use case 1", "Use case 2", "Use case 3", "Use case 4"],
  "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
  "score": 75,
  "scoreBreakdown": {
    "vision": 75,
    "communication": 75,
    "decisionMaking": 75,
    "teamBuilding": 75,
    "adaptability": 75
  }
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const answersText = answers.map((a: any, i: number) => `Q${i + 1}: ${a.answer}`).join('\n')

    const prompt = `Analyze these leadership assessment answers and provide EXTENSIVE, COMPREHENSIVE leadership style analysis:

${answersText}

Provide DETAILED analysis including:
1. The primary leadership style (be specific and accurate) with a comprehensive description
2. 5-7 key strengths based on the answers (be specific and detailed)
3. 4-6 blind spots or areas for improvement (be specific)
4. 5-7 situational adaptations showing how to adjust style for different scenarios (crisis, team building, innovation, conflict, growth, etc.) - include key actions for each
5. Detailed communication style analysis
6. Detailed decision-making approach analysis
7. Detailed team management style analysis
8. Detailed conflict resolution style analysis
9. 4-6 development areas with specific actions, resources, and timelines
10. 3-4 famous leaders who exemplify this style
11. 4-5 best use cases/scenarios for this leadership style
12. 3-4 potential challenges with this style
13. A score from 0-100 representing overall leadership effectiveness
14. Score breakdown across 5 dimensions: vision, communication, decision-making, team building, adaptability

Be VERY DETAILED and SPECIFIC. Provide actionable insights and comprehensive information.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let analysis
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback analysis
      analysis = {
        style: 'Adaptive Leadership',
        strengths: ['Strong decision-making', 'Team collaboration', 'Strategic thinking'],
        blindSpots: ['May need more delegation', 'Could improve conflict resolution', 'Time management'],
        adaptations: [
          {
            situation: 'Crisis situations',
            recommendedApproach: 'Take decisive action while keeping team informed'
          },
          {
            situation: 'Team building',
            recommendedApproach: 'Focus on collaboration and consensus-building'
          }
        ],
        score: 75
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Leadership style assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to assess leadership style' },
      { status: 500 }
    )
  }
}

