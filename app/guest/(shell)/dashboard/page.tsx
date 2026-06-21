'use client'

import { useRouter } from 'next/navigation'
import { Users, Zap, Atom, ArrowRight, Settings, Search } from 'lucide-react'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

export default function GuestDashboardPage() {
  const router = useRouter()
  const { session, roleLabel, teammates } = useGuestWorkspace()

  const cards = [
    {
      title: 'Systems',
      description: 'View operational systems the workspace owner has built.',
      href: '/guest/systems',
      icon: Settings,
    },
    {
      title: 'Competitive Intelligence',
      description: 'Run competitor and market analyses inside this workspace.',
      href: '/guest/intelligence',
      icon: Search,
    },
    {
      title: 'People',
      description: 'See who is in this workspace and update your guest profile.',
      href: '/guest/team',
      icon: Users,
    },
    {
      title: 'Discover',
      description: 'Browse ideas, talks, and resources for your business.',
      href: '/guest/discover',
      icon: Zap,
    },
    {
      title: 'Bizora AI',
      description: 'Chat with Bizora in this workspace context.',
      href: '/guest/bizora',
      icon: Atom,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome, {session?.displayName}
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mt-2 max-w-2xl mx-auto sm:mx-0">
          You are in <strong>{session?.workspaceName}</strong> as a guest{' '}
          <span className="text-[#005DFF] font-medium">{roleLabel}</span>. Use the sidebar to
          explore systems, competitive intelligence, and the rest of the workspace.
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
          {teammates.length} people in this workspace
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-[#005DFF]/40 transition-colors group text-left w-full"
            >
              <Icon className="w-5 h-5 text-[#005DFF] mb-3" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{card.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{card.description}</p>
              <span className="inline-flex items-center gap-1 text-sm text-[#005DFF] mt-4 group-hover:gap-2 transition-all">
                Open
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
