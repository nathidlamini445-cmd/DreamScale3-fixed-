"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MessageSquare, X } from "lucide-react"
import { Communication } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface CommunicationCoachProps {
  communications: Communication[]
  onAddCommunication: (communication: Communication) => void
}

export default function CommunicationCoach({ communications, onAddCommunication }: CommunicationCoachProps) {
  const [original, setOriginal] = useState('')
  const [type, setType] = useState<'email' | 'message' | 'presentation' | 'tough-message'>('email')
  const [context, setContext] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#39d2c0]" />
            Communication Coach
          </CardTitle>
          <CardDescription>
            Get AI feedback on your emails, messages, and presentations for clarity, impact, and empathy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comm-type">Communication Type</Label>
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
            <Label htmlFor="comm-text">Your Communication *</Label>
            <Textarea
              id="comm-text"
              placeholder="Paste your email, message, or presentation text here..."
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={8}
              disabled={isReviewing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comm-context">Context (Optional)</Label>
            <Textarea
              id="comm-context"
              placeholder="Who is the recipient? What's the situation? Any sensitive considerations?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              disabled={isReviewing}
            />
          </div>

          <Button
            onClick={handleReview}
            disabled={!original.trim() || isReviewing}
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
          >
            {isReviewing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reviewing Communication...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Review & Improve
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {selectedCommunication && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Improved Communication</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCommunication(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {selectedCommunication.type.charAt(0).toUpperCase() + selectedCommunication.type.slice(1).replace('-', ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Original</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedCommunication.original}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Improved</h3>
                <div className="bg-[#39d2c0]/10 rounded-lg p-4 border border-[#39d2c0]/20">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedCommunication.improved}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedCommunication.suggestions.clarity.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Clarity Suggestions</h3>
                  <ul className="space-y-2">
                    {selectedCommunication.suggestions.clarity.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCommunication.suggestions.impact.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Impact Enhancements</h3>
                  <ul className="space-y-2">
                    {selectedCommunication.suggestions.impact.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCommunication.suggestions.empathy.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Empathy Improvements</h3>
                  <ul className="space-y-2">
                    {selectedCommunication.suggestions.empathy.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {communications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>{communications.length} communication{communications.length !== 1 ? 's' : ''} reviewed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communications.slice().reverse().map((comm) => (
                <Card
                  key={comm.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => setSelectedCommunication(comm)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comm.type.charAt(0).toUpperCase() + comm.type.slice(1).replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comm.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {comm.original.substring(0, 100)}...
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

