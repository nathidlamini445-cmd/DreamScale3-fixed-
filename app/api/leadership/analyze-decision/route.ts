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

    const systemPrompt = `You are an expert decision-making consultant. Provide EXTENSIVE, COMPREHENSIVE decision analysis using multiple frameworks.
Return ONLY valid JSON in this exact format:
{
  "frameworks": [
    {
      "name": "Framework name (e.g., First Principles, ICE Score, Cost-Benefit Analysis, Decision Matrix, SWOT, Risk Analysis)",
      "analysis": "Very detailed 2-3 paragraph analysis using this framework with specific insights and calculations",
      "score": 75,
      "keyInsights": ["insight 1", "insight 2", "insight 3"]
    }
  ],
  "pros": ["pro 1", "pro 2", "pro 3", "pro 4", "pro 5", "pro 6", "pro 7", "pro 8"],
  "cons": ["con 1", "con 2", "con 3", "con 4", "con 5", "con 6", "con 7", "con 8"],
  "secondOrderEffects": ["effect 1", "effect 2", "effect 3", "effect 4", "effect 5"],
  "thirdOrderEffects": ["effect 1", "effect 2", "effect 3"],
  "risks": [
    {
      "risk": "Risk description",
      "probability": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3", "opportunity 4"],
  "caseStudies": [
    {
      "company": "Company name",
      "situation": "What they faced",
      "decision": "Decision they made",
      "outcome": "What happened",
      "lessons": "Key lessons learned"
    }
  ],
  "alternatives": [
    {
      "option": "Alternative option",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"],
      "viability": "High/Medium/Low"
    }
  ],
  "timelineConsiderations": "Detailed timeline analysis and considerations",
  "resourceRequirements": "Detailed resource requirements (financial, human, time, etc.)",
  "stakeholderImpact": "Detailed analysis of impact on different stakeholders",
  "recommendation": "Very detailed recommendation (3-4 paragraphs) with reasoning, implementation steps, and success metrics",
  "implementationPlan": [
    {
      "phase": "Phase name",
      "steps": ["step 1", "step 2", "step 3"],
      "timeline": "Timeline for this phase",
      "resources": "Resources needed"
    }
  ],
  "successMetrics": ["metric 1", "metric 2", "metric 3", "metric 4"]
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Analyze this decision using EXTENSIVE analysis with MULTIPLE decision-making frameworks:

Decision: ${description}
${context ? `Context: ${context}` : ''}

Provide COMPREHENSIVE analysis including:
1. Analysis using 4-5 different frameworks (First Principles, ICE Score, Cost-Benefit Analysis, Decision Matrix, SWOT Analysis, Risk Analysis, etc.) - each with detailed analysis, scores, and key insights
2. Extensive list of pros (7-10 items) - be specific and detailed
3. Extensive list of cons (7-10 items) - be specific and detailed
4. Second-order effects (what happens after the immediate consequences) - 4-6 items
5. Third-order effects (long-term ripple effects) - 2-4 items
6. Detailed risk analysis with probability, impact, and mitigation strategies (4-6 risks)
7. Opportunities this decision could unlock (3-5 opportunities)
8. Relevant case studies of similar decisions (3-4 examples) with company names, situations, decisions, outcomes, and lessons learned
9. Alternative options with pros/cons and viability assessment (2-3 alternatives)
10. Timeline considerations and resource requirements
11. Stakeholder impact analysis
12. Very detailed recommendation (3-4 paragraphs) with reasoning
13. Implementation plan with phases, steps, timelines, and resources
14. Success metrics to track

Be VERY DETAILED, SPECIFIC, and ACTIONABLE. Provide comprehensive insights that help make an informed decision.

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

