'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { vq } from '@/lib/hypeos/path-ui-theme'
import type { Quest } from '@/lib/hypeos/quest-system'
import type { Skill } from '@/lib/hypeos/skill-tree'
import { canUnlockSkill } from '@/lib/hypeos/skill-tree'
import type { UserSkillStats } from '@/lib/hypeos/sync-skill-tree'
import type { PathItem } from '@/lib/hypeos/skill-path-milestones'

type LearnRightPanelProps = {
  quests: Quest[]
  activeSkill: Skill | null
  nextItem: PathItem | null
  userStats: UserSkillStats
  masteredSkills: string[]
  onCompletePathStep?: (skillId: string, stepLabel?: string) => void
  onContinuePath?: () => void
}

export default function LearnRightPanel({
  quests,
  activeSkill,
  nextItem,
  userStats,
  masteredSkills,
  onCompletePathStep,
  onContinuePath,
}: LearnRightPanelProps) {
  const router = useRouter()
  const dailyQuests = quests.slice(0, 3)

  const nextSkillId =
    nextItem?.kind === 'task'
      ? nextItem.skill.id
      : nextItem?.kind === 'skill'
        ? nextItem.skill.id
        : null

  const handleContinuePath = () => {
    if (onContinuePath) {
      onContinuePath()
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

  return (
    <aside
      className={cn(
        'hidden w-[248px] shrink-0 flex-col gap-5 overflow-y-auto border-l p-5 xl:flex',
        vq.surface,
        vq.border
      )}
    >
      {nextLabel && (
        <div className="border-l-2 border-[#39d2c0] pl-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#39d2c0]/80">
            Up next
          </p>
          <p className={cn('mt-1 text-sm font-medium leading-snug', vq.body)}>{nextLabel}</p>
          <button
            type="button"
            onClick={handleContinuePath}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-[#39d2c0] hover:text-[#39d2c0]/80"
          >
            {onContinuePath || onCompletePathStep ? 'View task & continue' : 'Go to daily focus'}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {activeSkill ? (
        <div className={cn('space-y-3 border-t pt-5', vq.border)}>
          <p className={cn('text-[10px] font-medium uppercase tracking-[0.18em]', vq.mutedFaint)}>
            Selected
          </p>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg',
                'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]'
              )}
            >
              <span className="opacity-60">{activeSkill.icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className={cn('text-sm font-medium', vq.body)}>{activeSkill.name}</h3>
              <p className={cn('mt-0.5 text-xs', vq.mutedFaint)}>
                {activeSkill.difficulty} · {activeSkill.estimatedTime}
              </p>
            </div>
          </div>

          <p className={cn('text-xs leading-relaxed', vq.muted)}>{activeSkill.description}</p>

          {activeSkill.unlocked && !activeSkill.mastered && (
            <div className="space-y-1.5">
              <div className={cn('flex justify-between text-xs', vq.mutedFaint)}>
                <span>Progress</span>
                <span>{Math.round(activeSkill.progress)}%</span>
              </div>
              <div className={cn('h-px overflow-hidden', vq.track)}>
                <div
                  className="h-full bg-[#39d2c0]/70"
                  style={{ width: `${Math.max(activeSkill.progress, 2)}%` }}
                />
              </div>
              <p className={cn('text-[11px]', vq.mutedFaint)}>
                {activeSkill.tasksCompleted}/{activeSkill.requiredTasks} tasks logged
              </p>
            </div>
          )}

          {!activeSkill.unlocked && (
            <ul className={cn('space-y-1 text-xs', vq.muted)}>
              {canUnlockSkill(activeSkill, {
                completedTasks: userStats.completedTasks,
                totalPoints: userStats.totalPoints,
                masteredSkills,
              }).reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-1.5">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0 opacity-50" />
                  {reason}
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="ghost"
            disabled={!activeSkill.unlocked || activeSkill.mastered}
            onClick={handleContinuePath}
            className={cn(
              'h-9 w-full rounded-lg text-sm font-medium',
              activeSkill.unlocked && !activeSkill.mastered
                ? vq.accentBtn
                : 'bg-gray-100 text-slate-400 dark:bg-white/[0.04] dark:text-white/30'
            )}
          >
            {activeSkill.mastered
              ? 'Completed'
              : activeSkill.unlocked
                ? 'Continue'
                : 'Locked'}
          </Button>
        </div>
      ) : (
        <p className={cn('border-t pt-5 text-xs', vq.border, vq.mutedFaint)}>
          Select a milestone on your path
        </p>
      )}

      <div className={cn('border-t pt-5', vq.border)}>
        <h3 className={cn('mb-3 text-[10px] font-medium uppercase tracking-[0.18em]', vq.mutedFaint)}>
          Daily quests
        </h3>
        <div className="space-y-3">
          {dailyQuests.length === 0 ? (
            <p className={cn('text-xs', vq.mutedFaint)}>No quests yet</p>
          ) : (
            dailyQuests.map((quest) => {
              const pct = Math.min((quest.current / quest.target) * 100, 100)
              return (
                <div key={quest.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className={cn('truncate', vq.muted)}>{quest.title}</span>
                    <span className={cn('shrink-0', vq.mutedFaint)}>
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                  <div className={cn('h-px overflow-hidden', vq.track)}>
                    <div
                      className="h-full bg-[#39d2c0]/60"
                      style={{
                        width: `${Math.max(pct, quest.completed ? 100 : 2)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}
