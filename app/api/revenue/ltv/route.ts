import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { segment, averageOrderValue, purchaseFrequency, customerLifespan, cac } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Calculate LTV
    const ltv = averageOrderValue * purchaseFrequency * customerLifespan
    const ltvCacRatio = cac > 0 ? ltv / cac : 0

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      }
    })

    const prompt = `You are RevenueOS AI, an expert in customer lifetime value analysis.

Analyze LTV for:
- Segment: ${segment}
- Average Order Value: $${averageOrderValue}
- Purchase Frequency: ${purchaseFrequency} per year
- Customer Lifespan: ${customerLifespan} years
- CAC: $${cac}
- Calculated LTV: $${ltv}
- LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}:1

Provide comprehensive LTV analysis in JSON format:
{
  "averageLTV": ${ltv},
  "cac": ${cac},
  "ltvCacRatio": ${ltvCacRatio.toFixed(2)},
  "analysis": {
    "segmentValue": "Analysis of this segment's value",
    "acquisitionFocus": ["focus area 1", "focus area 2"],
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
  },
  "predictions": [
    {
      "timeframe": "6 months",
      "predictedLTV": predicted LTV value,
      "confidence": confidence percentage
    },
    {
      "timeframe": "1 year",
      "predictedLTV": predicted LTV value,
      "confidence": confidence percentage
    },
    {
      "timeframe": "2 years",
      "predictedLTV": predicted LTV value,
      "confidence": confidence percentage
    }
  ]
}

Return ONLY valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let ltvData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      ltvData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      ltvData = {
        averageLTV: ltv,
        cac: cac || 0,
        ltvCacRatio: ltvCacRatio,
        analysis: {
          segmentValue: `This segment has an LTV of $${ltv} with a ${ltvCacRatio.toFixed(2)}:1 LTV:CAC ratio.`,
          acquisitionFocus: ['Focus on channels with lower CAC', 'Improve retention'],
          recommendations: ['Optimize pricing', 'Increase purchase frequency']
        },
        predictions: [
          { timeframe: '6 months', predictedLTV: ltv * 0.5, confidence: 75 },
          { timeframe: '1 year', predictedLTV: ltv, confidence: 80 },
          { timeframe: '2 years', predictedLTV: ltv * 1.5, confidence: 70 }
        ]
      }
    }

    return NextResponse.json(ltvData)
  } catch (error) {
    console.error('Error calculating LTV:', error)
    return NextResponse.json(
      { error: 'Failed to calculate LTV' },
      { status: 500 }
    )
  }
}

