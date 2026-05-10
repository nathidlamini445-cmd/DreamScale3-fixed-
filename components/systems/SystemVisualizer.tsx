"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Workflow } from "./SystemBuilder"

interface SystemVisualizerProps {
  workflow: Workflow
  systemName?: string
}

export default function SystemVisualizer({ workflow, systemName }: SystemVisualizerProps) {
  const diagramRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If Mermaid is available, render the diagram
    // Otherwise, show a text representation
    if (workflow.visualFlow && typeof window !== 'undefined') {
      // Check if mermaid is available
      const mermaid = (window as any).mermaid
      if (mermaid && diagramRef.current) {
        try {
          mermaid.initialize({ startOnLoad: true, theme: 'default' })
          mermaid.contentLoaded()
        } catch (error) {
          console.warn('Mermaid not available, showing text representation')
        }
      }
    }
  }, [workflow.visualFlow])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{workflow.name}</CardTitle>
          {systemName && (
            <Badge variant="outline">{systemName}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mermaid Diagram */}
        {workflow.visualFlow ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Workflow Diagram
            </h4>
            <div 
              ref={diagramRef}
              className="mermaid bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] flex items-center justify-center"
            >
              {workflow.visualFlow.includes('graph') || workflow.visualFlow.includes('flowchart') ? (
                <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">
                  {workflow.visualFlow}
                </pre>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Diagram code available. Install mermaid to render visually.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No visual diagram available for this workflow
          </div>
        )}

        {/* Step-by-step List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step-by-Step Process
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {workflow.steps.map((step, index) => (
              <li key={index} className="pl-2">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Visual Flow Representation (Simple) */}
        {!workflow.visualFlow && workflow.steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Process Flow
            </h4>
            <div className="relative flex flex-col gap-2">
              {workflow.steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-3">
                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 rounded-full bg-[#39d2c0] text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <div className="absolute left-1/2 top-8 w-0.5 h-6 bg-[#39d2c0] transform -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

