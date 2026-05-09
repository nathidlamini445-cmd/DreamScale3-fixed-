'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const PASSWORD_MIN = 6

/** Shown after user follows the password-reset link from email (Supabase redirects here). */
export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [checking, setChecking] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    let subscriptionReturn: ReturnType<
      typeof supabase.auth.onAuthStateChange
    >['data']['subscription'] | null = null

    const hasSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return !!session
    }

    ;(async () => {
      if (await hasSession()) {
        if (!cancelled) {
          setRecoveryReady(true)
          setChecking(false)
        }
        return
      }

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return
        if (
          session &&
          (event === 'PASSWORD_RECOVERY' ||
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'INITIAL_SESSION')
        ) {
          setRecoveryReady(true)
          setChecking(false)
          setFatal(null)
        }
      })
      subscriptionReturn = data.subscription

      await new Promise((r) => setTimeout(r, 900))
      if (!cancelled && (await hasSession())) {
        setRecoveryReady(true)
        setChecking(false)
        return
      }

      await new Promise((r) => setTimeout(r, 2200))
      if (cancelled) return
      if (await hasSession()) {
        setRecoveryReady(true)
        setChecking(false)
        return
      }

      setFatal(
        'This reset link may be expired or invalid. Open the newest email from us, or go to the login page and request another reset.'
      )
      setChecking(false)
    })()

    return () => {
      cancelled = true
      subscriptionReturn?.unsubscribe()
    }
  }, [supabase])

  const submit = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }
    if (!password || password.length < PASSWORD_MIN) {
      alert(`Use at least ${PASSWORD_MIN} characters.`)
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        alert(error.message)
        setSubmitting(false)
        return
      }
      router.replace('/auth/resolve')
    } catch {
      alert('Could not update password. Try again.')
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="relative h-24 w-24 shrink-0">
          <Image src="/Logo.png" alt="DreamScale" fill className="object-contain" priority />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#005DFF]" aria-hidden />
          <p className="text-sm text-gray-600">Confirming reset link...</p>
        </div>
      </div>
    )
  }

  if (fatal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="relative h-24 w-24 shrink-0">
          <Image src="/Logo.png" alt="DreamScale" fill className="object-contain" priority />
        </div>
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center space-y-4">
          <p className="text-gray-800">{fatal}</p>
          <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/login')}>
            Back to login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
      <div className="relative h-24 w-24 shrink-0 mb-8">
        <Image src="/Logo.png" alt="DreamScale" fill className="object-contain" priority />
      </div>
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
          <p className="text-sm text-gray-600">
            Signed in temporarily for recovery. After saving, we&apos;ll take you through sign-in routing.
          </p>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-12"
              disabled={submitting || !recoveryReady}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#005DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005DFF] disabled:opacity-35"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={submitting || !recoveryReady}
              tabIndex={0}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pr-12"
              disabled={submitting || !recoveryReady}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#005DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005DFF] disabled:opacity-35"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              disabled={submitting || !recoveryReady}
              tabIndex={0}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <Button
          type="button"
          className="w-full h-12 bg-[#005DFF] hover:bg-[#0048CC] text-white"
          disabled={submitting || !recoveryReady}
          onClick={() => void submit()}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save new password'
          )}
        </Button>
        <p className="text-xs text-center text-gray-500">
          Redirect URL <code className="text-[11px]">/auth/update-password</code> must be allowed in Supabase Authentication
          redirect URLs for your deployment origin.
        </p>
      </div>
    </div>
  )
}
