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
import { useAuth } from "@/contexts/AuthContext"
import * as supabaseData from "@/lib/supabase-data"

export default function RevenueIntelligencePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [revenueData, setRevenueData] = useState<RevenueData>(INITIAL_REVENUE_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const loadData = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          const dbData = await supabaseData.loadRevenueData(user.id)
          if (dbData) {
            const safeData: RevenueData = {
              dashboards: dbData.dashboards || [],
              optimizations: dbData.optimizations || [],
              pricingStrategies: dbData.pricingStrategies || [],
              goals: dbData.goals || [],
              ltvAnalyses: dbData.ltvAnalyses || [],
              scenarios: dbData.scenarios || []
            }
            setRevenueData(safeData)
            hasLoadedRef.current = true
            lastSavedRef.current = JSON.stringify({
              dashboardsCount: safeData.dashboards.length,
              optimizationsCount: safeData.optimizations.length,
              pricingCount: safeData.pricingStrategies.length,
              goalsCount: safeData.goals.length,
              ltvCount: safeData.ltvAnalyses.length,
              scenariosCount: safeData.scenarios.length
            })
            console.log('✅ Loaded revenue data from Supabase')
            return
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          const safeData: RevenueData = {
            dashboards: parsed.dashboards || [],
            optimizations: parsed.optimizations || [],
            pricingStrategies: parsed.pricingStrategies || [],
            goals: parsed.goals || [],
            ltvAnalyses: parsed.ltvAnalyses || [],
            scenarios: parsed.scenarios || []
          }
          setRevenueData(safeData)
          hasLoadedRef.current = true
          lastSavedRef.current = JSON.stringify({
            dashboardsCount: safeData.dashboards.length,
            optimizationsCount: safeData.optimizations.length,
            pricingCount: safeData.pricingStrategies.length,
            goalsCount: safeData.goals.length,
            ltvCount: safeData.ltvAnalyses.length,
            scenariosCount: safeData.scenarios.length
          })
          console.log('✅ Loaded revenue data from localStorage')
          return
        }
      } catch (e) {
        console.warn('Failed to load revenue data:', e)
      }
      
      hasLoadedRef.current = true
    }

    loadData()
  }, [user])

  // Save data to Supabase (if authenticated) or localStorage
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
    
    const saveData = async () => {
      try {
        // Save to Supabase if authenticated
        if (user?.id) {
          try {
            await supabaseData.saveRevenueData(user.id, revenueData)
            console.log('✅ Saved revenue data to Supabase')
          } catch (supabaseError) {
            console.error('Error saving to Supabase, falling back to localStorage:', supabaseError)
          }
        }

        // Always save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('revenueos:data', JSON.stringify(revenueData))
          lastSavedRef.current = dataString
          console.log('✅ Saved revenue data to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save revenue data:', e)
      }
    }

    // Debounce saves
    const timeoutId = setTimeout(saveData, 500)
    return () => clearTimeout(timeoutId)
  }, [revenueData, user])

  const updateRevenueData = (updates: Partial<RevenueData>) => {
    setRevenueData(prev => ({ ...prev, ...updates }))
  }

  const stats = {
    totalDashboards: revenueData.dashboards.length,
    totalOptimizations: revenueData.optimizations.length,
    activeGoals: revenueData.goals.filter(g => new Date(g.endDate) > new Date()).length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header - Ultra Minimal */}
          <div className="bg-white dark:bg-slate-950 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-8">
                <div>
                  <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
                    Revenue<span className="text-gray-600 dark:text-gray-400">OS</span>
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    AI-powered revenue growth engine for your business
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dashboards</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {stats.totalDashboards}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Goals</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {stats.activeGoals}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 rounded-md border border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI Powered</span>
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
