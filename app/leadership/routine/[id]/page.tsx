"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Calendar, Clock, Target, CheckCircle2 } from "lucide-react"
import { CEORoutine } from '@/lib/leadership-types'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadershipRoutineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [routine, setRoutine] = useState<CEORoutine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRoutine = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const leadershipData = JSON.parse(saved)
          const routines = leadershipData.routines || []
          const foundRoutine = routines.find((r: CEORoutine) => r.id === params.id)
          if (foundRoutine) {
            setRoutine(foundRoutine)
          }
        }
      } catch (e) {
        console.error('Failed to load routine:', e)
      } finally {
        setLoading(false)
      }
    }

    loadRoutine()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading routine...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Routine not found</p>
              <button 
                onClick={() => router.push('/marketplace')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Leadership
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Leadership
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {routine.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {routine.type.charAt(0).toUpperCase() + routine.type.slice(1)} Routine
                  </span>
                  {routine.custom && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(routine.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Blocks */}
          {routine.template.timeBlocks && routine.template.timeBlocks.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Time Blocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routine.template.timeBlocks.map((block, i) => (
                  <div key={i} className="p-4 border border-gray-200/60 dark:border-slate-800/60 rounded-lg bg-gray-50/50 dark:bg-slate-900/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                          {block.time}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {block.activity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(block.priority)}`}>
                          {block.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getEnergyColor(block.energy)}`}>
                          {block.energy} energy
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Priorities */}
          {routine.template.priorities && routine.template.priorities.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {routine.template.priorities.map((priority, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Frameworks */}
          {routine.template.frameworks && routine.template.frameworks.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {routine.template.frameworks.map((framework, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Energy Management */}
          {routine.template.energyManagement && routine.template.energyManagement.length > 0 && (
            <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Energy Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {routine.template.energyManagement.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

