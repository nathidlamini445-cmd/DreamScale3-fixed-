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
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function TeamsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dna')
  const [teamsData, setTeamsData] = useState<TeamsData>(INITIAL_TEAMS_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const loadData = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          const dbData = await supabaseData.loadTeamsData(user.id)
          if (dbData) {
            const safeData: TeamsData = {
              dnaAnalyses: dbData.dnaAnalyses || [],
              taskAssignments: dbData.taskAssignments || [],
              healthMonitors: dbData.healthMonitors || [],
              coFounderMatches: dbData.coFounderMatches || [],
              rituals: dbData.rituals || [],
              members: dbData.members || []
            }
            setTeamsData(safeData)
            hasLoadedRef.current = true
            lastSavedRef.current = JSON.stringify({
              dnaCount: safeData.dnaAnalyses.length,
              assignmentsCount: safeData.taskAssignments.length,
              monitorsCount: safeData.healthMonitors.length,
              matchesCount: safeData.coFounderMatches.length,
              ritualsCount: safeData.rituals.length,
              membersCount: safeData.members.length
            })
            console.log('✅ Loaded teams data from Supabase')
            return
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          const safeData: TeamsData = {
            dnaAnalyses: parsed.dnaAnalyses || [],
            taskAssignments: parsed.taskAssignments || [],
            healthMonitors: parsed.healthMonitors || [],
            coFounderMatches: parsed.coFounderMatches || [],
            rituals: parsed.rituals || [],
            members: parsed.members || []
          }
          setTeamsData(safeData)
          hasLoadedRef.current = true
          lastSavedRef.current = JSON.stringify({
            dnaCount: safeData.dnaAnalyses.length,
            assignmentsCount: safeData.taskAssignments.length,
            monitorsCount: safeData.healthMonitors.length,
            matchesCount: safeData.coFounderMatches.length,
            ritualsCount: safeData.rituals.length,
            membersCount: safeData.members.length
          })
          console.log('✅ Loaded teams data from localStorage')
          return
        }
      } catch (e) {
        console.warn('Failed to load teams data:', e)
      }
      
      hasLoadedRef.current = true
    }

    loadData()
  }, [user])

  // Save data to Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    const dataString = JSON.stringify({
      dnaCount: teamsData.dnaAnalyses.length,
      assignmentsCount: teamsData.taskAssignments.length,
      monitorsCount: teamsData.healthMonitors.length,
      matchesCount: teamsData.coFounderMatches.length,
      ritualsCount: teamsData.rituals.length,
      membersCount: teamsData.members.length
    })
    
    if (dataString === lastSavedRef.current) return
    
    const saveData = async () => {
      try {
        // Save to Supabase if authenticated
        if (user?.id) {
          try {
            await supabaseData.saveTeamsData(user.id, teamsData)
            console.log('✅ Saved teams data to Supabase')
          } catch (supabaseError) {
            console.error('Error saving to Supabase, falling back to localStorage:', supabaseError)
          }
        }

        // Always save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('teams:data', JSON.stringify(teamsData))
          lastSavedRef.current = dataString
          console.log('✅ Saved teams data to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save teams data:', e)
      }
    }

    // Debounce saves
    const timeoutId = setTimeout(saveData, 500)
    return () => clearTimeout(timeoutId)
  }, [teamsData, user])

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
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Team<span className="text-[#2563eb]">Sync AI</span>
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    AI-powered team optimization for exceptional collaboration
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {stats.totalMembers}
                    </p>
                  </div>
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Analyses</p>
                    <p className="text-base font-semibold text-blue-600">
                      {stats.teamAnalyses}
                    </p>
                  </div>
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {stats.activeAssignments}
                    </p>
                  </div>
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monitors</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {stats.teamsMonitored}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb]/10 rounded-lg border border-[#2563eb]/20">
                    <span className="text-xs font-medium text-[#2563eb]">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

              <TabsContent value="dna" className="mt-4">
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

              <TabsContent value="tasks" className="mt-4">
                <SmartTaskAssignment 
                  assignments={teamsData.taskAssignments}
                  members={teamsData.members}
                  onAddAssignment={(assignment) => updateTeamsData({
                    taskAssignments: [...teamsData.taskAssignments, assignment]
                  })}
                  onUpdateMembers={(members) => updateTeamsData({ members })}
                  onDeleteAssignment={(id) => updateTeamsData({
                    taskAssignments: teamsData.taskAssignments.filter(a => a.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="health" className="mt-4">
                <TeamHealthMonitor 
                  monitors={teamsData.healthMonitors}
                  onAddMonitor={(monitor) => updateTeamsData({
                    healthMonitors: [...teamsData.healthMonitors, monitor]
                  })}
                  onDeleteMonitor={(id) => updateTeamsData({
                    healthMonitors: teamsData.healthMonitors.filter(m => m.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="cofounder" className="mt-4">
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

              <TabsContent value="rituals" className="mt-4">
                <TeamRitualsBuilder 
                  rituals={teamsData.rituals}
                  onAddRitual={(ritual) => updateTeamsData({
                    rituals: [...teamsData.rituals, ritual]
                  })}
                  onDeleteRitual={(id) => updateTeamsData({
                    rituals: teamsData.rituals.filter(r => r.id !== id)
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

