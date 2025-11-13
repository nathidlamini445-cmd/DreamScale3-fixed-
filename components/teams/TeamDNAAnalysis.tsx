"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Dna, Plus, Users, TrendingUp, AlertCircle } from "lucide-react"
import { TeamDNAAnalysis, TeamMember } from '@/lib/teams-types'
import { AIResponse } from '@/components/ai-response'
import { Badge } from "@/components/ui/badge"

interface TeamDNAAnalysisProps {
  analyses: TeamDNAAnalysis[]
  members: TeamMember[]
  onAddAnalysis: (analysis: TeamDNAAnalysis) => void
  onUpdateMembers: (members: TeamMember[]) => void
}

export default function TeamDNAAnalysis({ analyses, members, onAddAnalysis, onUpdateMembers }: TeamDNAAnalysisProps) {
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
    <div className="space-y-6">
      {/* Add Team Member Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2563eb]" />
            Team Members
          </CardTitle>
          <CardDescription>
            Add team members to build your team DNA profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No team members yet. Add your first member below.</p>
          )}

          {!showAddMember ? (
            <Button onClick={() => setShowAddMember(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Name *</Label>
                    <Input
                      id="member-name"
                      placeholder="John Doe"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-role">Role *</Label>
                    <Input
                      id="member-role"
                      placeholder="Software Engineer"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email (Optional)</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-skills">Skills (comma-separated)</Label>
                  <Input
                    id="member-skills"
                    placeholder="React, TypeScript, Leadership"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMember} className="flex-1">
                    Add Member
                  </Button>
                  <Button onClick={() => setShowAddMember(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Analyze Team DNA Section */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-[#2563eb]" />
              Analyze Team DNA
            </CardTitle>
            <CardDescription>
              Get AI-powered insights on team composition, strengths, gaps, and optimal project teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Product Development Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Team Members</Label>
                <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
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
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Team DNA...
                  </>
                ) : (
                  <>
                    <Dna className="w-4 h-4 mr-2" />
                    Analyze Team DNA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team DNA Analyses ({analyses.length})</h3>
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-[#2563eb]" />
                  {analysis.teamName}
                </CardTitle>
                <CardDescription>
                  Analyzed on {new Date(analysis.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Composition */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Team Composition
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Strengths</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {analysis.analysis.teamComposition.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Gaps</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {analysis.analysis.teamComposition.gaps.map((g, i) => (
                          <li key={i}>• {g}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Recommendations</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {analysis.analysis.teamComposition.recommendations.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Optimal Compositions */}
                {analysis.analysis.optimalCompositions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Optimal Team Compositions</h4>
                    <div className="space-y-3">
                      {analysis.analysis.optimalCompositions.map((comp, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{comp.projectType}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Recommended:</strong> {comp.recommendedMembers.join(', ')}
                            </p>
                            <AIResponse content={comp.reasoning} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Gaps & Hiring Profiles */}
                {analysis.analysis.skillGaps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Skill Gaps & Hiring Recommendations
                    </h4>
                    <div className="space-y-3">
                      {analysis.analysis.skillGaps.map((gap, i) => (
                        <Card key={i} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">{gap.gap}</h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{gap.impact}</p>
                            {gap.suggestedHiringProfile && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                                <h6 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Hiring Profile:</h6>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  <strong>Role:</strong> {gap.suggestedHiringProfile.role}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  <strong>Skills:</strong> {gap.suggestedHiringProfile.skills.join(', ')}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>Traits:</strong> {gap.suggestedHiringProfile.traits.join(', ')}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

