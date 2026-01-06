"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Heart, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { TeamHealthMonitor } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AIResponse } from '@/components/ai-response'
import { AnalysisItemCard } from './AnalysisItemCard'
import { cn } from '@/lib/utils'

interface TeamHealthMonitorProps {
  monitors: TeamHealthMonitor[]
  onAddMonitor: (monitor: TeamHealthMonitor) => void
  onDeleteMonitor?: (id: string) => void
}

export default function TeamHealthMonitor({ monitors, onAddMonitor, onDeleteMonitor }: TeamHealthMonitorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [teamName, setTeamName] = useState('')

  const handleAnalyze = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/teams/monitor-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze team health')
      }

      const monitor = await response.json()
      
      const healthMonitor: TeamHealthMonitor = {
        id: Date.now().toString(),
        teamName,
        overallHealth: monitor.overallHealth || 75,
        healthBreakdown: monitor.healthBreakdown,
        metrics: monitor.metrics || {
          morale: { id: '1', metric: 'morale', value: 75, trend: 'stable', date: new Date().toISOString() },
          productivity: { id: '2', metric: 'productivity', value: 75, trend: 'stable', date: new Date().toISOString() },
          collaboration: { id: '3', metric: 'collaboration', value: 75, trend: 'stable', date: new Date().toISOString() },
          communication: { id: '4', metric: 'communication', value: 75, trend: 'stable', date: new Date().toISOString() }
        },
        warnings: monitor.warnings || [],
        suggestions: monitor.suggestions || [],
        strengths: monitor.strengths,
        areasForImprovement: monitor.areasForImprovement,
        teamCulture: monitor.teamCulture,
        actionPlan: monitor.actionPlan,
        benchmarks: monitor.benchmarks,
        date: new Date().toISOString()
      }

      onAddMonitor(healthMonitor)
      setTeamName('')
    } catch (error) {
      console.error('Failed to analyze team health:', error)
      alert('Failed to analyze team health. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600 dark:text-green-400'
    if (value >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
      case 'declining':
        return <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      case 'stable':
        return <Minus className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analyze Team Health */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Team Health Monitor
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track team morale, productivity, collaboration, and get early warnings
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-sm">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Product Development Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={isAnalyzing}
                className="h-9"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!teamName.trim() || isAnalyzing}
              className="w-full"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Analyze Team Health
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Monitor Results */}
      {monitors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Monitors ({monitors.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitors.map((monitor) => (
              <AnalysisItemCard
                key={monitor.id}
                id={monitor.id}
                title={monitor.teamName}
                subtitle={`Health Score: ${monitor.overallHealth}/100`}
                date={monitor.date}
                icon={<Heart className="w-5 h-5 text-red-600" />}
                badges={[
                  { label: `${Object.keys(monitor.metrics).length} metrics`, variant: 'secondary' }
                ]}
                onDelete={(id) => {
                  if (onDeleteMonitor) {
                    onDeleteMonitor(id)
                  }
                }}
                type="health"
              >
                <div className="space-y-5">
                  {/* Overall Health Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Health Score</h4>
                      <span className={cn("text-lg font-semibold", getHealthColor(monitor.overallHealth))}>
                        {monitor.overallHealth}/100
                      </span>
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Health Metrics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(monitor.metrics).map(([key, metric]) => (
                        <div key={metric.id} className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-900 dark:text-white capitalize">{metric.metric}</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <span className={cn("text-xs font-medium", getHealthColor(metric.value))}>
                              {metric.value}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {(monitor.warnings?.length || 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Early Warnings</h4>
                      </div>
                      <div className="space-y-2">
                        {monitor.warnings.map((warning, i) => (
                          <div key={i} className="p-3 border-l-2 border-l-amber-500 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  warning.severity === 'high' ? 'border-red-500 text-red-600 dark:text-red-400' :
                                  warning.severity === 'medium' ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                                  'border-blue-500 text-blue-600 dark:text-blue-400'
                                )}
                              >
                                {warning.severity.toUpperCase()}
                              </Badge>
                              <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                                {warning.type.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{warning.description}</p>
                            {(warning.suggestedInterventions?.length || 0) > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Interventions:</p>
                                <ul className="space-y-1">
                                  {warning.suggestedInterventions.map((intervention, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 pl-3">
                                      {intervention}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {(monitor.suggestions?.length || 0) > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Suggestions</h4>
                      <div className="space-y-2">
                        {monitor.suggestions.map((suggestion, i) => (
                          <div key={i} className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type.replace('-', ' ')}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  suggestion.priority === 'high' ? 'border-red-500 text-red-600 dark:text-red-400' :
                                  suggestion.priority === 'medium' ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                                  'border-green-500 text-green-600 dark:text-green-400'
                                )}
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-1">{suggestion.activity}</h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
