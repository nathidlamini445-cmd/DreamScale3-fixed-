"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Heart, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { TeamHealthMonitor } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'

interface TeamHealthMonitorProps {
  monitors: TeamHealthMonitor[]
  onAddMonitor: (monitor: TeamHealthMonitor) => void
}

export default function TeamHealthMonitor({ monitors, onAddMonitor }: TeamHealthMonitorProps) {
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
        metrics: monitor.metrics || {
          morale: { id: '1', metric: 'morale', value: 75, trend: 'stable', date: new Date().toISOString() },
          productivity: { id: '2', metric: 'productivity', value: 75, trend: 'stable', date: new Date().toISOString() },
          collaboration: { id: '3', metric: 'collaboration', value: 75, trend: 'stable', date: new Date().toISOString() },
          communication: { id: '4', metric: 'communication', value: 75, trend: 'stable', date: new Date().toISOString() }
        },
        warnings: monitor.warnings || [],
        suggestions: monitor.suggestions || [],
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
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getWarningColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Analyze Team Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#2563eb]" />
            Team Health Monitor
          </CardTitle>
          <CardDescription>
            Track team morale, productivity, collaboration, and get early warnings for burnout or conflicts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Product Development Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!teamName.trim() || isAnalyzing}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Team Health...
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Health Monitors ({monitors.length})</h3>
          {monitors.map((monitor) => (
            <Card key={monitor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#2563eb]" />
                  {monitor.teamName}
                </CardTitle>
                <CardDescription>
                  Monitored on {new Date(monitor.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Health Score */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Overall Health Score</h4>
                    <span className={cn("text-3xl font-bold", getHealthColor(monitor.overallHealth))}>
                      {monitor.overallHealth}/100
                    </span>
                  </div>
                  <Progress value={monitor.overallHealth} className="h-3" />
                </div>

                {/* Health Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Health Metrics</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(monitor.metrics).map(([key, metric]) => (
                      <Card key={metric.id} className="bg-gray-50 dark:bg-gray-900">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white capitalize">{metric.metric}</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <span className={cn("text-lg font-semibold", getHealthColor(metric.value))}>
                              {metric.value}/100
                            </span>
                          </div>
                          <Progress value={metric.value} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {monitor.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Early Warnings
                    </h4>
                    <div className="space-y-3">
                      {monitor.warnings.map((warning, i) => (
                        <Card key={i} className={cn("border-l-4", getWarningColor(warning.severity))}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getWarningColor(warning.severity)}>
                                  {warning.severity.toUpperCase()}
                                </Badge>
                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                  {warning.type.replace('-', ' ')}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{warning.description}</p>
                            {warning.suggestedInterventions.length > 0 && (
                              <div>
                                <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Suggested Interventions:</h6>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                  {warning.suggestedInterventions.map((intervention, idx) => (
                                    <li key={idx}>{intervention}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {monitor.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Suggestions</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {monitor.suggestions.map((suggestion, i) => (
                        <Card key={i} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="capitalize">{suggestion.type.replace('-', ' ')}</Badge>
                              <Badge className={cn(
                                suggestion.priority === 'high' && 'bg-red-100 text-red-800',
                                suggestion.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                                suggestion.priority === 'low' && 'bg-green-100 text-green-800'
                              )}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">{suggestion.activity}</h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

