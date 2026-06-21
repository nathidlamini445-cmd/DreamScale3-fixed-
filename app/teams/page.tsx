"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dna, Briefcase, Heart, UserPlus, Calendar, Sparkles } from "lucide-react"
import TeamDNAAnalysis from '@/components/teams/TeamDNAAnalysis'
import SmartTaskAssignment from '@/components/teams/SmartTaskAssignment'
import TeamHealthMonitor from '@/components/teams/TeamHealthMonitor'
import VirtualCoFounderMatching from '@/components/teams/VirtualCoFounderMatching'
import TeamRitualsBuilder from '@/components/teams/TeamRitualsBuilder'
import TeamMembersPanel from '@/components/teams/TeamMembersPanel'
import { TeamsData, INITIAL_TEAMS_DATA } from '@/lib/teams-types'
import { useUser } from '@clerk/nextjs'
import * as supabaseData from '@/lib/supabase-data'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { useUsageQuota } from '@/hooks/use-usage-quota'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { MONTHLY_FEATURE_LIMIT } from '@/lib/usage-quota/types'
function normalizeTeamsData(raw: Partial<TeamsData> | null | undefined): TeamsData {
  return {
    dnaAnalyses: raw?.dnaAnalyses ?? [],
    taskAssignments: raw?.taskAssignments ?? [],
    healthMonitors: raw?.healthMonitors ?? [],
    coFounderMatches: raw?.coFounderMatches ?? [],
    rituals: raw?.rituals ?? [],
    members: raw?.members ?? [],
  }
}

export default function TeamsPage() {
  const { user } = useUser()
  const { isPro } = useSubscriptionStatus()
  const { usage } = useUsageQuota()
  const [activeTab, setActiveTab] = useState('dna')
  const [teamsData, setTeamsData] = useState<TeamsData>(INITIAL_TEAMS_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  const teamsUsage = usage?.monthly?.teams
  const aiRunsUsed = teamsUsage?.used ?? 0
  const aiRunsLimit = teamsUsage?.limit ?? MONTHLY_FEATURE_LIMIT

  const persistTeamsData = useCallback(
    async (data: TeamsData) => {
      const snapshot = JSON.stringify(data)
      if (snapshot === lastSavedRef.current) return

      if (user?.id) {
        try {
          await supabaseData.saveTeamsData(user.id, data)
        } catch (e) {
          console.error('Error saving teams data to Supabase:', e)
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('teams:data', snapshot)
      }
      lastSavedRef.current = snapshot
    },
    [user?.id]
  )

  useEffect(() => {
    if (hasLoadedRef.current) return

    const loadData = async () => {
      try {
        let loaded: TeamsData | null = null

        if (user?.id) {
          const dbData = await supabaseData.loadTeamsData(user.id)
          if (dbData) {
            loaded = normalizeTeamsData(dbData as TeamsData)
          }
        }

        const localRaw =
          typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        const localData = localRaw ? normalizeTeamsData(JSON.parse(localRaw)) : null

        if (!loaded && localData) {
          loaded = localData
        } else if (loaded && localData && user?.id) {
          const dbEmpty =
            loaded.members.length === 0 &&
            loaded.dnaAnalyses.length === 0 &&
            loaded.taskAssignments.length === 0
          if (dbEmpty && localData.members.length > 0) {
            loaded = localData
            void persistTeamsData(localData)
          }
        }

        if (loaded) {
          setTeamsData(loaded)
          lastSavedRef.current = JSON.stringify(loaded)
        }
      } catch (e) {
        console.warn('Failed to load teams data:', e)
      } finally {
        hasLoadedRef.current = true
      }
    }

    void loadData()
  }, [user?.id, persistTeamsData])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    const timeoutId = setTimeout(() => {
      void persistTeamsData(teamsData)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [teamsData, persistTeamsData])

  const updateTeamsData = (updates: Partial<TeamsData>) => {
    setTeamsData((prev) => ({ ...prev, ...updates }))
  }

  const stats = {
    teamAnalyses: teamsData.dnaAnalyses.length,
    activeAssignments: teamsData.taskAssignments.length,
    teamsMonitored: teamsData.healthMonitors.length,
    coFounderMatches: teamsData.coFounderMatches.length,
    ritualsCreated: teamsData.rituals.length,
    totalMembers: teamsData.members.length,
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 text-foreground relative overflow-y-auto">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex-1 min-w-[200px]">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Team<span className="text-[#2563eb]">Sync AI</span>
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    Build your roster, assign work intelligently, and keep the team healthy
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {!isPro && usage && (
                    <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI runs left</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {Math.max(0, aiRunsLimit - aiRunsUsed)}/{aiRunsLimit}
                      </p>
                    </div>
                  )}
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {stats.totalMembers}
                    </p>
                  </div>
                  <div className="text-center px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Analyses</p>
                    <p className="text-base font-semibold text-blue-600">{stats.teamAnalyses}</p>
                  </div>
                  {isPro && <ProPlanBadge active />}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {teamsData.members.length === 0 && (
              <div className="mb-6 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 flex flex-wrap items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-200 flex-1 min-w-[200px]">
                  Start with your team roster — import workspace collaborators or add members below.
                  Invite others via <span className="font-medium">Settings → Teamspaces</span>.
                </p>
              </div>
            )}

            <TeamMembersPanel
              members={teamsData.members}
              onUpdateMembers={(members) => updateTeamsData({ members })}
            />

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
                  onDeleteAssignment={(id) => updateTeamsData({
                    taskAssignments: teamsData.taskAssignments.filter(a => a.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="health" className="mt-4">
                <TeamHealthMonitor 
                  monitors={teamsData.healthMonitors}
                  members={teamsData.members}
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

