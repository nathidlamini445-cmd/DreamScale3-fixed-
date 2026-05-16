import type { NextRequest } from 'next/server'

/**
 * `0.0.0.0` is valid for servers to LISTEN on, but browsers cannot NAVIGATE to it
 * (Chrome: ERR_ADDRESS_INVALID). Normalize to a reachable host for redirects.
 */
function isUnreachableBindHost(hostname: string): boolean {
  return hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]'
}

function normalizePublicSiteUrl(raw: string): string {
  return raw.trim().replace(/\/$/, '')
}

/** Client: build redirectTo for OAuth (must match Supabase Redirect URL allowlist). */
export function oauthClientOrigin(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000'
  const { protocol, hostname, port } = window.location
  const host = isUnreachableBindHost(hostname) ? 'localhost' : hostname
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${host}${portSuffix}`
}

/**
 * Server Route Handler: origins for `Location` headers after OAuth.
 *
 * On Vercel, prefer `NEXT_PUBLIC_SITE_URL` (e.g. https://app.dreamscale.co.za) so
 * redirects match your custom domain and session cookies attach to the right host.
 * Fallback: `x-forwarded-*`, then `VERCEL_URL`, then `Host`.
 */
export function oauthServerRedirectOrigin(request: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    return normalizePublicSiteUrl(siteUrl)
  }

  const url = request.nextUrl
  if (!isUnreachableBindHost(url.hostname)) {
    return url.origin
  }

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost && !forwardedHost.startsWith('0.0.0.0')) {
    return `${forwardedProto}://${forwardedHost}`
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl && !vercelUrl.includes('localhost')) {
    return `https://${vercelUrl}`
  }

  const hdr = request.headers.get('host') ?? ''
  if (hdr.length > 0 && !hdr.includes('0.0.0.0')) {
    return `${forwardedProto}://${hdr}`
  }

  const scheme = url.protocol === 'https:' ? 'https' : 'http'
  const portSuffix = url.port ? `:${url.port}` : scheme === 'http' ? ':3000' : ''
  return `${scheme}://localhost${portSuffix}`
}
