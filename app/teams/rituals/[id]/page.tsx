"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Clock, Users, Target, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react"
import { TeamRitual } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIResponse } from '@/components/ai-response'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function RitualDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ritual, setRitual] = useState<TeamRitual | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRitual = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          try {
            const dbData = await supabaseData.loadTeamsData(user.id)
            if (dbData?.rituals) {
              const foundRitual = dbData.rituals.find((r: TeamRitual) => r.id === params.id)
              if (foundRitual) {
                setRitual(foundRitual)
                setLoading(false)
                return
              }
            }
          } catch (supabaseError) {
            console.warn('Failed to load from Supabase, trying localStorage:', supabaseError)
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const teamsData = JSON.parse(saved)
          const rituals = teamsData.rituals || []
          const foundRitual = rituals.find((r: TeamRitual) => r.id === params.id)
          if (foundRitual) {
            setRitual(foundRitual)
          }
        }
      } catch (e) {
        console.error('Failed to load ritual:', e)
      } finally {
        setLoading(false)
      }
    }

    loadRitual()
  }, [params.id, user?.id])

  const getTypeLabel = (type: TeamRitual['type']) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (loading) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground overflow-y-auto">
      <SidebarNav />
      <main className="ml-64 pt-8 overflow-y-auto">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading ritual...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!ritual) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground overflow-y-auto">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Ritual not found</p>
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground overflow-y-auto">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/teams')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Teams
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {ritual.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {getTypeLabel(ritual.type)} • {ritual.frequency}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {ritual.duration} min
                  </span>
                  <span>•</span>
                  <span>Created on {new Date(ritual.date).toLocaleDateString('en-US', { 
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

          {/* Purpose */}
          {ritual.purpose && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {ritual.purpose}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Structure */}
          {ritual.structure.sections.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Structure ({ritual.duration} min)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ritual.structure.sections.map((section, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg bg-gray-50/50 dark:bg-slate-900/30">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">{section.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {section.duration} min
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {section.description}
                    </p>
                    {section.activities && section.activities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-slate-800/60">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Activities:</p>
                        <ul className="space-y-1.5">
                          {section.activities.map((activity, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.outcomes && section.outcomes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-slate-800/60">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Expected Outcomes:</p>
                        <ul className="space-y-1.5">
                          {section.outcomes.map((outcome, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <Target className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <span>{outcome}</span>
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

          {/* Participants */}
          {ritual.participants.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ritual.participants.map((participant, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preparation */}
          {ritual.preparation && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Preparation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ritual.preparation.beforehand && ritual.preparation.beforehand.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beforehand:</p>
                    <ul className="space-y-1.5">
                      {ritual.preparation.beforehand.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.preparation.materials && ritual.preparation.materials.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Materials:</p>
                    <ul className="space-y-1.5">
                      {ritual.preparation.materials.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.preparation.setup && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ritual.preparation.setup}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {ritual.aiSuggestions && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ritual.aiSuggestions.whyNeeded && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why Needed</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <AIResponse content={ritual.aiSuggestions.whyNeeded} />
                    </div>
                  </div>
                )}
                {ritual.aiSuggestions.bestPractices && ritual.aiSuggestions.bestPractices.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Practices</h3>
                    <ul className="space-y-2">
                      {ritual.aiSuggestions.bestPractices.map((practice, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.aiSuggestions.commonMistakes && ritual.aiSuggestions.commonMistakes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Mistakes</h3>
                    <ul className="space-y-2">
                      {ritual.aiSuggestions.commonMistakes.map((mistake, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.aiSuggestions.successFactors && ritual.aiSuggestions.successFactors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Success Factors</h3>
                    <ul className="space-y-2">
                      {ritual.aiSuggestions.successFactors.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <Target className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Follow-up */}
          {ritual.followUp && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Follow-up Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ritual.followUp.immediate && ritual.followUp.immediate.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Immediate:</p>
                    <ul className="space-y-1.5">
                      {ritual.followUp.immediate.map((action, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.followUp.afterRitual && ritual.followUp.afterRitual.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">After Ritual:</p>
                    <ul className="space-y-1.5">
                      {ritual.followUp.afterRitual.map((action, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ritual.followUp.longTerm && ritual.followUp.longTerm.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Long Term:</p>
                    <ul className="space-y-1.5">
                      {ritual.followUp.longTerm.map((action, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Variations */}
          {ritual.variations && ritual.variations.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Variations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ritual.variations.map((variation, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{variation.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{variation.description}</p>
                    {variation.modifications && variation.modifications.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Modifications:</p>
                        <ul className="space-y-1.5">
                          {variation.modifications.map((mod, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                              <span>{mod}</span>
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
        </div>
      </main>
    </div>
  )
}

