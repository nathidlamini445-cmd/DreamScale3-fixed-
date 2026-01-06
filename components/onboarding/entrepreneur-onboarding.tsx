'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSessionSafe } from '@/lib/session-context'
import { 
  Shirt, Palette, Music, Code, UtensilsCrossed, Dumbbell, 
  Briefcase, ShoppingCart, GraduationCap, Heart, 
  ArrowRight, ArrowLeft, CheckCircle2, Gamepad2, BookOpen,
  Camera, Plane, Coffee, Users, Film, Radio
} from 'lucide-react'

interface EntrepreneurOnboardingProps {
  isOpen: boolean
  onClose: () => void
}

const industries = [
  { value: 'fashion', label: 'Fashion', icon: Shirt, description: 'Clothing, accessories, and style businesses' },
  { value: 'arts', label: 'Arts', icon: Palette, description: 'Visual arts, design, and creative services' },
  { value: 'music', label: 'Music', icon: Music, description: 'Music production, performance, and services' },
  { value: 'tech', label: 'Technology', icon: Code, description: 'Software, apps, and tech solutions' },
  { value: 'food', label: 'Food & Beverage', icon: UtensilsCrossed, description: 'Restaurants, catering, food products' },
  { value: 'fitness', label: 'Fitness & Wellness', icon: Dumbbell, description: 'Gyms, coaching, wellness services' },
  { value: 'consulting', label: 'Consulting', icon: Briefcase, description: 'Business consulting and advisory' },
  { value: 'e-commerce', label: 'E-commerce', icon: ShoppingCart, description: 'Online retail and marketplaces' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Courses, training, and educational services' },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, description: 'Health services and medical businesses' }
]

const experienceLevels = [
  { 
    value: 'beginner', 
    label: 'Beginner', 
    description: 'Just starting out, learning the basics of entrepreneurship',
    details: 'You\'re new to business and ready to learn'
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: 'Have some experience, running a small business',
    details: 'You\'ve started and want to grow'
  },
  { 
    value: 'advanced', 
    label: 'Advanced', 
    description: 'Experienced entrepreneur, scaling or running multiple businesses',
    details: 'You\'re focused on optimization and scaling'
  }
]

const businessStages = [
  { 
    value: 'idea', 
    label: 'Idea Stage', 
    description: 'You have an idea but haven\'t started yet',
    details: 'Planning and validation phase'
  },
  { 
    value: 'foundation', 
    label: 'Foundation Stage', 
    description: 'You\'ve started your business, building the foundation',
    details: 'Early operations and initial customers'
  },
  { 
    value: 'established', 
    label: 'Established', 
    description: 'Your business is running, focused on growth',
    details: 'Scaling and optimization phase'
  }
]

const commonGoals = [
  'Increase revenue',
  'Get more customers',
  'Build a team',
  'Improve operations',
  'Launch new products/services',
  'Build brand awareness',
  'Scale the business',
  'Improve work-life balance',
  'Learn new skills',
  'Build partnerships'
]

export function EntrepreneurOnboarding({ isOpen, onClose }: EntrepreneurOnboardingProps) {
  const sessionContext = useSessionSafe()
  const [currentStep, setCurrentStep] = useState(1)
  const [customHobby, setCustomHobby] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    experienceLevel: '',
    businessStage: '',
    goals: [] as string[],
    challenges: '',
    mindsetAnswers: {} as Record<string, string>,
    hobbies: [] as string[],
    favoriteSong: ''
  })

  const totalSteps = 8

  useEffect(() => {
    if (isOpen && sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted) {
      onClose()
    }
  }, [isOpen, sessionContext, onClose])

  const handleIndustrySelect = (industry: string) => {
    setFormData(prev => ({ ...prev, industry }))
  }

  const handleExperienceSelect = (level: string) => {
    setFormData(prev => ({ ...prev, experienceLevel: level }))
  }

  const handleStageSelect = (stage: string) => {
    setFormData(prev => ({ ...prev, businessStage: stage }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleMindsetAnswer = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      mindsetAnswers: {
        ...prev.mindsetAnswers,
        [questionId]: answer
      }
    }))
  }

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (!sessionContext) return

    sessionContext.updateEntrepreneurProfile({
      name: formData.name.trim() || null,
      industry: formData.industry,
      experienceLevel: formData.experienceLevel as 'beginner' | 'intermediate' | 'advanced',
      businessStage: formData.businessStage as 'idea' | 'foundation' | 'established',
      goals: formData.goals,
      challenges: formData.challenges,
      mindsetAnswers: formData.mindsetAnswers,
      hobbies: formData.hobbies,
      favoriteSong: formData.favoriteSong.trim() || null,
      onboardingCompleted: true
    })

    onClose()
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim() !== ''
      case 2: return formData.industry !== ''
      case 3: return formData.experienceLevel !== ''
      case 4: return formData.businessStage !== ''
      case 5: return formData.goals.length > 0 || formData.challenges.trim() !== ''
      case 6: return Object.keys(formData.mindsetAnswers).length > 0
      case 7: return formData.favoriteSong.trim() !== ''
      case 8: return formData.hobbies.length > 0
      default: return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What's your name?</h3>
              <p className="text-black dark:text-gray-300">Let's personalize your DreamScale experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-lg"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What industry are you in?</h3>
              <p className="text-black dark:text-gray-300">Select the industry that best describes your business</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {industries.map((industry) => {
                const Icon = industry.icon
                const isSelected = formData.industry === industry.value
                return (
                  <Card
                    key={industry.value}
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg -translate-y-1'
                        : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleIndustrySelect(industry.value)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <div className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-black dark:text-white'}`}>
                          {industry.label}
                        </div>
                        <div className="text-xs text-black dark:text-gray-300 mt-1 line-clamp-2">
                          {industry.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What's your experience level?</h3>
              <p className="text-black dark:text-gray-300">Help us understand where you are in your entrepreneurial journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experienceLevels.map((level) => {
                const isSelected = formData.experienceLevel === level.value
                return (
                  <Card
                    key={level.value}
                    className={`p-6 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg -translate-y-1'
                        : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleExperienceSelect(level.value)}
                  >
                    <div className="space-y-3">
                      <div className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-black dark:text-white'}`}>
                        {level.label}
                      </div>
                      <p className="text-sm text-black dark:text-gray-300">{level.description}</p>
                      <p className="text-xs text-black dark:text-gray-300 italic">{level.details}</p>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What stage is your business at?</h3>
              <p className="text-black dark:text-gray-300">Tell us where you are in your business journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessStages.map((stage) => {
                const isSelected = formData.businessStage === stage.value
                return (
                  <Card
                    key={stage.value}
                    className={`p-6 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg -translate-y-1'
                        : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleStageSelect(stage.value)}
                  >
                    <div className="space-y-3">
                      <div className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-black dark:text-white'}`}>
                        {stage.label}
                      </div>
                      <p className="text-sm text-black dark:text-gray-300">{stage.description}</p>
                      <p className="text-xs text-black dark:text-gray-300 italic">{stage.details}</p>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What are your goals and challenges?</h3>
              <p className="text-black dark:text-gray-300">Help us understand what you want to achieve</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">Select your goals (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonGoals.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <label
                        htmlFor={goal}
                        className="text-sm font-medium text-black dark:text-white cursor-pointer"
                      >
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">What are your biggest challenges?</label>
                <Textarea
                  placeholder="Tell us about the challenges you're facing in your business..."
                  value={formData.challenges}
                  onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        // Dynamic questions based on previous answers
        const getMindsetQuestions = () => {
          const questions: Array<{ id: string; question: string; type: 'text' | 'select'; options?: string[] }> = []
          
          // Base question for all users
          questions.push({
            id: 'biggest_concern',
            question: 'What is your biggest concern about your business right now?',
            type: 'select' as const,
            options: [
              'Not sure if there\'s enough demand',
              'Lack of funding or resources',
              'Not having the right skills',
              'Fear of failure',
              'Time constraints',
              'Finding customers',
              'Scaling operations'
            ]
          })

          // Industry-specific questions
          if (formData.industry === 'food') {
            questions.push({
              id: 'food_specific',
              question: 'What excites you most about starting a food business?',
              type: 'select' as const,
              options: [
                'Creating unique flavors',
                'Building a community around food',
                'Sharing my passion for cooking',
                'Building a sustainable business',
                'Creating memorable experiences'
              ]
            })
          }

          if (formData.industry === 'fashion') {
            questions.push({
              id: 'fashion_specific',
              question: 'What drives your passion for fashion?',
              type: 'select' as const,
              options: [
                'Expressing creativity',
                'Making people feel confident',
                'Sustainable fashion',
                'Building a brand',
                'Trendsetting'
              ]
            })
          }

          // Experience level specific questions
          if (formData.experienceLevel === 'beginner') {
            questions.push({
              id: 'beginner_learning',
              question: 'What area do you want to learn about most right now?',
              type: 'select' as const,
              options: [
                'Marketing and sales',
                'Legal and compliance',
                'Operations and systems',
                'Financial management',
                'Product development',
                'Customer service'
              ]
            })
          }

          if (formData.experienceLevel === 'intermediate' || formData.experienceLevel === 'advanced') {
            questions.push({
              id: 'growth_focus',
              question: 'What is your main focus for growth right now?',
              type: 'select' as const,
              options: [
                'Scaling operations',
                'Building a team',
                'Expanding products/services',
                'Increasing revenue',
                'Optimizing systems',
                'Market expansion'
              ]
            })
          }

          // Business stage specific questions
          if (formData.businessStage === 'idea') {
            questions.push({
              id: 'idea_validation',
              question: 'What is your biggest concern about starting?',
              type: 'select' as const,
              options: [
                'Not sure if there\'s demand',
                'Lack of funding',
                'Not having the right skills',
                'Fear of failure',
                'Time constraints'
              ]
            })
          }

          if (formData.businessStage === 'foundation') {
            questions.push({
              id: 'foundation_focus',
              question: 'What is your main focus right now?',
              type: 'select' as const,
              options: [
                'Getting first customers',
                'Refining operations',
                'Building systems',
                'Marketing and awareness',
                'Product/service improvement'
              ]
            })
          }

          // Always include a text question for open-ended response
          questions.push({
            id: 'current_challenge',
            question: 'What is your biggest challenge right now?',
            type: 'text' as const
          })

          return questions
        }

        const mindsetQuestions = getMindsetQuestions()

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">A few quick questions</h3>
              <p className="text-black dark:text-gray-300">Help us understand your mindset and provide better guidance</p>
            </div>
            <div className="space-y-6">
              {mindsetQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">{q.question}</label>
                  {q.type === 'select' ? (
                    <Select
                      value={formData.mindsetAnswers[q.id] || ''}
                      onValueChange={(value) => handleMindsetAnswer(q.id, value)}
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {q.options?.map((option) => (
                          <SelectItem key={option} value={option} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Type your answer..."
                      value={formData.mindsetAnswers[q.id] || ''}
                      onChange={(e) => handleMindsetAnswer(q.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What's your favorite song?</h3>
              <p className="text-black dark:text-gray-300">
                We'll use this to help personalize your experience and suggest it when you need a boost!
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">
                  Favorite Song (Song Title and Artist)
                </label>
                <Input
                  placeholder="e.g., Eye of the Tiger by Survivor"
                  value={formData.favoriteSong}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteSong: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-black dark:text-gray-300 mt-2">
                  This helps us personalize your AI experience. When you're feeling stressed or need motivation, we can suggest listening to this song!
                </p>
              </div>
            </div>
          </div>
        )

      case 8:
        const commonHobbies = [
          { value: 'gym', label: 'Gym / Fitness', icon: Dumbbell },
          { value: 'music', label: 'Music / Jamming', icon: Music },
          { value: 'reading', label: 'Reading', icon: BookOpen },
          { value: 'cooking', label: 'Cooking', icon: UtensilsCrossed },
          { value: 'sports', label: 'Sports', icon: Users },
          { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
          { value: 'art', label: 'Art / Creative', icon: Palette },
          { value: 'travel', label: 'Travel', icon: Plane },
          { value: 'photography', label: 'Photography', icon: Camera },
          { value: 'movies', label: 'Movies / Film', icon: Film },
          { value: 'podcasts', label: 'Podcasts / Audio', icon: Radio },
          { value: 'coffee', label: 'Coffee / Cafes', icon: Coffee }
        ]

        const handleAddCustomHobby = () => {
          if (customHobby.trim() && !formData.hobbies.includes(customHobby.trim())) {
            setFormData(prev => ({
              ...prev,
              hobbies: [...prev.hobbies, customHobby.trim()]
            }))
            setCustomHobby('')
          }
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">What are your hobbies?</h3>
              <p className="text-black dark:text-gray-300">
                Help us understand your interests so we can tailor advice with relatable examples
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">Select your hobbies (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonHobbies.map((hobby) => {
                    const Icon = hobby.icon
                    const isSelected = formData.hobbies.includes(hobby.value)
                    return (
                      <Card
                        key={hobby.value}
                        className={`p-4 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg -translate-y-1'
                            : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => handleHobbyToggle(hobby.value)}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-black dark:text-white'}`}>
                            {hobby.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black dark:text-white mb-3 block">Add a custom hobby</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., hiking, dancing, writing..."
                    value={customHobby}
                    onChange={(e) => setCustomHobby(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomHobby()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomHobby}
                    disabled={!customHobby.trim()}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {formData.hobbies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary" className="px-3 py-1">
                        {commonHobbies.find(h => h.value === hobby)?.label || hobby}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing if onboarding is not completed
      if (!open && !sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted) {
        return
      }
      onClose()
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-16 z-50">
          <ThemeToggle />
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl text-black dark:text-white">Welcome to DreamScale</DialogTitle>
          <DialogDescription className="text-base text-black dark:text-gray-300">
            Let's personalize your experience. This will only take a few minutes.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8 pt-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const step = index + 1
              const isCompleted = step < currentStep
              const isCurrent = step === currentStep
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`w-12 h-1 mx-2 transition-all ${
                        isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-black dark:text-gray-300">
            Step {currentStep} of {totalSteps}
          </div>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90"
          >
            {currentStep === totalSteps ? 'Complete' : 'Next'}
            {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

