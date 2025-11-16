import { NextRequest, NextResponse } from 'next/server'
import { supabase, CofounderProfileDB } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { profile, userId } = await request.json()

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 })
    }

    // If Supabase is not configured, fall back to AI-generated match
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Database not configured. Using AI-generated match.',
        fallback: true 
      }, { status: 503 })
    }

    // Get all active profiles except the current user's
    const user_id = userId || profile.email || `user_${Date.now()}`
    const { data: allProfiles, error: fetchError } = await supabase
      .from('cofounder_profiles')
      .select('*')
      .eq('is_active', true)
      .neq('user_id', user_id)

    if (fetchError) throw fetchError

    if (!allProfiles || allProfiles.length === 0) {
      // No profiles in database, generate AI match as fallback
      return NextResponse.json({
        matches: [],
        message: 'No profiles found in database. Please create your profile first.',
        fallback: true
      })
    }

    // Use AI to analyze and rank matches
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      }
    })

    // Prepare profiles for AI analysis
    const profilesForAnalysis = allProfiles.map(p => ({
      id: p.id,
      name: p.name,
      skills: p.skills,
      values: p.values,
      availability: p.availability,
      experience: p.experience,
      location: p.location,
      lookingFor: p.looking_for
    }))

    const prompt = `You are TeamSync AI, an expert in co-founder matching.

Analyze this profile and find the best matches from the available profiles:

**Seeking Co-founder:**
- Name: ${profile.name}
- Skills: ${profile.skills.join(', ')}
- Values: ${profile.values.join(', ')}
- Availability: ${profile.availability}
- Experience: ${profile.experience}
- Location: ${profile.location || 'Not specified'}
- Looking For: ${profile.lookingFor.join(', ')}

**Available Profiles:**
${profilesForAnalysis.map((p, i) => `
${i + 1}. ${p.name}
   - Skills: ${p.skills.join(', ')}
   - Values: ${p.values.join(', ')}
   - Availability: ${p.availability}
   - Experience: ${p.experience}
   - Location: ${p.location || 'Not specified'}
   - Looking For: ${p.lookingFor.join(', ')}
`).join('\n')}

Analyze each profile and return a JSON array of matches, ranked by compatibility (best first).
For each match, provide:
- profileId: The ID of the matched profile
- matchScore: 0-100 compatibility score
- analysis: {
    complementarySkills: [],
    sharedValues: [],
    potentialChallenges: [],
    collaborationFit: 0-100,
    recommendation: "Why this match works"
  }

Return ONLY valid JSON array, no markdown, no code blocks:
[
  {
    "profileId": "id",
    "matchScore": 85,
    "analysis": { ... }
  },
  ...
]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let matches
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      matches = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Fallback: simple matching based on complementary skills
      matches = allProfiles.slice(0, 5).map((p, i) => ({
        profileId: p.id,
        matchScore: 75 - (i * 5),
        analysis: {
          complementarySkills: [],
          sharedValues: [],
          potentialChallenges: [],
          collaborationFit: 75,
          recommendation: 'Match based on available profiles'
        }
      }))
    }

    // Enrich matches with full profile data
    const enrichedMatches = matches.map((match: any) => {
      const matchedProfile = allProfiles.find(p => p.id === match.profileId)
      if (!matchedProfile) return null

      return {
        profile: {
          id: matchedProfile.id,
          name: matchedProfile.name,
          email: matchedProfile.email,
          skills: matchedProfile.skills,
          values: matchedProfile.values,
          availability: matchedProfile.availability,
          experience: matchedProfile.experience,
          location: matchedProfile.location,
          lookingFor: matchedProfile.looking_for,
          preferences: matchedProfile.preferences,
          profilePictureUrl: matchedProfile.profile_picture_url,
          linkedinUrl: matchedProfile.linkedin_url
        },
        matchScore: match.matchScore,
        analysis: match.analysis
      }
    }).filter(Boolean)

    // Sort by match score (highest first)
    enrichedMatches.sort((a: any, b: any) => b.matchScore - a.matchScore)

    return NextResponse.json({
      matches: enrichedMatches,
      totalFound: enrichedMatches.length
    })
  } catch (error: any) {
    console.error('Error finding matches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find matches' },
      { status: 500 }
    )
  }
}

