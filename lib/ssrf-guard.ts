import 'server-only'
import { lookup } from 'dns/promises'

/**
 * SSRF (Server-Side Request Forgery) guard.
 *
 * Validates that a user-supplied URL is safe to fetch from a server-side
 * route. Blocks:
 *   - non-http/https schemes (`javascript:`, `file:`, `gopher:`, `data:`, ...)
 *   - hostnames that resolve to private / loopback / link-local / metadata
 *     IPs (cloud metadata IMDS at 169.254.169.254 etc., RFC1918 ranges)
 *   - localhost / .internal hostnames
 *
 * Use:
 *   const safe = await assertPublicHttpUrl(userUrl)
 *   if (!safe.ok) return NextResponse.json({ error: safe.reason }, { status: 400 })
 *   await fetch(safe.url, { signal: AbortSignal.timeout(15_000) })
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata',
])

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const part of parts) {
    const v = Number(part)
    if (!Number.isInteger(v) || v < 0 || v > 255) return null
    n = (n << 8) | v
  }
  return n >>> 0
}

function isPrivateIPv4(ip: string): boolean {
  const num = ipv4ToNumber(ip)
  if (num == null) return false
  // 0.0.0.0/8
  if ((num & 0xff000000) === 0x00000000) return true
  // 10.0.0.0/8
  if ((num & 0xff000000) === 0x0a000000) return true
  // 100.64.0.0/10 (CGNAT)
  if ((num & 0xffc00000) === 0x64400000) return true
  // 127.0.0.0/8 loopback
  if ((num & 0xff000000) === 0x7f000000) return true
  // 169.254.0.0/16 link-local (cloud metadata)
  if ((num & 0xffff0000) === 0xa9fe0000) return true
  // 172.16.0.0/12
  if ((num & 0xfff00000) === 0xac100000) return true
  // 192.0.0.0/24
  if ((num & 0xffffff00) === 0xc0000000) return true
  // 192.168.0.0/16
  if ((num & 0xffff0000) === 0xc0a80000) return true
  // 198.18.0.0/15 benchmarking
  if ((num & 0xfffe0000) === 0xc6120000) return true
  // 224.0.0.0/4 multicast
  if ((num & 0xf0000000) === 0xe0000000) return true
  // 240.0.0.0/4 reserved
  if ((num & 0xf0000000) === 0xf0000000) return true
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // fc00::/7 ULA
  if (lower.startsWith('fe80')) return true // link-local
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped — re-check the IPv4 portion
    const v4 = lower.slice('::ffff:'.length)
    return isPrivateIPv4(v4)
  }
  return false
}

export type SsrfCheck =
  | { ok: true; url: URL }
  | { ok: false; reason: string }

export async function assertPublicHttpUrl(input: string): Promise<SsrfCheck> {
  if (!input || typeof input !== 'string') {
    return { ok: false, reason: 'URL is required' }
  }

  // Add scheme if missing.
  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input) ? input : `https://${input}`

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, reason: 'Invalid URL' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https URLs are allowed' }
  }

  const hostname = parsed.hostname.toLowerCase()
  if (!hostname) return { ok: false, reason: 'Invalid hostname' }
  if (BLOCKED_HOSTNAMES.has(hostname)) return { ok: false, reason: 'Hostname is not allowed' }
  if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localhost')) {
    return { ok: false, reason: 'Hostname is not allowed' }
  }

  // If the hostname is already a literal IP, validate directly.
  // Strip IPv6 brackets the URL parser keeps in `hostname`.
  const literal = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(literal)) {
    if (isPrivateIPv4(literal)) return { ok: false, reason: 'IP address is not allowed' }
    return { ok: true, url: parsed }
  }
  if (literal.includes(':')) {
    if (isPrivateIPv6(literal)) return { ok: false, reason: 'IP address is not allowed' }
    return { ok: true, url: parsed }
  }

  // Resolve DNS (both A and AAAA) and reject if any record is private.
  try {
    const records = await lookup(hostname, { all: true, verbatim: true })
    if (!records.length) return { ok: false, reason: 'Hostname did not resolve' }
    for (const r of records) {
      if (r.family === 4 && isPrivateIPv4(r.address)) {
        return { ok: false, reason: 'Hostname resolves to a private IP' }
      }
      if (r.family === 6 && isPrivateIPv6(r.address)) {
        return { ok: false, reason: 'Hostname resolves to a private IP' }
      }
    }
  } catch {
    return { ok: false, reason: 'Hostname did not resolve' }
  }

  return { ok: true, url: parsed }
}
