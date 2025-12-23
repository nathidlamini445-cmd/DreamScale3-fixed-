'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useSessionSafe } from '@/lib/session-context'
import { ThemeToggle } from '@/components/theme-toggle'
import QuestionFlow from './question-flow'
import ReviewPage from './review-page'
import { OnboardingData } from './onboarding-types'
import { ENTREPRENEUR_QUESTIONS } from './question-flow'

type Screen = 'welcome' | 'questions' | 'review'

const entrepreneurImages = [
  {
    src: '/Merlian Perkin 07-12.png',
    name: 'Melanie Perkins',
    title: 'CEO, Canva',
    position: 'bottom-right'
  },
  {
    src: '/Elon Musk 07-12.jpg',
    name: 'Elon Musk',
    title: 'CEO, Tesla & X',
    position: 'bottom-right'
  },
  {
    src: '/Jeff Bezos 07-12.jpg',
    name: 'Jeff Bezos',
    title: 'Founder, Amazon',
    position: 'bottom-right'
  },
  {
    src: '/Jensen Huang 07-12.jpg',
    name: 'Jensen Huang',
    title: 'CEO, NVIDIA',
    position: 'bottom-right'
  },
  {
    src: '/Mark Zuckerberg 07-12.jpg',
    name: 'Mark Zuckerberg',
    title: 'CEO, Meta',
    position: 'bottom-right'
  },
  {
    src: '/Emma Grade 07-12.jpg',
    name: 'Emma Grede',
    title: 'Co-Founder, Good American & SKIMS',
    position: 'bottom-right'
  },
  {
    src: '/Robert f smith 07-12.jpg',
    name: 'Robert F. Smith',
    title: 'Founder, Vista Equity Partners',
    position: 'bottom-right'
  },
  {
    src: '/Satya Nadella 07-12.jpg',
    name: 'Satya Nadella',
    title: 'CEO, Microsoft',
    position: 'bottom-right'
  },
  {
    src: '/sarah_blakely 07-12.jpg',
    name: 'Sara Blakely',
    title: 'Founder, Spanx',
    position: 'bottom-right'
  }
]

interface IntegratedOnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export function IntegratedOnboarding({ isOpen, onClose }: IntegratedOnboardingProps) {
  const sessionContext = useSessionSafe()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [questionToEdit, setQuestionToEdit] = useState<string | null>(null)
  const [isEditingFromReview, setIsEditingFromReview] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())

  // Preload all images when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload all entrepreneur images using link preload
      entrepreneurImages.forEach((img, index) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = img.src
        link.fetchPriority = index < 3 ? 'high' : 'auto' // High priority for first 3 images
        document.head.appendChild(link)

        // Also preload using Image object for better browser caching
        const image = new window.Image()
        image.src = img.src
        image.onload = () => {
          setImagesLoaded(prev => new Set(prev).add(img.src))
        }
      })
    }
  }, [])

  useEffect(() => {
    if (currentScreen === 'welcome') {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % entrepreneurImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [currentScreen])

  const nextIndex = (currentIndex + 1) % entrepreneurImages.length
  const nextImage = entrepreneurImages[nextIndex]
  const currentImage = entrepreneurImages[currentIndex]
  const isBottomRight = currentImage.position === 'bottom-right'

  const handleNext = () => {
    setCurrentScreen('questions')
  }

  const handleUpdate = (data: OnboardingData) => {
    setOnboardingData(data)
  }

  const handleReview = (data: OnboardingData) => {
    setOnboardingData(data)
    if (isEditingFromReview) {
      setQuestionToEdit(null)
      setIsEditingFromReview(false)
      setCurrentScreen('review')
    } else {
      setCurrentScreen('review')
    }
  }

  const handleEditQuestion = (questionId: string) => {
    setQuestionToEdit(questionId)
    setIsEditingFromReview(true)
    setCurrentScreen('questions')
  }

  const handleBackToQuestions = () => {
    setQuestionToEdit(null)
    setIsEditingFromReview(false)
    setCurrentScreen('questions')
  }

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome')
  }

  // Map OnboardingData to our session structure
  const mapToSessionData = (data: OnboardingData) => {
    const normalizeValue = (value: string | string[] | undefined): string | string[] | null => {
      if (!value) return null
      if (Array.isArray(value)) return value.length > 0 ? value : null
      return value.trim() || null
    }

    const normalizeArray = (value: string | string[] | undefined): string[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      return [value]
    }

    // Map industry to single value if array (for backward compatibility)
    let industryValue: string | null = null
    if (data.industry) {
      if (Array.isArray(data.industry)) {
        industryValue = data.industry.length > 0 ? data.industry[0] : null
      } else {
        industryValue = data.industry
      }
    }

    // Map businessStage to our format
    let businessStageValue: 'idea' | 'foundation' | 'established' | null = null
    if (data.businessStage) {
      const stage = Array.isArray(data.businessStage) ? data.businessStage[0] : data.businessStage
      if (stage?.toLowerCase().includes('idea') || stage?.toLowerCase().includes('planning')) {
        businessStageValue = 'idea'
      } else if (stage?.toLowerCase().includes('early') || stage?.toLowerCase().includes('mvp')) {
        businessStageValue = 'foundation'
      } else if (stage?.toLowerCase().includes('growth') || stage?.toLowerCase().includes('established') || stage?.toLowerCase().includes('scaling')) {
        businessStageValue = 'established'
      }
    }

    const challengesValue = normalizeValue(data.challenges)
    
    return {
      name: normalizeValue(data.name) as string | null,
      businessName: normalizeValue(data.businessName) as string | null,
      industry: industryValue,
      experienceLevel: null, // Not in new onboarding, keep null
      businessStage: businessStageValue,
      revenueGoal: normalizeValue(data.revenueGoal),
      targetMarket: normalizeValue(data.targetMarket),
      teamSize: normalizeValue(data.teamSize),
      primaryRevenue: normalizeValue(data.primaryRevenue),
      customerAcquisition: normalizeValue(data.customerAcquisition),
      monthlyRevenue: normalizeValue(data.monthlyRevenue),
      keyMetrics: normalizeValue(data.keyMetrics),
      growthStrategy: normalizeValue(data.growthStrategy),
      biggestGoal: normalizeValue(data.biggestGoal),
      goals: normalizeArray(data.biggestGoal),
      challenges: challengesValue === null ? undefined : challengesValue,
      hobbies: normalizeArray(data.hobbies),
      favoriteSong: normalizeValue(data.favoriteSong) as string | null,
      mindsetAnswers: {},
      onboardingCompleted: true
    }
  }

  const handleSubmit = async (data: OnboardingData) => {
    if (!sessionContext) return

    const sessionData = mapToSessionData(data)
    
    console.log('💾 Saving onboarding data to session:', sessionData)
    
    // CRITICAL: Save to localStorage FIRST (synchronously) so welcome screen can detect completion
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingData', JSON.stringify(data))
        localStorage.setItem('onboardingCompleted', 'true')
        
        // Also update the session in localStorage immediately
        const existingSession = localStorage.getItem('dreamscale_session')
        const sessionToUpdate = existingSession ? JSON.parse(existingSession) : {}
        sessionToUpdate.entrepreneurProfile = {
          ...sessionToUpdate.entrepreneurProfile,
          ...sessionData,
          onboardingCompleted: true
        }
        localStorage.setItem('dreamscale_session', JSON.stringify(sessionToUpdate))
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
    
    // Save to session context
    sessionContext.updateEntrepreneurProfile(sessionData)
    
    // CRITICAL: Close onboarding IMMEDIATELY to show welcome screen
    // The welcome screen will detect completion from localStorage
    // Don't wait for async operations - they can continue in background
    onClose()
    
    // Continue with auto-setup in the background (non-blocking)
    
    // Auto-setup: Generate and save pre-populated features
    try {
      const setupResponse = await fetch('/api/onboarding/auto-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboardingData: data }),
      })

      if (setupResponse.ok) {
        const setupData = await setupResponse.json()
        
        // Save systems
        if (setupData.systems && setupData.systems.length > 0) {
          const systemsToSave = setupData.systems.map((sys: any) => ({
            ...sys,
            lastAnalyzed: sys.lastAnalyzed instanceof Date ? sys.lastAnalyzed.toISOString() : sys.lastAnalyzed
          }))
          localStorage.setItem('systembuilder:systems', JSON.stringify(systemsToSave))
          console.log('✅ Auto-setup: Saved', systemsToSave.length, 'systems')
        }

        // Save revenue data (merge with existing data)
        if (setupData.revenueGoals || setupData.revenueOptimizations || setupData.pricingStrategies || setupData.revenueDashboards) {
          try {
            const existingRevenueData = localStorage.getItem('revenueos:data')
            const revenueData = existingRevenueData 
              ? JSON.parse(existingRevenueData)
              : { dashboards: [], optimizations: [], pricingStrategies: [], goals: [], ltvAnalyses: [], scenarios: [] }
            
            if (setupData.revenueGoals && setupData.revenueGoals.length > 0) {
              revenueData.goals = [...(revenueData.goals || []), ...setupData.revenueGoals]
              console.log('✅ Auto-setup: Saved', setupData.revenueGoals.length, 'revenue goals')
            }
            if (setupData.revenueOptimizations && setupData.revenueOptimizations.length > 0) {
              revenueData.optimizations = [...(revenueData.optimizations || []), ...setupData.revenueOptimizations]
              console.log('✅ Auto-setup: Saved', setupData.revenueOptimizations.length, 'revenue optimizations')
            }
            if (setupData.pricingStrategies && setupData.pricingStrategies.length > 0) {
              revenueData.pricingStrategies = [...(revenueData.pricingStrategies || []), ...setupData.pricingStrategies]
              console.log('✅ Auto-setup: Saved', setupData.pricingStrategies.length, 'pricing strategies')
            }
            if (setupData.revenueDashboards && setupData.revenueDashboards.length > 0) {
              revenueData.dashboards = [...(revenueData.dashboards || []), ...setupData.revenueDashboards]
              console.log('✅ Auto-setup: Saved', setupData.revenueDashboards.length, 'revenue dashboards')
            }
            
            localStorage.setItem('revenueos:data', JSON.stringify(revenueData))
          } catch (e) {
            console.error('Failed to save revenue data:', e)
          }
        }

        // Save team data (merge with existing data)
        if (setupData.teamRoles || setupData.teamDNAAnalyses || setupData.teamRituals || setupData.teamHealthMonitors) {
          try {
            const existingTeamsData = localStorage.getItem('teams:data')
            const teamsData = existingTeamsData
              ? JSON.parse(existingTeamsData)
              : { dnaAnalyses: [], taskAssignments: [], healthMonitors: [], coFounderMatches: [], rituals: [], members: [] }
            
            // Convert team roles to team members format
            if (setupData.teamRoles && setupData.teamRoles.length > 0) {
              const newMembers = setupData.teamRoles.map((role: any) => ({
                id: role.id,
                name: role.name,
                role: role.name,
                email: undefined,
                strengths: role.requiredSkills || [],
                workStyle: 'flexible',
                communicationPreference: 'collaborative' as const,
                skills: role.requiredSkills || [],
                workload: 0,
                performanceHistory: []
              }))
              teamsData.members = [...(teamsData.members || []), ...newMembers]
              console.log('✅ Auto-setup: Saved', newMembers.length, 'team roles')
            }
            
            if (setupData.teamDNAAnalyses && setupData.teamDNAAnalyses.length > 0) {
              teamsData.dnaAnalyses = [...(teamsData.dnaAnalyses || []), ...setupData.teamDNAAnalyses]
              console.log('✅ Auto-setup: Saved', setupData.teamDNAAnalyses.length, 'team DNA analyses')
            }
            
            if (setupData.teamRituals && setupData.teamRituals.length > 0) {
              teamsData.rituals = [...(teamsData.rituals || []), ...setupData.teamRituals]
              console.log('✅ Auto-setup: Saved', setupData.teamRituals.length, 'team rituals')
            }
            
            if (setupData.teamHealthMonitors && setupData.teamHealthMonitors.length > 0) {
              // Convert to proper format with metrics structure
              const healthMonitors = setupData.teamHealthMonitors.map((monitor: any) => ({
                ...monitor,
                overallHealth: monitor.metrics && monitor.metrics.length > 0 
                  ? Math.round(monitor.metrics.reduce((sum: number, m: any) => sum + (m.value || 0), 0) / monitor.metrics.length)
                  : 75,
                metrics: {
                  morale: { value: monitor.metrics?.find((m: any) => m.metric?.toLowerCase().includes('morale'))?.value || 75, trend: 'stable' as const },
                  productivity: { value: monitor.metrics?.find((m: any) => m.metric?.toLowerCase().includes('productivity'))?.value || 75, trend: 'stable' as const },
                  collaboration: { value: monitor.metrics?.find((m: any) => m.metric?.toLowerCase().includes('collaboration'))?.value || 75, trend: 'stable' as const },
                  communication: { value: monitor.metrics?.find((m: any) => m.metric?.toLowerCase().includes('communication'))?.value || 75, trend: 'stable' as const }
                },
                warnings: []
              }))
              teamsData.healthMonitors = [...(teamsData.healthMonitors || []), ...healthMonitors]
              console.log('✅ Auto-setup: Saved', healthMonitors.length, 'team health monitors')
            }
            
            localStorage.setItem('teams:data', JSON.stringify(teamsData))
          } catch (e) {
            console.error('Failed to save team data:', e)
          }
        }

        // Save leadership data (merge with existing data)
        if (setupData.leadershipFrameworks || setupData.leadershipCommunications || setupData.leadershipConflicts || setupData.leadershipRoutines) {
          try {
            const existingLeadershipData = localStorage.getItem('leadership:data')
            const leadershipData = existingLeadershipData
              ? JSON.parse(existingLeadershipData)
              : { styleAssessment: { completed: false }, decisions: [], communications: [], conflicts: [], routines: [], challenges: [], feedback360: [] }
            
            // Convert frameworks to decisions format with all required fields
            if (setupData.leadershipFrameworks && setupData.leadershipFrameworks.length > 0) {
              const frameworkDecisions = setupData.leadershipFrameworks.map((fw: any) => ({
                id: fw.id,
                description: fw.name,
                context: fw.description,
                analysis: {
                  frameworks: [{
                    name: fw.name,
                    analysis: fw.description,
                    keyInsights: fw.principles || []
                  }],
                  pros: fw.principles || [],
                  cons: [],
                  secondOrderEffects: [],
                  caseStudies: [],
                  recommendation: fw.process ? fw.process.join(' → ') : fw.description
                },
                date: new Date().toISOString()
              }))
              leadershipData.decisions = [...(leadershipData.decisions || []), ...frameworkDecisions]
              console.log('✅ Auto-setup: Saved', frameworkDecisions.length, 'leadership frameworks')
            }
            
            if (setupData.leadershipCommunications && setupData.leadershipCommunications.length > 0) {
              leadershipData.communications = [...(leadershipData.communications || []), ...setupData.leadershipCommunications]
              console.log('✅ Auto-setup: Saved', setupData.leadershipCommunications.length, 'leadership communications')
            }
            
            if (setupData.leadershipConflicts && setupData.leadershipConflicts.length > 0) {
              leadershipData.conflicts = [...(leadershipData.conflicts || []), ...setupData.leadershipConflicts]
              console.log('✅ Auto-setup: Saved', setupData.leadershipConflicts.length, 'leadership conflict guides')
            }
            
            if (setupData.leadershipRoutines && setupData.leadershipRoutines.length > 0) {
              leadershipData.routines = [...(leadershipData.routines || []), ...setupData.leadershipRoutines]
              console.log('✅ Auto-setup: Saved', setupData.leadershipRoutines.length, 'leadership routines')
            }
            
            localStorage.setItem('leadership:data', JSON.stringify(leadershipData))
          } catch (e) {
            console.error('Failed to save leadership data:', e)
          }
        }

        // Set flag that auto-setup completed
        localStorage.setItem('autoSetupCompleted', 'true')
        localStorage.setItem('autoSetupDate', new Date().toISOString())
      }
    } catch (error) {
      console.error('Auto-setup failed (non-critical):', error)
      // Don't block onboarding completion if auto-setup fails
    }
    
    // Note: onClose() is already called at the start of handleSubmit
    // This ensures the welcome screen appears immediately
  }

  if (!isOpen) return null

  // Show review page
  if (currentScreen === 'review') {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto">
        {/* Theme Toggle Button */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ReviewPage
          userType="entrepreneur"
          data={onboardingData}
          onEdit={handleEditQuestion}
          onSubmit={handleSubmit}
          onBack={handleBackToQuestions}
        />
      </div>
    )
  }

  // Show questions flow
  if (currentScreen === 'questions') {
    const questions = ENTREPRENEUR_QUESTIONS.filter(q => q.type !== 'story')
    const initialStep = questionToEdit 
      ? questions.findIndex(q => q.id === questionToEdit)
      : 0
    
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto">
        {/* Theme Toggle is handled inside QuestionFlow component - only shows after business name */}
        <QuestionFlow
          userType="entrepreneur"
          data={onboardingData}
          onUpdate={handleUpdate}
          onComplete={() => {}}
          onBackToSelection={handleBackToWelcome}
          onReview={handleReview}
          initialStep={initialStep >= 0 ? initialStep : 0}
          onBackToReview={handleBackToQuestions}
          isEditingFromReview={isEditingFromReview}
        />
      </div>
    )
  }

  // Show welcome screen
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Logo - Top Left */}
      <div className="fixed top-4 left-10 z-50">
        <Image
          src="/Logo.png"
          alt="DreamScale Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
      {/* Theme Toggle Button - Hidden on welcome screen, will appear after business name */}
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-6">
        <div className="max-w-2xl w-full space-y-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold tracking-tight onboarding-welcome-title text-black dark:text-white">
              Welcome to <span className="bg-gradient-to-r from-[#191970] via-[#000033] to-[#191970] dark:from-[#39d2c0] dark:via-[#005DFF] dark:to-[#39d2c0] bg-clip-text text-transparent">DreamScale</span>
            </h1>
            <p className="text-base onboarding-welcome-text text-black dark:text-white">
              We're excited to help you build, scale, and grow your business. Let's get started by learning more about your entrepreneurial journey.
            </p>
          </motion.div>

          <div className="relative w-full max-w-md aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg">
            {/* Preload next image */}
            <div className="hidden">
              <Image
                src={nextImage.src}
                alt={nextImage.name}
                width={500}
                height={500}
                quality={90}
                priority={currentIndex < 2}
                loading="eager"
              />
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: imagesLoaded.has(currentImage.src) ? 1 : 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full rounded-lg overflow-hidden shadow-2xl"
              >
                {!imagesLoaded.has(currentImage.src) && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}
                <Image
                  src={currentImage.src}
                  alt={currentImage.name}
                  fill
                  className={`object-cover object-top transition-opacity duration-300 ${
                    imagesLoaded.has(currentImage.src) ? 'opacity-100' : 'opacity-0'
                  }`}
                  quality={90}
                  priority={currentIndex < 3}
                  loading={currentIndex < 3 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, 500px"
                  onLoad={() => setImagesLoaded(prev => new Set(prev).add(currentImage.src))}
                />
                <div className="absolute bottom-2 left-2 bg-slate-800/95 rounded px-2 py-1 image-disclaimer-overlay shadow-lg">
                  <p className="text-[10px] font-light image-disclaimer-text" style={{ color: '#FFFFFF' }}>
                    Images: Not our property
                  </p>
                </div>
                {isBottomRight && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-4 right-4 bg-slate-800/95 rounded-md px-4 py-2 text-right ceo-overlay shadow-lg"
                  >
                    <h3 className="font-bold text-base mb-1 ceo-name-text" style={{ color: '#FFFFFF' }}>{currentImage.name}</h3>
                    <p className="text-sm ceo-title-text" style={{ color: '#FFFFFF' }}>{currentImage.title}</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md mt-2"
          >
            <Button 
              size="lg" 
              className="w-full bg-[#191970] hover:bg-[#191970]/90 text-white"
              onClick={handleNext}
            >
              Next
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

