'use client'

import { useState, useEffect, useRef } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Target, GripVertical, RefreshCw, ArrowLeft, X } from 'lucide-react'
import { useSessionSafe } from '@/lib/session-context'
import { generateTasksFromOnboardingAI, generateTasksFromOnboarding, type Task } from '@/lib/tasks/generate-tasks-from-onboarding'
import { loadOnboardingData } from '@/lib/onboarding-storage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TasksPage() {
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const [tasks, setTasks] = useState<{
    daily: Task[]
    weekly: Task[]
    monthly: Task[]
    yearly: Task[]
  }>({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  })
  const [showScrollHint, setShowScrollHint] = useState(false)

  useEffect(() => {
    // Mark that user has interacted with tasks when they visit the tasks page
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamscale_has_interacted_with_tasks', 'true')
      window.dispatchEvent(new CustomEvent('dreamscale:task-interaction'))
      
      // Check if this is first time visiting tasks page
      const hasVisitedTasks = localStorage.getItem('dreamscale_has_visited_tasks')
      if (!hasVisitedTasks) {
        setShowScrollHint(true)
        // Mark as visited after a short delay to allow user to see the hint
        setTimeout(() => {
          localStorage.setItem('dreamscale_has_visited_tasks', 'true')
        }, 100)
      }
    }
  }, [])

  useEffect(() => {
    // Only run once on mount
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    // Load tasks from session or generate from onboarding
    const loadTasks = async () => {
      // First check if tasks exist in session
      if (sessionContext?.sessionData?.tasksData) {
        const sessionTasks = sessionContext.sessionData.tasksData
        // Check if tasks are actually populated
        const hasTasks = sessionTasks.daily.length > 0 || sessionTasks.weekly.length > 0 || 
                        sessionTasks.monthly.length > 0 || sessionTasks.yearly.length > 0
        if (hasTasks) {
          setTasks(sessionTasks)
          return
        }
      }

      // Check localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('dreamscale_tasks')
          if (stored) {
            const parsed = JSON.parse(stored)
            // Check if tasks are actually populated
            const hasTasks = parsed.daily?.length > 0 || parsed.weekly?.length > 0 || 
                            parsed.monthly?.length > 0 || parsed.yearly?.length > 0
            if (hasTasks) {
              setTasks(parsed)
              return
            }
          }
        } catch (e) {
          console.error('Error loading tasks from localStorage:', e)
        }
      }

      // If no tasks exist, generate from onboarding data automatically on first visit
      setIsGenerating(true)
      const onboardingData = loadOnboardingData()
      if (onboardingData) {
        try {
          // Try AI-powered generation first
          const generatedTasks = await generateTasksFromOnboardingAI(onboardingData)
          setTasks(generatedTasks)
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('dreamscale_tasks', JSON.stringify(generatedTasks))
          }
          
          // Save to session if available
          if (sessionContext?.updateTasksData) {
            sessionContext.updateTasksData(generatedTasks)
          }
        } catch (error) {
          console.error('Error generating tasks:', error)
          // Fallback already handled in generateTasksFromOnboardingAI
        }
      }
      setIsGenerating(false)
    }

    loadTasks()
  }, [sessionContext])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents scroll interference)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent, type: keyof typeof tasks) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTasks(prev => {
        const oldIndex = prev[type].findIndex(task => task.id === active.id)
        const newIndex = prev[type].findIndex(task => task.id === over.id)
        
        const updated = {
          ...prev,
          [type]: arrayMove(prev[type], oldIndex, newIndex)
        }
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('dreamscale_tasks', JSON.stringify(updated))
        }
        
        // Save to session if available
        if (sessionContext?.updateTasksData) {
          sessionContext.updateTasksData(updated)
        }
        
        return updated
      })
    }
  }

  const toggleTask = (taskId: string, type: keyof typeof tasks) => {
    // Hide scroll hint when user interacts with tasks
    if (showScrollHint) {
      setShowScrollHint(false)
    }
    
    setTasks(prev => {
      const updated = {
        ...prev,
        [type]: prev[type].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dreamscale_tasks', JSON.stringify(updated))
      }
      
      // Save to session if available
      if (sessionContext?.updateTasksData) {
        sessionContext.updateTasksData(updated)
      }
      
      return updated
    })
  }

  // Sortable Task Item Component
  const SortableTaskItem = ({ task, type }: { task: Task, type: keyof typeof tasks }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-slate-950"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        {/* Checkbox */}
        <div
          onClick={() => toggleTask(task.id, type)}
          className="cursor-pointer flex-shrink-0 mt-0.5"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0" onClick={() => toggleTask(task.id, type)}>
          <h4 className={`font-medium text-sm cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {task.description}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant={task.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">{task.category}</Badge>
          </div>
        </div>
      </div>
    )
  }

  const [isGenerating, setIsGenerating] = useState(false)
  const hasLoadedRef = useRef(false)

  const generateTasks = async () => {
    setIsGenerating(true)
    // Clear existing tasks
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dreamscale_tasks')
    }
    if (sessionContext?.updateTasksData) {
      sessionContext.updateTasksData({ daily: [], weekly: [], monthly: [], yearly: [] })
    }
    
    // Generate new tasks
    const onboardingData = loadOnboardingData()
    if (onboardingData) {
      try {
        const generatedTasks = await generateTasksFromOnboardingAI(onboardingData)
        setTasks(generatedTasks)
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('dreamscale_tasks', JSON.stringify(generatedTasks))
        }
        
        if (sessionContext?.updateTasksData) {
          sessionContext.updateTasksData(generatedTasks)
        }
      } catch (error) {
        console.error('Error generating tasks:', error)
      }
    }
    setIsGenerating(false)
  }

  const TaskGrid = ({ tasks, title, type }: { tasks: Task[], title: string, type: keyof typeof tasks }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)


    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="outline">{tasks.length} tasks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
          ) : (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={() => {
                  isDraggingRef.current = true
                }}
                onDragEnd={(event) => {
                  isDraggingRef.current = false
                  handleDragEnd(event, type)
                }}
                onDragCancel={() => {
                  isDraggingRef.current = false
                }}
              >
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto h-[600px]"
                  onWheel={(e) => {
                    // Hide scroll hint when user scrolls
                    if (showScrollHint) {
                      setShowScrollHint(false)
                    }
                    // Prevent scroll interference during drag
                    if (!isDraggingRef.current) {
                      return
                    }
                  }}
                  onClick={() => {
                    // Hide scroll hint when user clicks in task area
                    if (showScrollHint) {
                      setShowScrollHint(false)
                    }
                  }}
                >
                  <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 pr-2">
                      {tasks.map(task => (
                        <SortableTaskItem key={task.id} task={task} type={type} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              </DndContext>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SidebarNav />
      <main className="pl-64">
        <div className="p-8">
          {/* Header with Venture Quest button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">Your Tasks</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your daily, weekly, monthly, and yearly tasks. Drag tasks to reorder them.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={generateTasks} 
                disabled={isGenerating}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate tasks'}
              </Button>
              <Link href="/venture-quest">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800">
                  <Target className="w-4 h-4 mr-2" />
                  Venture Quest
                </Button>
              </Link>
            </div>
          </div>

          {/* Scroll Hint - Only shows on first visit */}
          {showScrollHint && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 text-lg">↓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                    Scroll down to see your tasks
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Your tasks are organized by Daily, Weekly, Monthly, and Yearly
                  </p>
                </div>
                <Button
                  onClick={() => setShowScrollHint(false)}
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Four Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskGrid tasks={tasks.daily} title="Daily Tasks" type="daily" />
            <TaskGrid tasks={tasks.weekly} title="Weekly Tasks" type="weekly" />
            <TaskGrid tasks={tasks.monthly} title="Monthly Tasks" type="monthly" />
            <TaskGrid tasks={tasks.yearly} title="Yearly Tasks" type="yearly" />
          </div>
        </div>
      </main>
    </div>
  )
}

