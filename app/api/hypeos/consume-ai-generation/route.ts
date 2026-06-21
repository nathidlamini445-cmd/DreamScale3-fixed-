import { NextResponse } from 'next/server'
import { requireMonthlyQuota } from '@/lib/usage-quota/require-monthly'

/** Consume one free-tier Venture Quest AI task generation (Pro skips quota). */
export async function POST() {
  const result = await requireMonthlyQuota('venture_quest')
  if (result.error) return result.error
  return NextResponse.json({ ok: true })
}
