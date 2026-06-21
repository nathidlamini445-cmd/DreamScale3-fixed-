"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Eye, Settings, Trash2, Loader2, Share, Pencil, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { BusinessSystem, Metric } from "./SystemBuilder"
import { formatSystemForExport } from "@/lib/systems/format-system-for-export"
import { ShareModal } from "@/components/share-modal"

interface SystemCardProps {
  system: BusinessSystem
  onAnalyzeHealth?: () => void
  onSystemUpdate?: (system: BusinessSystem) => void
  onDelete?: () => void
  onViewDetails?: () => void
  viewDetailsHref?: string
  readOnly?: boolean
}

function MetricRow({
  metric,
  editable,
  onSave,
}: {
  metric: Metric
  editable: boolean
  onSave: (value: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(String(metric.currentValue))

  const progress =
    metric.targetValue > 0
      ? Math.min(100, Math.max(0, (metric.currentValue / metric.targetValue) * 100))
      : 0
  const atTarget = metric.targetValue > 0 && metric.currentValue >= metric.targetValue

  const commit = () => {
    setIsEditing(false)
    const parsed = parseFloat(draft)
    if (!Number.isNaN(parsed) && parsed !== metric.currentValue) {
      onSave(parsed)
    } else {
      setDraft(String(metric.currentValue))
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate text-gray-500 dark:text-gray-400">{metric.name}</span>
        {isEditing ? (
          <input
            type="number"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(String(metric.currentValue))
                setIsEditing(false)
              }
            }}
            className="w-20 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-right text-xs text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        ) : (
          <button
            type="button"
            disabled={!editable}
            onClick={() => {
              setDraft(String(metric.currentValue))
              setIsEditing(true)
            }}
            className={cn(
              'group flex shrink-0 items-center gap-1 font-medium text-gray-900 dark:text-white',
              editable && 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400'
            )}
            title={editable ? 'Click to update value' : undefined}
          >
            {metric.currentValue} / {metric.targetValue} {metric.unit}
            {editable && (
              <Pencil className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        )}
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            atTarget ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default function SystemCard({ system, onAnalyzeHealth, onSystemUpdate, onDelete, onViewDetails, viewDetailsHref, readOnly = false }: SystemCardProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [shareModal, setShareModal] = useState<{isOpen: boolean, content: string, title: string}>({
    isOpen: false,
    content: '',
    title: ''
  })

  const handleMetricSave = (index: number, value: number) => {
    if (!onSystemUpdate) return
    const updatedMetrics = system.metrics.map((m, i) =>
      i === index ? { ...m, currentValue: value } : m
    )
    onSystemUpdate({ ...system, metrics: updatedMetrics })
  }

  const metricsAtTarget = system.metrics.filter(
    (m) => m.targetValue > 0 && m.currentValue >= m.targetValue
  ).length

  const handleViewDetails = () => {
    if (viewDetailsHref) {
      setIsNavigating(true)
      router.push(viewDetailsHref)
      setTimeout(() => setIsNavigating(false), 2000)
      return
    }
    if (onViewDetails) {
      onViewDetails()
      return
    }
    console.log('👁️ View Details clicked for system:', {
      id: system.id,
      name: system.name,
      type: system.type
    })
    setIsNavigating(true)
    router.push(`/systems/${system.id}`)
    // Reset loading state after a delay
    setTimeout(() => {
      setIsNavigating(false)
    }, 2000)
  }
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
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Key Metrics
            </h4>
            <Badge variant="outline" className="text-[10px]">
              {metricsAtTarget}/{system.metrics.length} at target
            </Badge>
          </div>
          <div className="space-y-2.5">
            {system.metrics.map((metric, index) => (
              <MetricRow
                key={`${metric.name}-${index}`}
                metric={metric}
                editable={!!onSystemUpdate}
                onSave={(value) => handleMetricSave(index, value)}
              />
            ))}
          </div>
        </div>
      )}

      {system.healthAnalysis &&
        ((system.healthAnalysis.issues?.length ?? 0) > 0 ||
          (system.healthAnalysis.recommendations?.length ?? 0) > 0) && (
        <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60 mb-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              AI Health Insights
              {typeof system.healthAnalysis.score === 'number' && (
                <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({system.healthAnalysis.score}/100)
                </span>
              )}
            </h4>
          </div>
          {(system.healthAnalysis.issues ?? []).slice(0, 2).map((issue, i) => (
            <p key={`issue-${i}`} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
              {issue}
            </p>
          ))}
          {(system.healthAnalysis.recommendations ?? []).slice(0, 3).map((rec, i) => (
            <p key={`rec-${i}`} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
              {rec}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onAnalyzeHealth && !readOnly && (
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
          onClick={handleViewDetails}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </>
          )}
        </Button>
        {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const content = formatSystemForExport(system)
            setShareModal({
              isOpen: true,
              content,
              title: system.name
            })
          }}
          className="border-gray-200/60 dark:border-gray-800/60"
        >
          <Share className="w-4 h-4" />
        </Button>
        )}
        {onDelete && !readOnly && (
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
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
        messageContent={shareModal.content}
        contentType="System"
        contentTitle={shareModal.title}
        system={system}
      />
    </div>
  )
}

