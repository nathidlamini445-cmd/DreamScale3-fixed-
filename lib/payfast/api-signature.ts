import crypto from 'crypto'
import { getPayfastPassphrase, getPayfastReceiver } from '@/lib/payfast/config'
import { encodePayfastValue } from '@/lib/payfast/validate-itn'

export function buildPayfastApiSignature(fields: Record<string, string>): string {
  const keys = Object.keys(fields)
    .filter((k) => k !== 'signature')
    .sort()

  let output = ''
  for (const key of keys) {
    const val = fields[key]
    if (val === '' || val === undefined) continue
    output += `${key}=${encodePayfastValue(String(val))}&`
  }

  const paramString = output.endsWith('&') ? output.slice(0, -1) : output
  return crypto.createHash('md5').update(paramString).digest('hex')
}

/** Headers for PayFast REST API (subscriptions, refunds, etc.). */
export function createPayfastApiHeaders(
  extraFields: Record<string, string> = {}
): Record<string, string> | null {
  const merchantId = getPayfastReceiver()
  const passphrase = getPayfastPassphrase()
  if (!merchantId || !passphrase) return null

  const timestamp = new Date().toISOString().split('.')[0]
  const base: Record<string, string> = {
    'merchant-id': merchantId,
    version: 'v1',
    timestamp,
    ...extraFields,
  }

  const signature = buildPayfastApiSignature({ ...base, passphrase })

  return {
    'merchant-id': base['merchant-id'],
    version: base.version,
    timestamp: base.timestamp,
    signature,
    'Content-Type': 'application/json',
  }
}
