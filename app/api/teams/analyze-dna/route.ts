import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { teamName, members } = await request.json()

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

    const prompt = `You are TeamSync AI, an expert in team composition and organizational psychology.

Analyze the following team and provide a comprehensive DNA analysis:

Team Name: ${teamName}
Team Members:
${members.map((m: any) => `
- ${m.name} (${m.role})
  Skills: ${m.skills.join(', ') || 'Not specified'}
  Work Style: ${m.workStyle || 'Not specified'}
  Communication: ${m.communicationPreference || 'Not specified'}
`).join('\n')}

Provide a detailed analysis in JSON format with this exact structure:
{
  "analysis": {
    "teamComposition": {
      "strengths": ["strength1", "strength2", "strength3"],
      "gaps": ["gap1", "gap2"],
      "recommendations": ["rec1", "rec2", "rec3"]
    },
    "optimalCompositions": [
      {
        "projectType": "Project type name",
        "recommendedMembers": ["Member1", "Member2"],
        "reasoning": "Why this composition works well"
      }
    ],
    "skillGaps": [
      {
        "gap": "Missing skill area",
        "impact": "How this gap affects the team",
        "suggestedHiringProfile": {
          "role": "Role title",
          "skills": ["skill1", "skill2"],
          "traits": ["trait1", "trait2"]
        }
      }
    ]
  }
}

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to extract JSON from the response
    let analysisData
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysisData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Return fallback structure
      analysisData = {
        analysis: {
          teamComposition: {
            strengths: ['Strong collaboration', 'Diverse skill sets'],
            gaps: ['May need more specialized expertise'],
            recommendations: ['Consider cross-training', 'Hire for identified gaps']
          },
          optimalCompositions: [],
          skillGaps: []
        }
      }
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('Error analyzing team DNA:', error)
    return NextResponse.json(
      { error: 'Failed to analyze team DNA' },
      { status: 500 }
    )
  }
}

