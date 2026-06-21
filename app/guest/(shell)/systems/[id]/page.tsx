'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'
import { SystemDetailView } from '@/components/systems/SystemDetailView'
import type { BusinessSystem } from '@/components/systems/SystemBuilder'

function normalizeSystem(raw: BusinessSystem & { lastAnalyzed?: string | Date }): BusinessSystem {
  return {
    ...raw,
    lastAnalyzed:
      typeof raw.lastAnalyzed === 'string'
        ? new Date(raw.lastAnalyzed)
        : raw.lastAnalyzed instanceof Date
          ? raw.lastAnalyzed
          : new Date(),
  }
}

export default function GuestSystemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const systemId = typeof params.id === 'string' ? params.id : ''
  const { session } = useGuestWorkspace()
  const [system, setSystem] = useState<BusinessSystem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.inviteToken || !systemId) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/guest/systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteToken: session.inviteToken }),
        })
        if (!res.ok) {
          setSystem(null)
          return
        }
        const data = await res.json()
        const raw = Array.isArray(data.systems) ? data.systems : []
        const found = raw.find((s: BusinessSystem) => s.id === systemId)
        setSystem(found ? normalizeSystem(found) : null)
      } catch {
        setSystem(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [session?.inviteToken, systemId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#39d2c0]" />
      </div>
    )
  }

  if (!system) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">System not found in this workspace.</p>
        <Button variant="outline" onClick={() => router.push('/guest/systems')}>
          Back to Systems
        </Button>
      </div>
    )
  }

  return (
    <SystemDetailView
      system={system}
      readOnly
      backLabel="Back to Systems"
      onBack={() => router.push('/guest/systems')}
    />
  )
}
