import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { businessInfo } = await request.json()

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

    const prompt = `You are RevenueOS AI, an expert in revenue optimization and business model analysis.

Analyze this business model and provide optimization suggestions:

${businessInfo}

Provide comprehensive optimization analysis in JSON format:
{
  "analysis": {
    "pricingChanges": [
      {
        "suggestion": "Specific pricing change suggestion",
        "impact": "Expected impact on revenue",
        "implementation": ["step1", "step2", "step3"]
      }
    ],
    "newRevenueStreams": [
      {
        "stream": "New revenue stream name",
        "potential": "Revenue potential description",
        "effort": "low" or "medium" or "high",
        "timeline": "Implementation timeline"
      }
    ],
    "upsellOpportunities": [
      {
        "opportunity": "Upsell opportunity description",
        "targetSegment": "Target customer segment",
        "potentialRevenue": "Estimated revenue potential",
        "approach": ["approach1", "approach2"]
      }
    ],
    "costReductions": [
      {
        "area": "Cost reduction area",
        "currentCost": "Current cost estimate",
        "potentialSavings": "Potential savings estimate",
        "actionItems": ["action1", "action2"]
      }
    ]
  }
}

Return 2-3 suggestions for each category. Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let optimizationData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      optimizationData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      optimizationData = {
        analysis: {
          pricingChanges: [],
          newRevenueStreams: [],
          upsellOpportunities: [],
          costReductions: []
        }
      }
    }

    return NextResponse.json(optimizationData)
  } catch (error) {
    console.error('Error optimizing revenue:', error)
    return NextResponse.json(
      { error: 'Failed to optimize revenue' },
      { status: 500 }
    )
  }
}

