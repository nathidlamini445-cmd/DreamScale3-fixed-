"use client"

import { cn } from "@/lib/utils"

const BAR_COUNT = 5

type VoiceWaveformProps = {
  /** Normalized heights 0–1 per bar (length 5) */
  levels: number[]
  className?: string
  active?: boolean
}

export function VoiceWaveform({ levels, className, active = true }: VoiceWaveformProps) {
  const source = levels.length >= BAR_COUNT ? levels : [...levels, ...Array(BAR_COUNT - levels.length).fill(0)]
  return (
    <div
      className={cn("flex h-6 items-end justify-center gap-0.5", className)}
      role="img"
      aria-label={active ? "Voice level" : "Idle"}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const h = Math.min(1, Math.max(0, source[i] ?? 0))
        const heightPx = 3 + h * 20
        return (
          <div
            key={i}
            className={cn(
              "w-[3px] min-h-[3px] rounded-full bg-gray-400/90 dark:bg-gray-400/80",
              active && "transition-[height,opacity] duration-75"
            )}
            style={{ height: `${heightPx}px` }}
          />
        )
      })}
    </div>
  )
}
