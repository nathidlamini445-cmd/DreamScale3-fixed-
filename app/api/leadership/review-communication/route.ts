import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { text, type, context } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are an expert communication coach specializing in business communication, leadership messaging, and difficult conversations.
Review communications and provide improved versions with specific suggestions for clarity, impact, and empathy.
Return ONLY valid JSON in this exact format:
{
  "improved": "Improved version of the communication",
  "suggestions": {
    "clarity": ["suggestion 1", "suggestion 2"],
    "impact": ["suggestion 1", "suggestion 2"],
    "empathy": ["suggestion 1", "suggestion 2"]
  }
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const typeGuidance = {
      'email': 'Review as a professional email. Focus on clarity, professionalism, and actionability.',
      'message': 'Review as a business message/chat. Focus on conciseness and tone.',
      'presentation': 'Review as presentation content. Focus on impact, engagement, and key messages.',
      'tough-message': 'Review as a difficult message (layoffs, rejections, pivots). Focus heavily on empathy, clarity, and maintaining relationships.'
    }

    const prompt = `Review and improve this ${type} communication:

Original Text:
${text}
${context ? `\nContext: ${context}` : ''}

${typeGuidance[type as keyof typeof typeGuidance] || ''}

Provide:
1. An improved version of the communication that is clearer, more impactful, and more empathetic
2. Specific suggestions for improving clarity (2-3 items)
3. Specific suggestions for increasing impact (2-3 items)
4. Specific suggestions for enhancing empathy (2-3 items)

For tough messages, pay special attention to:
- Acknowledging emotions
- Being clear and direct while being compassionate
- Providing context and next steps
- Maintaining respect and dignity

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let review
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      review = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      review = {
        improved: text,
        suggestions: {
          clarity: ['Consider restructuring for better flow', 'Add more specific details'],
          impact: ['Strengthen key messages', 'Use more active voice'],
          empathy: ['Acknowledge recipient perspective', 'Show understanding']
        }
      }
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Communication review error:', error)
    return NextResponse.json(
      { error: 'Failed to review communication' },
      { status: 500 }
    )
  }
}

