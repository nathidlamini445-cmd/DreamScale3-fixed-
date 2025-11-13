"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Briefcase, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { SmartTaskAssignment, TeamMember, Task } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'

interface SmartTaskAssignmentProps {
  assignments: SmartTaskAssignment[]
  members: TeamMember[]
  onAddAssignment: (assignment: SmartTaskAssignment) => void
  onUpdateMembers: (members: TeamMember[]) => void
}

export default function SmartTaskAssignment({ assignments, members, onAddAssignment, onUpdateMembers }: SmartTaskAssignmentProps) {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2563eb]" />
            Smart Task Assignment
          </CardTitle>
          <CardDescription>
            Let AI assign tasks based on strengths, workload, and growth opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <Card key={index} className="p-3 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                          disabled={isAssigning}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="pt-6 space-y-4">
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
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={handleAssignTasks}
              disabled={!projectName.trim() || tasks.length === 0 || members.length === 0 || isAssigning}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
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
        </CardContent>
      </Card>

      {/* Assignment Results */}
      {assignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Task Assignments ({assignments.length})</h3>
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#2563eb]" />
                  {assignment.projectName}
                </CardTitle>
                <CardDescription>
                  Assigned on {new Date(assignment.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {assignment.assignmentStrategy && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Assignment Strategy</h4>
                      <AIResponse content={assignment.assignmentStrategy} />
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Assigned Tasks</h4>
                  {assignment.tasks.map((task) => (
                    <Card key={task.id} className="bg-gray-50 dark:bg-gray-900">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                                <Badge variant="outline">
                                  {assignment.teamMembers.find(m => m.id === task.assignedTo)?.name || task.assignedTo}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {task.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-500" />}
                            {task.status === 'blocked' && <AlertCircle className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                        {task.aiAssignment && (
                          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-3">
                            <CardContent className="pt-3">
                              <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">AI Assignment Reasoning</h6>
                              <AIResponse content={task.aiAssignment.reasoning} />
                              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Strength Match</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {Math.round(task.aiAssignment.factors.strengthMatch * 100)}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Workload Balance</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {Math.round(task.aiAssignment.factors.workloadBalance * 100)}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Growth Opportunity</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {Math.round(task.aiAssignment.factors.growthOpportunity * 100)}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Past Performance</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {Math.round(task.aiAssignment.factors.pastPerformance * 100)}%
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

