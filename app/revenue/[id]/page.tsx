"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, Workflow, Settings, Zap, ArrowLeft } from "lucide-react"
import { BusinessSystem } from "@/components/systems/SystemBuilder"
import { cn } from "@/lib/utils"
import MiroFlowDiagram from "@/components/systems/MiroFlowDiagram"
import StepExplanationModal from "@/components/systems/StepExplanationModal"
import { useAuth } from '@/contexts/AuthContext'
import { useSessionSafe } from '@/lib/session-context'
import * as supabaseData from '@/lib/supabase-data'

export default function SystemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const systemId = params.id as string
  const { user } = useAuth()
  const sessionContext = useSessionSafe()
  const [system, setSystem] = useState<BusinessSystem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStep, setSelectedStep] = useState<{ step: string; index: number; workflowName: string } | null>(null)
  const [explanationModalOpen, setExplanationModalOpen] = useState(false)

  // Load system from Supabase first, then localStorage, then session
  useEffect(() => {
    let isMounted = true // Prevent state updates if component unmounts
    
    const loadSystem = async () => {
      setLoading(true)
      console.log('🔍 Loading system details for ID:', systemId)
      
      // Try Supabase first if authenticated (PRIORITY for cross-device sync)
      if (user?.id) {
        try {
          console.log('📡 Attempting to load from Supabase for user:', user.id)
          const systemsData = await supabaseData.loadSystemsData(user.id)
          console.log('📦 Received systems data:', {
            hasData: !!systemsData,
            systemsCount: systemsData?.systems?.length || 0,
            systemIds: systemsData?.systems?.map((s: any) => s.id) || []
          })
          
          if (systemsData?.systems && Array.isArray(systemsData.systems)) {
            const foundSystem = systemsData.systems.find((s: any) => s.id === systemId)
            console.log('🔍 Looking for system ID:', systemId, 'Found:', !!foundSystem)
            
            if (foundSystem) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed: typeof foundSystem.lastAnalyzed === 'string' 
                  ? new Date(foundSystem.lastAnalyzed) 
                  : (foundSystem.lastAnalyzed instanceof Date ? foundSystem.lastAnalyzed : new Date())
              }
              if (isMounted) {
                setSystem(systemWithDates)
                setLoading(false)
                console.log('✅ Loaded system from Supabase:', systemWithDates.name)
              }
              return
            } else {
              console.warn('⚠️ System not found in Supabase data. Available IDs:', systemsData.systems.map((s: any) => s.id))
            }
          }
        } catch (error) {
          console.error('❌ Error loading from Supabase:', error)
        }
      }
      
      // Fallback to localStorage
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('systembuilder:systems')
          if (saved) {
            const parsed = JSON.parse(saved)
            console.log('📦 Checking localStorage, found', parsed.length, 'systems')
            const foundSystem = parsed.find((s: BusinessSystem) => s.id === systemId)
            if (foundSystem) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed: typeof foundSystem.lastAnalyzed === 'string' 
                  ? new Date(foundSystem.lastAnalyzed) 
                  : foundSystem.lastAnalyzed
              }
              if (isMounted) {
                setSystem(systemWithDates)
                setLoading(false)
                console.log('✅ Loaded system from localStorage:', systemWithDates.name)
              }
              return
            } else {
              console.warn('⚠️ System not found in localStorage. Available IDs:', parsed.map((s: any) => s.id))
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load system from localStorage', e)
      }
      
      // Fallback to session context
      if (sessionContext?.sessionData?.systems?.systems) {
        const sessionSystems = sessionContext.sessionData.systems.systems
        console.log('📦 Checking session context, found', sessionSystems.length, 'systems')
        const foundSystem = sessionSystems.find((s: BusinessSystem) => s.id === systemId)
        if (foundSystem) {
          const systemWithDates = {
            ...foundSystem,
            lastAnalyzed: typeof foundSystem.lastAnalyzed === 'string' 
              ? new Date(foundSystem.lastAnalyzed) 
              : (foundSystem.lastAnalyzed instanceof Date ? foundSystem.lastAnalyzed : new Date())
          }
          if (isMounted) {
            setSystem(systemWithDates)
            setLoading(false)
            console.log('✅ Loaded system from session context:', systemWithDates.name)
          }
          return
        } else {
          console.warn('⚠️ System not found in session context. Available IDs:', sessionSystems.map((s: any) => s.id))
        }
      }
      
      // System not found in any source
      // CRITICAL: Don't redirect immediately - wait and retry once more
      console.warn('⚠️ System not found in any source after checking all:', systemId)
      
      // Retry loading from Supabase one more time (in case of slow connection)
      if (user?.id && isMounted) {
        console.log('🔄 Retrying Supabase load...')
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          const retryData = await supabaseData.loadSystemsData(user.id)
          if (retryData?.systems && Array.isArray(retryData.systems)) {
            const foundSystem = retryData.systems.find((s: any) => s.id === systemId)
            if (foundSystem && isMounted) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed: typeof foundSystem.lastAnalyzed === 'string' 
                  ? new Date(foundSystem.lastAnalyzed) 
                  : (foundSystem.lastAnalyzed instanceof Date ? foundSystem.lastAnalyzed : new Date())
              }
              setSystem(systemWithDates)
              setLoading(false)
              console.log('✅ Loaded system from Supabase on retry:', systemWithDates.name)
              return
            }
          }
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError)
        }
      }
      
      // Still not found - show error and redirect after delay
      if (isMounted) {
        setLoading(false)
        // Wait 3 seconds before redirecting to give user time to see the error
        setTimeout(() => {
          if (isMounted) {
            console.log('🔄 Redirecting to Systems dashboard - system not found after all attempts')
            router.push('/revenue?tab=dashboard')
          }
        }, 3000)
      }
    }
    
    loadSystem()
    
    return () => {
      isMounted = false // Cleanup
    }
  }, [systemId, user?.id, sessionContext?.sessionData?.systems?.systems, router])

  if (loading || !system) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-y-auto">
        <div className="relative z-10 main-container">
          <SidebarNav />
          <main className="ml-64 pt-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39d2c0] mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading system details...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">System not found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    System ID: {systemId}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
                    Redirecting to Systems dashboard...
                  </p>
                  <Button onClick={() => router.push('/revenue?tab=dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Systems
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    )
  }

  const handleStepClick = (step: string, index: number, workflowName: string) => {
    setSelectedStep({ step, index, workflowName })
    setExplanationModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'needs-attention':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'broken':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800'
      case 'broken':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-y-auto">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          {/* Header with Back Button */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Button
                variant="outline"
                onClick={() => router.push('/revenue')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Systems
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {system.name}
                  {getStatusIcon(system.status)}
                </h1>
                <Badge className={cn(getStatusColor(system.status))}>
                  {system.status.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {system.type} • Last analyzed: {new Date(system.lastAnalyzed).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs defaultValue="workflows" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Automation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workflows" className="mt-6 space-y-8">
                {system.workflows.length > 0 ? (
                  system.workflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-6">
                      {/* Workflow Title */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {workflow.name}
                        </h3>
                      </div>
                      
                      {/* Miro-Style Visual Flow Diagram */}
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-inner w-full">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Process Flow Diagram
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Click on any step to get detailed explanations
                          </p>
                        </div>
                        <MiroFlowDiagram
                          workflow={workflow}
                          onStepClick={(step, index) => handleStepClick(step, index, workflow.name)}
                        />
                      </div>

                      {/* Step-by-Step List */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Step-by-Step Breakdown
                          </h4>
                          <div className="space-y-3">
                            {workflow.steps.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                onClick={() => handleStepClick(step, index, workflow.name)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#39d2c0] text-white flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-gray-900 dark:text-white">{step}</p>
                                </div>
                                <Zap className="w-4 h-4 text-[#39d2c0] flex-shrink-0 opacity-0 group-hover:opacity-100" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No workflows defined for this system
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tools" className="mt-6">
                <div className="space-y-4">
                  {system.tools.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {system.tools.map((tool, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                        >
                          {tool}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tools specified</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="automation" className="mt-6">
                <div className="space-y-3">
                  {system.automationOpportunities.length > 0 ? (
                    system.automationOpportunities.map((opp, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-3"
                      >
                        <Zap className="w-5 h-5 text-[#39d2c0] flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-300">{opp}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No automation opportunities identified</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Step Explanation Modal */}
      {selectedStep && (
        <StepExplanationModal
          isOpen={explanationModalOpen}
          onClose={() => {
            setExplanationModalOpen(false)
            setSelectedStep(null)
          }}
          step={selectedStep.step}
          stepNumber={selectedStep.index + 1}
          workflowName={selectedStep.workflowName}
          systemName={system.name}
        />
      )}
    </div>
  )
}

