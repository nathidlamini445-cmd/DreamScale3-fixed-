'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

/** Password and security are managed in the Clerk user account (not Supabase Auth). */
export default function UpdatePasswordPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        Password updates are handled through your Clerk account. Use the user menu or sign-in flows, or open
        your Clerk-hosted account settings from the production deployment.
      </p>
      <Button type="button" onClick={() => router.replace('/dashboard')}>
        Back to dashboard
      </Button>
    </div>
  )
}
