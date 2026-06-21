import 'server-only'

import { randomBytes } from 'crypto'

export function generateInviteToken(): string {
  return randomBytes(24).toString('base64url')
}

/** 0.0.0.0 is valid for the server to listen on, not for links in emails/browsers. */
export function normalizeAppOrigin(origin: string): string {
  try {
    const url = new URL(origin)
    if (url.hostname === '0.0.0.0') {
      url.hostname = 'localhost'
    }
    return url.origin.replace(/\/$/, '')
  } catch {
    return 'http://localhost:3000'
  }
}

function resolveAppOrigin(request?: Request): string {
  const envBase =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (envBase) {
    return normalizeAppOrigin(envBase)
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  if (request) {
    return normalizeAppOrigin(new URL(request.url).origin)
  }

  return 'http://localhost:3000'
}

export function buildInviteUrl(token: string, request?: Request): string {
  const origin = resolveAppOrigin(request)
  return `${origin}/invite/${token}`
}

export function buildWorkspaceJoinUrl(token: string, request?: Request): string {
  const origin = resolveAppOrigin(request)
  return `${origin}/join/${token}`
}

export function resolvePublicAppOrigin(request?: Request): string {
  return resolveAppOrigin(request)
}
