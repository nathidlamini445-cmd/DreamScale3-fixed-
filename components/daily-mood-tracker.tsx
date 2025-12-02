'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSessionSafe } from '@/lib/session-context'
import { 
  Smile, TrendingUp, Zap, Heart, 
  Cloud, AlertCircle, Target, 
  Coffee, CheckCircle2
} from 'lucide-react'

interface MoodOption {
  value: string
  label: string
  icon: typeof Smile
  color: string
  bgColor: string
}

const moodOptions: MoodOption[] = [
  {
    value: 'motivated',
    label: 'Motivated',
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  },
  {
    value: 'excited',
    label: 'Excited',
    icon: Zap,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  },
  {
    value: 'energized',
    label: 'Energized',
    icon: Zap,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  },
  {
    value: 'demotivated',
    label: 'Demotivated',
    icon: Cloud,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  },
  {
    value: 'tired',
    label: 'Tired',
    icon: Cloud,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
  },
  {
    value: 'overwhelmed',
    label: 'Overwhelmed',
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  },
  {
    value: 'stressed',
    label: 'Stressed',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  },
  {
    value: 'anxious',
    label: 'Anxious',
    icon: AlertCircle,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800'
  },
  {
    value: 'uncertain',
    label: 'Uncertain',
    icon: Cloud,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  },
  {
    value: 'confident',
    label: 'Confident',
    icon: Target,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
  },
  {
    value: 'focused',
    label: 'Focused',
    icon: Target,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
  },
  {
    value: 'determined',
    label: 'Determined',
    icon: Target,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
  },
  {
    value: 'neutral',
    label: 'Neutral',
    icon: Smile,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  },
  {
    value: 'balanced',
    label: 'Balanced',
    icon: Heart,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
  },
  {
    value: 'calm',
    label: 'Calm',
    icon: Coffee,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
  }
]

export function DailyMoodTracker() {
  const sessionContext = useSessionSafe()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  useEffect(() => {
    if (sessionContext?.sessionData?.dailyMood) {
      const today = new Date().toISOString().split('T')[0]
      if (sessionContext.sessionData.dailyMood.date === today) {
        setSelectedMood(sessionContext.sessionData.dailyMood.mood)
      }
    }
  }, [sessionContext])

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
    if (sessionContext) {
      sessionContext.updateDailyMood(mood)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const hasMoodToday = sessionContext?.sessionData?.dailyMood?.date === today

  if (hasMoodToday && selectedMood) {
    const moodOption = moodOptions.find(m => m.value === selectedMood)
    if (moodOption) {
      const Icon = moodOption.icon
      return (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${moodOption.bgColor} flex items-center justify-center border-2`}>
                <Icon className={`w-5 h-5 ${moodOption.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">How you're feeling today</p>
                <p className="text-lg font-semibold text-foreground">{moodOption.label}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Set
            </Badge>
          </div>
        </Card>
      )
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground mb-1">How are you feeling today?</h3>
        <p className="text-sm text-muted-foreground">
          Help us understand your current state so we can provide personalized guidance
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
        {moodOptions.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMood === mood.value
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? `${mood.bgColor} ${mood.color} border-current shadow-md scale-105`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className={`w-5 h-5 ${isSelected ? mood.color : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${isSelected ? mood.color : 'text-muted-foreground'}`}>
                  {mood.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      {selectedMood && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Great!</span> We'll tailor your experience based on how you're feeling today.
          </p>
        </div>
      )}
    </Card>
  )
}

