"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { ScenarioPlan } from '@/lib/revenue-types'
import { AIResponse } from '@/components/ai-response'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function ScenarioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const [scenario, setScenario] = useState<ScenarioPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadScenario = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          try {
            const dbData = await supabaseData.loadRevenueData(user.id)
            if (dbData?.scenarios) {
              const found = dbData.scenarios.find((s: ScenarioPlan) => s.id === id)
              if (found) {
                setScenario(found)
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
          const found = data.scenarios?.find((s: ScenarioPlan) => s.id === id)
          if (found) {
            setScenario(found)
          }
        }
      } catch (e) {
        console.error('Failed to load scenario:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadScenario()
  }, [id, user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading scenario...</p>
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Scenario Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The scenario you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=scenarios')} variant="outline">
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
              onClick={() => router.push('/revenue-intelligence?tab=scenarios')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                {scenario.name}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Created on {new Date(scenario.date).toLocaleDateString('en-US', { 
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
            {/* Scenario Description */}
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Scenario Description</h2>
              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{scenario.scenario}</p>
              </div>
            </div>

            {/* Variables */}
            {scenario.variables.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Variables</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {scenario.variables.map((variable, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{variable.name}</h3>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Change: {variable.change}</p>
                        </div>
                        <Badge variant="outline" className="text-sm font-medium border-gray-200/60 dark:border-gray-800/60">
                          Value: {variable.value}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projections */}
            {scenario.projections.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Revenue Projections</h2>
                <div className="space-y-6">
                  {scenario.projections.map((projection, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-gray-900 dark:text-white">{projection.month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-medium text-gray-900 dark:text-white">
                            {formatCurrency(projection.revenue)}
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-xs font-medium border-gray-200/60 dark:border-gray-800/60",
                            projection.impact > 0 
                              ? "bg-transparent text-green-600 dark:text-green-400"
                              : projection.impact < 0
                              ? "bg-transparent text-red-600 dark:text-red-400"
                              : "bg-transparent text-gray-600 dark:text-gray-400"
                          )}>
                            {projection.impact > 0 ? '+' : ''}{formatCurrency(projection.impact)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis */}
            {scenario.analysis && (
              <div className="space-y-12">
                {scenario.analysis.summary && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Summary</h2>
                    <div className="max-w-4xl">
                      <AIResponse content={scenario.analysis.summary} />
                    </div>
                  </div>
                )}
                {scenario.analysis.risks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Risks</h2>
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {scenario.analysis.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {scenario.analysis.opportunities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Opportunities</h2>
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {scenario.analysis.opportunities.map((opp, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {scenario.analysis.recommendations.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Recommendations</h2>
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {scenario.analysis.recommendations.map((rec, i) => (
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
          </div>
        </div>
      </main>
    </div>
  )
}

