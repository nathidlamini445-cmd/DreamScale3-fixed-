"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Briefcase, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { SmartTaskAssignment, TeamMember, Task } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { AnalysisItemCard } from './AnalysisItemCard'
import { Card, CardContent } from "@/components/ui/card"

interface SmartTaskAssignmentProps {
  assignments: SmartTaskAssignment[]
  members: TeamMember[]
  onAddAssignment: (assignment: SmartTaskAssignment) => void
  onUpdateMembers: (members: TeamMember[]) => void
  onDeleteAssignment?: (id: string) => void
}

export default function SmartTaskAssignment({ assignments, members, onAddAssignment, onUpdateMembers, onDeleteAssignment }: SmartTaskAssignmentProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [tasks, setTasks] = useState<Omit<Task, 'id' | 'date' | 'aiAssignment'>[]>([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedHours: 0,
    tags: ''
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title')
      return
    }

    setTasks([...tasks, {
      ...newTask,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'pending' as const,
      project: projectName
    }])
    setNewTask({ title: '', description: '', priority: 'medium', estimatedHours: 0, tags: '' })
  }

  const handleAssignTasks = async () => {
    if (!projectName.trim() || tasks.length === 0) {
      alert('Please enter a project name and add at least one task')
      return
    }

    if (members.length === 0) {
      alert('Please add team members first in the DNA Analysis tab')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch('/api/teams/assign-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName, 
          tasks: tasks.map(t => ({ ...t, id: Date.now().toString() + Math.random() })),
          members 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign tasks')
      }

      const assignment = await response.json()
      
      const smartAssignment: SmartTaskAssignment = {
        id: Date.now().toString(),
        projectName,
        tasks: assignment.tasks || [],
        teamMembers: members,
        assignmentStrategy: assignment.strategy || '',
        workloadAnalysis: assignment.workloadAnalysis,
        teamDynamics: assignment.teamDynamics,
        risks: assignment.risks,
        optimizationSuggestions: assignment.optimizationSuggestions,
        date: new Date().toISOString()
      }

      onAddAssignment(smartAssignment)
      setProjectName('')
      setTasks([])
    } catch (error) {
      console.error('Failed to assign tasks:', error)
      alert('Failed to assign tasks. Please try again.')
    } finally {
      setIsAssigning(false)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Project & Tasks */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Smart Task Assignment
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Let AI assign tasks based on strengths, workload, and growth opportunities
            </p>
          </div>
          <div>
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Q4 Product Launch"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isAssigning}
              />
            </div>

            {/* Add Tasks */}
            <div className="space-y-2">
              <Label>Tasks</Label>
              {tasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base font-medium text-gray-900 dark:text-white">{task.title}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                              task.priority === 'urgent' ? 'bg-transparent text-red-600 dark:text-red-400' :
                              task.priority === 'high' ? 'bg-transparent text-orange-600 dark:text-orange-400' :
                              task.priority === 'medium' ? 'bg-transparent text-yellow-600 dark:text-yellow-400' :
                              'bg-transparent text-green-600 dark:text-green-400'
                            }`}>{task.priority}</span>
                          </div>
                          {task.description && (
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{task.description}</p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                          disabled={isAssigning}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="Design new landing page"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      disabled={isAssigning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Create a modern, responsive landing page with hero section..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      disabled={isAssigning}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger id="task-priority" disabled={isAssigning}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-hours">Estimated Hours</Label>
                      <Input
                        id="task-hours"
                        type="number"
                        min="0"
                        placeholder="8"
                        value={newTask.estimatedHours}
                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) || 0 })}
                        disabled={isAssigning}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-tags">Tags (comma-separated)</Label>
                      <Input
                        id="task-tags"
                        placeholder="design, frontend, urgent"
                        value={newTask.tags}
                        onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                        disabled={isAssigning}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTask} disabled={!newTask.title.trim() || isAssigning} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAssignTasks}
              disabled={!projectName.trim() || tasks.length === 0 || members.length === 0 || isAssigning}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning Tasks with AI...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Assign Tasks Intelligently
                </>
              )}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Results */}
      {assignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Assignments ({assignments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AnalysisItemCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.projectName}
                subtitle={`${assignment.tasks.length} task${assignment.tasks.length !== 1 ? 's' : ''}`}
                date={assignment.date}
                icon={<Briefcase className="w-5 h-5 text-blue-600" />}
                badges={[
                  { label: `${assignment.tasks.length} tasks`, variant: 'secondary' }
                ]}
                onDelete={(id) => {
                  if (onDeleteAssignment) {
                    onDeleteAssignment(id)
                  }
                }}
                type="task"
              >
                <div className="space-y-5">
                  {assignment.assignmentStrategy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assignment Strategy</h4>
                      <AIResponse content={assignment.assignmentStrategy} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Assigned Tasks</h4>
                    <div className="space-y-3">
                      {assignment.tasks.map((task) => (
                        <Card key={task.id} className="border border-gray-200 dark:border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h5>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  task.priority === 'urgent' ? 'border-red-500 text-red-600 dark:text-red-400' :
                                  task.priority === 'high' ? 'border-orange-500 text-orange-600 dark:text-orange-400' :
                                  task.priority === 'medium' ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                                  'border-green-500 text-green-600 dark:text-green-400'
                                }`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                            )}
                            {task.assignedTo && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Assigned to: <span className="text-gray-900 dark:text-white">
                                  {assignment.teamMembers.find(m => m.id === task.assignedTo)?.name || task.assignedTo}
                                </span>
                              </p>
                            )}
                            {task.aiAssignment && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">AI Reasoning</p>
                                <AIResponse content={task.aiAssignment.reasoning} />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

