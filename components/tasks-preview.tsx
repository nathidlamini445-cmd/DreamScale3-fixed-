'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Target } from 'lucide-react'
import Link from 'next/link'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'
import { generateTasksFromOnboardingAI, type Task } from '@/lib/tasks/generate-tasks-from-onboarding'
import { loadOnboardingData } from '@/lib/onboarding-storage'

export function TasksPreview() {
  const sessionContext = useSessionSafe()
  const { user: authUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Load tasks from Supabase (if authenticated), session context, or localStorage
    const loadTasks = async () => {
      console.log('🔄 TasksPreview: Loading tasks...', { 
        hasAuthUser: !!authUser?.id, 
        userId: authUser?.id 
      })
      
      // CRITICAL: For authenticated users, ALWAYS check Supabase first and aggressively
      if (authUser?.id) {
        try {
          console.log('📡 TasksPreview: Checking Supabase for tasks...', authUser.id)
          const tasksData = await supabaseData.loadTasksData(authUser.id)
          console.log('📦 TasksPreview: Received data from Supabase:', {
            hasData: !!tasksData,
            daily: tasksData?.daily?.length || 0,
            weekly: tasksData?.weekly?.length || 0,
            monthly: tasksData?.monthly?.length || 0,
            yearly: tasksData?.yearly?.length || 0
          })
          
          if (tasksData) {
            const allTasks = [
              ...(tasksData.daily || []),
              ...(tasksData.weekly || []),
              ...(tasksData.monthly || []),
              ...(tasksData.yearly || [])
            ]
            console.log('📋 TasksPreview: Total tasks found:', allTasks.length)
            if (allTasks.length > 0) {
              setTasks(allTasks.slice(0, 2))
              console.log('✅ TasksPreview: Loaded tasks from Supabase:', allTasks.length)
              return
            } else {
              console.log('⚠️ TasksPreview: Supabase returned empty tasks array')
            }
          } else {
            console.log('⚠️ TasksPreview: No tasks data returned from Supabase')
          }
        } catch (error: any) {
          // Suppress 406 errors (table doesn't exist or RLS issue) - these are expected if schema isn't set up
          if (error?.message?.includes('406') || error?.status === 406) {
            console.warn('⚠️ TasksPreview: Tasks table not accessible (406). This is OK if the table hasn\'t been created yet.')
          } else {
            console.error('❌ TasksPreview: Error loading tasks from Supabase:', error)
          }
        }
      }
      
      // Check session context (might have tasks loaded)
      if (sessionContext?.sessionData?.tasksData) {
        const allTasks = [
          ...(sessionContext.sessionData.tasksData.daily || []),
          ...(sessionContext.sessionData.tasksData.weekly || []),
          ...(sessionContext.sessionData.tasksData.monthly || []),
          ...(sessionContext.sessionData.tasksData.yearly || [])
        ]
        if (allTasks.length > 0) {
          setTasks(allTasks.slice(0, 2))
          console.log('✅ Loaded tasks from session context:', allTasks.length)
          return
        }
      }

      // Only check localStorage for unauthenticated users
      if (!authUser?.id && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('dreamscale_tasks')
          if (stored) {
            const parsed = JSON.parse(stored)
            const allTasks = [
              ...(parsed.daily || []),
              ...(parsed.weekly || []),
              ...(parsed.monthly || []),
              ...(parsed.yearly || [])
            ]
            if (allTasks.length > 0) {
              setTasks(allTasks.slice(0, 2))
              console.log('✅ Loaded tasks from localStorage:', allTasks.length)
              return
            }
          }
        } catch (e) {
          console.error('Error loading tasks from localStorage:', e)
        }
      }

      // Generate from onboarding data using AI (with fallback to static) - only for unauthenticated users
      // Authenticated users should have tasks from Supabase
      if (!authUser?.id) {
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
            if (allTasks.length > 0) {
              setTasks(allTasks.slice(0, 2))
              console.log('✅ Generated tasks for TasksPreview:', allTasks.length)
            }
          } catch (error) {
            console.error('Error generating tasks:', error)
          }
        }
      }
    }

    loadTasks()
    
    // For authenticated users, aggressively check Supabase every 3 seconds until tasks are found
    let checkInterval: NodeJS.Timeout | null = null
    if (authUser?.id) {
      checkInterval = setInterval(() => {
        console.log('🔄 TasksPreview: Polling Supabase for tasks...')
        loadTasks()
      }, 3000) // Check every 3 seconds
    }
    
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [sessionContext?.sessionData?.tasksData, authUser?.id])
  
  // Also reload when session context updates (in case tasks were just saved after onboarding)
  useEffect(() => {
    if (sessionContext?.sessionData?.tasksData) {
      const allTasks = [
        ...(sessionContext.sessionData.tasksData.daily || []),
        ...(sessionContext.sessionData.tasksData.weekly || []),
        ...(sessionContext.sessionData.tasksData.monthly || []),
        ...(sessionContext.sessionData.tasksData.yearly || [])
      ]
      if (allTasks.length > 0) {
        setTasks(allTasks.slice(0, 2))
        console.log('✅ TasksPreview: Updated tasks from session context:', allTasks.length)
      }
    }
  }, [sessionContext?.sessionData?.tasksData])

  // CRITICAL: Immediately check Supabase when user becomes authenticated
  useEffect(() => {
    if (authUser?.id) {
      console.log('🔐 TasksPreview: User authenticated, immediately checking Supabase...', authUser.id)
      const loadTasks = async () => {
        try {
          const tasksData = await supabaseData.loadTasksData(authUser.id)
          if (tasksData) {
            const allTasks = [
              ...(tasksData.daily || []),
              ...(tasksData.weekly || []),
              ...(tasksData.monthly || []),
              ...(tasksData.yearly || [])
            ]
            if (allTasks.length > 0) {
              setTasks(allTasks.slice(0, 2))
              console.log('✅ TasksPreview: Found tasks immediately after auth:', allTasks.length)
            }
          }
        } catch (error) {
          console.error('❌ TasksPreview: Error loading tasks after auth:', error)
        }
      }
      loadTasks()
    }
  }, [authUser?.id])

  // Always show the container with two preview tasks
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
          {tasks.length > 0 ? tasks.slice(0, 2).map((task) => (
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
          )) : (
            <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                {authUser?.id 
                  ? "No tasks found. Tasks will appear here once they're created." 
                  : "No tasks yet. Sign in to see your tasks."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

