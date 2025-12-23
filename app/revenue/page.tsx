"use client"

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import SystemBuilder from '@/components/systems/SystemBuilder'
import { Settings } from 'lucide-react'
import { useSessionSafe } from '@/lib/session-context'
import { BusinessSystem } from '@/components/systems/SystemBuilder'

export default function RevenuePage() {
  const sessionContext = useSessionSafe()
  const [systems, setSystems] = useState<BusinessSystem[]>([])
  const [totalSystems, setTotalSystems] = useState(0)

  useEffect(() => {
    // Load from localStorage first (persistent storage)
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('systembuilder:systems') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        setSystems(parsed)
        setTotalSystems(parsed.length)
        return
      }
    } catch (e) {
      console.warn('Failed to load systems from localStorage', e)
    }

    // Fallback to session
    if (sessionContext?.sessionData?.systems?.systems) {
      const loadedSystems = sessionContext.sessionData.systems.systems
      setSystems(loadedSystems)
      setTotalSystems(loadedSystems.length)
    }
  }, [sessionContext?.sessionData?.systems?.systems])

  const healthyCount = systems.filter(s => s.status === 'healthy').length

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header */}
          <div className="bg-white dark:bg-slate-950 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
                    System<span className="text-gray-600 dark:text-gray-400">Builder AI</span>
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Build custom operational systems for your business with AI-powered frameworks
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Systems</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {totalSystems} {totalSystems === 1 ? 'system' : 'systems'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Healthy</p>
                    <p className="text-base font-medium text-green-600 dark:text-green-400">
                      {healthyCount} {healthyCount === 1 ? 'system' : 'systems'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SystemBuilder />
          </div>
        </main>
      </div>
    </div>
  )
}

