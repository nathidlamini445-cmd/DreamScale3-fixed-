"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Sparkles, Loader2 } from "lucide-react"
import { BusinessSystem } from "./SystemBuilder"
import { AIResponse } from "@/components/ai-response"

interface ProcessDocumentationProps {
  systems: BusinessSystem[]
}

export default function ProcessDocumentation({ systems }: ProcessDocumentationProps) {
  const [selectedSystemId, setSelectedSystemId] = useState<string>("")
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("")
  const [sopContent, setSopContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSOP, setGeneratedSOP] = useState<string>("")

  const selectedSystem = systems.find(s => s.id === selectedSystemId)
  const selectedWorkflow = selectedSystem?.workflows.find(w => w.id === selectedWorkflowId)

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

  if (systems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No systems available. Create a system first to generate documentation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Process Documentation Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Generate Standard Operating Procedures (SOPs) and training materials for your systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate SOP
            </CardTitle>
            <CardDescription>
              Select a system and workflow to generate documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-select">Select System</Label>
              <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
                <SelectTrigger id="system-select">
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
                  <SelectTrigger id="workflow-select">
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
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
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
              className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
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
          </CardContent>
        </Card>

        {/* Generated SOP Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Documentation</CardTitle>
              {generatedSOP && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSOP}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            <CardDescription>
              AI-generated Standard Operating Procedure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedSOP ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <AIResponse content={generatedSOP} />
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#39d2c0]" />
                    <p>Generating your SOP...</p>
                  </div>
                ) : (
                  <p>Select a system and workflow, then click "Generate SOP" to create documentation</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      {selectedSystem && (
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

