"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Plus, X } from "lucide-react"
import { CEORoutine } from '@/lib/leadership-types'

interface CEOOperatingSystemProps {
  routines: CEORoutine[]
  onAddRoutine: (routine: CEORoutine) => void
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

export default function CEOOperatingSystem({ routines, onAddRoutine }: CEOOperatingSystemProps) {
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<CEORoutine | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#39d2c0]" />
            CEO Operating System
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get daily, weekly, and monthly routines, time blocking templates, and priority frameworks
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Routine Type</label>
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger>
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
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Routine...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Generate {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Routine
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedRoutine && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <CardTitle>{selectedRoutine.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRoutine(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedRoutine.type.charAt(0).toUpperCase() + selectedRoutine.type.slice(1)} CEO Operating System
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Time Blocks</h3>
              <div className="space-y-3">
                {selectedRoutine.template.timeBlocks.map((block, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{block.time}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              block.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
                              block.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {block.priority} priority
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              block.energy === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                              block.energy === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {block.energy} energy
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{block.activity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Priorities</h3>
                <ul className="space-y-2">
                  {selectedRoutine.template.priorities.map((priority, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#39d2c0] mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Frameworks</h3>
                <ul className="space-y-2">
                  {selectedRoutine.template.frameworks.map((framework, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{framework}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Energy Management</h3>
              <ul className="space-y-2">
                {selectedRoutine.template.energyManagement.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {routines.length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Routines</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routines.length} routine{routines.length !== 1 ? 's' : ''} created</p>
          </div>
          <div>
            <div className="space-y-3">
              {routines.slice().reverse().map((routine) => (
                <Card
                  key={routine.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => setSelectedRoutine(routine)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{routine.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {routine.type.charAt(0).toUpperCase() + routine.type.slice(1)} • {new Date(routine.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

