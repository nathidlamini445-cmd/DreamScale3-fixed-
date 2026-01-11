"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Lightbulb, Calendar } from "lucide-react"
import { AIResponse } from '@/components/ai-response'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SavedAdvice {
  id: string
  problem: string
  advice: string
  date: string
}

export default function LeadershipAdviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [advice, setAdvice] = useState<SavedAdvice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdvice = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:problem-solver') : null
        if (saved) {
          const adviceList: SavedAdvice[] = JSON.parse(saved)
          const foundAdvice = adviceList.find((a: SavedAdvice) => a.id === params.id)
          if (foundAdvice) {
            setAdvice(foundAdvice)
          }
        }
      } catch (e) {
        console.error('Failed to load advice:', e)
      } finally {
        setLoading(false)
      }
    }

    loadAdvice()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading advice...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!advice) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl pl-8 pr-4 sm:pr-6 lg:pr-8 py-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Advice not found</p>
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
                  Leadership Advice
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created on {new Date(advice.date).toLocaleDateString('en-US', { 
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

          {/* Problem */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {advice.problem}
              </p>
            </CardContent>
          </Card>

          {/* Advice */}
          <Card className="border-gray-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <AIResponse content={advice.advice} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

