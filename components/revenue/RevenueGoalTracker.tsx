"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign, Target, CheckCircle2, Calendar } from "lucide-react"
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
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#2563eb]" />
            Revenue Goal Tracker
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set revenue goals and get AI-powered weekly action plans to hit your targets
          </p>
        </div>
        <div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name *</Label>
                <Input
                  id="goal-name"
                  placeholder="Q4 Revenue Target"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Revenue *</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="100000"
                  value={formData.target || ''}
                  onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                  disabled={isCreating}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select 
                  value={formData.timeframe} 
                  onValueChange={(value: RevenueGoal['timeframe']) => setFormData({ ...formData, timeframe: value })}
                >
                  <SelectTrigger id="timeframe" disabled={isCreating}>
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
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isCreating}
                />
              </div>
            </div>
            <Button
              onClick={handleCreateGoal}
              disabled={!formData.name.trim() || formData.target <= 0 || isCreating}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Goal...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal & Get Action Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Goals ({goals.length})</h3>
          {goals.map((goal) => (
            <div key={goal.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#2563eb]" />
                      {goal.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} goal • 
                      {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={cn(
                    progressPercentage(goal) >= 100 && "bg-green-100 text-green-800",
                    progressPercentage(goal) >= 75 && progressPercentage(goal) < 100 && "bg-blue-100 text-blue-800",
                    progressPercentage(goal) >= 50 && progressPercentage(goal) < 75 && "bg-yellow-100 text-yellow-800",
                    progressPercentage(goal) < 50 && "bg-red-100 text-red-800"
                  )}>
                    {progressPercentage(goal).toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(goal.currentProgress)} / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={progressPercentage(goal)} className="h-3" />
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Milestones
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {goal.milestones.map((milestone, i) => (
                        <Card key={i} className={cn(
                          milestone.achieved 
                            ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500" 
                            : "bg-gray-50 dark:bg-gray-900"
                        )}>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              {milestone.achieved ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                              )}
                              <h5 className="font-medium text-gray-900 dark:text-white">{milestone.milestone}</h5>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Target: {formatCurrency(milestone.target)}
                            </p>
                            {milestone.achievedDate && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Actions */}
                {goal.weeklyActions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Weekly Action Plan
                    </h4>
                    <div className="space-y-3">
                      {goal.weeklyActions.map((week, i) => (
                        <Card key={i} className="bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{week.week}</h5>
                              <Badge variant="outline">Target: {formatCurrency(week.target)}</Badge>
                            </div>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                              {week.actions.map((action, idx) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

