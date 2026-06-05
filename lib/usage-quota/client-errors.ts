import type { QuotaDeniedPayload } from './types'

export class QuotaExceededError extends Error {
  readonly payload: QuotaDeniedPayload

  constructor(payload: QuotaDeniedPayload) {
    super(payload.error)
    this.name = 'QuotaExceededError'
    this.payload = payload
  }
}

export function parseQuotaError(body: unknown): QuotaDeniedPayload | null {
  if (!body || typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  if (o.code === 'QUOTA_EXCEEDED') {
    return {
      error: typeof o.error === 'string' ? o.error : 'Usage limit reached',
      code: 'QUOTA_EXCEEDED',
      usage: o.usage as QuotaDeniedPayload['usage'],
      bucket: typeof o.bucket === 'string' ? o.bucket : undefined,
    }
  }
  if (o.code === 'QUOTA_STORE_UNAVAILABLE') {
    return {
      error:
        typeof o.error === 'string'
          ? o.error
          : 'Usage limits are not available right now.',
      code: 'QUOTA_STORE_UNAVAILABLE',
      bucket: 'store',
      storeCode: typeof o.storeCode === 'string' ? o.storeCode : undefined,
    }
  }
  return null
}

export function isQuotaMessage(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('free messages') ||
    m.includes('wait 8 hours') ||
    m.includes('file uploads') ||
    m.includes('ai runs this month') ||
    m.includes('usage limit') ||
    m.includes('free-usage-migration') ||
    m.includes('quota_store')
  )
}
