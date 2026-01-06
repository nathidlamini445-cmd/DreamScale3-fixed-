'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/theme-toggle'
import QuestionFlow from './question-flow'
import ReviewPage from './review-page'
import { OnboardingData } from './onboarding-types'
import { ENTREPRENEUR_QUESTIONS } from './question-flow'
import { LoginButton } from '@/components/login-button-onboarding'

type Screen = 'welcome' | 'questions' | 'review'

const entrepreneurImages = [
  {
    src: '/Melaine Perkins. Story. 07-12.jpg',
    name: 'Melanie Perkins',
    title: 'CEO, Canva',
    position: 'bottom-right',
    fallback: '/Merlian Perkin 07-12.png' // Fallback if main image fails
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
  const { user, profile } = useAuth()
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [questionToEdit, setQuestionToEdit] = useState<string | null>(null)
  const [isEditingFromReview, setIsEditingFromReview] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [imageSrcMap, setImageSrcMap] = useState<Map<string, string>>(new Map()) // Map of original src to current src (for fallbacks)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (!user) {
      setSubmitError('You must be logged in to complete onboarding. Please sign in first.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const sessionData = mapToSessionData(data)
      
      console.log('💾 Saving onboarding data to Supabase:', sessionData)
      
      // Prepare data for Supabase update
      const profileUpdate = {
        full_name: sessionData.name || user.user_metadata?.full_name || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }

      // Update user profile in Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        throw new Error(`Failed to save onboarding: ${profileError.message}`)
      }

      // Also save onboarding data to localStorage as a backup
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboardingData', JSON.stringify(data))
          localStorage.setItem('onboardingCompleted', 'true')
          
          // Update session context
          if (sessionContext) {
            sessionContext.updateEntrepreneurProfile(sessionData)
          }
          
          // Set flag to show tasks message after onboarding
          localStorage.setItem('showTasksAfterOnboarding', 'true')
        }
      } catch (localError) {
        console.warn('Failed to save to localStorage (non-critical):', localError)
        // Don't throw - this is just a backup
      }

      console.log('✅ Onboarding completed successfully')
      
      // Close onboarding
      onClose()
      
      // Redirect to home page
      router.push('/')
      
    } catch (error) {
      console.error('Error saving onboarding:', error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to save onboarding data. Please try again.'
      )
      setIsSubmitting(false)
    }
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
        {submitError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                {submitError}
              </p>
            </div>
          </div>
        )}
        <ReviewPage
          userType="entrepreneur"
          data={onboardingData}
          onEdit={handleEditQuestion}
          onSubmit={handleSubmit}
          onBack={handleBackToQuestions}
          isSubmitting={isSubmitting}
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
      {/* Login Button - Top Right */}
      <LoginButton />
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
                {(() => {
                  const imageSrc = imageSrcMap.get(currentImage.src) || currentImage.src
                  const hasFailed = failedImages.has(imageSrc) && (!('fallback' in currentImage) || failedImages.has((currentImage as any).fallback))
                  const isMelaniePerkins = currentImage.name === 'Melanie Perkins'
                  
                  if (hasFailed) {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="text-6xl mb-4">👤</div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium">{currentImage.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{currentImage.title}</p>
                        </div>
                      </div>
                    )
                  }
                  
                  // Use regular img tag for Melanie Perkins to avoid Next.js Image optimization issues
                  if (isMelaniePerkins) {
                    return (
                      <img
                        src={imageSrc}
                        alt={currentImage.name}
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
                          imagesLoaded.has(imageSrc) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setImagesLoaded(prev => new Set(prev).add(imageSrc))
                        }}
                        onError={(e) => {
                          console.warn(`Failed to load image: ${imageSrc}`, e)
                          // Try fallback if available
                          if ('fallback' in currentImage && (currentImage as any).fallback && !failedImages.has((currentImage as any).fallback)) {
                            console.log(`Trying fallback image: ${(currentImage as any).fallback}`)
                            setImageSrcMap(prev => new Map(prev).set(currentImage.src, (currentImage as any).fallback))
                            setFailedImages(prev => new Set(prev).add(imageSrc))
                          } else {
                            setFailedImages(prev => new Set(prev).add(imageSrc))
                          }
                        }}
                      />
                    )
                  }
                  
                  return (
                    <Image
                      src={imageSrc}
                      alt={currentImage.name}
                      fill
                      className={`object-cover object-top transition-opacity duration-300 ${
                        imagesLoaded.has(imageSrc) ? 'opacity-100' : 'opacity-0'
                      }`}
                      quality={90}
                      priority={currentIndex < 3}
                      loading={currentIndex < 3 ? "eager" : "lazy"}
                      sizes="(max-width: 768px) 100vw, 500px"
                      onLoad={() => {
                        setImagesLoaded(prev => new Set(prev).add(imageSrc))
                      }}
                      onError={(e) => {
                        console.warn(`Failed to load image: ${imageSrc}`, e)
                        // Try fallback if available
                        if ('fallback' in currentImage && (currentImage as any).fallback && !failedImages.has((currentImage as any).fallback)) {
                          console.log(`Trying fallback image: ${(currentImage as any).fallback}`)
                          setImageSrcMap(prev => new Map(prev).set(currentImage.src, (currentImage as any).fallback))
                          setFailedImages(prev => new Set(prev).add(imageSrc))
                        } else {
                          setFailedImages(prev => new Set(prev).add(imageSrc))
                        }
                      }}
                    />
                  )
                })()}
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

