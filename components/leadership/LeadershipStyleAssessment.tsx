"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Share } from "lucide-react"
import { LeadershipStyleAssessment as AssessmentType } from '@/lib/leadership-types'
import { ShareModal } from '@/components/share-modal'

interface LeadershipStyleAssessmentProps {
  data: AssessmentType | null
  onComplete: (assessment: AssessmentType) => void
}

const ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    question: 'When making decisions, I prefer to:',
    options: [
      'Consult with my team and build consensus',
      'Analyze data thoroughly before deciding',
      'Trust my instincts and move quickly',
      'Consider long-term vision and values'
    ]
  },
  {
    id: 'q2',
    question: 'In team meetings, I typically:',
    options: [
      'Encourage everyone to share ideas',
      'Focus on efficiency and action items',
      'Inspire with vision and big picture',
      'Listen carefully and synthesize input'
    ]
  },
  {
    id: 'q3',
    question: 'When a team member makes a mistake, I:',
    options: [
      'Use it as a teaching moment',
      'Address it directly and set clear expectations',
      'Focus on the learning opportunity',
      'Provide support and guidance'
    ]
  },
  {
    id: 'q4',
    question: 'My communication style is:',
    options: [
      'Open, transparent, and frequent',
      'Clear, direct, and goal-oriented',
      'Visionary and inspiring',
      'Thoughtful and empathetic'
    ]
  },
  {
    id: 'q5',
    question: 'I motivate my team by:',
    options: [
      'Creating a shared sense of purpose',
      'Setting clear goals and rewards',
      'Inspiring with vision and passion',
      'Supporting personal growth and development'
    ]
  },
  {
    id: 'q6',
    question: 'During times of change, I:',
    options: [
      'Involve the team in planning',
      'Create clear processes and structures',
      'Communicate the vision and rally support',
      'Ensure everyone feels supported'
    ]
  },
  {
    id: 'q7',
    question: 'I measure success by:',
    options: [
      'Team satisfaction and engagement',
      'Metrics and performance indicators',
      'Innovation and breakthrough moments',
      'Personal growth and development'
    ]
  },
  {
    id: 'q8',
    question: 'When delegating, I:',
    options: [
      'Empower with autonomy and trust',
      'Provide clear instructions and checkpoints',
      'Share the vision and let them create',
      'Offer guidance and be available for support'
    ]
  },
  {
    id: 'q9',
    question: 'In conflict situations, I:',
    options: [
      'Facilitate open dialogue',
      'Focus on finding solutions quickly',
      'Address underlying values and principles',
      'Ensure all voices are heard'
    ]
  },
  {
    id: 'q10',
    question: 'My leadership philosophy centers on:',
    options: [
      'Empowering others to lead',
      'Achieving results through structure',
      'Transforming organizations',
      'Serving the team\'s needs'
    ]
  }
]

export default function LeadershipStyleAssessment({ data, onComplete }: LeadershipStyleAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AssessmentType | null>(data)
  const [shareModal, setShareModal] = useState<{isOpen: boolean, content: string, title: string}>({
    isOpen: false,
    content: '',
    title: ''
  })

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { questionId: ASSESSMENT_QUESTIONS[currentQuestion].id, answer }]
    setAnswers(newAnswers)

    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      analyzeResults(newAnswers)
    }
  }

  const analyzeResults = async (finalAnswers: { questionId: string; answer: string }[]) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/leadership/assess-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze leadership style')
      }

      const analysis = await response.json()
      const assessment: AssessmentType = {
        completed: true,
        results: analysis,
        date: new Date().toISOString(),
        answers: finalAnswers
      }

      setResults(assessment)
      onComplete(assessment)
    } catch (error) {
      console.error('Failed to analyze leadership style:', error)
      alert('Failed to analyze your leadership style. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const restartAssessment = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setResults(null)
  }

  if (results?.completed) {
    return (
      <>
        <div className="p-6 bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Your Leadership Style</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assessment completed on {new Date(results.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (results?.results) {
                      let content = `# Leadership Style Assessment Results\n\n`
                      content += `**Style:** ${results.results.style}\n`
                      content += `**Score:** ${results.results.score}/100\n\n`
                      content += `## Style Description\n\n${results.results.styleDescription || ''}\n\n`
                      content += `## Strengths\n\n`
                      results.results.strengths.forEach(strength => {
                        content += `- ${strength}\n`
                      })
                      content += `\n## Blind Spots\n\n`
                      results.results.blindSpots.forEach(spot => {
                        content += `- ${spot}\n`
                      })
                      content += `\n## Situational Adaptations\n\n`
                      results.results.adaptations.forEach(adaptation => {
                        content += `### ${adaptation.situation}\n\n${adaptation.recommendedApproach}\n\n`
                      })
                      setShareModal({
                        isOpen: true,
                        content,
                        title: `Leadership Style: ${results.results.style}`
                      })
                    }
                  }}
                  className="border-gray-200/60 dark:border-gray-800/60"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={restartAssessment} className="border-gray-200/60 dark:border-gray-800/60 font-medium">
                  Retake Assessment
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">{results.results.style}</h2>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="outline" className="border-gray-200/60 dark:border-gray-800/60 text-sm font-medium">
                  Score: {results.results.score}/100
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {results.results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">
                  Blind Spots
                </h3>
                <ul className="space-y-3">
                  {results.results.blindSpots.map((spot, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{spot}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Situational Adaptations</h3>
              <div className="space-y-4">
                {results.results.adaptations.map((adaptation, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {adaptation.situation}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {adaptation.recommendedApproach}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Share Modal */}
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
          messageContent={shareModal.content}
          contentType="Leadership Style Assessment"
          contentTitle={shareModal.title}
        />
      </>
    )
  }

  if (isAnalyzing) {
    return (
      <>
        <div className="p-6 bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#39d2c0] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing your leadership style...</p>
          </div>
        </div>
        
        {/* Share Modal */}
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
          messageContent={shareModal.content}
          contentType="Leadership Style Assessment"
          contentTitle={shareModal.title}
        />
      </>
    )
  }

  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
      <div className="mb-4">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Leadership Style Assessment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Answer 10 questions to discover your leadership style, strengths, and areas for growth
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {ASSESSMENT_QUESTIONS[currentQuestion].question}
          </h3>
          <div className="space-y-3">
            {ASSESSMENT_QUESTIONS[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4 text-left bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300/80 dark:hover:border-gray-700/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)] transition-all duration-150"
                onClick={() => handleAnswer(option)}
              >
                <span className="flex-1 text-gray-900 dark:text-white">{option}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
        messageContent={shareModal.content}
        contentType="Leadership Style Assessment"
        contentTitle={shareModal.title}
      />
    </div>
  )
}

