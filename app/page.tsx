'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

const CLERK_LOAD_TIMEOUT_MS = 4000

/**
 * Root `/` — redirect signed-in users to the dashboard; signed-out users to login.
 * Also shown briefly while Clerk resolves (branded loader).
 */
export default function RootEntryPage() {
  const { isLoaded, user } = useUser()
  const didRedirect = useRef(false)

  useEffect(() => {
    if (didRedirect.current) return

    const go = (path: string) => {
      if (didRedirect.current) return
      didRedirect.current = true
      // Hard navigation avoids client-router stalls on some production hosts.
      window.location.replace(path)
    }

    if (isLoaded) {
      go(user ? '/dashboard' : '/login')
      return
    }

    const timeout = window.setTimeout(() => {
      console.warn('[RootEntry] Clerk did not finish loading — sending user to /login')
      go('/login')
    }, CLERK_LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [isLoaded, user])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 93 255 / 0.12) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/Logo.png"
            alt=""
            width={88}
            height={88}
            className="object-contain drop-shadow-md dark:opacity-95"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              DreamScale
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user ? 'Opening your dashboard…' : 'Taking you to sign in…'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            className="h-11 w-11 rounded-full border-2 border-[#005DFF] border-t-transparent animate-spin"
            role="status"
            aria-label="Loading"
          />
          <p className="text-xs text-slate-500 dark:text-slate-500">
            This only takes a moment
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Need something else?</span>
          <a
            href="/dashboard"
            className="font-medium text-[#005DFF] hover:text-[#0046cc] underline underline-offset-2"
          >
            Dashboard
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <a
            href="/login"
            className="font-medium text-[#005DFF] hover:text-[#0046cc] underline underline-offset-2"
          >
            Sign in
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <a
            href="/landing"
            className="font-medium text-[#39d2c0] hover:text-[#2fb8a8] underline underline-offset-2"
          >
            About DreamScale
          </a>
        </div>
      </div>
    </div>
  )
}
