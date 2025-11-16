import { NextRequest, NextResponse } from 'next/server'
import { supabase, CofounderProfileDB } from '@/lib/supabase'
import { CoFounderProfile } from '@/lib/teams-types'

export async function POST(request: NextRequest) {
  try {
    const { profile, userId } = await request.json()

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 })
    }

    // If Supabase is not configured, fall back to localStorage approach
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set up Supabase.',
        fallback: true 
      }, { status: 503 })
    }

    // Generate user_id if not provided (use email or session-based ID)
    const user_id = userId || profile.email || `user_${Date.now()}`

    // Prepare profile data for database
    const profileData: Partial<CofounderProfileDB> = {
      user_id,
      name: profile.name,
      email: profile.email,
      skills: profile.skills || [],
      values: profile.values || [],
      availability: profile.availability || 'full-time',
      experience: profile.experience || '',
      location: profile.location,
      looking_for: profile.lookingFor || [],
      preferences: profile.preferences || {},
      is_active: true,
      updated_at: new Date().toISOString()
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('cofounder_profiles')
      .select('id')
      .eq('user_id', user_id)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('cofounder_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('cofounder_profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ 
      success: true, 
      profile: result,
      message: existingProfile ? 'Profile updated' : 'Profile created'
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
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    if (userId) {
      // Get specific user's profile
      const { data, error } = await supabase
        .from('cofounder_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return NextResponse.json({ profile: data || null })
    } else {
      // Get all active profiles
      const { data, error } = await supabase
        .from('cofounder_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ profiles: data || [] })
    }
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

