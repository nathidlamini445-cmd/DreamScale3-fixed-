import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { name, type, frequency, teamSize, teamStage, needs } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      }
    })

    const prompt = `You are TeamSync AI, an expert in team rituals, meeting structures, and organizational practices.

Generate a CUSTOM, COMPREHENSIVE team ritual with this information:
- Name: ${name}
- Type: ${type}
- Frequency: ${frequency}
- Team Size: ${teamSize || 'Not specified'}
- Team Stage: ${teamStage || 'Not specified'}
- Specific Needs: ${needs || 'Not specified'}

Create a VERY DETAILED ritual structure in JSON format:
{
  "duration": 30,
  "purpose": "Very detailed 2-3 paragraph purpose statement explaining why this ritual exists, what problems it solves, and what outcomes it drives",
  "participants": ["participant1", "participant2", "participant3"],
  "preparation": {
    "beforehand": ["prep item 1", "prep item 2", "prep item 3", "prep item 4"],
    "materials": ["material 1", "material 2", "material 3"],
    "setup": "Detailed setup instructions"
  },
  "structure": {
    "sections": [
      {
        "name": "Section name",
        "duration": 10,
        "description": "Very detailed description of what happens in this section",
        "activities": ["activity 1", "activity 2", "activity 3"],
        "facilitation": "How to facilitate this section",
        "outcomes": ["outcome 1", "outcome 2"],
        "tips": ["tip 1", "tip 2"]
      }
    ]
  },
  "aiSuggestions": {
    "whyNeeded": "Very detailed 2-3 paragraph explanation of why this ritual is important for the team, what problems it addresses, and what benefits it provides",
    "bestPractices": ["practice1", "practice2", "practice3", "practice4", "practice5", "practice6"],
    "commonMistakes": ["mistake1", "mistake2", "mistake3", "mistake4"],
    "adaptations": [
      {
        "scenario": "Scenario description",
        "modification": "How to adapt the ritual for this scenario"
      }
    ],
    "successFactors": ["factor 1", "factor 2", "factor 3", "factor 4"],
    "measuringSuccess": ["metric 1", "metric 2", "metric 3"]
  },
  "followUp": {
    "immediate": ["action 1", "action 2"],
    "afterRitual": ["action 1", "action 2", "action 3"],
    "longTerm": ["action 1", "action 2"]
  },
  "variations": [
    {
      "name": "Variation name",
      "description": "When to use this variation",
      "modifications": ["modification 1", "modification 2"]
    }
  ],
  "resources": ["resource 1", "resource 2", "resource 3", "resource 4"],
  "troubleshooting": [
    {
      "issue": "Common issue",
      "solution": "How to solve it",
      "prevention": "How to prevent it"
    }
  ]
}

Duration should be in minutes. Sections should add up to total duration.
Provide 4-6 detailed sections for the structure.
Include 5-7 best practices, 3-5 common mistakes, 2-3 adaptations, and comprehensive follow-up guidance.

Be VERY DETAILED and SPECIFIC. Make this ritual actionable and comprehensive.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let ritualData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      ritualData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      ritualData = {
        duration: 30,
        purpose: 'Regular team check-in and alignment',
        participants: ['All team members'],
        structure: {
          sections: [
            { name: 'Opening', duration: 5, description: 'Quick check-in and agenda review' },
            { name: 'Main Discussion', duration: 20, description: 'Core agenda items and discussion' },
            { name: 'Action Items', duration: 5, description: 'Review and assign action items' }
          ]
        },
        aiSuggestions: {
          whyNeeded: 'This ritual helps maintain team alignment and communication.',
          bestPractices: ['Start on time', 'Keep it focused', 'Document action items'],
          commonMistakes: ['Going over time', 'Lack of follow-up']
        }
      }
    }

    return NextResponse.json(ritualData)
  } catch (error) {
    console.error('Error generating ritual:', error)
    return NextResponse.json(
      { error: 'Failed to generate ritual' },
      { status: 500 }
    )
  }
}

