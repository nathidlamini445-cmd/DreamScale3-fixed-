"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Dna, Plus, TrendingUp, AlertCircle, CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import { TeamDNAAnalysis, TeamMember } from '@/lib/teams-types'
import { AIResponse } from '@/components/ai-response'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AnalysisItemCard } from './AnalysisItemCard'

interface TeamDNAAnalysisProps {
  analyses: TeamDNAAnalysis[]
  members: TeamMember[]
  onAddAnalysis: (analysis: TeamDNAAnalysis) => void
  onUpdateMembers: (members: TeamMember[]) => void
  onDeleteAnalysis?: (id: string) => void
}

export default function TeamDNAAnalysis({ analyses, members, onAddAnalysis, onUpdateMembers, onDeleteAnalysis }: TeamDNAAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    skills: '',
    workStyle: '',
    communicationPreference: 'collaborative' as TeamMember['communicationPreference']
  })
  const [showAddMember, setShowAddMember] = useState(false)

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) {
      alert('Please enter name and role')
      return
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      email: newMember.email || undefined,
      strengths: [],
      workStyle: newMember.workStyle || 'flexible',
      communicationPreference: newMember.communicationPreference,
      skills: newMember.skills.split(',').map(s => s.trim()).filter(Boolean),
      workload: 0,
      performanceHistory: []
    }

    onUpdateMembers([...members, member])
    setNewMember({ name: '', role: '', email: '', skills: '', workStyle: '', communicationPreference: 'collaborative' })
    setShowAddMember(false)
  }

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

      if (!response.ok) {
        throw new Error('Failed to analyze team DNA')
      }

      const analysis = await response.json()
      
      const dnaAnalysis: TeamDNAAnalysis = {
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

      {/* Add Team Member Section */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Team Members
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
            {!showAddMember && (
              <Button onClick={() => setShowAddMember(true)} variant="outline" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add
              </Button>
            )}
          </div>
          
          {members.length > 0 && (
            <div className="space-y-2 mb-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-800 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                  </div>
                  {member.skills.length > 0 && (
                    <div className="flex gap-1 ml-2">
                      {member.skills.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          +{member.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showAddMember && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="member-name" className="text-xs">Name *</Label>
                  <Input
                    id="member-name"
                    placeholder="John Doe"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-role" className="text-xs">Role *</Label>
                  <Input
                    id="member-role"
                    placeholder="Engineer"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="member-skills" className="text-xs">Skills</Label>
                <Input
                  id="member-skills"
                  placeholder="React, TypeScript"
                  value={newMember.skills}
                  onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMember} size="sm" className="flex-1 h-8 text-xs">
                  Add
                </Button>
                <Button onClick={() => setShowAddMember(false)} variant="outline" size="sm" className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyze Team DNA Section */}
      {members.length > 0 && (
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
      )}
    </div>
  )
}
