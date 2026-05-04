"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Users, CheckCircle2, AlertTriangle, Target, Lightbulb, MessageSquare, XCircle } from "lucide-react"
import { Conflict } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipConflictDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConflict = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const conflicts = leadershipData.conflicts || []
          const foundConflict = conflicts.find((c: Conflict) => c.id === params.id)
          if (foundConflict) {
            setConflict(foundConflict)
          }
        }
      } catch (e) {
        console.error('Failed to load conflict:', e)
      } finally {
        setLoading(false)
      }
    }

    loadConflict()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading conflict resolution...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!conflict) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Conflict not found</p>
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
                  Conflict Resolution
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {conflict.parties.join(', ')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(conflict.date).toLocaleDateString('en-US', { 
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

          {/* Situation */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Situation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {conflict.situation}
              </p>
            </CardContent>
          </Card>

          {/* Steps */}
          {conflict.guidance?.steps && conflict.guidance.steps.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Resolution Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conflict.guidance.steps.map((step, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg bg-gray-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Step {step.step}
                      </Badge>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">{step.action}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {step.script}
                    </p>
                    {step.rationale && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {step.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Conversation Structure */}
          {conflict.guidance?.conversationStructure && conflict.guidance.conversationStructure.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Conversation Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {conflict.guidance.conversationStructure.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Solution Options */}
          {conflict.guidance?.solutionOptions && conflict.guidance.solutionOptions.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Solution Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conflict.guidance.solutionOptions.map((option, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{option.option}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Pros:</p>
                        <ul className="space-y-1">
                          {option.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cons:</p>
                        <ul className="space-y-1">
                          {option.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                      Viability: {option.viability}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

