import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireMonthlyQuota } from '@/lib/usage-quota/require-monthly'

export async function POST(request: NextRequest) {
  try {
    const quotaGate = await requireMonthlyQuota('systems')
    if (quotaGate.error) return quotaGate.error

    const { step, stepNumber, workflowName, systemName } = await request.json()

    if (!step || typeof step !== 'string' || !step.trim()) {
      return NextResponse.json({ error: 'Step text is required' }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are SystemBuilder AI's workflow coach. Explain business workflow steps clearly and practically.
Write in plain, actionable language. Use markdown headings and bullet lists where helpful.
Keep responses focused and useful — no filler.`

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
      systemInstruction: systemPrompt,
    })

    const prompt = `Explain how to complete this workflow step:

System: ${systemName || 'Business System'}
Workflow: ${workflowName || 'Workflow'}
Step ${stepNumber ?? '?'}: ${step.trim()}

Include:
1. What this step involves and why it matters
2. Specific actionable tasks to complete it
3. Tools or resources that help
4. Common challenges and how to overcome them
5. Best practices
6. How to know the step is done successfully`

    const result = await model.generateContent(prompt)
    const explanation = result.response.text()?.trim()

    if (!explanation) {
      return NextResponse.json(
        { error: 'The AI returned an empty response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: explanation })
  } catch (error) {
    console.error('Step explanation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate explanation'

    let userMessage = 'Failed to generate explanation. Please try again.'
    if (message.includes('503') || message.includes('overloaded') || message.includes('429')) {
      userMessage = 'The AI service is busy right now. Please try again in a moment.'
    } else if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      userMessage = 'AI quota exceeded. Please try again later.'
    }

    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
