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
Review communications and provide EXTENSIVE, COMPREHENSIVE improvements with detailed suggestions.
Return ONLY valid JSON in this exact format:
{
  "improved": "Improved version of the communication (significantly enhanced)",
  "suggestions": {
    "clarity": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
    "impact": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
    "empathy": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
    "structure": ["suggestion 1", "suggestion 2"],
    "tone": ["suggestion 1", "suggestion 2"],
    "callToAction": ["suggestion 1", "suggestion 2"]
  },
  "analysis": {
    "currentTone": "Analysis of current tone",
    "recommendedTone": "Recommended tone and why",
    "keyMessages": ["message 1", "message 2", "message 3"],
    "emotionalImpact": "Analysis of emotional impact on recipient",
    "persuasiveness": "Analysis of persuasiveness and how to improve"
  },
  "alternatives": [
    {
      "version": "Alternative version",
      "useCase": "When to use this version",
      "rationale": "Why this version works"
    }
  ],
  "bestPractices": ["practice 1", "practice 2", "practice 3", "practice 4"],
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "followUp": "Suggested follow-up communication if needed"
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

    const prompt = `Review and EXTENSIVELY improve this ${type} communication:

Original Text:
${text}
${context ? `\nContext: ${context}` : ''}

${typeGuidance[type as keyof typeof typeGuidance] || ''}

Provide COMPREHENSIVE analysis including:
1. A significantly improved version of the communication that is clearer, more impactful, and more empathetic
2. Specific suggestions for improving clarity (4-5 items) - be detailed
3. Specific suggestions for increasing impact (4-5 items) - be detailed
4. Specific suggestions for enhancing empathy (4-5 items) - be detailed
5. Suggestions for improving structure (2-3 items)
6. Suggestions for adjusting tone (2-3 items)
7. Suggestions for call-to-action (2-3 items)
8. Detailed analysis:
   - Current tone analysis
   - Recommended tone and why
   - Key messages to emphasize (3-4 messages)
   - Emotional impact on recipient
   - Persuasiveness analysis and improvements
9. Alternative versions (2-3 alternatives) with use cases and rationale
10. Best practices for this type of communication (3-5 practices)
11. Common mistakes to avoid (2-4 mistakes)
12. Suggested follow-up communication if needed

For tough messages, pay special attention to:
- Acknowledging emotions
- Being clear and direct while being compassionate
- Providing context and next steps
- Maintaining respect and dignity
- Managing expectations
- Offering support

Be VERY DETAILED and SPECIFIC. Provide comprehensive, actionable feedback.

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

