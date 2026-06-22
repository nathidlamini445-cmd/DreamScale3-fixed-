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
import { cn } from '@/lib/utils'
import { vq } from '@/lib/hypeos/path-ui-theme'
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
        className={cn(
          'fixed top-[max(1rem,3vh)] left-[50%] flex max-h-[min(88vh,calc(100vh-2rem))] w-full max-w-[calc(100%-1.5rem)] translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-lg',
          vq.modal
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-4">
          <DialogHeader>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#39d2c0]/80">
              {skill.name}
            </p>
            <DialogTitle className={cn('text-left text-lg font-medium', vq.heading)}>
              {milestone.label}
            </DialogTitle>
            <DialogDescription className={cn('text-left text-sm', vq.muted)}>
              {milestone.description}
            </DialogDescription>
          </DialogHeader>

          <div className={cn('mt-4 flex flex-wrap gap-3 text-xs', vq.muted)}>
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
              <span className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400">
                <Flame className="h-3.5 w-3.5" />
                {currentStreak} day streak
              </span>
            )}
          </div>

          {visibleSteps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className={cn('text-[10px] font-medium uppercase tracking-widest', vq.mutedFaint)}>
                How to complete
              </p>
              <ol className={cn('list-decimal space-y-2 pl-4 text-sm', vq.body)}>
                {visibleSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {hiddenStepCount > 0 && (
                <p className={cn('text-xs', vq.mutedFaint)}>
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
            <p className={cn('mt-4 text-xs', vq.mutedFaint)}>
              Finish the previous step on your path first, then come back to this one.
            </p>
          )}
        </div>

        <DialogFooter
          className={cn(
            'shrink-0 gap-2 border-t px-6 py-4 sm:justify-end',
            vq.border,
            vq.surface
          )}
        >
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
          >
            Close
          </Button>
          {canComplete ? (
            <Button
              onClick={() => {
                onComplete()
                onOpenChange(false)
              }}
              className={vq.accentBtn}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark complete
            </Button>
          ) : !milestone.completed && milestone.locked ? (
            <Button
              disabled
              className="bg-gray-100 text-slate-400 dark:bg-white/5 dark:text-white/30"
            >
              <Lock className="mr-2 h-4 w-4" />
              Locked
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
