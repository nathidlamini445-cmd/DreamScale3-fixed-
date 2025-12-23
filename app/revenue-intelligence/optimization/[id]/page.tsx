"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { RevenueOptimization } from '@/lib/revenue-types'
import { AIResponse } from '@/components/ai-response'

export default function OptimizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [optimization, setOptimization] = useState<RevenueOptimization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load optimization from localStorage
    try {
      const saved = localStorage.getItem('revenueos:data')
      if (saved) {
        const data = JSON.parse(saved)
        const found = data.optimizations?.find((opt: RevenueOptimization) => opt.id === id)
        if (found) {
          setOptimization(found)
        }
      }
    } catch (e) {
      console.error('Failed to load optimization:', e)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low': return 'bg-transparent text-green-600 dark:text-green-400'
      case 'medium': return 'bg-transparent text-yellow-600 dark:text-yellow-400'
      case 'high': return 'bg-transparent text-red-600 dark:text-red-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading optimization analysis...</p>
        </div>
      </div>
    )
  }

  if (!optimization) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Optimization Analysis Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The optimization analysis you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=optimization')} variant="outline">
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
              onClick={() => router.push('/revenue-intelligence?tab=optimization')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                Optimization Analysis
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Generated on {new Date(optimization.date).toLocaleDateString('en-US', { 
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
            {/* Business Info */}
            {optimization.businessInfo && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Business Context</h2>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{optimization.businessInfo}</p>
                </div>
              </div>
            )}

            {/* Pricing Changes */}
            {optimization.analysis.pricingChanges.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Pricing Changes</h2>
                <div className="space-y-6">
                  {optimization.analysis.pricingChanges.map((change, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">{change.suggestion}</h3>
                      <div className="mb-5 max-w-4xl">
                        <AIResponse content={change.impact} />
                      </div>
                      {change.implementation.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200/60 dark:border-gray-800/60">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Implementation Steps:</h4>
                          <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {change.implementation.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Revenue Streams */}
            {optimization.analysis.newRevenueStreams.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">New Revenue Streams</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {optimization.analysis.newRevenueStreams.map((stream, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{stream.stream}</h3>
                        <Badge variant="outline" className={`${getEffortColor(stream.effort)} border-gray-200/60 dark:border-gray-800/60 text-xs font-medium`}>
                          {stream.effort}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{stream.potential}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Timeline: {stream.timeline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upsell Opportunities */}
            {optimization.analysis.upsellOpportunities.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Upsell/Cross-sell Opportunities</h2>
                <div className="space-y-6">
                  {optimization.analysis.upsellOpportunities.map((opp, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">{opp.opportunity}</h3>
                      <div className="space-y-2 text-sm font-medium mb-5">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-900 dark:text-white">Target Segment:</span> {opp.targetSegment}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-900 dark:text-white">Potential Revenue:</span> {opp.potentialRevenue}
                        </p>
                      </div>
                      <div className="pt-5 border-t border-gray-200/60 dark:border-gray-800/60">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Approach:</h4>
                        <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {opp.approach.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-purple-500 dark:text-purple-400 mt-0.5">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Reductions */}
            {optimization.analysis.costReductions.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Cost Reduction Areas</h2>
                <div className="space-y-6">
                  {optimization.analysis.costReductions.map((reduction, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">{reduction.area}</h3>
                      <div className="space-y-2 text-sm font-medium mb-5">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-900 dark:text-white">Current Cost:</span> {reduction.currentCost}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-900 dark:text-white">Potential Savings:</span> {reduction.potentialSavings}
                        </p>
                      </div>
                      {reduction.actionItems.length > 0 && (
                        <div className="pt-5 border-t border-gray-200/60 dark:border-gray-800/60">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Action Items:</h4>
                          <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {reduction.actionItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
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

