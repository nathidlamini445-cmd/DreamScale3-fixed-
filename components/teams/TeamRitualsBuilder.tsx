"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Plus, Clock } from "lucide-react"
import { TeamRitual } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { AnalysisItemCard } from './AnalysisItemCard'
import { Card, CardContent } from "@/components/ui/card"

interface TeamRitualsBuilderProps {
  rituals: TeamRitual[]
  onAddRitual: (ritual: TeamRitual) => void
  onDeleteRitual?: (id: string) => void
}

export default function TeamRitualsBuilder({ rituals, onAddRitual, onDeleteRitual }: TeamRitualsBuilderProps) {
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
        preparation: ritualData.preparation,
        aiSuggestions: ritualData.aiSuggestions || {
          whyNeeded: '',
          bestPractices: [],
          commonMistakes: []
        },
        followUp: ritualData.followUp,
        variations: ritualData.variations,
        resources: ritualData.resources,
        troubleshooting: ritualData.troubleshooting,
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
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Team Rituals Builder
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create custom meeting structures, check-ins, and retrospectives tailored to your team
            </p>
          </div>
        <div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium">
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
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
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
          </div>
        </CardContent>
      </Card>

      {/* Rituals List */}
      {rituals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Rituals ({rituals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rituals.map((ritual) => (
              <AnalysisItemCard
                key={ritual.id}
                id={ritual.id}
                title={ritual.name}
                subtitle={`${getTypeLabel(ritual.type)} • ${ritual.frequency}`}
                date={ritual.date}
                icon={<Calendar className="w-5 h-5 text-purple-600" />}
                badges={[
                  { label: `${ritual.duration} min`, variant: 'secondary' },
                  { label: ritual.frequency, variant: 'outline' }
                ]}
                onDelete={(id) => {
                  if (onDeleteRitual) {
                    onDeleteRitual(id)
                  }
                }}
                type="ritual"
              >
                <div className="space-y-5">
                  {/* Purpose */}
                  {ritual.purpose && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Purpose</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ritual.purpose}</p>
                    </div>
                  )}

                  {/* Structure */}
                  {ritual.structure.sections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        Structure ({ritual.duration} min)
                      </h4>
                      <div className="space-y-2">
                        {ritual.structure.sections.map((section, i) => (
                          <Card key={i} className="border border-gray-200 dark:border-gray-800">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-1.5">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">{section.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {section.duration} min
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{section.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Participants */}
                  {ritual.participants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Participants</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ritual.participants.map((participant, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {ritual.aiSuggestions && (
                    <div className="space-y-4">
                      {ritual.aiSuggestions.whyNeeded && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Why Needed</h4>
                          <AIResponse content={ritual.aiSuggestions.whyNeeded} />
                        </div>
                      )}
                      {ritual.aiSuggestions.bestPractices.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Best Practices</h4>
                          <ul className="space-y-1.5">
                            {ritual.aiSuggestions.bestPractices.map((practice, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                {practice}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ritual.aiSuggestions.commonMistakes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Common Mistakes</h4>
                          <ul className="space-y-1.5">
                            {ritual.aiSuggestions.commonMistakes.map((mistake, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

