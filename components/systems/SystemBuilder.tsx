"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  FileText, 
  Activity, 
  Sparkles, 
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SystemTemplates from './SystemTemplates'
import SystemHealthDashboard from './SystemHealthDashboard'
import ProcessDocumentation from './ProcessDocumentation'
import SystemGenerator from './SystemGenerator'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'
import { supabase } from '@/lib/supabase'

export interface BusinessSystem {
  id: string
  name: string
  type: string
  status: 'healthy' | 'needs-attention' | 'broken'
  lastAnalyzed: Date
  workflows: Workflow[]
  tools: string[]
  roles: Role[]
  metrics: Metric[]
  automationOpportunities: string[]
  visualFlow?: string
  templateName?: string
}

export interface Workflow {
  id: string
  name: string
  steps: string[]
  visualFlow?: string
}

export interface Role {
  name: string
  responsibilities: string[]
}

export interface Metric {
  name: string
  currentValue: number
  targetValue: number
  unit: string
}

export default function SystemBuilder() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('templates')
  const [systems, setSystems] = useState<BusinessSystem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [generatingTemplateId, setGeneratingTemplateId] = useState<string | null>(null)
  const sessionContext = useSessionSafe()
  const { user } = useAuth()
  const hasLoadedRef = useRef(false)

  // Read tab from URL query params
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['templates', 'generator', 'dashboard', 'documentation'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Fetch systems from Supabase - runs on mount and when user changes
  const fetchSystemsFromSupabase = useCallback(async () => {
    if (!user?.id) {
      console.log('ℹ️ No user ID, cannot fetch from Supabase')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)
    
    try {
      console.log('📡 Fetching systems from Supabase for user:', user.id)
      const systemsData = await supabaseData.loadSystemsData(user.id)
      
      console.log('📦 Received systems data:', {
        hasData: !!systemsData,
        systemsCount: systemsData?.systems?.length || 0
      })
      
      if (systemsData && Array.isArray(systemsData.systems)) {
        const withDates = systemsData.systems.map((sys: any) => ({
          ...sys,
          lastAnalyzed: typeof sys.lastAnalyzed === 'string' ? new Date(sys.lastAnalyzed) : sys.lastAnalyzed
        }))
        setSystems(withDates)
        console.log('✅ Loaded systems from Supabase:', withDates.length, 'systems')
      } else {
        // No systems found - set empty array
        setSystems([])
        console.log('ℹ️ No systems found in Supabase, starting with empty array')
      }
    } catch (error) {
      console.error('❌ Error fetching systems from Supabase:', error)
      setLoadError(error instanceof Error ? error.message : 'Failed to load systems')
      
      // Fallback to localStorage if Supabase fails
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('systembuilder:systems') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          const withDates = (parsed || []).map((sys: any) => ({
            ...sys,
            lastAnalyzed: typeof sys.lastAnalyzed === 'string' ? new Date(sys.lastAnalyzed) : sys.lastAnalyzed
          }))
          setSystems(withDates)
          console.log('✅ Fallback: Loaded systems from localStorage:', withDates.length, 'systems')
        } else {
          setSystems([])
        }
      } catch (e) {
        console.error('❌ Failed to load from localStorage fallback:', e)
        setSystems([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Load systems on mount - always fetch from Supabase first
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const loadSystems = async () => {
      console.log('🔄 Loading systems on mount...', { userId: user?.id })
      
      // PRIORITY: Always try Supabase first for authenticated users
      if (user?.id) {
        await fetchSystemsFromSupabase()
        hasLoadedRef.current = true
        return
      }
      
      // Fallback to localStorage for unauthenticated users
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('systembuilder:systems') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          const withDates = (parsed || []).map((sys: any) => ({
            ...sys,
            lastAnalyzed: typeof sys.lastAnalyzed === 'string' ? new Date(sys.lastAnalyzed) : sys.lastAnalyzed
          }))
          setSystems(withDates)
          console.log('✅ Loaded systems from localStorage:', withDates.length, 'systems')
        } else {
          setSystems([])
        }
      } catch (e) {
        console.warn('Failed to load systems from localStorage', e)
        setSystems([])
      } finally {
        setIsLoading(false)
        hasLoadedRef.current = true
      }
    }
    
    loadSystems()
  }, [user?.id, fetchSystemsFromSupabase])

  // Note: We no longer auto-save on every systems change
  // Instead, we save explicitly after operations and then refetch from Supabase
  // This ensures we always display the source of truth (Supabase data)

  const handleGenerateSystem = async (businessData: {
    type: string
    teamSize: number
    stage: 'idea' | 'mvp' | 'scaling'
    templateName?: string
    templateId?: string
  }) => {
    setIsGenerating(true)
    if (businessData.templateId) {
      setGeneratingTemplateId(businessData.templateId)
    }
    try {
      console.log('🚀 Generating system with data:', businessData)
      const response = await fetch('/api/systems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `Failed to generate system (${response.status})`)
      }
      
      const newSystem = await response.json()
      console.log('✅ Received system from API:', newSystem)
      
      // Validate that we got a valid system
      if (!newSystem) {
        console.error('❌ No system data received')
        throw new Error('No system data received from server')
      }
      
      // Ensure system has all required fields
      const validatedSystem = {
        id: newSystem.id || Date.now().toString(),
        name: newSystem.name || `${businessData.type} Operations System`,
        type: newSystem.type || businessData.type,
        status: newSystem.status || 'healthy',
        lastAnalyzed: newSystem.lastAnalyzed ? new Date(newSystem.lastAnalyzed) : new Date(),
        workflows: Array.isArray(newSystem.workflows) ? newSystem.workflows : [],
        tools: Array.isArray(newSystem.tools) ? newSystem.tools : [],
        roles: Array.isArray(newSystem.roles) ? newSystem.roles : [],
        metrics: Array.isArray(newSystem.metrics) ? newSystem.metrics : [],
        automationOpportunities: Array.isArray(newSystem.automationOpportunities) ? newSystem.automationOpportunities : [],
        visualFlow: newSystem.visualFlow || '',
        templateName: businessData.templateName
      }
      
      console.log('✅ Validated system:', {
        id: validatedSystem.id,
        name: validatedSystem.name,
        workflows: validatedSystem.workflows.length,
        tools: validatedSystem.tools.length
      })
      
      // CRITICAL: Use direct Supabase calls to ensure atomic fetch-merge-save
      // This prevents race conditions when creating multiple systems
      if (user?.id) {
        try {
          console.log('📡 Step 1: Fetching existing systems from Supabase...')
          
          // Step 1: Fetch existing systems directly from Supabase
          const { data: existing, error: fetchError } = await supabase
            .from('systems_data')
            .select('systems')
            .eq('user_id', user.id)
            .single()
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows found (OK for first system)
            console.error('❌ Error fetching existing systems:', fetchError)
            throw fetchError
          }
          
          const existingSystems = existing?.systems || []
          console.log('📦 Existing systems before save:', existingSystems.length)
          if (existingSystems.length > 0) {
            console.log('📋 Existing system names:', existingSystems.map((s: any) => s.name))
          }
          
          // Step 2: Prepare new system for saving (convert dates to ISO strings)
          const newSystemToSave = {
            ...validatedSystem,
            lastAnalyzed: validatedSystem.lastAnalyzed instanceof Date 
              ? validatedSystem.lastAnalyzed.toISOString() 
              : validatedSystem.lastAnalyzed
          }
          
          console.log('➕ New system being added:', {
            id: newSystemToSave.id,
            name: newSystemToSave.name,
            type: newSystemToSave.type
          })
          
          // Step 3: Append new system to existing array
          const updatedSystems = [...existingSystems, newSystemToSave]
          
          console.log('💾 Step 2: Updated systems array to save:', {
            totalCount: updatedSystems.length,
            systemNames: updatedSystems.map((s: any) => s.name)
          })
          
          // CRITICAL: Validate we're not saving an empty array
          if (updatedSystems.length === 0) {
            console.error('🚨 ERROR: Attempted to save empty systems array! Aborting save.')
            throw new Error('Cannot save empty systems array')
          }
          
          // Step 4: Save complete array to Supabase
          console.log('💾 Step 3: Saving complete array to Supabase...')
          const { error: saveError } = await supabase
            .from('systems_data')
            .upsert({
              user_id: user.id,
              systems: updatedSystems,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
          
          if (saveError) {
            console.error('❌ Error saving to Supabase:', saveError)
            throw saveError
          }
          
          console.log('✅ Step 4: Successfully saved to Supabase')
          
          // Step 5: Refetch to confirm and update state
          console.log('🔄 Step 5: Refetching from Supabase to confirm...')
          const { data: fresh, error: refetchError } = await supabase
            .from('systems_data')
            .select('systems')
            .eq('user_id', user.id)
            .single()
          
          if (refetchError) {
            console.error('⚠️ Error refetching after save:', refetchError)
          } else {
            const freshSystems = fresh?.systems || []
            console.log('✅ Confirmed systems in Supabase:', freshSystems.length)
            
            // Convert date strings back to Date objects for state
            const systemsWithDates = freshSystems.map((sys: any) => ({
              ...sys,
              lastAnalyzed: typeof sys.lastAnalyzed === 'string' 
                ? new Date(sys.lastAnalyzed) 
                : sys.lastAnalyzed
            }))
            
            setSystems(systemsWithDates)
            console.log('✅ State updated with fresh data from Supabase')
          }
        } catch (error) {
          console.error('❌ Failed to save new system to Supabase:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to save system'
          alert(`Error saving system: ${errorMessage}`)
          // Don't update local state on error - keep it as is
        }
      } else {
        // For unauthenticated users, merge with local state
        const updatedSystems = [...systems, validatedSystem]
        const systemsToSave = updatedSystems.map(sys => ({
          ...sys,
          lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
        }))
        // For unauthenticated users, just update local state and localStorage
        setSystems(updatedSystems)
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
            console.log('✅ Saved new system to localStorage')
          }
        } catch (e) {
          console.error('❌ Failed to save new system to localStorage:', e)
        }
        
        // Also save via session context for unauthenticated users
        if (sessionContext?.updateSystemsData) {
          sessionContext.updateSystemsData({ systems: systemsToSave })
        }
      }
      
      console.log('✅ System added successfully')
      
      // Clear generating template ID before navigation
      setGeneratingTemplateId(null)
      // Switch to dashboard immediately to view the new system
      setActiveTab('dashboard')
      // Update URL to reflect the tab change
      router.push(`${pathname}?tab=dashboard`, { scroll: false })
      // Scroll to top to show the new system
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    } catch (error) {
      console.error('❌ Failed to generate system:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate system. Please try again.'
      alert(errorMessage)
      setGeneratingTemplateId(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSystemUpdate = async (updatedSystem: BusinessSystem) => {
    // CRITICAL: Use direct Supabase calls to ensure atomic fetch-merge-save
    if (user?.id) {
      try {
        console.log('📡 Step 1: Fetching existing systems from Supabase before update...')
        
        // Step 1: Fetch existing systems directly from Supabase
        const { data: existing, error: fetchError } = await supabase
          .from('systems_data')
          .select('systems')
          .eq('user_id', user.id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Error fetching existing systems:', fetchError)
          throw fetchError
        }
        
        const existingSystems = existing?.systems || []
        console.log('📦 Existing systems before update:', existingSystems.length)
        
        // Step 2: Prepare updated system for saving
        const updatedSystemToSave = {
          ...updatedSystem,
          lastAnalyzed: updatedSystem.lastAnalyzed instanceof Date 
            ? updatedSystem.lastAnalyzed.toISOString() 
            : updatedSystem.lastAnalyzed
        }
        
        console.log('✏️ Updating system:', {
          id: updatedSystemToSave.id,
          name: updatedSystemToSave.name
        })
        
        // Step 3: Update the specific system in existing array
        const updatedSystems = existingSystems.map((s: any) => 
          s.id === updatedSystem.id ? updatedSystemToSave : s
        )
        
        console.log('💾 Step 2: Updated systems array to save:', {
          totalCount: updatedSystems.length
        })
        
        // CRITICAL: Validate we're not saving an empty array
        if (updatedSystems.length === 0) {
          console.error('🚨 ERROR: Attempted to save empty systems array! Aborting save.')
          throw new Error('Cannot save empty systems array')
        }
        
        // Step 4: Save complete array to Supabase
        console.log('💾 Step 3: Saving complete array to Supabase...')
        const { error: saveError } = await supabase
          .from('systems_data')
          .upsert({
            user_id: user.id,
            systems: updatedSystems,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
        
        if (saveError) {
          console.error('❌ Error saving to Supabase:', saveError)
          throw saveError
        }
        
        console.log('✅ Step 4: Successfully saved to Supabase')
        
        // Step 5: Refetch to confirm and update state
        console.log('🔄 Step 5: Refetching from Supabase to confirm...')
        const { data: fresh, error: refetchError } = await supabase
          .from('systems_data')
          .select('systems')
          .eq('user_id', user.id)
          .single()
        
        if (refetchError) {
          console.error('⚠️ Error refetching after save:', refetchError)
        } else {
          const freshSystems = fresh?.systems || []
          console.log('✅ Confirmed systems in Supabase:', freshSystems.length)
          
          // Convert date strings back to Date objects for state
          const systemsWithDates = freshSystems.map((sys: any) => ({
            ...sys,
            lastAnalyzed: typeof sys.lastAnalyzed === 'string' 
              ? new Date(sys.lastAnalyzed) 
              : sys.lastAnalyzed
          }))
          
          setSystems(systemsWithDates)
          console.log('✅ State updated with fresh data from Supabase')
        }
      } catch (error) {
        console.error('❌ Failed to save updated system to Supabase:', error)
        // Fallback: use local state merge
        const updatedSystems = systems.map(s => s.id === updatedSystem.id ? updatedSystem : s)
        setSystems(updatedSystems)
      }
    } else {
      // For unauthenticated users, merge with local state
      const updatedSystems = systems.map(s => s.id === updatedSystem.id ? updatedSystem : s)
      const systemsToSave = updatedSystems.map(sys => ({
        ...sys,
        lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
      }))
      // For unauthenticated users, just update local state and localStorage
      setSystems(updatedSystems)
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
          console.log('✅ Saved updated system to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save updated system to localStorage:', e)
      }
      
      // Also save via session context for unauthenticated users
      if (sessionContext?.updateSystemsData) {
        sessionContext.updateSystemsData({ systems: systemsToSave })
      }
    }
  }

  const handleDeleteSystem = async (systemId: string) => {
    if (confirm('Are you sure you want to delete this system? This action cannot be undone.')) {
      // CRITICAL: Use direct Supabase calls to ensure atomic fetch-merge-save
      if (user?.id) {
        try {
          console.log('📡 Step 1: Fetching existing systems from Supabase before delete...')
          
          // Step 1: Fetch existing systems directly from Supabase
          const { data: existing, error: fetchError } = await supabase
            .from('systems_data')
            .select('systems')
            .eq('user_id', user.id)
            .single()
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ Error fetching existing systems:', fetchError)
            throw fetchError
          }
          
          const existingSystems = existing?.systems || []
          console.log('📦 Existing systems before delete:', existingSystems.length)
          console.log('🗑️ Deleting system ID:', systemId)
          
          // Step 2: Remove the system from existing array
          const updatedSystems = existingSystems.filter((s: any) => s.id !== systemId)
          
          console.log('💾 Step 2: Updated systems array to save:', {
            totalCount: updatedSystems.length,
            deletedCount: existingSystems.length - updatedSystems.length
          })
          
          // Step 3: Save complete array to Supabase
          console.log('💾 Step 3: Saving complete array to Supabase...')
          const { error: saveError } = await supabase
            .from('systems_data')
            .upsert({
              user_id: user.id,
              systems: updatedSystems,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
          
          if (saveError) {
            console.error('❌ Error saving to Supabase:', saveError)
            throw saveError
          }
          
          console.log('✅ Step 4: Successfully saved to Supabase')
          
          // Step 4: Refetch to confirm and update state
          console.log('🔄 Step 5: Refetching from Supabase to confirm...')
          const { data: fresh, error: refetchError } = await supabase
            .from('systems_data')
            .select('systems')
            .eq('user_id', user.id)
            .single()
          
          if (refetchError) {
            console.error('⚠️ Error refetching after save:', refetchError)
          } else {
            const freshSystems = fresh?.systems || []
            console.log('✅ Confirmed systems in Supabase:', freshSystems.length)
            
            // Convert date strings back to Date objects for state
            const systemsWithDates = freshSystems.map((sys: any) => ({
              ...sys,
              lastAnalyzed: typeof sys.lastAnalyzed === 'string' 
                ? new Date(sys.lastAnalyzed) 
                : sys.lastAnalyzed
            }))
            
            setSystems(systemsWithDates)
            console.log('✅ State updated with fresh data from Supabase')
          }
        } catch (error) {
          console.error('❌ Failed to save deleted system to Supabase:', error)
          // Fallback: use local state
          const updatedSystems = systems.filter(s => s.id !== systemId)
          setSystems(updatedSystems)
        }
      } else {
        // For unauthenticated users, use local state
        const updatedSystems = systems.filter(s => s.id !== systemId)
        const systemsToSave = updatedSystems.map(sys => ({
          ...sys,
          lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
        }))
        // For unauthenticated users, just update local state and localStorage
        setSystems(updatedSystems)
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
            console.log('✅ Saved deleted system to localStorage')
          }
        } catch (e) {
          console.error('❌ Failed to save deleted system to localStorage:', e)
        }
        
        // Also save via session context for unauthenticated users
        if (sessionContext?.updateSystemsData) {
          sessionContext.updateSystemsData({ systems: systemsToSave })
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading systems...</span>
        </div>
      )}

      {/* Error State */}
      {loadError && !isLoading && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Systems</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{loadError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoadError(null)
                fetchSystemsFromSupabase()
              }}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Refresh Button (when loaded and no error) */}
      {!isLoading && !loadError && user?.id && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemsFromSupabase}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Systems
              </>
            )}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-10">
          <TabsTrigger value="templates" className="flex items-center gap-1.5 text-sm">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4" />
            Generate System
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-sm">
            <Activity className="w-4 h-4" />
            Health Dashboard
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-1.5 text-sm">
            <Settings className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <SystemTemplates 
            onSelectTemplate={handleGenerateSystem}
            isGenerating={isGenerating}
            generatingTemplateId={generatingTemplateId}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4">
          <SystemHealthDashboard 
            systems={systems} 
            onSystemUpdate={handleSystemUpdate}
            onDeleteSystem={handleDeleteSystem}
          />
        </TabsContent>

        <TabsContent value="documentation" className="mt-4">
          <ProcessDocumentation systems={systems} />
        </TabsContent>

        <TabsContent value="generator" className="mt-4">
          <SystemGenerator 
            onGenerate={handleGenerateSystem} 
            isGenerating={isGenerating} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

