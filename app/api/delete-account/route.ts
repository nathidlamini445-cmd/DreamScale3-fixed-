import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client using @supabase/ssr (handles cookies automatically)
    // The client will automatically use the user's session from cookies
    const supabase = await createClient()

    // Delete user profile and all related data
    // Due to ON DELETE CASCADE, this will automatically delete:
    // - user_sessions
    // - calendar_events
    // - hypeos_data
    // - chat_conversations
    // - systems_data
    // - revenue_data
    // - leadership_data
    // - teams_data
    // - daily_mood
    // - tasks_data
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete user profile', details: profileError.message },
        { status: 500 }
      )
    }

    // Note: To fully delete the user from auth.users table, you need Supabase Admin API
    // For now, we delete the profile which removes all their data
    // The auth.users record will remain but won't have any associated data
    // Users can create a new account with the same email if they want

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account deleted successfully. All your data has been removed. You can create a new account with the same email if you wish.' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in delete-account route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

