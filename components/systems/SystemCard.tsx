"use client"

import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Eye, Settings, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BusinessSystem } from "./SystemBuilder"

interface SystemCardProps {
  system: BusinessSystem
  onAnalyzeHealth?: () => void
  onDelete?: () => void
}

export default function SystemCard({ system, onAnalyzeHealth, onDelete }: SystemCardProps) {
  const router = useRouter()
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'needs-attention':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'broken':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800'
      case 'broken':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
      default:
        return ''
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              {system.name}
            </h3>
            {getStatusIcon(system.status)}
          </div>
          <Badge variant="outline" className={cn("text-xs", getStatusColor(system.status))}>
            {system.status.replace('-', ' ')}
          </Badge>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        {system.templateName && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Template:</span>
            <Badge variant="outline" className="text-xs">
              {system.templateName}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Type:</span>
          <span className="font-medium text-gray-900 dark:text-white">{system.type}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Workflows:</span>
          <span className="font-medium text-gray-900 dark:text-white">{system.workflows.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tools:</span>
          <span className="font-medium text-gray-900 dark:text-white">{system.tools.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last Analyzed:</span>
          <span className="font-medium text-gray-900 dark:text-white text-xs">
            {formatDate(system.lastAnalyzed)}
          </span>
        </div>
      </div>

      {system.metrics.length > 0 && (
        <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60 mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Key Metrics:
          </h4>
          <div className="space-y-1">
            {system.metrics.slice(0, 3).map((metric, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{metric.name}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metric.currentValue} {metric.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onAnalyzeHealth && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyzeHealth}
            className="flex-1 border-gray-200/60 dark:border-gray-800/60"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Analyze Health
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-200/60 dark:border-gray-800/60"
          onClick={() => router.push(`/revenue/${system.id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

