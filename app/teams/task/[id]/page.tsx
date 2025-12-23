"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, Users, Calendar, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { SmartTaskAssignment } from '@/lib/teams-types'
import { AIResponse } from '@/components/ai-response'

export default function TaskAssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<SmartTaskAssignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAssignment = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const teamsData = JSON.parse(saved)
          const foundAssignment = teamsData.taskAssignments.find((a: SmartTaskAssignment) => a.id === params.id)
          if (foundAssignment) {
            setAssignment(foundAssignment)
          }
        }
      } catch (e) {
        console.error('Failed to load assignment:', e)
      } finally {
        setLoading(false)
      }
    }

    loadAssignment()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading assignment...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Assignment not found</p>
              <Button onClick={() => router.push('/teams')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 border-orange-200 dark:border-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => router.push('/teams')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                  {assignment.projectName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {assignment.tasks.length} task{assignment.tasks.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {assignment.teamMembers.length} member{assignment.teamMembers.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(assignment.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Assignment Strategy */}
            {assignment.assignmentStrategy && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Assignment Strategy
                    </h2>
                  </div>
                  <AIResponse content={assignment.assignmentStrategy} />
                </CardContent>
              </Card>
            )}

            {/* Assigned Tasks */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Assigned Tasks
                </h2>
                <div className="space-y-4">
                  {assignment.tasks.map((task) => (
                    <Card key={task.id} className="border border-gray-200 dark:border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{task.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                        )}
                        {task.assignedTo && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Assigned to: <span className="text-gray-900 dark:text-white font-medium">
                                {assignment.teamMembers.find(m => m.id === task.assignedTo)?.name || task.assignedTo}
                              </span>
                            </p>
                          </div>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {task.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {task.aiAssignment && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">AI Reasoning</p>
                            </div>
                            <AIResponse content={task.aiAssignment.reasoning} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workload Analysis */}
            {assignment.workloadAnalysis && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Workload Analysis
                  </h2>
                  {assignment.workloadAnalysis.before && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Before Assignment</p>
                      <AIResponse content={assignment.workloadAnalysis.before} />
                    </div>
                  )}
                  {assignment.workloadAnalysis.after && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">After Assignment</p>
                      <AIResponse content={assignment.workloadAnalysis.after} />
                    </div>
                  )}
                  {assignment.workloadAnalysis.balance && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                      <AIResponse content={assignment.workloadAnalysis.balance} />
                    </div>
                  )}
                  {assignment.workloadAnalysis.recommendations && assignment.workloadAnalysis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {assignment.workloadAnalysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Team Dynamics */}
            {assignment.teamDynamics && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Team Dynamics
                  </h2>
                  {assignment.teamDynamics.collaborationOpportunities && assignment.teamDynamics.collaborationOpportunities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Collaboration Opportunities</p>
                      </div>
                      <ul className="space-y-1">
                        {assignment.teamDynamics.collaborationOpportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                            <span>{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assignment.teamDynamics.potentialBottlenecks && assignment.teamDynamics.potentialBottlenecks.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Potential Bottlenecks</p>
                      </div>
                      <ul className="space-y-1">
                        {assignment.teamDynamics.potentialBottlenecks.map((bottleneck, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                            <span>{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Risks */}
            {assignment.risks && assignment.risks.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Risks
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {assignment.risks.map((risk, i) => (
                      <div key={i} className="border-l-4 border-red-500 pl-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{risk.risk}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{risk.impact}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Mitigation: {risk.mitigation}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          Priority: {risk.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimization Suggestions */}
            {assignment.optimizationSuggestions && assignment.optimizationSuggestions.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Optimization Suggestions
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {assignment.optimizationSuggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

