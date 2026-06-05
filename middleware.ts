import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/landing(.*)',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  // PayFast ITN — no Clerk session; verified in route handler
  '/api/payfast/itn(.*)',
  // Billing + post-checkout (PayFast return may arrive before session refresh)
  '/billing(.*)',
  // The data proxy enforces its own Clerk auth + per-user scoping in the handler and
  // also serves signed-out public inserts (e.g. landing-page email capture), so it must
  // not be blocked by middleware (which renders 404 for unauthenticated requests).
  '/api/db(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
