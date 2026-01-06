"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X, Trash2 } from "lucide-react"
import { Communication } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface CommunicationCoachProps {
  communications: Communication[]
  onAddCommunication: (communication: Communication) => void
  onDeleteCommunication?: (id: string) => void
}

export default function CommunicationCoach({ communications, onAddCommunication, onDeleteCommunication }: CommunicationCoachProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [original, setOriginal] = useState('')
  const [type, setType] = useState<'email' | 'message' | 'presentation' | 'tough-message'>('email')
  const [context, setContext] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/leadership/communication/')) {
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

  const handleReview = async () => {
    if (!original.trim()) {
      alert('Please enter your communication text')
      return
    }

    setIsReviewing(true)
    try {
      const response = await fetch('/api/leadership/review-communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: original, type, context })
      })

      if (!response.ok) {
        throw new Error('Failed to review communication')
      }

      const review = await response.json()
      const communication: Communication = {
        id: Date.now().toString(),
        original,
        improved: review.improved,
        type,
        suggestions: review.suggestions,
        context: context || undefined,
        date: new Date().toISOString()
      }

      onAddCommunication(communication)
      setOriginal('')
      setContext('')
      setSelectedCommunication(communication)
    } catch (error) {
      console.error('Failed to review communication:', error)
      alert('Failed to review communication. Please try again.')
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Communication Coach
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get AI feedback on your emails, messages, and presentations for clarity, impact, and empathy
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comm-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Communication Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="comm-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="message">Message/Chat</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="tough-message">Tough Message (Layoffs, Rejections, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comm-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Communication *</Label>
            <Textarea
              id="comm-text"
              placeholder="Paste your actual email, message, or presentation text here..."
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={8}
              disabled={isReviewing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Enter the actual communication you want to improve. This requires your real message content.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comm-context" className="text-sm font-medium text-gray-700 dark:text-gray-300">Context (Optional)</Label>
            <Textarea
              id="comm-context"
              placeholder="Who is the recipient? What's the situation? Any sensitive considerations?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              disabled={isReviewing}
              className="bg-white dark:bg-slate-950"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Add context about your specific situation to get more tailored feedback.
            </p>
          </div>

          <Button
            onClick={handleReview}
            disabled={!original.trim() || isReviewing}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isReviewing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reviewing Communication...
              </>
            ) : (
              <>
                Review & Improve
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedCommunication && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Improved Communication</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCommunication(null)}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              {selectedCommunication.type.charAt(0).toUpperCase() + selectedCommunication.type.slice(1).replace('-', ' ')}
            </p>
          </div>
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Original</h3>
                <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-gray-200/60 dark:border-gray-800/60">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedCommunication.original}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Improved</h3>
                <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-gray-200/60 dark:border-gray-800/60">
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{selectedCommunication.improved}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {selectedCommunication.suggestions.clarity.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Clarity Suggestions</h3>
                  <ul className="space-y-3">
                    {selectedCommunication.suggestions.clarity.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCommunication.suggestions.impact.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Impact Enhancements</h3>
                  <ul className="space-y-3">
                    {selectedCommunication.suggestions.impact.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCommunication.suggestions.empathy.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Empathy Improvements</h3>
                  <ul className="space-y-3">
                    {selectedCommunication.suggestions.empathy.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-purple-500 dark:text-purple-400 mt-0.5">•</span>
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {communications.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Saved Communications ({communications.length})</h3>
          <div className="grid gap-6">
            {communications.slice().reverse().map((comm) => (
              <div
                key={comm.id}
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => setSelectedCommunication(comm)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-medium text-gray-900 dark:text-white">
                        {comm.type.charAt(0).toUpperCase() + comm.type.slice(1).replace('-', ' ')}
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {new Date(comm.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                      {comm.original.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border-gray-200/60 dark:border-gray-800/60 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNavigatingId(comm.id)
                        router.push(`/leadership/communication/${comm.id}`)
                      }}
                      disabled={navigatingId === comm.id}
                    >
                      {navigatingId === comm.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                    {onDeleteCommunication && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this communication?')) {
                            onDeleteCommunication(comm.id)
                            if (selectedCommunication?.id === comm.id) {
                              setSelectedCommunication(null)
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

