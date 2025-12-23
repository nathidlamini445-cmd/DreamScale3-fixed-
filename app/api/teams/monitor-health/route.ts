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

Provide EXTENSIVE, COMPREHENSIVE health analysis in JSON format with this exact structure:
{
  "overallHealth": 75,
  "healthBreakdown": {
    "emotional": 75,
    "physical": 75,
    "mental": 75,
    "social": 75,
    "professional": 75
  },
  "metrics": {
    "morale": {
      "value": 75,
      "trend": "stable",
      "details": "Very detailed analysis of team morale, what's contributing to it, and what affects it",
      "indicators": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
      "drivers": ["driver 1", "driver 2", "driver 3"]
    },
    "productivity": {
      "value": 80,
      "trend": "improving",
      "details": "Very detailed analysis of productivity levels, efficiency, and output quality",
      "indicators": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
      "drivers": ["driver 1", "driver 2", "driver 3"]
    },
    "collaboration": {
      "value": 70,
      "trend": "stable",
      "details": "Very detailed analysis of how well team members work together",
      "indicators": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
      "drivers": ["driver 1", "driver 2", "driver 3"]
    },
    "communication": {
      "value": 75,
      "trend": "declining",
      "details": "Very detailed analysis of communication effectiveness, frequency, and clarity",
      "indicators": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
      "drivers": ["driver 1", "driver 2", "driver 3"]
    },
    "engagement": {
      "value": 75,
      "trend": "stable",
      "details": "Very detailed analysis of team member engagement and commitment",
      "indicators": ["indicator 1", "indicator 2", "indicator 3"],
      "drivers": ["driver 1", "driver 2"]
    },
    "innovation": {
      "value": 70,
      "trend": "improving",
      "details": "Very detailed analysis of team's ability to innovate and adapt",
      "indicators": ["indicator 1", "indicator 2", "indicator 3"],
      "drivers": ["driver 1", "driver 2"]
    }
  },
  "warnings": [
    {
      "type": "burnout",
      "severity": "medium",
      "description": "Very detailed description of the warning, why it's occurring, and its impact",
      "affectedMembers": "Description of who might be affected",
      "rootCauses": ["cause 1", "cause 2", "cause 3"],
      "suggestedInterventions": ["intervention 1", "intervention 2", "intervention 3", "intervention 4", "intervention 5"],
      "timeline": "When to address this",
      "urgency": "High/Medium/Low"
    }
  ],
  "suggestions": [
    {
      "type": "team-building",
      "activity": "Activity name",
      "description": "Very detailed description of the activity and why it's beneficial",
      "priority": "high",
      "expectedOutcomes": ["outcome 1", "outcome 2", "outcome 3"],
      "implementation": "Detailed steps for implementation",
      "resources": ["resource 1", "resource 2"],
      "timeline": "Suggested timeline",
      "successMetrics": ["metric 1", "metric 2"]
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "areasForImprovement": [
    {
      "area": "Improvement area",
      "description": "Detailed description",
      "impact": "Impact on team health",
      "priority": "High/Medium/Low",
      "actions": ["action 1", "action 2", "action 3", "action 4"]
    }
  ],
  "teamCulture": {
    "values": ["value 1", "value 2", "value 3"],
    "norms": ["norm 1", "norm 2", "norm 3"],
    "dynamics": "Detailed analysis of team culture and dynamics",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  },
  "actionPlan": {
    "immediate": ["action 1", "action 2", "action 3"],
    "shortTerm": ["action 1", "action 2", "action 3"],
    "longTerm": ["action 1", "action 2", "action 3"]
  },
  "benchmarks": {
    "industryAverage": "How this team compares to industry averages",
    "bestPractices": ["practice 1", "practice 2", "practice 3"]
  }
}

Trend values: "improving", "stable", or "declining"
Warning types: "burnout", "conflict", "low-productivity", "communication-breakdown"
Severity: "low", "medium", "high"
Suggestion types: "team-building", "process-improvement", "communication", "wellness"
Priority: "low", "medium", "high"

Be VERY DETAILED and COMPREHENSIVE. Provide actionable insights.

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

