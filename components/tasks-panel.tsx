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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">This Week's Tasks</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="p-2 rounded-full bg-[#39d2c0] text-white hover:bg-[#2bb3a3] transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddTask && (
        <Card className="p-4 mb-6 bg-gray-50 dark:bg-gray-800 border border-[#39d2c0]/30 dark:border-gray-600">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#39d2c0]"
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#39d2c0]"
            />
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="px-4 py-2 bg-[#39d2c0] text-white rounded-md hover:bg-[#2bb3a3] transition-colors duration-200"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {tasks.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4">
              <Circle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">No tasks yet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-5 py-1.5 bg-[#39d2c0] text-white rounded-md hover:bg-[#2bb3a3] transition-colors duration-200 font-medium text-sm"
            >
              Add Task
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium text-card-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                      task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={`text-sm text-muted-foreground mt-1 ${
                        task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* How to Complete Section */}
              {task.howToComplete && task.howToComplete.length > 0 && !task.completed && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
                    <div className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
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
