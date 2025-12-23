"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2 } from "lucide-react"
import { LeadershipChallenge } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'
import { toast } from 'sonner'

interface LeadershipChallengesProps {
  challenges: LeadershipChallenge[]
  onUpdateChallenge: (challenge: LeadershipChallenge) => void
  onDeleteChallenge?: (id: string) => void
}

const CHALLENGE_SCENARIOS = [
  {
    id: 'cofounder-quit',
    scenario: 'Your co-founder wants to quit',
    category: 'Partnership',
    description: 'Your co-founder and business partner has decided to leave the company. They want to exit immediately and are asking for their equity share. How do you handle this situation while maintaining company stability and team morale?'
  },
  {
    id: 'investor-rejection',
    scenario: 'Investor says no to funding',
    category: 'Funding',
    description: 'After months of pitching, your lead investor has declined to invest. This was your primary funding source and you\'ve already made commitments based on this investment. How do you pivot and find alternative solutions?'
  },
  {
    id: 'key-employee-leaving',
    scenario: 'Key employee is leaving',
    category: 'Team',
    description: 'Your top-performing employee, who handles critical operations, has received an offer from a competitor and is considering leaving. They haven\'t made a final decision yet. How do you respond?'
  },
  {
    id: 'product-pivot',
    scenario: 'Need to pivot product strategy',
    category: 'Strategy',
    description: 'Market feedback indicates your current product direction isn\'t resonating. You need to pivot, but you\'ve already invested significant resources. How do you communicate this change and execute the pivot?'
  },
  {
    id: 'team-conflict',
    scenario: 'Major team conflict affecting productivity',
    category: 'Team',
    description: 'Two key team members are in conflict, and it\'s affecting the entire team\'s productivity. The conflict has escalated and is creating a toxic work environment. How do you resolve this?'
  },
  {
    id: 'customer-crisis',
    scenario: 'Major customer crisis',
    category: 'Operations',
    description: 'A major customer has experienced a critical issue with your product/service, and they\'re threatening to leave and share negative feedback publicly. How do you handle this crisis?'
  }
]

export default function LeadershipChallenges({ challenges, onUpdateChallenge, onDeleteChallenge }: LeadershipChallengesProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [userResponse, setUserResponse] = useState('')
  const [isGettingFeedback, setIsGettingFeedback] = useState(false)
  const [justCompletedChallenge, setJustCompletedChallenge] = useState<LeadershipChallenge | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  const existingChallenge = selectedScenario 
    ? (justCompletedChallenge && justCompletedChallenge.scenario === CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.scenario
        ? justCompletedChallenge
        : challenges.find(c => c.scenario === CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.scenario))
    : null

  // Scroll to feedback when a challenge is completed
  useEffect(() => {
    if (existingChallenge && existingChallenge.completed && feedbackRef.current) {
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [existingChallenge?.completed])

  const handleStartChallenge = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setUserResponse('')
    // Clear just completed challenge when starting a new one
    setJustCompletedChallenge(null)
  }

  const handleSimulate = async () => {
    if (!selectedScenario || !userResponse.trim()) {
      toast.error('Please enter your response to the scenario')
      return
    }

    setIsGettingFeedback(true)
    const loadingToast = toast.loading('Getting AI feedback...')
    
    try {
      const scenario = CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)
      if (!scenario) return

      const feedbackResponse = await fetch('/api/leadership/simulate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenario: scenario.scenario,
          description: scenario.description,
          userResponse,
          getFeedback: true
        })
      })

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${feedbackResponse.status}`
        
        toast.dismiss(loadingToast)
        
        if (errorMessage.includes('API key') || errorMessage.includes('Gemini')) {
          toast.error('API Key Missing', {
            description: 'To use AI feedback, set up your Gemini API key. See API_SETUP_GUIDE.md for instructions.',
            duration: 10000,
            action: {
              label: 'Get API Key',
              onClick: () => window.open('https://makersuite.google.com/app/apikey', '_blank')
            }
          })
        } else {
          toast.error('Failed to get feedback', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }

      const feedback = await feedbackResponse.json()

      // Check if the response contains an error
      if (feedback.error) {
        toast.dismiss(loadingToast)
        if (feedback.error.includes('API key') || feedback.error.includes('Gemini')) {
          toast.error('API Key Missing', {
            description: 'To use AI feedback, set up your Gemini API key. See API_SETUP_GUIDE.md for instructions.',
            duration: 10000,
            action: {
              label: 'Get API Key',
              onClick: () => window.open('https://makersuite.google.com/app/apikey', '_blank')
            }
          })
        } else {
          toast.error('API Error', {
            description: feedback.error
          })
        }
        return
      }

      toast.dismiss(loadingToast)
      toast.success('Feedback received!', {
        description: 'Your response has been analyzed.'
      })

      const challenge: LeadershipChallenge = {
        id: Date.now().toString(),
        scenario: scenario.scenario,
        category: scenario.category,
        description: scenario.description,
        userResponse,
        feedback: feedback.feedback || {
          strengths: [],
          improvements: [],
          score: 75,
          detailedAnalysis: ''
        },
        completed: true,
        date: new Date().toISOString()
      }

      // Set local state immediately so feedback displays right away
      setJustCompletedChallenge(challenge)
      onUpdateChallenge(challenge)
      // Keep selectedScenario set so the feedback is displayed
      // Clear userResponse to reset the form (though it won't be visible in completed view)
      setUserResponse('')
    } catch (error: any) {
      console.error('Failed to get feedback:', error)
      toast.dismiss(loadingToast)
      // Only show generic error if we haven't already shown a specific one
      if (!error.message || (!error.message.includes('API key') && !error.message.includes('Gemini'))) {
        toast.error('Failed to get feedback', {
          description: error.message || 'Unknown error. Please check your console for details.'
        })
      }
    } finally {
      setIsGettingFeedback(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            Leadership Challenges Library
          </h3>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Practice responding to real leadership scenarios and get AI feedback on your approach
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHALLENGE_SCENARIOS.map((scenario) => {
              const completed = challenges.some(c => c.scenario === scenario.scenario && c.completed)
              return (
                <div
                  key={scenario.id}
                  className={`cursor-pointer bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all ${
                    selectedScenario === scenario.id ? 'border-gray-300 dark:border-gray-700' : ''
                  }`}
                  onClick={() => handleStartChallenge(scenario.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{scenario.scenario}</h4>
                    {completed && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                        Completed
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3 inline-block">
                    {scenario.category}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedScenario && (
        <div ref={feedbackRef} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              {CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.scenario}
            </h3>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.description}
            </p>
          </div>
          <div className="space-y-8">
            {existingChallenge && existingChallenge.completed ? (
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <div className="mb-2">
                    <span className="text-base font-medium text-gray-900 dark:text-white">Challenge Completed</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Score: {existingChallenge.feedback?.score}/100
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Your Response</h3>
                  <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                    <p className="text-base text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                      {existingChallenge.userResponse}
                    </p>
                  </div>
                </div>

                {existingChallenge.feedback && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Strengths</h3>
                        <ul className="space-y-3">
                          {existingChallenge.feedback.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                              <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Improvements</h3>
                        <ul className="space-y-3">
                          {existingChallenge.feedback.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                              <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {existingChallenge.feedback.detailedAnalysis && (
                      <div>
                        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Detailed Analysis</h3>
                        <AIResponse content={existingChallenge.feedback.detailedAnalysis} />
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedScenario(null)
                    setUserResponse('')
                  }}
                  className="w-full border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Try Another Challenge
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">Your Response</label>
                  <Textarea
                    placeholder="How would you handle this situation? Describe your approach, key actions, and communication strategy..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={8}
                    disabled={isGettingFeedback}
                    className="border-gray-200 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-700"
                  />
                </div>

                <Button
                  onClick={handleSimulate}
                  disabled={!userResponse.trim() || isGettingFeedback}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
                >
                  {isGettingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Feedback...
                    </>
                  ) : (
                    'Submit Response & Get Feedback'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {challenges.filter(c => c.completed).length > 0 && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-6">
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Completed Challenges</h3>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {challenges.filter(c => c.completed).length} challenge{challenges.filter(c => c.completed).length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <div>
            <div className="space-y-4">
              {challenges.filter(c => c.completed).slice().reverse().map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        const scenario = CHALLENGE_SCENARIOS.find(s => s.scenario === challenge.scenario)
                        if (scenario) {
                          handleStartChallenge(scenario.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{challenge.scenario}</p>
                        {challenge.feedback && (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            Score: {challenge.feedback.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {challenge.category} • {challenge.date ? new Date(challenge.date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    {onDeleteChallenge && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this challenge?')) {
                            onDeleteChallenge(challenge.id)
                          }
                        }}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

