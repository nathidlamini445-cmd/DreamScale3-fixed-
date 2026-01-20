"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Target, CheckCircle2, AlertTriangle, TrendingUp, Users } from "lucide-react"
import { LeadershipChallenge } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipChallengeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<LeadershipChallenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChallenge = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const challenges = leadershipData.challenges || []
          const foundChallenge = challenges.find((c: LeadershipChallenge) => c.id === params.id)
          if (foundChallenge) {
            setChallenge(foundChallenge)
          }
        }
      } catch (e) {
        console.error('Failed to load challenge:', e)
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Challenge not found</p>
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
                  {challenge.scenario}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <Badge variant="outline" className="text-xs">
                    {challenge.category}
                  </Badge>
                  {challenge.date && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(challenge.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </>
                  )}
                  {challenge.completed && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                        Completed
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Challenge Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {challenge.description}
              </p>
            </CardContent>
          </Card>

          {/* User Response */}
          {challenge.userResponse && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Your Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-gray-200/60 dark:border-slate-800/60">
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {challenge.userResponse}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {challenge.feedback && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Feedback & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overall Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {challenge.feedback.score}/100
                    </p>
                  </div>
                </div>

                {challenge.feedback.strengths && challenge.feedback.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strengths:</p>
                    <ul className="space-y-2">
                      {challenge.feedback.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.feedback.improvements && challenge.feedback.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Areas for Improvement:</p>
                    <ul className="space-y-2">
                      {challenge.feedback.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.feedback.detailedAnalysis && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed Analysis:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <AIResponse content={challenge.feedback.detailedAnalysis} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

