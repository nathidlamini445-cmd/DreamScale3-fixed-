'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  RevenueCheckInDriver,
  WeeklyRevenueCheckIn,
} from '@/lib/revenue-types'
import { CalendarPlus, TrendingUp } from 'lucide-react'

const DRIVER_LABELS: Record<RevenueCheckInDriver, string> = {
  outreach: 'Outreach / sales',
  pricing: 'Pricing change',
  'new-offer': 'New offer launched',
  retention: 'Retention / upsell',
  partnerships: 'Partnerships',
  other: 'Other',
}

function currentWeekKey(): string {
  const d = new Date()
  const onejan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
  )
  return `${d.getFullYear()}-W${week}`
}

type WeeklyRevenueCheckInCardProps = {
  checkIns: WeeklyRevenueCheckIn[]
  onSubmit: (checkIn: WeeklyRevenueCheckIn) => void
  isPro?: boolean
}

export function WeeklyRevenueCheckInCard({
  checkIns,
  onSubmit,
  isPro,
}: WeeklyRevenueCheckInCardProps) {
  const [amount, setAmount] = useState('')
  const [driver, setDriver] = useState<RevenueCheckInDriver>('outreach')
  const [note, setNote] = useState('')

  const thisWeek = currentWeekKey()
  const loggedThisWeek = checkIns.some((c) => c.weekKey === thisWeek)

  const handleSubmit = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!Number.isFinite(parsed) || parsed < 0) return

    onSubmit({
      id: `checkin-${Date.now()}`,
      weekKey: thisWeek,
      amount: parsed,
      driver,
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    })
    setAmount('')
    setNote('')
  }

  const addCalendarReminder = () => {
    const start = new Date()
    start.setDate(start.getDate() + ((1 + 7 - start.getDay()) % 7) || 7)
    start.setHours(9, 0, 0, 0)
    const end = new Date(start.getTime() + 30 * 60 * 1000)
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Weekly revenue check-in')}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Log revenue in DreamScale Revenue OS')}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="w-full rounded-xl border border-gray-200/60 bg-white p-6 sm:p-8 dark:border-gray-800/60 dark:bg-slate-950">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Weekly revenue check-in
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            60 seconds — log what you made and what moved the needle.
          </p>
        </div>
        {isPro && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCalendarReminder}
            className="shrink-0"
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
            Remind me
          </Button>
        )}
      </div>

      {loggedThisWeek ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          You logged revenue this week. Come back next week to keep your trend
          accurate.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="space-y-1.5 lg:col-span-4">
            <Label htmlFor="checkin-amount">Revenue this week (USD)</Label>
            <Input
              id="checkin-amount"
              placeholder="e.g. 2400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5 lg:col-span-4">
            <Label>What moved it?</Label>
            <Select
              value={driver}
              onValueChange={(v) => setDriver(v as RevenueCheckInDriver)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DRIVER_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 lg:col-span-4 lg:flex lg:flex-col lg:justify-end">
            <Button type="button" onClick={handleSubmit} className="h-11 w-full lg:w-auto lg:min-w-[160px]">
              Save check-in
            </Button>
          </div>
          <div className="space-y-1.5 lg:col-span-12">
            <Label htmlFor="checkin-note">Note (optional)</Label>
            <Textarea
              id="checkin-note"
              rows={3}
              placeholder="Closed 2 deals, raised prices on starter tier…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[88px] resize-y"
            />
          </div>
        </div>
      )}
    </div>
  )
}
