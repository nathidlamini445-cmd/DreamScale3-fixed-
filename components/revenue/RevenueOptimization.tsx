"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp, DollarSign, Zap, Target } from "lucide-react"
import { RevenueOptimization } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface RevenueOptimizationProps {
  optimizations: RevenueOptimization[]
  onAddOptimization: (optimization: RevenueOptimization) => void
}

export default function RevenueOptimization({ optimizations, onAddOptimization }: RevenueOptimizationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [businessInfo, setBusinessInfo] = useState('')

  const handleAnalyze = async () => {
    if (!businessInfo.trim()) {
      alert('Please describe your business model')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze optimization')
      }

      const optimizationData = await response.json()
      
      const optimization: RevenueOptimization = {
        id: Date.now().toString(),
        analysis: optimizationData.analysis || {
          pricingChanges: [],
          newRevenueStreams: [],
          upsellOpportunities: [],
          costReductions: []
        },
        date: new Date().toISOString()
      }

      onAddOptimization(optimization)
      setBusinessInfo('')
    } catch (error) {
      console.error('Failed to analyze optimization:', error)
      alert('Failed to analyze optimization. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2563eb]" />
            Revenue Optimization
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions for pricing changes, new revenue streams, upsell opportunities, and cost reductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-info">Describe Your Business Model</Label>
              <Textarea
                id="business-info"
                placeholder="We're a SaaS company selling project management software. Current pricing: $29/month basic, $79/month pro. We have 500 customers..."
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                rows={6}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!businessInfo.trim() || isAnalyzing}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Optimization Opportunities...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Get Optimization Suggestions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {optimizations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Optimization Analyses ({optimizations.length})</h3>
          {optimizations.map((optimization) => (
            <Card key={optimization.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2563eb]" />
                  Optimization Analysis
                </CardTitle>
                <CardDescription>
                  Analyzed on {new Date(optimization.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Changes */}
                {optimization.analysis.pricingChanges.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing Changes
                    </h4>
                    <div className="space-y-3">
                      {optimization.analysis.pricingChanges.map((change, i) => (
                        <Card key={i} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{change.suggestion}</h5>
                            <AIResponse content={change.impact} />
                            {change.implementation.length > 0 && (
                              <div className="mt-3">
                                <h6 className="font-medium text-gray-900 dark:text-white mb-1">Implementation Steps:</h6>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                  {change.implementation.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Revenue Streams */}
                {optimization.analysis.newRevenueStreams.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      New Revenue Streams
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {optimization.analysis.newRevenueStreams.map((stream, i) => (
                        <Card key={i} className="bg-green-50 dark:bg-green-900/20">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{stream.stream}</h5>
                              <Badge className={getEffortColor(stream.effort)}>{stream.effort}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{stream.potential}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Timeline: {stream.timeline}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upsell Opportunities */}
                {optimization.analysis.upsellOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Upsell/Cross-sell Opportunities
                    </h4>
                    <div className="space-y-3">
                      {optimization.analysis.upsellOpportunities.map((opp, i) => (
                        <Card key={i} className="bg-purple-50 dark:bg-purple-900/20">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{opp.opportunity}</h5>
                            <div className="space-y-1 text-sm mb-2">
                              <p><strong>Target Segment:</strong> {opp.targetSegment}</p>
                              <p><strong>Potential Revenue:</strong> {opp.potentialRevenue}</p>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 dark:text-white mb-1">Approach:</h6>
                              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                {opp.approach.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Reductions */}
                {optimization.analysis.costReductions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cost Reduction Areas</h4>
                    <div className="space-y-3">
                      {optimization.analysis.costReductions.map((reduction, i) => (
                        <Card key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{reduction.area}</h5>
                            <div className="space-y-1 text-sm mb-2">
                              <p><strong>Current Cost:</strong> {reduction.currentCost}</p>
                              <p><strong>Potential Savings:</strong> {reduction.potentialSavings}</p>
                            </div>
                            {reduction.actionItems.length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-900 dark:text-white mb-1">Action Items:</h6>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                  {reduction.actionItems.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
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

