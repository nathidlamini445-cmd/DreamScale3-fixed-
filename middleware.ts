import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = new Set([
  '/api/auth',
  '/api/check-email',
  '/auth/callback',
  '/auth/resolve',
  '/login',
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

  let response = NextResponse.next({ request })

  // Add security headers to every response
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // NOTE: microphone is set to "*" rather than "(self)" because some Chrome/Vercel
  // custom-domain combinations were rejecting getUserMedia with NotAllowedError under
  // the stricter "(self)" policy, even though the user had granted permission in
  // Site Settings. "*" allows the mic for the document — equivalent to the default
  // when no Permissions-Policy is set, which is what makes localhost work.
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=*, geolocation=(self)')

  // Skip auth check for public routes and static assets
  if (isPublicRoute(pathname)) {
    return response
  }

  // For API routes, verify the Supabase session
  if (pathname.startsWith('/api/')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
