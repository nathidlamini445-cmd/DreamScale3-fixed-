'use client'

import { Compass, Flag, MapPin, Target } from 'lucide-react'
import {
  STRATEGIC_PHASES,
  assignStrategicPhase,
  type StrategicPhaseId,
} from '@/lib/roadmap/strategic-phases'
import { cn } from '@/lib/utils'

export type StrategicFocusItem = {
  id: string
  title: string
  description: string
  questionCount: number
  systemCount: number
  active?: boolean
}

type Props = {
  items: StrategicFocusItem[]
  onSelectItem?: (id: string) => void
  businessName?: string
}

export function StrategicFocusJourney({ items, onSelectItem, businessName }: Props) {
  if (!items.length) return null

  const phasedItems: Record<StrategicPhaseId, (StrategicFocusItem & { globalIndex: number })[]> = {
    clarify: [],
    design: [],
    execute: [],
  }
  items.forEach((item, index) => {
    const phase = assignStrategicPhase(index, items.length)
    phasedItems[phase].push({ ...item, globalIndex: index })
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-amber-50/30 via-white to-indigo-50/40 p-6 shadow-sm dark:border-gray-800 dark:from-amber-950/10 dark:via-gray-950 dark:to-indigo-950/20 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Strategic path
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            {businessName ? `${businessName}'s Strategic Focus` : 'Strategic Focus'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Clarify → Design → Execute. Click a pillar to see questions & systems.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>Strategic north star</span>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <svg
          className="pointer-events-none absolute left-8 right-8 top-[4.5rem] h-12 w-[calc(100%-4rem)]"
          viewBox="0 0 1000 48"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 0 28 C 150 4, 280 44, 420 24 S 620 4, 760 28 S 900 44, 1000 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 6"
            className="text-amber-300/80 dark:text-indigo-700"
          />
        </svg>

        <div className="relative grid grid-cols-3 gap-6">
          {STRATEGIC_PHASES.map((phase) => (
            <StrategicPhaseColumn
              key={phase.id}
              phase={phase}
              items={phasedItems[phase.id]}
              onSelectItem={onSelectItem}
              layout="desktop"
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span>Start with clarity</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-rose-500" />
            <span>End with execution</span>
            <Flag className="h-4 w-4 text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:hidden">
        {STRATEGIC_PHASES.map((phase, phaseIndex) => (
          <div key={phase.id} className="relative">
            {phaseIndex > 0 && (
              <div
                className="absolute -top-3 left-5 h-3 w-0.5 bg-gradient-to-b from-amber-300 to-indigo-300 dark:from-amber-700 dark:to-indigo-700"
                aria-hidden
              />
            )}
            <StrategicPhaseColumn
              phase={phase}
              items={phasedItems[phase.id]}
              onSelectItem={onSelectItem}
              layout="mobile"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function StrategicPhaseColumn({
  phase,
  items,
  onSelectItem,
  layout,
}: {
  phase: (typeof STRATEGIC_PHASES)[number]
  items: (StrategicFocusItem & { globalIndex: number })[]
  onSelectItem?: (id: string) => void
  layout: 'desktop' | 'mobile'
}) {
  return (
    <div className={cn('relative', layout === 'desktop' ? 'min-h-[200px]' : '')}>
      <div className={cn('mb-4 rounded-xl border px-4 py-3', phase.border, phase.bg)}>
        <p className={cn('text-sm font-semibold', phase.accent)}>{phase.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{phase.subtitle}</p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs italic text-gray-400 dark:text-gray-500">No focus pillars here</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item.id)}
              className={cn(
                'group w-full rounded-xl border p-3 text-left transition-all',
                item.active
                  ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-400/30 dark:border-indigo-600 dark:bg-indigo-950/30'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    item.active
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-gray-300 bg-white text-gray-600 group-hover:border-amber-400 group-hover:text-amber-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  )}
                >
                  {item.globalIndex + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {item.questionCount} questions · {item.systemCount} systems
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
