import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { teamName, members } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      }
    })

    const prompt = `You are TeamSync AI, an expert in team composition and organizational psychology.

Analyze the following team and provide EXTENSIVE, COMPREHENSIVE DNA analysis:

Team Name: ${teamName}
Team Members:
${members.map((m: any) => `
- ${m.name} (${m.role})
  Skills: ${m.skills.join(', ') || 'Not specified'}
  Work Style: ${m.workStyle || 'Not specified'}
  Communication: ${m.communicationPreference || 'Not specified'}
`).join('\n')}

Provide VERY DETAILED analysis in JSON format with this exact structure:
{
  "analysis": {
    "teamComposition": {
      "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5", "strength6"],
      "gaps": ["gap1", "gap2", "gap3", "gap4"],
      "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
      "diversityAnalysis": "Detailed analysis of team diversity (skills, backgrounds, perspectives)",
      "collaborationPotential": "Detailed analysis of how well team members can collaborate",
      "conflictRisk": "Analysis of potential conflict areas and how to mitigate",
      "communicationStyle": "Analysis of communication patterns and recommendations"
    },
    "optimalCompositions": [
      {
        "projectType": "Project type name",
        "recommendedMembers": ["Member1", "Member2"],
        "reasoning": "Very detailed explanation of why this composition works well",
        "expectedOutcomes": ["outcome 1", "outcome 2", "outcome 3"],
        "potentialChallenges": ["challenge 1", "challenge 2"],
        "successFactors": ["factor 1", "factor 2", "factor 3"]
      }
    ],
    "skillGaps": [
      {
        "gap": "Missing skill area",
        "impact": "Very detailed explanation of how this gap affects the team, projects, and outcomes",
        "urgency": "High/Medium/Low",
        "suggestedHiringProfile": {
          "role": "Role title",
          "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
          "traits": ["trait1", "trait2", "trait3", "trait4"],
          "experience": "Required experience level",
          "personalityFit": "What personality traits would fit well"
        },
        "alternatives": ["alternative 1", "alternative 2"],
        "timeline": "When this gap should be filled"
      }
    ],
    "teamDynamics": {
      "workStyleCompatibility": "Detailed analysis of how work styles complement or conflict",
      "communicationPatterns": "Analysis of communication preferences and recommendations",
      "leadershipStructure": "Analysis of leadership needs and structure",
      "motivationFactors": "What motivates this team and how to leverage it"
    },
    "growthOpportunities": [
      {
        "opportunity": "Growth opportunity",
        "description": "Detailed description",
        "benefits": ["benefit 1", "benefit 2", "benefit 3"],
        "implementation": "How to implement",
        "timeline": "Suggested timeline"
      }
    ],
    "riskFactors": [
      {
        "risk": "Risk description",
        "impact": "Impact on team",
        "mitigation": "How to mitigate",
        "priority": "High/Medium/Low"
      }
    ]
  }
}

Be VERY DETAILED and SPECIFIC. Provide comprehensive insights that help optimize team performance.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to extract JSON from the response
    let analysisData
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysisData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Return fallback structure
      analysisData = {
        analysis: {
          teamComposition: {
            strengths: ['Strong collaboration', 'Diverse skill sets'],
            gaps: ['May need more specialized expertise'],
            recommendations: ['Consider cross-training', 'Hire for identified gaps']
          },
          optimalCompositions: [],
          skillGaps: []
        }
      }
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('Error analyzing team DNA:', error)
    return NextResponse.json(
      { error: 'Failed to analyze team DNA' },
      { status: 500 }
    )
  }
}

