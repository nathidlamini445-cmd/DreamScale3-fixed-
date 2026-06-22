'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { vq } from '@/lib/hypeos/path-ui-theme'
import type { Skill, SkillBranch, SkillTree } from '@/lib/hypeos/skill-tree'
import type { UserSkillStats } from '@/lib/hypeos/sync-skill-tree'
import {
  canAccessVentureQuestBranch,
  VENTURE_QUEST_FREE_BRANCH_ID,
} from '@/lib/hypeos/venture-quest-plan'
import {
  buildPathItems,
  type PathItem,
  type PathMilestone,
  type PathTaskInput,
  type PathUserContext,
} from '@/lib/hypeos/skill-path-milestones'
import {
  detectGoalPathProfile,
  getGoalPathProfileLabel,
} from '@/lib/hypeos/personalized-path-tasks'

const ACCENT = '#39d2c0'

type SkillPathMapProps = {
  skillTree: SkillTree
  userStats: UserSkillStats
  tasks?: PathTaskInput[]
  recommendedSkillId?: string | null
  variant?: 'classic' | 'learn'
  onActiveSkillChange?: (skill: Skill | null) => void
  onNextItemChange?: (item: PathItem | null) => void
  onCompletePathStep?: (skillId: string) => void
  onMilestoneSelect?: (milestone: PathMilestone, skill: Skill) => void
  userContext?: PathUserContext | null
  isPro?: boolean
  onUpgradeRequest?: () => void
}

function offsetForIndex(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'left' : 'right'
}

function PathConnector({
  completed,
  tall,
}: {
  completed: boolean
  tall?: boolean
}) {
  return (
    <div
      className={cn(
        'mx-auto w-px',
        tall ? 'h-10' : 'h-6',
        completed ? 'bg-[#39d2c0]/50' : 'bg-gray-200 dark:bg-white/[0.08]'
      )}
      aria-hidden
    />
  )
}

function SkillNode({
  skill,
  align,
  isCurrent,
  isRecommended,
  onSelect,
}: {
  skill: Skill
  align: 'left' | 'right'
  isCurrent: boolean
  isRecommended: boolean
  onSelect: () => void
}) {
  const locked = !skill.unlocked
  const mastered = skill.mastered
  const active = skill.unlocked && !skill.mastered

  return (
    <div
      className={cn(
        'flex w-full max-w-md',
        align === 'left' ? 'justify-start pl-6 sm:pl-12' : 'justify-end pr-6 sm:pr-12'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={locked}
        className="group flex max-w-[300px] items-center gap-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39d2c0]/50"
      >
        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all',
            locked && 'border-gray-200 bg-transparent text-gray-300 dark:border-white/10 dark:text-white/25',
            mastered && 'border-[#39d2c0]/40 bg-[#39d2c0]/10 text-[#39d2c0]',
            active &&
              !isCurrent &&
              'border-gray-300 bg-gray-50 text-slate-700 dark:border-white/20 dark:bg-white/[0.03] dark:text-white/80',
            isCurrent &&
              'border-[#39d2c0] bg-[#39d2c0]/10 text-slate-800 shadow-[0_0_0_4px_rgba(57,210,192,0.12)] dark:text-white'
          )}
        >
          {locked ? (
            <Lock className="h-4 w-4" strokeWidth={1.5} />
          ) : mastered ? (
            <Check className="h-4 w-4" strokeWidth={2} />
          ) : (
            <span className="text-lg opacity-70">{skill.icon}</span>
          )}
          {isRecommended && active && (
            <span className={cn('absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#39d2c0] ring-2', vq.ring)} />
          )}
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              locked ? 'text-slate-400 dark:text-white/30' : 'text-slate-800 dark:text-white/90'
            )}
          >
            {skill.name}
          </p>
          <p className={cn('mt-0.5 text-[11px]', vq.mutedFaint)}>
            {skill.tasksCompleted}/{skill.requiredTasks} tasks · {skill.estimatedTime}
          </p>
        </div>
      </button>
    </div>
  )
}

function TaskMilestone({
  label,
  completed,
  locked,
  isNext,
  align,
  onSelect,
}: {
  label: string
  completed: boolean
  locked: boolean
  isNext: boolean
  align: 'left' | 'right'
  onSelect?: () => void
}) {
  const canOpen = !locked && !!onSelect

  return (
    <div
      className={cn(
        'flex w-full max-w-md',
        align === 'left' ? 'justify-start pl-12 sm:pl-20' : 'justify-end pr-12 sm:pr-20'
      )}
    >
      <button
        type="button"
        disabled={!canOpen}
        onClick={canOpen ? onSelect : undefined}
        className={cn(
          'flex max-w-[280px] items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors',
          isNext && 'border-[#39d2c0]/40 bg-[#39d2c0]/[0.06]',
          !isNext && completed && 'border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]',
          !isNext && !completed && !locked && 'border-gray-200 bg-white dark:border-white/8 dark:bg-transparent',
          locked && 'border-gray-100 opacity-40 dark:border-white/5',
          canOpen && 'cursor-pointer hover:border-[#39d2c0]/50 hover:bg-[#39d2c0]/[0.08]'
        )}
      >
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            completed && 'border-[#39d2c0]/50 bg-[#39d2c0]/20',
            isNext && !completed && 'border-[#39d2c0] bg-transparent',
            !completed && !isNext && 'border-gray-300 bg-transparent dark:border-white/15'
          )}
        >
          {completed ? (
            <Check className="h-2.5 w-2.5 text-[#39d2c0]" strokeWidth={3} />
          ) : isNext ? (
            <span className="h-1.5 w-1.5 rounded-full bg-[#39d2c0]" />
          ) : null}
        </div>
        <div className="min-w-0">
          {isNext && (
            <p className="text-[9px] font-medium uppercase tracking-widest text-[#39d2c0]">
              Up next
            </p>
          )}
          <p
            className={cn(
              'text-[11px] leading-snug',
              completed
                ? cn(vq.mutedFaint, 'line-through')
                : isNext
                  ? 'text-slate-800 dark:text-white/90'
                  : vq.muted
            )}
          >
            {label}
          </p>
        </div>
      </button>
    </div>
  )
}

function BranchTabs({
  branches,
  activeId,
  onSelect,
  isPro = true,
  onLockedBranch,
}: {
  branches: SkillBranch[]
  activeId: string
  onSelect: (id: string) => void
  isPro?: boolean
  onLockedBranch?: () => void
}) {
  return (
    <div className={cn('mb-8 flex gap-6 overflow-x-auto border-b pb-px scrollbar-none', vq.border)}>
      {branches.map((b) => {
        const selected = activeId === b.id
        const locked = !canAccessVentureQuestBranch(b.id, isPro)
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              if (locked) {
                onLockedBranch?.()
                return
              }
              onSelect(b.id)
            }}
            className={cn(
              'shrink-0 border-b-2 pb-2.5 text-sm transition-colors flex items-center gap-1',
              selected
                ? cn('border-[#39d2c0] font-medium', vq.heading)
                : locked
                  ? cn('border-transparent cursor-not-allowed', vq.mutedFaint)
                  : cn('border-transparent', vq.navInactive)
            )}
          >
            <span className="mr-1.5 opacity-60">{b.icon}</span>
            {b.name}
            {locked && <Lock className="h-3 w-3 opacity-60" />}
          </button>
        )
      })}
    </div>
  )
}

export default function SkillPathMap({
  skillTree,
  userStats: _userStats,
  tasks = [],
  recommendedSkillId,
  variant = 'learn',
  onActiveSkillChange,
  onNextItemChange,
  onCompletePathStep,
  onMilestoneSelect,
  userContext,
  isPro = true,
  onUpgradeRequest,
}: SkillPathMapProps) {
  const router = useRouter()
  const [branchId, setBranchId] = useState(
    skillTree.branches.find((b) => b.id === VENTURE_QUEST_FREE_BRANCH_ID)?.id ??
      skillTree.branches[0]?.id ??
      'sales'
  )
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const branch = useMemo(
    () => skillTree.branches.find((b) => b.id === branchId) ?? skillTree.branches[0],
    [skillTree, branchId]
  )

  const pathProfileLabel = useMemo(() => {
    if (!userContext?.goalTitle?.trim()) return null
    return getGoalPathProfileLabel(detectGoalPathProfile(userContext))
  }, [userContext])

  const pathItems = useMemo(
    () => (branch ? buildPathItems(branch.skills, tasks, userContext) : []),
    [branch, tasks, userContext]
  )

  const activeSkill =
    selectedSkill ??
    branch?.skills.find((s) => s.id === recommendedSkillId) ??
    branch?.skills.find((s) => s.unlocked && !s.mastered) ??
    null

  const nextItem = useMemo(() => {
    for (const item of pathItems) {
      if (item.kind === 'task' && item.milestone.isNext) return item
    }
    for (const item of pathItems) {
      if (item.kind === 'skill' && item.skill.unlocked && !item.skill.mastered) {
        return item
      }
    }
    return null
  }, [pathItems])

  useEffect(() => {
    onActiveSkillChange?.(activeSkill)
  }, [activeSkill, onActiveSkillChange])

  useEffect(() => {
    onNextItemChange?.(nextItem)
  }, [nextItem, onNextItemChange])

  if (!branch) return null

  const progressPct = Math.round(skillTree.overallProgress)
  const branchProgress = Math.round(branch.progress)

  if (variant !== 'learn') {
    return (
      <div className={cn('space-y-4', vq.shell)}>
        <BranchTabs branches={skillTree.branches} activeId={branchId} onSelect={setBranchId} />
        <p className={cn('text-sm', vq.muted)}>{skillTree.masteredSkills} of {skillTree.totalSkills} skills</p>
      </div>
    )
  }

  return (
    <div data-hypeos-path-map className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#39d2c0]/80">
          Your path
        </p>
        <h1 className={cn('mt-1 text-xl font-medium tracking-tight sm:text-2xl', vq.heading)}>
          {branch.name}
        </h1>
        {pathProfileLabel && (
          <p className={cn('mt-1 text-sm', vq.muted)}>{pathProfileLabel} track</p>
        )}
        <div className={cn('mt-3 flex items-center gap-4 text-xs', vq.mutedFaint)}>
          <span>{skillTree.masteredSkills}/{skillTree.totalSkills} milestones</span>
          <span>·</span>
          <span>{progressPct}% overall</span>
        </div>
        <div className={cn('mt-3 h-px w-full overflow-hidden rounded-full', vq.track)}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(branchProgress, 2)}%`,
              backgroundColor: ACCENT,
            }}
          />
        </div>
      </div>

      {!isPro && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#39d2c0]/20 bg-[#39d2c0]/[0.06] px-4 py-3">
          <p className={cn('text-xs text-slate-600 dark:text-white/70')}>
            <span className="font-medium text-[#39d2c0]">Free plan:</span> Sales Mastery path
            only · 3 path steps/day · 2 AI task generations/month
          </p>
          <Link href="/billing" className={cn('shrink-0 rounded-md px-3 py-1.5 text-xs font-medium', vq.accentBtn)}>
            Upgrade to Pro
          </Link>
        </div>
      )}

      <BranchTabs
        branches={skillTree.branches}
        activeId={branchId}
        isPro={isPro}
        onLockedBranch={onUpgradeRequest}
        onSelect={(id) => {
          setBranchId(id)
          setSelectedSkill(null)
        }}
      />

      <div className="space-y-0 pb-40 pt-4">
        {pathItems.map((item, index) => {
          const align = offsetForIndex(item.globalIndex)
          const prev = pathItems[index - 1]
          const prevDone =
            index === 0
              ? false
              : prev?.kind === 'skill'
                ? prev.skill.mastered
                : prev?.kind === 'task'
                  ? prev.milestone.completed
                  : false

          return (
            <div
              key={item.kind === 'skill' ? item.skill.id : item.milestone.id}
              id={
                item.kind === 'task'
                  ? `path-milestone-${item.milestone.id}`
                  : undefined
              }
            >
              {index > 0 && (
                <PathConnector
                  completed={prevDone}
                  tall={item.kind === 'skill'}
                />
              )}

              {item.kind === 'skill' ? (
                <SkillNode
                  skill={item.skill}
                  align={align}
                  isCurrent={activeSkill?.id === item.skill.id}
                  isRecommended={item.skill.id === recommendedSkillId}
                  onSelect={() => {
                    setSelectedSkill(item.skill)
                    if (
                      item.skill.unlocked &&
                      !item.skill.mastered &&
                      item.skill.id === recommendedSkillId
                    ) {
                      router.push('/venture-quest/daily')
                    }
                  }}
                />
              ) : (
                <TaskMilestone
                  label={item.milestone.label}
                  completed={item.milestone.completed}
                  locked={item.milestone.locked}
                  isNext={item.milestone.isNext}
                  align={align}
                  onSelect={() => onMilestoneSelect?.(item.milestone, item.skill)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
