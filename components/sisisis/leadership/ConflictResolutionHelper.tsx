"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X, Trash2 } from "lucide-react"
import { Conflict } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface ConflictResolutionHelperProps {
  conflicts: Conflict[]
  onAddConflict: (conflict: Conflict) => void
  onDeleteConflict?: (id: string) => void
}

export default function ConflictResolutionHelper({ conflicts, onAddConflict, onDeleteConflict }: ConflictResolutionHelperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [situation, setSituation] = useState('')
  const [parties, setParties] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/leadership/conflict/')) {
        setNavigatingId(null)
      } else {
        // Fallback: clear after 10 seconds if navigation seems stuck
        const timeout = setTimeout(() => {
          setNavigatingId(null)
        }, 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [pathname, navigatingId])

  const handleAnalyze = async () => {
    if (!situation.trim()) {
      alert('Please describe the conflict situation')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/leadership/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          situation, 
          parties: parties.split(',').map(p => p.trim()).filter(Boolean) 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze conflict')
      }

      const guidance = await response.json()
      const conflict: Conflict = {
        id: Date.now().toString(),
        situation,
        parties: parties.split(',').map(p => p.trim()).filter(Boolean),
        guidance,
        date: new Date().toISOString()
      }

      onAddConflict(conflict)
      setSituation('')
      setParties('')
      setSelectedConflict(conflict)
    } catch (error) {
      console.error('Failed to analyze conflict:', error)
      alert('Failed to analyze conflict. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Conflict Resolution Helper
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get step-by-step guidance, conversation structures, and scripts for resolving team conflicts
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="conflict-situation" className="text-sm font-medium text-gray-700 dark:text-gray-300">Describe the Conflict *</Label>
            <Textarea
              id="conflict-situation"
              placeholder="Describe your actual conflict situation: What's happening? What are the main issues? How did it start?"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={6}
              disabled={isAnalyzing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Enter the real conflict situation you're dealing with. This requires your actual team situation and context.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conflict-parties" className="text-sm font-medium text-gray-700 dark:text-gray-300">Parties Involved (comma-separated)</Label>
            <Input
              id="conflict-parties"
              placeholder="Enter names/teams involved (e.g., John, Sarah, Marketing Team)"
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              disabled={isAnalyzing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              List the actual people or teams involved in the conflict. This is your real situation.
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!situation.trim() || isAnalyzing}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Conflict...
              </>
            ) : (
              <>
                Get Resolution Guidance
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedConflict && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Resolution Guidance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConflict(null)}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              Conflict involving: {selectedConflict.parties.join(', ')}
            </p>
          </div>
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Conversation Structure</h3>
              <div className="space-y-4">
                {selectedConflict.guidance.conversationStructure.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-center font-medium text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </div>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-400 pt-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedConflict.guidance.steps.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Step-by-Step Action Plan</h3>
                <div className="space-y-6">
                  {selectedConflict.guidance.steps.map((step, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Step {step.step}: {step.action}</h4>
                      <div>
                        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-gray-200/60 dark:border-gray-800/60">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                            {step.script}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedConflict.guidance.scripts.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Conversation Scripts</h3>
                <div className="space-y-6">
                  {selectedConflict.guidance.scripts.map((script, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{script}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedConflict.guidance.negotiationTactics.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Negotiation Tactics</h3>
                <ul className="space-y-3">
                  {selectedConflict.guidance.negotiationTactics.map((tactic, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Saved Conflicts ({conflicts.length})</h3>
          <div className="grid gap-6">
            {conflicts.slice().reverse().map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => setSelectedConflict(conflict)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{conflict.situation}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {conflict.parties.join(', ')} • {new Date(conflict.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border-gray-200/60 dark:border-gray-800/60 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNavigatingId(conflict.id)
                        router.push(`/leadership/conflict/${conflict.id}`)
                      }}
                      disabled={navigatingId === conflict.id}
                    >
                      {navigatingId === conflict.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                    {onDeleteConflict && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this conflict?')) {
                            onDeleteConflict(conflict.id)
                            if (selectedConflict?.id === conflict.id) {
                              setSelectedConflict(null)
                            }
                          }
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

