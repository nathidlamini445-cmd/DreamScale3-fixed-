"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, AlertCircle, Brain } from "lucide-react"
import { AIResponse } from '@/components/ai-response'
import { useSessionSafe } from '@/lib/session-context'
import { useToast } from '@/hooks/use-toast'

export default function LeadershipProblemSolver() {
  const sessionContext = useSessionSafe()
  const { toast } = useToast()
  const [problem, setProblem] = useState('')
  const [advice, setAdvice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGetAdvice = async () => {
    if (!problem.trim()) {
      setError('Please enter a problem to get advice')
      return
    }

    setIsLoading(true)
    setError(null)
    setAdvice(null)

    try {
      // Get user profile and mood from session
      const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
      const dailyMood = sessionContext?.sessionData?.dailyMood
      const today = new Date().toISOString().split('T')[0]
      const currentMood = dailyMood?.date === today ? dailyMood.mood : null

      // Create a leadership-focused prompt
      const leadershipPrompt = `As a leadership expert and business coach, provide comprehensive advice for this leadership problem:\n\n${problem}\n\nPlease provide:\n1. Analysis of the problem\n2. Practical solutions and strategies\n3. Action steps\n4. Long-term considerations\n\nFocus on leadership principles, team management, decision-making, and effective communication.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: leadershipPrompt,
          isResearch: false,
          userProfile: entrepreneurProfile || undefined,
          dailyMood: currentMood || undefined,
          hobbies: entrepreneurProfile?.hobbies || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get advice')
      }

      const data = await response.json()
      setAdvice(data.response || 'Sorry, I could not generate advice.')
    } catch (err) {
      console.error('Error getting advice:', err)
      setError('Failed to get advice. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setProblem('')
    setAdvice(null)
    setError(null)
    setLiked(false)
    setDisliked(false)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!advice) return
    
    try {
      await navigator.clipboard.writeText(advice)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Advice copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (!liked) {
      setDisliked(false)
      toast({
        title: "Thanks for your feedback!",
        description: "We're glad this advice was helpful",
      })
    }
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (!disliked) {
      setLiked(false)
      toast({
        title: "Thanks for your feedback!",
        description: "We'll use this to improve our advice",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#39d2c0]" />
            Leadership Problem Solver
          </CardTitle>
          <CardDescription>
            Describe a specific leadership problem you're facing, and Bizora AI will provide expert advice tailored to your situation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem">What leadership problem are you facing?</Label>
            <Textarea
              id="problem"
              placeholder="e.g., My team is not meeting deadlines and I'm struggling to hold them accountable without being too harsh..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[120px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGetAdvice}
              disabled={isLoading || !problem.trim()}
              className="bg-[#39d2c0] hover:bg-[#2bb3a3] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Advice...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get AI Advice
                </>
              )}
            </Button>
            {advice && (
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading}
              >
                Ask Another Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {advice && (
        <Card className="border-[#39d2c0]/20">
          <CardHeader>
            <CardTitle className="text-lg">Bizora AI Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <AIResponse 
                content={advice} 
                onCopy={handleCopy}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            </div>
            
            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                    Important Disclaimer
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This advice is generated by AI and is not 100% accurate. It should be used as a starting point for your decision-making process. Always consult with qualified leadership coaches, mentors, or advisors for critical decisions. Consider your specific context, team dynamics, and organizational culture when implementing any recommendations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

