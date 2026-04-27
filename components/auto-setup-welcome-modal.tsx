'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { 
  CheckCircle2, 
  X,
  Settings,
  Users,
  DollarSign,
  Crown
} from 'lucide-react'

interface AutoSetupWelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  setupData?: {
    systemsCount?: number
    teamRolesCount?: number
    revenueGoalsCount?: number
    leadershipFrameworksCount?: number
  }
}

export function AutoSetupWelcomeModal({ isOpen, onClose, setupData }: AutoSetupWelcomeModalProps) {
  if (!isOpen) return null

  const systemsCount = setupData?.systemsCount || 0
  const teamRolesCount = setupData?.teamRolesCount || 0
  const revenueGoalsCount = setupData?.revenueGoalsCount || 0
  const leadershipFrameworksCount = setupData?.leadershipFrameworksCount || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-2xl mx-4 p-8 bg-white dark:bg-gray-900 border-2 border-primary/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 mb-4 overflow-hidden">
            <Image 
              src="/Logo.png" 
              alt="DreamScale Logo" 
              width={64} 
              height={64} 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to DreamScale! 🎉
          </h2>
          <p className="text-lg text-muted-foreground">
            We've set up your workspace with comprehensive systems, revenue strategies, team structures, and leadership frameworks
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {systemsCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Systems Created</h3>
                <p className="text-sm text-muted-foreground">
                  {systemsCount} operational system{systemsCount !== 1 ? 's' : ''} ready to use
                </p>
              </div>
            </div>
          )}

          {teamRolesCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Team Structure</h3>
                <p className="text-sm text-muted-foreground">
                  {teamRolesCount} role{teamRolesCount !== 1 ? 's' : ''}, rituals, DNA analysis & health monitors
                </p>
              </div>
            </div>
          )}

          {revenueGoalsCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Revenue Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Goals, optimizations, pricing strategies & dashboards
                </p>
              </div>
            </div>
          )}

          {leadershipFrameworksCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Leadership Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Frameworks, communications, conflict guides & routines
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-lg p-4 mb-6 border border-primary/20">
          <p className="text-sm text-foreground text-center">
            <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-600 dark:text-green-400" />
            Everything is ready! Visit <strong>Systems</strong>, <strong>Teams</strong>, <strong>Revenue Intelligence</strong>, or <strong>Leadership</strong> to explore your personalized workspace.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onClose} className="px-8">
            Get Started
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Hook to check and show welcome modal
export function useAutoSetupWelcome() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [setupData, setSetupData] = useState<{
    systemsCount?: number
    teamRolesCount?: number
    revenueGoalsCount?: number
    leadershipFrameworksCount?: number
  }>({})

  useEffect(() => {
    // Check if auto-setup was just completed
    const autoSetupCompleted = localStorage.getItem('autoSetupCompleted') === 'true'
    const welcomeShown = localStorage.getItem('autoSetupWelcomeShown') === 'true'
    
    if (autoSetupCompleted && !welcomeShown) {
      // Count what was created
      try {
        const systems = JSON.parse(localStorage.getItem('systembuilder:systems') || '[]')
        const revenueData = JSON.parse(localStorage.getItem('revenueos:data') || '{"goals":[],"optimizations":[],"pricingStrategies":[],"dashboards":[]}')
        const teamsData = JSON.parse(localStorage.getItem('teams:data') || '{"members":[],"rituals":[],"dnaAnalyses":[],"healthMonitors":[]}')
        const leadershipData = JSON.parse(localStorage.getItem('leadership:data') || '{"decisions":[],"communications":[],"conflicts":[],"routines":[]}')

        // Count total items created across all categories
        const totalRevenueItems = (revenueData.goals?.length || 0) + 
          (revenueData.optimizations?.length || 0) + 
          (revenueData.pricingStrategies?.length || 0) + 
          (revenueData.dashboards?.length || 0)
        
        const totalTeamItems = (teamsData.members?.length || 0) + 
          (teamsData.rituals?.length || 0) + 
          (teamsData.dnaAnalyses?.length || 0) + 
          (teamsData.healthMonitors?.length || 0)
        
        const totalLeadershipItems = (leadershipData.decisions?.length || 0) + 
          (leadershipData.communications?.length || 0) + 
          (leadershipData.conflicts?.length || 0) + 
          (leadershipData.routines?.length || 0)

        setSetupData({
          systemsCount: systems.length,
          teamRolesCount: totalTeamItems > 0 ? totalTeamItems : teamsData.members?.length || 0,
          revenueGoalsCount: totalRevenueItems > 0 ? totalRevenueItems : revenueData.goals?.length || 0,
          leadershipFrameworksCount: totalLeadershipItems > 0 ? totalLeadershipItems : leadershipData.decisions?.length || 0
        })

        setShowWelcome(true)
      } catch (e) {
        console.error('Error loading setup data:', e)
        setShowWelcome(true) // Show anyway
      }
    }
  }, [])

  const handleClose = () => {
    setShowWelcome(false)
    localStorage.setItem('autoSetupWelcomeShown', 'true')
  }

  return {
    showWelcome,
    setupData,
    handleClose
  }
}

