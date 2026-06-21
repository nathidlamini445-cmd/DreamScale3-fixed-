"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Dna, AlertCircle, CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import type { TeamDNAAnalysis as TeamDNAAnalysisType, TeamMember } from '@/lib/teams-types'
import { toast } from 'sonner'
import { AIResponse } from '@/components/ai-response'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AnalysisItemCard } from './AnalysisItemCard'

interface TeamDNAAnalysisProps {
  analyses: TeamDNAAnalysisType[]
  members: TeamMember[]
  onAddAnalysis: (analysis: TeamDNAAnalysisType) => void
  onDeleteAnalysis?: (id: string) => void
}

export default function TeamDNAAnalysis({ analyses, members, onAddAnalysis, onDeleteAnalysis }: TeamDNAAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const handleAnalyze = async () => {
    if (!teamName.trim() || selectedMembers.length === 0) {
      alert('Please enter a team name and select at least one member')
      return
    }

    setIsAnalyzing(true)
    try {
      const teamMembers = members.filter(m => selectedMembers.includes(m.id))
      
      const response = await fetch('/api/teams/analyze-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, members: teamMembers })
      })

      if (response.status === 429) {
        toast.error('Monthly AI limit reached', {
          description: 'Upgrade to Pro for unlimited TeamSync AI runs.',
        })
        return
      }

      if (!response.ok) {
        throw new Error('Failed to analyze team DNA')
      }

      const analysis = await response.json()
      
      const dnaAnalysis: TeamDNAAnalysisType = {
        id: Date.now().toString(),
        teamName,
        members: teamMembers,
        analysis: analysis.analysis || {
          teamComposition: { strengths: [], gaps: [], recommendations: [] },
          optimalCompositions: [],
          skillGaps: []
        },
        date: new Date().toISOString()
      }

      onAddAnalysis(dnaAnalysis)
      setTeamName('')
      setSelectedMembers([])
    } catch (error) {
      console.error('Failed to analyze team DNA:', error)
      alert('Failed to analyze team DNA. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Saved Analyses */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Analyses ({analyses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((analysis) => (
              <AnalysisItemCard
                key={analysis.id}
                id={analysis.id}
                title={analysis.teamName}
                subtitle={`${analysis.members?.length || 0} member${(analysis.members?.length || 0) !== 1 ? 's' : ''}`}
                date={analysis.date}
                icon={<Dna className="w-5 h-5 text-blue-600" />}
                badges={[
                  { label: `${analysis.members?.length || 0} members`, variant: 'secondary' }
                ]}
                onDelete={(id) => {
                  if (onDeleteAnalysis) {
                    onDeleteAnalysis(id)
                  }
                }}
                type="dna"
              >
                <div className="space-y-5">
                  {/* Team Members */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Team Members</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.members || []).map((member) => (
                        <Badge key={member.id} variant="outline" className="text-xs">
                          {member.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Team Composition - Minimalist Design */}
                  {analysis.analysis?.teamComposition && (
                    <div className="space-y-4">
                      {/* Strengths */}
                      {(analysis.analysis.teamComposition.strengths || []).length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Strengths</h4>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.analysis.teamComposition.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Gaps */}
                      {(analysis.analysis.teamComposition.gaps || []).length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Gaps</h4>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.analysis.teamComposition.gaps.map((g, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {(analysis.analysis.teamComposition.recommendations || []).length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recommendations</h4>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.analysis.teamComposition.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optimal Compositions */}
                  {analysis.analysis?.optimalCompositions && analysis.analysis.optimalCompositions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Optimal Compositions</h4>
                      <div className="space-y-3">
                        {analysis.analysis.optimalCompositions.map((comp, i) => (
                          <Card key={i} className="border border-gray-200 dark:border-gray-800">
                            <CardContent className="p-4">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{comp.projectType}</h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {comp.recommendedMembers.join(', ')}
                              </p>
                              <AIResponse content={comp.reasoning} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {analysis.analysis?.skillGaps && analysis.analysis.skillGaps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Skill Gaps</h4>
                      </div>
                      <div className="space-y-3">
                        {analysis.analysis.skillGaps.map((gap, i) => (
                          <Card key={i} className="border-l-2 border-l-amber-500 border-gray-200 dark:border-gray-800">
                            <CardContent className="p-4">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{gap.gap}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{gap.impact}</p>
                              {gap.suggestedHiringProfile && (
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1.5">Hiring Profile</p>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <p><span className="font-medium">Role:</span> {gap.suggestedHiringProfile.role}</p>
                                    <p><span className="font-medium">Skills:</span> {gap.suggestedHiringProfile.skills.join(', ')}</p>
                                    <p><span className="font-medium">Traits:</span> {gap.suggestedHiringProfile.traits.join(', ')}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {analyses.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800"></div>
      )}

      {/* Analyze Team DNA Section */}
      {members.length > 0 ? (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Analyze Team DNA
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get AI-powered insights on team composition
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-sm">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Product Development Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={isAnalyzing}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Select Members</Label>
                <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, member.id])
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id))
                          }
                        }}
                        disabled={isAnalyzing}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{member.name} ({member.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!teamName.trim() || selectedMembers.length === 0 || isAnalyzing}
                className="w-full"
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Team DNA'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          Add team members in the roster above to run DNA analysis.
        </p>
      )}
    </div>
  )
}
