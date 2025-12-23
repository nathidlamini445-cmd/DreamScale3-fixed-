"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

interface AnalysisItemCardProps {
  id: string
  title: string
  subtitle?: string
  date: string
  icon?: React.ReactNode
  badges?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[]
  onDelete: (id: string) => void
  children: React.ReactNode // The detailed view content
  type: 'dna' | 'task' | 'health' | 'cofounder' | 'ritual'
  detailRoute?: string // Optional route to navigate to instead of opening dialog
}

export function AnalysisItemCard({ 
  id, 
  title, 
  subtitle, 
  date, 
  icon, 
  badges = [],
  onDelete,
  children,
  type,
  detailRoute
}: AnalysisItemCardProps) {
  const router = useRouter()
  const [isViewing, setIsViewing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleViewDetails = () => {
    if (detailRoute) {
      // Navigate to custom detail route if provided
      router.push(detailRoute)
    } else if (type === 'cofounder') {
      // Navigate to detail page for cofounder matches
      router.push(`/teams/cofounder/${id}`)
    } else if (type === 'dna') {
      // Navigate to detail page for DNA analyses
      router.push(`/teams/dna/${id}`)
    } else if (type === 'task') {
      // Navigate to detail page for task assignments
      router.push(`/teams/task/${id}`)
    } else if (type === 'health') {
      // Navigate to detail page for health monitors
      router.push(`/teams/health/${id}`)
    } else {
      // Open dialog for other types
      setIsViewing(true)
    }
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setIsDeleting(true)
      onDelete(id)
      setTimeout(() => setIsDeleting(false), 300)
    }
  }

  return (
    <>
      <div 
        className={cn(
          "group bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all cursor-pointer"
        )}
        onClick={handleViewDetails}
      >
        <div className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-blue-shimmer line-clamp-2">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-blue-shimmer mt-1 line-clamp-1 opacity-90">
                    {subtitle}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, i) => (
                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <Button
            variant="outline"
            className="w-full border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 border-gray-200/60 dark:border-gray-800/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-gray-900 dark:text-white">
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle} • Created on {new Date(date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4">
            {children}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
            <Button
              variant="outline"
              onClick={() => {
                handleDelete()
                setIsViewing(false)
              }}
              className="border-gray-200 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsViewing(false)} className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

