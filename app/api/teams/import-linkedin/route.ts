import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be used to import LinkedIn profile data
// For now, it's a placeholder that can be extended with LinkedIn API integration

export async function POST(request: NextRequest) {
  try {
    const { linkedinData, userId } = await request.json()

    if (!linkedinData) {
      return NextResponse.json({ error: 'LinkedIn data is required' }, { status: 400 })
    }

    // Map LinkedIn data to our profile format
    const profile = {
      name: linkedinData.name || linkedinData.firstName + ' ' + linkedinData.lastName,
      email: linkedinData.email,
      linkedinId: linkedinData.id,
      linkedinUrl: linkedinData.profileUrl || `https://www.linkedin.com/in/${linkedinData.vanityName || ''}`,
      profilePictureUrl: linkedinData.profilePicture?.displayImage,
      skills: linkedinData.skills?.map((s: any) => s.name) || [],
      experience: linkedinData.positions?.map((p: any) => 
        `${p.title} at ${p.companyName} (${p.startDate?.year || ''} - ${p.endDate?.year || 'Present'})`
      ).join('; ') || '',
      location: linkedinData.location?.name || '',
      // Extract values and preferences from LinkedIn summary/headline if available
      values: [],
      lookingFor: [],
      availability: 'full-time' as const,
      preferences: {
        equity: '',
        commitment: '',
        workingStyle: ''
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'LinkedIn profile imported successfully'
    })
  } catch (error: any) {
    console.error('Error importing LinkedIn profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import LinkedIn profile' },
      { status: 500 }
    )
  }
}

