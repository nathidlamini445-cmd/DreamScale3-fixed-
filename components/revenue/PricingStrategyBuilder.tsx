"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { PricingStrategy } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface PricingStrategyBuilderProps {
  strategies: PricingStrategy[]
  onAddStrategy: (strategy: PricingStrategy) => void
}

export default function PricingStrategyBuilder({ strategies, onAddStrategy }: PricingStrategyBuilderProps) {
  const router = useRouter()
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
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Pricing Strategy Builder
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compare pricing to competitors, get AI-optimized pricing suggestions, and design pricing tiers
          </p>
        </div>
        <div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="Project Management SaaS"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  disabled={isAnalyzing}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitors" className="text-sm font-medium text-gray-700 dark:text-gray-300">Competitors (comma-separated)</Label>
                <Input
                  id="competitors"
                  placeholder="List your main competitors (e.g., Asana, Monday.com, Trello)"
                  value={formData.competitors}
                  onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                  disabled={isAnalyzing}
                  className="bg-white dark:bg-slate-950"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Enter the names of companies you compete with. Research their pricing to get accurate comparisons.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-pricing" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Pricing *</Label>
              <Textarea
                id="current-pricing"
                placeholder="Enter your actual pricing tiers:&#10;Basic: $29/month - 10 projects, 5 users&#10;Pro: $79/month - Unlimited projects, 20 users&#10;Enterprise: $199/month - Everything + priority support"
                value={formData.currentPricing}
                onChange={(e) => setFormData({ ...formData, currentPricing: e.target.value })}
                rows={4}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Enter your real pricing structure. This requires your actual product/service pricing information.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-info" className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Information (Optional)</Label>
              <Textarea
                id="market-info"
                placeholder="Target market: Small to medium businesses, 10-100 employees..."
                value={formData.marketInfo}
                onChange={(e) => setFormData({ ...formData, marketInfo: e.target.value })}
                rows={3}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!formData.productName.trim() || !formData.currentPricing.trim() || isAnalyzing}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Pricing Strategy...
                </>
              ) : (
                <>
                  Analyze & Optimize Pricing
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {strategies.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated Pricing Strategies ({strategies.length})</h3>
          <div className="grid gap-6">
            {strategies.map((strategy) => (
              <div 
                key={strategy.id} 
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => router.push(`/revenue-intelligence/pricing/${strategy.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      {strategy.productName}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{new Date(strategy.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {strategy.currentPricing.length > 0 && (
                        <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                          {strategy.currentPricing.length} Pricing Tiers
                        </Badge>
                      )}
                      {strategy.competitorPricing.length > 0 && (
                        <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                          {strategy.competitorPricing.length} Competitors
                        </Badge>
                      )}
                    </div>
                    {strategy.aiRecommendations?.optimalPricing.length > 0 && (
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        AI Recommendations: {strategy.aiRecommendations.optimalPricing.length} optimal pricing tiers
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/revenue-intelligence/pricing/${strategy.id}`)
                    }}
                    className="ml-4 border-gray-200/60 dark:border-gray-800/60 font-medium"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

