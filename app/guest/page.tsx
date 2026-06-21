'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGuestWorkspaceSafe } from '@/lib/workspace/guest-context'

export default function GuestLandingPage() {
  const router = useRouter()
  const guest = useGuestWorkspaceSafe()

  useEffect(() => {
    if (!guest?.ready) return
    if (guest.session) {
      router.replace('/guest/dashboard')
    }
  }, [guest?.ready, guest?.session, router])

  if (!guest?.ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#005DFF]" />
      </div>
    )
  }

  if (guest.session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#005DFF]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center gap-4">
      <p className="text-slate-300">No guest workspace session. Use your invite link to join.</p>
      <Link href="/login">
        <Button variant="outline">DreamScale home</Button>
      </Link>
    </div>
  )
}
