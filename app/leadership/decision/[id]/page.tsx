"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Target, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { Decision } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipDecisionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDecision = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const decisions = leadershipData.decisions || []
          const foundDecision = decisions.find((d: Decision) => d.id === params.id)
          if (foundDecision) {
            setDecision(foundDecision)
          }
        }
      } catch (e) {
        console.error('Failed to load decision:', e)
      } finally {
        setLoading(false)
      }
    }

    loadDecision()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading decision...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Decision not found</p>
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
                  Decision Analysis
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(decision.date).toLocaleDateString('en-US', { 
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

          {/* Decision Description */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Decision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
                {decision.description}
              </p>
              {decision.context && (
                <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-slate-800/60">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Context:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {decision.context}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Overview */}
          {decision.analysis?.overview && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  <AIResponse content={decision.analysis.overview} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Frameworks */}
          {decision.analysis?.frameworks && decision.analysis.frameworks.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Analysis Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decision.analysis.frameworks.map((framework, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg bg-gray-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">{framework.name}</h3>
                      {framework.score !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Score: {framework.score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {framework.analysis}
                    </p>
                    {framework.keyInsights && framework.keyInsights.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-slate-800/60">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Key Insights:</p>
                        <ul className="space-y-1.5">
                          {framework.keyInsights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pros and Cons */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {decision.analysis?.pros && decision.analysis.pros.length > 0 && (
              <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {decision.analysis.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {decision.analysis?.cons && decision.analysis.cons.length > 0 && (
              <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {decision.analysis.cons.map((con, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendation */}
          {decision.analysis?.recommendation && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  <AIResponse content={decision.analysis.recommendation} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

