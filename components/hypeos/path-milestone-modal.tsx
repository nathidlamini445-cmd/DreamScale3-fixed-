'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Clock, Flame, Star, Lock } from 'lucide-react'
import type { PathMilestone } from '@/lib/hypeos/skill-path-milestones'
import type { Skill } from '@/lib/hypeos/skill-tree'

type PathMilestoneModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  milestone: PathMilestone | null
  skill: Skill | null
  currentStreak?: number
  onComplete?: () => void
}

const MAX_STEPS_SHOWN = 4

export default function PathMilestoneModal({
  open,
  onOpenChange,
  milestone,
  skill,
  currentStreak = 0,
  onComplete,
}: PathMilestoneModalProps) {
  if (!milestone || !skill) return null

  const canComplete =
    milestone.isNext && !milestone.completed && !milestone.locked && !!onComplete

  const steps = milestone.steps ?? []
  const visibleSteps = steps.slice(0, MAX_STEPS_SHOWN)
  const hiddenStepCount = Math.max(0, steps.length - MAX_STEPS_SHOWN)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed top-[max(1rem,3vh)] left-[50%] flex max-h-[min(88vh,calc(100vh-2rem))] w-full max-w-[calc(100%-1.5rem)] translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden border-white/10 bg-[#0f1419] p-0 text-white sm:max-w-lg"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-4">
          <DialogHeader>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#39d2c0]/80">
              {skill.name}
            </p>
            <DialogTitle className="text-left text-lg font-medium text-white">
              {milestone.label}
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-white/55">
              {milestone.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/45">
            {milestone.estimatedTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {milestone.estimatedTime}
              </span>
            )}
            {milestone.points != null && (
              <span className="inline-flex items-center gap-1 text-[#39d2c0]">
                <Star className="h-3.5 w-3.5" />
                +{milestone.points} XP
              </span>
            )}
            {currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-orange-400">
                <Flame className="h-3.5 w-3.5" />
                {currentStreak} day streak
              </span>
            )}
          </div>

          {visibleSteps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/35">
                How to complete
              </p>
              <ol className="list-decimal space-y-2 pl-4 text-sm text-white/70">
                {visibleSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {hiddenStepCount > 0 && (
                <p className="text-xs text-white/40">
                  +{hiddenStepCount} more tip{hiddenStepCount === 1 ? '' : 's'} in Bizora
                  or daily focus
                </p>
              )}
            </div>
          )}

          {milestone.completed && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#39d2c0]/30 bg-[#39d2c0]/10 px-3 py-2 text-sm text-[#39d2c0]">
              <Check className="h-4 w-4 shrink-0" />
              You completed this step
            </div>
          )}

          {!milestone.completed && !milestone.isNext && !milestone.locked && (
            <p className="mt-4 text-xs text-white/40">
              Finish the previous step on your path first, then come back to this one.
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-white/10 bg-[#0f1419] px-6 py-4 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/60 hover:text-white"
          >
            Close
          </Button>
          {canComplete ? (
            <Button
              onClick={() => {
                onComplete()
                onOpenChange(false)
              }}
              className="bg-[#39d2c0] text-[#0a0f12] hover:bg-[#39d2c0]/90"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark complete
            </Button>
          ) : !milestone.completed && milestone.locked ? (
            <Button disabled className="bg-white/5 text-white/30">
              <Lock className="mr-2 h-4 w-4" />
              Locked
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
