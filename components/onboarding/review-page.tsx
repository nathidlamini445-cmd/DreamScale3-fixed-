"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ThemeToggle } from '@/components/theme-toggle'
import { OnboardingData, UserType } from './onboarding-types'
import { ENTREPRENEUR_QUESTIONS, Question } from './question-flow'
import { Pencil, Check, X } from 'lucide-react'

interface ReviewPageProps {
  userType: UserType
  data: OnboardingData
  onEdit: (questionId: string) => void
  onSubmit: (data: OnboardingData) => void
  onBack: () => void
}

export default function ReviewPage({
  userType,
  data,
  onEdit,
  onSubmit,
  onBack,
}: ReviewPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedAnswers, setEditedAnswers] = useState<OnboardingData>(data)

  // Update editedAnswers when data prop changes (e.g., after editing)
  useEffect(() => {
    setEditedAnswers(data)
  }, [data])

  // Filter out story questions for review
  const questions = ENTREPRENEUR_QUESTIONS.filter(q => q.type !== 'story')

  const formatAnswer = (question: Question, answer: string | string[] | undefined): string => {
    if (!answer) return 'Not answered'
    
    if (Array.isArray(answer)) {
      if (answer.length === 0) return 'Not answered'
      return answer.map(item => {
        if (item.startsWith('Other:')) {
          return item.replace('Other:', 'Other:').trim()
        }
        return item
      }).join(', ')
    }
    
    return answer || 'Not answered'
  }

  const handleEdit = (questionId: string) => {
    setEditingId(questionId)
    onEdit(questionId)
  }

  const handleSubmit = () => {
    onSubmit(editedAnswers)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-8">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-black dark:text-white">
            Review Your <span className="bg-gradient-to-r from-[#191970] to-[#4169E1] dark:from-[#39d2c0] dark:to-[#005DFF] bg-clip-text text-transparent">Answers</span>
          </h1>
          <p className="text-base text-black dark:text-gray-300">
            Please review your answers below. You can edit any answer by clicking the edit button.
          </p>
        </motion.div>

        {/* Questions and Answers */}
        <div className="space-y-4 mb-8">
          {questions.map((question, index) => {
            const answer = editedAnswers[question.id as keyof OnboardingData]
            const formattedAnswer = formatAnswer(question, answer as string | string[] | undefined)
            const isEditing = editingId === question.id

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {question.label}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {formattedAnswer}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question.id)}
                      className="flex items-center gap-2 hover:bg-[#191970] hover:text-white hover:border-[#191970] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            Back to Questions
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-[#191970] hover:bg-[#191970]/90 text-white"
            size="lg"
          >
            Submit Answers
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

