import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { fetchLinkContent } from '@/lib/bizora/fetch-link'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const result = await fetchLinkContent(url)
  return NextResponse.json(result)
}
