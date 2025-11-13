"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, BarChart3, TrendingUp, Target, Users, Zap, Calculator } from "lucide-react"
import RevenueDashboard from "@/components/revenue/RevenueDashboard"
import RevenueOptimization from "@/components/revenue/RevenueOptimization"
import PricingStrategyBuilder from "@/components/revenue/PricingStrategyBuilder"
import RevenueGoalTracker from "@/components/revenue/RevenueGoalTracker"
import LTVCalculator from "@/components/revenue/LTVCalculator"
import ScenarioPlanning from "@/components/revenue/ScenarioPlanning"
import { RevenueData, INITIAL_REVENUE_DATA } from "@/lib/revenue-types"

export default function RevenueIntelligencePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [revenueData, setRevenueData] = useState<RevenueData>(INITIAL_REVENUE_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        setRevenueData(parsed)
        hasLoadedRef.current = true
        lastSavedRef.current = JSON.stringify({
          dashboardsCount: parsed.dashboards.length,
          optimizationsCount: parsed.optimizations.length,
          pricingCount: parsed.pricingStrategies.length,
          goalsCount: parsed.goals.length,
          ltvCount: parsed.ltvAnalyses.length,
          scenariosCount: parsed.scenarios.length
        })
        return
      }
    } catch (e) {
      console.warn('Failed to load revenue data from localStorage', e)
    }
    
    hasLoadedRef.current = true
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    const dataString = JSON.stringify({
      dashboardsCount: revenueData.dashboards.length,
      optimizationsCount: revenueData.optimizations.length,
      pricingCount: revenueData.pricingStrategies.length,
      goalsCount: revenueData.goals.length,
      ltvCount: revenueData.ltvAnalyses.length,
      scenariosCount: revenueData.scenarios.length
    })
    
    if (dataString === lastSavedRef.current) return
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('revenueos:data', JSON.stringify(revenueData))
        lastSavedRef.current = dataString
        console.log('✅ Saved revenue data to localStorage')
      }
    } catch (e) {
      console.error('❌ Failed to save revenue data to localStorage:', e)
    }
  }, [revenueData])

  const updateRevenueData = (updates: Partial<RevenueData>) => {
    setRevenueData(prev => ({ ...prev, ...updates }))
  }

  const stats = {
    totalDashboards: revenueData.dashboards.length,
    totalOptimizations: revenueData.optimizations.length,
    activeGoals: revenueData.goals.filter(g => new Date(g.endDate) > new Date()).length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Revenue<span className="text-[#2563eb]">OS</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    AI-powered revenue growth engine for your business
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dashboards</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.totalDashboards}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Goals</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {stats.activeGoals}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#2563eb]/10 rounded-lg border border-[#2563eb]/20">
                    <span className="text-sm font-medium text-[#2563eb]">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 overflow-x-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden md:inline">Optimization</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden md:inline">Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden md:inline">Goals</span>
                </TabsTrigger>
                <TabsTrigger value="ltv" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">LTV</span>
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden md:inline">Scenarios</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <RevenueDashboard 
                  dashboards={revenueData.dashboards}
                  onAddDashboard={(dashboard) => updateRevenueData({ 
                    dashboards: [...revenueData.dashboards, dashboard] 
                  })}
                />
              </TabsContent>

              <TabsContent value="optimization" className="mt-6">
                <RevenueOptimization 
                  optimizations={revenueData.optimizations}
                  onAddOptimization={(optimization) => updateRevenueData({
                    optimizations: [...revenueData.optimizations, optimization]
                  })}
                />
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <PricingStrategyBuilder 
                  strategies={revenueData.pricingStrategies}
                  onAddStrategy={(strategy) => updateRevenueData({
                    pricingStrategies: [...revenueData.pricingStrategies, strategy]
                  })}
                />
              </TabsContent>

              <TabsContent value="goals" className="mt-6">
                <RevenueGoalTracker 
                  goals={revenueData.goals}
                  onAddGoal={(goal) => updateRevenueData({
                    goals: [...revenueData.goals, goal]
                  })}
                  onUpdateGoal={(updatedGoal) => updateRevenueData({
                    goals: revenueData.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
                  })}
                />
              </TabsContent>

              <TabsContent value="ltv" className="mt-6">
                <LTVCalculator 
                  analyses={revenueData.ltvAnalyses}
                  onAddAnalysis={(analysis) => updateRevenueData({
                    ltvAnalyses: [...revenueData.ltvAnalyses, analysis]
                  })}
                />
              </TabsContent>

              <TabsContent value="scenarios" className="mt-6">
                <ScenarioPlanning 
                  scenarios={revenueData.scenarios}
                  onAddScenario={(scenario) => updateRevenueData({
                    scenarios: [...revenueData.scenarios, scenario]
                  })}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
