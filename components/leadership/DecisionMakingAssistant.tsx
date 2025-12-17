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
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#39d2c0]" />
            Decision-Making Assistant
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get AI-powered decision frameworks, pros/cons analysis, and strategic insights
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-description">Decision to Make *</Label>
            <Textarea
              id="decision-description"
              placeholder="Describe the specific decision you need to make (e.g., Should we hire a CTO now or wait 6 months?)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Enter your actual decision question. This requires your real business situation and context.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-context">Additional Context (Optional)</Label>
            <Textarea
              id="decision-context"
              placeholder="Provide relevant context: budget constraints, timeline, team situation, market conditions..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Add any specific details about your situation that will help provide better analysis.
            </p>
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
        </div>
      </div>

      {selectedDecision && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Decision Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDecision(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedDecision.description}
            </p>
          </div>
          <div className="space-y-6">
            {selectedDecision.analysis?.overview && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">Decision Overview</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <AIResponse content={selectedDecision.analysis.overview} />
                </div>
              </div>
            )}
            {selectedDecision.analysis?.frameworks && selectedDecision.analysis.frameworks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Decision Frameworks</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.frameworks.map((framework, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{framework.name}</h4>
                      <div>
                        <AIResponse content={framework.analysis} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Pros</h3>
                <ul className="space-y-2">
                  {(selectedDecision.analysis?.pros || []).map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">+</span>
                      <span className="text-gray-700 dark:text-gray-300">{pro}</span>
                    </li>
                  ))}
                  {(!selectedDecision.analysis?.pros || selectedDecision.analysis.pros.length === 0) && (
                    <li className="text-gray-500 dark:text-gray-400 text-sm">No pros listed</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Cons</h3>
                <ul className="space-y-2">
                  {(selectedDecision.analysis?.cons || []).map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span className="text-gray-700 dark:text-gray-300">{con}</span>
                    </li>
                  ))}
                  {(!selectedDecision.analysis?.cons || selectedDecision.analysis.cons.length === 0) && (
                    <li className="text-gray-500 dark:text-gray-400 text-sm">No cons listed</li>
                  )}
                </ul>
              </div>
            </div>

            {selectedDecision.analysis?.secondOrderEffects && selectedDecision.analysis.secondOrderEffects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Second-Order Effects</h3>
                <ul className="space-y-3">
                  {selectedDecision.analysis.secondOrderEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <span className="text-[#39d2c0] mt-1 font-bold">→</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.thirdOrderEffects && selectedDecision.analysis.thirdOrderEffects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Third-Order Effects (Long-Term Strategic Implications)</h3>
                <ul className="space-y-3">
                  {selectedDecision.analysis.thirdOrderEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <span className="text-purple-600 dark:text-purple-400 mt-1 font-bold">⟳</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.risks && selectedDecision.analysis.risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">Risk Analysis</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.risks.map((risk, index) => (
                    <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{risk.risk}</h4>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            risk.probability === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            risk.probability === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}>
                            Probability: {risk.probability}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            risk.impact === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            risk.impact === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}>
                            Impact: {risk.impact}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mitigation Strategy:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis?.opportunities && selectedDecision.analysis.opportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">Opportunities</h3>
                <ul className="space-y-3">
                  {selectedDecision.analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <span className="text-green-600 dark:text-green-400 mt-1 font-bold">★</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.alternatives && selectedDecision.analysis.alternatives.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Alternative Options</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.alternatives.map((alternative, index) => (
                    <div key={index} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{alternative.option}</h4>
                      <div className="mb-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          alternative.viability === 'High' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          alternative.viability === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          Viability: {alternative.viability}
                        </span>
                        {alternative.viabilityReasoning && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{alternative.viabilityReasoning}</p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Pros:</p>
                          <ul className="space-y-1">
                            {alternative.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-green-500 mt-1">+</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Cons:</p>
                          <ul className="space-y-1">
                            {alternative.cons.map((con, i) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">-</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {alternative.whenToConsider && (
                        <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">When to Consider:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{alternative.whenToConsider}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis?.timelineConsiderations && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">Timeline Considerations</h3>
                <AIResponse content={selectedDecision.analysis.timelineConsiderations} />
              </div>
            )}

            {selectedDecision.analysis?.resourceRequirements && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">Resource Requirements</h3>
                <AIResponse content={selectedDecision.analysis.resourceRequirements} />
              </div>
            )}

            {selectedDecision.analysis?.stakeholderImpact && (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-teal-900 dark:text-teal-100">Stakeholder Impact</h3>
                <AIResponse content={selectedDecision.analysis.stakeholderImpact} />
              </div>
            )}

            {selectedDecision.analysis?.implementationPlan && selectedDecision.analysis.implementationPlan.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Implementation Plan</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.implementationPlan.map((phase, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{phase.phase}</h4>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>⏱️ {phase.timeline}</span>
                          <span>📦 {phase.resources}</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {phase.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-[#39d2c0] mt-1 font-bold">{stepIndex + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis?.successMetrics && selectedDecision.analysis.successMetrics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Success Metrics</h3>
                <ul className="space-y-2">
                  {selectedDecision.analysis.successMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-[#39d2c0] mt-1">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.caseStudies && selectedDecision.analysis.caseStudies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Case Studies</h3>
                <div className="space-y-3">
                  {selectedDecision.analysis.caseStudies.map((study, index) => (
                    <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div>
                        <AIResponse content={study} />
                      </div>
                    </div>
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
          </div>
        </div>
      )}

      {decisions.length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Decision History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{decisions.length} decision{decisions.length !== 1 ? 's' : ''} analyzed</p>
          </div>
          <div>
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
          </div>
        </div>
      )}
    </div>
  )
}

