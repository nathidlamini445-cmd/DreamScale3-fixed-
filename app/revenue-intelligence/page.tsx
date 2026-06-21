"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, BarChart3, TrendingUp, Target, Users, Calculator, ClipboardList } from "lucide-react"
import RevenueDashboard from "@/components/revenue/RevenueDashboard"
import RevenueOptimization from "@/components/revenue/RevenueOptimization"
import PricingStrategyBuilder from "@/components/revenue/PricingStrategyBuilder"
import RevenueGoalTracker from "@/components/revenue/RevenueGoalTracker"
import LTVCalculator from "@/components/revenue/LTVCalculator"
import ScenarioPlanning from "@/components/revenue/ScenarioPlanning"
import { RevenueCommandCenter } from "@/components/revenue/RevenueCommandCenter"
import { WeeklyRevenueCheckInCard } from "@/components/revenue/WeeklyRevenueCheckInCard"
import { RevenueWeeklyChart } from "@/components/revenue/RevenueWeeklyChart"
import { RevenueData, INITIAL_REVENUE_DATA, type WeeklyRevenueCheckIn } from "@/lib/revenue-types"
import { useUser } from "@clerk/nextjs"
import * as supabaseData from "@/lib/supabase-data"
import { useSubscriptionStatus } from "@/hooks/use-subscription-status"
import { useSessionSafe } from "@/lib/session-context"
import { ProPlanBadge } from "@/components/pro-plan-badge"
import {
  buildStarterDashboard,
  buildStarterGoal,
  parseOnboardingMrr,
  parseOnboardingRevenueGoal,
} from "@/lib/revenue/onboarding-seed"
import { shouldAutoSeedRevenue, seedRevenueFromProfile } from "@/lib/revenue/auto-seed"
import { normalizeRevenueData } from "@/lib/revenue/venture-quest-bridge"
import { toast } from "sonner"
import { Suspense } from "react"
import { loadRevenueDataLocal, saveRevenueDataLocal } from "@/lib/revenue/persist-revenue"

const VALID_TABS = ['dashboard', 'goals', 'checkin', 'optimization', 'pricing', 'ltv', 'scenarios'] as const

function RevenueIntelligencePageContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const { isPro } = useSubscriptionStatus()
  const tabParam = searchParams.get('tab')
  const initialTab = VALID_TABS.includes(tabParam as (typeof VALID_TABS)[number])
    ? (tabParam as (typeof VALID_TABS)[number])
    : 'dashboard'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [revenueData, setRevenueData] = useState<RevenueData>(INITIAL_REVENUE_DATA)
  const [seeding, setSeeding] = useState(false)
  const hasLoadedRef = useRef(false)
  const hasAutoSeededRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  const profile = sessionContext?.sessionData?.entrepreneurProfile
  const ventureGoalTitle = sessionContext?.sessionData?.hypeos?.user?.goalTitle
  const ventureCategory =
    sessionContext?.sessionData?.hypeos?.user?.category || 'revenue'
  const businessName =
    (typeof profile?.businessName === 'string' ? profile.businessName : null) ??
    (typeof profile?.name === 'string' ? profile.name : null) ??
    ventureGoalTitle ??
    undefined

  useEffect(() => {
    if (tabParam === 'systems') {
      router.replace('/systems')
      return
    }
    if (tabParam && VALID_TABS.includes(tabParam as (typeof VALID_TABS)[number])) {
      setActiveTab(tabParam as (typeof VALID_TABS)[number])
    }
  }, [tabParam, router])

  // Load data from Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const loadData = async () => {
      try {
        let loaded: RevenueData | null = null

        if (user?.id) {
          const dbData = await supabaseData.loadRevenueData(user.id)
          if (dbData) {
            loaded = normalizeRevenueData(dbData as RevenueData)
          }
        }

        if (!loaded) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
          if (saved) {
            loaded = normalizeRevenueData(JSON.parse(saved) as RevenueData)
          }
        }

        if (loaded) {
          setRevenueData(loaded)
          hasLoadedRef.current = true
          return
        }
      } catch (e) {
        console.warn('Failed to load revenue data:', e)
      }
      
      hasLoadedRef.current = true
    }

    loadData()
  }, [user])

  // Auto-seed from onboarding when workspace is empty
  useEffect(() => {
    if (!hasLoadedRef.current || hasAutoSeededRef.current) return
    if (!shouldAutoSeedRevenue(revenueData, profile)) return

    hasAutoSeededRef.current = true
    const seeded = seedRevenueFromProfile(profile, revenueData)
    setRevenueData(seeded)
    toast.success('Revenue workspace ready', {
      description: 'We set up your dashboard and goal from your profile.',
    })
    void saveRevenueDataLocal(user?.id, seeded)
  }, [revenueData.dashboards.length, revenueData.goals.length, profile, user?.id])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    void loadRevenueDataLocal(user?.id).then((data) => {
      if (data) setRevenueData(data)
    })
  }, [activeTab, user?.id])

  // Save data to Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    const dataString = JSON.stringify({
      dashboardsCount: revenueData.dashboards.length,
      optimizationsCount: revenueData.optimizations.length,
      pricingCount: revenueData.pricingStrategies.length,
      goalsCount: revenueData.goals.length,
      ltvCount: revenueData.ltvAnalyses.length,
      scenariosCount: revenueData.scenarios.length,
      checkInsCount: revenueData.weeklyCheckIns.length,
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

        // Only save to localStorage for unauthenticated users
        if (!user?.id && typeof window !== 'undefined') {
          localStorage.setItem('revenueos:data', JSON.stringify(revenueData))
          lastSavedRef.current = dataString
          console.log('✅ Saved revenue data to localStorage (unauthenticated)')
        } else {
          lastSavedRef.current = dataString
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
    setRevenueData((prev) => ({ ...prev, ...updates }))
  }

  const handleSeedFromProfile = useCallback(async () => {
    setSeeding(true)
    try {
      const mrr = parseOnboardingMrr(profile?.monthlyRevenue ?? null)
      const target = parseOnboardingRevenueGoal(profile?.revenueGoal ?? null, mrr)
      const dashboard = buildStarterDashboard({ businessName, mrr })
      const goal = buildStarterGoal({ businessName, target })
      updateRevenueData({
        dashboards: [...revenueData.dashboards, dashboard],
        goals: [...revenueData.goals, goal],
      })
      toast.success('Revenue workspace ready', {
        description: 'Starter dashboard and goal created from your profile.',
      })
    } catch {
      toast.error('Could not set up workspace')
    } finally {
      setSeeding(false)
    }
  }, [businessName, profile?.monthlyRevenue, profile?.revenueGoal, revenueData.dashboards, revenueData.goals])

  const handleCheckIn = (checkIn: WeeklyRevenueCheckIn) => {
    updateRevenueData({
      weeklyCheckIns: [...revenueData.weeklyCheckIns, checkIn],
    })
    toast.success('Weekly check-in saved')
  }

  const showSeedPrompt =
    hasLoadedRef.current &&
    revenueData.dashboards.length === 0 &&
    revenueData.goals.length === 0 &&
    !!(profile?.monthlyRevenue || profile?.revenueGoal)

  const stats = {
    totalDashboards: revenueData.dashboards.length,
    totalOptimizations: revenueData.optimizations.length,
    activeGoals: revenueData.goals.filter(g => new Date(g.endDate) > new Date()).length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 text-foreground relative overflow-y-auto">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          {/* Header - Ultra Minimal */}
          <div className="bg-white dark:bg-slate-950 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
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
                  {isPro && <ProPlanBadge active />}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 w-full">
            <RevenueCommandCenter
              data={revenueData}
              businessName={businessName}
              isPro={!!isPro}
              onSeedFromProfile={handleSeedFromProfile}
              seeding={seeding}
              showSeedPrompt={showSeedPrompt}
              onTabChange={setActiveTab}
            />
            <div className="mb-8 flex flex-col gap-4 w-full">
              <WeeklyRevenueCheckInCard
                checkIns={revenueData.weeklyCheckIns}
                onSubmit={handleCheckIn}
                isPro={!!isPro}
              />
              <RevenueWeeklyChart checkIns={revenueData.weeklyCheckIns} />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full flex-wrap h-auto gap-1">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Goals</span>
                </TabsTrigger>
                <TabsTrigger value="checkin" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>Check-in</span>
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Optimize</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="ltv" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>LTV</span>
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>Scenarios</span>
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
                  ventureGoalTitle={ventureGoalTitle}
                  ventureCategory={ventureCategory}
                  onAddGoal={(goal) => updateRevenueData({
                    goals: [...revenueData.goals, goal]
                  })}
                  onUpdateGoal={(updatedGoal) => updateRevenueData({
                    goals: revenueData.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
                  })}
                />
              </TabsContent>

              <TabsContent value="checkin" className="mt-6 space-y-6">
                <WeeklyRevenueCheckInCard
                  checkIns={revenueData.weeklyCheckIns}
                  onSubmit={handleCheckIn}
                  isPro={!!isPro}
                />
                <RevenueWeeklyChart checkIns={revenueData.weeklyCheckIns} />
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

export default function RevenueIntelligencePage() {
  return (
    <Suspense fallback={null}>
      <RevenueIntelligencePageContent />
    </Suspense>
  )
}
