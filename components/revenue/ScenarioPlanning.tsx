"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { ScenarioPlan } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'

interface ScenarioPlanningProps {
  scenarios: ScenarioPlan[]
  onAddScenario: (scenario: ScenarioPlan) => void
}

export default function ScenarioPlanning({ scenarios, onAddScenario }: ScenarioPlanningProps) {
  const router = useRouter()
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
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Scenario Planning
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Model "what if" scenarios to see the impact on revenue over time
          </p>
        </div>
        <div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scenario-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Scenario Name *</Label>
                <Input
                  id="scenario-name"
                  placeholder="20% Price Increase"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isAnalyzing}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-revenue" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Monthly Revenue</Label>
                <Input
                  id="current-revenue"
                  type="number"
                  placeholder="Enter your actual monthly revenue (e.g., 10000)"
                  value={formData.currentRevenue || ''}
                  onChange={(e) => setFormData({ ...formData, currentRevenue: parseFloat(e.target.value) || 0 })}
                  disabled={isAnalyzing}
                  className="bg-white dark:bg-slate-950"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Enter your real monthly revenue. This is needed to accurately model "what if" scenarios.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario" className="text-sm font-medium text-gray-700 dark:text-gray-300">Scenario Description *</Label>
              <Textarea
                id="scenario"
                placeholder="What if we raised prices by 20%? What if churn increased by 5%? What if we launched a new product line?"
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                rows={4}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variables" className="text-sm font-medium text-gray-700 dark:text-gray-300">Variables (Optional)</Label>
              <Textarea
                id="variables"
                placeholder="Price increase: 20%&#10;Churn change: +5%&#10;New customers: +100/month"
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                rows={3}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <Button
              onClick={handleCreateScenario}
              disabled={!formData.name.trim() || !formData.scenario.trim() || isAnalyzing}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Scenario...
                </>
              ) : (
                <>
                  Analyze Scenario
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated Scenarios ({scenarios.length})</h3>
          <div className="grid gap-6">
            {scenarios.map((scenario) => {
              const totalImpact = scenario.projections.reduce((sum, p) => sum + p.impact, 0)
              const avgRevenue = scenario.projections.length > 0 
                ? scenario.projections.reduce((sum, p) => sum + p.revenue, 0) / scenario.projections.length 
                : 0
              
              return (
                <div 
                  key={scenario.id} 
                  className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                  onClick={() => router.push(`/revenue-intelligence/scenario/${scenario.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                        {scenario.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{new Date(scenario.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {scenario.variables.length > 0 && (
                          <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                            {scenario.variables.length} Variables
                          </Badge>
                        )}
                        {scenario.projections.length > 0 && (
                          <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-xs font-medium">
                            {scenario.projections.length} Projections
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {scenario.scenario}
                      </p>
                      {scenario.projections.length > 0 && (
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Avg Revenue: </span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(avgRevenue)}
                            </span>
                          </div>
                          {totalImpact !== 0 && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Total Impact: </span>
                              <span className={cn(
                                totalImpact > 0 ? "text-green-600 dark:text-green-400" :
                                totalImpact < 0 ? "text-red-600 dark:text-red-400" :
                                "text-gray-900 dark:text-white"
                              )}>
                                {totalImpact > 0 ? '+' : ''}{formatCurrency(totalImpact)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/revenue-intelligence/scenario/${scenario.id}`)
                      }}
                      className="ml-4 border-gray-200/60 dark:border-gray-800/60 font-medium"
                    >
                      View
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

