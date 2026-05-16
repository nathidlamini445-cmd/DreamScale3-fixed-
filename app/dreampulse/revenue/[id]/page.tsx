"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, BarChart3, Target, TrendingUp, Zap, Trash2 } from "lucide-react"
import { AIResponse } from '@/components/ai-response'
import Link from 'next/link'

interface RevenueAnalysis {
  id: string
  companyName: string
  industry: string
  analysis: {
    revenueStreams: {
      name: string
      type: string
      estimatedRevenue: string
      growthRate: string
      description: string
    }[]
    pricingStrategy: {
      model: string
      analysis: string
      recommendations: string[]
    }
    marketPosition: {
      position: string
      competitors: string[]
      differentiation: string
    }
    growthOpportunities: {
      opportunity: string
      potential: string
      actionItems: string[]
    }[]
    revenueProjections: {
      timeframe: string
      projection: string
      assumptions: string[]
    }[]
  }
  date: string
}

export default function RevenueAnalysisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [analysis, setAnalysis] = useState<RevenueAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('revenue:analyses') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        const found = parsed.find((a: RevenueAnalysis) => a.id === id)
        if (found) {
          setAnalysis(found)
        }
      }
    } catch (e) {
      console.error('Failed to load revenue analysis:', e)
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleDelete = () => {
    if (!analysis) return
    if (confirm(`Are you sure you want to delete "${analysis.companyName}"?`)) {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('revenue:analyses') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          const updated = parsed.filter((a: RevenueAnalysis) => a.id !== id)
          localStorage.setItem('revenue:analyses', JSON.stringify(updated))
        }
        router.push('/dreampulse')
      } catch (e) {
        console.error('Failed to delete analysis:', e)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analysis not found</p>
          <Link href="/dreampulse?tab=revenue">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Revenue Intelligence
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
      {/* Back Button - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dreampulse?tab=revenue"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Revenue Intelligence</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {analysis.companyName}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary">{analysis.industry}</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Created on {new Date(analysis.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="space-y-8">
          {/* Revenue Streams */}
          {analysis.analysis.revenueStreams.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Revenue Streams
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.analysis.revenueStreams.map((stream, i) => (
                  <Card key={i} className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stream.name}</h3>
                        <Badge variant="outline" className="text-xs">{stream.type}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong className="text-gray-900 dark:text-white">Estimated Revenue:</strong> {stream.estimatedRevenue}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong className="text-gray-900 dark:text-white">Growth Rate:</strong> {stream.growthRate}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-3">{stream.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Strategy */}
          {analysis.analysis.pricingStrategy.model && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Pricing Strategy
              </h2>
              <Card className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{analysis.analysis.pricingStrategy.model}</h3>
                  <div className="mb-4">
                    <AIResponse content={analysis.analysis.pricingStrategy.analysis} />
                  </div>
                  {analysis.analysis.pricingStrategy.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {analysis.analysis.pricingStrategy.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Market Position */}
          {analysis.analysis.marketPosition.position && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Market Position
              </h2>
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Position: {analysis.analysis.marketPosition.position}
                  </p>
                  {analysis.analysis.marketPosition.competitors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Key Competitors:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.analysis.marketPosition.competitors.map((comp, i) => (
                          <Badge key={i} variant="outline">{comp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <AIResponse content={analysis.analysis.marketPosition.differentiation} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Growth Opportunities */}
          {analysis.analysis.growthOpportunities.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Growth Opportunities
              </h2>
              <div className="space-y-4">
                {analysis.analysis.growthOpportunities.map((opp, i) => (
                  <Card key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{opp.opportunity}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{opp.potential}</p>
                      {opp.actionItems.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Action Items:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {opp.actionItems.map((item, idx) => (
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

          {/* Revenue Projections */}
          {analysis.analysis.revenueProjections.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Revenue Projections</h2>
              <div className="space-y-4">
                {analysis.analysis.revenueProjections.map((projection, i) => (
                  <Card key={i} className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{projection.timeframe}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{projection.projection}</p>
                      {projection.assumptions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assumptions:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {projection.assumptions.map((assumption, idx) => (
                              <li key={idx}>{assumption}</li>
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
        </div>
      </div>
    </div>
  )
}

