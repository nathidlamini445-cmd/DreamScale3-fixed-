'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronRight,
  Globe,
  GraduationCap,
  Handshake,
  Layers,
  Link2,
  PenLine,
  Plus,
  Target,
  type LucideIcon,
} from 'lucide-react'
import {
  BIZORA_COACHING_STYLES,
  type CoachingStyleId,
} from '@/lib/bizora/coaching-styles'
import { ComposerSelectionChip } from '@/components/bizora/composer-selection-chip'

const STYLE_ICONS: Record<CoachingStyleId, LucideIcon> = {
  balanced: PenLine,
  mentorship: GraduationCap,
  direct: Target,
  understanding: Handshake,
  deep: Layers,
}

type Props = {
  webSearchEnabled: boolean
  onWebSearchToggle: () => void
  coachingStyle: CoachingStyleId
  onCoachingStyleChange: (style: CoachingStyleId) => void
  onPasteLink: () => void
  disabled?: boolean
}

export function ComposerAttachMenu({
  webSearchEnabled,
  onWebSearchToggle,
  coachingStyle,
  onCoachingStyleChange,
  onPasteLink,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const [styleHover, setStyleHover] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setStyleHover(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const activeStyle =
    BIZORA_COACHING_STYLES.find((s) => s.id === coachingStyle) ??
    BIZORA_COACHING_STYLES[0]
  const StyleIcon = STYLE_ICONS[coachingStyle]

  return (
    <div ref={rootRef} className="relative mb-1 flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          open
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200'
        }`}
        title="Tools"
      >
        <Plus className="h-4 w-4" />
      </button>

      {webSearchEnabled && (
        <ComposerSelectionChip
          icon={Globe}
          label="Web search on"
          onRemove={() => onWebSearchToggle()}
        />
      )}

      {coachingStyle !== 'balanced' && (
        <ComposerSelectionChip
          icon={StyleIcon}
          label={`Style: ${activeStyle.label}`}
          onRemove={() => onCoachingStyleChange('balanced')}
        />
      )}

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 min-w-[220px] overflow-visible rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onPasteLink()
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/80"
          >
            <Link2 className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="flex-1 font-medium">Paste link</span>
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={webSearchEnabled}
            onClick={() => onWebSearchToggle()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/80"
          >
            <Globe className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="flex-1 font-medium">Web search</span>
            {webSearchEnabled && (
              <Check className="h-4 w-4 shrink-0 text-[#2DA8FF]" aria-hidden />
            )}
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

          <div
            className="relative"
            onMouseEnter={() => setStyleHover(true)}
            onMouseLeave={() => setStyleHover(false)}
          >
            <button
              type="button"
              role="menuitem"
              aria-haspopup="true"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/80"
            >
              <PenLine className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="flex-1 font-medium">Style</span>
              <span className="max-w-[72px] truncate text-xs text-gray-400 dark:text-gray-500">
                {activeStyle.label}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </button>

            {styleHover && (
              <div
                role="menu"
                className="absolute bottom-0 left-full z-50 ml-1 min-w-[200px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-600 dark:bg-gray-800"
              >
                <p className="px-3 pb-2 pt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                  How Bizora coaches you as an entrepreneur
                </p>
                {BIZORA_COACHING_STYLES.map((style) => {
                  const Icon = STYLE_ICONS[style.id]
                  return (
                    <button
                      key={style.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={coachingStyle === style.id}
                      onClick={() => {
                        onCoachingStyleChange(style.id)
                        setOpen(false)
                        setStyleHover(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/80"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="flex-1 font-medium text-gray-800 dark:text-gray-100">
                        {style.label}
                      </span>
                      {coachingStyle === style.id && (
                        <Check className="h-4 w-4 shrink-0 text-[#2DA8FF]" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
