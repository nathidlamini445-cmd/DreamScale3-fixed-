import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json()

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 })
    }

    // Supabase removed - always return fallback message
    return NextResponse.json({ 
      matches: [],
      message: 'Database not configured. Using AI-generated match via co-founder matching feature.',
      fallback: true 
    })
  } catch (error: any) {
    console.error('Error finding matches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find matches' },
      { status: 500 }
    )
  }
}

