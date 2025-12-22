"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Sparkles, CheckCircle, Target, Loader2 } from "lucide-react"
import { useSessionSafe } from '@/lib/session-context'

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
              <Button onClick={() => router.push('/hypeos')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to HypeOS
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getDifficultyColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-amber-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const bizoraUrl = `/bizora?task=${encodeURIComponent(task.title)}&instructions=${encodeURIComponent(JSON.stringify(task.howToComplete || []))}`

  const handleBizoraClick = () => {
    setIsNavigatingToBizora(true)
    // Small delay to show loading state, then navigate
    setTimeout(() => {
      router.push(bizoraUrl)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.push('/hypeos')}
              variant="ghost"
              size="sm"
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                  {task.title}
                </h1>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${getDifficultyColor(task.impact)}`}>
                    {task.impact}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    +{task.points} pts
                  </span>
                  {task.estimatedTime && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.estimatedTime}
                    </span>
                  )}
                  {task.category && (
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>

              {!task.completed && (
                <Button
                  onClick={handleComplete}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          {/* Bizora AI Button - Minimalistic */}
          <div className="mb-8">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 text-center font-medium">
              Feeling confused on how to complete this task or want more information?
            </p>
            <Button
              onClick={handleBizoraClick}
              disabled={isNavigatingToBizora}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
              size="lg"
            >
              {isNavigatingToBizora ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening Bizora AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ask Bizora AI
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Get personalized step-by-step guidance tailored to your situation
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          {task.howToComplete && task.howToComplete.length > 0 && (
            <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#39d2c0]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  How to Complete
                </h2>
              </div>
              
              <ol className="space-y-4">
                {task.howToComplete.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#39d2c0] text-white text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Need help getting started?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
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

