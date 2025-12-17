"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Target, CheckCircle2, Clock } from "lucide-react"
import { PricingStrategy } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface PricingStrategyBuilderProps {
  strategies: PricingStrategy[]
  onAddStrategy: (strategy: PricingStrategy) => void
}

export default function PricingStrategyBuilder({ strategies, onAddStrategy }: PricingStrategyBuilderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    productName: '',
    currentPricing: '',
    competitors: '',
    marketInfo: ''
  })

  const handleAnalyze = async () => {
    if (!formData.productName.trim() || !formData.currentPricing.trim()) {
      alert('Please enter product name and current pricing')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/pricing-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to analyze pricing strategy')
      }

      const strategyData = await response.json()
      
      const strategy: PricingStrategy = {
        id: Date.now().toString(),
        productName: formData.productName,
        currentPricing: strategyData.currentPricing || [],
        competitorPricing: strategyData.competitorPricing || [],
        aiRecommendations: strategyData.aiRecommendations || {
          optimalPricing: [],
          marketPosition: '',
          suggestions: []
        },
        abTests: [],
        date: new Date().toISOString()
      }

      onAddStrategy(strategy)
      setFormData({ productName: '', currentPricing: '', competitors: '', marketInfo: '' })
    } catch (error) {
      console.error('Failed to analyze pricing strategy:', error)
      alert('Failed to analyze pricing strategy. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusColor = (status: PricingStrategy['abTests'][0]['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#2563eb]" />
            Pricing Strategy Builder
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Compare pricing to competitors, get AI-optimized pricing suggestions, and design pricing tiers
          </p>
        </div>
        <div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="Project Management SaaS"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitors">Competitors (comma-separated)</Label>
                <Input
                  id="competitors"
                  placeholder="List your main competitors (e.g., Asana, Monday.com, Trello)"
                  value={formData.competitors}
                  onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Enter the names of companies you compete with. Research their pricing to get accurate comparisons.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-pricing">Current Pricing *</Label>
              <Textarea
                id="current-pricing"
                placeholder="Enter your actual pricing tiers:&#10;Basic: $29/month - 10 projects, 5 users&#10;Pro: $79/month - Unlimited projects, 20 users&#10;Enterprise: $199/month - Everything + priority support"
                value={formData.currentPricing}
                onChange={(e) => setFormData({ ...formData, currentPricing: e.target.value })}
                rows={4}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Enter your real pricing structure. This requires your actual product/service pricing information.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-info">Market Information (Optional)</Label>
              <Textarea
                id="market-info"
                placeholder="Target market: Small to medium businesses, 10-100 employees..."
                value={formData.marketInfo}
                onChange={(e) => setFormData({ ...formData, marketInfo: e.target.value })}
                rows={3}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!formData.productName.trim() || !formData.currentPricing.trim() || isAnalyzing}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Pricing Strategy...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Analyze & Optimize Pricing
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {strategies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing Strategies ({strategies.length})</h3>
          {strategies.map((strategy) => (
            <div key={strategy.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#2563eb]" />
                  {strategy.productName}
                </CardTitle>
                <CardDescription>
                  Created on {new Date(strategy.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Pricing */}
                {strategy.currentPricing.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Current Pricing Tiers</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {strategy.currentPricing.map((tier, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{tier.tier}</h5>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              ${tier.price}/mo
                            </p>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              {tier.features.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competitor Pricing */}
                {strategy.competitorPricing.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Competitor Pricing</h4>
                    <div className="space-y-3">
                      {strategy.competitorPricing.map((competitor, i) => (
                        <Card key={i} className="bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{competitor.competitor}</h5>
                            <div className="grid md:grid-cols-3 gap-2">
                              {competitor.pricing.map((tier, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{tier.tier}:</span> ${tier.price}/mo
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {strategy.aiRecommendations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Recommendations</h4>
                    {strategy.aiRecommendations.optimalPricing.length > 0 && (
                      <Card className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 mb-3">
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Optimal Pricing</h5>
                          <div className="grid md:grid-cols-3 gap-3">
                            {strategy.aiRecommendations.optimalPricing.map((tier, i) => (
                              <Card key={i} className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-4">
                                  <h6 className="font-medium text-gray-900 dark:text-white mb-1">{tier.tier}</h6>
                                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    ${tier.price}/mo
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{tier.reasoning}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {strategy.aiRecommendations.marketPosition && (
                      <Card className="bg-purple-50 dark:bg-purple-900/20 mb-3">
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Market Position</h5>
                          <AIResponse content={strategy.aiRecommendations.marketPosition} />
                        </CardContent>
                      </Card>
                    )}
                    {strategy.aiRecommendations.suggestions.length > 0 && (
                      <Card className="bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                            {strategy.aiRecommendations.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* A/B Tests */}
                {strategy.abTests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">A/B Tests</h4>
                    <div className="space-y-3">
                      {strategy.abTests.map((test) => (
                        <Card key={test.id} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-gray-900 dark:text-white">{test.name}</h5>
                              <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Variant A</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  ${test.variantA.price}/mo - {test.variantA.features.join(', ')}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Variant B</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  ${test.variantB.price}/mo - {test.variantB.features.join(', ')}
                                </p>
                              </div>
                            </div>
                            {test.results && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium mb-1">Results:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Winner: Variant {test.results.variant} - {test.results.conversionRate}% conversion, 
                                  ${test.results.revenue} revenue
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

