"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  type
}: AnalysisItemCardProps) {
  const router = useRouter()
  const [isViewing, setIsViewing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleViewDetails = () => {
    if (type === 'cofounder') {
      // Navigate to detail page for cofounder matches
      router.push(`/teams/cofounder/${id}`)
    } else if (type === 'dna') {
      // Navigate to detail page for DNA analyses
      router.push(`/teams/dna/${id}`)
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

  const typeColors = {
    dna: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    task: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    health: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    cofounder: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20',
    ritual: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
  }

  return (
    <>
      <Card 
        className={cn(
          "group hover:shadow-lg transition-all duration-200 cursor-pointer",
          typeColors[type]
        )}
        onClick={handleViewDetails}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="mt-1">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {title}
                </CardTitle>
                {subtitle && (
                  <CardDescription className="mt-1 line-clamp-1">
                    {subtitle}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant || 'secondary'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription>
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
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete()
                setIsViewing(false)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsViewing(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

