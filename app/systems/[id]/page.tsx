"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Workflow,
  Settings,
  Zap,
  ArrowLeft,
  Users,
} from "lucide-react"
import { BusinessSystem } from "@/components/systems/SystemBuilder"
import { cn } from "@/lib/utils"
import MiroFlowDiagram from "@/components/systems/MiroFlowDiagram"
import StepExplanationModal from "@/components/systems/StepExplanationModal"
import { SystemToolChip, AutomationLinkedText } from "@/components/systems/SystemToolLinks"
import { useUser } from '@clerk/nextjs'
import { useSessionSafe } from '@/lib/session-context'
import * as supabaseData from '@/lib/supabase-data'
import { ExportToNotionButton } from '@/components/systems/ExportToNotionButton'
import { ExportToGoogleDocsButton } from '@/components/integrations/ExportToGoogleDocsButton'
import { ExportToGoogleSheetsButton } from '@/components/integrations/ExportToGoogleSheetsButton'
import { toast } from 'sonner'

const SYSTEMS_HOME = '/systems?tab=dashboard'

function SystemDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const systemId = params.id as string
  const { user } = useUser()
  const sessionContext = useSessionSafe()
  const [system, setSystem] = useState<BusinessSystem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStep, setSelectedStep] = useState<{ step: string; index: number; workflowName: string } | null>(null)
  const [explanationModalOpen, setExplanationModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadSystem = async () => {
      setLoading(true)

      if (user?.id) {
        try {
          const systemsData = await supabaseData.loadSystemsData(user.id)
          if (systemsData?.systems && Array.isArray(systemsData.systems)) {
            const foundSystem = systemsData.systems.find((s: BusinessSystem) => s.id === systemId)
            if (foundSystem) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed:
                  typeof foundSystem.lastAnalyzed === 'string'
                    ? new Date(foundSystem.lastAnalyzed)
                    : foundSystem.lastAnalyzed instanceof Date
                      ? foundSystem.lastAnalyzed
                      : new Date(),
              }
              if (isMounted) {
                setSystem(systemWithDates)
                setLoading(false)
              }
              return
            }
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error)
        }
      }

      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('systembuilder:systems')
          if (saved) {
            const parsed = JSON.parse(saved)
            const foundSystem = parsed.find((s: BusinessSystem) => s.id === systemId)
            if (foundSystem) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed:
                  typeof foundSystem.lastAnalyzed === 'string'
                    ? new Date(foundSystem.lastAnalyzed)
                    : foundSystem.lastAnalyzed,
              }
              if (isMounted) {
                setSystem(systemWithDates)
                setLoading(false)
              }
              return
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load system from localStorage', e)
      }

      if (sessionContext?.sessionData?.systems?.systems) {
        const sessionSystems = sessionContext.sessionData.systems.systems
        const foundSystem = sessionSystems.find((s: BusinessSystem) => s.id === systemId)
        if (foundSystem) {
          const systemWithDates = {
            ...foundSystem,
            lastAnalyzed:
              typeof foundSystem.lastAnalyzed === 'string'
                ? new Date(foundSystem.lastAnalyzed)
                : foundSystem.lastAnalyzed instanceof Date
                  ? foundSystem.lastAnalyzed
                  : new Date(),
          }
          if (isMounted) {
            setSystem(systemWithDates)
            setLoading(false)
          }
          return
        }
      }

      if (user?.id && isMounted) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const retryData = await supabaseData.loadSystemsData(user.id)
          if (retryData?.systems && Array.isArray(retryData.systems)) {
            const foundSystem = retryData.systems.find((s: BusinessSystem) => s.id === systemId)
            if (foundSystem && isMounted) {
              const systemWithDates = {
                ...foundSystem,
                lastAnalyzed:
                  typeof foundSystem.lastAnalyzed === 'string'
                    ? new Date(foundSystem.lastAnalyzed)
                    : foundSystem.lastAnalyzed instanceof Date
                      ? foundSystem.lastAnalyzed
                      : new Date(),
              }
              setSystem(systemWithDates)
              setLoading(false)
              return
            }
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError)
        }
      }

      if (isMounted) {
        setLoading(false)
        setTimeout(() => {
          if (isMounted) router.push(SYSTEMS_HOME)
        }, 3000)
      }
    }

    loadSystem()
    return () => {
      isMounted = false
    }
  }, [systemId, user?.id, sessionContext?.sessionData?.systems?.systems, router])

  const handleStepClick = (step: string, index: number, workflowName: string) => {
    setSelectedStep({ step, index, workflowName })
    setExplanationModalOpen(true)
  }

  useEffect(() => {
    const notion = searchParams.get('notion')
    const google = searchParams.get('google')
    if (!notion && !google) return
    if (notion === 'connected') {
      toast.success('Notion connected', {
        description: 'You can now export this system to your workspace.',
      })
    } else if (notion === 'error') {
      toast.error('Could not connect Notion', {
        description: 'Try again from Settings → Integrations.',
      })
    }
    if (google === 'connected') {
      toast.success('Google connected', {
        description: 'You can now export to Google Docs.',
      })
    } else if (google === 'error') {
      toast.error('Could not connect Google', {
        description: 'Try again from Settings → Integrations.',
      })
    }
    if (notion || google) {
      const url = new URL(window.location.href)
      url.searchParams.delete('notion')
      url.searchParams.delete('google')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'needs-attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
      case 'needs-attention':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800'
      case 'broken':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
      default:
        return ''
    }
  }

  if (loading || !system) {
    return (
      <div className="min-h-screen bg-white text-foreground dark:bg-slate-950">
        <div className="main-container relative">
          <SidebarNav />
          <main className="ml-64 overflow-y-auto pt-8">
            <div className="mx-auto max-w-6xl px-6 py-12">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#39d2c0]" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading system...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-gray-500 dark:text-gray-400">System not found</p>
                  <Button variant="outline" size="sm" onClick={() => router.push(SYSTEMS_HOME)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-white text-foreground dark:bg-slate-950">
      <div className="main-container relative">
        <SidebarNav />
        <main className="ml-64 overflow-y-auto pt-6">
          <div className="border-b border-gray-100 dark:border-gray-800">
            <div className="mx-auto max-w-6xl px-6 py-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(SYSTEMS_HOME)}
                className="mb-3 -ml-2 h-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {system.name}
                  </h1>
                  {getStatusIcon(system.status)}
                  <Badge variant="outline" className={cn('text-xs font-normal', getStatusColor(system.status))}>
                    {system.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <ExportToNotionButton system={system} />
                  <ExportToGoogleDocsButton system={system} />
                  <ExportToGoogleSheetsButton system={system} />
                </div>
              </div>

              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {system.type}
                <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
                {system.workflows.length} workflow{system.workflows.length === 1 ? '' : 's'}
                <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
                Last analyzed {new Date(system.lastAnalyzed).toLocaleDateString()}
              </p>

              {system.healthAnalysis?.recommendations?.[0] && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {system.healthAnalysis.recommendations[0]}
                </p>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-6 py-6">
            <Tabs defaultValue="workflows" className="w-full">
              <TabsList className="mb-6 inline-flex h-9 gap-1 bg-gray-100/80 p-1 dark:bg-gray-900">
                <TabsTrigger value="workflows" className="gap-1.5 px-3 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Workflow className="h-3.5 w-3.5" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="tools" className="gap-1.5 px-3 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Settings className="h-3.5 w-3.5" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="automation" className="gap-1.5 px-3 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Zap className="h-3.5 w-3.5" />
                  Automation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workflows" className="space-y-8">
                {system.workflows.length > 0 ? (
                  system.workflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </h3>

                      <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                          Click any step for a detailed explanation
                        </p>
                        <MiroFlowDiagram
                          workflow={workflow}
                          onStepClick={(step, index) => handleStepClick(step, index, workflow.name)}
                        />
                      </div>

                      <div className="rounded-lg border border-gray-200/80 dark:border-gray-800">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {workflow.steps.map((step, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleStepClick(step, index, workflow.name)}
                              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#39d2c0]/15 text-xs font-medium text-[#2ab5a5] dark:bg-[#39d2c0]/20 dark:text-[#39d2c0]">
                                {index + 1}
                              </span>
                              <span className="pt-0.5 text-sm text-gray-800 dark:text-gray-200">
                                {step}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">No workflows defined</p>
                )}

                {system.metrics.length > 0 && (
                  <div className="rounded-lg border border-gray-200/80 p-5 dark:border-gray-800">
                    <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Key metrics</h4>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {system.metrics.map((metric, index) => {
                        const progress =
                          metric.targetValue > 0
                            ? Math.min(100, (metric.currentValue / metric.targetValue) * 100)
                            : 0
                        return (
                          <div key={`${metric.name}-${index}`}>
                            <div className="mb-2 flex items-start justify-between gap-3 text-sm leading-snug">
                              <span className="text-gray-700 dark:text-gray-300">{metric.name}</span>
                              <span className="shrink-0 tabular-nums font-medium text-gray-900 dark:text-white">
                                {metric.currentValue} / {metric.targetValue} {metric.unit}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-full rounded-full bg-[#39d2c0]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {system.roles.length > 0 && (
                  <div className="rounded-lg border border-gray-200/80 p-5 dark:border-gray-800">
                    <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                      <Users className="h-4 w-4 text-gray-400" />
                      Roles
                    </h4>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {system.roles.map((role, index) => (
                        <div key={index}>
                          <p className="mb-2 text-base font-semibold text-gray-900 dark:text-white">{role.name}</p>
                          <ul className="space-y-1.5">
                            {role.responsibilities.map((resp, ri) => (
                              <li key={ri} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                · {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tools">
                {system.tools.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {system.tools.map((tool, index) => (
                      <SystemToolChip key={index} name={tool} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tools specified</p>
                )}
              </TabsContent>

              <TabsContent value="automation">
                {system.automationOpportunities.length > 0 ? (
                  <div className="space-y-2">
                    {system.automationOpportunities.map((opp, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2.5 rounded-lg border border-gray-200/80 px-4 py-3 dark:border-gray-800"
                      >
                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#39d2c0]" />
                        <AutomationLinkedText text={opp} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No automation opportunities identified</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

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

export default function SystemDetailPage() {
  return (
    <Suspense fallback={null}>
      <SystemDetailPageContent />
    </Suspense>
  )
}
