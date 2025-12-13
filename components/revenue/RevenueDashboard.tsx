"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BarChart3, TrendingUp, AlertCircle, Calendar } from "lucide-react"
import { RevenueDashboard } from '@/lib/revenue-types'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

interface RevenueDashboardProps {
  dashboards: RevenueDashboard[]
  onAddDashboard: (dashboard: RevenueDashboard) => void
}

export default function RevenueDashboard({ dashboards, onAddDashboard }: RevenueDashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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
    <div className="space-y-6">
      {/* Create Dashboard */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2563eb]" />
            Revenue Dashboard
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track MRR, ARR, churn rate, and revenue forecasting with AI-powered insights
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name *</Label>
              <Input
                id="dashboard-name"
                placeholder="Q4 2024 Revenue"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrr">Monthly Recurring Revenue (MRR) *</Label>
              <Input
                id="mrr"
                type="number"
                placeholder="Enter your actual MRR (e.g., 10000)"
                value={formData.mrr || ''}
                onChange={(e) => setFormData({ ...formData, mrr: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 This requires your real financial data. Check your billing system or accounting software for the exact amount.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="churn-rate">Churn Rate (%)</Label>
              <Input
                id="churn-rate"
                type="number"
                step="0.1"
                placeholder="Enter your actual churn rate (e.g., 5.0)"
                value={formData.churnRate || ''}
                onChange={(e) => setFormData({ ...formData, churnRate: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Calculate: (Customers lost this month / Total customers at start) × 100. This needs your real customer data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-burn">Monthly Burn Rate</Label>
              <Input
                id="monthly-burn"
                type="number"
                placeholder="Enter your actual monthly expenses (e.g., 5000)"
                value={formData.monthlyBurn || ''}
                onChange={(e) => setFormData({ ...formData, monthlyBurn: parseFloat(e.target.value) || 0 })}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Total monthly expenses (salaries, rent, tools, etc.). Check your accounting records for accurate numbers.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateDashboard}
            disabled={!formData.name.trim() || isAnalyzing}
            className="w-full mt-4 bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Dashboard...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Create Dashboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dashboards List */}
      {dashboards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Dashboards ({dashboards.length})</h3>
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#2563eb]" />
                  {dashboard.name}
                </CardTitle>
                <CardDescription>
                  Created on {new Date(dashboard.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">MRR</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(dashboard.mrr)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ARR</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(dashboard.arr)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    "bg-yellow-50 dark:bg-yellow-900/20",
                    dashboard.churnRate > 5 && "bg-red-50 dark:bg-red-900/20"
                  )}>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Churn Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboard.churnRate.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    dashboard.runway > 12 ? "bg-green-50 dark:bg-green-900/20" : 
                    dashboard.runway > 6 ? "bg-yellow-50 dark:bg-yellow-900/20" : 
                    "bg-red-50 dark:bg-red-900/20"
                  )}>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                        Runway
                        {dashboard.runway < 6 && <AlertCircle className="w-3 h-3 text-red-500" />}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboard.runway.toFixed(1)} months
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Forecast */}
                {dashboard.forecast.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Revenue Forecast
                    </h4>
                    <div className="space-y-2">
                      {dashboard.forecast.map((forecast, i) => (
                        <Card key={i} className="bg-gray-50 dark:bg-gray-900">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{forecast.month}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(forecast.projectedRevenue)}
                                </span>
                                <Badge variant="outline">
                                  {forecast.confidence}% confidence
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

