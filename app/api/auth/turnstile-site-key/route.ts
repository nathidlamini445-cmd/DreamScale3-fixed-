import { NextResponse } from 'next/server'

/** Public site key for Cloudflare Turnstile (paired with Dashboard secret on Supabase). */
export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? ''
  return NextResponse.json({ siteKey })
}
