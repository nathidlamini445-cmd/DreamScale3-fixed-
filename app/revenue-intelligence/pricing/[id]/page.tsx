"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { PricingStrategy } from '@/lib/revenue-types'
import { AIResponse } from '@/components/ai-response'

export default function PricingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [strategy, setStrategy] = useState<PricingStrategy | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('revenueos:data')
      if (saved) {
        const data = JSON.parse(saved)
        const found = data.pricingStrategies?.find((s: PricingStrategy) => s.id === id)
        if (found) {
          setStrategy(found)
        }
      }
    } catch (e) {
      console.error('Failed to load pricing strategy:', e)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const getStatusColor = (status: PricingStrategy['abTests'][0]['status']) => {
    switch (status) {
      case 'running': return 'bg-transparent text-green-600 dark:text-green-400'
      case 'completed': return 'bg-transparent text-blue-600 dark:text-blue-400'
      case 'draft': return 'bg-transparent text-gray-500 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pricing strategy...</p>
        </div>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pricing Strategy Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The pricing strategy you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=pricing')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Revenue Intelligence
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SidebarNav />
      <main className="ml-64">
        {/* Header - Ultra Minimal */}
        <div className="bg-white dark:bg-slate-950">
          <div className="max-w-6xl px-12 py-10">
            <Button
              onClick={() => router.push('/revenue-intelligence?tab=pricing')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                {strategy.productName}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Created on {new Date(strategy.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Ultra Minimal, Left Aligned, Wider */}
        <div className="max-w-6xl px-12 pb-16">
          <div className="space-y-16">
            {/* Current Pricing */}
            {(strategy.currentPricing?.length || 0) > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Current Pricing Tiers</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {strategy.currentPricing.map((tier, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{tier.tier}</h3>
                      <p className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                        ${tier.price}<span className="text-base font-medium text-gray-400 dark:text-gray-500">/mo</span>
                      </p>
                      <ul className="text-base font-medium text-gray-500 dark:text-gray-400 space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitor Pricing */}
            {(strategy.competitorPricing?.length || 0) > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Competitor Pricing</h2>
                <div className="space-y-8">
                  {strategy.competitorPricing.map((competitor, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-6">{competitor.competitor}</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {competitor.pricing.map((tier, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-950 border border-gray-200/40 dark:border-gray-800/40 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                            <p className="text-base font-medium text-gray-500 dark:text-gray-400 mb-1">{tier.tier}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">${tier.price}/mo</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {strategy.aiRecommendations && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">AI Recommendations</h2>
                {(strategy.aiRecommendations?.optimalPricing?.length || 0) > 0 && (
                  <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-6">Optimal Pricing</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {strategy.aiRecommendations.optimalPricing.map((tier, i) => (
                        <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                          <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{tier.tier}</h4>
                          <p className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                            ${tier.price}/mo
                          </p>
                          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 leading-relaxed">{tier.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {strategy.aiRecommendations.marketPosition && (
                  <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-5">Market Position</h3>
                    <div className="max-w-4xl">
                      <AIResponse content={strategy.aiRecommendations.marketPosition} />
                    </div>
                  </div>
                )}
                {(strategy.aiRecommendations?.suggestions?.length || 0) > 0 && (
                  <div>
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-5">Suggestions</h3>
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <ul className="space-y-3 text-base font-medium text-gray-600 dark:text-gray-400 max-w-4xl">
                        {strategy.aiRecommendations.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                            <span className="leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* A/B Tests */}
            {(strategy.abTests?.length || 0) > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">A/B Tests</h2>
                <div className="space-y-8">
                  {strategy.abTests.map((test) => (
                    <div key={test.id} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">{test.name}</h3>
                        <Badge variant="outline" className={`${getStatusColor(test.status)} border-0`}>{test.status}</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-slate-950 border border-gray-200/40 dark:border-gray-800/40 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                          <p className="text-base font-medium text-gray-500 dark:text-gray-400 mb-2">Variant A</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            ${test.variantA.price}/mo
                          </p>
                          <ul className="text-base font-medium text-gray-500 dark:text-gray-400 space-y-2">
                            {test.variantA.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                                <span className="leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white dark:bg-slate-950 border border-gray-200/40 dark:border-gray-800/40 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                          <p className="text-base font-medium text-gray-500 dark:text-gray-400 mb-2">Variant B</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            ${test.variantB.price}/mo
                          </p>
                          <ul className="text-base font-medium text-gray-500 dark:text-gray-400 space-y-2">
                            {test.variantB.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                                <span className="leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {test.results && (
                        <div className="pt-6 border-t border-gray-200/60 dark:border-gray-800/60">
                          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Results</p>
                          <p className="text-base font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                            Winner: Variant {test.results.variant} - {test.results.conversionRate}% conversion, 
                            ${test.results.revenue} revenue
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

