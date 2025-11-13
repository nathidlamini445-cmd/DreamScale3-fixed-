import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()
    
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

    const systemPrompt = `You are an expert leadership coach and organizational psychologist. 
Analyze leadership assessment answers to identify leadership style, strengths, blind spots, and situational adaptations.
Return ONLY valid JSON in this exact format:
{
  "style": "Leadership style name (e.g., Transformational, Transactional, Servant, Democratic, Autocratic, Laissez-faire)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "blindSpots": ["blind spot 1", "blind spot 2", "blind spot 3"],
  "adaptations": [
    {
      "situation": "Situation description",
      "recommendedApproach": "How to adapt leadership style for this situation"
    }
  ],
  "score": 75
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const answersText = answers.map((a: any, i: number) => `Q${i + 1}: ${a.answer}`).join('\n')

    const prompt = `Analyze these leadership assessment answers and provide a comprehensive leadership style analysis:

${answersText}

Provide:
1. The primary leadership style (be specific and accurate)
2. 3-5 key strengths based on the answers
3. 3-5 blind spots or areas for improvement
4. 3-5 situational adaptations showing how to adjust style for different scenarios
5. A score from 0-100 representing overall leadership effectiveness

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let analysis
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback analysis
      analysis = {
        style: 'Adaptive Leadership',
        strengths: ['Strong decision-making', 'Team collaboration', 'Strategic thinking'],
        blindSpots: ['May need more delegation', 'Could improve conflict resolution', 'Time management'],
        adaptations: [
          {
            situation: 'Crisis situations',
            recommendedApproach: 'Take decisive action while keeping team informed'
          },
          {
            situation: 'Team building',
            recommendedApproach: 'Focus on collaboration and consensus-building'
          }
        ],
        score: 75
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Leadership style assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to assess leadership style' },
      { status: 500 }
    )
  }
}

