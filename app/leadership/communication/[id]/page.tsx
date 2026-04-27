"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, MessageSquare, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Heart } from "lucide-react"
import { Communication } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipCommunicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [communication, setCommunication] = useState<Communication | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCommunication = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const communications = leadershipData.communications || []
          const foundCommunication = communications.find((c: Communication) => c.id === params.id)
          if (foundCommunication) {
            setCommunication(foundCommunication)
          }
        }
      } catch (e) {
        console.error('Failed to load communication:', e)
      } finally {
        setLoading(false)
      }
    }

    loadCommunication()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading communication...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!communication) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Communication not found</p>
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

  const getTypeLabel = (type: Communication['type']) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
                  Communication Review
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {getTypeLabel(communication.type)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(communication.date).toLocaleDateString('en-US', { 
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

          {/* Original Communication */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                Original Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-gray-200/60 dark:border-slate-800/60">
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {communication.original}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Improved Communication */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                Improved Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/60 dark:border-green-900/30">
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {communication.improved}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {communication.suggestions && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communication.suggestions.clarity && communication.suggestions.clarity.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clarity:</p>
                    <ul className="space-y-2">
                      {communication.suggestions.clarity.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {communication.suggestions.impact && communication.suggestions.impact.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Impact:</p>
                    <ul className="space-y-2">
                      {communication.suggestions.impact.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {communication.suggestions.empathy && communication.suggestions.empathy.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empathy:</p>
                    <ul className="space-y-2">
                      {communication.suggestions.empathy.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <Heart className="w-4 h-4 mt-0.5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analysis */}
          {communication.analysis && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communication.analysis.currentTone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Tone:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{communication.analysis.currentTone}</p>
                  </div>
                )}
                {communication.analysis.recommendedTone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommended Tone:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{communication.analysis.recommendedTone}</p>
                  </div>
                )}
                {communication.analysis.keyMessages && communication.analysis.keyMessages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Messages:</p>
                    <ul className="space-y-1.5">
                      {communication.analysis.keyMessages.map((msg, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alternatives */}
          {communication.alternatives && communication.alternatives.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Alternative Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communication.alternatives.map((alt, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{alt.useCase}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alt.rationale}</p>
                    <div className="p-3 bg-gray-50 dark:bg-slate-900/30 rounded border border-gray-200/60 dark:border-slate-800/60">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{alt.version}</p>
                    </div>
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

