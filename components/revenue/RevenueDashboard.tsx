"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { RevenueDashboard } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

interface RevenueDashboardProps {
  dashboards: RevenueDashboard[]
  onAddDashboard: (dashboard: RevenueDashboard) => void
}

export default function RevenueDashboard({ dashboards, onAddDashboard }: RevenueDashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  // Clear loading state when route changes (navigation completed) or after timeout
  useEffect(() => {
    if (navigatingId) {
      // Clear when we navigate to the detail page
      if (pathname && pathname.startsWith('/revenue-intelligence/dashboard/')) {
        setNavigatingId(null)
      } else {
        // Fallback: clear after 10 seconds if navigation seems stuck
        const timeout = setTimeout(() => {
          setNavigatingId(null)
        }, 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [pathname, navigatingId])
  const [formData, setFormData] = useState({
    name: '',
    mrr: 0,
    churnRate: 0,
    monthlyBurn: 0
  })

  const handleCreateDashboard = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a dashboard name')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/revenue/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create dashboard')
      }

      const dashboardData = await response.json()
      
      const dashboard: RevenueDashboard = {
        id: Date.now().toString(),
        name: formData.name,
        mrr: formData.mrr || dashboardData.mrr || 0,
        arr: (formData.mrr || dashboardData.mrr || 0) * 12,
        churnRate: formData.churnRate || dashboardData.churnRate || 0,
        runway: dashboardData.runway || 0,
        forecast: dashboardData.forecast || [],
        date: new Date().toISOString()
      }

      onAddDashboard(dashboard)
      setFormData({ name: '', mrr: 0, churnRate: 0, monthlyBurn: 0 })
    } catch (error) {
      console.error('Failed to create dashboard:', error)
      alert('Failed to create dashboard. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-12">
      {/* Create Dashboard */}
      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Revenue Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track MRR, ARR, churn rate, and revenue forecasting with AI-powered insights
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard Name *</Label>
              <Input
                id="dashboard-name"
                placeholder="Q4 2024 Revenue"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrr" className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Recurring Revenue (MRR) *</Label>
              <Input
                id="mrr"
                type="number"
                placeholder="Enter your actual MRR (e.g., 10000)"
                value={formData.mrr || ''}
                onChange={(e) => setFormData({ ...formData, mrr: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                This requires your real financial data. Check your billing system or accounting software for the exact amount.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="churn-rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Churn Rate (%)</Label>
              <Input
                id="churn-rate"
                type="number"
                step="0.1"
                placeholder="Enter your actual churn rate (e.g., 5.0)"
                value={formData.churnRate || ''}
                onChange={(e) => setFormData({ ...formData, churnRate: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Calculate: (Customers lost this month / Total customers at start) × 100. This needs your real customer data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-burn" className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Burn Rate</Label>
              <Input
                id="monthly-burn"
                type="number"
                placeholder="Enter your actual monthly expenses (e.g., 5000)"
                value={formData.monthlyBurn || ''}
                onChange={(e) => setFormData({ ...formData, monthlyBurn: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
                className="bg-white dark:bg-slate-950"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Total monthly expenses (salaries, rent, tools, etc.). Check your accounting records for accurate numbers.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateDashboard}
            disabled={!formData.name.trim() || isAnalyzing}
            className="w-full mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Dashboard...
              </>
            ) : (
              <>
                Create Dashboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dashboards List */}
      {dashboards.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Generated Revenue Dashboards ({dashboards.length})</h3>
          <div className="grid gap-6">
            {dashboards.map((dashboard) => (
              <div 
                key={dashboard.id} 
                className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] cursor-pointer hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all duration-200"
                onClick={() => router.push(`/revenue-intelligence/dashboard/${dashboard.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      {dashboard.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{new Date(dashboard.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">MRR</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatCurrency(dashboard.mrr)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ARR</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatCurrency(dashboard.arr)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Churn</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboard.churnRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-md p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Runway</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {dashboard.runway.toFixed(1)}m
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setNavigatingId(dashboard.id)
                      router.push(`/revenue-intelligence/dashboard/${dashboard.id}`)
                    }}
                    className="ml-4 border-gray-200/60 dark:border-gray-800/60 font-medium"
                    disabled={navigatingId === dashboard.id}
                  >
                    {navigatingId === dashboard.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      'View'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

