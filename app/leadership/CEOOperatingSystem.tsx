"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, Trash2, Edit2, Check, XCircle } from "lucide-react"
import { CEORoutine } from '@/lib/leadership-types'

interface CEOOperatingSystemProps {
  routines: CEORoutine[]
  onAddRoutine: (routine: CEORoutine) => void
  onDeleteRoutine?: (id: string) => void
}

const ROUTINE_TEMPLATES = {
  daily: {
    name: 'Daily CEO Routine',
    timeBlocks: [
      { time: '6:00 AM', activity: 'Morning routine & reflection', priority: 'high' as const, energy: 'high' as const },
      { time: '7:00 AM', activity: 'Strategic thinking & planning', priority: 'high' as const, energy: 'high' as const },
      { time: '9:00 AM', activity: 'Team meetings & check-ins', priority: 'medium' as const, energy: 'high' as const },
      { time: '12:00 PM', activity: 'Lunch & networking', priority: 'medium' as const, energy: 'medium' as const },
      { time: '2:00 PM', activity: 'Deep work & execution', priority: 'high' as const, energy: 'medium' as const },
      { time: '4:00 PM', activity: 'Review & planning for tomorrow', priority: 'medium' as const, energy: 'low' as const },
      { time: '6:00 PM', activity: 'Personal time & family', priority: 'low' as const, energy: 'low' as const }
    ],
    priorities: ['Strategic priorities', 'Team alignment', 'Customer focus'],
    frameworks: ['Eisenhower Matrix', 'Time blocking', 'Energy management'],
    energyManagement: ['Schedule high-energy tasks in morning', 'Protect deep work time', 'Take breaks between meetings']
  },
  weekly: {
    name: 'Weekly CEO Routine',
    timeBlocks: [
      { time: 'Monday AM', activity: 'Week planning & goal setting', priority: 'high' as const, energy: 'high' as const },
      { time: 'Monday PM', activity: 'Team all-hands meeting', priority: 'high' as const, energy: 'high' as const },
      { time: 'Tuesday-Thursday', activity: 'Execution & operations', priority: 'high' as const, energy: 'medium' as const },
      { time: 'Friday AM', activity: 'Week review & reflection', priority: 'medium' as const, energy: 'medium' as const },
      { time: 'Friday PM', activity: 'Strategic planning for next week', priority: 'high' as const, energy: 'medium' as const }
    ],
    priorities: ['Weekly goals', 'Team performance', 'Strategic initiatives'],
    frameworks: ['OKRs', 'Weekly reviews', 'Strategic planning'],
    energyManagement: ['Monday momentum', 'Friday reflection', 'Mid-week balance']
  },
  monthly: {
    name: 'Monthly CEO Routine',
    timeBlocks: [
      { time: 'Week 1', activity: 'Monthly planning & goal setting', priority: 'high' as const, energy: 'high' as const },
      { time: 'Week 2-3', activity: 'Execution & monitoring', priority: 'high' as const, energy: 'medium' as const },
      { time: 'Week 4', activity: 'Monthly review & strategic planning', priority: 'high' as const, energy: 'high' as const }
    ],
    priorities: ['Monthly objectives', 'Team development', 'Strategic direction'],
    frameworks: ['Monthly OKRs', 'Team reviews', 'Strategic planning'],
    energyManagement: ['Start strong', 'Maintain momentum', 'End with clarity']
  }
}

export default function CEOOperatingSystem({ routines, onAddRoutine, onDeleteRoutine }: CEOOperatingSystemProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<CEORoutine | null>(null)
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null)
  const [editTime, setEditTime] = useState('')
  const [editActivity, setEditActivity] = useState('')
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/leadership/routine/')) {
        setNavigatingId(null)
      } else {
        // Fallback: clear after 10 seconds if navigation seems stuck
        const timeout = setTimeout(() => {
          setNavigatingId(null)
        }, 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [pathname, navigatingId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/leadership/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType })
      })

      if (!response.ok) {
        throw new Error('Failed to generate routine')
      }

      const template = await response.json()
      const routine: CEORoutine = {
        id: Date.now().toString(),
        type: selectedType,
        name: template.name || ROUTINE_TEMPLATES[selectedType].name,
        template: template.template || ROUTINE_TEMPLATES[selectedType],
        custom: false,
        date: new Date().toISOString()
      }

      onAddRoutine(routine)
      setSelectedRoutine(routine)
    } catch (error) {
      console.error('Failed to generate routine:', error)
      // Fallback to template
      const routine: CEORoutine = {
        id: Date.now().toString(),
        type: selectedType,
        name: ROUTINE_TEMPLATES[selectedType].name,
        template: ROUTINE_TEMPLATES[selectedType],
        custom: false,
        date: new Date().toISOString()
      }
      onAddRoutine(routine)
      setSelectedRoutine(routine)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditBlock = (index: number) => {
    if (!selectedRoutine) return
    const block = selectedRoutine.template.timeBlocks[index]
    setEditingBlockIndex(index)
    setEditTime(block.time)
    setEditActivity(block.activity)
  }

  const handleSaveBlock = () => {
    if (!selectedRoutine || editingBlockIndex === null) return
    
    const updatedRoutine: CEORoutine = {
      ...selectedRoutine,
      template: {
        ...selectedRoutine.template,
        timeBlocks: selectedRoutine.template.timeBlocks.map((block, index) =>
          index === editingBlockIndex
            ? { ...block, time: editTime.trim(), activity: editActivity.trim() }
            : block
        )
      },
      custom: true
    }
    
    setSelectedRoutine(updatedRoutine)
    onAddRoutine(updatedRoutine)
    setEditingBlockIndex(null)
    setEditTime('')
    setEditActivity('')
  }

  const handleCancelEdit = () => {
    setEditingBlockIndex(null)
    setEditTime('')
    setEditActivity('')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            CEO Operating System
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get daily, weekly, and monthly routines, time blocking templates, and priority frameworks
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Routine Type</label>
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="bg-white dark:bg-slate-950">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Routine</SelectItem>
                <SelectItem value="weekly">Weekly Routine</SelectItem>
                <SelectItem value="monthly">Monthly Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Routine...
              </>
            ) : (
              <>
                Generate {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Routine
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedRoutine && (
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">{selectedRoutine.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRoutine(null)}
                className="border-gray-200/60 dark:border-gray-800/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {selectedRoutine.type.charAt(0).toUpperCase() + selectedRoutine.type.slice(1)} CEO Operating System
            </p>
          </div>
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-medium mb-8 text-gray-900 dark:text-white">Time Blocks</h3>
              <div className="space-y-4">
                {selectedRoutine.template.timeBlocks.map((block, index) => (
                  <div key={index} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                    {editingBlockIndex === index ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                          <Input
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            placeholder="e.g., 9:00 AM - 10:00 AM or Monday AM"
                            className="border-gray-200 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity</label>
                          <Textarea
                            value={editActivity}
                            onChange={(e) => setEditActivity(e.target.value)}
                            placeholder="Describe the activity..."
                            rows={3}
                            className="border-gray-200 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-700"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSaveBlock}
                            size="sm"
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{block.time}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                              block.priority === 'high' ? 'bg-transparent text-red-600 dark:text-red-400' :
                              block.priority === 'medium' ? 'bg-transparent text-yellow-600 dark:text-yellow-400' :
                              'bg-transparent text-gray-600 dark:text-gray-400'
                            }`}>
                              {block.priority} priority
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded border border-gray-200/60 dark:border-gray-800/60 ${
                              block.energy === 'high' ? 'bg-transparent text-green-600 dark:text-green-400' :
                              block.energy === 'medium' ? 'bg-transparent text-blue-600 dark:text-blue-400' :
                              'bg-transparent text-gray-600 dark:text-gray-400'
                            }`}>
                              {block.energy} energy
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{block.activity}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBlock(index)}
                          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit time block"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Key Priorities</h3>
                <ul className="space-y-3">
                  {selectedRoutine.template.priorities.map((priority, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Frameworks</h3>
                <ul className="space-y-3">
                  {selectedRoutine.template.frameworks.map((framework, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{framework}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-6 text-gray-900 dark:text-white">Energy Management</h3>
              <ul className="space-y-3">
                {selectedRoutine.template.energyManagement.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                    <span className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {routines.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Saved Routines ({routines.length})</h3>
          <div className="grid gap-6">
            {routines.slice().reverse().map((routine) => (
              <div
                key={routine.id}
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => setSelectedRoutine(routine)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2">{routine.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {routine.type.charAt(0).toUpperCase() + routine.type.slice(1)} • {new Date(routine.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border-gray-200/60 dark:border-gray-800/60 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNavigatingId(routine.id)
                        router.push(`/leadership/routine/${routine.id}`)
                      }}
                      disabled={navigatingId === routine.id}
                    >
                      {navigatingId === routine.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                    {onDeleteRoutine && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this routine?')) {
                            onDeleteRoutine(routine.id)
                            if (selectedRoutine?.id === routine.id) {
                              setSelectedRoutine(null)
                            }
                          }
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

