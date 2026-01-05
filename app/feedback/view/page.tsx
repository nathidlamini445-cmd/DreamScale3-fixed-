"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MessageSquare, Mail, Calendar, Tag, Trash2 } from "lucide-react"
import Link from "next/link"

interface FeedbackItem {
  feedback: string
  email: string
  issues: string[]
  timestamp: string
  userAgent?: string
  url?: string
}

export default function FeedbackViewPage() {
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = () => {
    try {
      const saved = typeof window !== 'undefined' 
        ? localStorage.getItem('dreamscale_feedback') 
        : null
      
      if (saved) {
        const feedback = JSON.parse(saved)
        // Sort by timestamp, newest first
        const sorted = feedback.sort((a: FeedbackItem, b: FeedbackItem) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setAllFeedback(sorted)
      }
    } catch (error) {
      console.error('Failed to load feedback:', error)
    }
  }

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      const updated = allFeedback.filter((_, i) => i !== index)
      if (typeof window !== 'undefined') {
        localStorage.setItem('dreamscale_feedback', JSON.stringify(updated))
      }
      setAllFeedback(updated)
      setSelectedFeedback(null)
    }
  }

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/feedback">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feedback Form
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#39d2c0]/10 dark:bg-[#39d2c0]/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#39d2c0]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                View Feedback
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All submitted feedback ({allFeedback.length})
              </p>
            </div>
          </div>
        </div>

        {allFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No feedback submitted yet.
              </p>
              <Link href="/feedback">
                <Button className="mt-4 bg-[#39d2c0] hover:bg-[#2bb3a3] text-white">
                  Submit Feedback
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feedback List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Feedback
              </h2>
              {allFeedback.map((item, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedFeedback === item
                      ? 'ring-2 ring-[#39d2c0] border-[#39d2c0]'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedFeedback(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.email}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {item.feedback}
                        </p>
                        {item.issues && item.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.issues.slice(0, 2).map((issue, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                            {item.issues.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.issues.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Feedback Detail */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Details
              </h2>
              {selectedFeedback ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <Mail className="w-5 h-5 text-[#39d2c0]" />
                          {selectedFeedback.email}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedFeedback.timestamp)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          const index = allFeedback.findIndex(f => f === selectedFeedback)
                          if (index !== -1) handleDelete(index)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFeedback.issues && selectedFeedback.issues.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Issues Reported
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedFeedback.issues.map((issue, i) => (
                            <Badge key={i} variant="secondary">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback
                      </Label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {selectedFeedback.feedback}
                      </p>
                    </div>
                    {selectedFeedback.url && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Page URL
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                          {selectedFeedback.url}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a feedback item to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

