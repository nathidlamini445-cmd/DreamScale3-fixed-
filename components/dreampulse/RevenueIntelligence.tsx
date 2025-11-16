"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign, TrendingUp, BarChart3, Target, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { AnalysisItemCard } from '../teams/AnalysisItemCard'

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

interface RevenueIntelligenceProps {
  onDeleteAnalysis?: (id: string) => void
}

export default function RevenueIntelligence(props: RevenueIntelligenceProps = {}) {
  const { onDeleteAnalysis } = props
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyses, setAnalyses] = useState<RevenueAnalysis[]>([])
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    additionalInfo: ''
  })
  const hasLoadedRef = useRef(false)

  // Load analyses from localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('revenue:analyses') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        setAnalyses(parsed)
        hasLoadedRef.current = true
        return
      }
    } catch (e) {
      console.warn('Failed to load revenue analyses from localStorage', e)
    }
    
    hasLoadedRef.current = true
  }, [])

  // Save analyses to localStorage
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('revenue:analyses', JSON.stringify(analyses))
        console.log('✅ Saved revenue analyses to localStorage')
      }
    } catch (e) {
      console.error('❌ Failed to save revenue analyses to localStorage:', e)
    }
  }, [analyses])

  const handleAnalyze = async () => {
    if (!formData.companyName.trim() || !formData.industry.trim()) {
      alert('Please enter company name and industry')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to analyze revenue')
      }

      const analysisData = await response.json()
      
      const analysis: RevenueAnalysis = {
        id: Date.now().toString(),
        companyName: formData.companyName,
        industry: formData.industry,
        analysis: analysisData.analysis || {
          revenueStreams: [],
          pricingStrategy: { model: '', analysis: '', recommendations: [] },
          marketPosition: { position: '', competitors: [], differentiation: '' },
          growthOpportunities: [],
          revenueProjections: []
        },
        date: new Date().toISOString()
      }

      const updatedAnalyses = [...analyses, analysis]
      setAnalyses(updatedAnalyses)
      setFormData({ companyName: '', industry: '', website: '', additionalInfo: '' })
    } catch (error) {
      console.error('Failed to analyze revenue:', error)
      alert('Failed to analyze revenue. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = (id: string) => {
    const updatedAnalyses = analyses.filter(a => a.id !== id)
    setAnalyses(updatedAnalyses)
    if (onDeleteAnalysis) {
      onDeleteAnalysis(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Saved Analyses - Show at Top */}
      {analyses.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Revenue Analyses ({analyses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((analysis) => (
              <AnalysisItemCard
                key={analysis.id}
                id={analysis.id}
                title={analysis.companyName}
                subtitle={analysis.industry}
                date={analysis.date}
                icon={<DollarSign className="w-5 h-5 text-green-600" />}
                badges={[
                  { label: analysis.industry, variant: 'secondary' }
                ]}
                onDelete={handleDelete}
                type="task"
              >
                {/* Detailed View Content */}
                <div className="space-y-6">
                  {/* Revenue Streams */}
                  {analysis.analysis.revenueStreams.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Revenue Streams
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysis.analysis.revenueStreams.map((stream, i) => (
                          <Card key={i} className="bg-blue-50 dark:bg-blue-900/20">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">{stream.name}</h5>
                                <Badge variant="outline">{stream.type}</Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <strong>Estimated Revenue:</strong> {stream.estimatedRevenue}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <strong>Growth Rate:</strong> {stream.growthRate}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">{stream.description}</p>
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
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Pricing Strategy
                      </h4>
                      <Card className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">{analysis.analysis.pricingStrategy.model}</h5>
                          <AIResponse content={analysis.analysis.pricingStrategy.analysis} />
                          {analysis.analysis.pricingStrategy.recommendations.length > 0 && (
                            <div className="mt-3">
                              <h6 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h6>
                              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
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
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Market Position
                      </h4>
                      <Card className="bg-purple-50 dark:bg-purple-900/20">
                        <CardContent className="pt-4">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            Position: {analysis.analysis.marketPosition.position}
                          </p>
                          {analysis.analysis.marketPosition.competitors.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Key Competitors:</p>
                              <div className="flex flex-wrap gap-2">
                                {analysis.analysis.marketPosition.competitors.map((comp, i) => (
                                  <Badge key={i} variant="outline">{comp}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <AIResponse content={analysis.analysis.marketPosition.differentiation} />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Growth Opportunities */}
                  {analysis.analysis.growthOpportunities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Growth Opportunities
                      </h4>
                      <div className="space-y-3">
                        {analysis.analysis.growthOpportunities.map((opp, i) => (
                          <Card key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                            <CardContent className="pt-4">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">{opp.opportunity}</h5>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{opp.potential}</p>
                              {opp.actionItems.length > 0 && (
                                <div>
                                  <h6 className="font-medium text-gray-900 dark:text-white mb-1">Action Items:</h6>
                                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
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
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Revenue Projections</h4>
                      <div className="space-y-3">
                        {analysis.analysis.revenueProjections.map((projection, i) => (
                          <Card key={i} className="bg-gray-50 dark:bg-slate-700">
                            <CardContent className="pt-4">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">{projection.timeframe}</h5>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{projection.projection}</p>
                              {projection.assumptions.length > 0 && (
                                <div>
                                  <h6 className="font-medium text-gray-900 dark:text-white mb-1">Assumptions:</h6>
                                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
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
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {analyses.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Analysis</h3>
        </div>
      )}

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#2563eb]" />
            Revenue Intelligence Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered insights on competitor revenue streams, pricing strategies, and growth opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="SaaS, E-commerce, Consulting"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  disabled={isAnalyzing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional-info">Additional Information (Optional)</Label>
              <Textarea
                id="additional-info"
                placeholder="Any known revenue information, pricing details, or market insights..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={4}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!formData.companyName.trim() || !formData.industry.trim() || isAnalyzing}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Revenue...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Analyze Revenue Intelligence
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

