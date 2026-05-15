'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useSessionSafe } from '@/lib/session-context'
import { getPersonalizedGuidance, getNextSteps, getMindsetQuestions } from '@/lib/content/industry-content'
import { 
  Lightbulb, Target, TrendingUp, CheckCircle2, ArrowRight, 
  HelpCircle, BookOpen, Rocket, Building
} from 'lucide-react'

export function PersonalizedGuidance() {
  const sessionContext = useSessionSafe()
  const [mindsetAnswers, setMindsetAnswers] = useState<Record<string, string>>({})
  const [showQuestions, setShowQuestions] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
  const dailyMood = sessionContext?.sessionData?.dailyMood
  const today = new Date().toISOString().split('T')[0]
  const currentMood = dailyMood?.date === today ? dailyMood.mood : null
  const hobbies = entrepreneurProfile?.hobbies || []
  
  const guidance = entrepreneurProfile ? getPersonalizedGuidance(entrepreneurProfile) : null
  const nextSteps = entrepreneurProfile ? getNextSteps(entrepreneurProfile) : []
  const mindsetQuestions = entrepreneurProfile ? getMindsetQuestions(entrepreneurProfile) : []

  useEffect(() => {
    // Load existing mindset answers
    if (entrepreneurProfile?.mindsetAnswers) {
      setMindsetAnswers(entrepreneurProfile.mindsetAnswers)
    }
  }, [entrepreneurProfile])

  const handleMindsetAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...mindsetAnswers, [questionId]: answer }
    setMindsetAnswers(newAnswers)
    
    if (sessionContext) {
      sessionContext.updateEntrepreneurProfile({
        mindsetAnswers: newAnswers
      })
    }
  }

  if (!entrepreneurProfile || !entrepreneurProfile.onboardingCompleted) {
    return null
  }

  const isBeginner = entrepreneurProfile.experienceLevel === 'beginner'
  const isIdeaStage = entrepreneurProfile.businessStage === 'idea'
  const isFoundationStage = entrepreneurProfile.businessStage === 'foundation'
  
  // Mood-based adjustments
  const isDemotivated = currentMood === 'demotivated' || currentMood === 'tired' || currentMood === 'overwhelmed'
  const isMotivated = currentMood === 'motivated' || currentMood === 'excited' || currentMood === 'energized' || currentMood === 'confident' || currentMood === 'determined'
  const isStressed = currentMood === 'stressed' || currentMood === 'anxious' || currentMood === 'uncertain'
  
  // Get hobby-based example
  const getHobbyExample = (step: string): string => {
    if (hobbies.includes('gym') || hobbies.includes('fitness')) {
      return step.replace(/alternative/g, 'alternative (just like finding another exercise at the gym when your machine is taken)')
    }
    if (hobbies.includes('music') || hobbies.includes('jamming')) {
      return step.replace(/persistence/g, 'persistence (like practicing a song until you get it right)')
    }
    return step
  }

  return (
    <div className="space-y-6">
      {/* Mood-based encouragement banner */}
      {isDemotivated && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Remember: Every Step Counts</h3>
              <p className="text-sm text-muted-foreground">
                {hobbies.includes('gym') || hobbies.includes('fitness') 
                  ? "Just like at the gym, when someone's using the machine you need, you don't quit—you find an alternative exercise. In business, when one path is blocked, find another way. You've got this!"
                  : "Small progress is still progress. Break things down into smaller steps and celebrate each win. You're building something meaningful."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* What to Do Next - Prominent for Beginners */}
      {isBeginner && nextSteps.length > 0 && (
        <Card className={`p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 ${isDemotivated ? 'opacity-90' : ''}`}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isDemotivated ? 'Small Steps Forward' : 'What to Do Next'}
              </h2>
              <p className="text-muted-foreground">
                {isDemotivated 
                  ? 'Let\'s focus on just the first few steps. You don\'t have to do everything at once.'
                  : `Here's your personalized roadmap to get started in ${guidance?.industry || 'your industry'}`
                }
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {(isDemotivated ? nextSteps.slice(0, 3) : nextSteps.slice(0, 5)).map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-semibold">{index + 1}</span>
                </div>
                <span className="text-foreground flex-1">{getHobbyExample(step)}</span>
                {index === 0 && (
                  <Badge className="bg-primary text-primary-foreground">Start Here</Badge>
                )}
              </div>
            ))}
            {!isDemotivated && nextSteps.length > 5 && (
              <p className="text-sm text-muted-foreground mt-2">
                + {nextSteps.length - 5} more steps available
              </p>
            )}
            {isDemotivated && nextSteps.length > 3 && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                Focus on these first. We'll tackle the rest when you're ready.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Personalized Guidance Card */}
      {guidance && (
        <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your {guidance.industry} Journey
              </h2>
              <p className="text-muted-foreground">
                {isBeginner 
                  ? 'Let\'s build your foundation step by step'
                  : entrepreneurProfile.experienceLevel === 'intermediate'
                  ? 'Time to scale and optimize your operations'
                  : 'Focus on advanced strategies and optimization'
                }
              </p>
            </div>
          </div>

          {/* Business Stage Specific Guidance */}
          {isIdeaStage && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Idea Stage Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    {isDemotivated 
                      ? 'Start small. Just validate one aspect of your idea today. You don\'t need to build everything at once.'
                      : 'You\'re in the validation phase. Focus on understanding your market, testing your concept, and building your minimum viable product or service.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {isFoundationStage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Foundation Stage Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    {isDemotivated
                      ? 'Focus on one thing at a time. Getting one customer or improving one process is progress worth celebrating.'
                      : 'You\'re building your foundation. Focus on getting your first customers, refining your operations, and establishing systems that can scale.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivated state - show advanced opportunities */}
          {isMotivated && !isBeginner && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">You're Ready to Scale!</h3>
                  <p className="text-sm text-muted-foreground">
                    With your energy and motivation, now's the perfect time to explore scaling opportunities, advanced strategies, and new growth avenues. Let's push forward!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stressed state - show simplification tips */}
          {isStressed && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Simplify and Prioritize</h3>
                  <p className="text-sm text-muted-foreground">
                    When feeling stressed, focus on one thing at a time. What's the single most important task right now? Start there. Everything else can wait.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Industry Tips */}
          {guidance.tips && guidance.tips.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {guidance.industry} Success Tips
                {hobbies.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Tailored for you
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(isDemotivated ? guidance.tips.slice(0, 2) : guidance.tips.slice(0, 4)).map((tip, index) => {
                  // Enhance tip with hobby reference if relevant
                  let enhancedTip = tip
                  if (hobbies.includes('gym') || hobbies.includes('fitness')) {
                    if (tip.includes('persistence') || tip.includes('alternative') || tip.includes('challenge')) {
                      enhancedTip = tip + ' (Think of it like finding another exercise at the gym when your machine is taken)'
                    }
                  }
                  if (hobbies.includes('music') || hobbies.includes('jamming')) {
                    if (tip.includes('practice') || tip.includes('improve') || tip.includes('skill')) {
                      enhancedTip = tip + ' (Like practicing a song until you master it)'
                    }
                  }
                  return (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{enhancedTip}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Check-In Saved!</h3>
              <p className="text-sm text-muted-foreground">
                Your answers have been saved. We'll use this information to personalize your Discover page content and recommendations.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mindset Questions - Interactive Component */}
      {mindsetQuestions.length > 0 && (
        <Card className="p-6 quick-checkin-section">
          <div className="text-black dark:text-white [&_*]:text-black dark:[&_*]:text-white">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Quick Check-In</h2>
                <p className="text-black dark:text-white">
                  Help us understand where you're at so we can provide better guidance
                </p>
              </div>
            </div>

            {!showQuestions ? (
              <Button
                onClick={() => setShowQuestions(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Answer Questions
                <ArrowRight className="w-4 h-4 ml-2 text-white" />
              </Button>
            ) : (
              <div className="space-y-4 mt-4">
                {mindsetQuestions.slice(0, 2).map((q) => (
                  <div key={q.id} className="space-y-2">
                    <label className="text-sm font-medium text-black dark:text-white">{q.question}</label>
                    {q.type === 'select' ? (
                      <Select
                        value={mindsetAnswers[q.id] || ''}
                        onValueChange={(value) => handleMindsetAnswer(q.id, value)}
                      >
                        <SelectTrigger className="w-full text-black dark:text-white placeholder:text-gray-400">
                          <SelectValue placeholder="Select an option" className="text-black dark:text-white" />
                        </SelectTrigger>
                        <SelectContent className="text-black dark:text-white">
                          {q.options?.map((option) => (
                            <SelectItem key={option} value={option} className="text-black dark:text-white">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Type your answer..."
                        value={mindsetAnswers[q.id] || ''}
                        onChange={(e) => handleMindsetAnswer(q.id, e.target.value)}
                        className="text-black dark:text-white placeholder:text-gray-400"
                      />
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      // Check if at least one question is answered
                      const hasAnswers = Object.keys(mindsetAnswers).length > 0 && 
                        Object.values(mindsetAnswers).some(answer => answer.trim() !== '')
                      
                      if (hasAnswers) {
                        // Show success message
                        setShowSuccessMessage(true)
                        setShowQuestions(false)
                        
                        // Hide success message after 3 seconds
                        setTimeout(() => {
                          setShowSuccessMessage(false)
                        }, 3000)
                        
                        // Update Discover page personalization with new answers
                        // The personalization algorithm will automatically use these answers
                        console.log('✅ Check-in answers saved:', mindsetAnswers)
                      } else {
                        // Just close if no answers
                        setShowQuestions(false)
                      }
                    }}
                    variant="outline"
                    className="flex-1 text-black dark:text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Next Steps for Non-Beginners */}
      {!isBeginner && nextSteps.length > 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isMotivated ? 'Scale & Grow' : 'Your Next Steps'}
              </h2>
              <p className="text-muted-foreground">
                {isMotivated
                  ? `With your energy, let's explore advanced strategies for ${guidance?.industry || 'your business'}`
                  : `Focused actions to take your ${guidance?.industry || 'business'} to the next level`
                }
              </p>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {(isStressed || isDemotivated ? nextSteps.slice(0, 2) : nextSteps.slice(0, 4)).map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-sm">{getHobbyExample(step)}</span>
              </div>
            ))}
            {isStressed && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Focus on these first. One thing at a time.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

