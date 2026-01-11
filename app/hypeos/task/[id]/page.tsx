"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Clock, Sparkles, CheckCircle, Target, Loader2 } from "lucide-react"
import { useSessionSafe } from '@/lib/session-context'
import { useBizoraLoading } from "@/lib/bizora-loading-context"
import { getHowToCompleteInstructions } from '@/lib/hypeos/task-instructions'

interface Task {
  id: number
  title: string
  completed: boolean
  points: number
  impact: 'high' | 'medium' | 'low'
  estimatedTime?: string
  category?: string
  howToComplete?: string[]
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const { setOpeningBizora } = useBizoraLoading()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNavigatingToBizora, setIsNavigatingToBizora] = useState(false)

  useEffect(() => {
    const loadTask = () => {
      try {
        const sessionData = sessionContext?.sessionData
        if (!sessionData?.hypeos) {
          router.push('/hypeos')
          return
        }

        // Find task in today's tasks
        const todayTasks = sessionData.hypeos.tasks || []
        const foundTask = todayTasks.find((t: Task) => t.id.toString() === params.id)

        if (foundTask) {
          // If task doesn't have howToComplete, generate it
          if (!foundTask.howToComplete || foundTask.howToComplete.length === 0) {
            const generatedSteps = getHowToCompleteInstructions(
              foundTask.title,
              foundTask.category || ''
            )
            if (generatedSteps) {
              foundTask.howToComplete = generatedSteps
            }
          }
          setTask(foundTask)
        } else {
          // Task not found, redirect back
          router.push('/hypeos')
        }
      } catch (e) {
        console.error('Failed to load task:', e)
        router.push('/hypeos')
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [params.id, sessionContext, router])

  const handleComplete = () => {
    if (!task) return
    
    // Mark task as completed and navigate back
    // The parent page will handle the full completion logic
    const sessionData = sessionContext?.sessionData
    if (sessionData?.hypeos) {
      const updatedTasks = sessionData.hypeos.tasks.map((t: Task) =>
        t.id === task.id ? { ...t, completed: true } : t
      )
      
      sessionContext.updateSessionData({
        hypeos: {
          ...sessionData.hypeos,
          tasks: updatedTasks
        }
      })
      
      // Navigate back - the parent page will handle completion logic
      router.push('/hypeos')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Task not found</p>
              <button 
                onClick={() => router.push('/hypeos')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to HypeOS
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const bizoraUrl = `/bizora?task=${encodeURIComponent(task.title)}&instructions=${encodeURIComponent(JSON.stringify(task.howToComplete || []))}`

  const handleBizoraClick = () => {
    setIsNavigatingToBizora(true)
    setOpeningBizora(true) // Show Bizora loading overlay
    // Small delay to show loading state, then navigate
    setTimeout(() => {
      router.push(bizoraUrl)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/hypeos')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-title-shimmer">
                  {task.title}
                </h1>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    task.impact === 'high' ? 'bg-red-500/10 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
                    task.impact === 'medium' ? 'bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
                    'bg-green-500/10 dark:bg-green-950/50 text-green-600 dark:text-green-400'
                  }`}>
                    {task.impact}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{task.points} pts
                  </span>
                  {task.estimatedTime && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.estimatedTime}
                    </span>
                  )}
                  {task.category && (
                    <span className="text-xs px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>

              {!task.completed && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded text-sm transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Bizora AI Button - Minimalistic */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2.5 text-center">
              Feeling confused on how to complete this task or want more information?
            </p>
            <button
              onClick={handleBizoraClick}
              disabled={isNavigatingToBizora}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
            >
              {isNavigatingToBizora ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Bizora AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Ask Bizora AI
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
              Get personalized step-by-step guidance tailored to your situation
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          {task.howToComplete && task.howToComplete.length > 0 && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  How to Complete
                </h2>
              </div>
              
              <ol className="space-y-2.5">
                {task.howToComplete.map((step, index) => (
                  <li key={index} className="flex gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Additional Help Section */}
          {(!task.howToComplete || task.howToComplete.length === 0) && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded p-4">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1.5">
                    Need help getting started?
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Click the button above to ask Bizora AI for personalized guidance on how to complete this task. Bizora AI will provide detailed, actionable steps tailored to your situation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

