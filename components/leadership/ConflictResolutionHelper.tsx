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
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#39d2c0]" />
            Conflict Resolution Helper
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get step-by-step guidance, conversation structures, and scripts for resolving team conflicts
          </p>
        </div>
        <div className="space-y-4">
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
        </div>
      </div>

      {selectedConflict && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolution Guidance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConflict(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Conflict involving: {selectedConflict.parties.join(', ')}
            </p>
          </div>
          <div className="space-y-6">
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
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Step {step.step}: {step.action}</h4>
                      <div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                            {step.script}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedConflict.guidance.scripts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Conversation Scripts</h3>
                <div className="space-y-3">
                  {selectedConflict.guidance.scripts.map((script, index) => (
                    <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{script}</p>
                      </div>
                    </div>
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
          </div>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conflict History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} resolved</p>
          </div>
          <div>
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
          </div>
        </div>
      )}
    </div>
  )
}

