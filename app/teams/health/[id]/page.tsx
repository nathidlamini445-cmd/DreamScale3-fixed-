"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Heart, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { TeamHealthMonitor } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'

export default function HealthMonitorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [monitor, setMonitor] = useState<TeamHealthMonitor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMonitor = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const teamsData = JSON.parse(saved)
          // Ensure healthMonitors exists
          const healthMonitors = teamsData.healthMonitors || []
          const foundMonitor = healthMonitors.find((m: TeamHealthMonitor) => m.id === params.id)
          if (foundMonitor) {
            setMonitor(foundMonitor)
          }
        }
      } catch (e) {
        console.error('Failed to load health monitor:', e)
      } finally {
        setLoading(false)
      }
    }

    loadMonitor()
  }, [params.id])

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-green-500" />
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
      default:
        return <Minus className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading health monitor...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!monitor) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Health monitor not found</p>
              <button 
                onClick={() => router.push('/teams')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Teams
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/teams')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-title-shimmer">
                  {monitor.teamName}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>Health Score: {monitor.overallHealth}/100</span>
                  <span>•</span>
                  <span>Created on {new Date(monitor.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Health Score */}
          <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Overall Health Score</h2>
              <span className={cn("text-3xl font-semibold", getHealthColor(monitor.overallHealth))}>
                {monitor.overallHealth}/100
              </span>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(monitor.metrics || {}).map(([key, metric]) => (
                <div key={metric.id} className="p-3 border border-gray-200/50 dark:border-gray-800/50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{metric.metric}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <span className={cn("text-lg font-semibold", getHealthColor(metric.value))}>
                    {metric.value}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Early Warnings */}
          {(monitor.warnings?.length || 0) > 0 && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Early Warnings</h2>
              </div>
              <div className="space-y-3">
                {monitor.warnings.map((warning, i) => (
                  <div key={i} className="p-4 border-l-2 border-l-amber-500 border border-gray-200/50 dark:border-gray-800/50 rounded">
                    <div className="flex items-center gap-2 mb-2">
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
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {warning.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{warning.description}</p>
                    {(warning.suggestedInterventions?.length || 0) > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Interventions:</p>
                        <ul className="space-y-1.5">
                          {warning.suggestedInterventions.map((intervention, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                              • {intervention}
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
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Suggestions</h2>
              <div className="space-y-3">
                {monitor.suggestions.map((suggestion, i) => (
                  <div key={i} className="p-4 border border-gray-200/50 dark:border-gray-800/50 rounded">
                    <div className="flex items-center justify-between mb-2">
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1.5">{suggestion.activity}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {(monitor.strengths?.length || 0) > 0 && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Strengths</h2>
              <ul className="space-y-2">
                {monitor.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {(monitor.areasForImprovement?.length || 0) > 0 && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Areas for Improvement</h2>
              <div className="space-y-3">
                {monitor.areasForImprovement.map((area, i) => (
                  <div key={i} className="p-3 border border-gray-200/50 dark:border-gray-800/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{area.area}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          area.priority === 'High' ? 'border-red-500 text-red-600 dark:text-red-400' :
                          area.priority === 'Medium' ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                          'border-green-500 text-green-600 dark:text-green-400'
                        )}
                      >
                        {area.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{area.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Impact: {area.impact}</p>
                    {(area.actions?.length || 0) > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Actions:</p>
                        <ul className="space-y-1">
                          {area.actions.map((action, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 pl-3">
                              • {action}
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

          {/* Team Culture */}
          {monitor.teamCulture && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Culture</h2>
              {monitor.teamCulture.dynamics && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{monitor.teamCulture.dynamics}</p>
                </div>
              )}
              {(monitor.teamCulture.values?.length || 0) > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Values:</p>
                  <div className="flex flex-wrap gap-2">
                    {monitor.teamCulture.values.map((value, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(monitor.teamCulture.recommendations?.length || 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {monitor.teamCulture.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Plan */}
          {monitor.actionPlan && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Action Plan</h2>
              {(monitor.actionPlan.immediate?.length || 0) > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Immediate</h3>
                  <ul className="space-y-1.5">
                    {monitor.actionPlan.immediate.map((action, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(monitor.actionPlan.shortTerm?.length || 0) > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Short Term</h3>
                  <ul className="space-y-1.5">
                    {monitor.actionPlan.shortTerm.map((action, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(monitor.actionPlan.longTerm?.length || 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Long Term</h3>
                  <ul className="space-y-1.5">
                    {monitor.actionPlan.longTerm.map((action, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Benchmarks */}
          {monitor.benchmarks && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Benchmarks</h2>
              {monitor.benchmarks.industryAverage && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Industry Average: </span>
                    {monitor.benchmarks.industryAverage}
                  </p>
                </div>
              )}
              {(monitor.benchmarks.bestPractices?.length || 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Best Practices:</p>
                  <ul className="space-y-1.5">
                    {monitor.benchmarks.bestPractices.map((practice, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

