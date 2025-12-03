import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { productName, currentPricing, competitors, marketInfo } = await request.json()

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

    const prompt = `You are RevenueOS AI, an expert in pricing strategy and competitive analysis.

Analyze pricing strategy for:
- Product: ${productName}
- Current Pricing: ${currentPricing}
- Competitors: ${competitors || 'Not specified'}
- Market Info: ${marketInfo || 'Not specified'}

Provide comprehensive pricing analysis in JSON format:
{
  "currentPricing": [
    {
      "tier": "Tier name",
      "price": price number,
      "features": ["feature1", "feature2"]
    }
  ],
  "competitorPricing": [
    {
      "competitor": "Competitor name",
      "pricing": [
        {
          "tier": "Tier name",
          "price": price number
        }
      ]
    }
  ],
  "aiRecommendations": {
    "optimalPricing": [
      {
        "tier": "Tier name",
        "price": optimal price number,
        "reasoning": "Why this price is optimal"
      }
    ],
    "marketPosition": "Analysis of market positioning",
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  }
}

Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let strategyData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      strategyData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      strategyData = {
        currentPricing: [],
        competitorPricing: [],
        aiRecommendations: {
          optimalPricing: [],
          marketPosition: 'Standard market positioning.',
          suggestions: []
        }
      }
    }

    return NextResponse.json(strategyData)
  } catch (error) {
    console.error('Error analyzing pricing strategy:', error)
    return NextResponse.json(
      { error: 'Failed to analyze pricing strategy' },
      { status: 500 }
    )
  }
}

