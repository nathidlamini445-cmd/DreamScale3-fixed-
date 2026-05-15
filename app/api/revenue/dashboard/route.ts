import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { name, mrr, churnRate, monthlyBurn } = await request.json()

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

    // Calculate runway
    const runway = monthlyBurn > 0 && mrr > 0 ? (mrr / monthlyBurn) : 0

    const prompt = `You are RevenueOS AI, an expert in revenue forecasting and financial planning.

Create a revenue forecast for:
- Dashboard Name: ${name}
- Current MRR: $${mrr}
- Churn Rate: ${churnRate}%
- Monthly Burn: $${monthlyBurn}
- Runway: ${runway.toFixed(1)} months

Generate a 6-month revenue forecast in JSON format:
{
  "mrr": ${mrr},
  "churnRate": ${churnRate},
  "runway": ${runway.toFixed(1)},
  "forecast": [
    {
      "month": "Month name (e.g., January 2024)",
      "projectedRevenue": projected revenue amount,
      "confidence": confidence percentage (0-100)
    }
  ]
}

Account for churn rate in projections. Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let dashboardData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      dashboardData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Fallback forecast
      const months = ['Next Month', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
      dashboardData = {
        mrr: mrr || 0,
        churnRate: churnRate || 0,
        runway: runway,
        forecast: months.map((month, i) => ({
          month,
          projectedRevenue: mrr * Math.pow(1 - (churnRate / 100), i + 1),
          confidence: 75
        }))
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error creating dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    )
  }
}

