import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = new Set([
  '/api/auth',
  '/api/check-email',
  '/auth/callback',
  '/auth/update-password',
  '/auth/resolve',
  '/login',
  '/landing',
  '/onboarding',
  '/signup',
])

function isPublicRoute(pathname: string): boolean {
  for (const route of PUBLIC_ROUTES) {
    if (pathname.startsWith(route)) return true
  }
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/') {
    return true
  }
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname)) {
    return true
  }
  return false
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bypass immediately: never run Supabase or extra work on Next internals/static
  // (avoids ChunkLoadError timeouts on /_next/static/chunks/* in dev)
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|woff2?|map)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fast server redirect for `/` — avoids client-only root that waits on getSession()
  // (fixes "Loading forever" on app root when hydration or Supabase is slow).
  if (pathname === '/') {
    if (!supabaseUrl || !supabaseAnonKey) {
      const res = NextResponse.redirect(new URL('/login?error=missing_supabase_env', request.url), 307)
      applySecurityHeaders(res)
      return res
    }

    const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = []

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    })

    let user: { id: string } | null = null
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      user = u ?? null
    } catch {
      user = null
    }

    const dest = user ? '/auth/resolve' : '/login'
    const res = NextResponse.redirect(new URL(dest, request.url), 307)
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<NextResponse['cookies']['set']>[2])
    })
    applySecurityHeaders(res)
    return res
  }

  let response = NextResponse.next({ request })

  // Add security headers to every response
  applySecurityHeaders(response)

  // Skip auth check for public routes and static assets
  if (isPublicRoute(pathname)) {
    return response
  }

  // For API routes, verify the Supabase session
  if (pathname.startsWith('/api/')) {
    try {
      const supabase = createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      )
    }
  }

  // Refresh Supabase session for page routes (keeps cookies fresh)
  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    await supabase.auth.getUser()
  } catch {
    // Non-critical — page will handle auth state client-side
  }

  return response
}

export const config = {
  matcher: [
    // Exclude all Next assets and common static files (path-to-regexp; early return in middleware also guards /_next/)
    '/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|woff2?|map)$).*)',
  ],
}
