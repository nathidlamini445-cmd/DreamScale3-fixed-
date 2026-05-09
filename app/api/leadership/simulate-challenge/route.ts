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
      const systemPrompt = `You are an expert leadership coach providing EXTENSIVE, COMPREHENSIVE feedback on leadership challenge responses.
Return ONLY valid JSON:
{
  "feedback": {
    "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
    "score": 75,
    "scoreBreakdown": {
      "communication": 75,
      "decisionMaking": 75,
      "emotionalIntelligence": 75,
      "strategicThinking": 75,
      "relationshipManagement": 75
    },
    "detailedAnalysis": "Very comprehensive 3-4 paragraph analysis of the response",
    "whatWorkedWell": ["aspect 1", "aspect 2", "aspect 3", "aspect 4"],
    "whatCouldBeBetter": ["aspect 1", "aspect 2", "aspect 3", "aspect 4"],
    "alternativeApproaches": [
      {
        "approach": "Alternative approach",
        "pros": ["pro 1", "pro 2"],
        "cons": ["con 1", "con 2"],
        "whenToUse": "When this approach would be better"
      }
    ],
    "lessonsLearned": ["lesson 1", "lesson 2", "lesson 3"],
    "nextSteps": ["step 1", "step 2", "step 3"],
    "resources": ["resource 1", "resource 2", "resource 3"],
    "realWorldExamples": [
      {
        "leader": "Leader name",
        "situation": "Similar situation",
        "approach": "How they handled it",
        "outcome": "What happened"
      }
    ]
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

      const prompt = `Evaluate this leadership response to a challenge scenario with EXTENSIVE, COMPREHENSIVE feedback:

Scenario: ${scenario}
Description: ${description}

User's Response:
${userResponse}

Provide DETAILED analysis including:
1. 5-7 strengths of this response (be specific and detailed)
2. 5-7 areas for improvement (be specific and actionable)
3. A score from 0-100 with breakdown across 5 dimensions: communication, decision-making, emotional intelligence, strategic thinking, relationship management
4. Very detailed analysis (3-4 paragraphs) of the approach, what worked well, and what could be improved
5. What worked well (4-5 specific aspects)
6. What could be better (4-5 specific aspects)
7. Alternative approaches (2-3 alternatives) with pros/cons and when to use each
8. Key lessons learned (3-4 lessons)
9. Next steps for improvement (3-4 steps)
10. Resources for further development (3-4 resources)
11. Real-world examples of similar situations (2-3 examples) with leader names, situations, approaches, and outcomes

Be VERY CONSTRUCTIVE, SPECIFIC, and ACTIONABLE. Focus on leadership effectiveness, communication, decision-making, emotional intelligence, strategic thinking, and relationship management.

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
      const systemPrompt = `You are simulating a leadership challenge scenario. Provide EXTENSIVE, COMPREHENSIVE context and analysis.
Return ONLY valid JSON:
{
  "simulation": "Very detailed 3-4 paragraph description of how the scenario unfolds",
  "keyChallenges": ["challenge 1", "challenge 2", "challenge 3", "challenge 4", "challenge 5"],
  "stakeholders": [
    {
      "name": "Stakeholder name",
      "role": "Their role",
      "perspective": "Their perspective on the situation",
      "concerns": ["concern 1", "concern 2"],
      "interests": ["interest 1", "interest 2"]
    }
  ],
  "timeline": "Detailed timeline of how events might unfold",
  "potentialOutcomes": [
    {
      "outcome": "Potential outcome",
      "probability": "High/Medium/Low",
      "impact": "Impact description",
      "prevention": "How to prevent negative outcomes"
    }
  ],
  "considerations": ["consideration 1", "consideration 2", "consideration 3", "consideration 4", "consideration 5"],
  "bestPractices": ["practice 1", "practice 2", "practice 3", "practice 4"],
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "strengths": ["potential strength 1", "potential strength 2", "potential strength 3"],
  "improvements": ["potential improvement 1", "potential improvement 2", "potential improvement 3"],
  "score": 70,
  "analysis": "Very detailed 3-4 paragraph initial analysis",
  "recommendedApproach": "Detailed recommended approach for handling this scenario",
  "resources": ["resource 1", "resource 2", "resource 3"]
}`

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
        systemInstruction: systemPrompt
      })

      const prompt = `Simulate this leadership challenge scenario with EXTENSIVE, COMPREHENSIVE detail:

Scenario: ${scenario}
Description: ${description}

Provide VERY DETAILED simulation including:
1. Very detailed 3-4 paragraph description of how the scenario unfolds (be realistic and specific)
2. Key challenges and obstacles (5-7 challenges)
3. Stakeholder analysis (3-5 stakeholders) with their roles, perspectives, concerns, and interests
4. Detailed timeline of how events might unfold
5. Potential outcomes (3-4 outcomes) with probability, impact, and prevention strategies
6. Key considerations a strong leader would think about (5-7 considerations)
7. Best practices for handling this type of scenario (3-5 practices)
8. Common mistakes to avoid (2-4 mistakes)
9. Potential strengths of different approaches (3-4 strengths)
10. Potential improvements to consider (3-4 improvements)
11. Very detailed initial analysis (3-4 paragraphs)
12. Detailed recommended approach for handling this scenario
13. Resources for further learning (3-4 resources)

Be VERY REALISTIC, SPECIFIC, and COMPREHENSIVE. Make the simulation feel authentic and provide actionable insights.

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

