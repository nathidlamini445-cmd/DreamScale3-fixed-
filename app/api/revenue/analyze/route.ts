import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { companyName, industry, website, additionalInfo } = await request.json()

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

    const prompt = `You are Revenue Intelligence AI, an expert in analyzing company revenue models, pricing strategies, and market positioning.

Analyze the revenue intelligence for this company:

Company Name: ${companyName}
Industry: ${industry}
Website: ${website || 'Not provided'}
Additional Information: ${additionalInfo || 'None'}

Provide a comprehensive revenue analysis in JSON format with this exact structure:
{
  "analysis": {
    "revenueStreams": [
      {
        "name": "Revenue stream name",
        "type": "Subscription, Transaction, Advertising, etc.",
        "estimatedRevenue": "Estimated annual/monthly revenue",
        "growthRate": "Growth rate percentage",
        "description": "Description of this revenue stream"
      }
    ],
    "pricingStrategy": {
      "model": "Pricing model name (e.g., Freemium, SaaS, Marketplace)",
      "analysis": "Detailed analysis of the pricing strategy",
      "recommendations": ["recommendation1", "recommendation2"]
    },
    "marketPosition": {
      "position": "Market position description",
      "competitors": ["competitor1", "competitor2"],
      "differentiation": "How they differentiate in the market"
    },
    "growthOpportunities": [
      {
        "opportunity": "Growth opportunity name",
        "potential": "Potential impact description",
        "actionItems": ["action1", "action2"]
      }
    ],
    "revenueProjections": [
      {
        "timeframe": "6 months, 1 year, etc.",
        "projection": "Revenue projection",
        "assumptions": ["assumption1", "assumption2"]
      }
    ]
  }
}

Return 3-5 revenue streams, 2-3 growth opportunities, and 2-3 revenue projections.
Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let analysisData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysisData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      analysisData = {
        analysis: {
          revenueStreams: [
            {
              name: 'Primary Revenue Stream',
              type: 'Subscription',
              estimatedRevenue: 'Based on industry standards',
              growthRate: '15-25%',
              description: 'Main revenue source for the company'
            }
          ],
          pricingStrategy: {
            model: 'Industry Standard Model',
            analysis: 'Standard pricing approach for this industry.',
            recommendations: ['Consider value-based pricing', 'Evaluate competitive positioning']
          },
          marketPosition: {
            position: 'Competitive market position',
            competitors: ['Key competitors'],
            differentiation: 'Unique value proposition in the market'
          },
          growthOpportunities: [],
          revenueProjections: []
        }
      }
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('Error analyzing revenue:', error)
    return NextResponse.json(
      { error: 'Failed to analyze revenue' },
      { status: 500 }
    )
  }
}

