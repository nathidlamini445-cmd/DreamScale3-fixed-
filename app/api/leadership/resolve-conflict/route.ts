import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { situation, parties } = await request.json()
    
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

    const systemPrompt = `You are an expert conflict resolution consultant and mediator. Provide EXTENSIVE, COMPREHENSIVE step-by-step guidance for resolving team conflicts.
Return ONLY valid JSON in this exact format:
{
  "conversationStructure": ["step 1", "step 2", "step 3", "step 4", "step 5", "step 6"],
  "scripts": ["Script 1", "Script 2", "Script 3", "Script 4"],
  "negotiationTactics": ["tactic 1", "tactic 2", "tactic 3", "tactic 4", "tactic 5", "tactic 6"],
  "steps": [
    {
      "step": 1,
      "action": "Detailed action description",
      "script": "Exact words to say",
      "rationale": "Why this step is important",
      "potentialResponses": ["response 1", "response 2"],
      "handlingObjections": "How to handle objections at this step"
    }
  ],
  "rootCauseAnalysis": "Detailed analysis of underlying causes of the conflict",
  "emotionalIntelligence": {
    "emotions": ["emotion 1", "emotion 2", "emotion 3"],
    "acknowledgment": "How to acknowledge these emotions",
    "deEscalation": "Specific de-escalation techniques"
  },
  "commonGround": ["common ground 1", "common ground 2", "common ground 3"],
  "solutionOptions": [
    {
      "option": "Solution option",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"],
      "viability": "High/Medium/Low"
    }
  ],
  "followUpPlan": {
    "immediate": ["action 1", "action 2"],
    "shortTerm": ["action 1", "action 2"],
    "longTerm": ["action 1", "action 2"]
  },
  "preventionStrategies": ["strategy 1", "strategy 2", "strategy 3", "strategy 4"],
  "redFlags": ["red flag 1", "red flag 2", "red flag 3"],
  "successMetrics": ["metric 1", "metric 2", "metric 3"]
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Provide EXTENSIVE, COMPREHENSIVE conflict resolution guidance for this situation:

Conflict Situation: ${situation}
Parties Involved: ${parties.join(', ')}

Provide DETAILED analysis including:
1. A comprehensive conversation structure (5-7 steps) for how to approach resolving this conflict
2. Specific conversation scripts (3-5 scripts) for different parts of the conversation, including opening, middle, and closing
3. Negotiation tactics (5-7 tactics) that would be effective here - be specific
4. A very detailed step-by-step action plan (6-8 steps) with:
   - Exact scripts for each step
   - Rationale for why each step matters
   - Potential responses and how to handle them
   - How to handle objections at each step
5. Root cause analysis - what's really causing this conflict
6. Emotional intelligence considerations:
   - What emotions are likely present
   - How to acknowledge these emotions
   - Specific de-escalation techniques
7. Common ground identification (3-5 areas of agreement)
8. Multiple solution options (3-4 options) with pros/cons and viability
9. Follow-up plan (immediate, short-term, long-term actions)
10. Prevention strategies to avoid similar conflicts (3-5 strategies)
11. Red flags to watch for during resolution (2-4 red flags)
12. Success metrics to track resolution effectiveness (2-4 metrics)

Focus on:
- Active listening techniques
- Finding common ground
- De-escalation strategies
- Win-win solutions
- Maintaining relationships
- Emotional intelligence
- Long-term relationship preservation

Be VERY DETAILED and SPECIFIC. Provide actionable, comprehensive guidance.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let guidance
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      guidance = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      guidance = {
        conversationStructure: [
          'Set the stage and create safe space',
          'Allow each party to share their perspective',
          'Identify common ground and shared interests',
          'Brainstorm solutions together',
          'Agree on action plan and follow-up'
        ],
        scripts: [
          'I want to understand both perspectives so we can find a solution that works for everyone.',
          'What I\'m hearing is... Can you help me understand if that\'s accurate?'
        ],
        negotiationTactics: [
          'Focus on interests, not positions',
          'Separate people from the problem',
          'Invent options for mutual gain'
        ],
        steps: [
          {
            step: 1,
            action: 'Open the conversation',
            script: 'I\'d like to discuss what\'s been happening so we can work together to find a solution.'
          }
        ]
      }
    }

    return NextResponse.json(guidance)
  } catch (error) {
    console.error('Conflict resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze conflict' },
      { status: 500 }
    )
  }
}

