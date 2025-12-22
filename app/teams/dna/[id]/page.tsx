"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dna, Users, CheckCircle2, XCircle, Lightbulb, AlertCircle, Calendar } from "lucide-react"
import { TeamDNAAnalysis } from '@/lib/teams-types'
import { AIResponse } from '@/components/ai-response'

export default function DNAAnalysisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<TeamDNAAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalysis = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const teamsData = JSON.parse(saved)
          const foundAnalysis = teamsData.dnaAnalyses.find((a: TeamDNAAnalysis) => a.id === params.id)
          if (foundAnalysis) {
            setAnalysis(foundAnalysis)
          }
        }
      } catch (e) {
        console.error('Failed to load analysis:', e)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading analysis...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Analysis not found</p>
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {analysis.teamName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {analysis.members.length} member{analysis.members.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(analysis.date).toLocaleDateString('en-US', { 
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
            {/* Team Members */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Team Members
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.members.map((member) => (
                    <div key={member.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{member.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{member.role}</p>
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {member.skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <p>Work Style: <span className="text-gray-900 dark:text-white capitalize">{member.workStyle}</span></p>
                        <p>Communication: <span className="text-gray-900 dark:text-white capitalize">{member.communicationPreference}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Composition - Minimalist Design */}
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">
                  Team Composition Analysis
                </h2>
                <div className="space-y-6">
                  {/* Strengths */}
                  {analysis.analysis.teamComposition.strengths.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.analysis.teamComposition.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {analysis.analysis.teamComposition.gaps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Gaps</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.analysis.teamComposition.gaps.map((gap, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.analysis.teamComposition.recommendations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recommendations</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.analysis.teamComposition.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Optimal Compositions */}
            {analysis.analysis.optimalCompositions.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Optimal Team Compositions
                  </h2>
                  <div className="space-y-4">
                    {analysis.analysis.optimalCompositions.map((comp, i) => (
                      <div key={i} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {comp.projectType}
                        </h3>
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Recommended Members:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {comp.recommendedMembers.map((member, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{member}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <AIResponse content={comp.reasoning} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skill Gaps */}
            {analysis.analysis.skillGaps.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Skill Gaps & Hiring Recommendations
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {analysis.analysis.skillGaps.map((gap, i) => (
                      <div key={i} className="p-4 border-l-2 border-l-amber-500 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1.5">{gap.gap}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{gap.impact}</p>
                        {gap.suggestedHiringProfile && (
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-900 dark:text-white mb-3">Suggested Hiring Profile</p>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <p><span className="font-medium">Role:</span> {gap.suggestedHiringProfile.role}</p>
                              <div>
                                <span className="font-medium">Skills:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {gap.suggestedHiringProfile.skills.map((skill, j) => (
                                    <Badge key={j} variant="outline" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                              {gap.suggestedHiringProfile.traits.length > 0 && (
                                <div>
                                  <span className="font-medium">Traits:</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {gap.suggestedHiringProfile.traits.map((trait, j) => (
                                      <Badge key={j} variant="outline" className="text-xs">{trait}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
