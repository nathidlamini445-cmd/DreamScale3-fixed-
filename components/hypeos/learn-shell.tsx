'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Dumbbell, Target, Home } from 'lucide-react'
import LearnSidebar from '@/components/hypeos/learn-sidebar'
import LearnStatsBar, {
  type GoalPickerOption,
} from '@/components/hypeos/learn-stats-bar'
import LearnRightPanel from '@/components/hypeos/learn-right-panel'
import SkillPathMap from '@/components/hypeos/skill-path-map'
import PathMilestoneModal from '@/components/hypeos/path-milestone-modal'
import { cn } from '@/lib/utils'
import { vq } from '@/lib/hypeos/path-ui-theme'
import type { Quest } from '@/lib/hypeos/quest-system'
import type { Skill, SkillTree } from '@/lib/hypeos/skill-tree'
import type { UserSkillStats } from '@/lib/hypeos/sync-skill-tree'
import type {
  PathItem,
  PathMilestone,
  PathTaskInput,
  PathUserContext,
} from '@/lib/hypeos/skill-path-milestones'

type LearnShellProps = {
  user: {
    goalTitle?: string
    goalTarget?: string
    category?: string
    currentStreak?: number
    hypePoints?: number
  }
  skillTree: SkillTree
  quests: Quest[]
  tasks: PathTaskInput[]
  userStats: UserSkillStats
  masteredSkills: string[]
  recommendedSkillId?: string | null
  onViewModeChange?: (mode: 'quests' | 'default' | 'goals') => void
  onCompletePathStep?: (skillId: string, stepLabel?: string, stepXp?: number) => void
  goals?: GoalPickerOption[]
  onGoalSelect?: (goalId: string) => void
  onNewGoal?: () => void
  canAddGoal?: boolean
  isPro?: boolean
  onUpgradeRequest?: () => void
}

export default function LearnShell({
  user,
  skillTree,
  quests,
  tasks,
  userStats,
  masteredSkills,
  recommendedSkillId,
  onViewModeChange,
  onCompletePathStep,
  goals,
  onGoalSelect,
  onNewGoal,
  canAddGoal,
  isPro = true,
  onUpgradeRequest,
}: LearnShellProps) {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)
  const [nextItem, setNextItem] = useState<PathItem | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<PathMilestone | null>(
    null
  )
  const [selectedMilestoneSkill, setSelectedMilestoneSkill] = useState<Skill | null>(
    null
  )
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const scrollRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{
    dragging: boolean
    startY: number
    startTop: number
  }>({ dragging: false, startY: 0, startTop: 0 })

  const handleNavigate = useCallback(
    (id: 'learn' | 'practice' | 'quests' | 'rewards' | 'progress') => {
      if (id === 'quests') onViewModeChange?.('quests')
    },
    [onViewModeChange]
  )

  const router = useRouter()

  const nextSkillId =
    nextItem?.kind === 'task'
      ? nextItem.skill.id
      : nextItem?.kind === 'skill'
        ? nextItem.skill.id
        : null

  const userContext = useMemo<PathUserContext | null>(
    () =>
      user.goalTitle?.trim()
        ? {
            goalTitle: user.goalTitle,
            category: user.category || 'business',
            goalTarget: user.goalTarget,
          }
        : null,
    [user.goalTitle, user.category, user.goalTarget]
  )

  const handleContinuePath = () => {
    if (nextItem?.kind === 'task') {
      setSelectedMilestone(nextItem.milestone)
      setSelectedMilestoneSkill(nextItem.skill)
      setMilestoneModalOpen(true)
      return
    }
    if (nextSkillId && onCompletePathStep) {
      onCompletePathStep(nextSkillId)
      return
    }
    router.push('/venture-quest/daily')
  }

  const nextLabel =
    nextItem?.kind === 'task'
      ? nextItem.milestone.label
      : nextItem?.kind === 'skill'
        ? nextItem.skill.name
        : null

  const mobileNav = [
    {
      id: 'home' as const,
      icon: Home,
      label: 'Home',
      action: () => router.push('/dashboard'),
    },
    { id: 'learn' as const, icon: BookOpen, label: 'Venture Quest', action: () => {} },
    {
      id: 'practice' as const,
      icon: Dumbbell,
      label: 'Daily',
      action: () => router.push('/venture-quest/daily'),
    },
    {
      id: 'quests' as const,
      icon: Target,
      label: 'Quests',
      action: () => onViewModeChange?.('quests'),
    },
  ]

  return (
    <div data-hypeos-shell className={cn('flex h-screen overflow-hidden', vq.shell)}>
      <LearnSidebar active="learn" onNavigate={handleNavigate} />

      <div className="flex min-w-0 flex-1 flex-col">
        <LearnStatsBar
          streak={user.currentStreak || 0}
          points={user.hypePoints || 0}
          goalTitle={user.goalTitle}
          goals={goals}
          onGoalSelect={onGoalSelect}
          onNewGoal={onNewGoal}
          canAddGoal={canAddGoal}
        />

        <div className="flex min-h-0 flex-1">
          <main
            data-hypeos-main
            ref={(el) => {
              scrollRef.current = el
            }}
            className="min-w-0 grow-[1.75] basis-0 overflow-y-auto px-4 py-6 sm:px-10 lg:px-14 lg:py-10"
            style={{ overscrollBehavior: 'contain' }}
            onPointerDown={(e) => {
              // Drag-to-scroll (like grabbing a trackpad) for long paths.
              // Only activate for left click / primary touch.
              if (e.pointerType === 'mouse' && e.button !== 0) return
              const el = scrollRef.current
              if (!el) return
              dragRef.current = {
                dragging: true,
                startY: e.clientY,
                startTop: el.scrollTop,
              }
              try {
                el.setPointerCapture?.(e.pointerId)
              } catch {}
            }}
            onPointerMove={(e) => {
              const el = scrollRef.current
              if (!el) return
              if (!dragRef.current.dragging) return
              const dy = e.clientY - dragRef.current.startY
              el.scrollTop = dragRef.current.startTop - dy
            }}
            onPointerUp={(e) => {
              dragRef.current.dragging = false
              const el = scrollRef.current
              try {
                el?.releasePointerCapture?.(e.pointerId)
              } catch {}
            }}
            onPointerCancel={() => {
              dragRef.current.dragging = false
            }}
          >
            <SkillPathMap
              variant="learn"
              skillTree={skillTree}
              userStats={userStats}
              tasks={tasks}
              userContext={userContext}
              recommendedSkillId={recommendedSkillId}
              onActiveSkillChange={setActiveSkill}
              onNextItemChange={setNextItem}
              onMilestoneSelect={(milestone, skill) => {
                setSelectedMilestone(milestone)
                setSelectedMilestoneSkill(skill)
                setMilestoneModalOpen(true)
                requestAnimationFrame(() => {
                  const node = document.getElementById(
                    `path-milestone-${milestone.id}`
                  )
                  node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                })
              }}
              isPro={isPro}
              onUpgradeRequest={onUpgradeRequest}
            />

            {nextLabel && (
              <div className="mt-8 border-l-2 border-[#39d2c0] pl-4 xl:hidden">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#39d2c0]/70">
                  Up next
                </p>
                <p className={cn('mt-1 text-sm', vq.body)}>{nextLabel}</p>
                <button
                  type="button"
                  onClick={handleContinuePath}
                  className="mt-2 text-xs font-medium text-[#39d2c0]"
                >
                  {onCompletePathStep ? 'Continue' : 'Go to daily focus'}
                </button>
              </div>
            )}

            {activeSkill && (
              <div className={cn('mt-6 space-y-3 border-t pt-5 xl:hidden', vq.border)}>
                <p className={cn('text-[10px] font-medium uppercase tracking-[0.18em]', vq.mutedFaint)}>
                  Selected
                </p>
                <h3 className={cn('text-sm font-medium', vq.body)}>{activeSkill.name}</h3>
                <p className={cn('text-xs', vq.muted)}>{activeSkill.description}</p>
                <button
                  type="button"
                  disabled={!activeSkill.unlocked || activeSkill.mastered}
                  onClick={handleContinuePath}
                  className={cn(
                    'h-9 w-full rounded-lg text-sm font-medium',
                    vq.accentBtn,
                    'disabled:bg-gray-100 disabled:text-slate-400 dark:disabled:bg-white/[0.04] dark:disabled:text-white/30'
                  )}
                >
                  {activeSkill.mastered
                    ? 'Completed'
                    : activeSkill.unlocked
                      ? 'Continue'
                      : 'Locked'}
                </button>
              </div>
            )}

            <div className={cn('mt-6 border-t pt-5 xl:hidden', vq.border)}>
              <h3 className={cn('mb-3 text-[10px] font-medium uppercase tracking-[0.18em]', vq.mutedFaint)}>
                Daily quests
              </h3>
              <div className="space-y-3">
                {quests.slice(0, 2).map((q) => (
                  <div key={q.id}>
                    <div className={cn('mb-1 flex justify-between text-xs', vq.muted)}>
                      <span>{q.title}</span>
                      <span>
                        {q.current}/{q.target}
                      </span>
                    </div>
                    <div className={cn('h-px', vq.track)}>
                      <div
                        className="h-full bg-[#39d2c0]/60"
                        style={{
                          width: `${Math.min((q.current / q.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <LearnRightPanel
            quests={quests}
            activeSkill={activeSkill}
            nextItem={nextItem}
            userStats={userStats}
            masteredSkills={masteredSkills}
            onCompletePathStep={onCompletePathStep}
            onContinuePath={handleContinuePath}
          />
        </div>

        <nav
          data-hypeos-nav
          className={cn('flex border-t px-2 py-2 lg:hidden', vq.surface, vq.border)}
        >
          {mobileNav.map((item) => {
            const Icon = item.icon
            const active = item.id === 'learn'
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px]',
                  active ? 'text-[#39d2c0]' : vq.navInactive
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <PathMilestoneModal
        open={milestoneModalOpen}
        onOpenChange={setMilestoneModalOpen}
        milestone={selectedMilestone}
        skill={selectedMilestoneSkill}
        currentStreak={user.currentStreak}
        onComplete={
          selectedMilestone?.isNext &&
          !selectedMilestone.completed &&
          selectedMilestoneSkill &&
          onCompletePathStep
            ? () =>
                onCompletePathStep(
                  selectedMilestoneSkill.id,
                  selectedMilestone?.label,
                  selectedMilestone?.points
                )
            : undefined
        }
      />
    </div>
  )
}
