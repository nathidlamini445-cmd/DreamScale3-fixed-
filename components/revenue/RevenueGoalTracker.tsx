"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { RevenueGoal } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'

interface RevenueGoalTrackerProps {
  goals: RevenueGoal[]
  onAddGoal: (goal: RevenueGoal) => void
  onUpdateGoal: (goal: RevenueGoal) => void
}

export default function RevenueGoalTracker({ goals, onAddGoal, onUpdateGoal }: RevenueGoalTrackerProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target: 0,
    timeframe: 'monthly' as RevenueGoal['timeframe'],
    startDate: '',
    endDate: ''
  })

  const handleCreateGoal = async () => {
    if (!formData.name.trim() || formData.target <= 0) {
      alert('Please enter goal name and target')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/revenue/goal-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create goal')
      }

      const goalData = await response.json()
      
      const goal: RevenueGoal = {
        id: Date.now().toString(),
        name: formData.name,
        target: formData.target,
        timeframe: formData.timeframe,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentProgress: 0,
        weeklyActions: goalData.weeklyActions || [],
        milestones: goalData.milestones || [],
        date: new Date().toISOString()
      }

      onAddGoal(goal)
      setFormData({ name: '', target: 0, timeframe: 'monthly', startDate: '', endDate: '' })
    } catch (error) {
      console.error('Failed to create goal:', error)
      alert('Failed to create goal. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const progressPercentage = (goal: RevenueGoal) => {
    return Math.min((goal.currentProgress / goal.target) * 100, 100)
  }

  return (
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Revenue Goal Tracker
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set revenue goals and get AI-powered weekly action plans to hit your targets
          </p>
        </div>
        <div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="goal-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name *</Label>
                <Input
                  id="goal-name"
                  placeholder="Q4 Revenue Target"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isCreating}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target" className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Revenue *</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="Enter your revenue target (e.g., 100000)"
                  value={formData.target || ''}
                  onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                  disabled={isCreating}
                  className="bg-white dark:bg-slate-950"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Set your specific revenue goal. This should be based on your business plan and growth targets.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timeframe" className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe</Label>
                <Select 
                  value={formData.timeframe} 
                  onValueChange={(value: RevenueGoal['timeframe']) => setFormData({ ...formData, timeframe: value })}
                >
                  <SelectTrigger id="timeframe" disabled={isCreating} className="bg-white dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isCreating}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isCreating}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
            </div>
            <Button
              onClick={handleCreateGoal}
              disabled={!formData.name.trim() || formData.target <= 0 || isCreating}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Goal...
                </>
              ) : (
                <>
                  Create Goal & Get Action Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated Revenue Goals ({goals.length})</h3>
          <div className="grid gap-6">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => router.push(`/revenue-intelligence/goal/${goal.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      {goal.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{new Date(goal.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                        {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "text-xs font-medium border-gray-200/60 dark:border-gray-800/60",
                        progressPercentage(goal) >= 100 && "bg-transparent text-green-600 dark:text-green-400",
                        progressPercentage(goal) >= 75 && progressPercentage(goal) < 100 && "bg-transparent text-blue-600 dark:text-blue-400",
                        progressPercentage(goal) >= 50 && progressPercentage(goal) < 75 && "bg-transparent text-yellow-600 dark:text-yellow-400",
                        progressPercentage(goal) < 50 && "bg-transparent text-red-600 dark:text-red-400"
                      )}>
                        {progressPercentage(goal).toFixed(1)}% Complete
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(goal.currentProgress)} / {formatCurrency(goal.target)}
                        </span>
                      </div>
                      <Progress value={progressPercentage(goal)} className="h-2" />
                    </div>
                    {goal.milestones.length > 0 && (
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {goal.milestones.filter(m => m.achieved).length} of {goal.milestones.length} milestones achieved
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/revenue-intelligence/goal/${goal.id}`)
                    }}
                    className="ml-4 border-gray-200/60 dark:border-gray-800/60 font-medium"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

