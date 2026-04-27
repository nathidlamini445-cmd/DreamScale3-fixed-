"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { RevenueGoal } from '@/lib/revenue-types'
import { cn } from '@/lib/utils'
import { AIResponse } from '@/components/ai-response'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function GoalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const [goal, setGoal] = useState<RevenueGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadGoal = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          try {
            const dbData = await supabaseData.loadRevenueData(user.id)
            if (dbData?.goals) {
              const found = dbData.goals.find((g: RevenueGoal) => g.id === id)
              if (found) {
                setGoal(found)
                setIsLoading(false)
                return
              }
            }
          } catch (supabaseError) {
            console.warn('Failed to load from Supabase, trying localStorage:', supabaseError)
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
        if (saved) {
          const data = JSON.parse(saved)
          const found = data.goals?.find((g: RevenueGoal) => g.id === id)
          if (found) {
            setGoal(found)
          }
        }
      } catch (e) {
        console.error('Failed to load goal:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadGoal()
  }, [id, user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const progressPercentage = (goal: RevenueGoal) => {
    return Math.min((goal.currentProgress / goal.target) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading goal...</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Goal Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The goal you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=goals')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Revenue Intelligence
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      <SidebarNav />
      <main className="ml-64 overflow-y-auto">
        {/* Header - Ultra Minimal */}
        <div className="bg-white dark:bg-slate-950">
          <div className="max-w-6xl px-12 py-10">
            <Button
              onClick={() => router.push('/revenue-intelligence?tab=goals')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                  {goal.name}
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} goal • 
                  {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className={cn(
                "text-sm font-medium border-gray-200/60 dark:border-gray-800/60",
                progressPercentage(goal) >= 100 && "bg-transparent text-green-600 dark:text-green-400",
                progressPercentage(goal) >= 75 && progressPercentage(goal) < 100 && "bg-transparent text-blue-600 dark:text-blue-400",
                progressPercentage(goal) >= 50 && progressPercentage(goal) < 75 && "bg-transparent text-yellow-600 dark:text-yellow-400",
                progressPercentage(goal) < 50 && "bg-transparent text-red-600 dark:text-red-400"
              )}>
                {progressPercentage(goal).toFixed(1)}% Complete
              </Badge>
            </div>
          </div>
        </div>

        {/* Content - Ultra Minimal, Left Aligned, Wider */}
        <div className="max-w-6xl px-12 pb-16">
          <div className="space-y-16">
            {/* Progress */}
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Progress</h2>
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-base font-medium text-gray-600 dark:text-gray-400">Current Progress</span>
                  <span className="text-2xl font-medium text-gray-900 dark:text-white">
                    {formatCurrency(goal.currentProgress)} / {formatCurrency(goal.target)}
                  </span>
                </div>
                <Progress value={progressPercentage(goal)} className="h-2" />
              </div>
            </div>

            {/* Milestones */}
            {goal.milestones.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Milestones</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {goal.milestones.map((milestone, i) => (
                    <div key={i} className={cn(
                      "bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]",
                      milestone.achieved && "border-l-4 border-l-green-500"
                    )}>
                      <div className="flex items-center gap-3 mb-3">
                        {milestone.achieved ? (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{milestone.milestone}</h3>
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Target: {formatCurrency(milestone.target)}
                      </p>
                      {milestone.achievedDate && (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Actions */}
            {goal.weeklyActions.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Weekly Action Plan</h2>
                <div className="space-y-6">
                  {goal.weeklyActions.map((week, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{week.week}</h3>
                        <Badge variant="outline" className="text-xs font-medium border-gray-200/60 dark:border-gray-800/60">
                          Target: {formatCurrency(week.target)}
                        </Badge>
                      </div>
                      <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {week.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

