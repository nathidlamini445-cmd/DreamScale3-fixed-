import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json()

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

    const prompt = `You are TeamSync AI, an expert in co-founder matching and startup partnerships.

Analyze this co-founder profile and generate a complementary match:

Profile:
- Name: ${profile.name}
- Skills: ${profile.skills.join(', ')}
- Values: ${profile.values.join(', ')}
- Availability: ${profile.availability}
- Experience: ${profile.experience}
- Location: ${profile.location || 'Not specified'}
- Looking For: ${profile.lookingFor.join(', ')}
- Preferences: ${JSON.stringify(profile.preferences)}

Generate a complementary co-founder profile and match analysis in JSON format:
{
  "matchedProfile": {
    "name": "AI Generated Complementary Profile",
    "skills": ["skill1", "skill2", "skill3"],
    "values": ["value1", "value2"],
    "availability": "full-time",
    "experience": "Complementary experience description",
    "location": "Location if relevant",
    "lookingFor": ["what they're looking for"],
    "preferences": {
      "equity": "equity expectations",
      "commitment": "commitment level",
      "workingStyle": "working style preference"
    }
  },
  "matchScore": 85,
  "analysis": {
    "complementarySkills": ["skill1", "skill2"],
    "sharedValues": ["value1", "value2"],
    "potentialChallenges": ["challenge1", "challenge2"],
    "collaborationFit": 85,
    "recommendation": "Detailed recommendation on why this match works"
  }
}

Match score should be 0-100. Collaboration fit should be 0-100.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let matchData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      matchData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      matchData = {
        matchedProfile: {
          name: 'AI Generated Complementary Profile',
          skills: ['Complementary skills'],
          values: ['Shared values'],
          availability: 'full-time',
          experience: 'Complementary experience',
          lookingFor: [],
          preferences: { equity: '', commitment: '', workingStyle: '' }
        },
        matchScore: 75,
        analysis: {
          complementarySkills: [],
          sharedValues: [],
          potentialChallenges: [],
          collaborationFit: 75,
          recommendation: 'This is a generated match based on complementary skills and shared values.'
        }
      }
    }

    return NextResponse.json(matchData)
  } catch (error) {
    console.error('Error matching co-founder:', error)
    return NextResponse.json(
      { error: 'Failed to match co-founder' },
      { status: 500 }
    )
  }
}

