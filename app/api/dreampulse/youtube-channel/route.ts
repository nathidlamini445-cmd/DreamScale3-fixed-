import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num) : num
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

/**
 * Lookup public YouTube channel info by username/handle.
 * Server-side wrapper so the YouTube API key is never exposed to the browser.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimit(`yt-channel:${getClientIp(req)}`, 30, 60_000)
    if (rateLimited) return rateLimited

    const body = await req.json().catch(() => ({}))
    const username = typeof body?.username === 'string' ? body.username.trim() : ''
    if (!username || username.length > 100) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
    }

    const API_KEY = process.env.YOUTUBE_API_KEY
    if (!API_KEY) {
      return NextResponse.json({ error: 'YouTube API not configured' }, { status: 503 })
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(username)}&type=channel&maxResults=1&key=${API_KEY}`
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(15_000) })
    if (!searchRes.ok) {
      return NextResponse.json({ error: 'YouTube search failed' }, { status: 502 })
    }
    const searchData = await searchRes.json()
    const channelId = searchData?.items?.[0]?.id?.channelId
    if (!channelId) return NextResponse.json({ found: false }, { status: 404 })

    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${encodeURIComponent(channelId)}&key=${API_KEY}`
    const channelRes = await fetch(channelUrl, { signal: AbortSignal.timeout(15_000) })
    if (!channelRes.ok) {
      return NextResponse.json({ error: 'YouTube channel fetch failed' }, { status: 502 })
    }
    const channelData = await channelRes.json()
    const channel = channelData?.items?.[0]
    if (!channel) return NextResponse.json({ found: false }, { status: 404 })

    return NextResponse.json({
      found: true,
      platformName: 'YouTube',
      username: channel.snippet?.title ?? username,
      followers: formatNumber(channel.statistics?.subscriberCount ?? 0),
      contentCount: formatNumber(channel.statistics?.videoCount ?? 0),
      bio: (channel.snippet?.description ?? '').slice(0, 200) + '...',
      contentNiche: (channel.snippet?.description ?? '').slice(0, 100),
    })
  } catch (error) {
    console.error('YouTube channel lookup error:', error)
    return NextResponse.json({ error: 'Failed to fetch channel info' }, { status: 500 })
  }
}
