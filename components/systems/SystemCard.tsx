"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {system.name}
              {getStatusIcon(system.status)}
            </CardTitle>
            <Badge className={cn("mt-2", getStatusColor(system.status))}>
              {system.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Type:</span>
            <span className="font-medium text-gray-900 dark:text-white">{system.type}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Workflows:</span>
            <span className="font-medium text-gray-900 dark:text-white">{system.workflows.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tools:</span>
            <span className="font-medium text-gray-900 dark:text-white">{system.tools.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Last Analyzed:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(system.lastAnalyzed)}
            </span>
          </div>
        </div>

        {system.metrics.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Metrics:
            </h4>
            <div className="space-y-1">
              {system.metrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{metric.name}:</span>
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
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Health
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

