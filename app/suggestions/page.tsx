'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowLeft,
  Sparkles, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Settings,
  BookOpen,
  Zap,
  ChevronRight,
  Crown,
  Filter,
  CheckCircle2,
  Star,
  Rocket,
  Compass,
  Focus,
  Brain,
  Heart,
  Shield,
  Flame,
  RefreshCw
} from 'lucide-react'
import { loadOnboardingData, getUserChallenges, getUserIndustry, getUserBusinessStage } from '@/lib/onboarding-storage'
import { OnboardingData } from '@/components/onboarding/onboarding-types'

interface Suggestion {
  id: string
  title: string
  description: string
  explanation: string
  whyItMatters: string
  howToStart: string[]
  feature: string
  featureLink: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  category: string
  estimatedTime?: string
  impact?: string
}

interface DeepFocusArea {
  id: string
  title: string
  description: string
  explanation: string
  keyQuestions: string[]
  systemsToCreate: string[]
  icon: string
  color: string
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
  'rocket': Rocket,
  'star': Star,
  'compass': Compass,
  'brain': Brain,
  'heart': Heart,
  'shield': Shield,
  'flame': Flame
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
}

const categoryColors: { [key: string]: string } = {
  'Customer Growth': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'Revenue': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Team': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Operations': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Leadership': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Validation': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'Product': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'Scaling': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'Insights': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'Strategy': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'Industry': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'Getting Started': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Growth': 'bg-lime-500/10 text-lime-600 dark:text-lime-400'
}

// Generate deep focus areas based on challenges
function generateDeepFocusAreas(onboardingData: OnboardingData | null): DeepFocusArea[] {
  const areas: DeepFocusArea[] = []
  
  if (!onboardingData) {
    return [{
      id: 'default',
      title: 'Business Foundation',
      description: 'Build the fundamental systems every business needs',
      explanation: 'Before you can grow, you need a solid foundation. This means understanding your market, defining your value proposition, and creating basic operational systems. Many entrepreneurs skip this step and end up building on shaky ground.',
      keyQuestions: [
        'Who exactly is your ideal customer and what problem are you solving for them?',
        'What makes your solution different from alternatives (including doing nothing)?',
        'How will you consistently deliver value to customers?'
      ],
      systemsToCreate: [
        'Customer profile documentation',
        'Value proposition statement',
        'Basic operational checklist'
      ],
      icon: 'shield',
      color: 'from-blue-500 to-indigo-500'
    }]
  }

  const challenges = getUserChallenges(onboardingData)
  const businessName = onboardingData.businessName || 'your business'

  // Helper function to check challenges (case-insensitive, flexible matching)
  const hasChallenge = (searchTerms: string[]): boolean => {
    if (!challenges || challenges.length === 0) return false
    const challengesLower = challenges.map(c => c.toLowerCase().trim())
    return searchTerms.some(term => 
      challengesLower.some(c => c.includes(term.toLowerCase()) || term.toLowerCase().includes(c))
    )
  }

  if (hasChallenge(['finding customers', 'customer', 'marketing', 'acquisition', 'leads', 'sales', 'finding', 'customers'])) {
    areas.push({
      id: 'customer-acquisition',
      title: 'Customer Acquisition Mastery',
      description: `Build a reliable engine for bringing customers to ${businessName}`,
      explanation: `You said finding customers is a challenge, which means this should be your primary focus area. Here's the truth: customer acquisition isn't about trying everything and hoping something sticks. It's about deeply understanding ONE type of customer, finding out exactly where they spend their time and attention, and creating a systematic way to reach them. Most businesses fail at customer acquisition because they're too broad—trying to appeal to everyone means appealing to no one. Your goal should be to become incredibly good at acquiring ONE type of customer through ONE or TWO channels before expanding.`,
      keyQuestions: [
        'Who is the ONE type of customer you can serve better than anyone else?',
        'Where does this person spend time online and offline?',
        'What problem keeps them up at night that you can solve?',
        'What would make them immediately trust you?',
        'How can you reach 100 of these people this month?'
      ],
      systemsToCreate: [
        'Ideal Customer Profile (ICP) document with specific demographics, behaviors, and pain points',
        'Customer acquisition funnel with clear stages and conversion tracking',
        'Content or outreach system that runs weekly',
        'Lead tracking and follow-up process'
      ],
      icon: 'users',
      color: 'from-purple-500 to-pink-500'
    })
  }

  if (hasChallenge(['revenue', 'sales', 'pricing', 'income', 'profit', 'growth'])) {
    areas.push({
      id: 'revenue-growth',
      title: 'Revenue Growth Engine',
      description: 'Break through your revenue ceiling systematically',
      explanation: `Revenue growth is your challenge, so let's get specific about what that actually means. There are only four ways to grow revenue: (1) Get more customers, (2) Increase average transaction value, (3) Increase purchase frequency, (4) Improve retention. Most businesses focus only on #1 and ignore the others, which is actually the hardest and most expensive lever to pull. Before chasing new customers, ask yourself: Are you maximizing the value of customers you already have? Are you priced correctly? Could you offer add-ons or upgrades? The fastest path to revenue growth is usually optimizing what you already have, not adding new channels.`,
      keyQuestions: [
        'What is your current revenue breakdown by product/service?',
        'Are you priced too low? When was the last time you raised prices?',
        'What percentage of customers buy again? How could you increase this?',
        'What could you upsell or cross-sell to existing customers?',
        'Which 20% of your efforts generate 80% of your revenue?'
      ],
      systemsToCreate: [
        'Revenue tracking dashboard with key metrics',
        'Pricing strategy document with competitive analysis',
        'Upsell/cross-sell playbook',
        'Customer retention and reactivation campaigns',
        'Monthly revenue review process'
      ],
      icon: 'dollar',
      color: 'from-green-500 to-emerald-500'
    })
  }

  if (hasChallenge(['team', 'hiring', 'delegation', 'management', 'employees', 'staff'])) {
    areas.push({
      id: 'team-building',
      title: 'Team Building & Leadership',
      description: 'Create a team that amplifies your impact instead of draining your energy',
      explanation: `Team challenges are often the most frustrating because they feel personal. But here's what most entrepreneurs don't realize: 90% of team problems are actually systems problems. When you're constantly frustrated with your team, it's usually because expectations aren't clear, communication channels are broken, or people don't have the resources they need to succeed. The solution isn't finding "better" people—it's creating better systems that set everyone up to win. This means documented roles, clear decision-making authority, regular check-ins with actual agendas, and feedback loops that catch problems early.`,
      keyQuestions: [
        'Can every team member clearly articulate their top 3 priorities this week?',
        'Who has authority to make which decisions without asking you?',
        'How do team members know if they\'re doing a good job?',
        'What information regularly falls through the cracks?',
        'What recurring frustrations do you have with your team?'
      ],
      systemsToCreate: [
        'Role documentation with clear responsibilities and decision authority',
        'Team communication system (what goes where, when)',
        'Weekly/monthly check-in structure with agendas',
        'Performance feedback framework',
        'Hiring and onboarding playbook'
      ],
      icon: 'users',
      color: 'from-blue-500 to-cyan-500'
    })
  }

  if (hasChallenge(['operations', 'processes', 'systems', 'efficiency', 'time management', 'workflow'])) {
    areas.push({
      id: 'operations',
      title: 'Operational Excellence',
      description: 'Build systems that run without your constant involvement',
      explanation: `You're struggling with operations, which means you're probably spending too much time on recurring tasks and putting out fires. This is exhausting and unsustainable. The root cause is almost always the same: processes exist only in your head (or nowhere at all), so every time something needs to happen, it requires your attention. The fix is systematic documentation and delegation. Start with your most frequent tasks—the things you do daily or weekly—and create step-by-step processes that anyone could follow. This isn't about perfection; it's about creating a baseline that can be improved over time.`,
      keyQuestions: [
        'What tasks do you do every day/week that someone else could do with clear instructions?',
        'What questions does your team ask you repeatedly?',
        'Where do things most often fall through the cracks?',
        'What would break if you took a week off?',
        'Which processes cause the most stress or confusion?'
      ],
      systemsToCreate: [
        'Process documentation for your top 10 recurring tasks',
        'Checklist library for common workflows',
        'SOPs (Standard Operating Procedures) for core business functions',
        'Quality control checkpoints',
        'Process improvement feedback loop'
      ],
      icon: 'settings',
      color: 'from-orange-500 to-red-500'
    })
  }

  if (hasChallenge(['leadership', 'decision', 'strategy', 'planning', 'direction'])) {
    areas.push({
      id: 'leadership',
      title: 'Leadership Development',
      description: 'Become the leader your business needs you to be',
      explanation: `Leadership challenges often feel like personal failings, but they're actually skill gaps—and skills can be developed. Whether you're struggling with decision-making, communication, delegation, or handling conflict, these are all learnable capabilities. The key is self-awareness: understanding your natural tendencies, recognizing when they serve you and when they don't, and deliberately practicing new approaches. Great leaders aren't born—they're shaped by intentional effort and honest reflection.`,
      keyQuestions: [
        'What decisions do you avoid making or delay too long?',
        'How do you typically handle disagreement or conflict?',
        'What aspects of leadership feel most unnatural to you?',
        'Who do you admire as a leader and why?',
        'What feedback have you received about your leadership style?'
      ],
      systemsToCreate: [
        'Decision-making framework for different types of decisions',
        'Personal leadership principles document',
        'Weekly reflection practice',
        'Feedback collection system',
        'Learning and development plan'
      ],
      icon: 'crown',
      color: 'from-amber-500 to-orange-500'
    })
  }

  // Add general areas if few specific ones
  if (areas.length < 2) {
    areas.push({
      id: 'strategy',
      title: 'Strategic Clarity',
      description: 'Get crystal clear on where you\'re going and how you\'ll get there',
      explanation: `Many businesses drift without clear direction—working hard but not making real progress toward meaningful goals. Strategic clarity means knowing exactly what you're trying to achieve in the next 90 days, why it matters, and what you're specifically NOT doing. It's about focus, not just vision. When you have strategic clarity, every decision becomes easier because you have a filter: "Does this move us toward our goal, or is it a distraction?"`,
      keyQuestions: [
        'What is the ONE thing that would make the biggest difference in 90 days?',
        'What are you currently doing that you should stop?',
        'What would success look like at the end of this quarter?',
        'What assumptions are you making that might be wrong?',
        'What\'s the biggest risk to your current plan?'
      ],
      systemsToCreate: [
        '90-day strategic plan with specific goals',
        'Weekly priority setting process',
        'Monthly strategy review',
        'Decision filter based on strategic priorities',
        'Risk tracking and mitigation plan'
      ],
      icon: 'compass',
      color: 'from-teal-500 to-cyan-500'
    })
  }

  return areas
}

// Generate 5 main recommendations (highly personalized, based on top challenges)
// IMPORTANT: Each user gets DIFFERENT recommendations based on their:
// - Challenges (finding customers, revenue growth, team management, etc.)
// - Business stage (idea, MVP, scaling, etc.)
// - Industry (tech, e-commerce, services, etc.)
// - Goals (revenue goals, team goals, etc.)
// - Business name, team size, revenue, target market, etc.
// This ensures NO TWO USERS get the same recommendations unless they have identical profiles
function generateMainRecommendations(onboardingData: OnboardingData | null): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  if (!onboardingData) {
    return [
      {
        id: '1',
        title: 'Complete Your Business Profile',
        description: 'Unlock all personalized features',
        explanation: 'Right now, we can only give you generic advice because we don\'t know anything about your specific situation. Your challenges, your industry, your goals—these all matter when it comes to what you should focus on. By completing your profile, you\'re not just filling out forms; you\'re enabling our AI to understand YOUR context and give you recommendations that actually make sense for your situation.',
        whyItMatters: 'Generic advice is everywhere on the internet. What\'s valuable is guidance tailored to YOUR specific business, challenges, and goals. The 5 minutes you spend completing your profile will save you hours of sifting through irrelevant advice.',
        howToStart: [
          'Open the Discover page by clicking on "Discover" in the left sidebar navigation menu',
          'Look for the onboarding questionnaire or profile setup section at the top of the page',
          'Think about what industry your business is in or will be in - be as specific as possible (e.g., "SaaS for small businesses" not just "tech")',
          'Consider what stage you\'re at: Are you at the idea stage, building an MVP, already launched, or scaling?',
          'Identify 2-3 challenges that keep you up at night - these are the problems you most need help solving',
          'Define what success looks like for you in the next year - what would make you feel like you\'ve made real progress?',
          'Click "Save" or "Complete" when you\'re done - don\'t worry about being perfect, you can always update it later'
        ],
        feature: 'Discover',
        featureLink: '/discover',
        icon: 'sparkles',
        priority: 'high',
        category: 'Getting Started',
        estimatedTime: '5 minutes',
        impact: 'Unlocks personalization'
      },
      {
        id: '2',
        title: 'Explore Revenue Tools',
        description: 'Discover AI-powered tools to grow your business revenue',
        explanation: 'Most entrepreneurs leave money on the table without realizing it. Whether it\'s pricing too low, missing upsell opportunities, or not having enough revenue streams, there\'s almost always room to grow. Our Revenue tools help you analyze where your money is coming from, identify what\'s working, and find the gaps you might be missing.',
        whyItMatters: 'Understanding your revenue is the foundation of business growth. These tools help you make data-driven decisions instead of guessing.',
        howToStart: [
          'Click "Revenue" in the left sidebar menu to open the Revenue section',
          'Explore the different revenue tools available - you\'ll see options for pricing, analytics, and optimization',
          'Start with the Revenue Intelligence dashboard to see your current revenue breakdown',
          'Look for patterns in your revenue streams - which are most profitable?',
          'Identify one opportunity to increase revenue this month',
          'Set up tracking for your key revenue metrics',
          'Review your revenue weekly to spot trends early'
        ],
        feature: 'Revenue',
        featureLink: '/revenue',
        icon: 'dollar',
        priority: 'high',
        category: 'Growth',
        estimatedTime: '30 minutes',
        impact: 'Revenue growth'
      },
      {
        id: '3',
        title: 'Build Your First System',
        description: 'Create operational systems to automate and scale your business',
        explanation: 'If your business can\'t run without you handling everything personally, you don\'t have a business—you have a job. Systems are the documented processes and workflows that let your business operate consistently, whether you\'re there or not. This is how you scale, how you hire effectively, and how you eventually get your time back.',
        whyItMatters: 'Systems free up your time and enable growth. Every documented process is one less thing that depends on you personally.',
        howToStart: [
          'Click "Systems" in the left sidebar, or navigate to the Systems section',
          'Go to the "Templates" tab to see pre-built system templates',
          'Choose a template that matches your business type (SaaS Launch, E-commerce Operations, etc.)',
          'Review the template and customize it for your specific needs',
          'Start with one process - document how you do it step-by-step',
          'Test the system by following your own documentation',
          'Refine and improve the system as you use it'
        ],
        feature: 'Systems',
        featureLink: '/revenue?tab=systems',
        icon: 'settings',
        priority: 'high',
        category: 'Operations',
        estimatedTime: '1 hour',
        impact: 'Time savings and scalability'
      },
      {
        id: '4',
        title: 'Get AI-Powered Business Insights',
        description: 'Ask any question and get contextual answers',
        explanation: 'Every business is unique, and sometimes you have questions that don\'t fit into neat categories. Maybe you\'re wondering about a specific pricing decision, how to handle a difficult conversation, or whether a particular opportunity is worth pursuing. Our Discover feature lets you ask any business question and get thoughtful, personalized answers.',
        whyItMatters: 'Having on-demand access to business advice means you\'re never stuck alone with a problem. Use it as a thinking partner for any business challenge.',
        howToStart: [
          'Click "Discover" in the left sidebar menu',
          'Think about a specific challenge or question you have',
          'Type your question in the search or chat box',
          'Be specific and include context about your business',
          'Read the AI\'s response carefully',
          'Ask follow-up questions to go deeper',
          'Use the insights to inform your decisions'
        ],
        feature: 'Discover',
        featureLink: '/discover',
        icon: 'compass',
        priority: 'medium',
        category: 'Insights',
        estimatedTime: 'Anytime',
        impact: 'On-demand guidance'
      },
      {
        id: '5',
        title: 'Explore Leadership Tools',
        description: 'Develop your leadership capabilities with AI-powered coaching',
        explanation: 'Great leaders are made, not born—and it starts with self-awareness. Whether you\'re struggling with making tough decisions, communicating your vision, or getting buy-in from your team—these are all skills that can be developed. Our Leadership tools include assessments and coaching frameworks used by top executives.',
        whyItMatters: 'Leadership skills directly impact your ability to grow your business, build a great team, and make better decisions.',
        howToStart: [
          'Click "Leadership" in the left sidebar menu, or go to the Marketplace section',
          'Explore the leadership assessments and tools available',
          'Take a leadership style assessment to understand your natural strengths',
          'Review personalized coaching recommendations based on your results',
          'Access leadership frameworks and decision-making tools',
          'Practice new leadership approaches in low-stakes situations',
          'Review your progress monthly and adjust your approach'
        ],
        feature: 'Leadership',
        featureLink: '/marketplace',
        icon: 'crown',
        priority: 'medium',
        category: 'Leadership',
        estimatedTime: '30 minutes',
        impact: 'Better leadership skills'
      }
    ]
  }

  const challenges = getUserChallenges(onboardingData)
  const businessStage = getUserBusinessStage(onboardingData)
  const industry = getUserIndustry(onboardingData)
  const businessName = onboardingData.businessName || 'your business'
  const name = onboardingData.name || ''
  const biggestGoal = Array.isArray(onboardingData.biggestGoal) 
    ? onboardingData.biggestGoal[0] 
    : onboardingData.biggestGoal
  const revenueGoal = Array.isArray(onboardingData.revenueGoal) 
    ? onboardingData.revenueGoal[0] 
    : onboardingData.revenueGoal
  const teamSize = Array.isArray(onboardingData.teamSize) 
    ? onboardingData.teamSize[0] 
    : onboardingData.teamSize
  const monthlyRevenue = Array.isArray(onboardingData.monthlyRevenue) 
    ? onboardingData.monthlyRevenue[0] 
    : onboardingData.monthlyRevenue
  const targetMarket = Array.isArray(onboardingData.targetMarket) 
    ? onboardingData.targetMarket[0] 
    : onboardingData.targetMarket
  const customerAcquisition = Array.isArray(onboardingData.customerAcquisition) 
    ? onboardingData.customerAcquisition[0] 
    : onboardingData.customerAcquisition
  const primaryRevenue = Array.isArray(onboardingData.primaryRevenue) 
    ? onboardingData.primaryRevenue[0] 
    : onboardingData.primaryRevenue
  const growthStrategy = Array.isArray(onboardingData.growthStrategy) 
    ? onboardingData.growthStrategy[0] 
    : onboardingData.growthStrategy
  const keyMetrics = Array.isArray(onboardingData.keyMetrics) 
    ? onboardingData.keyMetrics[0] 
    : onboardingData.keyMetrics

  // Helper function to check challenges (case-insensitive, flexible matching)
  const hasChallenge = (searchTerms: string[]): boolean => {
    if (!challenges || challenges.length === 0) return false
    const challengesLower = challenges.map(c => c.toLowerCase().trim())
    return searchTerms.some(term => 
      challengesLower.some(c => c.includes(term.toLowerCase()) || term.toLowerCase().includes(c))
    )
  }

  // Helper to check if value matches (case-insensitive)
  const matches = (value: string | undefined, searchTerms: string[]): boolean => {
    if (!value) return false
    const valueLower = value.toLowerCase().trim()
    return searchTerms.some(term => valueLower.includes(term.toLowerCase()) || term.toLowerCase().includes(valueLower))
  }

  // Challenge-based suggestions - Only add top priority ones for main recommendations
  // Prioritize by: 1) Challenges mentioned, 2) Business stage, 3) Goals
  
  if (hasChallenge(['finding customers', 'customer', 'marketing', 'acquisition', 'leads', 'sales', 'finding', 'customers'])) {
    const industryContext = industry ? ` in the ${industry} industry` : ''
    const marketContext = targetMarket ? ` targeting ${targetMarket}` : ''
    
    suggestions.push({
      id: 'cust-1',
      title: `Define Your Ideal Customer for ${businessName}${industryContext ? ` in ${industry}` : ''}`,
      description: `Get crystal clear on who you serve best${marketContext ? marketContext : ''}`,
      explanation: `Finding customers starts with knowing EXACTLY who you're looking for. Most businesses make the mistake of targeting "anyone who might buy"—but this scattershot approach wastes time and money. Your ideal customer isn't just a demographic; it's a specific type of person with specific problems, behaviors, and characteristics. For ${businessName}${industryContext ? ` in ${industry}` : ''}${marketContext ? marketContext : ''}, when you nail this, everything else (messaging, channels, pricing) becomes much clearer.`,
      whyItMatters: `For ${businessName}, having a clear ideal customer profile means you can stop chasing everyone and start attracting the right people. You'll know where to find them, what to say to them, and why they should choose you over alternatives. This is especially important${industryContext ? ` in ${industry}` : ''} where competition can be fierce.`,
      howToStart: [
        `First, open the Revenue section by clicking "Revenue" in the left sidebar menu. This is where you'll build your customer profile.`,
        `Think about your best customers (or who you WANT to serve). If you don't have customers yet, think about who would benefit most from what ${businessName} offers.`,
        `Write down what they have in common beyond basic demographics - what problems do they face? What keeps them up at night? What do they value?`,
        `Consider their behaviors: Where do they spend time online? What publications do they read? What events do they attend? What social media platforms do they use?`,
        `Identify their biggest pain points and desires related to your business. Be specific - not just "they want to save money" but "they struggle with X and need Y solution."`,
        `Map where they spend time and attention - this tells you where to reach them. For example, if they're on LinkedIn daily, that's where you should focus.`,
        `Document all of this in the Revenue section. Create a document called "Ideal Customer Profile" and save it. You can always refine it later as you learn more.`,
        `Review this profile weekly for the first month - you'll likely discover new insights as you talk to more people.`
      ],
      feature: 'Revenue',
      featureLink: '/revenue',
      icon: 'users',
      priority: 'high',
      category: 'Customer Growth',
      estimatedTime: '45 minutes',
      impact: 'Foundation for all marketing'
    })
    
  }

  if (hasChallenge(['revenue', 'sales', 'pricing', 'income', 'profit', 'growth'])) {
    const revenueContext = monthlyRevenue ? ` You're currently generating ${monthlyRevenue} monthly` : ''
    const goalContext = revenueGoal ? `, and your goal is ${revenueGoal}` : ''
    
    suggestions.push({
      id: 'rev-1',
      title: `Audit Your Revenue Model for ${businessName}${revenueContext ? revenueContext : ''}${goalContext ? goalContext : ''}`,
      description: 'Understand where your money comes from and where it could come from',
      explanation: `Before you can grow revenue, you need to understand your current revenue deeply. Where does each dollar come from? Which products, services, or customers are most profitable? What's your average deal size? How long do customers stay? For ${businessName}${revenueContext ? revenueContext : ''}${goalContext ? goalContext : ''}, this isn't just bookkeeping—it's the foundation for making smart growth decisions.`,
      whyItMatters: `Many businesses chase new revenue streams while leaving money on the table in existing ones. For ${businessName}, understanding your revenue model often reveals quick wins you're currently missing. This is especially important if you're trying to reach ${revenueGoal ? revenueGoal : 'your revenue goals'}.`,
      howToStart: [
        `Open the Revenue Intelligence page by clicking "Revenue Intelligence" in the left sidebar, or navigate to /revenue-intelligence in your browser.`,
        `Gather your financial data: Look at your bank statements, invoices, and any accounting software you use. You'll need at least the last 3 months of data.`,
        `List all your revenue streams and calculate what percentage each represents. For example: "Product sales: 60%, Service fees: 30%, Consulting: 10%". Write this down in the Revenue Intelligence section.`,
        `Calculate profit margin for each stream (not just revenue). To do this: (Revenue - Costs) / Revenue × 100. This shows you which streams are actually profitable, not just which bring in the most money.`,
        `Identify your most valuable customers: Who pays the most? Who stays the longest? Who refers others? Create a list of your top 10 customers and note what makes them valuable.`,
        `Find patterns: Do certain customers buy at certain times? Do they buy multiple products? Are there seasonal trends? Look for patterns in your Revenue Intelligence dashboard.`,
        `Look for pricing or packaging opportunities: Could you bundle products? Could you offer a premium tier? Could you charge more for your most valuable service?`,
        `Document your findings in the Revenue Intelligence section. Create a summary document that you can review monthly.`
      ],
      feature: 'Revenue Intelligence',
      featureLink: '/revenue-intelligence',
      icon: 'dollar',
      priority: 'high',
      category: 'Revenue',
      estimatedTime: '1-2 hours',
      impact: 'Data-driven growth decisions'
    })
  }

  if (hasChallenge(['team', 'hiring', 'delegation', 'management', 'employees', 'staff'])) {
    const teamContext = teamSize ? ` with your ${teamSize}-person team` : ''
    
    suggestions.push({
      id: 'team-1',
      title: `Document Every Role Clearly at ${businessName}${teamContext ? teamContext : ''}`,
      description: 'Eliminate ambiguity about who owns what',
      explanation: `Most team friction comes from unclear expectations. When people don't know exactly what they're responsible for, what decisions they can make, and how success is measured—conflict and dropped balls are inevitable. For ${businessName}${teamContext ? teamContext : ''}, clear role documentation isn't bureaucracy; it's clarity that enables autonomy.`,
      whyItMatters: `For ${businessName}, clear roles mean less time spent clarifying, less finger-pointing when things go wrong, and more confident team members who know what's expected. This is especially important${teamContext ? ` with ${teamSize} people` : ''} where communication can break down easily.`,
      howToStart: [
        `Open the Teams section by clicking "Teams" in the left sidebar menu. This is where you'll document all your roles.`,
        `Start with your own role first (even if you're the only one). Write down your top 5 responsibilities. Be specific - not just "handle sales" but "respond to all sales inquiries within 24 hours, qualify leads, send proposals, and close deals."`,
        `For each role, define what decisions that person can make independently without asking you. For example: "Can approve expenses up to $500" or "Can make changes to the website without approval." This prevents bottlenecks.`,
        `Specify what success looks like for each role. Make it measurable where possible. Instead of "do good work," say "complete 5 client projects per month with 90%+ satisfaction rating."`,
        `Clarify who each person collaborates with and how. For example: "Works with the marketing team weekly on content, reports to the CEO monthly."`,
        `Use the Teams section to create role documents. You can use the templates provided or create your own. Save each role as a separate document.`,
        `Schedule a meeting with each team member (or yourself if solo) to review their role document. Ask: "Does this match what you think your role is? What's missing? What would you change?"`,
        `Update the documents based on feedback. This should be a living document that evolves as your team grows.`,
        `Review and update role documents quarterly - roles change as the business grows.`
      ],
      feature: 'Teams',
      featureLink: '/teams',
      icon: 'users',
      priority: 'high',
      category: 'Team',
      estimatedTime: '30 min per role',
      impact: 'Less confusion, more ownership'
    })
  }

  if (hasChallenge(['operations', 'processes', 'systems', 'efficiency', 'time management', 'workflow'])) {
    suggestions.push({
      id: 'ops-1',
      title: `Document Your Core Processes for ${businessName}`,
      description: 'Get repeatable tasks out of your head and into systems',
      explanation: `Every time you do something repeatedly without a documented process, you're reinventing the wheel. Worse, the process lives only in your head, making it impossible to delegate or improve systematically. For ${businessName}${industry ? ` in ${industry}` : ''}, documentation isn't about creating bureaucracy—it's about creating leverage.`,
      whyItMatters: `For ${businessName}, documented processes mean you can delegate confidently, onboard new team members quickly, and improve operations systematically instead of randomly. This is especially valuable${industry ? ` in ${industry}` : ''} where consistency matters.`,
      howToStart: [
        `Open the Systems section by clicking "Systems" in the left sidebar, then click on the "Templates" tab. You can also navigate directly to /revenue?tab=systems.`,
        `For the next week, keep a simple log of everything you do. Just write down tasks as you do them - don't overthink it. You can use a notebook, a notes app, or a simple spreadsheet.`,
        `At the end of the week, review your log and identify the top 5 most time-consuming recurring tasks. These are the ones you do weekly or daily that take significant time.`,
        `Pick ONE process to document first (don't try to do all 5 at once). Choose the one that would save you the most time if someone else could do it.`,
        `Write step-by-step instructions as if you're teaching a complete beginner. Assume they know nothing. Include every single step, no matter how obvious it seems. For example, if the process involves logging into a system, include the URL, username format, and where to find the password.`,
        `Include common problems and how to handle them. For example: "If you get an error message saying X, do Y. If the system is slow, try Z first."`,
        `Add screenshots or screen recordings if helpful. Many people learn better visually, especially for software processes.`,
        `Save this in the Systems section under "Documentation". Create a new document and name it clearly, like "How to Process Customer Orders" or "Weekly Marketing Checklist".`,
        `Test your documentation: Ask someone (or yourself in a week) to follow it without your help. If they get stuck, your documentation needs more detail.`,
        `Update the process as you discover better ways to do things. Documentation should evolve, not be set in stone.`
      ],
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'settings',
      priority: 'high',
      category: 'Operations',
      estimatedTime: '1 hour per process',
      impact: 'Delegation-ready operations'
    })
  }

  if (hasChallenge(['leadership', 'decision', 'strategy', 'planning', 'direction'])) {
    suggestions.push({
      id: 'lead-1',
      title: `Create a Decision-Making Framework for ${businessName}`,
      description: 'Stop agonizing over decisions and start making them confidently',
      explanation: `Decision fatigue is real, and many entrepreneurs burn mental energy on decisions that could be made faster with clear frameworks. For ${businessName}${name ? `, ${name}` : ''}, not every decision needs deep analysis—but you need to know which ones do and which ones don't. A good framework helps you make routine decisions quickly and reserve your mental energy for the ones that really matter.`,
      whyItMatters: `For ${businessName}, faster decisions mean faster progress. A clear framework also helps you explain your thinking to others${teamSize ? ` and your ${teamSize}-person team` : ''} and build a team that can make good decisions without you.`,
      howToStart: [
        `Open the Leadership section by clicking "Leadership" in the left sidebar menu, or navigate to /marketplace.`,
        `Categorize decisions into two types: reversible (you can change your mind later) and irreversible (hard to undo). Reversible decisions should be made quickly - don't overthink them.`,
        `Set dollar/time thresholds for different approval levels. For example: "I can spend up to $500 without thinking. $500-$2000 needs 24 hours of consideration. Over $2000 needs a week and input from others." Write these thresholds down.`,
        `Define your core values that guide value-based decisions. What matters most to ${businessName}? Quality over speed? Customer satisfaction over profit? Write down 3-5 core values.`,
        `Create a simple checklist for recurring decision types. For example, when hiring: "1) Can they do the job? 2) Do they fit our culture? 3) Can we afford them? 4) Do they want to grow with us?"`,
        `Use the Leadership section to document your decision framework. Create a document called "Decision-Making Framework" and save it where you can reference it easily.`,
        `Practice making reversible decisions faster. When you catch yourself overthinking a small decision, remind yourself: "This is reversible, I'll just decide and move on."`,
        `Review your framework monthly for the first 3 months - you'll likely refine it as you use it.`,
        `Share your framework with your team${teamSize ? ` (if you have ${teamSize} people)` : ''} so they understand how decisions are made and can make some independently.`
      ],
      feature: 'Leadership',
      featureLink: '/marketplace',
      icon: 'crown',
      priority: 'medium',
      category: 'Leadership',
      estimatedTime: '1 hour',
      impact: 'Faster, more confident decisions'
    })
  }

  // Business stage suggestions - check stage more flexibly
  const stageLower = businessStage?.toLowerCase() || ''
  if (suggestions.length < 3 && (stageLower.includes('idea') || stageLower.includes('planning') || stageLower.includes('starting'))) {
    suggestions.push({
      id: 'stage-1',
      title: `Validate ${businessName} Before You Build`,
      description: 'Make sure people actually want what you\'re planning to create',
      explanation: `The graveyard of startups is full of beautiful products nobody wanted. Validation isn't about asking friends if your idea is good (they'll always say yes). It's about finding evidence that real people have the problem you're solving AND are willing to pay for a solution. For ${businessName}${industry ? ` in ${industry}` : ''}, this might feel like it slows you down, but it actually saves you from wasting months or years on the wrong thing.`,
      whyItMatters: `For ${businessName}, validation now could save you countless hours and dollars later. It's much easier to pivot an idea than to pivot a built product. This is especially important${industry ? ` in ${industry}` : ''} where competition can be fierce.`,
      howToStart: [
        `Open Bizora AI by clicking "Bizora AI" in the left sidebar menu, or navigate to /bizora. This tool will help you research and validate your idea.`,
        `Define the specific problem you're solving. Be very clear: "I'm solving [specific problem] for [specific type of person]." Write this down in Bizora AI.`,
        `Use Bizora AI to research your market. Ask it questions like: "What are the biggest challenges in [your industry]?" or "Who are the main competitors for [your solution]?"`,
        `Create a list of 20 potential customers. These should be people who have the problem you're solving, not friends or family. You can find them on LinkedIn, in Facebook groups, at industry events, or through your network.`,
        `Reach out to 10+ of them. Send a simple message: "Hi [Name], I'm working on a solution for [problem]. Would you be open to a 15-minute conversation about your experience with this?"`,
        `In your conversations, ask about their current solutions and frustrations. Don't pitch your idea yet - just listen. Questions like: "How do you currently handle [problem]?" and "What's the most frustrating part?"`,
        `Test willingness to pay, not just interest. Ask: "If there was a solution that [solved their problem], how much would that be worth to you?" or "Would you pay $X for this?"`,
        `Look for patterns in what you hear. Do 5+ people mention the same pain point? That's validation. Do they all say "I'd never pay for that"? That's a red flag.`,
        `Document your findings in Bizora AI. Create a validation report with: problems mentioned, current solutions, willingness to pay, and patterns you noticed.`,
        `Make a decision: If 5+ people have the problem AND are willing to pay, proceed. If not, pivot your idea based on what you learned.`
      ],
      feature: 'Bizora AI',
      featureLink: '/bizora',
      icon: 'lightbulb',
      priority: 'high',
      category: 'Validation',
      estimatedTime: '1-2 weeks',
      impact: 'Avoid building wrong thing'
    })
  }

  if (suggestions.length < 3 && (stageLower.includes('scaling') || stageLower.includes('growth') || stageLower.includes('established') || stageLower.includes('expanding'))) {
    suggestions.push({
      id: 'stage-scale',
      title: `Build Infrastructure Before ${businessName} Breaks`,
      description: 'Create systems that can handle 10x growth',
      explanation: `Growth exposes every weakness in your business. Things that worked when you were small—heroic individual efforts, ad-hoc processes, your personal involvement in everything—will break under pressure. For ${businessName}${industry ? ` in ${industry}` : ''}${teamSize ? ` with ${teamSize} people` : ''}, the time to build scalable systems is before you need them desperately, not after things start falling apart.`,
      whyItMatters: `For ${businessName} at your growth stage, the biggest risk isn't lack of demand—it's operational collapse. Building systems now lets you grow confidently instead of anxiously.`,
      howToStart: [
        `Open the Systems section by clicking "Systems" in the left sidebar, then go to the "Templates" tab. You can also navigate to /revenue?tab=systems.`,
        `Identify what would break if demand doubled tomorrow. Think about: Can your current systems handle 2x customers? 2x orders? 2x support requests? Make a list of potential breaking points.`,
        `Document your critical processes end-to-end. Start with the processes that directly impact customers: order fulfillment, customer support, product delivery. Use the Systems documentation feature.`,
        `Remove yourself as a bottleneck. Ask: "What requires my personal involvement that shouldn't?" For each one, create a system or delegate it. Use the Systems templates to create delegation-ready processes.`,
        `Build redundancy into key roles and systems. If one person is the only one who knows how to do X, that's a risk. Document their process and train at least one backup person.`,
        `Create dashboards to spot problems early. In the Systems Health Dashboard, set up monitoring for key metrics: order volume, response times, error rates. Check this weekly.`,
        `Test your systems under pressure. Simulate a busy period: What if you got 10x the normal number of orders? Where would things break? Fix those points before they become real problems.`,
        `Review and update systems monthly. As you grow, your systems need to evolve. What worked for 10 customers might not work for 100.`,
        `Celebrate when systems work without you. The goal is to build a business that runs smoothly even when you're not there.`
      ],
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'trending',
      priority: 'high',
      category: 'Scaling',
      estimatedTime: 'Ongoing',
      impact: 'Sustainable growth'
    })
  }

  // Fill up to 5 recommendations with general ones if needed
  const generalRecommendations: Suggestion[] = [
    {
      id: 'gen-1',
      title: `Get AI-Powered Insights for ${businessName}`,
      description: 'Ask any question and get contextual answers',
      explanation: `Sometimes you have specific questions that don't fit into categories. You might be wondering about a particular situation, a decision you're facing, or just need a thought partner. For ${businessName}${industry ? ` in ${industry}` : ''}, our AI understands your business context and can provide relevant insights tailored to your situation.`,
      whyItMatters: `For ${businessName}, having on-demand access to contextual business advice means you're never stuck alone with a problem. Use it as a thinking partner for any business challenge.`,
      howToStart: [
        `Open the Discover page by clicking "Discover" in the left sidebar menu, or navigate to /discover.`,
        `Think about a specific challenge or question you have related to ${businessName}. It could be about pricing, marketing, operations, hiring, or anything else.`,
        `Type your question in the search or chat box. Ask it as you would ask a knowledgeable mentor - be specific and include context about your business.`,
        `Provide context for better answers. Mention your industry${industry ? ` (${industry})` : ''}, your stage${businessStage ? ` (${businessStage})` : ''}, and any relevant details. The more context you give, the better the advice.`,
        `Read the AI's response carefully. It will give you personalized recommendations based on your situation.`,
        `Ask follow-up questions to go deeper. You can ask things like "Can you explain that more?" or "What would that look like for my business?"`,
        `Use the insights to inform your decisions. Take notes on what resonates with you and create action items.`,
        `Come back anytime you have a question. This is available 24/7, so use it whenever you need guidance.`
      ],
      feature: 'Discover',
      featureLink: '/discover',
      icon: 'compass',
      priority: 'medium' as const,
      category: 'Insights',
      estimatedTime: 'Anytime',
      impact: 'On-demand guidance'
    },
    {
      id: 'gen-2',
      title: `Build Systems for ${businessName}`,
      description: 'Document your processes to scale efficiently',
      explanation: `Every time you do something repeatedly without a documented process, you're reinventing the wheel. For ${businessName}${industry ? ` in ${industry}` : ''}, documented processes mean you can delegate confidently, onboard new team members quickly, and improve operations systematically.`,
      whyItMatters: `For ${businessName}, each documented process is one less thing that lives only in your head. Over time, this builds into a business that can run without you being involved in every detail.`,
      howToStart: [
        `Open the Systems section by clicking "Systems" in the left sidebar, then go to the "Templates" tab.`,
        `Pick ONE process to document today - choose something you do at least weekly.`,
        `Do the process once while taking notes - write down every step, no matter how small.`,
        `Write it up in simple language as if explaining to someone who's never done it before.`,
        `Add screenshots if the process involves using software.`,
        `Save it in the Systems section with a clear name.`,
        `Test it tomorrow by following your own documentation.`,
        `Pick another process tomorrow - just one per day.`
      ],
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'settings',
      priority: 'medium' as const,
      category: 'Operations',
      estimatedTime: '20 minutes',
      impact: 'Building systems gradually'
    },
    {
      id: 'gen-3',
      title: `Analyze Your Revenue for ${businessName}`,
      description: 'Understand where your money comes from and where it could come from',
      explanation: `Before you can grow revenue, you need to understand your current revenue deeply. For ${businessName}${industry ? ` in ${industry}` : ''}, this means analyzing where each dollar comes from, which products or services are most profitable, and identifying growth opportunities.`,
      whyItMatters: `Many businesses chase new revenue streams while leaving money on the table in existing ones. For ${businessName}, understanding your revenue model often reveals quick wins you're currently missing.`,
      howToStart: [
        `Open the Revenue Intelligence page by clicking "Revenue Intelligence" in the left sidebar.`,
        `Gather your financial data from the last 3 months - bank statements, invoices, accounting software.`,
        `List all your revenue streams and calculate what percentage each represents.`,
        `Calculate profit margin for each stream (not just revenue).`,
        `Identify your most valuable customers - who pays the most? Who stays the longest?`,
        `Find patterns in your revenue - seasonal trends, customer behaviors, etc.`,
        `Look for pricing or packaging opportunities.`,
        `Document your findings and review monthly.`
      ],
      feature: 'Revenue Intelligence',
      featureLink: '/revenue-intelligence',
      icon: 'dollar',
      priority: 'medium' as const,
      category: 'Revenue',
      estimatedTime: '1-2 hours',
      impact: 'Data-driven growth decisions'
    },
    {
      id: 'gen-4',
      title: `Understand Your Competition`,
      description: 'Know what you\'re up against to find your unique edge',
      explanation: `You can't win a game you don't understand. Knowing your competitors isn't about copying them—it's about understanding the landscape well enough to find your unique position. For ${businessName}${industry ? ` in ${industry}` : ''}, competitive intelligence helps you avoid me-too positioning and find the angles where you can genuinely win.`,
      whyItMatters: `For ${businessName}, competitive analysis helps you identify opportunities others are missing and develop positioning that makes you stand out rather than blend in.`,
      howToStart: [
        `Open the Discover page and use the Competitor Intelligence features.`,
        `List direct and indirect competitors - who else solves the same problem?`,
        `Analyze their strengths and weaknesses - what do they do well? Where do they fall short?`,
        `Read their customer reviews for insights - what do customers love? What do they complain about?`,
        `Identify gaps they're not filling - what needs are going unmet?`,
        `Define your unique positioning - how are you different? Why should customers choose you?`,
        `Create a competitive analysis document and review it quarterly.`
      ],
      feature: 'Competitor Intelligence',
      featureLink: '/discover',
      icon: 'target',
      priority: 'low' as const,
      category: 'Strategy',
      estimatedTime: '2-3 hours',
      impact: 'Strategic clarity'
    }
  ]

  // Add general recommendations until we have 5
  let genIndex = 0
  while (suggestions.length < 5 && genIndex < generalRecommendations.length) {
    // Check if we already have this recommendation
    const existingIds = suggestions.map(s => s.id)
    if (!existingIds.includes(generalRecommendations[genIndex].id)) {
      suggestions.push(generalRecommendations[genIndex])
    }
    genIndex++
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5)
}

// Generate 4-5 daily recommendations (changes based on date)
function generateDailyRecommendations(onboardingData: OnboardingData | null, date: Date): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  if (!onboardingData) {
    return []
  }

  // Use date as seed for consistent daily recommendations
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const seed = dayOfYear % 7 // Rotate through 7 different sets
  
  const challenges = getUserChallenges(onboardingData)
  const businessStage = getUserBusinessStage(onboardingData)
  const industry = getUserIndustry(onboardingData)
  const businessName = onboardingData.businessName || 'your business'
  const name = onboardingData.name || ''
  const biggestGoal = Array.isArray(onboardingData.biggestGoal) 
    ? onboardingData.biggestGoal[0] 
    : onboardingData.biggestGoal

  // Helper function to check challenges (case-insensitive, flexible matching)
  const hasChallenge = (searchTerms: string[]): boolean => {
    if (!challenges || challenges.length === 0) return false
    const challengesLower = challenges.map(c => c.toLowerCase().trim())
    return searchTerms.some(term => 
      challengesLower.some(c => c.includes(term.toLowerCase()) || term.toLowerCase().includes(c))
    )
  }

  // Daily action items based on challenges and stage
  const dailyActions: Suggestion[] = []

  if (hasChallenge(['finding customers', 'customer', 'marketing', 'acquisition', 'leads', 'sales'])) {
    dailyActions.push({
      id: 'daily-cust-1',
      title: `Reach Out to 3 Potential Customers Today`,
      description: `Build your customer pipeline for ${businessName}`,
      explanation: `Customer acquisition is a daily activity, not a one-time event. For ${businessName}, reaching out to just 3 potential customers today might seem small, but if you do this every day, that's 90 conversations per month. Each conversation teaches you something about your market and moves you closer to your next customer.`,
      whyItMatters: `Consistency beats intensity. For ${businessName}, doing a little bit of customer outreach every day is more effective than doing a lot once a month. It keeps you in touch with your market and builds momentum.`,
      howToStart: [
        `Open your email or LinkedIn. You'll be reaching out to potential customers today.`,
        `Find 3 people who match your ideal customer profile. You can search on LinkedIn using keywords related to your industry${industry ? ` (${industry})` : ''}, join relevant Facebook groups, or use your existing network.`,
        `Craft a simple, personal message. Don't use a template - make it genuine. Example: "Hi [Name], I noticed you [something specific about them]. I'm working on [brief description of what you do]. Would you be open to a quick 10-minute conversation about [specific problem you solve]?"`,
        `Send all 3 messages. Don't overthink them - just send them. The goal is to start conversations, not to be perfect.`,
        `Track who you reached out to. You can use a simple spreadsheet or the Revenue section to keep track. Note: name, date contacted, response (if any).`,
        `Follow up in 3-5 days if you don't hear back. A simple "Just wanted to make sure you saw this" message often gets responses.`,
        `Do this again tomorrow. Make it a daily habit - even if it's just 1-2 people on busy days.`
      ],
      feature: 'Revenue',
      featureLink: '/revenue',
      icon: 'users',
      priority: 'high',
      category: 'Customer Growth',
      estimatedTime: '15 minutes',
      impact: 'Consistent pipeline building'
    })
  }

  if (hasChallenge(['revenue', 'sales', 'pricing', 'income', 'profit', 'growth'])) {
    dailyActions.push({
      id: 'daily-rev-1',
      title: `Review Your Revenue Metrics Today`,
      description: `Understand what's driving revenue for ${businessName}`,
      explanation: `You can't improve what you don't measure. For ${businessName}, taking just 10 minutes today to review your revenue metrics will help you spot trends, identify opportunities, and catch problems early. This daily habit compounds into much better financial decisions over time.`,
      whyItMatters: `For ${businessName}, regular revenue reviews help you make data-driven decisions instead of guessing. You'll notice patterns you might miss if you only check monthly.`,
      howToStart: [
        `Open the Revenue Intelligence section by clicking "Revenue Intelligence" in the left sidebar, or navigate to /revenue-intelligence.`,
        `Look at your revenue for the last 7 days. How does it compare to the week before? Is it trending up, down, or flat?`,
        `Identify your top revenue source. What product, service, or customer type is bringing in the most money?`,
        `Check your conversion rates. If you're tracking leads, how many are converting to customers? Is this better or worse than last week?`,
        `Look for one quick win. Is there a revenue stream you could optimize? A customer you could upsell? A price you could adjust?`,
        `Write down one insight. Just one thing you learned from this review. It could be: "Our email campaigns are working well" or "We need to focus on retention."`,
        `Set one action item for tomorrow based on what you learned. For example: "Follow up with 3 customers who haven't purchased in 30 days."`,
        `Do this review every day (or at least 3x per week). It only takes 10 minutes but keeps you connected to your business's financial health.`
      ],
      feature: 'Revenue Intelligence',
      featureLink: '/revenue-intelligence',
      icon: 'dollar',
      priority: 'high',
      category: 'Revenue',
      estimatedTime: '10 minutes',
      impact: 'Better financial awareness'
    })
  }

  if (hasChallenge(['operations', 'processes', 'systems', 'efficiency', 'time management', 'workflow'])) {
    dailyActions.push({
      id: 'daily-ops-1',
      title: `Document One Process Today`,
      description: `Build your systems library for ${businessName}`,
      explanation: `Documenting processes doesn't have to be overwhelming. For ${businessName}, just documenting ONE process today is progress. If you do this 3-4 times per week, you'll have a complete systems library in a month. Start with the process you do most often or the one that causes the most confusion.`,
      whyItMatters: `For ${businessName}, each documented process is one less thing that lives only in your head. Over time, this builds into a business that can run without you being involved in every detail.`,
      howToStart: [
        `Open the Systems section by clicking "Systems" in the left sidebar, then go to the "Documentation" tab. Navigate to /revenue?tab=systems if needed.`,
        `Pick ONE process to document today. Choose something you do at least weekly - it could be "How to process a customer order" or "How to respond to a support ticket" or "How to create a social media post."`,
        `Do the process once while taking notes. As you do it, write down every step, no matter how small. Don't worry about perfect formatting - just capture the steps.`,
        `Write it up in simple language. Use the Systems documentation feature. Write as if you're explaining it to someone who's never done it before. Include: what to do, when to do it, where to find things, and what to do if something goes wrong.`,
        `Add screenshots if helpful. If the process involves using software, take a screenshot of each key step. Many people learn better visually.`,
        `Save it in the Systems section. Give it a clear name like "How to [Process Name]" and save it.`,
        `Test it tomorrow. Try following your own documentation. Did you miss any steps? Update it if needed.`,
        `Pick another process tomorrow. Just one per day - this is a marathon, not a sprint.`
      ],
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'settings',
      priority: 'medium',
      category: 'Operations',
      estimatedTime: '20 minutes',
      impact: 'Building systems gradually'
    })
  }

  const stageLower = businessStage?.toLowerCase() || ''
  if (stageLower.includes('idea') || stageLower.includes('planning') || stageLower.includes('starting')) {
    dailyActions.push({
      id: 'daily-idea-1',
      title: `Talk to One Potential Customer Today`,
      description: `Validate ${businessName} through real conversations`,
      explanation: `Validation happens one conversation at a time. For ${businessName}, talking to just one potential customer today teaches you something you didn't know yesterday. These small daily conversations compound into deep market understanding over time.`,
      whyItMatters: `For ${businessName} at the idea stage, every customer conversation is data. The more conversations you have, the clearer it becomes whether you're solving a real problem that people will pay for.`,
      howToStart: [
        `Find one person who might have the problem you're solving. This could be someone from LinkedIn, a Facebook group, your network, or even someone you meet at a coffee shop.`,
        `Reach out with a simple message: "Hi [Name], I'm working on [brief description]. Would you be open to a quick 10-minute chat about your experience with [problem]?"`,
        `Schedule a 10-15 minute call. Keep it short - people are more likely to say yes to a 10-minute call than a 30-minute one.`,
        `Prepare 3-4 questions: "How do you currently handle [problem]?" "What's the most frustrating part?" "What would a solution look like to you?" "Would you pay for that?"`,
        `Listen more than you talk. Don't pitch your idea - just learn about their experience. Take notes.`,
        `After the call, write down 3 things you learned. What surprised you? What patterns did you notice? What would you change about your idea?`,
        `Use Bizora AI to document your findings. Open /bizora and add notes about what you learned.`,
        `Do this again tomorrow with a different person. One conversation per day = 30 conversations per month = deep market understanding.`
      ],
      feature: 'Bizora AI',
      featureLink: '/bizora',
      icon: 'lightbulb',
      priority: 'high',
      category: 'Validation',
      estimatedTime: '20 minutes',
      impact: 'Daily validation'
    })
  }

  // Add some general daily actions
  dailyActions.push({
    id: 'daily-gen-1',
    title: `Ask One Business Question in Discover`,
    description: `Get AI guidance on a specific challenge for ${businessName}`,
    explanation: `Every day brings new questions and challenges. For ${businessName}, using the Discover feature to ask one specific question today helps you get unstuck, learn something new, or validate a decision. It's like having a business advisor available 24/7.`,
    whyItMatters: `For ${businessName}, small daily learning compounds into significant growth over time. Asking one question per day means 365 new insights per year.`,
    howToStart: [
      `Open the Discover page by clicking "Discover" in the left sidebar menu, or go to /discover.`,
      `Think about one specific question or challenge you have today related to ${businessName}. It could be: "How should I price my new product?" or "What's the best way to find customers in ${industry ? industry : 'my industry'}?" or "How do I handle [specific situation]?"`,
      `Type your question in the search or chat box. Be specific and include context about your business${industry ? ` (you're in ${industry})` : ''}${businessStage ? ` (you're at ${businessStage} stage)` : ''}.`,
      `Read the AI's response. It will give you personalized advice based on your situation.`,
      `If something isn't clear, ask a follow-up question. You can ask: "Can you explain that more?" or "What would that look like for my business?"`,
      `Take one action based on what you learned. Even if it's small - like "I'll research that pricing strategy" or "I'll try that approach tomorrow."`,
      `Come back tomorrow with another question. Make it a daily habit to learn something new about your business.`
    ],
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    priority: 'medium',
    category: 'Insights',
    estimatedTime: '5 minutes',
    impact: 'Daily learning'
  })

  // Select 4-5 based on seed (rotates daily)
  const selected = dailyActions.slice(seed, seed + 4)
  if (selected.length < 4) {
    return [...selected, ...dailyActions.slice(0, 4 - selected.length)]
  }
  return selected
}

export default function SuggestionsPage() {
  const [mainSuggestions, setMainSuggestions] = useState<Suggestion[]>([])
  const [dailySuggestions, setDailySuggestions] = useState<Suggestion[]>([])
  const [deepFocusAreas, setDeepFocusAreas] = useState<DeepFocusArea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      const data = loadOnboardingData()
      setOnboardingData(data)
      
      // Generate deep focus areas (still using logic-based for now)
      const generatedFocusAreas = generateDeepFocusAreas(data)
      setDeepFocusAreas(generatedFocusAreas)
      
      // Load saved completed suggestions
      const saved = localStorage.getItem('completedSuggestions')
      if (saved) {
        setCompletedIds(JSON.parse(saved))
      }

      // Check if we have saved recommendations in localStorage
      const savedMainRecs = localStorage.getItem('mainRecommendations')
      const savedDailyRecs = localStorage.getItem('dailyRecommendations')
      
      if (savedMainRecs && savedDailyRecs) {
        try {
          const parsedMain = JSON.parse(savedMainRecs)
          const parsedDaily = JSON.parse(savedDailyRecs)
          setMainSuggestions(parsedMain)
          setDailySuggestions(parsedDaily)
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
              setMainSuggestions(result.recommendations)
              // Generate daily recommendations (still using logic-based for now)
              const dailyRecs = generateDailyRecommendations(data, new Date())
              setDailySuggestions(dailyRecs)
              // Save to localStorage
              localStorage.setItem('mainRecommendations', JSON.stringify(result.recommendations))
              localStorage.setItem('dailyRecommendations', JSON.stringify(dailyRecs))
              setIsLoading(false)
              return
            }
          }
        }
      } catch (error) {
        console.error('Error fetching AI recommendations:', error)
      }

      // Fallback to logic-based recommendations if AI fails
      const mainRecs = generateMainRecommendations(data)
      const dailyRecs = generateDailyRecommendations(data, new Date())
      setMainSuggestions(mainRecs)
      setDailySuggestions(dailyRecs)
      // Save to localStorage
      localStorage.setItem('mainRecommendations', JSON.stringify(mainRecs))
      localStorage.setItem('dailyRecommendations', JSON.stringify(dailyRecs))
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
          setMainSuggestions(result.recommendations)
          // Save to localStorage
          localStorage.setItem('mainRecommendations', JSON.stringify(result.recommendations))
          setIsGeneratingMore(false)
          return
        }
      }
    } catch (error) {
      console.error('Error generating more recommendations:', error)
    }
    
    // Fallback
    const mainRecs = generateMainRecommendations(onboardingData)
    setMainSuggestions(mainRecs)
    localStorage.setItem('mainRecommendations', JSON.stringify(mainRecs))
    setIsGeneratingMore(false)
  }

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(cid => cid !== id)
      : [...completedIds, id]
    setCompletedIds(newCompleted)
    localStorage.setItem('completedSuggestions', JSON.stringify(newCompleted))
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedSuggestion(expandedSuggestion === id ? null : id)
  }

  const allSuggestions = [...mainSuggestions, ...dailySuggestions]
  const categories = ['all', ...new Set(allSuggestions.map(s => s.category))]
  
  const filteredSuggestions = activeFilter === 'all' 
    ? allSuggestions 
    : allSuggestions.filter(s => s.category === activeFilter)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SidebarNav />
      <main className="pl-64">
        <div className="p-8 max-w-6xl">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Your Personalized Roadmap</h1>
              <p className="text-muted-foreground">
                Deep recommendations based on your specific challenges and goals
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {/* Deep Focus Areas Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Deep Focus Areas</h2>
                  <p className="text-sm text-muted-foreground">
                    These are the fundamental areas you should be working on based on your challenges
                  </p>
                </div>

                <div className="space-y-6">
                  {deepFocusAreas.map((area) => {
                    const Icon = iconMap[area.icon] || Sparkles
                    return (
                      <Card key={area.id} className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2">{area.title}</h3>
                            <p className="text-muted-foreground mb-4">{area.description}</p>
                            
                            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                              <p className="text-foreground/90 leading-relaxed">{area.explanation}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-purple-500" />
                                  Key Questions to Answer
                                </h4>
                                <ul className="space-y-2">
                                  {area.keyQuestions.map((q, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-purple-500 font-bold mt-0.5">{i + 1}.</span>
                                      {q}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Settings className="w-4 h-4 text-cyan-500" />
                                  Systems to Create
                                </h4>
                                <ul className="space-y-2">
                                  {area.systemsToCreate.map((s, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </section>

              {/* Main Recommendations Section */}
              <section>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Main Recommendations</h2>
                    <p className="text-sm text-muted-foreground">
                      Your top 5 priorities based on your challenges and goals
                    </p>
                  </div>
                  <Button
                    onClick={generateMoreRecommendations}
                    disabled={isGeneratingMore || !onboardingData}
                    variant="outline"
                    className="flex items-center gap-2"
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

                <div className="space-y-4 mb-12">
                  {mainSuggestions.map((suggestion) => {
                    const Icon = iconMap[suggestion.icon] || Sparkles
                    const isExpanded = expandedSuggestion === suggestion.id
                    const isCompleted = completedIds.includes(suggestion.id)
                    
                    return (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        Icon={Icon}
                        isExpanded={isExpanded}
                        isCompleted={isCompleted}
                        onToggleExpand={toggleExpand}
                        onToggleComplete={toggleComplete}
                      />
                    )
                  })}
                </div>
              </section>

              {/* Daily Recommendations Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Recommendations for Today</h2>
                  <p className="text-sm text-muted-foreground">
                    Quick actions you can take today - these change daily
                  </p>
                </div>

                <div className="space-y-4">
                  {dailySuggestions.map((suggestion) => {
                    const Icon = iconMap[suggestion.icon] || Sparkles
                    const isExpanded = expandedSuggestion === suggestion.id
                    const isCompleted = completedIds.includes(suggestion.id)
                    
                    return (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        Icon={Icon}
                        isExpanded={isExpanded}
                        isCompleted={isCompleted}
                        onToggleExpand={toggleExpand}
                        onToggleComplete={toggleComplete}
                      />
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SuggestionCard({ 
  suggestion, 
  Icon,
  isExpanded, 
  isCompleted,
  onToggleExpand,
  onToggleComplete
}: { 
  suggestion: Suggestion
  Icon: typeof Sparkles
  isExpanded: boolean
  isCompleted: boolean
  onToggleExpand: (id: string, e: React.MouseEvent) => void
  onToggleComplete: (id: string, e: React.MouseEvent) => void
}) {
  return (
    <Card 
      className={`p-5 border-2 transition-all duration-200 cursor-pointer ${
        isCompleted 
          ? 'bg-green-500/5 border-green-500/20 opacity-75' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm'
      }`}
      onClick={(e) => onToggleExpand(suggestion.id, e)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCompleted 
            ? 'bg-green-500/10' 
            : 'bg-primary/10'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Icon className="w-5 h-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${priorityColors[suggestion.priority]}`}>
              {suggestion.priority === 'high' ? 'Important' : suggestion.priority}
            </Badge>
            <Badge variant="outline" className={`text-xs ${categoryColors[suggestion.category] || 'bg-gray-500/10 text-gray-600'}`}>
              {suggestion.category}
            </Badge>
            {suggestion.estimatedTime && (
              <span className="text-xs text-muted-foreground">
                ⏱️ {suggestion.estimatedTime}
              </span>
            )}
          </div>
          
          <h3 className={`font-semibold text-lg ${
            isCompleted 
              ? 'text-green-600 dark:text-green-400 line-through' 
              : 'text-foreground'
          }`}>
            {suggestion.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mt-1">
            {suggestion.description}
          </p>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">What this means for you:</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {suggestion.explanation}
                </p>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Why this matters:</h4>
                <p className="text-sm text-foreground/80">
                  {suggestion.whyItMatters}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">How to get started:</h4>
                <ol className="space-y-2">
                  {suggestion.howToStart.map((step, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium text-xs">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link href={suggestion.featureLink} onClick={(e) => e.stopPropagation()}>
                  <Button className="bg-primary hover:bg-primary/90">
                    Go to {suggestion.feature}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={(e) => onToggleComplete(suggestion.id, e)}
                  className={isCompleted ? 'text-green-600 border-green-500/30' : ''}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isCompleted ? 'Completed' : 'Mark as Done'}
                </Button>
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
              <span>Click to expand and learn more</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
