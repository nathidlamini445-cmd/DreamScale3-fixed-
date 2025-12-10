"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MessageCircle, X } from "lucide-react"
import { Feedback360 as Feedback360Type } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface Feedback360Props {
  feedback: Feedback360Type[]
  onAddFeedback: (feedback: Feedback360Type) => void
}

export default function Feedback360({ feedback, onAddFeedback }: Feedback360Props) {
  const [source, setSource] = useState('')
  const [relationship, setRelationship] = useState<'team' | 'peer' | 'mentor' | 'other'>('team')
  const [feedbackText, setFeedbackText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback360Type | null>(null)

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
      allGrowthAreas.push(...f.analysis.growthAreas)
      allStrengths.push(...f.analysis.strengths)
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
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#39d2c0]" />
            360° Feedback System
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Collect anonymous feedback from your team, peers, and mentors. AI identifies patterns and creates a development plan.
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-source">Source (Optional - can be anonymous)</Label>
              <Input
                id="feedback-source"
                placeholder="e.g., Team Member, Peer, Mentor"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-relationship">Relationship</Label>
              <Select value={relationship} onValueChange={(value: any) => setRelationship(value)}>
                <SelectTrigger id="feedback-relationship">
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
            <Label htmlFor="feedback-text">Feedback *</Label>
            <Textarea
              id="feedback-text"
              placeholder="Enter feedback about leadership, communication, decision-making, team management, etc..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!feedbackText.trim() || isAnalyzing}
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Feedback...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Submit & Analyze Feedback
              </>
            )}
          </Button>
        </div>
      </div>

      {aggregated && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aggregate Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Patterns identified across {aggregated.totalFeedback} feedback entries
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Patterns</h3>
                <ul className="space-y-2">
                  {aggregated.patterns.slice(0, 5).map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Strengths</h3>
                <ul className="space-y-2">
                  {aggregated.strengths.slice(0, 5).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-yellow-600">Growth Areas</h3>
                <ul className="space-y-2">
                  {aggregated.growthAreas.slice(0, 5).map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFeedback && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeedback(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              From: {selectedFeedback.feedback.source} ({selectedFeedback.feedback.relationship})
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Original Feedback</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedFeedback.feedback.text}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Patterns Identified</h3>
                <ul className="space-y-2">
                  {selectedFeedback.analysis.patterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Growth Areas</h3>
                <ul className="space-y-2">
                  {selectedFeedback.analysis.growthAreas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedFeedback.analysis.strengths.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Strengths</h3>
                <ul className="space-y-2">
                  {selectedFeedback.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedFeedback.analysis.developmentPlan.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Development Plan</h3>
                <div className="space-y-4">
                  {selectedFeedback.analysis.developmentPlan.map((plan, index) => (
                    <div key={index} className="p-4 bg-[#39d2c0]/10 border border-[#39d2c0]/20 rounded-lg">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{plan.area}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Timeline: {plan.timeline}</p>
                      <ul className="space-y-2">
                        {plan.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2">
                            <span className="text-[#39d2c0] mt-1">•</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
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
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feedback.length} feedback entr{feedback.length !== 1 ? 'ies' : 'y'} received</p>
          </div>
          <div>
            <div className="space-y-3">
              {feedback.slice().reverse().map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => setSelectedFeedback(item)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.feedback.source}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({item.feedback.relationship})
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.feedback.text.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

