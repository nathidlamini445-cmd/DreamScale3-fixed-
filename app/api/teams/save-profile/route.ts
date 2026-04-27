import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json()

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 })
    }

    // Supabase removed - using localStorage only
    return NextResponse.json({ 
      success: true,
      message: 'Profile saved to localStorage (Supabase removed)',
      fallback: true 
    })
  } catch (error: any) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Supabase removed - return empty response
    return NextResponse.json({ 
      profiles: [],
      message: 'Database not configured (Supabase removed)',
      fallback: true 
    })
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

