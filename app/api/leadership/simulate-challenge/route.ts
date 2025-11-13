import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { scenario, description, userResponse, getFeedback } = await request.json()
    
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

    if (getFeedback) {
      // Provide detailed feedback on user's response
      const systemPrompt = `You are an expert leadership coach providing feedback on leadership challenge responses.
Return ONLY valid JSON:
{
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "score": 75,
    "detailedAnalysis": "Comprehensive analysis of the response"
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

      const prompt = `Evaluate this leadership response to a challenge scenario:

Scenario: ${scenario}
Description: ${description}

User's Response:
${userResponse}

Provide:
1. 3-5 strengths of this response
2. 3-5 areas for improvement
3. A score from 0-100
4. Detailed analysis of the approach, what worked well, and what could be improved

Be constructive and specific. Focus on leadership effectiveness, communication, decision-making, and relationship management.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      let feedback
      try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        feedback = JSON.parse(cleaned)
      } catch (parseError) {
        console.error('Failed to parse feedback:', parseError)
        feedback = {
          feedback: {
            strengths: ['Clear communication', 'Thoughtful approach'],
            improvements: ['Could consider more perspectives', 'May need more detail'],
            score: 75,
            detailedAnalysis: 'The response shows good leadership thinking with room for improvement.'
          }
        }
      }

      return NextResponse.json(feedback)
    } else {
      // Simulate the scenario
      const systemPrompt = `You are simulating a leadership challenge scenario. Provide context and initial reactions.
Return ONLY valid JSON:
{
  "simulation": "How the scenario unfolds",
  "strengths": ["potential strength 1"],
  "improvements": ["potential improvement 1"],
  "score": 70,
  "analysis": "Initial analysis"
}`

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
        systemInstruction: systemPrompt
      })

      const prompt = `Simulate this leadership challenge scenario:

Scenario: ${scenario}
Description: ${description}

Provide a realistic simulation of how this scenario might unfold, including:
- How the situation develops
- Key challenges and obstacles
- What a strong leader would consider
- Initial analysis of potential approaches

Return ONLY valid JSON, no markdown formatting, no code blocks.`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      let simulation
      try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        simulation = JSON.parse(cleaned)
      } catch (parseError) {
        console.error('Failed to parse simulation:', parseError)
        simulation = {
          simulation: 'The scenario unfolds with various challenges and opportunities.',
          strengths: [],
          improvements: [],
          score: 70,
          analysis: 'This is a complex leadership challenge requiring careful consideration.'
        }
      }

      return NextResponse.json(simulation)
    }
  } catch (error) {
    console.error('Challenge simulation error:', error)
    return NextResponse.json(
      { error: 'Failed to simulate challenge' },
      { status: 500 }
    )
  }
}

