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

Generate a custom team ritual with this information:
- Name: ${name}
- Type: ${type}
- Frequency: ${frequency}
- Team Size: ${teamSize || 'Not specified'}
- Team Stage: ${teamStage || 'Not specified'}
- Specific Needs: ${needs || 'Not specified'}

Create a comprehensive ritual structure in JSON format:
{
  "duration": 30,
  "purpose": "Clear purpose statement for this ritual",
  "participants": ["participant1", "participant2"],
  "structure": {
    "sections": [
      {
        "name": "Section name",
        "duration": 10,
        "description": "What happens in this section"
      }
    ]
  },
  "aiSuggestions": {
    "whyNeeded": "Why this ritual is important for the team",
    "bestPractices": ["practice1", "practice2", "practice3"],
    "commonMistakes": ["mistake1", "mistake2"]
  }
}

Duration should be in minutes. Sections should add up to total duration.
Provide 3-5 sections for the structure.
Include 3-5 best practices and 2-3 common mistakes.

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

