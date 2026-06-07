'use client'

import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  onRemove?: () => void
}

/** Claude-style active tool chip beside the + button */
export function ComposerSelectionChip({ icon: Icon, label, onRemove }: Props) {
  return (
    <button
      type="button"
      onClick={onRemove}
      title={onRemove ? `${label} — click to turn off` : label}
      className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2DA8FF]/12 ring-1 ring-[#2DA8FF]/35 transition-colors hover:bg-[#2DA8FF]/20 dark:bg-[#2DA8FF]/18 dark:ring-[#2DA8FF]/45"
      aria-label={label}
    >
      <Icon className="h-4 w-4 text-[#2DA8FF]" strokeWidth={2.25} />
    </button>
  )
}
