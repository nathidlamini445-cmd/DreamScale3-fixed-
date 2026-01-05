"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Sparkles, Loader2, Eye, Trash2, Clock, Share } from "lucide-react"
import { BusinessSystem } from "./SystemBuilder"
import { AIResponse } from "@/components/ai-response"
import { useSessionSafe } from "@/lib/session-context"
import { ShareModal } from "@/components/share-modal"

interface SavedSOP {
  id: string
  title: string
  systemName: string
  workflowName: string
  content: string
  timestamp: Date | string
}

interface ProcessDocumentationProps {
  systems: BusinessSystem[]
}

export default function ProcessDocumentation({ systems }: ProcessDocumentationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionContext = useSessionSafe()
  const [selectedSystemId, setSelectedSystemId] = useState<string>("")
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("")
  const [sopContent, setSopContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSOP, setGeneratedSOP] = useState<string>("")
  const [savedSOPs, setSavedSOPs] = useState<SavedSOP[]>([])
  const hasLoadedRef = useRef(false)
  const isSavingRef = useRef(false)
  const [shareModal, setShareModal] = useState<{isOpen: boolean, content: string, title: string}>({
    isOpen: false,
    content: '',
    title: ''
  })
  
  // Reload SOPs when tab becomes active (documentation tab)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'documentation') {
      // Reload SOPs when documentation tab is active
      const loadSOPs = () => {
        // Prevent saving during reload
        isSavingRef.current = true
        
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dreamscale:saved-sops')
            if (stored) {
              const parsed = JSON.parse(stored)
              const withDates = (parsed || []).map((sop: any) => ({
                ...sop,
                timestamp: typeof sop.timestamp === 'string' ? new Date(sop.timestamp) : sop.timestamp
              }))
              setSavedSOPs(withDates)
              console.log('✅ Reloaded SOPs from localStorage:', withDates.length)
              setTimeout(() => {
                isSavingRef.current = false
              }, 200)
              return
            }
          }
        } catch (e) {
          console.warn('Failed to reload SOPs from localStorage', e)
        }
        
        setTimeout(() => {
          isSavingRef.current = false
        }, 200)
      }
      loadSOPs()
    }
  }, [searchParams])

  const selectedSystem = systems.find(s => s.id === selectedSystemId)
  const selectedWorkflow = selectedSystem?.workflows.find(w => w.id === selectedWorkflowId)

  // Load saved SOPs from localStorage and session - reload every time component mounts
  useEffect(() => {
    const loadSOPs = () => {
      // Prevent saving during load
      isSavingRef.current = true
      
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dreamscale:saved-sops')
          if (stored) {
            const parsed = JSON.parse(stored)
            const withDates = (parsed || []).map((sop: any) => ({
              ...sop,
              timestamp: typeof sop.timestamp === 'string' ? new Date(sop.timestamp) : sop.timestamp
            }))
            setSavedSOPs(withDates)
            console.log('✅ Loaded SOPs from localStorage:', withDates.length)
            setTimeout(() => {
              isSavingRef.current = false
            }, 200)
            return
          }
        }
      } catch (e) {
        console.warn('Failed to load saved SOPs from localStorage', e)
      }

      // Fallback to session if localStorage is empty
      if (sessionContext?.sessionData?.systems?.savedSOPs) {
        const deserialized = sessionContext.sessionData.systems.savedSOPs.map((sop: any) => ({
          ...sop,
          timestamp: typeof sop.timestamp === 'string' ? new Date(sop.timestamp) : sop.timestamp
        }))
        setSavedSOPs(deserialized)
        console.log('✅ Loaded SOPs from session:', deserialized.length)
      }
      
      setTimeout(() => {
        isSavingRef.current = false
      }, 200)
    }
    
    loadSOPs()
    hasLoadedRef.current = true
    
    // Also reload when window gains focus (user comes back to tab)
    const handleFocus = () => {
      loadSOPs()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [sessionContext])

  // Save SOPs to localStorage (only when we have data and it's not the initial empty state)
  useEffect(() => {
    if (!hasLoadedRef.current) return
    if (isSavingRef.current) return // Prevent saving during session updates
    
    try {
      if (typeof window !== 'undefined') {
        // Only save if we have SOPs OR if we're intentionally clearing (but not during initial load)
        // Convert dates to ISO strings for storage
        const sopsToSave = savedSOPs.map(sop => ({
          ...sop,
          timestamp: sop.timestamp instanceof Date ? sop.timestamp.toISOString() : sop.timestamp
        }))
        localStorage.setItem('dreamscale:saved-sops', JSON.stringify(sopsToSave))
        console.log('💾 Saved SOPs to localStorage:', sopsToSave.length)
      }
    } catch (e) {
      console.warn('Failed to save SOPs to localStorage', e)
    }
  }, [savedSOPs])

  // Save SOPs to session context
  useEffect(() => {
    if (!hasLoadedRef.current || isSavingRef.current) return
    
    if (sessionContext?.updateSystemsData && savedSOPs.length >= 0) {
      isSavingRef.current = true
      sessionContext.updateSystemsData({
        ...sessionContext.sessionData.systems,
        savedSOPs: savedSOPs
      })
      setTimeout(() => {
        isSavingRef.current = false
      }, 100)
    }
  }, [savedSOPs.length, sessionContext])

  const handleGenerateSOP = async () => {
    if (!selectedSystem || !selectedWorkflow) return

    setIsGenerating(true)
    setGeneratedSOP("")
    
    try {
      const response = await fetch('/api/systems/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: selectedSystem,
          workflow: selectedWorkflow
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate SOP')
      }

      const data = await response.json()
      setGeneratedSOP(data.sop)
      
      // Create saved SOP entry
      const newSOP: SavedSOP = {
        id: `sop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${selectedSystem?.name || 'System'} - ${selectedWorkflow?.name || 'Workflow'}`,
        systemName: selectedSystem?.name || '',
        workflowName: selectedWorkflow?.name || '',
        content: data.sop,
        timestamp: new Date()
      }
      
      // Add to saved SOPs (prepend to show newest first)
      const updatedSOPs = [newSOP, ...savedSOPs]
      
      // Update state immediately so it shows in the UI
      setSavedSOPs(updatedSOPs)
      console.log('✅ Added new SOP to state. Total SOPs:', updatedSOPs.length)
      
      // Save to localStorage immediately (synchronously) before navigation
      if (typeof window !== 'undefined') {
        try {
          const sopsToSave = updatedSOPs.map(sop => ({
            ...sop,
            timestamp: sop.timestamp instanceof Date ? sop.timestamp.toISOString() : sop.timestamp
          }))
          localStorage.setItem('dreamscale:saved-sops', JSON.stringify(sopsToSave))
          localStorage.setItem('dreamscale:current-sop', data.sop)
          localStorage.setItem('dreamscale:current-sop-system', selectedSystem?.name || '')
          localStorage.setItem('dreamscale:current-sop-workflow', selectedWorkflow?.name || '')
          console.log('✅ Saved SOP to localStorage:', newSOP.title)
        } catch (e) {
          console.warn('Failed to save SOP to localStorage:', e)
        }
      }
      
      // Update session context
      if (sessionContext?.updateSystemsData) {
        sessionContext.updateSystemsData({
          ...sessionContext.sessionData.systems,
          savedSOPs: updatedSOPs
        })
        console.log('✅ Updated session context with new SOP')
      }
      
      // Small delay to ensure state and localStorage are updated before navigation
      setTimeout(() => {
        // Navigate to full-screen SOP view
        router.push('/systems/sop')
      }, 100)
    } catch (error) {
      console.error('Failed to generate SOP:', error)
      alert('Failed to generate SOP. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadSOP = () => {
    if (!generatedSOP) return

    const blob = new Blob([generatedSOP], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedSystem?.name || 'system'}-sop.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleViewSavedSOP = (sop: SavedSOP) => {
    // Store in localStorage for viewing
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamscale:current-sop', sop.content)
      localStorage.setItem('dreamscale:current-sop-system', sop.systemName)
      localStorage.setItem('dreamscale:current-sop-workflow', sop.workflowName)
    }
    router.push('/systems/sop')
  }

  const handleDeleteSOP = (sopId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering view
    if (confirm('Are you sure you want to delete this SOP?')) {
      setSavedSOPs(prev => prev.filter(sop => sop.id !== sopId))
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (systems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-12 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No systems available. Create a system first to generate documentation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Process Documentation Assistant
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate Standard Operating Procedures (SOPs) and training materials for your systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate SOP
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a system and workflow to generate documentation
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-select">Select System</Label>
              <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
                <SelectTrigger id="system-select" className="border-gray-200/60 dark:border-gray-800/60">
                  <SelectValue placeholder="Choose a system" />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSystem && (
              <div className="space-y-2">
                <Label htmlFor="workflow-select">Select Workflow</Label>
                <Select 
                  value={selectedWorkflowId} 
                  onValueChange={setSelectedWorkflowId}
                >
                  <SelectTrigger id="workflow-select" className="border-gray-200/60 dark:border-gray-800/60">
                    <SelectValue placeholder="Choose a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSystem.workflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSystem && selectedWorkflow && (
              <div className="space-y-2">
                <Label>Workflow Steps</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 rounded-md">
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {selectedWorkflow.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateSOP}
              disabled={!selectedSystem || !selectedWorkflow || isGenerating}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating SOP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate SOP
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated SOP Display - Preview Only */}
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              Generated Documentation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-generated Standard Operating Procedure
            </p>
          </div>
          <div>
            {generatedSOP ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your SOP has been generated! Click the button below to view it in full screen.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        // Ensure SOP is stored in localStorage before navigating
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('dreamscale:current-sop', generatedSOP)
                          localStorage.setItem('dreamscale:current-sop-system', selectedSystem?.name || '')
                          localStorage.setItem('dreamscale:current-sop-workflow', selectedWorkflow?.name || '')
                        }
                        router.push('/systems/sop')
                      }}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full SOP
                    </Button>
                    <Button
                      onClick={() => {
                        setShareModal({
                          isOpen: true,
                          content: generatedSOP,
                          title: `${selectedSystem?.name || 'System'} - ${selectedWorkflow?.name || 'Workflow'} SOP`
                        })
                      }}
                      variant="outline"
                      className="border-gray-200/60 dark:border-gray-800/60"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-96 overflow-y-auto border rounded-lg p-4">
                  <AIResponse content={generatedSOP.substring(0, 500) + '...'} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    (Preview - click above to view full document)
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#39d2c0]" />
                    <p>Generating your SOP...</p>
                    <p className="text-xs mt-2">This may take a moment for comprehensive documentation...</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select a system and workflow, then click "Generate SOP" to create documentation</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Overview */}
      {selectedSystem && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">System Overview</h3>
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tools</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSystem.tools.slice(0, 3).map((tool, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {selectedSystem.tools.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedSystem.tools.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Roles</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {selectedSystem.roles.length} roles
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Metrics</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {selectedSystem.metrics.length} metrics
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automation</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {selectedSystem.automationOpportunities.length} opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated SOPs Section */}
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generated SOPs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage your previously generated Standard Operating Procedures
          </p>
        </div>
        <div>
          {savedSOPs.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved SOPs yet</p>
              <p className="text-sm mt-2">Generate your first SOP to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSOPs.map((sop) => (
                <div
                  key={sop.id}
                  onClick={() => handleViewSavedSOP(sop)}
                  className="flex items-center justify-between p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {sop.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(sop.timestamp)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sop.systemName}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShareModal({
                          isOpen: true,
                          content: sop.content,
                          title: sop.title
                        })
                      }}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSOP(sop.id, e)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete SOP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
        messageContent={shareModal.content}
        contentType="Standard Operating Procedure"
        contentTitle={shareModal.title}
      />
    </div>
  )
}

