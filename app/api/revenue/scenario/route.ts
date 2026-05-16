import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { name, scenario, currentRevenue, variables } = await request.json()

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

    const prompt = `You are RevenueOS AI, an expert in scenario planning and financial modeling.

Analyze this scenario:
- Name: ${name}
- Scenario: ${scenario}
- Current Monthly Revenue: $${currentRevenue}
- Variables: ${variables || 'None specified'}

Model the impact over 6 months and provide analysis in JSON format:
{
  "variables": [
    {
      "name": "Variable name",
      "change": "Change description (e.g., +20%)",
      "value": numeric value
    }
  ],
  "projections": [
    {
      "month": "Month 1",
      "revenue": projected revenue,
      "impact": impact amount (can be negative)
    }
  ],
  "analysis": {
    "summary": "Overall summary of the scenario impact",
    "risks": ["risk1", "risk2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "recommendations": ["recommendation1", "recommendation2"]
  }
}

Calculate revenue projections accounting for the scenario variables. Show impact vs current revenue.
Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let scenarioData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      scenarioData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Fallback projections
      const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
      scenarioData = {
        variables: [],
        projections: months.map((month, i) => ({
          month,
          revenue: currentRevenue * (1 + (i * 0.05)),
          impact: currentRevenue * (i * 0.05)
        })),
        analysis: {
          summary: 'Scenario analysis based on provided variables.',
          risks: [],
          opportunities: [],
          recommendations: []
        }
      }
    }

    return NextResponse.json(scenarioData)
  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}

