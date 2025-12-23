"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"
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
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Decision-Making Assistant
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get AI-powered decision frameworks, pros/cons analysis, and strategic insights
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Decision to Make *</Label>
            <Textarea
              id="decision-description"
              placeholder="Describe the specific decision you need to make (e.g., Should we hire a CTO now or wait 6 months?)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isAnalyzing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Enter your actual decision question. This requires your real business situation and context.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-context" className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Context (Optional)</Label>
            <Textarea
              id="decision-context"
              placeholder="Provide relevant context: budget constraints, timeline, team situation, market conditions..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              disabled={isAnalyzing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Add any specific details about your situation that will help provide better analysis.
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!description.trim() || isAnalyzing}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Decision...
              </>
            ) : (
              <>
                Analyze Decision
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedDecision && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Decision Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDecision(null)}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              {selectedDecision.description}
            </p>
          </div>
          <div className="space-y-12">
            {selectedDecision.analysis?.overview && (
              <div className="max-w-4xl">
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Decision Overview</h3>
                <AIResponse content={selectedDecision.analysis.overview} />
              </div>
            )}
            {selectedDecision.analysis?.frameworks && selectedDecision.analysis.frameworks.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Decision Frameworks</h3>
                <div className="space-y-6">
                  {selectedDecision.analysis.frameworks.map((framework, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">{framework.name}</h4>
                      <div>
                        <AIResponse content={framework.analysis} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Pros</h3>
                <ul className="space-y-3">
                  {(selectedDecision.analysis?.pros || []).map((pro, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">+</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{pro}</span>
                    </li>
                  ))}
                  {(!selectedDecision.analysis?.pros || selectedDecision.analysis.pros.length === 0) && (
                    <li className="text-sm font-medium text-gray-500 dark:text-gray-400">No pros listed</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Cons</h3>
                <ul className="space-y-3">
                  {(selectedDecision.analysis?.cons || []).map((con, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-500 dark:text-red-400 mt-0.5">-</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{con}</span>
                    </li>
                  ))}
                  {(!selectedDecision.analysis?.cons || selectedDecision.analysis.cons.length === 0) && (
                    <li className="text-sm font-medium text-gray-500 dark:text-gray-400">No cons listed</li>
                  )}
                </ul>
              </div>
            </div>

            {selectedDecision.analysis?.secondOrderEffects && selectedDecision.analysis.secondOrderEffects.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Second-Order Effects</h3>
                <ul className="space-y-4">
                  {selectedDecision.analysis.secondOrderEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                      <span className="text-gray-600 dark:text-gray-400 mt-0.5 font-medium">→</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.thirdOrderEffects && selectedDecision.analysis.thirdOrderEffects.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Third-Order Effects (Long-Term Strategic Implications)</h3>
                <ul className="space-y-4">
                  {selectedDecision.analysis.thirdOrderEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                      <span className="text-gray-600 dark:text-gray-400 mt-0.5 font-medium">⟳</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.risks && selectedDecision.analysis.risks.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Risk Analysis</h3>
                <div className="space-y-4">
                  {selectedDecision.analysis.risks.map((risk, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{risk.risk}</h4>
                        <div className="flex gap-3 text-sm">
                          <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                            risk.probability === 'High' ? 'bg-transparent text-red-600 dark:text-red-400' :
                            risk.probability === 'Medium' ? 'bg-transparent text-yellow-600 dark:text-yellow-400' :
                            'bg-transparent text-green-600 dark:text-green-400'
                          }`}>
                            Probability: {risk.probability}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                            risk.impact === 'High' ? 'bg-transparent text-red-600 dark:text-red-400' :
                            risk.impact === 'Medium' ? 'bg-transparent text-yellow-600 dark:text-yellow-400' :
                            'bg-transparent text-green-600 dark:text-green-400'
                          }`}>
                            Impact: {risk.impact}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mitigation Strategy:</p>
                        <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis?.opportunities && selectedDecision.analysis.opportunities.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Opportunities</h3>
                <ul className="space-y-3">
                  {selectedDecision.analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDecision.analysis?.alternatives && selectedDecision.analysis.alternatives.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Alternative Options</h3>
                <div className="space-y-6">
                  {selectedDecision.analysis.alternatives.map((alternative, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{alternative.option}</h4>
                      <div className="mb-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                          alternative.viability === 'High' ? 'bg-transparent text-green-600 dark:text-green-400' :
                          alternative.viability === 'Medium' ? 'bg-transparent text-yellow-600 dark:text-yellow-400' :
                          'bg-transparent text-red-600 dark:text-red-400'
                        }`}>
                          Viability: {alternative.viability}
                        </span>
                        {alternative.viabilityReasoning && (
                          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{alternative.viabilityReasoning}</p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white mb-3">Pros:</p>
                          <ul className="space-y-2">
                            {alternative.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 dark:text-green-400 mt-0.5">+</span>
                                <span className="leading-relaxed">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white mb-3">Cons:</p>
                          <ul className="space-y-2">
                            {alternative.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
                                <span className="text-red-500 dark:text-red-400 mt-0.5">-</span>
                                <span className="leading-relaxed">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {alternative.whenToConsider && (
                        <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When to Consider:</p>
                          <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{alternative.whenToConsider}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDecision.analysis?.timelineConsiderations && (
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Timeline Considerations</h3>
                <AIResponse content={selectedDecision.analysis.timelineConsiderations} />
              </div>
            )}

            {selectedDecision.analysis?.resourceRequirements && (
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Resource Requirements</h3>
                <AIResponse content={selectedDecision.analysis.resourceRequirements} />
              </div>
            )}

            {selectedDecision.analysis?.stakeholderImpact && (
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Stakeholder Impact</h3>
                <AIResponse content={selectedDecision.analysis.stakeholderImpact} />
              </div>
            )}

            {selectedDecision.analysis?.implementationPlan && selectedDecision.analysis.implementationPlan.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Implementation Plan</h3>
                <div className="space-y-6">
                  {selectedDecision.analysis.implementationPlan.map((phase, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{phase.phase}</h4>
                        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{phase.timeline}</span>
                          <span>{phase.resources}</span>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {phase.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5">{stepIndex + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
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
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Success Metrics</h3>
                <ul className="space-y-3">
                  {selectedDecision.analysis.successMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {selectedDecision.analysis.recommendation && (
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Recommendation</h3>
                <AIResponse content={selectedDecision.analysis.recommendation} />
              </div>
            )}
          </div>
        </div>
      )}

      {decisions.length > 0 && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-4">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Decision History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{decisions.length} decision{decisions.length !== 1 ? 's' : ''} analyzed</p>
          </div>
          <div>
            <div className="space-y-3">
              {decisions.slice().reverse().map((decision) => (
                <div
                  key={decision.id}
                  className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all"
                  onClick={() => setSelectedDecision(decision)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900 dark:text-white">{decision.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(decision.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="border-gray-200/60 dark:border-gray-800/60 font-medium">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

