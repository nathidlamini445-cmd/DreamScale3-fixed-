import type { CEORoutine } from '@/lib/leadership-types'

export type RoutineCalendarEvent = {
  title: string
  description: string
  start: string
  end: string
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

function nextWeekday(dayIndex: number, from = new Date()): Date {
  const d = new Date(from)
  const diff = (dayIndex - d.getDay() + 7) % 7
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff))
  d.setHours(0, 0, 0, 0)
  return d
}

function parseClockTime(timeStr: string, base: Date): Date | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  const d = new Date(base)
  d.setHours(hours, minutes, 0, 0)
  if (d.getTime() < Date.now()) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function parseWeeklyBlock(timeStr: string): Date {
  const lower = timeStr.toLowerCase()
  for (const [name, index] of Object.entries(DAY_MAP)) {
    if (lower.includes(name)) {
      const d = nextWeekday(index)
      if (lower.includes('pm') && !lower.match(/\d/)) {
        d.setHours(14, 0, 0, 0)
      } else if (lower.includes('am') && !lower.match(/\d/)) {
        d.setHours(9, 0, 0, 0)
      } else {
        const clock = parseClockTime(timeStr, d)
        if (clock) return clock
        d.setHours(9, 0, 0, 0)
      }
      return d
    }
  }
  const d = new Date()
  d.setHours(9, 0, 0, 0)
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
  return d
}

function defaultDurationMinutes(routineType: CEORoutine['type'], timeLabel: string): number {
  if (routineType === 'daily') return 60
  if (routineType === 'weekly') {
    if (/tuesday.thursday|mon.fri/i.test(timeLabel)) return 180
    return 120
  }
  return 240
}

function blockStartDate(
  routine: CEORoutine,
  timeLabel: string,
  blockIndex: number
): Date {
  if (routine.type === 'daily') {
    const parsed = parseClockTime(timeLabel, new Date())
    if (parsed) return parsed
    const d = new Date()
    d.setHours(9 + blockIndex, 0, 0, 0)
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
    return d
  }

  if (routine.type === 'weekly') {
    return parseWeeklyBlock(timeLabel)
  }

  const d = new Date()
  d.setDate(d.getDate() + blockIndex * 7)
  d.setHours(9, 0, 0, 0)
  return d
}

export function routineBlockToCalendarEvent(
  routine: CEORoutine,
  blockIndex: number
): RoutineCalendarEvent | null {
  const block = routine.template.timeBlocks[blockIndex]
  if (!block) return null

  const start = blockStartDate(routine, block.time, blockIndex)
  const durationMin = defaultDurationMinutes(routine.type, block.time)
  const end = new Date(start.getTime() + durationMin * 60 * 1000)

  const title = `${routine.name}: ${block.activity}`.slice(0, 200)
  const description = [
    `Routine: ${routine.name}`,
    `Time: ${block.time}`,
    `Priority: ${block.priority}`,
    `Energy: ${block.energy}`,
    '',
    block.activity,
  ].join('\n')

  return {
    title,
    description: description.slice(0, 8000),
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function routineToCalendarEvents(routine: CEORoutine): RoutineCalendarEvent[] {
  return routine.template.timeBlocks
    .map((_, index) => routineBlockToCalendarEvent(routine, index))
    .filter((event): event is RoutineCalendarEvent => event !== null)
}
