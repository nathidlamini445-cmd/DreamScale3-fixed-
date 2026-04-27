import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteAccountSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = deleteAccountSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { userId } = parsed.data

    const supabase = await createClient()

    // Verify the authenticated user matches the requested userId
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own account' },
        { status: 403 }
      )
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to delete user profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account deleted successfully. All your data has been removed.' 
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
