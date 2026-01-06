import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
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

    const systemPrompt = `You are an expert CEO coach and productivity consultant. Generate CEO operating system routines with time blocking, priorities, and energy management.
Return ONLY valid JSON in this exact format:
{
  "name": "Routine name",
  "template": {
    "timeBlocks": [
      {
        "time": "Time or period",
        "activity": "Activity description",
        "priority": "high" | "medium" | "low",
        "energy": "high" | "medium" | "low"
      }
    ],
    "priorities": ["priority 1", "priority 2", "priority 3"],
    "frameworks": ["framework 1", "framework 2"],
    "energyManagement": ["strategy 1", "strategy 2"]
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

    const typeGuidance = {
      daily: 'Create a daily CEO routine with hourly time blocks from morning to evening. Include strategic thinking, team management, deep work, and personal time.',
      weekly: 'Create a weekly CEO routine with day-by-day structure. Include planning, execution, team meetings, and reflection.',
      monthly: 'Create a monthly CEO routine with week-by-week structure. Include strategic planning, execution monitoring, and monthly reviews.'
    }

    const prompt = `Generate a ${type} CEO operating system routine:

${typeGuidance[type as keyof typeof typeGuidance]}

Include:
1. Time blocks with specific times/periods, activities, priority levels, and energy requirements
2. Key priorities for this ${type} routine (3-5 items)
3. Recommended frameworks (Eisenhower Matrix, OKRs, Time Blocking, etc.) - 2-3 frameworks
4. Energy management strategies (3-4 strategies) for maintaining peak performance

Make it practical, actionable, and based on best practices from successful CEOs.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let template
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      template = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      template = {
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} CEO Routine`,
        template: {
          timeBlocks: [],
          priorities: ['Strategic priorities', 'Team alignment'],
          frameworks: ['Time blocking', 'Priority matrix'],
          energyManagement: ['Schedule high-energy tasks strategically']
        }
      }
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Routine generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate routine' },
      { status: 500 }
    )
  }
}

