/**
 * Legacy entry point for “Continue with Google” outside the Clerk `<SignIn />` UI.
 * OAuth is configured in the Clerk Dashboard; this sends users to the app sign-in page.
 */
export async function signInWithGoogle(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
