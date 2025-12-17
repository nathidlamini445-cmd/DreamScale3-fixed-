"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, TrendingUp, Target } from "lucide-react"
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
    if (ratio >= 3) return 'text-green-600'
    if (ratio >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2563eb]" />
            Customer Lifetime Value (LTV) Calculator
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Predict customer lifetime value, identify valuable segments, and optimize acquisition efforts
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="segment">Customer Segment *</Label>
              <Input
                id="segment"
                placeholder="Enterprise customers, SMB, Freemium users"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aov">Average Order Value</Label>
              <Input
                id="aov"
                type="number"
                placeholder="Enter average order value (e.g., 100)"
                value={formData.averageOrderValue || ''}
                onChange={(e) => setFormData({ ...formData, averageOrderValue: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Calculate: Total revenue / Number of orders. This requires your actual sales data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Purchase Frequency (per year)</Label>
              <Input
                id="frequency"
                type="number"
                step="0.1"
                placeholder="How many times per year (e.g., 12)"
                value={formData.purchaseFrequency || ''}
                onChange={(e) => setFormData({ ...formData, purchaseFrequency: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 How often does this customer segment purchase? Check your sales history for accurate data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifespan">Customer Lifespan (years)</Label>
              <Input
                id="lifespan"
                type="number"
                step="0.1"
                placeholder="Average customer lifetime (e.g., 2.5)"
                value={formData.customerLifespan || ''}
                onChange={(e) => setFormData({ ...formData, customerLifespan: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Average time a customer stays with you. Calculate from your customer retention data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cac">Customer Acquisition Cost (CAC)</Label>
              <Input
                id="cac"
                type="number"
                placeholder="Enter your CAC (e.g., 50)"
                value={formData.cac || ''}
                onChange={(e) => setFormData({ ...formData, cac: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Calculate: Total marketing & sales costs / New customers acquired. Requires your actual spending data.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCalculate}
            disabled={!formData.segment.trim() || isAnalyzing}
            className="w-full mt-4 bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating LTV...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Calculate LTV
              </>
            )}
          </Button>
        </div>
      </div>

      {analyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">LTV Analyses ({analyses.length})</h3>
          {analyses.map((analysis) => (
            <div key={analysis.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2563eb]" />
                  {analysis.customerSegment}
                </CardTitle>
                <CardDescription>
                  Analyzed on {new Date(analysis.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average LTV</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analysis.averageLTV)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CAC</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analysis.cac)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">LTV:CAC Ratio</p>
                      <p className={cn("text-2xl font-bold", getRatioColor(analysis.ltvCacRatio))}>
                        {analysis.ltvCacRatio.toFixed(2)}:1
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {analysis.ltvCacRatio >= 3 ? 'Excellent' : analysis.ltvCacRatio >= 2 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis */}
                {analysis.analysis && (
                  <div className="space-y-4">
                    {analysis.analysis.segmentValue && (
                      <Card className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Segment Value</h4>
                          <AIResponse content={analysis.analysis.segmentValue} />
                        </CardContent>
                      </Card>
                    )}
                    {analysis.analysis.acquisitionFocus.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Acquisition Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.acquisitionFocus.map((area, i) => (
                            <Badge key={i} variant="outline">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {analysis.analysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Predictions */}
                {analysis.predictions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      LTV Predictions
                    </h4>
                    <div className="space-y-2">
                      {analysis.predictions.map((prediction, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">{prediction.timeframe}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(prediction.predictedLTV)}
                                </span>
                                <Badge variant="outline">{prediction.confidence}% confidence</Badge>
                              </div>
                            </div>
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

