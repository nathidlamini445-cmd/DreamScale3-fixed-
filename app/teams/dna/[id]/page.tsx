"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dna, Users, TrendingUp, AlertCircle, CheckCircle2, Calendar } from "lucide-react"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.push('/teams')}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Dna className="w-8 h-8 text-blue-600" />
                  Team DNA Analysis
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {analysis.teamName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analysis.members.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(analysis.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Team Members */}
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({analysis.members.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.members.map((member) => (
                    <Card key={member.id} className="bg-white dark:bg-gray-800">
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.role}</p>
                        {member.skills.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
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
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <p>Work Style: <span className="text-gray-900 dark:text-white capitalize">{member.workStyle}</span></p>
                          <p>Communication: <span className="text-gray-900 dark:text-white capitalize">{member.communicationPreference}</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Composition */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Composition Analysis
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Strengths */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Strengths
                    </h3>
                    <div className="space-y-2">
                      {analysis.analysis.teamComposition.strengths.map((strength, i) => (
                        <Badge key={i} variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Gaps */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      Gaps
                    </h3>
                    <div className="space-y-2">
                      {analysis.analysis.teamComposition.gaps.map((gap, i) => (
                        <Badge key={i} variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {analysis.analysis.teamComposition.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimal Compositions */}
            {analysis.analysis.optimalCompositions.length > 0 && (
              <Card className="bg-purple-50 dark:bg-purple-900/20">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Optimal Team Compositions
                  </h2>
                  <div className="space-y-4">
                    {analysis.analysis.optimalCompositions.map((comp, i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {comp.projectType}
                          </h3>
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recommended Members:</p>
                            <div className="flex flex-wrap gap-2">
                              {comp.recommendedMembers.map((member, j) => (
                                <Badge key={j} variant="outline">{member}</Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comp.reasoning}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skill Gaps */}
            {analysis.analysis.skillGaps.length > 0 && (
              <Card className="bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Skill Gaps & Hiring Recommendations
                  </h2>
                  <div className="space-y-4">
                    {analysis.analysis.skillGaps.map((gap, i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{gap.gap}</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{gap.impact}</p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Suggested Hiring Profile:
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Role:</strong> {gap.suggestedHiringProfile.role}
                            </p>
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {gap.suggestedHiringProfile.skills.map((skill, j) => (
                                  <Badge key={j} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            {gap.suggestedHiringProfile.traits.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Traits:</p>
                                <div className="flex flex-wrap gap-1">
                                  {gap.suggestedHiringProfile.traits.map((trait, j) => (
                                    <Badge key={j} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">{trait}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back Button Footer */}
            <div className="flex justify-center pt-6">
              <Button onClick={() => router.push('/teams')} variant="outline" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Teams
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

