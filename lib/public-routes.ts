/** Auth, marketing, and Clerk sign-in/sign-up paths that must not wait on global auth loading. */
export function isAuthEntryPath(pathname: string | null | undefined): boolean {
  if (!pathname) return true
  if (pathname === '/' || pathname === '/landing' || pathname === '/onboarding') return true
  if (pathname === '/login' || pathname.startsWith('/login/')) return true
  if (pathname === '/signup' || pathname.startsWith('/signup/')) return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname === '/feedback' || pathname.startsWith('/feedback/')) return true
  if (pathname === '/billing' || pathname.startsWith('/billing/')) return true
  return false
}
