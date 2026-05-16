"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { LTVAnalysis } from '@/lib/revenue-types'
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function LTVDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<LTVAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          try {
            const dbData = await supabaseData.loadRevenueData(user.id)
            if (dbData?.ltvAnalyses) {
              const found = dbData.ltvAnalyses.find((a: LTVAnalysis) => a.id === id)
              if (found) {
                setAnalysis(found)
                setIsLoading(false)
                return
              }
            }
          } catch (supabaseError) {
            console.warn('Failed to load from Supabase, trying localStorage:', supabaseError)
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
        if (saved) {
          const data = JSON.parse(saved)
          const found = data.ltvAnalyses?.find((a: LTVAnalysis) => a.id === id)
          if (found) {
            setAnalysis(found)
          }
        }
      } catch (e) {
        console.error('Failed to load LTV analysis:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalysis()
  }, [id, user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const getRatioColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600 dark:text-green-400'
    if (ratio >= 2) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading LTV analysis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                LTV Analysis Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The LTV analysis you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=ltv')} variant="outline">
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
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      <SidebarNav />
      <main className="ml-64 overflow-y-auto">
        {/* Header - Ultra Minimal */}
        <div className="bg-white dark:bg-slate-950">
          <div className="max-w-6xl px-12 py-10">
            <Button
              onClick={() => router.push('/revenue-intelligence?tab=ltv')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                {analysis.customerSegment} - LTV Analysis
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Analyzed on {new Date(analysis.date).toLocaleDateString('en-US', { 
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
            {/* Key Metrics */}
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Key Metrics</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Average LTV</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {formatCurrency(analysis.averageLTV)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Customer Acquisition Cost</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {formatCurrency(analysis.cac)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">LTV:CAC Ratio</p>
                  <p className={cn("text-2xl font-medium mb-2", getRatioColor(analysis.ltvCacRatio))}>
                    {analysis.ltvCacRatio.toFixed(2)}:1
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {analysis.ltvCacRatio >= 3 ? 'Excellent' : analysis.ltvCacRatio >= 2 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis */}
            {analysis.analysis && (
              <div className="space-y-12">
                {analysis.analysis.segmentValue && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Segment Value Analysis</h2>
                    <div className="max-w-4xl">
                      <AIResponse content={analysis.analysis.segmentValue} />
                    </div>
                  </div>
                )}
                {analysis.analysis.acquisitionFocus.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Acquisition Focus Areas</h2>
                    <div className="flex flex-wrap gap-3">
                      {analysis.analysis.acquisitionFocus.map((area, i) => (
                        <Badge key={i} variant="outline" className="text-sm font-medium px-4 py-2 border-gray-200/60 dark:border-gray-800/60">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.analysis.recommendations.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Recommendations</h2>
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {analysis.analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Predictions */}
            {analysis.predictions.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">LTV Predictions</h2>
                <div className="space-y-6">
                  {analysis.predictions.map((prediction, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-gray-900 dark:text-white">{prediction.timeframe}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-medium text-gray-900 dark:text-white">
                            {formatCurrency(prediction.predictedLTV)}
                          </span>
                          <Badge variant="outline" className="text-xs font-medium border-gray-200/60 dark:border-gray-800/60">
                            {prediction.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
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

