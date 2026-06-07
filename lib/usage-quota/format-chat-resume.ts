/**
 * Formats chat cooldown end time in the user's local timezone (browser or Intl).
 */

export type ChatResumeLocal = {
  timeLabel: string
  dayQualifier: string | null
  resumeLine: string
}

export function formatChatResumeLocal(
  cooldownUntilIso: string | null | undefined,
  now: Date = new Date()
): ChatResumeLocal | null {
  if (!cooldownUntilIso) return null
  const until = new Date(cooldownUntilIso)
  if (Number.isNaN(until.getTime()) || until.getTime() <= now.getTime()) {
    return null
  }

  const timeLabel = until
    .toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\u202f/g, ' ')

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfUntilDay = new Date(
    until.getFullYear(),
    until.getMonth(),
    until.getDate()
  )
  const diffDays = Math.round(
    (startOfUntilDay.getTime() - startOfToday.getTime()) / 86_400_000
  )

  let dayQualifier: string | null = null
  if (diffDays === 1) {
    dayQualifier = 'tomorrow'
  } else if (diffDays > 1) {
    dayQualifier = `on ${until.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })}`
  }

  const resumeLine = dayQualifier
    ? `You can chat again at ${timeLabel} ${dayQualifier}.`
    : `You can chat again at ${timeLabel}.`

  return { timeLabel, dayQualifier, resumeLine }
}

export function getChatLimitReachedCopy(cooldownUntilIso: string | null | undefined): {
  title: string
  resumeLine: string
  detail: string
} {
  const resume = formatChatResumeLocal(cooldownUntilIso)
  const resumeLine =
    resume?.resumeLine ??
    'You can continue chatting again after your free cycle resets.'

  return {
    title: "You've reached your free message limit",
    resumeLine,
    detail:
      'Free plan includes 5 messages per cycle (resets after 6 hours without chatting). ' +
      (resume ? resume.resumeLine + ' ' : '') +
      'Upgrade to Pro for unlimited coaching anytime.',
  }
}

/** Short placeholder for the composer when limited. */
export function chatLimitPlaceholder(
  cooldownUntilIso: string | null | undefined
): string {
  const resume = formatChatResumeLocal(cooldownUntilIso)
  if (resume) {
    return resume.dayQualifier
      ? `Limit reached — chat again ${resume.dayQualifier} at ${resume.timeLabel}`
      : `Limit reached — chat again at ${resume.timeLabel}`
  }
  return "You've reached your free message limit"
}
