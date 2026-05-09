import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { name, target, timeframe, startDate, endDate } = await request.json()

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

    const start = new Date(startDate || Date.now())
    const end = new Date(endDate || Date.now() + 30 * 24 * 60 * 60 * 1000)
    const weeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))

    const prompt = `You are RevenueOS AI, an expert in goal setting and revenue planning.

Create a revenue goal plan for:
- Goal: ${name}
- Target: $${target}
- Timeframe: ${timeframe}
- Duration: ${weeks} weeks

Break down the goal into weekly actions and milestones in JSON format:
{
  "weeklyActions": [
    {
      "week": "Week 1 (dates)",
      "actions": ["action1", "action2", "action3"],
      "target": weekly target revenue
    }
  ],
  "milestones": [
    {
      "milestone": "Milestone name",
      "target": milestone target amount,
      "achieved": false
    }
  ]
}

Create ${weeks} weeks of actions. Break down the $${target} target into weekly and milestone targets.
Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let goalData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      goalData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Fallback: create basic weekly actions
      const weeklyTarget = target / weeks
      goalData = {
        weeklyActions: Array.from({ length: Math.min(weeks, 12) }, (_, i) => ({
          week: `Week ${i + 1}`,
          actions: [
            `Focus on customer acquisition`,
            `Optimize conversion rates`,
            `Implement upselling strategies`
          ],
          target: weeklyTarget
        })),
        milestones: [
          { milestone: '25% Complete', target: target * 0.25, achieved: false },
          { milestone: '50% Complete', target: target * 0.5, achieved: false },
          { milestone: '75% Complete', target: target * 0.75, achieved: false },
          { milestone: '100% Complete', target: target, achieved: false }
        ]
      }
    }

    return NextResponse.json(goalData)
  } catch (error) {
    console.error('Error creating goal tracker:', error)
    return NextResponse.json(
      { error: 'Failed to create goal tracker' },
      { status: 500 }
    )
  }
}

