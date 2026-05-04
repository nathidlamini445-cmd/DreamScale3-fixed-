import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitise a user-supplied URL before using it as an href.
 * Returns `'#'` for unparseable input or non-http(s)/mailto/tel schemes,
 * which prevents `javascript:` / `data:` XSS injection from chat
 * attachments, AI markdown links, etc.
 */
const SAFE_HREF_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])
export function safeHref(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return '#'
  const trimmed = input.trim()
  // Allow protocol-relative and absolute paths (same-origin) without parsing.
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
  try {
    // Use a base so relative URLs parse predictably; we still re-check protocol.
    const url = new URL(trimmed, 'https://example.invalid')
    if (!SAFE_HREF_SCHEMES.has(url.protocol)) return '#'
    return trimmed
  } catch {
    return '#'
  }
}
