import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { hintForSupabaseServiceError } from '@/lib/supabase-service-error-hint'

const BUCKET = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

async function readProfilePictureUrl(userId: string): Promise<string | null> {
  const supabase = createServiceRoleClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('user_profiles')
    .select('profile_picture_url')
    .eq('id', userId)
    .maybeSingle()
  const url = data?.profile_picture_url
  return typeof url === 'string' && url.trim() ? url.trim() : null
}

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profilePictureUrl = await readProfilePictureUrl(user.id)
  return NextResponse.json({ profilePictureUrl })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const form = await request.formData()
  const file = form.get('avatar')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing avatar file' }, { status: 400 })
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: 'Use JPEG, PNG, WebP, or GIF' },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 2 MB' }, { status: 400 })
  }

  const ext = extForMime(file.type)
  const path = `${user.id}/avatar.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    })

  if (uploadError) {
    const hint = hintForSupabaseServiceError(uploadError.message)
    return NextResponse.json(
      {
        error: uploadError.message,
        hint:
          hint ??
          'Create the "avatars" storage bucket in Supabase (see supabase-profile-avatar-migration.sql).',
      },
      { status: 500 }
    )
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const profilePictureUrl = `${publicData.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      profile_picture_url: profilePictureUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (updateError) {
    const hint = hintForSupabaseServiceError(updateError.message)
    return NextResponse.json(
      { error: updateError.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  return NextResponse.json({ profilePictureUrl })
}

export async function DELETE() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const { data: list } = await supabase.storage.from(BUCKET).list(user.id)
  if (list?.length) {
    const paths = list.map((f) => `${user.id}/${f.name}`)
    await supabase.storage.from(BUCKET).remove(paths)
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      profile_picture_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    const hint = hintForSupabaseServiceError(error.message)
    return NextResponse.json(
      { error: error.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  return NextResponse.json({ profilePictureUrl: null })
}
