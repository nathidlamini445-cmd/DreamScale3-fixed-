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

export default function SystemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const systemId = params.id as string
  
  const [system, setSystem] = useState<BusinessSystem | null>(() => {
    // Load system synchronously on initial render to avoid delay
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('systembuilder:systems')
      if (saved) {
        const parsed = JSON.parse(saved)
        const foundSystem = parsed.find((s: BusinessSystem) => s.id === systemId)
        if (foundSystem) {
          // Convert date strings back to Date objects
          return {
            ...foundSystem,
            lastAnalyzed: typeof foundSystem.lastAnalyzed === 'string' 
              ? new Date(foundSystem.lastAnalyzed) 
              : foundSystem.lastAnalyzed
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load system from localStorage', e)
    }
    return null
  })
  const [selectedStep, setSelectedStep] = useState<{ step: string; index: number; workflowName: string } | null>(null)
  const [explanationModalOpen, setExplanationModalOpen] = useState(false)

  useEffect(() => {
    // Redirect if system not found (after initial render check)
    if (!system && typeof window !== 'undefined') {
      router.push('/revenue')
    }
  }, [system, router])

  if (!system) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
        <div className="relative z-10 main-container">
          <SidebarNav />
          <main className="ml-64 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
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

