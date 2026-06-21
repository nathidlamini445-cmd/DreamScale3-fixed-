'use client'

import { useEffect } from 'react'
import { Search, Cpu, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import DreamPulseWizard from '@/components/dreampulse/DreamPulseWizard'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

export default function GuestIntelligencePage() {
  const { session, role } = useGuestWorkspace()
  const isViewer = role === 'viewer'

  useEffect(() => {
    if (isViewer) return

    document.documentElement.setAttribute('data-dreampulse-page', 'true')
    document.body.setAttribute('data-dreampulse-page', 'true')

    return () => {
      document.documentElement.removeAttribute('data-dreampulse-page')
      document.body.removeAttribute('data-dreampulse-page')
    }
  }, [isViewer])

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <Search className="w-6 h-6 text-[#2563eb]" />
          Competitive Intelligence
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Analyze competitors and market positioning for {session?.workspaceName}
        </p>
        <div className="mt-4 flex justify-center sm:justify-start">
          <Link
            href="/venture-quest"
            className="group inline-flex items-center gap-2 rounded-lg border border-[#39d2c0]/30 bg-[#39d2c0]/10 px-4 py-2.5 text-sm font-medium text-[#0d9488] transition-all hover:border-[#39d2c0]/50 hover:bg-[#39d2c0]/15 dark:text-[#39d2c0]"
          >
            <Cpu className="h-4 w-4" />
            Venture Quest
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {isViewer ? (
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 p-5 text-sm text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
          Your role is <strong>Viewer</strong> — you can browse the workspace but cannot run new
          analyses. Ask the workspace owner to change your role to Member or Admin if you need
          access.
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl">
          <DreamPulseWizard
            analyzeEndpoint="/api/guest/intelligence/analyze"
            analyzeBodyExtras={
              session?.inviteToken ? { inviteToken: session.inviteToken } : undefined
            }
            savedAnalysesStorageKey="guestDreamPulseSavedAnalyses"
          />
        </div>
      )}
    </div>
  )
}
