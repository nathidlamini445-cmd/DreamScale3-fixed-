"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Calculator, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { ScenarioPlan } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'

interface ScenarioPlanningProps {
  scenarios: ScenarioPlan[]
  onAddScenario: (scenario: ScenarioPlan) => void
}

export default function ScenarioPlanning({ scenarios, onAddScenario }: ScenarioPlanningProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    scenario: '',
    currentRevenue: 0,
    variables: ''
  })

  const handleCreateScenario = async () => {
    if (!formData.name.trim() || !formData.scenario.trim()) {
      alert('Please enter scenario name and description')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          scenario: formData.scenario,
          currentRevenue: formData.currentRevenue,
          variables: formData.variables
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create scenario')
      }

      const scenarioData = await response.json()
      
      const scenario: ScenarioPlan = {
        id: Date.now().toString(),
        name: formData.name,
        scenario: formData.scenario,
        variables: scenarioData.variables || [],
        projections: scenarioData.projections || [],
        analysis: scenarioData.analysis || {
          summary: '',
          risks: [],
          opportunities: [],
          recommendations: []
        },
        date: new Date().toISOString()
      }

      onAddScenario(scenario)
      setFormData({ name: '', scenario: '', currentRevenue: 0, variables: '' })
    } catch (error) {
      console.error('Failed to create scenario:', error)
      alert('Failed to create scenario. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#2563eb]" />
            Scenario Planning
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Model "what if" scenarios to see the impact on revenue over time
          </p>
        </div>
        <div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Scenario Name *</Label>
                <Input
                  id="scenario-name"
                  placeholder="20% Price Increase"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-revenue">Current Monthly Revenue</Label>
                <Input
                  id="current-revenue"
                  type="number"
                  placeholder="10000"
                  value={formData.currentRevenue || ''}
                  onChange={(e) => setFormData({ ...formData, currentRevenue: parseFloat(e.target.value) || 0 })}
                  disabled={isAnalyzing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario">Scenario Description *</Label>
              <Textarea
                id="scenario"
                placeholder="What if we raised prices by 20%? What if churn increased by 5%? What if we launched a new product line?"
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                rows={4}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variables">Variables (Optional)</Label>
              <Textarea
                id="variables"
                placeholder="Price increase: 20%&#10;Churn change: +5%&#10;New customers: +100/month"
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                rows={3}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={handleCreateScenario}
              disabled={!formData.name.trim() || !formData.scenario.trim() || isAnalyzing}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Scenario...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Analyze Scenario
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Scenarios ({scenarios.length})</h3>
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#2563eb]" />
                  {scenario.name}
                </CardTitle>
                <CardDescription>
                  Created on {new Date(scenario.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scenario Description */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scenario</h4>
                    <p className="text-gray-700 dark:text-gray-300">{scenario.scenario}</p>
                  </CardContent>
                </Card>

                {/* Variables */}
                {scenario.variables.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Variables</h4>
                    <div className="space-y-2">
                      {scenario.variables.map((variable, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">{variable.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{variable.change}</Badge>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Value: {variable.value}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projections */}
                {scenario.projections.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Revenue Projections
                    </h4>
                    <div className="space-y-2">
                      {scenario.projections.map((projection, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">{projection.month}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(projection.revenue)}
                                </span>
                                <Badge className={cn(
                                  projection.impact > 0 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                    : projection.impact < 0
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
                                )}>
                                  {projection.impact > 0 ? '+' : ''}{formatCurrency(projection.impact)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                {scenario.analysis && (
                  <div className="space-y-4">
                    {scenario.analysis.summary && (
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                          <AIResponse content={scenario.analysis.summary} />
                        </CardContent>
                      </Card>
                    )}
                    {scenario.analysis.risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Risks
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {scenario.analysis.risks.map((risk, i) => (
                            <li key={i}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scenario.analysis.opportunities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Opportunities
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {scenario.analysis.opportunities.map((opp, i) => (
                            <li key={i}>{opp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scenario.analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {scenario.analysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

