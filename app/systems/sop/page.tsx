"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Save } from "lucide-react"
import { AIResponse } from "@/components/ai-response"
import { downloadPDF, PDFData } from '@/lib/pdf-generator'
import { useSessionSafe } from '@/lib/session-context'

export default function SOPViewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionContext = useSessionSafe()
  const [sopContent, setSopContent] = useState<string>("")
  const [systemName, setSystemName] = useState<string>("")
  const [workflowName, setWorkflowName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get SOP content from localStorage (primary method since content is large)
    const storedSOP = localStorage.getItem('dreamscale:current-sop')
    const storedSystem = localStorage.getItem('dreamscale:current-sop-system')
    const storedWorkflow = localStorage.getItem('dreamscale:current-sop-workflow')
    
    if (storedSOP) {
      setSopContent(storedSOP)
      setSystemName(storedSystem || '')
      setWorkflowName(storedWorkflow || '')
      setIsLoading(false)
    } else {
      // Fallback to URL params if localStorage is empty
      const sop = searchParams.get('sop')
      const system = searchParams.get('system') || ''
      const workflow = searchParams.get('workflow') || ''

      if (sop) {
        try {
          const decoded = decodeURIComponent(sop)
          setSopContent(decoded)
          setSystemName(system)
          setWorkflowName(workflow)
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to decode SOP:', error)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
  }, [searchParams])

  const handleDownload = async () => {
    if (!sopContent) return

    try {
      // Convert markdown content to HTML for PDF
      const pdfData: PDFData = {
        title: `${systemName || 'System'} - ${workflowName || 'Workflow'} SOP`,
        subtitle: 'Standard Operating Procedure',
        content: sopContent,
        companyName: 'DreamScale',
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }

      const filename = `${systemName || 'system'}-${workflowName || 'workflow'}-sop.pdf`
      await downloadPDF(pdfData, filename)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      // Fallback to markdown download if PDF fails
      const blob = new Blob([sopContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${systemName || 'system'}-${workflowName || 'workflow'}-sop.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleSaveSOP = () => {
    if (!sopContent || !systemName || !workflowName) return

    try {
      // Load existing SOPs
      const stored = localStorage.getItem('dreamscale:saved-sops')
      const existingSOPs = stored ? JSON.parse(stored) : []

      // Check if this SOP already exists (by title)
      const sopTitle = `${systemName} - ${workflowName}`
      const existingIndex = existingSOPs.findIndex((sop: any) => sop.title === sopTitle)

      const newSOP = {
        id: `sop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: sopTitle,
        systemName: systemName,
        workflowName: workflowName,
        content: sopContent,
        timestamp: new Date().toISOString()
      }

      let updatedSOPs
      if (existingIndex >= 0) {
        // Update existing SOP
        updatedSOPs = [...existingSOPs]
        updatedSOPs[existingIndex] = newSOP
      } else {
        // Add new SOP (prepend to show newest first)
        updatedSOPs = [newSOP, ...existingSOPs]
      }

      // Format SOPs for storage (convert dates to ISO strings)
      const sopsToSave = updatedSOPs.map(sop => ({
        ...sop,
        timestamp: sop.timestamp instanceof Date ? sop.timestamp.toISOString() : sop.timestamp
      }))

      // Save to localStorage
      localStorage.setItem('dreamscale:saved-sops', JSON.stringify(sopsToSave))
      console.log('✅ Saved SOP to localStorage:', newSOP.title, 'Total SOPs:', sopsToSave.length)

      // Update session context
      if (sessionContext?.updateSystemsData) {
        sessionContext.updateSystemsData({
          ...sessionContext.sessionData.systems,
          savedSOPs: sopsToSave
        })
        console.log('✅ Updated session context with saved SOP')
      }

      // Small delay to ensure localStorage is written before navigation
      setTimeout(() => {
        // Navigate back to documentation tab
        router.push('/revenue?tab=documentation')
      }, 150)
    } catch (error) {
      console.error('Failed to save SOP:', error)
      alert('Failed to save SOP. Please try again.')
    }
  }

  const handleBack = () => {
    // Navigate back to systems documentation tab
    router.push('/revenue?tab=documentation')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39d2c0] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SOP...</p>
        </div>
      </div>
    )
  }

  if (!sopContent) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No SOP Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The SOP content could not be loaded.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Documentation
            </Button>
            <div className="flex items-center gap-4">
              {systemName && workflowName && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {systemName} - {workflowName}
                  </p>
                </div>
              )}
              <Button
                onClick={handleSaveSOP}
                variant="default"
                className="flex items-center gap-2 bg-[#39d2c0] hover:bg-[#2bb3a3]"
              >
                <Save className="w-4 h-4" />
                Save SOP
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SOP Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <AIResponse content={sopContent} />
        </div>
      </div>
    </div>
  )
}

