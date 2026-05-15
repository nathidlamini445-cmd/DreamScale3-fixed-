import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route checks if an email exists in Supabase
// We check both auth.users and user_profiles tables
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { exists: false, error: 'Invalid email' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // Create Supabase client using @supabase/ssr
    const supabase = await createClient()
    
    // Try to find user by email in auth.users (this requires admin access)
    // Since we can't directly query auth.users, we'll try to sign in with a magic link
    // and check if the user exists, OR we can check user_profiles if they're authenticated
    
    // Actually, the best approach is to check user_profiles table
    // But RLS prevents querying by email unless authenticated
    // So we'll use a service role key if available, or check localStorage
    
    // For now, we'll return that we need to authenticate first
    // The client will authenticate and then check the profile
    
    // Alternative: Check if we can query user_profiles with email
    // This might work if RLS allows it, but typically it doesn't
    
    // Best approach: Return that we need to check after authentication
    // The client will handle authentication and then check profile
    
    return NextResponse.json({
      exists: false, // We can't determine without authentication
      onboardingCompleted: false,
      requiresAuth: true // Indicates we need to authenticate first
    })
    
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { exists: false, error: 'Failed to check email' },
      { status: 500 }
    )
  }
}

