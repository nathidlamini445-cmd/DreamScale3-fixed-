"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { RevenueOptimization } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface RevenueOptimizationProps {
  optimizations: RevenueOptimization[]
  onAddOptimization: (optimization: RevenueOptimization) => void
}

export default function RevenueOptimization({ optimizations, onAddOptimization }: RevenueOptimizationProps) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/revenue-intelligence/optimization/')) {
        setNavigatingId(null)
      } else {
        // Fallback: clear after 10 seconds if navigation seems stuck
        const timeout = setTimeout(() => {
          setNavigatingId(null)
        }, 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [pathname, navigatingId])
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
        businessInfo: businessInfo,
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
      case 'low': return 'bg-transparent text-green-600 dark:text-green-400'
      case 'medium': return 'bg-transparent text-yellow-600 dark:text-yellow-400'
      case 'high': return 'bg-transparent text-red-600 dark:text-red-400'
    }
  }

  return (
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Revenue Optimization
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get AI-powered suggestions for pricing changes, new revenue streams, upsell opportunities, and cost reductions
          </p>
        </div>
        <div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-info" className="text-sm font-medium text-gray-700 dark:text-gray-300">Describe Your Business Model</Label>
              <Textarea
                id="business-info"
                placeholder="We're a SaaS company selling project management software. Current pricing: $29/month basic, $79/month pro. We have 500 customers..."
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                rows={6}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!businessInfo.trim() || isAnalyzing}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Optimization Opportunities...
                </>
              ) : (
                <>
                  Get Optimization Suggestions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {optimizations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated Optimization Analyses ({optimizations.length})</h3>
          <div className="grid gap-6">
            {optimizations.map((optimization) => {
              const totalSuggestions = 
                optimization.analysis.pricingChanges.length +
                optimization.analysis.newRevenueStreams.length +
                optimization.analysis.upsellOpportunities.length +
                optimization.analysis.costReductions.length
              
              return (
                <div 
                  key={optimization.id} 
                  className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                  onClick={() => router.push(`/revenue-intelligence/optimization/${optimization.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                        Optimization Analysis
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{new Date(optimization.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                          {totalSuggestions} Suggestions
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-medium">
                        {optimization.analysis.pricingChanges.length > 0 && (
                          <div className="text-blue-600 dark:text-blue-400">
                            {optimization.analysis.pricingChanges.length} Pricing
                          </div>
                        )}
                        {optimization.analysis.newRevenueStreams.length > 0 && (
                          <div className="text-green-600 dark:text-green-400">
                            {optimization.analysis.newRevenueStreams.length} Streams
                          </div>
                        )}
                        {optimization.analysis.upsellOpportunities.length > 0 && (
                          <div className="text-purple-600 dark:text-purple-400">
                            {optimization.analysis.upsellOpportunities.length} Upsells
                          </div>
                        )}
                        {optimization.analysis.costReductions.length > 0 && (
                          <div className="text-yellow-600 dark:text-yellow-400">
                            {optimization.analysis.costReductions.length} Savings
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNavigatingId(optimization.id)
                        router.push(`/revenue-intelligence/optimization/${optimization.id}`)
                      }}
                      className="ml-4 border-gray-200/60 dark:border-gray-800/60 font-medium"
                      disabled={navigatingId === optimization.id}
                    >
                      {navigatingId === optimization.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

