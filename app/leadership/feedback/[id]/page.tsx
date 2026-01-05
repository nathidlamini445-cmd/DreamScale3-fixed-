"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Users, Target, CheckCircle2, TrendingUp, Lightbulb } from "lucide-react"
import { Feedback360 } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipFeedbackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback360 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeedback = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const feedbacks = leadershipData.feedback360 || []
          const foundFeedback = feedbacks.find((f: Feedback360) => f.id === params.id)
          if (foundFeedback) {
            setFeedback(foundFeedback)
          }
        }
      } catch (e) {
        console.error('Failed to load feedback:', e)
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading feedback...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Feedback not found</p>
              <button 
                onClick={() => router.push('/marketplace')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Leadership
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'team':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      case 'peer':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
      case 'mentor':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Leadership
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                  360° Feedback
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {feedback.feedback.source}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getRelationshipColor(feedback.feedback.relationship)}`}>
                    {feedback.feedback.relationship}
                  </Badge>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(feedback.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Text */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-gray-200/60 dark:border-slate-800/60">
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {feedback.feedback.text}
                </p>
              </div>
              {feedback.feedback.categories && feedback.feedback.categories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-slate-800/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {feedback.feedback.categories.map((category, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis */}
          {feedback.analysis && (
            <>
              {/* Patterns */}
              {feedback.analysis.patterns && feedback.analysis.patterns.length > 0 && (
                <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.analysis.patterns.map((pattern, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {feedback.analysis.strengths && Array.isArray(feedback.analysis.strengths) && feedback.analysis.strengths.length > 0 && (
                <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {feedback.analysis.strengths.map((strength, i) => {
                        const strengthObj = typeof strength === 'string' ? { strength } : strength
                        return (
                          <div key={i} className="p-3 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {strengthObj.strength || strength}
                            </h3>
                            {strengthObj.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {strengthObj.description}
                              </p>
                            )}
                            {strengthObj.howToLeverage && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">How to leverage:</span> {strengthObj.howToLeverage}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Growth Areas */}
              {feedback.analysis.growthAreas && Array.isArray(feedback.analysis.growthAreas) && feedback.analysis.growthAreas.length > 0 && (
                <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback.analysis.growthAreas.map((area, i) => {
                      const areaObj = typeof area === 'string' ? { area } : area
                      return (
                        <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                            {areaObj.area || area}
                          </h3>
                          {areaObj.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {areaObj.description}
                            </p>
                          )}
                          {areaObj.specificActions && areaObj.specificActions.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actions:</p>
                              <ul className="space-y-1.5">
                                {areaObj.specificActions.map((action, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Development Plan */}
              {feedback.analysis.developmentPlan && feedback.analysis.developmentPlan.length > 0 && (
                <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Development Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback.analysis.developmentPlan.map((plan, i) => (
                      <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                          {plan.area}
                        </h3>
                        {plan.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {plan.description}
                          </p>
                        )}
                        {plan.actions && plan.actions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actions:</p>
                            <ul className="space-y-1.5">
                              {plan.actions.map((action, idx) => (
                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {plan.timeline && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Timeline:</span> {plan.timeline}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

