'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, Home, Plus, Target } from 'lucide-react'
import { getLevelFromPoints } from '@/lib/hypeos/points-system'
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
    <header className="flex items-center gap-4 border-b border-white/[0.06] bg-[#0a0f12] px-4 py-3 lg:px-6">
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-[#39d2c0]/30 hover:bg-white/[0.05] hover:text-white"
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
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-left text-sm text-white/80 transition-colors hover:border-[#39d2c0]/30 hover:bg-white/[0.05]"
            >
              <Target className="h-4 w-4 shrink-0 text-[#39d2c0]/80" />
              <span className="truncate">{goalTitle || 'Venture Quest'}</span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-white/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 border-white/10 bg-[#0f1419] text-white"
          >
            <DropdownMenuLabel className="text-xs text-white/50">
              {hasMultipleGoals ? 'Switch goal' : 'Your goal'}
            </DropdownMenuLabel>
            {goals.map((goal) => (
              <DropdownMenuItem
                key={goal.id}
                onClick={() => onGoalSelect?.(goal.id)}
                className={`cursor-pointer gap-2 ${
                  goal.isActive
                    ? 'bg-white/[0.08] text-white focus:bg-white/[0.1] focus:text-white'
                    : 'text-white/70 focus:bg-white/[0.06] focus:text-white'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{goal.title}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-white/40">
                  {goal.category}
                </span>
              </DropdownMenuItem>
            ))}
            {canAddGoal && onNewGoal && (
              <>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={onNewGoal}
                  className="cursor-pointer gap-2 text-[#39d2c0] focus:bg-white/[0.06] focus:text-[#39d2c0]"
                >
                  <Plus className="h-4 w-4" />
                  New goal
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <p className="min-w-0 flex-1 truncate text-sm text-white/50">
          {goalTitle || 'Venture Quest'}
        </p>
      )}

      <div className="flex shrink-0 items-center gap-5 text-xs text-white/40">
        <span>
          <span className="text-white/70">{streak}</span> day streak
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">
          <span className="text-white/70">{points}</span> pts
        </span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">
          Level <span className="text-white/70">{level}</span>
        </span>
      </div>
    </header>
  )
}
