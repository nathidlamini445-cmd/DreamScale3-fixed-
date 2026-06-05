import crypto from 'crypto'
import { getPayfastItnValidateUrl, getPayfastPassphrase } from '@/lib/payfast/config'

export function parsePayfastItnBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body)
  const data: Record<string, string> = {}
  params.forEach((value, key) => {
    data[key] = value
  })
  return data
}

export function encodePayfastValue(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, '+')
}

export function buildPayfastSignatureString(
  data: Record<string, string>,
  passphrase?: string
): string {
  const keys = Object.keys(data)
    .filter((k) => k !== 'signature')
    .sort()

  let output = ''
  for (const key of keys) {
    const val = data[key]
    if (val === '' || val === undefined) continue
    output += `${key}=${encodePayfastValue(String(val))}&`
  }

  let paramString = output.endsWith('&') ? output.slice(0, -1) : output

  if (passphrase) {
    paramString += `&passphrase=${encodePayfastValue(passphrase)}`
  }

  return paramString
}

export function verifyPayfastSignature(
  data: Record<string, string>,
  passphrase?: string
): boolean {
  const received = data.signature
  if (!received) return false

  const paramString = buildPayfastSignatureString(data, passphrase)
  const expected = crypto.createHash('md5').update(paramString).digest('hex')
  return expected === received
}

export async function confirmPayfastItnWithServer(
  data: Record<string, string>
): Promise<boolean> {
  const validateUrl = getPayfastItnValidateUrl()
  const body = new URLSearchParams(data).toString()

  const res = await fetch(validateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const text = (await res.text()).trim()
  return text === 'VALID'
}

export async function validatePayfastItn(
  data: Record<string, string>,
  options?: { skipServerConfirm?: boolean }
): Promise<{ ok: boolean; reason?: string }> {
  const passphrase = getPayfastPassphrase()

  if (!verifyPayfastSignature(data, passphrase)) {
    return { ok: false, reason: 'invalid_signature' }
  }

  if (!options?.skipServerConfirm) {
    const serverOk = await confirmPayfastItnWithServer(data)
    if (!serverOk) {
      return { ok: false, reason: 'server_validation_failed' }
    }
  }

  return { ok: true }
}
