"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No systems created yet. Start by selecting a template or generating a custom system.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          System Health Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor the health of all your operational systems
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalSystems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {healthyCount}
            </div>
            {totalSystems > 0 && (
              <Progress 
                value={(healthyCount / totalSystems) * 100} 
                className="mt-2 h-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {needsAttentionCount}
            </div>
            {totalSystems > 0 && (
              <Progress 
                value={(needsAttentionCount / totalSystems) * 100} 
                className="mt-2 h-2 bg-yellow-100"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Broken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {brokenCount}
            </div>
            {totalSystems > 0 && (
              <Progress 
                value={(brokenCount / totalSystems) * 100} 
                className="mt-2 h-2 bg-red-100"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

