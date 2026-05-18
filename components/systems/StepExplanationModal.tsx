"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Sparkles } from "lucide-react"
import { AIResponse } from "@/components/ai-response"

interface StepExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  step: string
  stepNumber: number
  workflowName: string
  systemName: string
}

export default function StepExplanationModal({
  isOpen,
  onClose,
  step,
  stepNumber,
  workflowName,
  systemName
}: StepExplanationModalProps) {
  const [explanation, setExplanation] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset and fetch explanation when modal opens or step changes
  useEffect(() => {
    if (isOpen) {
      setExplanation("")
      setIsLoading(true)
      
      const fetchExplanation = async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Provide a detailed, actionable explanation of how to complete this step in a business workflow:

System: ${systemName}
Workflow: ${workflowName}
Step ${stepNumber}: ${step}

Please provide:
1. A clear explanation of what this step involves
2. Specific actionable tasks to complete it
3. Tools or resources that might be helpful
4. Common challenges and how to overcome them
5. Best practices for this step
6. How to measure success or completion

Make it practical and detailed, as if you're training someone to do this step.`,
              isResearch: false
            })
          })

          if (!response.ok) {
            throw new Error('Failed to generate explanation')
          }

          const data = await response.json()
          // Ensure explanation is always a string
          const explanationText = typeof data.response === 'string' 
            ? data.response 
            : (data.response ? JSON.stringify(data.response, null, 2) : 'Failed to generate explanation')
          setExplanation(explanationText)
        } catch (error) {
          console.error('Failed to fetch explanation:', error)
          setExplanation('Sorry, I could not generate an explanation at this time. Please try again later.')
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchExplanation()
    }
  }, [isOpen, step, stepNumber, systemName, workflowName])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#39d2c0]" />
            Step {stepNumber} Explanation
          </DialogTitle>
          <DialogDescription>
            {workflowName} • {systemName}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">
              {step}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#39d2c0] mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Generating detailed explanation...
              </p>
            </div>
          ) : explanation ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <AIResponse content={explanation} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click to generate explanation
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

