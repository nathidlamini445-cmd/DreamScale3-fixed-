"use client"

import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getToolUrl, linkifyAutomationText } from '@/lib/systems/tool-links'

type ToolChipProps = {
  name: string
  className?: string
}

export function SystemToolChip({ name, className }: ToolChipProps) {
  const url = getToolUrl(name)

  if (!url) {
    return (
      <span
        className={cn(
          'inline-flex rounded-md border border-gray-200/80 bg-white px-3 py-1.5 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200',
          className
        )}
      >
        {name}
      </span>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-gray-200/80 bg-white px-3 py-1.5 text-sm text-gray-800 transition-colors hover:border-[#39d2c0]/50 hover:bg-[#39d2c0]/5 hover:text-[#2ab5a5] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-[#39d2c0]/40 dark:hover:text-[#39d2c0]',
        className
      )}
    >
      {name}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
    </a>
  )
}

type AutomationTextProps = {
  text: string
  className?: string
}

export function AutomationLinkedText({ text, className }: AutomationTextProps) {
  const segments = linkifyAutomationText(text)

  return (
    <p className={cn('text-sm text-gray-700 dark:text-gray-300', className)}>
      {segments.map((segment, i) =>
        segment.type === 'link' ? (
          <a
            key={`${segment.url}-${i}`}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#2ab5a5] underline decoration-[#39d2c0]/40 underline-offset-2 transition-colors hover:text-[#39d2c0] dark:text-[#39d2c0]"
          >
            {segment.value}
          </a>
        ) : (
          <span key={i}>{segment.value}</span>
        )
      )}
    </p>
  )
}
