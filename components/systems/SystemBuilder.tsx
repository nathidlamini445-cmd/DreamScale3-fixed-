"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  FileText, 
  Activity, 
  Sparkles, 
  Plus
} from "lucide-react"
import SystemTemplates from './SystemTemplates'
import SystemHealthDashboard from './SystemHealthDashboard'
import ProcessDocumentation from './ProcessDocumentation'
import SystemGenerator from './SystemGenerator'
import { useSessionSafe } from '@/lib/session-context'

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
  const [activeTab, setActiveTab] = useState('templates')
  const [systems, setSystems] = useState<BusinessSystem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const sessionContext = useSessionSafe()
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load systems from localStorage first (priority), then session
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    // Try localStorage first (persistent storage)
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('systembuilder:systems') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        // Convert date strings back to Date objects
        const withDates = (parsed || []).map((sys: any) => ({
          ...sys,
          lastAnalyzed: typeof sys.lastAnalyzed === 'string' ? new Date(sys.lastAnalyzed) : sys.lastAnalyzed
        }))
        setSystems(withDates)
        hasLoadedRef.current = true
        return // Exit early - localStorage takes priority
      }
    } catch (e) {
      console.warn('Failed to load systems from localStorage', e)
    }

    // Fallback to session if localStorage is empty
    if (sessionContext?.sessionData?.systems?.systems) {
      setSystems(sessionContext.sessionData.systems.systems)
      hasLoadedRef.current = true
    } else {
      hasLoadedRef.current = true
    }
  }, [sessionContext?.sessionData?.systems?.systems])

  // Save systems to localStorage whenever they change (backup save)
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    // Create a stable string representation to detect actual changes
    const systemsString = JSON.stringify(systems.map(sys => ({
      id: sys.id,
      name: sys.name,
      status: sys.status,
      lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
    })))
    
    // Only save if systems actually changed
    if (systemsString === lastSavedRef.current) return
    
    // Save to localStorage (persistent storage)
    try {
      if (typeof window !== 'undefined' && systems.length >= 0) {
        const systemsToSave = systems.map(sys => ({
          ...sys,
          lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
        }))
        localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
        lastSavedRef.current = systemsString
        console.log('✅ Backup save: Saved systems to localStorage:', systems.length, 'systems')
      }
    } catch (e) {
      console.error('❌ Failed to save systems to localStorage:', e)
      // Try to handle quota exceeded error
      if (e instanceof DOMException && e.code === 22) {
        console.error('LocalStorage quota exceeded. Consider clearing old data.')
      }
    }
    
    // Also save to session
    if (sessionContext?.updateSystemsData) {
      sessionContext.updateSystemsData({ systems })
    }
  }, [systems, sessionContext]) // Save whenever systems array changes

  const handleGenerateSystem = async (businessData: {
    type: string
    teamSize: number
    stage: 'idea' | 'mvp' | 'scaling'
  }) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/systems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate system')
      }
      
      const newSystem = await response.json()
      const updatedSystems = [...systems, newSystem]
      
      // Save immediately before state update
      try {
        if (typeof window !== 'undefined') {
          const systemsToSave = updatedSystems.map(sys => ({
            ...sys,
            lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
          }))
          localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
          // Update ref to prevent duplicate save in useEffect
          lastSavedRef.current = JSON.stringify(updatedSystems.map(sys => ({
            id: sys.id,
            name: sys.name,
            status: sys.status,
            lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
          })))
          console.log('✅ Immediately saved new system to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save new system to localStorage:', e)
      }
      
      setSystems(updatedSystems)
      setActiveTab('dashboard') // Switch to dashboard to view the new system
    } catch (error) {
      console.error('Failed to generate system:', error)
      alert('Failed to generate system. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSystemUpdate = (updatedSystem: BusinessSystem) => {
    const updatedSystems = systems.map(s => s.id === updatedSystem.id ? updatedSystem : s)
    
    // Save immediately before state update
    try {
      if (typeof window !== 'undefined') {
        const systemsToSave = updatedSystems.map(sys => ({
          ...sys,
          lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
        }))
        localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
        // Update ref to prevent duplicate save in useEffect
        lastSavedRef.current = JSON.stringify(updatedSystems.map(sys => ({
          id: sys.id,
          name: sys.name,
          status: sys.status,
          lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
        })))
        console.log('✅ Immediately saved updated system to localStorage')
      }
    } catch (e) {
      console.error('❌ Failed to save updated system to localStorage:', e)
    }
    
    setSystems(updatedSystems)
  }

  const handleDeleteSystem = (systemId: string) => {
    if (confirm('Are you sure you want to delete this system? This action cannot be undone.')) {
      const updatedSystems = systems.filter(s => s.id !== systemId)
      
      // Save immediately before state update
      try {
        if (typeof window !== 'undefined') {
          const systemsToSave = updatedSystems.map(sys => ({
            ...sys,
            lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
          }))
          localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
          // Update ref to prevent duplicate save in useEffect
          lastSavedRef.current = JSON.stringify(updatedSystems.map(sys => ({
            id: sys.id,
            name: sys.name,
            status: sys.status,
            lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
          })))
          console.log('✅ Immediately saved deleted systems to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save deleted systems to localStorage:', e)
      }
      
      setSystems(updatedSystems)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate System
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health Dashboard
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <SystemTemplates onSelectTemplate={handleGenerateSystem} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <SystemHealthDashboard 
            systems={systems} 
            onSystemUpdate={handleSystemUpdate}
            onDeleteSystem={handleDeleteSystem}
          />
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <ProcessDocumentation systems={systems} />
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <SystemGenerator 
            onGenerate={handleGenerateSystem} 
            isGenerating={isGenerating} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

