"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X, Trash2 } from "lucide-react"
import { Feedback360 as Feedback360Type } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface Feedback360Props {
  feedback: Feedback360Type[]
  onAddFeedback: (feedback: Feedback360Type) => void
  onDeleteFeedback?: (id: string) => void
}

export default function Feedback360({ feedback, onAddFeedback, onDeleteFeedback }: Feedback360Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [source, setSource] = useState('')
  const [relationship, setRelationship] = useState<'team' | 'peer' | 'mentor' | 'other'>('team')
  const [feedbackText, setFeedbackText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback360Type | null>(null)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/leadership/feedback/')) {
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

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      alert('Please enter feedback text')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/leadership/analyze-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedback: feedbackText,
          source: source || 'Anonymous',
          relationship
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze feedback')
      }

      const analysis = await response.json()
      const feedbackItem: Feedback360Type = {
        id: Date.now().toString(),
        feedback: {
          source: source || 'Anonymous',
          relationship,
          text: feedbackText,
          categories: analysis.categories || []
        },
        analysis,
        date: new Date().toISOString()
      }

      onAddFeedback(feedbackItem)
      setSource('')
      setFeedbackText('')
      setSelectedFeedback(feedbackItem)
    } catch (error) {
      console.error('Failed to analyze feedback:', error)
      alert('Failed to analyze feedback. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Aggregate analysis across all feedback
  const aggregateAnalysis = () => {
    if (feedback.length === 0) return null

    const allPatterns: string[] = []
    const allGrowthAreas: string[] = []
    const allStrengths: string[] = []

    feedback.forEach(f => {
      allPatterns.push(...f.analysis.patterns)
      
      // Handle growthAreas - can be string[] or object[]
      f.analysis.growthAreas.forEach(item => {
        if (typeof item === 'string') {
          allGrowthAreas.push(item)
        } else if (item.area) {
          allGrowthAreas.push(item.area)
        }
      })
      
      // Handle strengths - can be string[] or object[]
      f.analysis.strengths.forEach(item => {
        if (typeof item === 'string') {
          allStrengths.push(item)
        } else if (item.strength) {
          allStrengths.push(item.strength)
        }
      })
    })

    // Get unique items
    const uniquePatterns = Array.from(new Set(allPatterns))
    const uniqueGrowthAreas = Array.from(new Set(allGrowthAreas))
    const uniqueStrengths = Array.from(new Set(allStrengths))

    return {
      patterns: uniquePatterns,
      growthAreas: uniqueGrowthAreas,
      strengths: uniqueStrengths,
      totalFeedback: feedback.length
    }
  }

  const aggregated = aggregateAnalysis()

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            360° Feedback System
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Collect anonymous feedback from your team, peers, and mentors. AI identifies patterns and creates a development plan.
          </p>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="feedback-source" className="text-sm font-medium text-gray-700 dark:text-gray-300">Source (Optional - can be anonymous)</Label>
              <Input
                id="feedback-source"
                placeholder="e.g., Team Member, Peer, Mentor"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</Label>
              <Select value={relationship} onValueChange={(value: any) => setRelationship(value)}>
                <SelectTrigger id="feedback-relationship" className="bg-white dark:bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team Member</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback *</Label>
            <Textarea
              id="feedback-text"
              placeholder="Enter feedback about leadership, communication, decision-making, team management, etc..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              disabled={isAnalyzing}
              className="bg-white dark:bg-slate-950"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!feedbackText.trim() || isAnalyzing}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Feedback...
              </>
            ) : (
              <>
                Submit & Analyze Feedback
              </>
            )}
          </Button>
        </div>
      </div>

      {aggregated && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aggregate Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Patterns identified across {aggregated.totalFeedback} feedback entries
            </p>
          </div>
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Patterns</h3>
                <ul className="space-y-3">
                  {aggregated.patterns.slice(0, 5).map((pattern, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Strengths</h3>
                <ul className="space-y-3">
                  {aggregated.strengths.slice(0, 5).map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Growth Areas</h3>
                <ul className="space-y-3">
                  {aggregated.growthAreas.slice(0, 5).map((area, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFeedback && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Feedback Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeedback(null)}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              From: {selectedFeedback.feedback.source} ({selectedFeedback.feedback.relationship})
            </p>
          </div>
          <div className="space-y-12">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Original Feedback</h3>
              <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-gray-200/60 dark:border-gray-800/60">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {selectedFeedback.feedback.text}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Patterns Identified</h3>
                <ul className="space-y-3">
                  {selectedFeedback.analysis.patterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Growth Areas</h3>
                <ul className="space-y-3">
                  {selectedFeedback.analysis.growthAreas.map((area, index) => {
                    const areaText = typeof area === 'string' ? area : (area.area || area.description || 'Growth area')
                    return (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{areaText}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {selectedFeedback.analysis.strengths.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Strengths</h3>
                <ul className="space-y-3">
                  {selectedFeedback.analysis.strengths.map((strength, index) => {
                    const strengthText = typeof strength === 'string' ? strength : (strength.strength || strength.description || 'Strength')
                    return (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{strengthText}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {selectedFeedback.analysis.developmentPlan.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Personal Development Plan</h3>
                <div className="space-y-6">
                  {selectedFeedback.analysis.developmentPlan.map((plan, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">{plan.area}</h4>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Timeline: {plan.timeline}</p>
                      <ul className="space-y-2">
                        {plan.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-3">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {feedback.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Saved Feedback ({feedback.length})</h3>
          <div className="grid gap-6">
            {feedback.slice().reverse().map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {item.feedback.source}
                      </p>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        ({item.feedback.relationship})
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {item.feedback.text.substring(0, 100)}...
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border-gray-200/60 dark:border-gray-800/60 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNavigatingId(item.id)
                        router.push(`/leadership/feedback/${item.id}`)
                      }}
                      disabled={navigatingId === item.id}
                    >
                      {navigatingId === item.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                    {onDeleteFeedback && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this feedback?')) {
                            onDeleteFeedback(item.id)
                            if (selectedFeedback?.id === item.id) {
                              setSelectedFeedback(null)
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

