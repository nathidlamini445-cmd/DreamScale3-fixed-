"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Brain, Plus, X } from "lucide-react"
import { Decision } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface DecisionMakingAssistantProps {
  decisions: Decision[]
  onAddDecision: (decision: Decision) => void
}

export default function DecisionMakingAssistant({ decisions, onAddDecision }: DecisionMakingAssistantProps) {
  const [description, setDescription] = useState('')
  const [context, setContext] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)

  const handleAnalyze = async () => {
    if (!description.trim()) {
      alert('Please enter a decision description')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/leadership/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, context })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze decision')
      }

      const analysis = await response.json()
      const decision: Decision = {
        id: Date.now().toString(),
        description,
        context: context || undefined,
        analysis,
        date: new Date().toISOString()
      }

      onAddDecision(decision)
      setDescription('')
      setContext('')
      setSelectedDecision(decision)
    } catch (error) {
      console.error('Failed to analyze decision:', error)
      alert('Failed to analyze decision. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#39d2c0]" />
            Decision-Making Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered decision frameworks, pros/cons analysis, and strategic insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-description">Decision to Make *</Label>
            <Textarea
              id="decision-description"
              placeholder="Describe the decision you need to make..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isAnalyzing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-context">Additional Context (Optional)</Label>
            <Textarea
              id="decision-context"
              placeholder="Provide any relevant context, constraints, or background information..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!description.trim() || isAnalyzing}
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Decision...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Decision
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {selectedDecision && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Decision Analysis</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDecision(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {selectedDecision.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedDecision.analysis.frameworks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Decision Frameworks</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.frameworks.map((framework, index) => (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                      <CardHeader>
                        <CardTitle className="text-base">{framework.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AIResponse content={framework.analysis} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Pros</h3>
                <ul className="space-y-2">
                  {selectedDecision.analysis.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">+</span>
                      <span className="text-gray-700 dark:text-gray-300">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Cons</h3>
                <ul className="space-y-2">
                  {selectedDecision.analysis.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span className="text-gray-700 dark:text-gray-300">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedDecision.analysis.secondOrderEffects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Second-Order Effects</h3>
                <ul className="space-y-2">
                  {selectedDecision.analysis.secondOrderEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#39d2c0] mt-1">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis.caseStudies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Case Studies</h3>
                <div className="space-y-3">
                  {selectedDecision.analysis.caseStudies.map((study, index) => (
                    <Card key={index} className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="pt-4">
                        <AIResponse content={study} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis.recommendation && (
              <div className="bg-[#39d2c0]/10 border border-[#39d2c0]/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-[#39d2c0]">Recommendation</h3>
                <AIResponse content={selectedDecision.analysis.recommendation} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Decision History</CardTitle>
            <CardDescription>{decisions.length} decision{decisions.length !== 1 ? 's' : ''} analyzed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {decisions.slice().reverse().map((decision) => (
                <Card
                  key={decision.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => setSelectedDecision(decision)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{decision.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(decision.date).toLocaleDateString()}
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

