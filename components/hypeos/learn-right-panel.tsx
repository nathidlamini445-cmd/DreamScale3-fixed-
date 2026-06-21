'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
    <aside className="hidden w-[248px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-white/[0.06] bg-[#0a0f12] p-5 xl:flex">
      {/* What's next */}
      {nextLabel && (
        <div className="border-l-2 border-[#39d2c0] pl-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#39d2c0]/70">
            Up next
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-white/90">
            {nextLabel}
          </p>
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

      {/* Active skill detail */}
      {activeSkill ? (
        <div className="space-y-3 border-t border-white/[0.06] pt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
            Selected
          </p>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-lg">
              <span className="opacity-60">{activeSkill.icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white/90">{activeSkill.name}</h3>
              <p className="mt-0.5 text-xs text-white/40">
                {activeSkill.difficulty} · {activeSkill.estimatedTime}
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-white/45">
            {activeSkill.description}
          </p>

          {activeSkill.unlocked && !activeSkill.mastered && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/40">
                <span>Progress</span>
                <span>{Math.round(activeSkill.progress)}%</span>
              </div>
              <div className="h-px overflow-hidden bg-white/[0.06]">
                <div
                  className="h-full bg-[#39d2c0]/70"
                  style={{ width: `${Math.max(activeSkill.progress, 2)}%` }}
                />
              </div>
              <p className="text-[11px] text-white/30">
                {activeSkill.tasksCompleted}/{activeSkill.requiredTasks} tasks logged
              </p>
            </div>
          )}

          {!activeSkill.unlocked && (
            <ul className="space-y-1 text-xs text-white/40">
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
                ? 'bg-[#39d2c0] text-[#0a0f12] hover:bg-[#39d2c0]/90'
                : 'bg-white/[0.04] text-white/30'
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
        <p className="border-t border-white/[0.06] pt-5 text-xs text-white/35">
          Select a milestone on your path
        </p>
      )}

      {/* Daily quests */}
      <div className="border-t border-white/[0.06] pt-5">
        <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
          Daily quests
        </h3>
        <div className="space-y-3">
          {dailyQuests.length === 0 ? (
            <p className="text-xs text-white/30">No quests yet</p>
          ) : (
            dailyQuests.map((quest) => {
              const pct = Math.min((quest.current / quest.target) * 100, 100)
              return (
                <div key={quest.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-white/55">{quest.title}</span>
                    <span className="shrink-0 text-white/30">
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                  <div className="h-px overflow-hidden bg-white/[0.06]">
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
