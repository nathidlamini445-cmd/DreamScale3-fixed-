"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { LTVAnalysis } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

interface LTVCalculatorProps {
  analyses: LTVAnalysis[]
  onAddAnalysis: (analysis: LTVAnalysis) => void
}

export default function LTVCalculator({ analyses, onAddAnalysis }: LTVCalculatorProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    segment: '',
    averageOrderValue: 0,
    purchaseFrequency: 0,
    customerLifespan: 0,
    cac: 0
  })

  const handleCalculate = async () => {
    if (!formData.segment.trim()) {
      alert('Please enter customer segment')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/ltv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to calculate LTV')
      }

      const ltvData = await response.json()
      
      const analysis: LTVAnalysis = {
        id: Date.now().toString(),
        customerSegment: formData.segment,
        averageLTV: ltvData.averageLTV || 0,
        cac: formData.cac || ltvData.cac || 0,
        ltvCacRatio: ltvData.ltvCacRatio || 0,
        analysis: ltvData.analysis || {
          segmentValue: '',
          acquisitionFocus: [],
          recommendations: []
        },
        predictions: ltvData.predictions || [],
        date: new Date().toISOString()
      }

      onAddAnalysis(analysis)
      setFormData({ segment: '', averageOrderValue: 0, purchaseFrequency: 0, customerLifespan: 0, cac: 0 })
    } catch (error) {
      console.error('Failed to calculate LTV:', error)
      alert('Failed to calculate LTV. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const getRatioColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600 dark:text-green-400'
    if (ratio >= 2) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Customer Lifetime Value (LTV) Calculator
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Predict customer lifetime value, identify valuable segments, and optimize acquisition efforts
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="segment" className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Segment *</Label>
              <Input
                id="segment"
                placeholder="Enterprise customers, SMB, Freemium users"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aov" className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Order Value</Label>
              <Input
                id="aov"
                type="number"
                placeholder="Enter average order value (e.g., 100)"
                value={formData.averageOrderValue || ''}
                onChange={(e) => setFormData({ ...formData, averageOrderValue: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Calculate: Total revenue / Number of orders. This requires your actual sales data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Frequency (per year)</Label>
              <Input
                id="frequency"
                type="number"
                step="0.1"
                placeholder="How many times per year (e.g., 12)"
                value={formData.purchaseFrequency || ''}
                onChange={(e) => setFormData({ ...formData, purchaseFrequency: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                How often does this customer segment purchase? Check your sales history for accurate data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifespan" className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Lifespan (years)</Label>
              <Input
                id="lifespan"
                type="number"
                step="0.1"
                placeholder="Average customer lifetime (e.g., 2.5)"
                value={formData.customerLifespan || ''}
                onChange={(e) => setFormData({ ...formData, customerLifespan: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Average time a customer stays with you. Calculate from your customer retention data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cac" className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Acquisition Cost (CAC)</Label>
              <Input
                id="cac"
                type="number"
                placeholder="Enter your CAC (e.g., 50)"
                value={formData.cac || ''}
                onChange={(e) => setFormData({ ...formData, cac: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Calculate: Total marketing & sales costs / New customers acquired. Requires your actual spending data.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCalculate}
            disabled={!formData.segment.trim() || isAnalyzing}
            className="w-full mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating LTV...
              </>
            ) : (
              <>
                Calculate LTV
              </>
            )}
          </Button>
        </div>
      </div>

      {analyses.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated LTV Analyses ({analyses.length})</h3>
          <div className="grid gap-6">
            {analyses.map((analysis) => (
              <div 
                key={analysis.id} 
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => router.push(`/revenue-intelligence/ltv/${analysis.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      {analysis.customerSegment}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{new Date(analysis.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">LTV</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatCurrency(analysis.averageLTV)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">CAC</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatCurrency(analysis.cac)}
                        </p>
                      </div>
                      <div className={cn(
                        "bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]"
                      )}>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ratio</p>
                        <p className={cn("text-lg font-medium", getRatioColor(analysis.ltvCacRatio))}>
                          {analysis.ltvCacRatio.toFixed(1)}:1
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/revenue-intelligence/ltv/${analysis.id}`)
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

