import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { description, context } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are an expert decision-making consultant. Provide comprehensive decision analysis using multiple frameworks.
Return ONLY valid JSON in this exact format:
{
  "frameworks": [
    {
      "name": "Framework name (e.g., First Principles, ICE Score, Cost-Benefit Analysis)",
      "analysis": "Detailed analysis using this framework"
    }
  ],
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2", "con 3"],
  "secondOrderEffects": ["effect 1", "effect 2", "effect 3"],
  "caseStudies": ["Case study 1", "Case study 2"],
  "recommendation": "Your recommendation based on analysis"
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Analyze this decision using multiple decision-making frameworks:

Decision: ${description}
${context ? `Context: ${context}` : ''}

Provide:
1. Analysis using 2-3 different frameworks (First Principles, ICE Score, Cost-Benefit Analysis, Decision Matrix, etc.)
2. Comprehensive list of pros (5-7 items)
3. Comprehensive list of cons (5-7 items)
4. Second-order effects (what happens after the immediate consequences) - 3-5 items
5. Relevant case studies of similar decisions (2-3 examples)
6. A clear recommendation based on the analysis

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let analysis
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      analysis = {
        frameworks: [
          {
            name: 'First Principles Analysis',
            analysis: 'Break down the decision to fundamental truths and build up from there.'
          },
          {
            name: 'Cost-Benefit Analysis',
            analysis: 'Evaluate the costs and benefits of this decision.'
          }
        ],
        pros: ['Potential benefit 1', 'Potential benefit 2'],
        cons: ['Potential risk 1', 'Potential risk 2'],
        secondOrderEffects: ['Long-term impact 1', 'Long-term impact 2'],
        caseStudies: ['Similar case study example'],
        recommendation: 'Consider all factors carefully before making this decision.'
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Decision analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze decision' },
      { status: 500 }
    )
  }
}

