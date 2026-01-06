"use client"

import { useState, useEffect, useRef } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  UserCheck, 
  Brain, 
  MessageSquare, 
  Users, 
  Calendar,
  Target,
  MessageCircle,
  HelpCircle
} from "lucide-react"
import LeadershipStyleAssessment from '@/components/leadership/LeadershipStyleAssessment'
import DecisionMakingAssistant from '@/components/leadership/DecisionMakingAssistant'
import CommunicationCoach from '@/components/leadership/CommunicationCoach'
import ConflictResolutionHelper from '@/components/leadership/ConflictResolutionHelper'
import CEOOperatingSystem from '@/components/leadership/CEOOperatingSystem'
import LeadershipChallenges from '@/components/leadership/LeadershipChallenges'
import Feedback360 from '@/components/leadership/Feedback360'
import LeadershipProblemSolver from '@/components/leadership/LeadershipProblemSolver'
import { LeadershipData, INITIAL_LEADERSHIP_DATA } from '@/lib/leadership-types'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseData from '@/lib/supabase-data'

export default function LeadershipPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('assessment')
  const [leadershipData, setLeadershipData] = useState<LeadershipData>(INITIAL_LEADERSHIP_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const loadData = async () => {
      try {
        // Try Supabase first if authenticated
        if (user?.id) {
          const dbData = await supabaseData.loadLeadershipData(user.id)
          if (dbData) {
            setLeadershipData(dbData as LeadershipData)
            hasLoadedRef.current = true
            lastSavedRef.current = JSON.stringify({
              styleAssessment: dbData.styleAssessment?.completed || false,
              decisionsCount: dbData.decisions?.length || 0,
              communicationsCount: dbData.communications?.length || 0,
              conflictsCount: dbData.conflicts?.length || 0,
              routinesCount: dbData.routines?.length || 0,
              challengesCount: dbData.challenges?.length || 0,
              feedbackCount: dbData.feedback360?.length || 0
            })
            console.log('✅ Loaded leadership data from Supabase')
            return
          }
        }

        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          setLeadershipData(parsed)
          hasLoadedRef.current = true
          console.log('✅ Loaded leadership data from localStorage')
          return
        }
      } catch (e) {
        console.warn('Failed to load leadership data:', e)
      }
      
      hasLoadedRef.current = true
    }

    loadData()
  }, [user])

  // Save data to Supabase (if authenticated) or localStorage
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    const dataString = JSON.stringify({
      styleAssessment: leadershipData.styleAssessment?.completed || false,
      decisionsCount: leadershipData.decisions.length,
      communicationsCount: leadershipData.communications.length,
      conflictsCount: leadershipData.conflicts.length,
      routinesCount: leadershipData.routines.length,
      challengesCount: leadershipData.challenges.length,
      feedbackCount: leadershipData.feedback360.length
    })
    
    if (dataString === lastSavedRef.current) return
    
    const saveData = async () => {
      try {
        // Save to Supabase if authenticated
        if (user?.id) {
          try {
            await supabaseData.saveLeadershipData(user.id, leadershipData)
            console.log('✅ Saved leadership data to Supabase')
          } catch (supabaseError) {
            console.error('Error saving to Supabase, falling back to localStorage:', supabaseError)
          }
        }

        // Always save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('leadership:data', JSON.stringify(leadershipData))
          lastSavedRef.current = dataString
          console.log('✅ Saved leadership data to localStorage')
        }
      } catch (e) {
        console.error('❌ Failed to save leadership data:', e)
      }
    }

    // Debounce saves
    const timeoutId = setTimeout(saveData, 500)
    return () => clearTimeout(timeoutId)
  }, [leadershipData, user])

  const updateLeadershipData = (updates: Partial<LeadershipData>) => {
    setLeadershipData(prev => ({ ...prev, ...updates }))
  }

  const stats = {
    assessmentCompleted: leadershipData.styleAssessment?.completed || false,
    decisionsCount: leadershipData.decisions.length,
    communicationsCount: leadershipData.communications.length,
    conflictsResolved: leadershipData.conflicts.length,
    routinesCreated: leadershipData.routines.length,
    challengesCompleted: leadershipData.challenges.filter(c => c.completed).length,
    feedbackReceived: leadershipData.feedback360.length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          {/* Header - Ultra Minimal */}
          <div className="bg-white dark:bg-slate-950 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-8">
                <div>
                  <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
                    Leadership
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    AI-powered leadership coach to make you a better founder and CEO
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Decisions</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {stats.decisionsCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Challenges</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {stats.challengesCompleted}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 rounded-md border border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.15)]">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 overflow-x-auto">
                <TabsTrigger value="assessment" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden md:inline">Style Assessment</span>
                </TabsTrigger>
                <TabsTrigger value="decisions" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span className="hidden md:inline">Decisions</span>
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Communication</span>
                </TabsTrigger>
                <TabsTrigger value="conflict" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Conflict</span>
                </TabsTrigger>
                <TabsTrigger value="ceo-system" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden md:inline">CEO System</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden md:inline">Challenges</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">360° Feedback</span>
                </TabsTrigger>
                <TabsTrigger value="problem-solver" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Problem Solver</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assessment" className="mt-6">
                <LeadershipStyleAssessment 
                  data={leadershipData.styleAssessment}
                  onComplete={(assessment) => updateLeadershipData({ styleAssessment: assessment })}
                />
              </TabsContent>

              <TabsContent value="decisions" className="mt-6">
                <DecisionMakingAssistant 
                  decisions={leadershipData.decisions}
                  onAddDecision={(decision) => updateLeadershipData({ 
                    decisions: [...leadershipData.decisions, decision] 
                  })}
                />
              </TabsContent>

              <TabsContent value="communication" className="mt-6">
                <CommunicationCoach 
                  communications={leadershipData.communications}
                  onAddCommunication={(communication) => updateLeadershipData({ 
                    communications: [...leadershipData.communications, communication] 
                  })}
                  onDeleteCommunication={(id) => updateLeadershipData({
                    communications: leadershipData.communications.filter(c => c.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="conflict" className="mt-6">
                <ConflictResolutionHelper 
                  conflicts={leadershipData.conflicts}
                  onAddConflict={(conflict) => updateLeadershipData({ 
                    conflicts: [...leadershipData.conflicts, conflict] 
                  })}
                  onDeleteConflict={(id) => updateLeadershipData({
                    conflicts: leadershipData.conflicts.filter(c => c.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="ceo-system" className="mt-6">
                <CEOOperatingSystem 
                  routines={leadershipData.routines}
                  onAddRoutine={(routine) => {
                    const existingIndex = leadershipData.routines.findIndex(r => r.id === routine.id)
                    if (existingIndex >= 0) {
                      // Update existing routine
                      updateLeadershipData({ 
                        routines: leadershipData.routines.map(r => 
                          r.id === routine.id ? routine : r
                        ) 
                      })
                    } else {
                      // Add new routine
                      updateLeadershipData({ 
                        routines: [...leadershipData.routines, routine] 
                      })
                    }
                  }}
                  onDeleteRoutine={(id) => updateLeadershipData({
                    routines: leadershipData.routines.filter(r => r.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="challenges" className="mt-6">
                <LeadershipChallenges 
                  challenges={leadershipData.challenges}
                  onUpdateChallenge={(challenge) => {
                    const existingIndex = leadershipData.challenges.findIndex(c => c.id === challenge.id)
                    if (existingIndex >= 0) {
                      // Update existing challenge
                      updateLeadershipData({ 
                        challenges: leadershipData.challenges.map(c => 
                          c.id === challenge.id ? challenge : c
                        ) 
                      })
                    } else {
                      // Add new challenge
                      updateLeadershipData({ 
                        challenges: [...leadershipData.challenges, challenge]
                      })
                    }
                  }}
                  onDeleteChallenge={(id) => updateLeadershipData({
                    challenges: leadershipData.challenges.filter(c => c.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <Feedback360 
                  feedback={leadershipData.feedback360}
                  onAddFeedback={(feedback) => updateLeadershipData({ 
                    feedback360: [...leadershipData.feedback360, feedback] 
                  })}
                  onDeleteFeedback={(id) => updateLeadershipData({
                    feedback360: leadershipData.feedback360.filter(f => f.id !== id)
                  })}
                />
              </TabsContent>

              <TabsContent value="problem-solver" className="mt-6">
                <LeadershipProblemSolver />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
