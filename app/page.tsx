/**
 * Root `/` is handled in middleware: signed-in → /auth/resolve, else → /login.
 * This page only appears briefly if the edge redirect is slow, or as a no-JS fallback.
 */
export default function RootEntryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-4 px-4">
      <div
        className="h-8 w-8 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">Opening DreamScale…</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm">
        Not moving?{' '}
        <a href="/login" className="font-medium text-[#005DFF] underline underline-offset-2">
          Continue to sign in
        </a>
        {' · '}
        <a href="/auth/resolve" className="font-medium text-[#005DFF] underline underline-offset-2">
          I&apos;m already signed in
        </a>
      </p>
    </div>
  )
}
