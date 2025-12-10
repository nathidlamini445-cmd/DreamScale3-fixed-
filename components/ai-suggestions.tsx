'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Settings,
  BookOpen,
  Zap,
  RefreshCw,
  ChevronRight,
  Crown,
  Compass
} from 'lucide-react'
import { loadOnboardingData, getUserChallenges, getUserBusinessStage, getUserIndustry } from '@/lib/onboarding-storage'
import { OnboardingData } from '@/components/onboarding/onboarding-types'

interface Suggestion {
  id: string
  title: string
  description: string
  explanation: string
  feature: string
  featureLink: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

const iconMap: { [key: string]: typeof Sparkles } = {
  'lightbulb': Lightbulb,
  'target': Target,
  'trending': TrendingUp,
  'users': Users,
  'dollar': DollarSign,
  'settings': Settings,
  'book': BookOpen,
  'zap': Zap,
  'crown': Crown,
  'sparkles': Sparkles,
  'compass': Compass
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
}

// Generate smart suggestions based on onboarding data
function generateSmartSuggestions(onboardingData: OnboardingData | null): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  if (!onboardingData) {
    return [
      {
        id: '1',
        title: 'Set Up Your Business Profile',
        description: 'Unlock personalized AI guidance tailored to your unique situation',
        explanation: 'Right now, we don\'t know enough about your business to give you truly helpful recommendations. By completing your profile, you\'ll tell us about your industry, your biggest challenges, and where you want to go. This allows our AI to analyze your specific situation and create a roadmap that actually makes sense for YOU—not generic advice that works for everyone but helps no one.',
        feature: 'Discover',
        featureLink: '/discover',
        icon: 'sparkles',
        priority: 'high',
        category: 'Getting Started'
      },
      {
        id: '2',
        title: 'Understand Your Revenue Potential',
        description: 'Discover hidden opportunities to grow your income',
        explanation: 'Most entrepreneurs leave money on the table without realizing it. Whether it\'s pricing too low, missing upsell opportunities, or not having enough revenue streams, there\'s almost always room to grow. Our Revenue tools help you analyze where your money is coming from, identify what\'s working, and find the gaps you might be missing.',
        feature: 'Revenue',
        featureLink: '/revenue',
        icon: 'dollar',
        priority: 'medium',
        category: 'Growth'
      },
      {
        id: '3',
        title: 'Build Systems That Run Without You',
        description: 'Stop being the bottleneck in your own business',
        explanation: 'If your business can\'t run without you handling everything personally, you don\'t have a business—you have a job. Systems are the documented processes and workflows that let your business operate consistently, whether you\'re there or not. This is how you scale, how you hire effectively, and how you eventually get your time back.',
        feature: 'Systems',
        featureLink: '/revenue?tab=systems',
        icon: 'settings',
        priority: 'medium',
        category: 'Operations'
      }
    ]
  }

  const challenges = getUserChallenges(onboardingData)
  const businessStage = getUserBusinessStage(onboardingData)
  const industry = getUserIndustry(onboardingData)
  const businessName = onboardingData.businessName || 'your business'
  const biggestGoal = Array.isArray(onboardingData.biggestGoal) 
    ? onboardingData.biggestGoal[0] 
    : onboardingData.biggestGoal

  // Challenge-based suggestions with deep explanations
  if (challenges.includes('Finding customers') || challenges.includes('Marketing')) {
    suggestions.push({
      id: 'cust-1',
      title: 'Solve Your Customer Acquisition Problem',
      description: 'You mentioned finding customers is a challenge—let\'s fix that',
      explanation: `Finding customers is one of the hardest parts of building a business, and you're not alone in struggling with this. The problem usually isn't that there are no customers—it's that you haven't figured out WHERE they are and HOW to reach them yet. For ${businessName}, this means getting crystal clear on who your ideal customer is (not just demographics, but their pain points, where they hang out online, what keeps them up at night), then creating a systematic way to get in front of them. Our Revenue tools help you map out your customer journey, identify the best channels for YOUR specific audience, and create repeatable systems so you're not starting from scratch every time you need new customers.`,
      feature: 'Revenue',
      featureLink: '/revenue',
      icon: 'users',
      priority: 'high',
      category: 'Customer Growth'
    })
  }

  if (challenges.includes('Revenue growth') || challenges.includes('Sales')) {
    suggestions.push({
      id: 'rev-1',
      title: 'Break Through Your Revenue Ceiling',
      description: 'Revenue growth is about working smarter, not just harder',
      explanation: `You indicated that revenue growth is a challenge for ${businessName}. Here's the truth: most businesses hit revenue plateaus not because of lack of effort, but because of how they're structured. There are really only a few ways to grow revenue: get more customers, increase how much each customer spends, get customers to buy more often, or improve your margins. The key is figuring out which lever will have the biggest impact for YOUR business right now. Our Revenue Intelligence tools help you analyze your current revenue streams, identify which growth lever is most accessible, and create a focused plan to push through your ceiling—without burning yourself out trying to do everything at once.`,
      feature: 'Revenue Intelligence',
      featureLink: '/revenue-intelligence',
      icon: 'dollar',
      priority: 'high',
      category: 'Revenue'
    })
  }

  if (challenges.includes('Team management') || challenges.includes('Hiring')) {
    suggestions.push({
      id: 'team-1',
      title: 'Build a Team That Actually Works',
      description: 'Team challenges usually come from unclear structure, not bad people',
      explanation: `Managing a team is fundamentally different from doing the work yourself, and most entrepreneurs were never taught how to do it. If you're struggling with team management, it's likely one of these issues: unclear roles and responsibilities (people don't know exactly what they own), poor communication systems (information gets lost or duplicated), or misaligned expectations (you expect one thing, they deliver another). For ${businessName}, solving this starts with getting crystal clear on your organizational structure—who reports to whom, what decisions each person can make independently, and how information flows. Our Teams tools help you design this structure, create clear job definitions, and build the communication systems that make teams actually function.`,
      feature: 'Teams',
      featureLink: '/teams',
      icon: 'users',
      priority: 'high',
      category: 'Team'
    })
  }

  if (challenges.includes('Operations') || challenges.includes('Processes')) {
    suggestions.push({
      id: 'ops-1',
      title: 'Stop Reinventing the Wheel Every Day',
      description: 'Operational chaos happens when processes live only in your head',
      explanation: `If you're constantly putting out fires, answering the same questions repeatedly, or finding that things fall through the cracks—you have an operations problem. This is incredibly common, especially for growing businesses. The root cause is usually that your processes aren't documented or systematized. Everything depends on individual knowledge rather than clear systems. For ${businessName}, fixing this means identifying your core processes (the things you do repeatedly), documenting them step-by-step, and creating systems so anyone can follow them consistently. This isn't just about efficiency—it's about reducing stress, enabling growth, and eventually being able to step back from day-to-day operations.`,
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'settings',
      priority: 'high',
      category: 'Operations'
    })
  }

  if (challenges.includes('Leadership') || challenges.includes('Decision making')) {
    suggestions.push({
      id: 'lead-1',
      title: 'Develop Your Leadership Capabilities',
      description: 'Great leaders are made, not born—and it starts with self-awareness',
      explanation: `Leadership challenges often feel personal, but they're actually very common and very solvable. Whether you're struggling with making tough decisions, communicating your vision, or getting buy-in from your team—these are all skills that can be developed. The first step is understanding YOUR leadership style: what are your natural strengths, where do you tend to struggle, and what situations bring out the best or worst in you? Our Leadership tools include assessments and coaching frameworks used by top executives, adapted for entrepreneurs like you. Understanding yourself better is the foundation for leading others more effectively.`,
      feature: 'Leadership',
      featureLink: '/marketplace',
      icon: 'crown',
      priority: 'medium',
      category: 'Leadership'
    })
  }

  // Business stage-based suggestions
  if (businessStage === 'Idea' || businessStage === 'idea') {
    suggestions.push({
      id: 'stage-idea',
      title: 'Validate Before You Build',
      description: 'The biggest risk at your stage is building something nobody wants',
      explanation: `At the idea stage, your most valuable asset is your time and energy—don't waste it building the wrong thing. Most failed startups don't fail because of bad execution; they fail because they built a solution for a problem that either doesn't exist or that people won't pay to solve. Before you invest months (or years) into ${businessName}, you need validation: proof that real people have the problem you're solving and are willing to pay for a solution. Our Bizora AI tools can help you research your market, analyze competitors, and design low-cost experiments to test your assumptions before you commit significant resources.`,
      feature: 'Bizora AI',
      featureLink: '/bizora',
      icon: 'lightbulb',
      priority: 'high',
      category: 'Validation'
    })
  }

  if (businessStage === 'MVP' || businessStage === 'mvp' || businessStage === 'Early Stage') {
    suggestions.push({
      id: 'stage-mvp',
      title: 'Focus on Learning, Not Perfection',
      description: 'Your MVP\'s job is to learn fast, not to impress everyone',
      explanation: `At the MVP stage, speed of learning is everything. Your goal isn't to build a perfect product—it's to figure out what perfect even means for your customers. Every week you spend polishing features that might not matter is a week you could have spent talking to customers and iterating based on real feedback. For ${businessName}, this means launching something minimal but functional, getting it in front of real users, and obsessively collecting feedback. Our Systems tools can help you build a structured approach to customer feedback, rapid iteration, and tracking what's actually working versus what you assumed would work.`,
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'zap',
      priority: 'high',
      category: 'Product'
    })
  }

  if (businessStage === 'Scaling' || businessStage === 'Growth') {
    suggestions.push({
      id: 'stage-scale',
      title: 'Build Infrastructure Before You Break',
      description: 'Scaling without systems is like driving faster without brakes',
      explanation: `Congratulations on getting ${businessName} to the scaling stage—this is where many businesses start to really take off, but it's also where many break. The things that got you here (your personal involvement in everything, ad-hoc decisions, heroic individual efforts) won't get you to the next level. Scaling requires infrastructure: documented processes, clear organizational structure, reliable systems that don't depend on any one person. Our Systems tools help you audit your current operations, identify the bottlenecks that will break at scale, and build the foundational systems you need before growth exposes your weaknesses.`,
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'trending',
      priority: 'high',
      category: 'Scaling'
    })
  }

  // Always add some general suggestions
  suggestions.push({
    id: 'gen-discover',
    title: 'Get Answers to Your Specific Questions',
    description: 'AI-powered insights tailored to your exact situation',
    explanation: `Every business is unique, and sometimes you have questions that don't fit into neat categories. Maybe you're wondering about a specific pricing decision, how to handle a difficult conversation, or whether a particular opportunity is worth pursuing. Our Discover feature lets you ask any business question and get thoughtful, personalized answers based on your industry, stage, and goals. It's like having a business advisor available 24/7 who actually knows your context.`,
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    priority: 'medium',
    category: 'Insights'
  })

  suggestions.push({
    id: 'gen-compete',
    title: 'Understand Your Competitive Landscape',
    description: 'Know what you\'re up against and find your unique edge',
    explanation: `You can't win a game you don't understand. Knowing your competitors isn't about copying them—it's about understanding the landscape well enough to find your unique position. What are others in your space doing well? Where are they falling short? What gaps exist that ${businessName} could fill? Our Competitor Intelligence tools help you map out your competitive landscape, identify opportunities others are missing, and develop positioning that makes you stand out rather than blend in.`,
    feature: 'Competitor Intelligence',
    featureLink: '/discover',
    icon: 'target',
    priority: 'low',
    category: 'Strategy'
  })

  // Sort by priority and limit
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6)
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      const data = loadOnboardingData()
      setOnboardingData(data)
      
      // Check if we have saved recommendations in localStorage
      const savedRecs = localStorage.getItem('homePageRecommendations')
      if (savedRecs) {
        try {
          const parsed = JSON.parse(savedRecs)
          setSuggestions(parsed)
          setIsLoading(false)
          return
        } catch (e) {
          console.error('Error parsing saved recommendations:', e)
        }
      }
      
      // Only generate if we don't have saved recommendations
      try {
        if (data) {
          const response = await fetch('/api/suggestions/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ onboardingData: data }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.recommendations && Array.isArray(result.recommendations)) {
              // Take top 3 for home page
              const top3 = result.recommendations.slice(0, 3)
              setSuggestions(top3)
              // Save to localStorage
              localStorage.setItem('homePageRecommendations', JSON.stringify(top3))
              setIsLoading(false)
              return
            }
          }
        }
      } catch (error) {
        console.error('Error fetching AI recommendations:', error)
      }

      // Fallback to logic-based recommendations if AI fails
      const generatedSuggestions = generateSmartSuggestions(data)
      const top3 = generatedSuggestions.slice(0, 3)
      setSuggestions(top3)
      localStorage.setItem('homePageRecommendations', JSON.stringify(top3))
      setIsLoading(false)
    }

    loadSuggestions()
  }, [])

  const generateMoreRecommendations = async () => {
    if (!onboardingData || isGeneratingMore) return
    
    setIsGeneratingMore(true)
    try {
      const response = await fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboardingData }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.recommendations && Array.isArray(result.recommendations)) {
          // Take top 3 for home page
          const top3 = result.recommendations.slice(0, 3)
          setSuggestions(top3)
          // Save to localStorage
          localStorage.setItem('homePageRecommendations', JSON.stringify(top3))
          setIsGeneratingMore(false)
          return
        }
      }
    } catch (error) {
      console.error('Error generating more recommendations:', error)
    }
    
    // Fallback
    const generatedSuggestions = generateSmartSuggestions(onboardingData)
    const top3 = generatedSuggestions.slice(0, 3)
    setSuggestions(top3)
    localStorage.setItem('homePageRecommendations', JSON.stringify(top3))
    setIsGeneratingMore(false)
  }

  const displayedSuggestions = suggestions.slice(0, 3)

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground mb-1">What You Should Focus On</h3>
          <p className="text-sm text-muted-foreground">
            Generating personalized recommendations...
          </p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">What You Should Focus On</h3>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations based on your challenges and goals
          </p>
        </div>
        <Button
          onClick={generateMoreRecommendations}
          disabled={isGeneratingMore || !onboardingData}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-shrink-0"
        >
          {isGeneratingMore ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate More
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-3 mb-4">
        {displayedSuggestions.map((suggestion) => {
          const Icon = iconMap[suggestion.icon] || Sparkles
          const isExpanded = expandedSuggestion === suggestion.id
          return (
            <div 
              key={suggestion.id} 
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${priorityColors[suggestion.priority]}`}>
                      {suggestion.priority === 'high' ? 'Important' : suggestion.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                  </div>
                  <h4 className="font-semibold text-foreground line-clamp-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                  {!isExpanded && (
                    <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
                      {suggestion.explanation.substring(0, 120)}...
                    </p>
                  )}
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {suggestion.explanation}
                        </p>
                      </div>
                      <Link href={suggestion.featureLink}>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Go to {suggestion.feature}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setExpandedSuggestion(isExpanded ? null : suggestion.id)
                    }}
                    className="flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    <span>{isExpanded ? 'Show less' : 'Learn more'}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View All Button */}
      <div className="flex justify-center">
        <Link href="/suggestions">
          <Button 
            variant="outline" 
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm text-foreground group"
          >
            <span>View All Recommendations</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
