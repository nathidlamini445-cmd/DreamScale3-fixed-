"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Plus, Clock } from "lucide-react"
import { TeamRitual } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface TeamRitualsBuilderProps {
  rituals: TeamRitual[]
  onAddRitual: (ritual: TeamRitual) => void
}

export default function TeamRitualsBuilder({ rituals, onAddRitual }: TeamRitualsBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [ritualInputs, setRitualInputs] = useState({
    name: '',
    type: 'custom' as TeamRitual['type'],
    frequency: 'weekly' as TeamRitual['frequency'],
    teamSize: '',
    teamStage: '',
    needs: ''
  })

  const handleGenerateRitual = async () => {
    if (!ritualInputs.name.trim()) {
      alert('Please enter a ritual name')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/teams/generate-ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ritualInputs.name,
          type: ritualInputs.type,
          frequency: ritualInputs.frequency,
          teamSize: ritualInputs.teamSize,
          teamStage: ritualInputs.teamStage,
          needs: ritualInputs.needs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate ritual')
      }

      const ritualData = await response.json()
      
      const ritual: TeamRitual = {
        id: Date.now().toString(),
        name: ritualInputs.name,
        type: ritualInputs.type,
        frequency: ritualInputs.frequency,
        duration: ritualData.duration || 30,
        structure: ritualData.structure || {
          sections: []
        },
        purpose: ritualData.purpose || '',
        participants: ritualData.participants || [],
        aiSuggestions: ritualData.aiSuggestions || {
          whyNeeded: '',
          bestPractices: [],
          commonMistakes: []
        },
        date: new Date().toISOString()
      }

      onAddRitual(ritual)
      setRitualInputs({ name: '', type: 'custom', frequency: 'weekly', teamSize: '', teamStage: '', needs: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to generate ritual:', error)
      alert('Failed to generate ritual. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getTypeLabel = (type: TeamRitual['type']) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Generate Ritual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2563eb]" />
            Team Rituals Builder
          </CardTitle>
          <CardDescription>
            Create custom meeting structures, check-ins, and retrospectives tailored to your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]">
              <Plus className="w-4 h-4 mr-2" />
              Create New Ritual
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ritual-name">Ritual Name *</Label>
                <Input
                  id="ritual-name"
                  placeholder="Weekly Sprint Review"
                  value={ritualInputs.name}
                  onChange={(e) => setRitualInputs({ ...ritualInputs, name: e.target.value })}
                  disabled={isGenerating}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ritual-type">Ritual Type</Label>
                  <Select 
                    value={ritualInputs.type} 
                    onValueChange={(value: TeamRitual['type']) => setRitualInputs({ ...ritualInputs, type: value })}
                  >
                    <SelectTrigger id="ritual-type" disabled={isGenerating}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily-standup">Daily Standup</SelectItem>
                      <SelectItem value="weekly-review">Weekly Review</SelectItem>
                      <SelectItem value="retrospective">Retrospective</SelectItem>
                      <SelectItem value="one-on-one">One-on-One</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ritual-frequency">Frequency</Label>
                  <Select 
                    value={ritualInputs.frequency} 
                    onValueChange={(value: TeamRitual['frequency']) => setRitualInputs({ ...ritualInputs, frequency: value })}
                  >
                    <SelectTrigger id="ritual-frequency" disabled={isGenerating}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="as-needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team-size">Team Size</Label>
                  <Input
                    id="team-size"
                    placeholder="5-10 members"
                    value={ritualInputs.teamSize}
                    onChange={(e) => setRitualInputs({ ...ritualInputs, teamSize: e.target.value })}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-stage">Team Stage</Label>
                  <Input
                    id="team-stage"
                    placeholder="Startup, Scaling, Enterprise"
                    value={ritualInputs.teamStage}
                    onChange={(e) => setRitualInputs({ ...ritualInputs, teamStage: e.target.value })}
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="needs">Specific Needs (Optional)</Label>
                <Textarea
                  id="needs"
                  placeholder="Need to improve cross-functional collaboration, address blockers quickly..."
                  value={ritualInputs.needs}
                  onChange={(e) => setRitualInputs({ ...ritualInputs, needs: e.target.value })}
                  rows={3}
                  disabled={isGenerating}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateRitual}
                  disabled={!ritualInputs.name.trim() || isGenerating}
                  className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Ritual...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Generate Ritual
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" disabled={isGenerating}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rituals List */}
      {rituals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Rituals ({rituals.length})</h3>
          {rituals.map((ritual) => (
            <Card key={ritual.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#2563eb]" />
                      {ritual.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created on {new Date(ritual.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{getTypeLabel(ritual.type)}</Badge>
                    <Badge variant="outline">{ritual.frequency}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Purpose */}
                {ritual.purpose && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Purpose</h4>
                    <p className="text-gray-700 dark:text-gray-300">{ritual.purpose}</p>
                  </div>
                )}

                {/* Structure */}
                {ritual.structure.sections.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Structure ({ritual.duration} minutes total)
                    </h4>
                    <div className="space-y-3">
                      {ritual.structure.sections.map((section, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{section.name}</h5>
                              <Badge variant="outline">{section.duration} min</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participants */}
                {ritual.participants.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {ritual.participants.map((participant, i) => (
                        <Badge key={i} variant="outline">{participant}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {ritual.aiSuggestions && (
                  <div className="space-y-4">
                    {ritual.aiSuggestions.whyNeeded && (
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why This Ritual is Needed</h4>
                          <AIResponse content={ritual.aiSuggestions.whyNeeded} />
                        </CardContent>
                      </Card>
                    )}
                    {ritual.aiSuggestions.bestPractices.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Practices</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {ritual.aiSuggestions.bestPractices.map((practice, i) => (
                            <li key={i}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {ritual.aiSuggestions.commonMistakes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Mistakes to Avoid</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {ritual.aiSuggestions.commonMistakes.map((mistake, i) => (
                            <li key={i}>{mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

