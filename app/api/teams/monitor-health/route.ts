import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { teamName } = await request.json()

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

    const prompt = `You are TeamSync AI, an expert in team health monitoring and organizational wellness.

Analyze the health of this team: ${teamName}

Provide a comprehensive health analysis in JSON format with this exact structure:
{
  "overallHealth": 75,
  "metrics": {
    "morale": {
      "value": 75,
      "trend": "stable"
    },
    "productivity": {
      "value": 80,
      "trend": "improving"
    },
    "collaboration": {
      "value": 70,
      "trend": "stable"
    },
    "communication": {
      "value": 75,
      "trend": "declining"
    }
  },
  "warnings": [
    {
      "type": "burnout",
      "severity": "medium",
      "description": "Warning description",
      "suggestedInterventions": ["intervention1", "intervention2"]
    }
  ],
  "suggestions": [
    {
      "type": "team-building",
      "activity": "Activity name",
      "description": "Activity description",
      "priority": "high"
    }
  ]
}

Trend values: "improving", "stable", or "declining"
Warning types: "burnout", "conflict", "low-productivity", "communication-breakdown"
Severity: "low", "medium", "high"
Suggestion types: "team-building", "process-improvement", "communication", "wellness"
Priority: "low", "medium", "high"

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let healthData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      healthData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      healthData = {
        overallHealth: 75,
        metrics: {
          morale: { value: 75, trend: 'stable' },
          productivity: { value: 75, trend: 'stable' },
          collaboration: { value: 75, trend: 'stable' },
          communication: { value: 75, trend: 'stable' }
        },
        warnings: [],
        suggestions: []
      }
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Error monitoring team health:', error)
    return NextResponse.json(
      { error: 'Failed to monitor team health' },
      { status: 500 }
    )
  }
}

