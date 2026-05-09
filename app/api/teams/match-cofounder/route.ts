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

Analyze this co-founder profile and determine DETAILED, COMPREHENSIVE characteristics that an ideal co-founder MUST match with and CAN match with. Be VERY SPECIFIC and provide MANY characteristics across multiple dimensions:

Profile:
- Name: ${profile.name}
- Skills: ${profile.skills.join(', ')}
- Values: ${profile.values.join(', ')}
- Availability: ${profile.availability}
- Experience: ${profile.experience}
- Location: ${profile.location || 'Not specified'}
- Looking For: ${profile.lookingFor.join(', ')}
- Preferences: ${JSON.stringify(profile.preferences)}

Generate EXTENSIVE matching characteristics and analysis in JSON format. Provide AT LEAST 5-8 skills, 3-5 values, and multiple other characteristics for each category:

{
  "matchScore": 85,
  "matchingCharacteristics": {
    "mustMatch": {
      "skills": ["essential technical skill 1", "essential technical skill 2", "essential business skill 1", "essential business skill 2", "essential soft skill 1", "essential soft skill 2", "essential industry-specific skill 1", "essential industry-specific skill 2"],
      "values": ["critical value 1", "critical value 2", "critical value 3", "critical value 4", "critical value 5"],
      "availability": "full-time or part-time (specify minimum hours/week)",
      "experience": "Detailed required experience: years, industry, company size, role level, specific achievements",
      "commitment": "Required commitment level: time investment, equity expectations, long-term vision alignment",
      "workingStyle": "Required working style: communication frequency, decision-making approach, conflict resolution style, meeting preferences",
      "personalityTraits": ["trait 1", "trait 2", "trait 3", "trait 4"],
      "riskTolerance": "Required risk tolerance level and explanation",
      "financialSituation": "Required financial situation: ability to work without salary, investment capacity, financial stability",
      "network": "Required network: industry connections, investor relationships, customer relationships, partner relationships",
      "technicalProficiency": "Required technical proficiency levels in specific areas",
      "leadershipStyle": "Required leadership style: hands-on vs hands-off, collaborative vs directive",
      "communicationStyle": "Required communication style: frequency, channels, directness, documentation preferences"
    },
    "canMatch": {
      "skills": ["nice-to-have technical skill 1", "nice-to-have technical skill 2", "nice-to-have business skill 1", "nice-to-have business skill 2", "nice-to-have soft skill 1", "nice-to-have soft skill 2", "nice-to-have industry skill 1", "nice-to-have industry skill 2"],
      "values": ["preferred value 1", "preferred value 2", "preferred value 3"],
      "location": "Preferred location: specific cities, regions, timezone compatibility, remote vs hybrid vs in-person",
      "additionalTraits": ["preferred personality trait 1", "preferred personality trait 2", "preferred personality trait 3", "preferred personality trait 4", "preferred personality trait 5"],
      "industryExperience": "Preferred industry experience: specific industries, market knowledge, regulatory knowledge",
      "education": "Preferred education: degrees, certifications, continuous learning habits",
      "ageRange": "Preferred age range and reasoning",
      "lifestyle": "Preferred lifestyle: work-life balance expectations, travel willingness, relocation flexibility",
      "hobbies": "Preferred hobbies/interests that indicate complementary personality",
      "previousStartupExperience": "Preferred previous startup experience: stage, outcome, lessons learned",
      "investorRelationships": "Preferred investor relationships: VC connections, angel investors, strategic partners",
      "customerRelationships": "Preferred customer relationships: existing customer base, industry connections",
      "mediaPresence": "Preferred media presence: thought leadership, speaking experience, writing ability"
    }
  },
  "analysis": {
    "complementarySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "sharedValues": ["value1", "value2", "value3", "value4"],
    "potentialChallenges": ["challenge1", "challenge2", "challenge3", "challenge4"],
    "collaborationFit": 85,
    "recommendation": "Very detailed recommendation (3-5 paragraphs) explaining why these characteristics matter, how they complement the profile, what to prioritize when searching, red flags to avoid, and specific questions to ask potential co-founders"
  }
}

IMPORTANT: 
- Provide MANY characteristics (at least 5-8 skills in each category, 3-5 values, multiple traits)
- Be SPECIFIC and DETAILED in descriptions
- Cover multiple dimensions: technical, business, personality, financial, network, experience
- Must match = absolutely essential, deal-breakers
- Can match = nice-to-have, would strengthen the partnership

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
        matchScore: 75,
        matchingCharacteristics: {
          mustMatch: {
            skills: ['Essential complementary skills'],
            values: ['Critical shared values'],
            availability: 'full-time',
            experience: 'Required experience level',
            commitment: 'Required commitment level',
            workingStyle: 'Required working style'
          },
          canMatch: {
            skills: ['Nice-to-have skills'],
            values: ['Preferred values'],
            location: 'Preferred location',
            additionalTraits: ['Additional preferred traits']
          }
        },
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

