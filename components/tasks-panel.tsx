"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle, Circle, Plus, Clock, Calendar, ChevronDown } from "lucide-react"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  howToComplete?: string[] // Step-by-step instructions
}

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        completed: false,
        dueDate: 'Today',
        priority: 'medium'
      }
      setTasks([...tasks, task])
      setNewTask({ title: '', description: '' })
      setShowAddTask(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-700'
      case 'medium': return 'from-yellow-500 to-yellow-700'
      case 'low': return 'from-green-500 to-green-700'
      default: return 'from-blue-500 to-blue-700'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="tasks-panel">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">This Week's Tasks</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddTask && (
        <div className="mb-5 p-4 bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 border border-blue-300 dark:border-blue-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-blue-300 dark:border-blue-700 flex items-center justify-center mb-3">
              <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">No tasks yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Add Task
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-950 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium text-gray-900 dark:text-white ${
                      task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                        task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                  </div>
                )}
              </div>

              {/* How to Complete Section */}
              {task.howToComplete && task.howToComplete.length > 0 && !task.completed && (
                <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newExpanded = new Set(expandedTasks);
                      if (newExpanded.has(task.id)) {
                        newExpanded.delete(task.id);
                      } else {
                        newExpanded.add(task.id);
                      }
                      setExpandedTasks(newExpanded);
                    }}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedTasks.has(task.id) ? 'rotate-180' : ''}`} />
                    <span>How to complete this task</span>
                  </button>
                  
                  {expandedTasks.has(task.id) && (
                    <div className="mt-2 pl-4 border-l border-blue-300 dark:border-blue-700">
                      <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {task.howToComplete.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                            <span className="flex-1 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
