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

    const systemPrompt = `You are an expert conflict resolution consultant and mediator. Provide step-by-step guidance for resolving team conflicts.
Return ONLY valid JSON in this exact format:
{
  "conversationStructure": ["step 1", "step 2", "step 3"],
  "scripts": ["Script 1", "Script 2"],
  "negotiationTactics": ["tactic 1", "tactic 2", "tactic 3"],
  "steps": [
    {
      "step": 1,
      "action": "Action description",
      "script": "Exact words to say"
    }
  ]
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Provide conflict resolution guidance for this situation:

Conflict Situation: ${situation}
Parties Involved: ${parties.join(', ')}

Provide:
1. A conversation structure (3-5 steps) for how to approach resolving this conflict
2. Specific conversation scripts (2-3 scripts) for different parts of the conversation
3. Negotiation tactics (3-5 tactics) that would be effective here
4. A detailed step-by-step action plan (4-6 steps) with exact scripts for each step

Focus on:
- Active listening techniques
- Finding common ground
- De-escalation strategies
- Win-win solutions
- Maintaining relationships

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

