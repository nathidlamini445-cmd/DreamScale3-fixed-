"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, CheckCircle2 } from "lucide-react"
import { LeadershipChallenge } from '@/lib/leadership-types'
import { AIResponse } from '@/components/ai-response'

interface LeadershipChallengesProps {
  challenges: LeadershipChallenge[]
  onUpdateChallenge: (challenge: LeadershipChallenge) => void
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

export default function LeadershipChallenges({ challenges, onUpdateChallenge }: LeadershipChallengesProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [userResponse, setUserResponse] = useState('')
  const [isGettingFeedback, setIsGettingFeedback] = useState(false)

  const handleStartChallenge = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setUserResponse('')
  }

  const handleSimulate = async () => {
    if (!selectedScenario || !userResponse.trim()) {
      alert('Please enter your response to the scenario')
      return
    }

    setIsGettingFeedback(true)
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
        throw new Error('Failed to get feedback')
      }

      const feedback = await feedbackResponse.json()

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

      onUpdateChallenge(challenge)
      setSelectedScenario(null)
      setUserResponse('')
    } catch (error) {
      console.error('Failed to get feedback:', error)
      alert('Failed to get feedback. Please try again.')
    } finally {
      setIsGettingFeedback(false)
    }
  }

  const existingChallenge = selectedScenario 
    ? challenges.find(c => c.scenario === CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.scenario)
    : null

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#39d2c0]" />
            Leadership Challenges Library
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Practice responding to real leadership scenarios and get AI feedback on your approach
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGE_SCENARIOS.map((scenario) => {
              const completed = challenges.some(c => c.scenario === scenario.scenario && c.completed)
              return (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all ${
                    selectedScenario === scenario.id ? 'border-[#39d2c0] border-2' : ''
                  }`}
                  onClick={() => handleStartChallenge(scenario.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{scenario.scenario}</CardTitle>
                      {completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {scenario.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {scenario.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {selectedScenario && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.scenario}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {CHALLENGE_SCENARIOS.find(s => s.id === selectedScenario)?.description}
            </p>
          </div>
          <div className="space-y-4">
            {existingChallenge && existingChallenge.completed ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-900 dark:text-green-200">Challenge Completed</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Score: {existingChallenge.feedback?.score}/100
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Response</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {existingChallenge.userResponse}
                    </p>
                  </div>
                </div>

                {existingChallenge.feedback && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-green-600">Strengths</h3>
                        <ul className="space-y-1">
                          {existingChallenge.feedback.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-yellow-600">Improvements</h3>
                        <ul className="space-y-1">
                          {existingChallenge.feedback.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-1">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {existingChallenge.feedback.detailedAnalysis && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
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
                  className="w-full"
                >
                  Try Another Challenge
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Response</label>
                  <Textarea
                    placeholder="How would you handle this situation? Describe your approach, key actions, and communication strategy..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={8}
                    disabled={isGettingFeedback}
                  />
                </div>

                <Button
                  onClick={handleSimulate}
                  disabled={!userResponse.trim() || isGettingFeedback}
                  className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
                >
                  {isGettingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Feedback...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Submit Response & Get Feedback
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {challenges.filter(c => c.completed).length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Challenges</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {challenges.filter(c => c.completed).length} challenge{challenges.filter(c => c.completed).length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <div>
            <div className="space-y-3">
              {challenges.filter(c => c.completed).slice().reverse().map((challenge) => (
                <Card
                  key={challenge.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => {
                    const scenario = CHALLENGE_SCENARIOS.find(s => s.scenario === challenge.scenario)
                    if (scenario) {
                      handleStartChallenge(scenario.id)
                    }
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">{challenge.scenario}</p>
                          {challenge.feedback && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                              Score: {challenge.feedback.score}/100
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {challenge.category} • {challenge.date ? new Date(challenge.date).toLocaleDateString() : ''}
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

