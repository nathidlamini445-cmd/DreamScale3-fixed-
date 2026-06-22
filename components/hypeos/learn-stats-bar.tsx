'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, Home, Plus, Target } from 'lucide-react'
import { getLevelFromPoints } from '@/lib/hypeos/points-system'
import { vq } from '@/lib/hypeos/path-ui-theme'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type GoalPickerOption = {
  id: string
  title: string
  category: string
  isActive: boolean
}

type LearnStatsBarProps = {
  streak: number
  points: number
  goalTitle?: string
  goals?: GoalPickerOption[]
  onGoalSelect?: (goalId: string) => void
  onNewGoal?: () => void
  canAddGoal?: boolean
}

export default function LearnStatsBar({
  streak,
  points,
  goalTitle,
  goals = [],
  onGoalSelect,
  onNewGoal,
  canAddGoal = true,
}: LearnStatsBarProps) {
  const router = useRouter()
  const level = getLevelFromPoints(points).level
  const hasMultipleGoals = goals.length > 1
  const showGoalPicker = goals.length > 0 && onGoalSelect

  return (
    <header
      className={cn(
        'flex items-center gap-4 border-b px-4 py-3 lg:px-6',
        vq.surface,
        vq.border
      )}
    >
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
          vq.chipBtn
        )}
        title="Back to Home"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {showGoalPicker ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-sm transition-colors',
                vq.chipBtn
              )}
            >
              <Target className="h-4 w-4 shrink-0 text-[#39d2c0]/80" />
              <span className="truncate">{goalTitle || 'Venture Quest'}</span>
              <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0', vq.mutedFaint)} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={cn('w-72', vq.dropdown)}>
            <DropdownMenuLabel className={cn('text-xs', vq.muted)}>
              {hasMultipleGoals ? 'Switch goal' : 'Your goal'}
            </DropdownMenuLabel>
            {goals.map((goal) => (
              <DropdownMenuItem
                key={goal.id}
                onClick={() => onGoalSelect?.(goal.id)}
                className={cn(
                  'cursor-pointer gap-2',
                  goal.isActive
                    ? 'bg-gray-100 text-slate-900 focus:bg-gray-100 focus:text-slate-900 dark:bg-white/[0.08] dark:text-white dark:focus:bg-white/[0.1] dark:focus:text-white'
                    : 'text-slate-600 focus:bg-gray-50 focus:text-slate-900 dark:text-white/70 dark:focus:bg-white/[0.06] dark:focus:text-white'
                )}
              >
                <span className="min-w-0 flex-1 truncate">{goal.title}</span>
                <span className={cn('shrink-0 text-[10px] uppercase tracking-wide', vq.mutedFaint)}>
                  {goal.category}
                </span>
              </DropdownMenuItem>
            ))}
            {canAddGoal && onNewGoal && (
              <>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-white/10" />
                <DropdownMenuItem
                  onClick={onNewGoal}
                  className="cursor-pointer gap-2 text-[#39d2c0] focus:bg-gray-50 focus:text-[#39d2c0] dark:focus:bg-white/[0.06] dark:focus:text-[#39d2c0]"
                >
                  <Plus className="h-4 w-4" />
                  New goal
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <p className={cn('min-w-0 flex-1 truncate text-sm', vq.muted)}>
          {goalTitle || 'Venture Quest'}
        </p>
      )}

      <div className={cn('flex shrink-0 items-center gap-5 text-xs', vq.mutedFaint)}>
        <span>
          <span className={cn(vq.body)}>{streak}</span> day streak
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">
          <span className={cn(vq.body)}>{points}</span> pts
        </span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">
          Level <span className={cn(vq.body)}>{level}</span>
        </span>
      </div>
    </header>
  )
}
