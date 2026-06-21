'use client'

import { useEffect, useState } from 'react'
import { Settings, Loader2, AlertCircle } from 'lucide-react'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'
import SystemHealthDashboard from '@/components/systems/SystemHealthDashboard'
import type { BusinessSystem } from '@/components/systems/SystemBuilder'

export default function GuestSystemsPage() {
  const { session } = useGuestWorkspace()
  const [systems, setSystems] = useState<BusinessSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.inviteToken) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/guest/systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteToken: session.inviteToken }),
        })
        if (!res.ok) {
          setError('Could not load workspace systems.')
          setSystems([])
          return
        }
        const data = await res.json()
        const raw = Array.isArray(data.systems) ? data.systems : []
        const withDates = raw.map((sys: BusinessSystem & { lastAnalyzed?: string }) => ({
          ...sys,
          lastAnalyzed: sys.lastAnalyzed ? new Date(sys.lastAnalyzed) : new Date(),
        }))
        setSystems(withDates)
      } catch {
        setError('Connection failed. Make sure the dev server is running.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [session?.inviteToken])

  const healthyCount = systems.filter((s) => s.status === 'healthy').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#39d2c0]" />
          Systems
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Operational systems shared from {session?.workspaceName}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading systems…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      ) : systems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-gray-600 dark:text-slate-300">
          The workspace owner has not built any systems yet. When they add systems in DreamScale,
          they will appear here for guests.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-500 dark:text-slate-400">Total systems</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{systems.length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400">Healthy</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{healthyCount}</p>
            </div>
          </div>
          <SystemHealthDashboard
            systems={systems}
            readOnly
            viewDetailsBasePath="/guest/systems"
          />
        </>
      )}
    </div>
  )
}
