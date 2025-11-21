"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dna, Briefcase, Heart, UserPlus, Calendar } from "lucide-react"
import TeamDNAAnalysis from '@/components/teams/TeamDNAAnalysis'
import SmartTaskAssignment from '@/components/teams/SmartTaskAssignment'
import TeamHealthMonitor from '@/components/teams/TeamHealthMonitor'
import VirtualCoFounderMatching from '@/components/teams/VirtualCoFounderMatching'
import TeamRitualsBuilder from '@/components/teams/TeamRitualsBuilder'
import { TeamsData, INITIAL_TEAMS_DATA } from '@/lib/teams-types'

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState('dna')
  const [teamsData, setTeamsData] = useState<TeamsData>(INITIAL_TEAMS_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        setTeamsData(parsed)
        hasLoadedRef.current = true
        lastSavedRef.current = JSON.stringify({
          dnaCount: parsed.dnaAnalyses.length,
          assignmentsCount: parsed.taskAssignments.length,
          monitorsCount: parsed.healthMonitors.length,
          matchesCount: parsed.coFounderMatches.length,
          ritualsCount: parsed.rituals.length,
          membersCount: parsed.members.length
        })
        return
      }
    } catch (e) {
      console.warn('Failed to load teams data from localStorage', e)
    }
    
    hasLoadedRef.current = true
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    // Create a stable string representation to detect actual changes
    const dataString = JSON.stringify({
      dnaCount: teamsData.dnaAnalyses.length,
      assignmentsCount: teamsData.taskAssignments.length,
      monitorsCount: teamsData.healthMonitors.length,
      matchesCount: teamsData.coFounderMatches.length,
      ritualsCount: teamsData.rituals.length,
      membersCount: teamsData.members.length
    })
    
    // Only save if data actually changed
    if (dataString === lastSavedRef.current) return
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('teams:data', JSON.stringify(teamsData))
        lastSavedRef.current = dataString
        console.log('✅ Saved teams data to localStorage')
      }
    } catch (e) {
      console.error('❌ Failed to save teams data to localStorage:', e)
    }
  }, [teamsData])

  const updateTeamsData = (updates: Partial<TeamsData>) => {
    setTeamsData(prev => ({ ...prev, ...updates }))
  }

  const stats = {
    teamAnalyses: teamsData.dnaAnalyses.length,
    activeAssignments: teamsData.taskAssignments.length,
    teamsMonitored: teamsData.healthMonitors.length,
    coFounderMatches: teamsData.coFounderMatches.length,
    ritualsCreated: teamsData.rituals.length,
    totalMembers: teamsData.members.length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header */}
          <div className="bg-white dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Team<span className="text-[#2563eb]">Sync AI</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    AI-powered team optimization for exceptional collaboration
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.totalMembers}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teams Analyzed</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {stats.teamAnalyses}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#2563eb]/10 rounded-lg border border-[#2563eb]/20">
                    <span className="text-sm font-medium text-[#2563eb]">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 overflow-x-auto">
                <TabsTrigger value="dna" className="flex items-center gap-2">
                  <Dna className="w-4 h-4" />
                  <span className="hidden md:inline">DNA Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden md:inline">Task Assignment</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden md:inline">Health Monitor</span>
                </TabsTrigger>
                <TabsTrigger value="cofounder" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden md:inline">Co-founder Match</span>
                </TabsTrigger>
                <TabsTrigger value="rituals" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden md:inline">Rituals Builder</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dna" className="mt-6">
                <TeamDNAAnalysis 
                  analyses={teamsData.dnaAnalyses}
                  members={teamsData.members}
                  onAddAnalysis={(analysis) => updateTeamsData({ 
                    dnaAnalyses: [...teamsData.dnaAnalyses, analysis] 
                  })}
                  onUpdateMembers={(members) => updateTeamsData({ members })}
                  onDeleteAnalysis={(id) => updateTeamsData({
                    dnaAnalyses: teamsData.dnaAnalyses.filter(a => a.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <SmartTaskAssignment 
                  assignments={teamsData.taskAssignments}
                  members={teamsData.members}
                  onAddAssignment={(assignment) => updateTeamsData({
                    taskAssignments: [...teamsData.taskAssignments, assignment]
                  })}
                  onUpdateMembers={(members) => updateTeamsData({ members })}
                />
              </TabsContent>

              <TabsContent value="health" className="mt-6">
                <TeamHealthMonitor 
                  monitors={teamsData.healthMonitors}
                  onAddMonitor={(monitor) => updateTeamsData({
                    healthMonitors: [...teamsData.healthMonitors, monitor]
                  })}
                />
              </TabsContent>

              <TabsContent value="cofounder" className="mt-6">
                <VirtualCoFounderMatching 
                  matches={teamsData.coFounderMatches}
                  onAddMatch={(match) => updateTeamsData({
                    coFounderMatches: [...teamsData.coFounderMatches, match]
                  })}
                  onDeleteMatch={(id) => updateTeamsData({
                    coFounderMatches: teamsData.coFounderMatches.filter(m => m.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="rituals" className="mt-6">
                <TeamRitualsBuilder 
                  rituals={teamsData.rituals}
                  onAddRitual={(ritual) => updateTeamsData({
                    rituals: [...teamsData.rituals, ritual]
                  })}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

