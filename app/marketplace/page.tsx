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
  MessageCircle
} from "lucide-react"
import LeadershipStyleAssessment from '@/components/leadership/LeadershipStyleAssessment'
import DecisionMakingAssistant from '@/components/leadership/DecisionMakingAssistant'
import CommunicationCoach from '@/components/leadership/CommunicationCoach'
import ConflictResolutionHelper from '@/components/leadership/ConflictResolutionHelper'
import CEOOperatingSystem from '@/components/leadership/CEOOperatingSystem'
import LeadershipChallenges from '@/components/leadership/LeadershipChallenges'
import Feedback360 from '@/components/leadership/Feedback360'
import { LeadershipData, INITIAL_LEADERSHIP_DATA } from '@/lib/leadership-types'

export default function LeadershipPage() {
  const [activeTab, setActiveTab] = useState('assessment')
  const [leadershipData, setLeadershipData] = useState<LeadershipData>(INITIAL_LEADERSHIP_DATA)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  // Load data from localStorage
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('leadership:data') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        setLeadershipData(parsed)
        hasLoadedRef.current = true
        return
      }
    } catch (e) {
      console.warn('Failed to load leadership data from localStorage', e)
    }
    
    hasLoadedRef.current = true
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedRef.current) return
    
    // Create a stable string representation to detect actual changes
    const dataString = JSON.stringify({
      styleAssessment: leadershipData.styleAssessment?.completed || false,
      decisionsCount: leadershipData.decisions.length,
      communicationsCount: leadershipData.communications.length,
      conflictsCount: leadershipData.conflicts.length,
      routinesCount: leadershipData.routines.length,
      challengesCount: leadershipData.challenges.length,
      feedbackCount: leadershipData.feedback360.length
    })
    
    // Only save if data actually changed
    if (dataString === lastSavedRef.current) return
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('leadership:data', JSON.stringify(leadershipData))
        lastSavedRef.current = dataString
        console.log('✅ Saved leadership data to localStorage')
      }
    } catch (e) {
      console.error('❌ Failed to save leadership data to localStorage:', e)
    }
  }, [leadershipData])

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
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    <span className="text-[#39d2c0]">Leadership</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    AI-powered leadership coach to make you a better founder and CEO
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Decisions</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.decisionsCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Challenges</p>
                    <p className="text-lg font-semibold text-green-600">
                      {stats.challengesCompleted}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#39d2c0]/10 rounded-lg border border-[#39d2c0]/20">
                    <span className="text-sm font-medium text-[#39d2c0]">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 overflow-x-auto">
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
                />
              </TabsContent>

              <TabsContent value="conflict" className="mt-6">
                <ConflictResolutionHelper 
                  conflicts={leadershipData.conflicts}
                  onAddConflict={(conflict) => updateLeadershipData({ 
                    conflicts: [...leadershipData.conflicts, conflict] 
                  })}
                />
              </TabsContent>

              <TabsContent value="ceo-system" className="mt-6">
                <CEOOperatingSystem 
                  routines={leadershipData.routines}
                  onAddRoutine={(routine) => updateLeadershipData({ 
                    routines: [...leadershipData.routines, routine] 
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
                />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <Feedback360 
                  feedback={leadershipData.feedback360}
                  onAddFeedback={(feedback) => updateLeadershipData({ 
                    feedback360: [...leadershipData.feedback360, feedback] 
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
