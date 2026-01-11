"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { RevenueDashboard } from '@/lib/revenue-types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function DashboardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          try {
            const dbData = await supabaseData.loadRevenueData(user.id)
            if (dbData?.dashboards) {
              const found = dbData.dashboards.find((dash: RevenueDashboard) => dash.id === id)
              if (found) {
                setDashboard(found)
                setIsLoading(false)
                return
              }
            }
          } catch (supabaseError) {
            console.warn('Failed to load from Supabase, trying localStorage:', supabaseError)
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('revenueos:data') : null
        if (saved) {
          const data = JSON.parse(saved)
          const found = data.dashboards?.find((dash: RevenueDashboard) => dash.id === id)
          if (found) {
            setDashboard(found)
          }
        }
      } catch (e) {
        console.error('Failed to load dashboard:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [id, user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The dashboard you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/revenue-intelligence?tab=dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Revenue Intelligence
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      <SidebarNav />
      <main className="ml-64 overflow-y-auto">
        {/* Header - Ultra Minimal */}
        <div className="bg-white dark:bg-slate-950">
          <div className="max-w-6xl px-12 py-10">
            <Button
              onClick={() => router.push('/revenue-intelligence?tab=dashboard')}
              variant="ghost"
              className="flex items-center gap-2 mb-8 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                {dashboard.name}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Created on {new Date(dashboard.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Ultra Minimal, Left Aligned, Wider */}
        <div className="max-w-6xl px-12 pb-16">
          <div className="space-y-16">
            {/* Key Metrics */}
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Key Metrics</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {formatCurrency(dashboard.mrr)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Annual Recurring Revenue</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {formatCurrency(dashboard.arr)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Churn Rate</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboard.churnRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                    Runway
                    {dashboard.runway < 6 && <span className="text-red-500 dark:text-red-400">!</span>}
                  </p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboard.runway.toFixed(1)} months
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Forecast */}
            {dashboard.forecast.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">Revenue Forecast</h2>
                <div className="space-y-6">
                  {dashboard.forecast.map((forecast, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-gray-900 dark:text-white">{forecast.month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-medium text-gray-900 dark:text-white">
                            {formatCurrency(forecast.projectedRevenue)}
                          </span>
                          <Badge variant="outline" className="text-xs font-medium border-gray-200/60 dark:border-gray-800/60">
                            {forecast.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

