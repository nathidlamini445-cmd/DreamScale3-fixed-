"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, X } from "lucide-react"
import { Conflict } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface ConflictResolutionHelperProps {
  conflicts: Conflict[]
  onAddConflict: (conflict: Conflict) => void
}

export default function ConflictResolutionHelper({ conflicts, onAddConflict }: ConflictResolutionHelperProps) {
  const [situation, setSituation] = useState('')
  const [parties, setParties] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)

  const handleAnalyze = async () => {
    if (!situation.trim()) {
      alert('Please describe the conflict situation')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/leadership/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          situation, 
          parties: parties.split(',').map(p => p.trim()).filter(Boolean) 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze conflict')
      }

      const guidance = await response.json()
      const conflict: Conflict = {
        id: Date.now().toString(),
        situation,
        parties: parties.split(',').map(p => p.trim()).filter(Boolean),
        guidance,
        date: new Date().toISOString()
      }

      onAddConflict(conflict)
      setSituation('')
      setParties('')
      setSelectedConflict(conflict)
    } catch (error) {
      console.error('Failed to analyze conflict:', error)
      alert('Failed to analyze conflict. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#39d2c0]" />
            Conflict Resolution Helper
          </CardTitle>
          <CardDescription>
            Get step-by-step guidance, conversation structures, and scripts for resolving team conflicts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conflict-situation">Describe the Conflict *</Label>
            <Textarea
              id="conflict-situation"
              placeholder="What's happening? What are the main issues? How did it start?"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={6}
              disabled={isAnalyzing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conflict-parties">Parties Involved (comma-separated)</Label>
            <Input
              id="conflict-parties"
              placeholder="e.g., John, Sarah, Marketing Team"
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!situation.trim() || isAnalyzing}
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Conflict...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Get Resolution Guidance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {selectedConflict && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resolution Guidance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConflict(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Conflict involving: {selectedConflict.parties.join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Conversation Structure</h3>
              <div className="space-y-2">
                {selectedConflict.guidance.conversationStructure.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#39d2c0] text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedConflict.guidance.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Step-by-Step Action Plan</h3>
                <div className="space-y-4">
                  {selectedConflict.guidance.steps.map((step, index) => (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                      <CardHeader>
                        <CardTitle className="text-base">Step {step.step}: {step.action}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                            {step.script}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedConflict.guidance.scripts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Conversation Scripts</h3>
                <div className="space-y-3">
                  {selectedConflict.guidance.scripts.map((script, index) => (
                    <Card key={index} className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{script}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedConflict.guidance.negotiationTactics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Negotiation Tactics</h3>
                <ul className="space-y-2">
                  {selectedConflict.guidance.negotiationTactics.map((tactic, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#39d2c0] mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conflict History</CardTitle>
            <CardDescription>{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.slice().reverse().map((conflict) => (
                <Card
                  key={conflict.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2">{conflict.situation}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {conflict.parties.join(', ')} • {new Date(conflict.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

