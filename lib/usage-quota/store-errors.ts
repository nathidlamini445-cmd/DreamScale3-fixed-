import { NextResponse } from 'next/server'

export type QuotaStoreFailureCode =
  | 'SERVICE_UNAVAILABLE'
  | 'SCHEMA_MISSING'
  | 'LOAD_FAILED'

export type QuotaLoadResult =
  | { ok: true; isPro: boolean; usage: import('./types').FreeUsageRecord }
  | { ok: false; code: QuotaStoreFailureCode }

const SCHEMA_HINT =
  'Free-tier limits are not active yet. Run supabase-free-usage-migration.sql in the Supabase SQL Editor, then try again.'

export function isMissingFreeUsageColumn(message: string | undefined): boolean {
  if (!message) return false
  const m = message.toLowerCase()
  return m.includes('free_usage') && (m.includes('does not exist') || m.includes('column'))
}

export function quotaStoreUnavailableResponse(
  code: QuotaStoreFailureCode
): NextResponse {
  const message =
    code === 'SCHEMA_MISSING'
      ? SCHEMA_HINT
      : 'Usage tracking is temporarily unavailable. Please try again in a moment.'

  return NextResponse.json(
    {
      error: message,
      code: 'QUOTA_STORE_UNAVAILABLE',
      storeCode: code,
    },
    { status: 503 }
  )
}
