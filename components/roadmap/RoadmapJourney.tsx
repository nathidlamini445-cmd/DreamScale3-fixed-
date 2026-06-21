'use client'

import { CheckCircle2, Flag, MapPin, Rocket } from 'lucide-react'
import {
  ROADMAP_PHASES,
  assignSuggestionPhase,
  type RoadmapPhaseId,
} from '@/lib/roadmap/phases'
import { cn } from '@/lib/utils'

export type RoadmapJourneyItem = {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: boolean
}

type Props = {
  items: RoadmapJourneyItem[]
  onSelectItem?: (id: string) => void
  businessName?: string
}

export function RoadmapJourney({ items, onSelectItem, businessName }: Props) {
  if (!items.length) return null

  // Map items to phases using original list order
  const phasedItems: Record<RoadmapPhaseId, (RoadmapJourneyItem & { globalIndex: number })[]> = {
    week: [],
    month: [],
    quarter: [],
  }
  items.forEach((item, index) => {
    const phase = assignSuggestionPhase(index, items.length, item.priority)
    phasedItems[phase].push({ ...item, globalIndex: index })
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 shadow-sm dark:border-gray-800 dark:from-slate-950 dark:via-gray-950 dark:to-blue-950/20 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Your journey
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            {businessName ? `${businessName}'s Roadmap` : 'Visual Roadmap'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Follow the path from this week → this quarter. Click a milestone to jump to details.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5" />
          <span>You are here</span>
        </div>
      </div>

      {/* Desktop: horizontal journey with SVG path */}
      <div className="relative hidden lg:block">
        <svg
          className="pointer-events-none absolute left-8 right-8 top-[4.5rem] h-12 w-[calc(100%-4rem)]"
          viewBox="0 0 1000 48"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 0 24 C 120 8, 200 40, 320 24 S 520 8, 640 24 S 820 40, 1000 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 6"
            className="text-gray-300 dark:text-gray-700"
          />
        </svg>

        <div className="relative grid grid-cols-3 gap-6">
          {ROADMAP_PHASES.map((phase) => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              items={phasedItems[phase.id]}
              onSelectItem={onSelectItem}
              layout="desktop"
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Rocket className="h-4 w-4 text-violet-500" />
          <span>Goal: sustainable growth</span>
          <Flag className="ml-2 h-4 w-4 text-amber-500" />
        </div>
      </div>

      {/* Mobile / tablet: vertical journey */}
      <div className="space-y-6 lg:hidden">
        {ROADMAP_PHASES.map((phase, phaseIndex) => (
          <div key={phase.id} className="relative">
            {phaseIndex > 0 && (
              <div
                className="absolute -top-3 left-5 h-3 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-800"
                aria-hidden
              />
            )}
            <PhaseColumn
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

function PhaseColumn({
  phase,
  items,
  onSelectItem,
  layout,
}: {
  phase: (typeof ROADMAP_PHASES)[number]
  items: (RoadmapJourneyItem & { globalIndex: number })[]
  onSelectItem?: (id: string) => void
  layout: 'desktop' | 'mobile'
}) {
  return (
    <div className={cn('relative', layout === 'desktop' ? 'min-h-[220px]' : '')}>
      <div
        className={cn(
          'mb-4 rounded-xl border px-4 py-3',
          phase.border,
          phase.bg
        )}
      >
        <p className={cn('text-sm font-semibold', phase.accent)}>{phase.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{phase.subtitle}</p>
      </div>

      <div className={cn('space-y-3', layout === 'desktop' ? 'pl-1' : '')}>
        {items.length === 0 ? (
          <p className="text-xs italic text-gray-400 dark:text-gray-500">No milestones in this phase</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item.id)}
              className={cn(
                'group w-full rounded-xl border p-3 text-left transition-all',
                item.completed
                  ? 'border-green-300/60 bg-green-50/50 opacity-80 dark:border-green-800 dark:bg-green-950/20'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    item.completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    item.globalIndex + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'line-clamp-2 text-sm font-medium leading-snug',
                      item.completed
                        ? 'text-green-700 line-through dark:text-green-400'
                        : 'text-gray-900 dark:text-white'
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.category}
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
