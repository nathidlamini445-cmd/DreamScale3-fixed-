"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { BusinessSystem } from "./SystemBuilder"
import SystemCard from "./SystemCard"

interface SystemHealthDashboardProps {
  systems: BusinessSystem[]
  onSystemUpdate?: (system: BusinessSystem) => void
  onDeleteSystem?: (systemId: string) => void
}

export default function SystemHealthDashboard({ 
  systems, 
  onSystemUpdate,
  onDeleteSystem
}: SystemHealthDashboardProps) {
  const healthyCount = systems.filter(s => s.status === 'healthy').length
  const needsAttentionCount = systems.filter(s => s.status === 'needs-attention').length
  const brokenCount = systems.filter(s => s.status === 'broken').length
  const totalSystems = systems.length

  const handleAnalyzeHealth = async (system: BusinessSystem) => {
    try {
      const response = await fetch('/api/systems/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemId: system.id, system })
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze system health')
      }
      
      const analysis = await response.json()
      if (onSystemUpdate) {
        onSystemUpdate({
          ...system,
          status: analysis.status,
          lastAnalyzed: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to analyze system health:', error)
      alert('Failed to analyze system health. Please try again.')
    }
  }

  if (systems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-12 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No systems created yet. Start by selecting a template or generating a custom system.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          System Health Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor the health of all your operational systems
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Systems
          </p>
          <div className="text-2xl font-medium text-gray-900 dark:text-white">
            {totalSystems}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Healthy
            </p>
          </div>
          <div className="text-2xl font-medium text-green-600 dark:text-green-400">
            {healthyCount}
          </div>
          {totalSystems > 0 && (
            <Progress 
              value={(healthyCount / totalSystems) * 100} 
              className="mt-2 h-1"
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Needs Attention
            </p>
          </div>
          <div className="text-2xl font-medium text-yellow-600 dark:text-yellow-400">
            {needsAttentionCount}
          </div>
          {totalSystems > 0 && (
            <Progress 
              value={(needsAttentionCount / totalSystems) * 100} 
              className="mt-2 h-1"
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Broken
            </p>
          </div>
          <div className="text-2xl font-medium text-red-600 dark:text-red-400">
            {brokenCount}
          </div>
          {totalSystems > 0 && (
            <Progress 
              value={(brokenCount / totalSystems) * 100} 
              className="mt-2 h-1"
            />
          )}
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            onAnalyzeHealth={() => handleAnalyzeHealth(system)}
            onDelete={onDeleteSystem ? () => onDeleteSystem(system.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

