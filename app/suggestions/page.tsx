'use client'

import { useState, useEffect, Suspense } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
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
  RefreshCw,
  Coffee,
  Loader2,
  Share
} from 'lucide-react'
import { loadOnboardingData, getUserChallenges, getUserIndustry, getUserBusinessStage } from '@/lib/onboarding-storage'
import { OnboardingData } from '@/components/onboarding/onboarding-types'
import { useBizoraLoading } from "@/lib/bizora-loading-context"
import { ShareModal } from '@/components/share-modal'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'
import { saveSuggestionsData, loadSuggestionsData } from '@/lib/supabase-data'

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
          'Step 1: Navigate to the Discover page by clicking on "Discover" in the left sidebar navigation menu (or go to /discover). This is where you\'ll set up your business profile. When you first open it, you\'ll see a clean interface with options to explore content and set up your profile. Take a moment to familiarize yourself with the layout - you\'ll see sections for content discovery and profile setup.',
          'Step 2: Look for the onboarding questionnaire or profile setup section at the top of the page. This is typically a card or section that prompts you to complete your business profile. Click on it to begin. The form will ask you several questions about your business - don\'t worry, you don\'t need to have everything figured out perfectly. The goal is to give us enough context to provide personalized recommendations.',
          'Step 3: Think about what industry your business is in or will be in - be as specific as possible. Instead of just saying "tech" or "retail", think about the specific niche. For example, "SaaS for small businesses" or "E-commerce for handmade products" or "Consulting for healthcare startups". The more specific you are, the better our AI can tailor recommendations to your exact situation. If you\'re not sure, think about who your customers are and what problem you solve for them.',
          'Step 4: Consider what stage you\'re at in your business journey. Are you at the idea stage (just thinking about starting), building an MVP (creating your first version), already launched (have customers and revenue), or scaling (growing rapidly)? Be honest about where you are - this helps us give you advice that\'s relevant to your current situation. If you\'re in between stages, pick the one that best describes where you spend most of your time.',
          'Step 5: Identify 2-3 challenges that keep you up at night - these are the problems you most need help solving. Think about what\'s preventing you from reaching your goals. Is it finding customers? Managing cash flow? Building a team? Scaling operations? Be specific - instead of "growth", think "finding customers in my industry" or "managing inventory as we scale". These challenges will become the focus of your personalized recommendations.',
          'Step 6: Define what success looks like for you in the next year - what would make you feel like you\'ve made real progress? This could be a revenue number, a number of customers, launching a new product, hiring your first employee, or something else entirely. Be specific and realistic. This goal helps us prioritize recommendations that move you toward what matters most to you. Remember, you can always update this as your goals evolve.',
          'Step 7: Fill in any additional information requested - this might include your target market, current revenue, team size, or other details. Don\'t worry if you don\'t have exact numbers - estimates are fine. The more information you provide, the more personalized your recommendations will be. If a question doesn\'t apply to you, you can usually skip it or select "Not applicable".',
          'Step 8: Click "Save" or "Complete" when you\'re done - don\'t worry about being perfect, you can always update it later. Once you save, our AI will immediately start generating personalized recommendations based on your profile. You\'ll see these appear in your Suggestions page. Remember, your business profile is a living document - as your business evolves, come back and update it so your recommendations stay relevant.'
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
          'Step 1: Click "Revenue" in the left sidebar menu to open the Revenue section (or navigate to /revenue). This is your revenue command center where you\'ll track, analyze, and optimize your business income. When you first open it, you\'ll see a dashboard with various revenue tools and analytics. Take a moment to explore the interface - you\'ll notice sections for revenue tracking, intelligence, and optimization tools.',
          'Step 2: Understand what revenue intelligence means for your business. Revenue intelligence is about understanding not just how much money you\'re making, but WHERE it\'s coming from, WHY customers are buying, and HOW you can make more. It\'s the difference between knowing you made $10,000 this month and understanding that $7,000 came from Product A (which has a 40% profit margin) while $3,000 came from Product B (which has a 60% profit margin). This level of detail helps you make smarter decisions about where to focus your efforts.',
          'Step 3: Start with the Revenue Intelligence dashboard to see your current revenue breakdown. Click on the "Revenue Intelligence" tab or section. Here, you\'ll be able to input your revenue data or connect your existing systems. If you don\'t have detailed data yet, start by manually entering your revenue streams - this could be different products, services, or revenue models. Don\'t worry about being perfect - even rough estimates give you valuable insights. The goal is to start seeing patterns.',
          'Step 4: Look for patterns in your revenue streams - which are most profitable? This is where the real insights begin. Look at not just total revenue, but profit margins, customer acquisition costs, and lifetime value for each stream. Ask yourself: Which products or services have the highest profit margins? Which require the least effort to sell? Which have the most repeat customers? Which are growing fastest? These patterns tell you where to invest more time and resources.',
          'Step 5: Identify one opportunity to increase revenue this month based on what you discover. This could be: Focusing more marketing on your highest-margin product, Creating a bundle of complementary products, Raising prices on products with high demand and low price sensitivity, Developing an upsell or cross-sell strategy, or Improving retention for your most valuable customers. Pick ONE opportunity and create an action plan. Don\'t try to do everything at once - focus leads to results.',
          'Step 6: Set up tracking for your key revenue metrics. In the Revenue section, you\'ll find tools to track metrics like Monthly Recurring Revenue (MRR), Customer Lifetime Value (LTV), Average Order Value (AOV), Customer Acquisition Cost (CAC), and Revenue Growth Rate. Set up tracking for at least 3-5 key metrics that matter most to your business. The app will help you input these and track them over time. Remember, you can\'t improve what you don\'t measure.',
          'Step 7: Review your revenue weekly to spot trends early. Make it a habit to check your revenue dashboard every week - set a calendar reminder if needed. Look for trends: Is revenue growing or declining? Which products are performing best? Are there seasonal patterns? Early detection of problems (or opportunities) gives you time to adjust. Weekly reviews take just 10-15 minutes but can save you from major issues down the road.',
          'Step 8: Use the insights to make data-driven decisions. As you track your revenue, you\'ll start seeing patterns and opportunities. Use these insights to make decisions: Should you invest more in Product A or Product B? Is it time to raise prices? Should you focus on new customers or retention? The data will guide you. Remember, revenue intelligence isn\'t just about tracking - it\'s about using that information to grow smarter.'
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
          'Step 1: Understand what a system is and why it matters. A system is a documented process that allows your business to run without you. Think of it like a recipe - anyone can follow it and get the same result. It\'s a set of clear instructions that turn chaos into consistency. For your business, this means your team can handle tasks the same way every time, even when you\'re not there. Without systems, every task requires your personal attention, which limits how much your business can grow. Systems are what separate a job (where you do everything) from a business (where processes run independently).',
          'Step 2: Click "Systems" in the left sidebar, or navigate to the Systems section (you can go to /revenue?tab=systems). This is where you\'ll document all your business processes. When you first open it, you\'ll see a clean interface with options to create new systems, view existing ones, and use templates. Take a moment to explore - you\'ll see that systems can be organized by category (operations, sales, customer service, etc.). Don\'t worry about getting it perfect on the first try - you can always edit and improve.',
          'Step 3: Go to the "Templates" tab to see pre-built system templates. Templates are starting points created by experts - they save you time and ensure you don\'t miss important steps. You\'ll see templates for common business processes like Customer Onboarding, Order Fulfillment, Content Creation, Sales Process, and more. Browse through them to get ideas, even if you don\'t use a template directly. They show you what a well-documented system looks like.',
          'Step 4: Choose a template that matches your business type (SaaS Launch, E-commerce Operations, etc.) or start from scratch. If you find a relevant template, click on it to see the full system. You\'ll notice it includes: A clear name and description, Step-by-step instructions, What information is needed at each step, Where to find tools or resources, What the expected outcome is, and Troubleshooting tips. If no template fits, that\'s fine - you can create your own system from scratch.',
          'Step 5: Review the template and customize it for your specific needs. Even the best template needs customization for your unique business. Go through each step and ask: Does this apply to my business? What would I do differently? What steps am I missing? What tools do I use instead? Edit the template to match your actual process. Add steps that are specific to your business. Remove steps that don\'t apply. The goal is to create a system that someone could follow to do the task exactly as you do it.',
          'Step 6: Start with one process - document how you do it step-by-step. Don\'t try to systemize everything at once. Pick ONE process that you do regularly - maybe it\'s how you handle new customer inquiries, how you fulfill orders, how you create content, or how you onboard new team members. Start with the process that takes the most time or causes the most confusion. Click "Create New System" and give it a clear, descriptive name.',
          'Step 7: Document every single step in detail. This is the most important part. For each step, include: What exactly needs to be done (be specific), What information or tools are needed, Where to find things (file locations, software, etc.), What the expected outcome is, What could go wrong and how to handle it. Write as if you\'re teaching someone who has never done this before. Include screenshots, links, or examples where helpful. The more detail, the better.',
          'Step 8: Test the system by following your own documentation. Once you\'ve written your system, test it yourself. Follow your own instructions exactly as written - you\'ll likely find gaps or unclear steps. Revise until you can follow it smoothly. Then, have someone else (a team member or trusted person) try to follow it without your help. Watch them and note where they get confused or stuck. These are the areas that need more detail. Remember: if someone can\'t follow your system, it\'s not their fault - it\'s the system that needs improvement.',
          'Step 9: Implement the system with your team. Share the system with your team through the app. Make sure everyone knows where to find it and how to access it. Schedule a brief training session where you walk through the system together. Encourage questions and feedback - your team will likely spot improvements you missed. Make it clear that systems are living documents that can and should be updated as processes evolve. Set a review date (maybe monthly) to check if the system is still accurate and effective.',
          'Step 10: Measure success and iterate. Track how well your system is working. Are tasks being completed faster? Are there fewer mistakes? Is the quality consistent? Use the app\'s tracking features to monitor these metrics. If something isn\'t working, don\'t abandon the system - improve it. Systems get better with iteration, not perfection. Review them regularly - maybe monthly or quarterly. Ask your team: What\'s working? What\'s confusing? What\'s missing? Update the documentation. The best systems are the ones that are actually used and continuously improved.'
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
        title: 'Research Your Market and Competitors',
        description: 'Understand your competitive landscape to find your unique position',
        explanation: 'Every business operates in a competitive market, and understanding that landscape is crucial for success. Market research helps you identify who your competitors are, what they do well, where they fall short, and what opportunities exist for your business. This isn\'t about copying competitors - it\'s about understanding the market deeply enough to find your unique position and identify gaps others are missing.',
        whyItMatters: 'Without understanding your competitive landscape, you risk either competing on the same terms as everyone else (a race to the bottom) or positioning yourself in a way that doesn\'t resonate with customers because you don\'t understand what they\'re already getting elsewhere.',
        howToStart: [
          'Step 1: Identify your direct and indirect competitors. Direct competitors are businesses offering similar solutions to the same market. Indirect competitors solve the same customer problem in different ways. Create a list of 5-10 competitors and note their names, websites, main offerings, and target markets. Use search engines, industry directories, and customer feedback to identify competitors you might not have known about.',
          'Step 2: Analyze each competitor\'s strengths and weaknesses. Look at their website, social media presence, customer reviews, content marketing, and any press coverage. What do they do exceptionally well? Where do they fall short? What are customers consistently complaining about? These complaints represent unmet needs that your business could address.',
          'Step 3: Read customer reviews across multiple platforms (Google Reviews, Yelp, Trustpilot, industry-specific sites). Look for patterns in what customers love (competitor strengths) and what they complain about (opportunities for you). Pay attention to the language customers use - this helps you craft messaging that resonates.',
          'Step 4: Identify gaps in the market that competitors aren\'t filling. These might be: customer segments not being served well, problems not being solved, price points not being addressed, service levels not being met, or features/benefits that are missing. Evaluate each gap: Is this something customers actually want? Can you fill this gap effectively?',
          'Step 5: Define your unique positioning based on your competitive analysis. How are you different, and why should customers choose you? Your positioning should be clear, specific, and defensible. Write it down: "For [target customer], [your business] is the [category] that [unique benefit] because [reason to believe]."',
          'Step 6: Document your competitive analysis in the Discover section. Create a document that includes: your list of competitors, each competitor\'s strengths and weaknesses, key insights from customer reviews, identified market gaps, and your unique positioning. This becomes a strategic resource you can reference when making decisions.',
          'Step 7: Review and update your competitive analysis quarterly. Markets change, competitors evolve, and new players enter. Set a reminder to review your analysis every 3 months to stay current with market changes and ensure your positioning remains relevant.'
        ],
        feature: 'Discover',
        featureLink: '/discover',
        icon: 'target',
        priority: 'medium',
        category: 'Strategy',
        estimatedTime: '2-3 hours',
        impact: 'Strategic clarity and competitive advantage'
      },
      {
        id: '5',
        title: 'Explore Leadership Tools',
        description: 'Develop your leadership capabilities with AI-powered coaching',
        explanation: 'Great leaders are made, not born—and it starts with self-awareness. Whether you\'re struggling with making tough decisions, communicating your vision, or getting buy-in from your team—these are all skills that can be developed. Our Leadership tools include assessments and coaching frameworks used by top executives.',
        whyItMatters: 'Leadership skills directly impact your ability to grow your business, build a great team, and make better decisions.',
        howToStart: [
          'Step 1: Navigate to the Leadership section and understand what leadership development means (8-12 sentences). Click "Leadership" in the left sidebar menu (you might also see it labeled as Marketplace in some views). The left sidebar is the vertical menu on the left side of your screen - look for an icon that looks like a crown or the word "Leadership". When you click it, the page will load and you\'ll see the Leadership or Marketplace interface. This section contains AI-powered leadership coaching tools, assessments, and frameworks designed to help you become a better leader. But first, let\'s understand what leadership really means in the context of your business: Leadership isn\'t just about being in charge - it\'s about influencing others, making good decisions, communicating effectively, and creating an environment where your team can thrive. For entrepreneurs, leadership skills directly impact your ability to grow your business, build a great team, make better decisions, and handle the challenges that come with scaling. Whether you have a team of 2 or 20, leadership matters. The tools in this section are based on frameworks used by top executives and successful entrepreneurs - they\'re not theoretical, they\'re practical and actionable. Take a moment to explore the interface - you\'ll see various assessments, coaching tools, and resources available.',
          'Step 2: Explore the leadership assessments and tools available to understand your options (8-12 sentences). Before diving into any specific tool, take time to explore what\'s available. You\'ll likely see several types of resources: Leadership style assessments (these help you understand your natural leadership approach), Decision-making frameworks (tools to help you make better business decisions), Communication guides (how to communicate effectively with your team), Conflict resolution tools (how to handle disagreements and challenges), Team building resources (how to build and manage effective teams), and Strategic thinking frameworks (how to think about long-term planning). Each tool serves a different purpose, so understanding what\'s available helps you choose what to focus on first. Read the descriptions of each tool - they\'ll explain what it does, how long it takes, and what you\'ll learn. Don\'t try to do everything at once - that\'s overwhelming. Instead, think about your current leadership challenges: Are you struggling with decision-making? Team communication? Handling conflict? Delegation? Pick the tool that addresses your biggest challenge first. You can always come back to explore others later. The goal is to start with what will have the biggest impact on your leadership right now.',
          'Step 3: Take a leadership style assessment to understand your natural strengths with full context (8-12 sentences). Start with a leadership style assessment - this is foundational because it helps you understand yourself as a leader. Click on the assessment (it might be called "Leadership Style Assessment" or similar). The assessment will present you with a series of questions or scenarios. Answer honestly - there are no right or wrong answers, and the more honest you are, the more accurate your results will be. Don\'t answer based on what you think a "good leader" should be - answer based on how you actually behave and think. The questions might ask things like: How do you prefer to make decisions? How do you handle conflict? How do you communicate with your team? What motivates you? How do you handle stress? Take your time with each question - think about real situations you\'ve been in and how you actually responded, not how you wish you had responded. Once you complete the assessment (this usually takes 10-15 minutes), you\'ll receive your results. These results will describe your leadership style - maybe you\'re a "Directive Leader" who likes clear structure, or a "Collaborative Leader" who values team input, or a "Visionary Leader" who focuses on big picture. There\'s no "best" style - each has strengths and areas for growth. The assessment will explain your natural tendencies, your strengths, and areas where you might want to develop. Read through these results carefully - they\'re personalized insights about your leadership approach.',
          'Step 4: Review personalized coaching recommendations based on your results with deep understanding (8-12 sentences). After you receive your assessment results, the system will generate personalized coaching recommendations based on your specific leadership style and the challenges you\'ve indicated. These aren\'t generic recommendations - they\'re tailored to you. The recommendations might include: Specific areas to develop (based on your style\'s common growth areas), Communication strategies that work with your style, Decision-making approaches that suit your natural tendencies, Team management techniques aligned with your approach, and Frameworks to help you in areas where your style might have blind spots. Read through each recommendation carefully. For each one, think about: Does this resonate with my experience? Have I noticed this challenge in my leadership? How would implementing this help me? What would this look like in practice for my business? Don\'t just read them once - read them twice and take notes. Write down the recommendations that feel most relevant or urgent for your situation. You don\'t have to work on everything at once - pick 2-3 recommendations to focus on first. The recommendations will likely include specific actions you can take, frameworks you can use, or mindsets to adopt. Each recommendation should feel actionable, not just theoretical.',
          'Step 5: Access leadership frameworks and decision-making tools to apply them practically (8-12 sentences). Beyond assessments, the Leadership section contains practical frameworks and tools you can use in your daily leadership. These are structured approaches to common leadership challenges. For example, you might find: A decision-making framework that walks you through how to make complex business decisions systematically, A communication framework that helps you structure important conversations with your team, A delegation framework that shows you how to effectively assign tasks and responsibilities, A feedback framework that helps you give constructive feedback that actually improves performance, or A conflict resolution framework that guides you through handling disagreements. Each framework is like a step-by-step guide - it doesn\'t just tell you what to do, it shows you HOW to do it. Click on a framework that addresses a challenge you\'re currently facing. Read through it completely - don\'t just skim. Understand the structure: What are the steps? What questions should you ask yourself? What should you consider? How do you know if you\'re doing it right? These frameworks are tools you can use immediately. Don\'t wait for the perfect situation - look for an opportunity in the next week to apply one of these frameworks. For example, if you learn a decision-making framework, use it for your next business decision, even if it\'s a small one. Practice makes these tools more natural and effective.',
          'Step 6: Practice new leadership approaches in low-stakes situations to build confidence (8-12 sentences). Learning about leadership is one thing - actually practicing it is another. The best way to develop leadership skills is through practice, but you don\'t want to practice on high-stakes situations where mistakes could be costly. Instead, look for low-stakes opportunities to practice new approaches. For example, if you learned a new communication technique, try it in a routine team meeting before using it in a critical conversation. If you learned a decision-making framework, apply it to a smaller decision before using it for a major one. If you learned a feedback approach, practice it with a team member you have a good relationship with before using it in a more challenging situation. The goal is to build confidence and skill gradually. As you practice, pay attention to: How does it feel? Is it working? What\'s the response from others? What adjustments do you need to make? Keep a journal or notes about what you\'re trying and how it\'s going. This reflection helps you learn and improve. Don\'t expect perfection immediately - leadership skills develop over time. Be patient with yourself and keep practicing. Each small practice session builds your leadership muscle. Over time, these new approaches will become natural, and you\'ll be able to use them confidently in important situations.',
          'Step 7: Review your progress monthly and adjust your approach for continuous improvement (8-12 sentences). Leadership development is a journey, not a destination. To keep improving, you need to regularly review your progress and adjust your approach. Set a monthly review - put it on your calendar so you don\'t forget. During this review, ask yourself: What leadership skills have I been working on this month? What progress have I made? What challenges am I still facing? What\'s working well? What isn\'t working? What do I need to focus on next month? Be honest with yourself - it\'s okay if you haven\'t made as much progress as you hoped. The important thing is to keep moving forward. Based on your review, adjust your approach: Maybe you need to focus on a different area, or try a different framework, or get more practice with a specific skill. The Leadership section is always there - you can take new assessments, explore different tools, or dive deeper into areas you want to develop. Leadership development is continuous because as your business grows, new leadership challenges emerge. What worked when you had 2 employees might not work when you have 10. What worked in the startup phase might not work in the scaling phase. Keep learning, keep practicing, keep improving. This commitment to leadership development is what separates good entrepreneurs from great ones.'
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
        `Step 1: Understand what an Ideal Customer Profile (ICP) is and why it matters. An Ideal Customer Profile is a detailed description of the perfect customer for your business - not just demographics, but their problems, behaviors, values, and characteristics. For ${businessName}, having a clear ICP means you can stop chasing everyone and start attracting the right people. You'll know where to find them, what to say to them, and why they should choose you. Without an ICP, you're marketing to everyone and connecting with no one - which wastes time and money.`,
        `Step 2: Open the Revenue section by clicking "Revenue" in the left sidebar menu (or navigate to /revenue). This is where you'll build and document your customer profile. When you open it, you'll see various tools for revenue analysis and customer insights. Look for a section where you can create documents or profiles - this is where you'll save your Ideal Customer Profile.`,
        `Step 3: Think about your best customers (or who you WANT to serve). If you already have customers, think about your top 3-5 best customers. What makes them "best"? Is it that they buy frequently? They're easy to work with? They refer others? They pay on time? If you don't have customers yet, think about who would benefit most from what ${businessName} offers. Who has the problem you solve? Who would value your solution the most?`,
        `Step 4: Write down what they have in common beyond basic demographics. Demographics (age, location, income) are just the surface. Go deeper: What problems do they face daily? What keeps them up at night? What do they value most (quality, speed, price, convenience)? What are their goals and aspirations? What are their biggest frustrations? For ${businessName}${industry ? ` in ${industry}` : ''}, think about industry-specific challenges they might face.`,
        `Step 5: Consider their behaviors and habits. Where do they spend time online? What publications, blogs, or websites do they read? What events, conferences, or meetups do they attend? What social media platforms do they use and how do they use them? What tools or software do they already use? Who do they follow or trust for advice? These behaviors tell you where to find them and how to reach them.`,
        `Step 6: Identify their biggest pain points and desires related to your business. Be extremely specific - not just "they want to save money" but "they struggle with managing inventory manually which causes stockouts and lost sales, and they need an automated system that integrates with their existing tools." The more specific you are, the better you can craft messaging that resonates. Think about: What problem does ${businessName} solve for them? What outcome do they desperately want? What are they trying to avoid?`,
        `Step 7: Map where they spend time and attention - this tells you where to reach them. If they're on LinkedIn daily for professional networking, that's where you should focus your B2B marketing. If they're on Instagram looking for inspiration, that's your channel. If they attend industry conferences, that's where you should be. Create a list of 3-5 places where your ideal customers are most active - these are your marketing channels.`,
        `Step 8: Document all of this in the Revenue section. Create a document called "Ideal Customer Profile for ${businessName}" and save it. Use the format: Demographics, Psychographics (values, goals, fears), Behaviors (where they spend time, what they read, etc.), Pain Points (specific problems they face), Desires (what outcomes they want), Where to Find Them (channels and locations). Be as detailed as possible - you can always refine it later as you learn more.`,
        `Step 9: Review and validate your profile. Once you've created your ICP, test it against real people. If you have existing customers, see how well they match your profile. If you're just starting, talk to 5-10 people who might fit your profile and see if your assumptions are correct. Ask them about their problems, where they spend time, what they value. You'll likely discover insights that refine your profile.`,
        `Step 10: Use your ICP to guide your marketing and sales. Your Ideal Customer Profile should inform everything: Your marketing messages (speak directly to their pain points), Your content strategy (create content they want to consume), Your sales approach (address their specific concerns), Your product development (solve their exact problems), Your pricing strategy (match their willingness to pay). Review this profile weekly for the first month - you'll likely discover new insights as you talk to more people and refine your understanding.`
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
        `Define the specific problem you're solving for ${businessName}. Be very clear: "I'm solving [specific problem] for [specific type of person]." Write this down in a document or notes app. The more specific you are, the better you can validate whether this is a real problem people will pay to solve.`,
        `Research your market to understand the competitive landscape. Look at who else is solving similar problems in ${industry ? industry : 'your industry'}. Check out competitor websites, read their customer reviews, and understand what they do well and where they fall short. This helps you understand if there's room for ${businessName} in the market.`,
        `Create a list of 20 potential customers who have the problem you're solving. These should be real people, not friends or family. You can find them on LinkedIn using industry keywords, in Facebook groups related to your target market, at industry events or meetups, or through your existing network. Make sure they actually have the problem - not just people who might be interested.`,
        `Reach out to 10+ of them with a simple, personal message. Don't use a template - make it genuine. Example: "Hi [Name], I noticed you [something specific about them]. I'm working on a solution for [problem] and would love to learn about your experience. Would you be open to a quick 15-minute conversation?" Keep it short, personal, and focused on learning, not selling.`,
        `In your conversations, ask about their current solutions and frustrations. Don't pitch your idea yet - just listen deeply. Ask questions like: "How do you currently handle [problem]?" "What's the most frustrating part about your current solution?" "What would an ideal solution look like to you?" Take detailed notes on what they say.`,
        `Test willingness to pay, not just interest. Many people will say they're interested, but that doesn't mean they'll pay. Ask directly: "If there was a solution that [solved their problem], how much would that be worth to you?" or "Would you pay $X per month for this?" Be specific with numbers. This is crucial validation data.`,
        `Look for patterns in what you hear across multiple conversations. Do 5+ people mention the same pain point? That's validation that the problem is real and widespread. Do they all say "I'd never pay for that"? That's a red flag that you need to rethink your approach. Document these patterns - they tell you what to focus on.`,
        `Create a validation report documenting your findings. Include: specific problems mentioned (and how many people mentioned each), current solutions they're using (and why they're not satisfied), willingness to pay (actual numbers, not just yes/no), and key patterns you noticed. This report becomes your roadmap for building ${businessName}.`,
        `Make a decision based on your validation data. If 5+ people have the problem AND are willing to pay a meaningful amount, you have validation to proceed. If not, pivot your idea based on what you learned. Don't ignore the data - it's telling you something important about whether ${businessName} solves a real problem people will pay for.`
      ],
      feature: 'Discover',
      featureLink: '/discover',
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

  // Only add general recommendations if we don't have enough personalized ones
  // And only add ones that are relevant to the user's stage
  const generalRecommendations: Suggestion[] = []
  
  // Only add "Get AI-Powered Insights" if we have fewer than 5 recommendations
  // This is always relevant regardless of stage
  if (suggestions.length < 5) {
    generalRecommendations.push({
      id: 'gen-1',
      title: `Get AI-Powered Insights for ${businessName}`,
      description: 'Ask any question and get contextual answers',
      explanation: `Sometimes you have specific questions that don't fit into neat categories. You might be wondering about a particular situation, a decision you're facing, or just need a thought partner who understands your business context. For ${businessName}${industry ? ` in ${industry}` : ''}, this means having access to an AI advisor that knows your industry, your business stage, your challenges, and your goals. Our AI doesn't give generic advice - it personalizes every response based on the onboarding data you provided, making each answer relevant to your specific situation. This is especially valuable when you're facing decisions that don't have clear-cut answers or when you need to think through complex problems that require nuanced understanding of your business landscape. The AI acts as a 24/7 business consultant who never forgets your context and can help you think through problems from multiple angles, considering factors specific to ${businessName}'s unique position in the market.` + `\n\n` + `To get the most value from this AI-powered advisor, you need to understand how to use it effectively. The key is to be specific and provide context in your questions - instead of asking "How do I grow?", ask "How should ${businessName} grow revenue in ${industry || 'my industry'} given that we're at ${businessStage || 'this stage'} and our main challenge is [specific challenge]?" The more context you provide, the better the AI can tailor its advice. You can also use it iteratively - start with a broad question, then ask follow-ups to dive deeper into specific aspects. For example, if you ask about pricing and get a general answer, follow up with "What would that look like for a ${industry || 'business'} like ${businessName} with [specific constraints]?" This iterative approach helps you get from general concepts to actionable, specific advice that you can implement immediately. The AI is designed to be a thinking partner, so treat it like a conversation where each question builds on the previous answers, helping you develop a comprehensive understanding of your options and the best path forward for ${businessName}.`,
      whyItMatters: `For ${businessName}, having on-demand access to contextual business advice means you're never stuck alone with a problem. Use it as a thinking partner for any business challenge.`,
      howToStart: [
        `Identify the specific challenge you're facing with ${businessName} right now. This could be anything from "How should I price my new product?" to "What's the best way to find customers in ${industry || 'my industry'}?" or "How do I improve customer retention?" The key is to be very specific about your situation. Instead of asking generic questions, think about what's actually blocking you from making progress on your goals. Consider what's keeping you up at night or what decision you're procrastinating on.`,
        `Research solutions specific to your industry and business stage. For ${businessName}${industry ? ` in ${industry}` : ''}${businessStage ? ` at the ${businessStage} stage` : ''}, look for case studies, examples, and strategies that have worked for similar businesses. Use the Discover section to find relevant content, or search for industry-specific resources. The more context you gather about what works in your specific situation, the better decisions you can make.`,
        `Analyze your specific situation with concrete data. For example, if you're asking about pricing, gather information about: what your competitors charge, what your costs are, what value you provide, and what your target customers are willing to pay. If you're asking about customer acquisition, look at: where your current customers came from, what channels work best, and what your conversion rates are. Having real data makes your decisions much more informed.`,
        `Consider multiple approaches and their trade-offs. Rarely is there one "right" answer in business - there are usually multiple valid approaches, each with pros and cons. For ${businessName}, think about: What are 2-3 different ways to solve this problem? What are the benefits and drawbacks of each? Which approach aligns best with your resources, timeline, and goals? This helps you make a more thoughtful decision rather than just picking the first solution you find.`,
        `Create a specific action plan based on your research and analysis. Don't just gather information - turn it into concrete next steps. For example, if you learned about a pricing strategy, your action plan might be: "Research competitor prices this week, calculate my costs and desired margins, test the new price with a small group next week, review results and adjust." Break it down into small, manageable steps with deadlines.`,
        `Test your approach with a small, low-risk experiment before committing fully. For ${businessName}, this might mean testing a new pricing strategy with a small group of customers, trying a new marketing channel with a limited budget, or piloting a new process with one team member. This lets you learn and adjust without risking everything. Track the results carefully so you can make data-driven decisions about whether to scale or pivot.`,
        `Review and iterate based on what you learn. After testing, ask yourself: What worked? What didn't? What surprised you? What would you do differently? Use this learning to refine your approach. For ${businessName}, this continuous improvement process is how you build a business that gets better over time. Don't expect perfection on the first try - expect to learn and improve.`,
        `Document what you learned so you can reference it later and share it with your team. Create a simple document or note that captures: the challenge you faced, the approaches you considered, what you decided to try, what happened, and what you learned. This builds institutional knowledge for ${businessName} and helps you make better decisions in the future when similar challenges arise.`
      ],
      feature: 'Discover',
      featureLink: '/discover',
      icon: 'compass',
      priority: 'medium' as const,
      category: 'Insights',
      estimatedTime: 'Anytime',
      impact: 'On-demand guidance'
    })
  }
  
  // Only add "Build Systems" if we have fewer than 5 and it's relevant
  // Systems are relevant for most stages, but especially for scaling/growth stages
  if (suggestions.length < 5 && !hasChallenge(['operations', 'processes', 'systems', 'efficiency'])) {
    generalRecommendations.push({
      id: 'gen-2',
      title: `Build Systems for ${businessName}`,
      description: 'Document your processes to scale efficiently',
      explanation: `Every time you do something repeatedly without a documented process, you're essentially reinventing the wheel - wasting time, creating inconsistencies, and building a business that can't scale beyond your personal involvement. For ${businessName}${industry ? ` in ${industry}` : ''}, this means that critical knowledge lives only in your head, making it impossible to delegate effectively, train new team members, or improve operations systematically. When processes aren't documented, every task requires your direct involvement or explanation, creating bottlenecks that prevent growth. More importantly, undocumented processes lead to inconsistent results - the same task done by different people (or even by you on different days) produces different outcomes, which hurts quality, customer satisfaction, and your ability to scale. Systems solve this by capturing your knowledge in a format that anyone can follow, ensuring consistency and freeing you to focus on higher-level strategic work rather than day-to-day execution.` + `\n\n` + `Building systems for ${businessName} starts with identifying the processes that matter most - typically things you do weekly or monthly that, if documented, would save significant time or allow delegation. The Systems feature in DreamScale provides templates and tools to help you document these processes step-by-step, including where to add screenshots, how to handle decision points, and how to make instructions clear enough that someone new can follow them. To use it effectively, start by actually doing the process once while taking detailed notes, then write it up in simple language as if explaining to someone who's never done it before. Include screenshots for software-based processes, note any decision points (if X happens, do Y), and test the documentation by following it yourself the next time you do the process. The key is to start small - document one process per day or week, focusing on quality over quantity. Over time, you'll build a library of documented processes that transform ${businessName} from a business that depends on you into one that can run and grow systematically, with consistent quality and the ability to scale without you being the bottleneck.`,
      whyItMatters: `For ${businessName}, each documented process is one less thing that lives only in your head. Over time, this builds into a business that can run without you being involved in every detail.`,
      howToStart: [
        `Systems are documented processes that anyone on your team (or future team) can follow to complete a task consistently. For ${businessName}${industry ? ` in ${industry}` : ''}, systems mean you're not the only person who knows how things work. To get started, open the Systems section by clicking "Systems" in the left sidebar menu - you'll see it has a gear icon. Once you're in the Systems section, navigate to the "Templates" tab at the top of the page. This is where you'll find pre-built templates and where you'll create your own systems. The interface will show you different categories of systems you can create - things like "Customer Onboarding," "Order Fulfillment," "Content Creation," etc. Each category has templates you can customize, or you can start from scratch. Take a moment to explore what's available - this will give you ideas for what processes ${businessName} needs documented.`,
        `Don't try to document everything at once - that's overwhelming and you'll never finish. Instead, pick ONE process to document today. Choose something you do at least weekly, because those are the processes that will give you the biggest return on your time investment. For ${businessName}, this might be something like "How I respond to customer inquiries," "How I process orders," "How I create social media content," or "How I onboard new customers." The key is to pick something that, if documented, would save you time or allow someone else to do it. Think about what tasks you find yourself explaining repeatedly, or what you wish you could delegate but can't because only you know how to do it. That's your first system to document.`,
        `Now, actually do the process once while taking detailed notes. Don't try to remember what you usually do - actually do it, and write down every single step, no matter how small or obvious it seems. For example, if you're documenting "How I respond to customer inquiries," start from the moment you receive the inquiry. Write down: "Step 1: Open email/chat platform. Step 2: Read the full message. Step 3: Identify the type of inquiry (support, sales, complaint, etc.)." Be extremely detailed - include things like "Click on the customer's name to see their order history" or "Check if this is a repeat customer." The goal is to document it so thoroughly that someone who has never done this before could follow your notes and complete the task. As you do the process, note any decisions you make along the way - "If the customer mentions X, then do Y." These decision points are crucial for creating a good system.`,
        `After you've done the process and taken notes, write it up in simple, clear language. Pretend you're explaining it to someone who has never worked at ${businessName} and has no context about your business. Use short sentences. Avoid jargon unless you define it. Break complex steps into smaller sub-steps. For example, instead of "Process the order," write "Step 1: Open the order management system. Step 2: Find the order by searching for the order number. Step 3: Verify the customer's shipping address matches what's in the system. Step 4: Check inventory to ensure the item is in stock." Use action verbs and be specific about what to click, where to look, and what information to use. Include "why" explanations where helpful - "Check the shipping address (this prevents costly shipping errors and customer complaints)." The clearer and simpler your language, the more useful the system will be.`,
        `If your process involves using software, websites, or digital tools, add screenshots. Screenshots are incredibly valuable because they show exactly what the interface looks like, where buttons are located, and what information appears on screen. For each step that involves clicking something or viewing a screen, take a screenshot and insert it right after the step description. For example, if step 3 is "Click the 'Process Order' button," include a screenshot showing exactly where that button is located on the screen. You can use tools like Snipping Tool (Windows), Screenshot (Mac), or browser extensions to capture screenshots. Make sure screenshots are clear and show the relevant part of the screen - you might need to crop or annotate them. Add arrows or circles to highlight important elements if needed. Screenshots make systems much easier to follow, especially for visual learners or when the interface changes slightly over time.`,
        `Once you've written up the process with all steps, sub-steps, decision points, and screenshots, save it in the Systems section with a clear, descriptive name. The name should tell someone immediately what the system is for. Good names are things like "Customer Inquiry Response Process," "Monthly Inventory Check," or "New Employee Onboarding Checklist." Bad names are things like "Process 1" or "Important Stuff." When saving, you'll be asked to choose a category - pick the one that best fits, or create a new category if needed. You can also add tags to make it easier to find later. Before saving, do a quick review: Can someone who's never done this follow these steps? Are all the steps in order? Are decision points clear? If yes, save it. Congratulations - you've just created your first system for ${businessName}!`,
        `The real test of a good system is whether it actually works when someone (including you) follows it. Tomorrow, test your documentation by actually following your own written steps to complete the process. Don't rely on memory - follow the documentation exactly as written. As you go through it, you'll likely notice things you forgot to include, steps that are unclear, or places where the order doesn't make sense. This is normal and expected! Take notes on what's missing or confusing. After completing the process, go back and update your system documentation with the improvements. Add the missing steps, clarify the confusing parts, and fix any ordering issues. This testing and refinement process is crucial - a system that looks good on paper but doesn't work in practice isn't useful. Keep testing and refining until someone can follow it successfully without asking questions.`,
        `Building systems is a marathon, not a sprint. Don't try to document everything in one day - you'll burn out and the quality will suffer. Instead, commit to documenting just one process per day (or per week if daily feels too aggressive). Consistency is more important than speed. Each day, pick another process that you do regularly and repeat the same steps: do it while taking notes, write it up clearly, add screenshots if needed, save it with a clear name, and test it the next day. Over time, you'll build a library of documented processes for ${businessName}. After a month, you might have 20-30 systems documented. After three months, you'll have a comprehensive operations manual. The key is to start small, stay consistent, and gradually build. Each system you document makes your business more scalable, more valuable, and less dependent on you personally. Before you know it, ${businessName} will have processes for everything that matters.`
      ],
      feature: 'Systems',
      featureLink: '/revenue?tab=systems',
      icon: 'settings',
      priority: 'medium' as const,
      category: 'Operations',
      estimatedTime: '20 minutes',
      impact: 'Building systems gradually'
    })
  }
  
  // Only add "Analyze Revenue" if we have fewer than 5 and it's relevant
  // Revenue analysis is relevant for most stages, but especially if they have revenue
  if (suggestions.length < 5 && !hasChallenge(['revenue', 'sales', 'pricing', 'income', 'profit', 'growth']) && (monthlyRevenue || stageLower.includes('scaling') || stageLower.includes('growth') || stageLower.includes('established'))) {
    generalRecommendations.push({
      id: 'gen-3',
      title: `Analyze Your Revenue for ${businessName}`,
      description: 'Understand where your money comes from and where it could come from',
      explanation: `Before you can grow revenue intelligently, you need to understand your current revenue at a deep, granular level. Many business owners know their total revenue number but don't understand the story behind it - where each dollar comes from, which revenue streams are actually profitable (not just high-revenue), which customers are most valuable, and what patterns exist in their revenue data. For ${businessName}${industry ? ` in ${industry}` : ''}, this means going beyond surface-level metrics to analyze revenue streams, profit margins, customer lifetime value, seasonal patterns, and growth trends. Without this deep understanding, you're essentially flying blind when making decisions about pricing, product development, marketing spend, or strategic direction. Revenue Intelligence helps you see not just what your revenue is, but why it's that way, what's driving it, and where the real opportunities for growth exist. This analysis often reveals surprising insights - like discovering that your highest-revenue product has the lowest profit margin, or that a small customer segment generates most of your profit, or that certain months consistently outperform others for reasons you hadn't identified.` + `\n\n` + `To use Revenue Intelligence effectively for ${businessName}, start by gathering accurate financial data from the last 3 months - bank statements, invoices, accounting software exports, and any other sources of revenue information. The Revenue Intelligence tool will guide you through analyzing this data to identify all revenue streams, calculate profit margins for each (not just revenue amounts), identify your most valuable customers, and discover patterns in your revenue data. The tool uses AI to help you understand what the data means and identify opportunities you might have missed. For example, it might reveal that you should focus on upselling to existing customers rather than acquiring new ones, or that a small pricing adjustment could significantly impact profitability, or that certain products or services should be bundled together. The key is to use this analysis to make data-driven decisions rather than gut-feel decisions - when you understand your revenue deeply, you can make changes with confidence, knowing they're based on actual data about what works for ${businessName}. Regular monthly reviews of this analysis help you track trends, measure the impact of changes you make, and continuously refine your revenue strategy based on what the data tells you.`,
      whyItMatters: `Many businesses chase new revenue streams while leaving money on the table in existing ones. For ${businessName}, understanding your revenue model often reveals quick wins you're currently missing.`,
      howToStart: [
        `Revenue Intelligence is about understanding not just how much money ${businessName} makes, but where it comes from, why it comes from there, and how to get more of it. To access this powerful tool, look at the left sidebar menu and find "Revenue Intelligence" or "$ Revenue" - it will have a dollar sign icon and an "AI" badge. Click on it to open the Revenue Intelligence dashboard. When the page loads, you'll see an interface designed to help you analyze your revenue from multiple angles. The dashboard will have sections for revenue streams, customer analysis, trends, and opportunities. If this is your first time, the system will guide you through setting up your revenue analysis. The interface is designed to be intuitive, but take a moment to familiarize yourself with the different sections and what data each one displays. This tool uses your onboarding data and any financial information you provide to give you personalized insights about ${businessName}'s revenue.`,
        `Before you can analyze your revenue intelligently, you need to gather accurate financial data. Collect information from the last 3 months (90 days) - this gives you enough data to see patterns without being overwhelmed. Gather your bank statements, which show all money coming into ${businessName}'s accounts. Get your invoices or sales records, which show what you sold, to whom, and for how much. If you use accounting software like QuickBooks, Xero, or FreshBooks, export reports showing revenue by product/service, by customer, and by time period. If you're in ${industry || 'your industry'}, you might also have data from payment processors (like Stripe, PayPal, or Square), e-commerce platforms (like Shopify or WooCommerce), or service booking systems. The goal is to have a complete picture of every dollar that came into ${businessName} over the past 3 months. Don't worry if some data is missing - work with what you have, and you can always add more later.`,
        `Now, list every single revenue stream ${businessName} has. A revenue stream is any way money comes into your business. For example, if you're an e-commerce business, you might have: "Product Sales - Category A," "Product Sales - Category B," "Shipping Fees," "Gift Wrapping Services," etc. If you're a service business, you might have: "Hourly Consulting," "Monthly Retainers," "One-time Projects," "Training Workshops," etc. Write down each stream, then calculate the total revenue for each one over the past 3 months. Add up all the streams to get your total revenue. Then, for each stream, calculate what percentage it represents of your total revenue. For example, if "Product Sales - Category A" brought in $10,000 and your total revenue was $50,000, that stream represents 20% of your revenue. This percentage calculation is crucial because it shows you where your money is actually coming from. You might be surprised - sometimes what you think is your main revenue source is actually smaller than you expected, or vice versa.`,
        `Revenue is important, but profit margin is what actually matters for ${businessName}'s sustainability. For each revenue stream, calculate the profit margin, not just the revenue amount. To do this, you need to know the costs associated with each stream. For product sales, this includes: cost of goods sold (what you paid for the product), shipping costs, packaging, payment processing fees, and any other direct costs. For service revenue, this includes: your time (calculate your hourly rate), any materials used, travel costs, platform fees, etc. Subtract all these costs from the revenue for that stream to get the profit. Then divide profit by revenue and multiply by 100 to get the profit margin percentage. For example, if a product brings in $100 in revenue but costs $60 total (product + shipping + fees), the profit is $40, and the profit margin is 40%. You might discover that your highest-revenue stream has the lowest profit margin, or that a small stream is actually your most profitable. This insight is game-changing for making decisions about where to focus ${businessName}'s efforts.`,
        `Your customers aren't all equal - some are far more valuable than others. Identify your most valuable customers by looking at two key metrics: who pays the most (revenue per customer) and who stays the longest (customer lifetime value). Start by listing all your customers from the past 3 months and how much revenue each one generated. Sort them from highest to lowest. You'll likely see a pattern - often, 20% of your customers generate 80% of your revenue (this is called the Pareto Principle). These are your most valuable customers. Then, look at customer retention - which customers have been with ${businessName} the longest? Which ones make repeat purchases or continue using your services month after month? These long-term customers are incredibly valuable because they provide predictable revenue and often cost less to serve (you're not constantly acquiring them). Create a list of your top 10-20 most valuable customers. Understanding who these customers are, what they buy, why they stay, and how you acquired them will help you find more customers like them. This is one of the most powerful insights you can get from revenue analysis.`,
        `Revenue patterns tell you a story about ${businessName}'s business. Look for trends over the past 3 months - is revenue increasing, decreasing, or staying flat? Are there specific days of the week when you make more sales? Specific times of the month? Seasonal patterns? For example, if you're in e-commerce, you might see spikes around paydays, holidays, or specific seasons. If you're in services, you might see patterns related to when clients have budget cycles. Also analyze customer behavior patterns - do customers tend to buy more on their first purchase or subsequent purchases? Do they buy more when you offer discounts, or do they buy regardless? Are there specific products or services that customers always buy together? These patterns reveal opportunities. For instance, if you notice that customers who buy Product A almost always buy Product B within 30 days, you have a cross-selling opportunity. If you see that revenue spikes every Friday, you know when to schedule promotions or new product launches. Patterns in your revenue data are like clues that help you make smarter business decisions.`,
        `Once you understand your revenue streams, profit margins, valuable customers, and patterns, look for pricing or packaging opportunities. Pricing opportunities might include: raising prices on high-demand, low-competition products; creating tiered pricing (basic, premium, enterprise) to capture more value from different customer segments; bundling products or services together at a discount to increase average order value; or offering payment plans for higher-ticket items to make them more accessible. Packaging opportunities might include: creating subscription options for one-time purchases (turn a $100 one-time purchase into a $10/month subscription); bundling complementary products or services together; offering "add-ons" or "upgrades" that customers can purchase; or creating limited-time packages that create urgency. For ${businessName}${industry ? ` in ${industry}` : ''}, think about what your competitors charge, what your customers are willing to pay, and what value you're providing. Often, businesses underprice because they don't understand their true value or their customers' willingness to pay. The revenue data you've gathered will help you identify where you have pricing power and where you might be leaving money on the table.`,
        `All this analysis is only valuable if you use it to make better decisions. Document your findings in a clear format - you can use the Revenue Intelligence dashboard's built-in notes feature, or create a separate document. Write down: your top 3 revenue streams and their profit margins, your top 10 most valuable customers and what makes them valuable, the key patterns you discovered, and the top 3 pricing/packaging opportunities you identified. Set a reminder to review this analysis monthly - revenue patterns change, new opportunities emerge, and your understanding deepens over time. Each month, update your analysis with new data and compare it to previous months. Are your revenue streams shifting? Are profit margins improving? Are you acquiring more valuable customers? This monthly review process turns revenue analysis from a one-time exercise into an ongoing strategic tool. Over time, you'll start to see longer-term trends, seasonal patterns, and the impact of changes you make. This data-driven approach to revenue will help ${businessName} grow more predictably and profitably.`
      ],
      feature: 'Revenue Intelligence',
      featureLink: '/revenue-intelligence',
      icon: 'dollar',
      priority: 'medium' as const,
      category: 'Revenue',
      estimatedTime: '1-2 hours',
      impact: 'Data-driven growth decisions'
    })
  }
  
  // Only add "Understand Competition" if we have fewer than 5
  // Competition analysis is relevant for most stages
  if (suggestions.length < 5) {
    generalRecommendations.push({
      id: 'gen-4',
      title: `Understand Your Competition`,
      description: 'Know what you\'re up against to find your unique edge',
      explanation: `You can't win a game you don't understand, and business is no different. Many entrepreneurs make the mistake of either ignoring their competitors entirely (thinking they're so unique that competition doesn't matter) or obsessing over competitors and trying to copy everything they do. Both approaches are wrong. Competitive intelligence isn't about copying competitors - it's about understanding the market landscape deeply enough to find your unique position and identify opportunities others are missing. For ${businessName}${industry ? ` in ${industry}` : ''}, this means knowing who else solves similar problems for your target customers, what they do well, where they fall short, what gaps exist in the market, and how you can position yourself to win. Without this understanding, you risk either competing on the same terms as everyone else (a race to the bottom) or positioning yourself in a way that doesn't resonate with customers because you don't understand what they're already getting elsewhere. Competitive intelligence helps you find the angles where you can genuinely win - not by being better at everything, but by being different in ways that matter to your target customers.` + `\n\n` + `To use Competitor Intelligence effectively for ${businessName}, start by creating a comprehensive list of competitors - both direct competitors (businesses offering similar solutions to the same market) and indirect competitors (businesses solving the same customer problem in different ways). The Competitor Intelligence tool in DreamScale helps you analyze each competitor systematically, looking at their strengths, weaknesses, customer reviews, pricing strategies, marketing approaches, and market positioning. The tool uses AI to help you identify patterns - what do customers consistently complain about across competitors? What gaps exist that no one is filling? What positioning is everyone using that you could differentiate from? This analysis helps you develop a unique positioning for ${businessName} that's based on actual market gaps and customer needs, not just your assumptions. The key is to use this intelligence to inform your strategy - not to copy what competitors do, but to understand the landscape well enough to find where you can win. Regular quarterly reviews of your competitive analysis keep you updated on market changes, new entrants, and evolving customer needs, ensuring ${businessName} stays ahead of market shifts and maintains its unique position.`,
      whyItMatters: `For ${businessName}, competitive analysis helps you identify opportunities others are missing and develop positioning that makes you stand out rather than blend in.`,
      howToStart: [
        `Competitive intelligence is about understanding your market landscape so you can find your unique position and avoid competing on the same terms as everyone else. For ${businessName}${industry ? ` in ${industry}` : ''}, this means knowing who else is solving similar problems for your target customers. To get started, access the Competitor Intelligence feature by clicking "Competitor Intelligence" in the left sidebar menu (it has a magnifying glass icon and an "AI" badge). This feature uses AI to help you analyze competitors systematically. The interface will guide you through entering competitor information and will help you analyze their strategies, strengths, and weaknesses. The tool is designed to help you understand not just who your competitors are, but how they operate, what they do well, where they struggle, and what opportunities they're missing. This isn't about copying them - it's about finding where you can win.`,
        `Start by creating a comprehensive list of competitors, but think broadly about who else solves the same problem your customers have. Direct competitors are businesses that offer the same or very similar products/services to the same target market - these are the obvious ones. But also list indirect competitors - businesses that solve the same customer problem in a different way. For example, if ${businessName} sells productivity software, your direct competitors are other productivity software companies, but your indirect competitors might include productivity coaches, time management consultants, or even project management tools that overlap with your features. Think about substitutes too - what else could your customers use instead of your solution? For each competitor, note their name, website, main offering, and target market. Don't limit yourself to just local competitors - in today's digital world, your competition might be global. Use search engines, industry directories, social media, and customer feedback to identify competitors you might not have known about. The goal is to have a complete picture of your competitive landscape.`,
        `For each competitor you've identified, conduct a thorough analysis of their strengths and weaknesses. Start with their strengths - what do they do exceptionally well? This might be their marketing, their product features, their customer service, their pricing strategy, their brand positioning, or their distribution channels. Look at their website, their social media presence, their customer reviews, their content marketing, and any press coverage they've received. What makes customers choose them? What are they known for? Then, identify their weaknesses - where do they fall short? This might be areas where they receive consistent complaints, features they're missing, poor customer service, confusing messaging, or gaps in their offering. Look for patterns in negative reviews - what do customers consistently complain about? Check their social media for customer service issues or public complaints. Also analyze what they're NOT doing - what marketing channels aren't they using? What customer segments aren't they targeting? What problems aren't they solving? This analysis will reveal opportunities for ${businessName} to differentiate and win.`,
        `Customer reviews are a goldmine of competitive intelligence because they tell you exactly what real customers think about your competitors. Read reviews on multiple platforms - Google Reviews, Yelp, Trustpilot, industry-specific review sites, app stores (if applicable), and social media. Look for patterns in what customers love - these are the competitor's true strengths that you need to match or exceed. For example, if multiple reviews praise a competitor's "fast response time," that's a strength you should be aware of. More importantly, pay close attention to what customers complain about - these are weaknesses and opportunities. Common complaints might include: slow service, poor communication, confusing processes, missing features, high prices, or lack of personalization. These complaints represent unmet needs that ${businessName} could address. For each major complaint pattern you find, ask yourself: "Can we solve this problem better? Is this something our target customers care about? How would we address this differently?" Customer reviews also reveal what language customers use to describe problems and solutions - this helps you craft messaging that resonates. Take notes on the most common positive and negative themes for each competitor.`,
        `Once you understand what competitors are doing well and where they struggle, identify the gaps they're not filling. These gaps are opportunities for ${businessName} to create unique value. Gaps might be: customer segments that aren't being served well (maybe competitors focus on large enterprises but ignore small businesses, or vice versa), problems that aren't being solved (maybe competitors offer the core solution but don't help with implementation or support), price points that aren't being addressed (maybe everything in the market is either very expensive or very cheap, with nothing in the middle), service levels that aren't being met (maybe competitors are all self-service but customers want more hand-holding), or features/benefits that are missing (maybe all competitors focus on one aspect but ignore another important aspect). Also look for gaps in how competitors communicate or market themselves - maybe they all use the same messaging, the same channels, or the same positioning. These gaps represent opportunities to stand out. For each gap you identify, evaluate: Is this something our target customers actually want? Can we fill this gap effectively? Does filling this gap align with ${businessName}'s strengths and resources?`,
        `Based on your competitive analysis, define ${businessName}'s unique positioning - how are you different, and why should customers choose you? Your positioning should be clear, specific, and defensible. It's not enough to say "we're better" - you need to articulate exactly how and why. Your unique positioning might be based on: serving a specific customer segment better than anyone else (e.g., "We're the only productivity tool designed specifically for solopreneurs"), solving a problem others ignore (e.g., "While competitors focus on features, we focus on simplicity and ease of use"), offering a different business model (e.g., "Instead of subscriptions, we offer pay-as-you-go pricing"), providing superior service in a specific area (e.g., "We're known for our 24/7 customer support and implementation help"), or combining things in a unique way (e.g., "We're the only platform that combines project management with time tracking and invoicing"). Your positioning should be something you can actually deliver on and that matters to your target customers. Write it down clearly: "For [target customer], ${businessName} is the [category] that [unique benefit] because [reason to believe]." This positioning statement will guide your marketing, product development, and customer communication.`,
        `Competitive analysis isn't a one-time exercise - markets change, competitors evolve, and new players enter. Create a competitive analysis document (you can use the Competitor Intelligence tool's built-in features or create your own document) that includes: your list of competitors (direct, indirect, and substitutes), each competitor's strengths and weaknesses, key insights from customer reviews, identified market gaps, and ${businessName}'s unique positioning. Set a reminder to review and update this analysis quarterly (every 3 months). During each review, check if new competitors have emerged, if existing competitors have changed their strategies, if customer sentiment has shifted, and if new gaps or opportunities have appeared. Also track how ${businessName}'s positioning is holding up - are you still differentiated? Have competitors copied your approach? Do you need to evolve your positioning? This quarterly review keeps your competitive intelligence current and ensures ${businessName} stays ahead of market changes. Over time, you'll build a comprehensive understanding of your competitive landscape that informs strategic decisions and helps you maintain your unique position in the market.`
      ],
      feature: 'Competitor Intelligence',
      featureLink: '/dreampulse',
      icon: 'target',
      priority: 'low' as const,
      category: 'Strategy',
      estimatedTime: '2-3 hours',
      impact: 'Strategic clarity'
    })
  }

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
        `After the call, write down 3 things you learned. What surprised you? What patterns did you notice? What would you change about your idea? Document these insights in a simple notes document or spreadsheet.`,
        `Create a validation tracker to organize your findings. Use a simple spreadsheet or document with columns for: person's name, their problem, current solution, willingness to pay, key insights, and patterns. This helps you see trends across multiple conversations and make better decisions about ${businessName}.`,
        `Do this again tomorrow with a different person. One conversation per day = 30 conversations per month = deep market understanding. Consistency is key - the more conversations you have, the clearer it becomes whether you're solving a real problem that people will pay for.`
      ],
      feature: 'Discover',
      featureLink: '/discover',
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
    title: `Tackle One Specific Challenge for ${businessName}`,
    description: `Research and solve one specific business problem today`,
    explanation: `Every day brings new questions and challenges. For ${businessName}, taking time to research and solve one specific challenge today helps you make progress, learn something new, or validate a decision. Small daily progress compounds into significant growth over time.`,
    whyItMatters: `For ${businessName}, small daily learning compounds into significant growth over time. Asking one question per day means 365 new insights per year.`,
      howToStart: [
        `Identify one specific challenge you're facing today with ${businessName}. It could be: "How should I price my new product?" or "What's the best way to find customers in ${industry ? industry : 'my industry'}?" or "How do I handle [specific situation]?" Be very specific - generic questions lead to generic answers.`,
        `Research solutions specific to your situation. For ${businessName}${industry ? ` in ${industry}` : ''}${businessStage ? ` at the ${businessStage} stage` : ''}, look for examples, case studies, or strategies that have worked for similar businesses. Use the Discover section to find relevant content, or search for industry-specific resources.`,
        `Analyze your specific context. Gather concrete data: What are your competitors doing? What are your costs? What value do you provide? What are your constraints? Having real information makes your decisions much more informed than guessing.`,
        `Consider 2-3 different approaches and their trade-offs. Rarely is there one "right" answer - there are usually multiple valid approaches. Think about: What are the benefits and drawbacks of each? Which aligns best with your resources and goals?`,
        `Create a specific action plan. Don't just research - turn it into concrete next steps. Break it down into small, manageable tasks with deadlines. For example: "Research competitor prices this week, calculate costs, test new price with small group next week."`,
        `Take one action today based on what you learned. Even if it's small - like "I'll research that pricing strategy" or "I'll reach out to 3 potential customers." The value comes from taking action, not just gathering information.`,
        `Document what you learned and come back tomorrow with another challenge. Make it a daily habit to tackle one specific business challenge. One challenge per day = 365 problems solved per year = significant progress for ${businessName}.`
      ],
      feature: 'Discover',
      featureLink: '/discover',
    icon: 'lightbulb',
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

function SuggestionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setOpeningBizora } = useBizoraLoading()
  const sessionContext = useSessionSafe()
  const { user: authUser, profile } = useAuth()
  const [mainSuggestions, setMainSuggestions] = useState<Suggestion[]>([])
  const [dailySuggestions, setDailySuggestions] = useState<Suggestion[]>([])
  const [deepFocusAreas, setDeepFocusAreas] = useState<DeepFocusArea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [shareModal, setShareModal] = useState<{isOpen: boolean, content: string, title: string}>({
    isOpen: false,
    content: '',
    title: ''
  })

  useEffect(() => {
    const loadSuggestions = async () => {
      // CRITICAL: Load onboarding data from session context (not deprecated function)
      let data: OnboardingData | null = null
      
      // Try to load from session context first (for authenticated users)
      if (sessionContext?.sessionData?.entrepreneurProfile) {
        const profile = sessionContext.sessionData.entrepreneurProfile
        
        // Check if onboarding is completed OR if profile has actual data (some users might have data but flag not set)
        const hasOnboardingData = !!(profile.businessName || profile.industry || profile.businessStage || 
          (Array.isArray(profile.challenges) && profile.challenges.length > 0) ||
          (typeof profile.challenges === 'string' && profile.challenges.trim() !== '') ||
          profile.biggestGoal || profile.revenueGoal)
        
        if (profile.onboardingCompleted || hasOnboardingData) {
          console.log('✅ Onboarding data detected:', {
            onboardingCompleted: profile.onboardingCompleted,
            hasData: hasOnboardingData,
            businessName: profile.businessName,
            industry: profile.industry
          })
          // Convert entrepreneurProfile to OnboardingData format
          data = {
            name: profile.name || '',
            businessName: profile.businessName || '',
            industry: profile.industry || '',
            experienceLevel: profile.experienceLevel || '',
            businessStage: profile.businessStage || '',
            revenueGoal: profile.revenueGoal || '',
            biggestGoal: profile.biggestGoal || '',
            challenges: Array.isArray(profile.challenges) ? profile.challenges : (profile.challenges ? [profile.challenges] : []),
            targetMarket: profile.targetMarket || '',
            teamSize: profile.teamSize || '',
            primaryRevenue: profile.primaryRevenue || '',
            customerAcquisition: Array.isArray(profile.customerAcquisition) ? profile.customerAcquisition : (profile.customerAcquisition ? [profile.customerAcquisition] : []),
            monthlyRevenue: profile.monthlyRevenue || '',
            keyMetrics: Array.isArray(profile.keyMetrics) ? profile.keyMetrics : (profile.keyMetrics ? [profile.keyMetrics] : []),
            growthStrategy: profile.growthStrategy || '',
            goals: profile.goals || [],
            mindsetAnswers: (profile.mindsetAnswers as any) || {},
            hobbies: profile.hobbies || [],
            favoriteSong: profile.favoriteSong || '',
            revenueModel: profile.primaryRevenue || ''
          }
          if (data) {
            console.log('✅ Loaded onboarding data from session context:', {
              businessName: data.businessName,
              industry: data.industry,
              onboardingCompleted: profile.onboardingCompleted
            })
          }
        }
      }
      
      // Fallback: Try localStorage for unauthenticated users
      if (!data) {
        const localData = loadOnboardingData()
        if (localData) {
          data = localData
          console.log('✅ Loaded onboarding data from localStorage (fallback)')
        }
      }
      
      // CRITICAL: For authenticated users, ALWAYS try fetching from Supabase directly
      // This ensures we get the data even if session context hasn't loaded yet
      if (!data && authUser?.id) {
        console.log('🔄 Trying to fetch profile directly from Supabase for user:', authUser.id)
        // Try to fetch full profile from Supabase
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data: fullProfile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (!error && fullProfile) {
            // Convert Supabase profile to OnboardingData format
            const profileData = fullProfile as any
            const convertedData: OnboardingData = {
              name: profileData.user_name || profileData.full_name || '',
              businessName: profileData.business_name || '',
              industry: Array.isArray(profileData.industry) ? profileData.industry[0] || '' : (profileData.industry || ''),
              experienceLevel: profileData.experience_level || '',
              businessStage: Array.isArray(profileData.business_stage) ? profileData.business_stage[0] || '' : (profileData.business_stage || ''),
              revenueGoal: Array.isArray(profileData.revenue_goal) ? profileData.revenue_goal[0] || '' : (profileData.revenue_goal || ''),
              biggestGoal: Array.isArray(profileData.six_month_goal) ? profileData.six_month_goal[0] || '' : (profileData.six_month_goal || ''),
              challenges: Array.isArray(profileData.biggest_challenges) ? profileData.biggest_challenges : (profileData.biggest_challenges ? [profileData.biggest_challenges] : []),
              targetMarket: Array.isArray(profileData.target_market) ? profileData.target_market[0] || '' : (profileData.target_market || ''),
              teamSize: Array.isArray(profileData.team_size) ? profileData.team_size[0] || '' : (profileData.team_size || ''),
              primaryRevenue: Array.isArray(profileData.revenue_model) ? profileData.revenue_model[0] || '' : (profileData.revenue_model || ''),
              customerAcquisition: Array.isArray(profileData.customer_acquisition) ? profileData.customer_acquisition : (profileData.customer_acquisition ? [profileData.customer_acquisition] : []),
              monthlyRevenue: Array.isArray(profileData.mrr) ? profileData.mrr[0] || '' : (profileData.mrr || ''),
              keyMetrics: Array.isArray(profileData.key_metrics) ? profileData.key_metrics : (profileData.key_metrics ? [profileData.key_metrics] : []),
              growthStrategy: Array.isArray(profileData.growth_strategy) ? profileData.growth_strategy[0] || '' : (profileData.growth_strategy || ''),
              goals: Array.isArray(profileData.goals) ? profileData.goals : (profileData.goals ? [profileData.goals] : []),
              mindsetAnswers: (profileData.mindset_answers as any) || {},
              hobbies: Array.isArray(profileData.hobbies) ? profileData.hobbies : (profileData.hobbies ? [profileData.hobbies] : []),
              favoriteSong: profileData.favorite_song || '',
              revenueModel: Array.isArray(profileData.revenue_model) ? profileData.revenue_model[0] || '' : (profileData.revenue_model || '')
            }
            data = convertedData
            console.log('✅ Loaded onboarding data from Supabase:', {
              businessName: data.businessName,
              industry: data.industry,
              onboardingCompleted: fullProfile.onboarding_completed
            })
          }
        } catch (error) {
          console.warn('Failed to fetch profile from Supabase:', error)
        }
      }
      
      setOnboardingData(data)
      
      // Generate deep focus areas (still using logic-based for now)
      const generatedFocusAreas = generateDeepFocusAreas(data)
      setDeepFocusAreas(generatedFocusAreas)
      
      // CRITICAL: Load suggestions from Supabase first (for authenticated users)
      let loadedFromSupabase = false
      let hasMainSuggestions = false
      
      if (authUser?.id) {
        try {
          const supabaseData = await loadSuggestionsData(authUser.id)
          if (supabaseData) {
            console.log('✅ Loaded suggestions from Supabase:', {
              mainCount: supabaseData.mainSuggestions.length,
              dailyCount: supabaseData.dailySuggestions.length,
              focusAreasCount: supabaseData.deepFocusAreas.length
            })
            
            // Set suggestions from Supabase
            if (supabaseData.mainSuggestions.length > 0) {
              setMainSuggestions(supabaseData.mainSuggestions)
              hasMainSuggestions = true
            }
            if (supabaseData.dailySuggestions.length > 0) {
              setDailySuggestions(supabaseData.dailySuggestions)
            }
            if (supabaseData.deepFocusAreas.length > 0) {
              setDeepFocusAreas(supabaseData.deepFocusAreas)
            }
            if (supabaseData.completedSuggestionIds.length > 0) {
              setCompletedIds(supabaseData.completedSuggestionIds)
            }
            
            loadedFromSupabase = true
          }
        } catch (error) {
          console.warn('Failed to load suggestions from Supabase:', error)
        }
      }
      
      // Load saved completed suggestions (fallback to localStorage)
      if (!loadedFromSupabase) {
        const saved = localStorage.getItem('completedSuggestions')
        if (saved) {
          setCompletedIds(JSON.parse(saved))
        }
      }

      // Load cached recommendations if they exist (only if not loaded from Supabase)
      const cachedMain = !loadedFromSupabase ? localStorage.getItem('mainRecommendations') : null
      const cachedDaily = !loadedFromSupabase ? localStorage.getItem('dailyRecommendations') : null
      
      // Check if cached recommendations are from the old generic system
      let isOldCache = false
      if (cachedMain) {
        try {
          const parsed = JSON.parse(cachedMain)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Check if any recommendation has old generic titles
            isOldCache = parsed.some((rec: any) => 
              rec.title?.includes('Get AI-Powered Insights for') ||
              rec.title?.includes('Build Systems for') ||
              rec.title?.includes('Analyze Your Revenue for') ||
              rec.title === 'Understand Your Competition' ||
              rec.id?.startsWith('gen-')
            )
            
            if (!isOldCache && parsed.length > 0) {
              // New cache - use it
              setMainSuggestions(parsed)
              console.log('✅ Loaded recommendations from localStorage cache')
            } else {
              // Old cache detected - clear it
              console.log('🗑️ Detected old generic recommendations cache - clearing...')
              localStorage.removeItem('mainRecommendations')
              localStorage.removeItem('dailyRecommendations')
            }
          }
        } catch (e) {
          console.error('Error parsing cached main recommendations:', e)
        }
      }
      
      if (cachedDaily && !isOldCache) {
        try {
          const parsed = JSON.parse(cachedDaily)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDailySuggestions(parsed)
          }
        } catch (e) {
          console.error('Error parsing cached daily recommendations:', e)
        }
      }
      
      // If old cache was detected, clear it
      if (isOldCache) {
        setMainSuggestions([])
        setDailySuggestions([])
        localStorage.removeItem('mainRecommendations')
        localStorage.removeItem('dailyRecommendations')
      }
      
      // CRITICAL: Only generate new recommendations if we have NO saved data
      // Saved data takes priority - we should NEVER regenerate on refresh if data exists
      // Check if we have any saved recommendations (from Supabase or localStorage)
      let hasCachedMain = false
      if (cachedMain && !isOldCache) {
        try {
          const parsed = JSON.parse(cachedMain)
          hasCachedMain = Array.isArray(parsed) && parsed.length > 0
        } catch (e) {
          hasCachedMain = false
        }
      }
      
      const hasSavedData = hasMainSuggestions || hasCachedMain
      
      // Check if generate=true is in URL (should be removed immediately)
      const shouldGenerateFromUrl = searchParams.get('generate') === 'true'
      
      // Only generate if we have NO saved data AND we have onboarding data
      // NEVER regenerate if we have saved data - that's the whole point of persistence
      if (!hasSavedData && data) {
        console.log('📝 No saved recommendations found, generating initial recommendations...')
        
        // Show generic recommendations immediately (no loading)
        const genericRecommendations = generateMainRecommendations(data)
        const genericDaily = generateDailyRecommendations(data, new Date())
        setMainSuggestions(genericRecommendations)
        setDailySuggestions(genericDaily)
        
        // Save to Supabase (for authenticated users) and localStorage (fallback)
        if (authUser?.id) {
          try {
            await saveSuggestionsData(authUser.id, {
              mainSuggestions: genericRecommendations,
              dailySuggestions: genericDaily,
              deepFocusAreas: generatedFocusAreas
            })
            console.log('✅ Saved generic recommendations to Supabase')
          } catch (error) {
            console.warn('Failed to save to Supabase, using localStorage:', error)
          }
        }
        
        // Also save to localStorage (for unauthenticated users or as backup)
        localStorage.setItem('mainRecommendations', JSON.stringify(genericRecommendations))
        localStorage.setItem('dailyRecommendations', JSON.stringify(genericDaily))
      }
      
      // CRITICAL: Remove URL parameter if present to prevent regeneration on refresh
      // The "Generate More" button should directly call generateRecommendations(), not use URL params
      if (shouldGenerateFromUrl) {
        console.log('🧹 Removing generate=true from URL to prevent regeneration on refresh...')
        router.replace('/suggestions', { scroll: false })
      }
      
      // If no cached recommendations and no onboarding data, show empty state
      if (!hasSavedData && !data) {
        // Don't use old generic fallback - let user complete onboarding first
        setMainSuggestions([])
        setDailySuggestions([])
      }
      
      setIsLoading(false)
    }

    // Call async function
    loadSuggestions().catch(error => {
      console.error('Error loading suggestions:', error)
    })
  }, [sessionContext?.sessionData?.entrepreneurProfile, profile, authUser?.id, searchParams])

  const generateRecommendations = async (requestDifferent: boolean = false) => {
    // If generating more, set isGeneratingMore flag
    if (requestDifferent) {
      if (isGeneratingMore || isLoading) return
      setIsGeneratingMore(true)
    } else {
      if (isGeneratingMore || isLoading) return
      setIsLoading(true)
    }
    
    // If onboardingData is null, try to fetch it directly from Supabase
    let dataToUse = onboardingData
    
    if (!dataToUse && authUser?.id) {
      console.log('🔄 No onboarding data in state, fetching directly from Supabase...')
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: fullProfile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (!error && fullProfile) {
          const profileData = fullProfile as any
          dataToUse = {
            name: profileData.user_name || profileData.full_name || '',
            businessName: profileData.business_name || '',
            industry: Array.isArray(profileData.industry) ? profileData.industry[0] || '' : (profileData.industry || ''),
            experienceLevel: profileData.experience_level || '',
            businessStage: Array.isArray(profileData.business_stage) ? profileData.business_stage[0] || '' : (profileData.business_stage || ''),
            revenueGoal: Array.isArray(profileData.revenue_goal) ? profileData.revenue_goal[0] || '' : (profileData.revenue_goal || ''),
            biggestGoal: Array.isArray(profileData.six_month_goal) ? profileData.six_month_goal[0] || '' : (profileData.six_month_goal || ''),
            challenges: Array.isArray(profileData.biggest_challenges) ? profileData.biggest_challenges : (profileData.biggest_challenges ? [profileData.biggest_challenges] : []),
            targetMarket: Array.isArray(profileData.target_market) ? profileData.target_market[0] || '' : (profileData.target_market || ''),
            teamSize: Array.isArray(profileData.team_size) ? profileData.team_size[0] || '' : (profileData.team_size || ''),
            primaryRevenue: Array.isArray(profileData.revenue_model) ? profileData.revenue_model[0] || '' : (profileData.revenue_model || ''),
            customerAcquisition: Array.isArray(profileData.customer_acquisition) ? profileData.customer_acquisition : (profileData.customer_acquisition ? [profileData.customer_acquisition] : []),
            monthlyRevenue: Array.isArray(profileData.mrr) ? profileData.mrr[0] || '' : (profileData.mrr || ''),
            keyMetrics: Array.isArray(profileData.key_metrics) ? profileData.key_metrics : (profileData.key_metrics ? [profileData.key_metrics] : []),
            growthStrategy: Array.isArray(profileData.growth_strategy) ? profileData.growth_strategy[0] || '' : (profileData.growth_strategy || ''),
            goals: Array.isArray(profileData.goals) ? profileData.goals : (profileData.goals ? [profileData.goals] : []),
            mindsetAnswers: (profileData.mindset_answers as any) || {},
            hobbies: Array.isArray(profileData.hobbies) ? profileData.hobbies : (profileData.hobbies ? [profileData.hobbies] : []),
            favoriteSong: profileData.favorite_song || '',
            revenueModel: Array.isArray(profileData.revenue_model) ? profileData.revenue_model[0] || '' : (profileData.revenue_model || '')
          }
          // Update state so we have it for next time
          setOnboardingData(dataToUse)
          console.log('✅ Fetched onboarding data from Supabase:', {
            businessName: dataToUse.businessName,
            industry: dataToUse.industry
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile from Supabase:', error)
      }
    }
    
    if (!dataToUse) {
      console.error('❌ No onboarding data available to generate recommendations')
      setIsLoading(false)
      setIsGeneratingMore(false)
      return
    }
    
    try {
      console.log('🔄 Generating AI recommendations from onboarding data...', {
        businessName: dataToUse.businessName,
        businessStage: dataToUse.businessStage,
        industry: dataToUse.industry,
        challenges: dataToUse.challenges,
        requestDifferent
      })
      
      // Create AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 65000) // 65 seconds (5 seconds more than API timeout of 60s)
      
      const apiCall = fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({ 
          onboardingData: dataToUse,
          requestDifferent: requestDifferent ? true : false,
          timestamp: Date.now() // Prevent caching
        }),
        cache: 'no-store',
        signal: controller.signal,
      })

      // Wait for API call - no minimum time, let it take as long as needed (up to 90 seconds)
      const response = await apiCall
      
      // Clear timeout if request completes
      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        const recCount = result.recommendations?.length || 0
        console.log('✅ AI recommendations received:', recCount, 'recommendations', requestDifferent ? '(DIFFERENT)' : '')
        
        if (result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0) {
          // Ensure we have exactly 3 recommendations (API should guarantee this, but validate)
          const recommendations = result.recommendations.slice(0, 3)
          if (recommendations.length !== 3) {
            console.warn(`⚠️ Expected 3 recommendations but got ${recommendations.length}`)
          }
          
          setMainSuggestions(recommendations)
          // Generate daily recommendations
          const dailyRecs = generateDailyRecommendations(dataToUse, new Date())
          setDailySuggestions(dailyRecs)
          
          // Save to Supabase (for authenticated users) and localStorage (fallback)
          if (authUser?.id) {
            try {
              await saveSuggestionsData(authUser.id, {
                mainSuggestions: recommendations,
                dailySuggestions: dailyRecs,
                deepFocusAreas: deepFocusAreas
              })
              console.log('✅ Saved recommendations to Supabase')
            } catch (error) {
              console.warn('Failed to save to Supabase, using localStorage:', error)
            }
          }
          
          // Also save to localStorage (for unauthenticated users or as backup)
          localStorage.setItem('mainRecommendations', JSON.stringify(recommendations))
          localStorage.setItem('dailyRecommendations', JSON.stringify(dailyRecs))
          if (requestDifferent) {
            setIsGeneratingMore(false)
          } else {
            setIsLoading(false)
          }
          return
        } else {
          console.warn('⚠️ API returned empty or invalid recommendations')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ API error:', response.status, errorText)
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      // Don't fallback to old generic recommendations - show error instead
      if (requestDifferent) {
        setIsGeneratingMore(false)
      } else {
        setIsLoading(false)
      }
      // Better error handling with more specific messages
      let errorMessage = 'Failed to generate recommendations. '
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage += 'The request took too long (over 60 seconds). Please try again - the AI may respond faster on retry.'
        } else if (error.message.includes('timeout')) {
          errorMessage += 'The AI is taking longer than expected to process your request. Please try again.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage += error.message || 'Please try again.'
        }
      } else {
        errorMessage += 'Please try again or check your internet connection.'
      }
      
      alert(errorMessage)
    } finally {
      if (requestDifferent) {
        setIsGeneratingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const generateMoreRecommendations = async () => {
    // Generate completely different recommendations using AI
    // Don't use URL parameters - just generate directly
    await generateRecommendations(true)
  }

  const toggleComplete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(cid => cid !== id)
      : [...completedIds, id]
    setCompletedIds(newCompleted)
    
    // Save to Supabase (for authenticated users) and localStorage (fallback)
    if (authUser?.id) {
      try {
        await saveSuggestionsData(authUser.id, {
          completedSuggestionIds: newCompleted
        })
        console.log('✅ Saved completed suggestions to Supabase')
      } catch (error) {
        console.warn('Failed to save to Supabase, using localStorage:', error)
      }
    }
    
    // Also save to localStorage (for unauthenticated users or as backup)
    localStorage.setItem('completedSuggestions', JSON.stringify(newCompleted))
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedSuggestion(expandedSuggestion === id ? null : id)
  }

  const handleDiveDeeper = (suggestion: Suggestion, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Show Bizora loading overlay
    setOpeningBizora(true)
    
    // Format the recommendation details as a prompt for Bizora AI
    const stepsText = suggestion.howToStart.map((step, index) => `${index + 1}. ${step}`).join('\n')
    
    const prompt = `I need help diving deeper into this recommendation from my roadmap: "${suggestion.title}"

Description: ${suggestion.description}

What this means for me: ${suggestion.explanation}

Why this matters: ${suggestion.whyItMatters}

Here are the steps I have:
${stepsText}

Please provide more detailed guidance, additional strategies, and actionable insights to help me successfully implement this recommendation.`
    
    // Navigate to Bizora AI with the prompt
    const bizoraUrl = `/bizora?prompt=${encodeURIComponent(prompt)}`
    router.push(bizoraUrl)
  }

  const handleShare = (suggestion: Suggestion, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Format suggestion for sharing
    let content = `# ${suggestion.title}\n\n`
    content += `**Description:** ${suggestion.description}\n\n`
    content += `## What this means for you\n\n${suggestion.explanation}\n\n`
    content += `## Why this matters\n\n${suggestion.whyItMatters}\n\n`
    content += `## How to get started\n\n`
    suggestion.howToStart.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`
    })
    
    setShareModal({
      isOpen: true,
      content,
      title: suggestion.title
    })
  }

  const allSuggestions = [...mainSuggestions, ...dailySuggestions]
  const categories = ['all', ...new Set(allSuggestions.map(s => s.category))]
  
  const filteredSuggestions = activeFilter === 'all' 
    ? allSuggestions 
    : allSuggestions.filter(s => s.category === activeFilter)

  // Loading messages that rotate
  const loadingMessages = [
    "Generating your personalized roadmap...",
    "Analyzing your business needs...",
    "Crafting detailed recommendations...",
    "Building your success path...",
    "Almost there, hang tight!",
    "Great things take time ⏳"
  ]

  // Rotate loading messages every 3 seconds
  useEffect(() => {
    if (isLoading || isGeneratingMore) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLoading, isGeneratingMore, loadingMessages.length])

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
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-1.5">Your Personalized Roadmap</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Deep recommendations based on your specific challenges and goals
                </p>
              </div>
              {/* Regenerate button - always visible */}
              <button
                onClick={() => generateRecommendations(false)}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Regenerate recommendations"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              {/* Minimal Notion-style spinner */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {loadingMessages[loadingMessageIndex]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 max-w-sm">
                  Analyzing your data and crafting recommendations
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                  This usually takes 20-40 seconds
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600 mt-4">
                <Coffee className="w-3.5 h-3.5" />
                <span>Perfect time for a break</span>
              </div>
            </div>
          ) : mainSuggestions.length === 0 && dailySuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <div className="text-center space-y-4 max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  No Recommendations Yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate personalized recommendations based on your business profile and challenges.
                </p>
                {/* Always show generate button - it will work with or without full onboarding data */}
                <button
                  onClick={() => generateRecommendations(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Recommendations
                    </>
                  )}
                </button>
                {!onboardingData && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Tip: Complete your onboarding for more personalized recommendations.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Deep Focus Areas Section */}
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Deep Focus Areas</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fundamental areas to work on based on your challenges
                  </p>
                </div>

                <div className="space-y-4">
                  {deepFocusAreas.map((area) => {
                    const Icon = iconMap[area.icon] || Sparkles
                    return (
                      <div key={area.id} className="p-5 bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded-lg">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{area.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{area.description}</p>
                            
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{area.explanation}</p>

                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-blue-200 dark:border-blue-800">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  Key Questions to Answer
                                </h4>
                                <ul className="space-y-1.5">
                                  {area.keyQuestions.map((q, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                      <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                                      <span>{q}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  Systems to Create
                                </h4>
                                <ul className="space-y-1.5">
                                  {area.systemsToCreate.map((s, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                      <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Main Recommendations Section */}
              <section>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Main Recommendations</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your top priorities based on your challenges and goals
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateRecommendations(true)}
                      disabled={isLoading || isGeneratingMore || !onboardingData}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingMore ? 'Generating New...' : 'Generate More'}
                    </button>
                  </div>
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
                        onDiveDeeper={handleDiveDeeper}
                        onShare={handleShare}
                      />
                    )
                  })}
                </div>
              </section>

              {/* Daily Recommendations Section */}
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Recommendations for Today</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        onDiveDeeper={handleDiveDeeper}
                        onShare={handleShare}
                      />
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {/* Loading Overlay for Regenerating - Minimal Notion-style */}
          {isGeneratingMore && !isLoading && (
            <div className="fixed inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4 flex flex-col items-center space-y-4 border border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]">
                {/* Minimal spinner */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {loadingMessages[loadingMessageIndex]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Regenerating recommendations
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    This might take 30-60 seconds
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600 pt-2">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Perfect time for a break</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
        messageContent={shareModal.content}
        contentType="Recommendation"
        contentTitle={shareModal.title}
      />
    </div>
  )
}

function SuggestionCard({ 
  suggestion, 
  Icon,
  isExpanded, 
  isCompleted,
  onToggleExpand,
  onToggleComplete,
  onDiveDeeper,
  onShare
}: { 
  suggestion: Suggestion
  Icon: typeof Sparkles
  isExpanded: boolean
  isCompleted: boolean
  onToggleExpand: (id: string, e: React.MouseEvent) => void
  onToggleComplete: (id: string, e: React.MouseEvent) => Promise<void>
  onDiveDeeper: (suggestion: Suggestion, e: React.MouseEvent) => void
  onShare?: (suggestion: Suggestion, e: React.MouseEvent) => void
}) {
  return (
    <Card 
      className={`p-5 transition-all duration-200 cursor-pointer ${
        isCompleted 
          ? 'bg-green-500/5 border-green-500/20 opacity-75' 
          : 'bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 hover:border-gray-300/80 dark:hover:border-gray-700/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.3)]'
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
                {suggestion.estimatedTime}
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
                <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
                  {suggestion.explanation.split(/\n\n+/).filter(p => p.trim()).map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">{paragraph.trim()}</p>
                  ))}
                </div>
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
                <Button
                  variant="outline"
                  onClick={(e) => onToggleComplete(suggestion.id, e)}
                  className={isCompleted ? 'text-green-600 border-green-500/30' : ''}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isCompleted ? 'Completed' : 'Mark as Done'}
                </Button>
                {onShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => onShare(suggestion, e)}
                    className="border-gray-200/60 dark:border-gray-800/60"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
                <button
                  onClick={(e) => onDiveDeeper(suggestion, e)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
                >
                  Dive Deeper to Bizora AI
                </button>
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

// Wrap in Suspense to handle useSearchParams
export default function SuggestionsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading suggestions...</p>
        </div>
      </div>
    }>
      <SuggestionsPage />
    </Suspense>
  )
}
