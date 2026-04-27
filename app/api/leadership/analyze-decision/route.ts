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
  "overview": "A comprehensive 3-4 paragraph explanation of the decision, its context, why it matters, what's at stake, the complexity involved, and key considerations. This should be detailed, educational, and help the decision-maker understand the full scope and importance of this decision.",
  "frameworks": [
    {
      "name": "Framework name (e.g., First Principles, ICE Score, Cost-Benefit Analysis, Decision Matrix, SWOT, Risk Analysis, RICE Score)",
      "analysis": "Very detailed 3-4 paragraph analysis using this framework. Include specific calculations, metrics, examples, and actionable insights. Explain how this framework applies to the decision, what it reveals, and what specific recommendations it suggests. Be comprehensive and educational.",
      "score": 75,
      "keyInsights": ["Detailed insight 1", "Detailed insight 2", "Detailed insight 3", "Detailed insight 4"]
    }
  ],
  "pros": ["Detailed pro with explanation of why it matters and how it benefits the decision - be specific and actionable", "Each pro should be comprehensive, explaining not just what the benefit is but why it matters, how significant it is, and what it enables. Provide 10-12 detailed pros."],
  "cons": ["Detailed con with explanation of the risk, why it's concerning, and potential impact - be specific and realistic", "Each con should be comprehensive, explaining not just what the drawback is but why it matters, how significant it is, and what it could prevent. Provide 10-12 detailed cons."],
  "secondOrderEffects": ["Detailed second-order effect with explanation of what happens after the immediate consequences, why it matters, and how to prepare for it. Provide 6-8 comprehensive effects."],
  "thirdOrderEffects": ["Detailed third-order effect explaining long-term ripple effects, strategic implications, and how this decision shapes future possibilities. Provide 4-6 comprehensive effects."],
  "risks": [
    {
      "risk": "Detailed risk description explaining what could go wrong, why it's a concern, and what triggers it",
      "probability": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "mitigation": "Comprehensive mitigation strategy with specific steps, early warning signs to watch for, and contingency plans. Be detailed and actionable."
    }
  ],
  "opportunities": ["Detailed opportunity explaining what becomes possible, why it's valuable, how to capitalize on it, and what it enables. Provide 5-7 comprehensive opportunities with actionable details."],
  "caseStudies": [
    {
      "company": "Real company name (use actual companies when possible)",
      "situation": "Detailed description of the situation they faced, including context, challenges, and constraints",
      "decision": "Detailed description of the decision they made and how they approached it",
      "outcome": "Comprehensive description of what happened - both positive and negative outcomes, metrics, and long-term impact",
      "lessons": "Detailed lessons learned including what worked, what didn't, what they would do differently, and actionable takeaways"
    }
  ],
  "alternatives": [
    {
      "option": "Detailed alternative option with explanation of what it entails",
      "pros": ["Detailed pro 1 explaining why this alternative is attractive and what benefits it offers", "Detailed pro 2", "Detailed pro 3"],
      "cons": ["Detailed con 1 explaining the drawbacks and challenges of this alternative", "Detailed con 2", "Detailed con 3"],
      "viability": "High/Medium/Low",
      "viabilityReasoning": "Detailed explanation of why this viability rating",
      "whenToConsider": "Detailed explanation of when this alternative makes sense and what conditions favor it"
    }
  ],
  "timelineConsiderations": "Comprehensive 2-3 paragraph analysis of timeline considerations including optimal timing, critical path items, dependencies, milestones, and what happens if delayed. Include specific timeframes and deadlines.",
  "resourceRequirements": "Comprehensive 2-3 paragraph analysis of all resource requirements including financial costs (with estimates), human resources needed (skills, roles, time commitments), time requirements, tools/technology needed, and ongoing maintenance costs.",
  "stakeholderImpact": "Comprehensive 2-3 paragraph analysis of impact on different stakeholders including employees, customers, investors, partners, suppliers, and community. Explain how each group is affected, what concerns they might have, and how to address them.",
  "recommendation": "Very detailed recommendation (3-4 paragraphs) with reasoning, implementation steps, and success metrics",
  "implementationPlan": [
    {
      "phase": "Phase name",
      "steps": ["Detailed step 1 with specific actions, who's responsible, and what success looks like", "Detailed step 2 with specific actions, who's responsible, and what success looks like", "Each step should be comprehensive with clear actions, owners, deliverables, and success criteria"],
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

Provide EXTREMELY COMPREHENSIVE and DETAILED analysis. The user needs extensive, beneficial information to make an informed decision. Be thorough, educational, and actionable.

0. OVERVIEW: A comprehensive 3-4 paragraph explanation that thoroughly explains the decision, its context, why it matters, what's at stake, the complexity involved, and key considerations. Make it educational and help the decision-maker fully understand the full scope and importance before diving into frameworks.

1. FRAMEWORKS: Analysis using 5-6 different frameworks (First Principles, ICE Score, Cost-Benefit Analysis, Decision Matrix, SWOT Analysis, Risk Analysis, RICE Score, etc.). Each framework analysis should be 3-4 paragraphs with:
   - Specific calculations, metrics, and numbers where applicable
   - Detailed examples and scenarios
   - Actionable insights and recommendations
   - Explanation of what the framework reveals about this decision
   - Key insights that emerge from this analysis

2. PROS: Provide 10-12 extremely detailed pros. Each pro should:
   - Explain what the benefit is
   - Explain why it matters and how significant it is
   - Explain what it enables or unlocks
   - Include specific examples or scenarios
   - Be actionable and realistic

3. CONS: Provide 10-12 extremely detailed cons. Each con should:
   - Explain what the drawback or risk is
   - Explain why it's concerning and how significant it is
   - Explain what it could prevent or limit
   - Include specific examples or scenarios
   - Be realistic and honest about challenges

4. SECOND-ORDER EFFECTS: Provide 6-8 comprehensive second-order effects. Each should explain:
   - What happens after the immediate consequences
   - Why it matters and how significant it is
   - How to prepare for or capitalize on it
   - The ripple effects on other areas

5. THIRD-ORDER EFFECTS: Provide 4-6 comprehensive third-order effects. Each should explain:
   - Long-term ripple effects and strategic implications
   - How this decision shapes future possibilities
   - What becomes possible or impossible long-term
   - Strategic positioning implications

6. RISKS: Provide 6-8 detailed risk analyses. Each risk should include:
   - Detailed description of what could go wrong and why it's a concern
   - Probability assessment (High/Medium/Low) with reasoning
   - Impact assessment (High/Medium/Low) with reasoning
   - Comprehensive mitigation strategy with specific steps
   - Early warning signs to watch for
   - Contingency plans if the risk materializes

7. OPPORTUNITIES: Provide 5-7 comprehensive opportunities. Each should explain:
   - What becomes possible with this decision
   - Why it's valuable and how significant it is
   - How to capitalize on it with specific actions
   - What it enables or unlocks
   - Strategic advantages it creates

8. CASE STUDIES: Provide 4-5 detailed case studies. Each should include:
   - Real company name (use actual companies when possible)
   - Detailed situation description with context, challenges, and constraints
   - Detailed decision description and approach
   - Comprehensive outcome description (positive and negative, metrics, long-term impact)
   - Detailed lessons learned (what worked, what didn't, what they'd do differently, actionable takeaways)

9. ALTERNATIVES: Provide 3-4 detailed alternative options. Each should include:
   - Detailed description of the alternative and what it entails
   - Comprehensive pros (3-4 detailed items)
   - Comprehensive cons (3-4 detailed items)
   - Viability assessment (High/Medium/Low) with detailed reasoning
   - When to consider this alternative and what conditions favor it
   - Comparison to the main decision

10. TIMELINE CONSIDERATIONS: Provide 2-3 paragraphs covering:
    - Optimal timing and why
    - Critical path items and dependencies
    - Key milestones and deadlines
    - What happens if delayed
    - Specific timeframes for different phases

11. RESOURCE REQUIREMENTS: Provide 2-3 paragraphs covering:
    - Financial costs with realistic estimates
    - Human resources needed (specific skills, roles, time commitments)
    - Time requirements and commitments
    - Tools, technology, and infrastructure needed
    - Ongoing maintenance and operational costs
    - Hidden or unexpected costs to consider

12. STAKEHOLDER IMPACT: Provide 2-3 paragraphs covering:
    - Impact on employees (different roles/levels)
    - Impact on customers
    - Impact on investors/partners
    - Impact on suppliers/vendors
    - Impact on community/market
    - How to address concerns for each group
    - Communication strategies

13. RECOMMENDATION: Provide 4-5 paragraphs with:
    - Clear recommendation with detailed reasoning
    - Why this is the best path forward
    - How to implement it successfully
    - What success looks like
    - How to measure progress
    - What to watch out for
    - How to adjust if needed

14. IMPLEMENTATION PLAN: Provide 4-5 detailed phases. Each phase should include:
    - Phase name and purpose
    - 5-7 detailed steps with specific actions
    - Who's responsible for each step
    - What deliverables are expected
    - Specific timeline with dates/milestones
    - Resources needed (financial, human, tools)
    - Success criteria for the phase
    - Dependencies and prerequisites

15. SUCCESS METRICS: Provide 8-10 detailed metrics including:
    - What to measure
    - How to measure it
    - Target values or benchmarks
    - How often to track
    - What good vs. bad looks like
    - How metrics relate to decision success

Be EXTREMELY DETAILED, SPECIFIC, ACTIONABLE, and COMPREHENSIVE. The user needs extensive information to make the best possible decision. Think like a top-tier consultant providing a complete analysis.

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
        overview: `This decision requires careful consideration of multiple factors. The decision involves ${description}, which represents a significant choice that will impact various aspects of the business. Understanding the full context, potential outcomes, and long-term implications is crucial for making an informed choice that aligns with your strategic goals and values.`,
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

