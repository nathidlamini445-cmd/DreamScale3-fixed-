import type { NextRequest } from 'next/server'

/**
 * `0.0.0.0` is valid for servers to LISTEN on, but browsers cannot NAVIGATE to it
 * (Chrome: ERR_ADDRESS_INVALID). Normalize to a reachable host for redirects.
 */
function isUnreachableBindHost(hostname: string): boolean {
  return hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]'
}

/** Client: build redirectTo for OAuth (must match Supabase Redirect URL allowlist). */
export function oauthClientOrigin(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000'
  const { protocol, hostname, port } = window.location
  const host = isUnreachableBindHost(hostname) ? 'localhost' : hostname
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${host}${portSuffix}`
}

/** Server Route Handler: origins for Location headers after OAuth. */
export function oauthServerRedirectOrigin(request: NextRequest): string {
  const url = request.nextUrl
  if (!isUnreachableBindHost(url.hostname)) {
    return url.origin
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost && !forwardedHost.startsWith('0.0.0.0')) {
    const scheme = forwardedProto === 'https' ? 'https' : 'http'
    return `${scheme}://${forwardedHost}`
  }

  const hdr = request.headers.get('host') ?? ''
  if (hdr.length > 0 && !hdr.includes('0.0.0.0')) {
    const scheme = url.protocol === 'https:' ? 'https' : 'http'
    return `${scheme}://${hdr}`
  }

  const scheme = url.protocol === 'https:' ? 'https' : 'http'
  const portSuffix = url.port ? `:${url.port}` : scheme === 'http' ? ':3000' : ''
  return `${scheme}://localhost${portSuffix}`
}
