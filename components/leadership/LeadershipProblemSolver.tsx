"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Trash2, X } from "lucide-react"
import { AIResponse } from '@/components/ai-response'
import { useSessionSafe } from '@/lib/session-context'
import { useToast } from '@/hooks/use-toast'

interface SavedAdvice {
  id: string
  problem: string
  advice: string
  date: string
}

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
  const [savedAdvice, setSavedAdvice] = useState<SavedAdvice[]>([])
  const [selectedAdvice, setSelectedAdvice] = useState<SavedAdvice | null>(null)

  // Load saved advice from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadership:problem-solver')
      if (saved) {
        setSavedAdvice(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load saved advice', e)
    }
  }, [])

  // Save advice to localStorage
  const saveAdvice = (problemText: string, adviceText: string) => {
    const newAdvice: SavedAdvice = {
      id: Date.now().toString(),
      problem: problemText,
      advice: adviceText,
      date: new Date().toISOString()
    }
    const updated = [newAdvice, ...savedAdvice]
    setSavedAdvice(updated)
    try {
      localStorage.setItem('leadership:problem-solver', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save advice', e)
    }
    setSelectedAdvice(newAdvice)
  }

  const deleteAdvice = (id: string) => {
    const updated = savedAdvice.filter(a => a.id !== id)
    setSavedAdvice(updated)
    try {
      localStorage.setItem('leadership:problem-solver', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to delete advice', e)
    }
    if (selectedAdvice?.id === id) {
      setSelectedAdvice(null)
      setAdvice(null)
      setProblem('')
    }
  }

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
      // Ensure advice is always a string
      const adviceText = typeof data.response === 'string' 
        ? data.response 
        : (data.response ? JSON.stringify(data.response, null, 2) : 'Sorry, I could not generate advice.')
      setAdvice(adviceText)
      saveAdvice(problem, adviceText)
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
    <div className="space-y-12">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Leadership Problem Solver
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Describe a specific leadership problem you're facing, and Bizora AI will provide expert advice tailored to your situation.
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="problem" className="text-sm font-medium text-gray-700 dark:text-gray-300">What leadership problem are you facing?</Label>
            <Textarea
              id="problem"
              placeholder="e.g., My team is not meeting deadlines and I'm struggling to hold them accountable without being too harsh..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[120px] bg-white dark:bg-slate-950"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 bg-white dark:bg-slate-950 border border-red-200/60 dark:border-red-800/60 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGetAdvice}
              disabled={isLoading || !problem.trim()}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Advice...
                </>
              ) : (
                <>
                  Get AI Advice
                </>
              )}
            </Button>
            {advice && (
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading}
                className="border-gray-200/60 dark:border-gray-800/60 font-medium"
              >
                Ask Another Question
              </Button>
            )}
          </div>
        </div>
      </div>

      {(advice || selectedAdvice) && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">AI Advice</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAdvice(null)
                  setAdvice(null)
                }}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {selectedAdvice && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                Problem: {selectedAdvice.problem.substring(0, 100)}...
              </p>
            )}
          </div>
          <div className="space-y-8">
            <div className="max-w-4xl">
              <AIResponse 
                content={selectedAdvice?.advice || advice || ''} 
                onCopy={handleCopy}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            </div>
            
            {/* Disclaimer */}
            <div className="mt-8 p-6 bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Important Disclaimer
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                    This advice is generated by AI and is not 100% accurate. It should be used as a starting point for your decision-making process. Always consult with qualified leadership coaches, mentors, or advisors for critical decisions. Consider your specific context, team dynamics, and organizational culture when implementing any recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {savedAdvice.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Saved Advice ({savedAdvice.length})</h3>
          <div className="grid gap-6">
            {savedAdvice.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => {
                  setSelectedAdvice(item)
                  setAdvice(item.advice)
                  setProblem(item.problem)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{item.problem}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="border-gray-200/60 dark:border-gray-800/60 font-medium">
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this advice?')) {
                          deleteAdvice(item.id)
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

