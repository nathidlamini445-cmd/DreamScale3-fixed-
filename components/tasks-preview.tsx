'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Target } from 'lucide-react'
import Link from 'next/link'
import { useSessionSafe } from '@/lib/session-context'
import { generateTasksFromOnboardingAI, type Task } from '@/lib/tasks/generate-tasks-from-onboarding'
import { loadOnboardingData } from '@/lib/onboarding-storage'

export function TasksPreview() {
  const sessionContext = useSessionSafe()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Load tasks from session or generate from onboarding
    const loadTasks = async () => {
      // First check if tasks exist in session
      if (sessionContext?.sessionData?.tasksData) {
        const allTasks = [
          ...sessionContext.sessionData.tasksData.daily,
          ...sessionContext.sessionData.tasksData.weekly,
          ...sessionContext.sessionData.tasksData.monthly,
          ...sessionContext.sessionData.tasksData.yearly
        ]
        setTasks(allTasks.slice(0, 2))
        return
      }

      // Check localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('dreamscale_tasks')
          if (stored) {
            const parsed = JSON.parse(stored)
            const allTasks = [
              ...parsed.daily,
              ...parsed.weekly,
              ...parsed.monthly,
              ...parsed.yearly
            ]
            setTasks(allTasks.slice(0, 2))
            return
          }
        } catch (e) {
          console.error('Error loading tasks from localStorage:', e)
        }
      }

      // Generate from onboarding data using AI (with fallback to static)
      const onboardingData = loadOnboardingData()
      if (onboardingData) {
        try {
          const generatedTasks = await generateTasksFromOnboardingAI(onboardingData)
          const allTasks = [
            ...generatedTasks.daily,
            ...generatedTasks.weekly,
            ...generatedTasks.monthly,
            ...generatedTasks.yearly
          ]
          setTasks(allTasks.slice(0, 2))
        } catch (error) {
          console.error('Error generating tasks:', error)
        }
      }
    }

    loadTasks()
  }, [sessionContext])

  if (tasks.length === 0) {
    return null // Don't show if no tasks
  }

  return (
    <Card className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-[#39d2c0]" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h3>
          </div>
          <Link 
            href="/tasks"
            onClick={() => {
              // Mark that user has interacted with tasks
              if (typeof window !== 'undefined') {
                localStorage.setItem('dreamscale_has_interacted_with_tasks', 'true')
                window.dispatchEvent(new CustomEvent('dreamscale:task-interaction'))
              }
            }}
          >
            <Button variant="outline" className="border-gray-300 dark:border-gray-700">
              View More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.slice(0, 2).map((task) => (
            <div
              key={task.id}
              onClick={() => {
                // Mark that user has interacted with tasks
                if (typeof window !== 'undefined') {
                  localStorage.setItem('dreamscale_has_interacted_with_tasks', 'true')
                  window.dispatchEvent(new CustomEvent('dreamscale:task-interaction'))
                }
              }}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {task.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {task.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

