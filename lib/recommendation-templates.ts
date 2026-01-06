/**
 * 60 Title Bases for Business Advice Content
 * These titles contain placeholders that will be filled in by AI based on user's onboarding data
 * Placeholders: [Industry], [Stage], [Current Revenue], [Goal Revenue], [Current MRR], [Goal MRR],
 * [Team Size], [Target Market], [Acquisition Method], [Revenue Model], [Key Metric], [Growth Strategy], [Next Stage]
 */

export interface RecommendationTemplate {
  id: string
  baseTitle: string
  category: string
  priority: 'high' | 'medium' | 'low'
  feature: string
  featureLink: string
  icon: string
  selectionCriteria: {
    challenges?: string[]
    businessStage?: string[]
    industry?: string[]
    targetMarket?: string[]
    teamSize?: string[]
    revenueModel?: string[]
    acquisitionMethod?: string[]
    growthStrategy?: string[]
    keyMetrics?: string[]
    hasRevenue?: boolean
    minRevenue?: string
  }
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  // Customer Acquisition Focus (10)
  {
    id: 'ca-1',
    baseTitle: 'How [Industry] Businesses in [Stage] Can Acquire Their First 100 Customers Without Paid Ads',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Customer Acquisition'],
      businessStage: ['Idea/Planning', 'MVP Development', 'Early Stage'],
    },
  },
  {
    id: 'ca-2',
    baseTitle: 'The [Industry] Founder\'s Guide to Scaling Customer Acquisition from [Current Revenue] to [Goal Revenue]',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Customer Acquisition', 'Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'ca-3',
    baseTitle: 'Why Your [Acquisition Method] Isn\'t Working: [Industry] Solutions for [Stage] Companies',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Customer Acquisition', 'Marketing'],
    },
  },
  {
    id: 'ca-4',
    baseTitle: 'From [Current MRR] to [Goal MRR]: A Customer Acquisition Roadmap for [Industry] Businesses',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Customer Acquisition'],
      hasRevenue: true,
    },
  },
  {
    id: 'ca-5',
    baseTitle: 'How to Build a Predictable Customer Acquisition System for [Industry] Companies Using [Acquisition Method]',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Customer Acquisition', 'Operations'],
    },
  },
  {
    id: 'ca-6',
    baseTitle: '[Team Size] Team? Here\'s How to Scale Customer Acquisition in [Industry] Without Burning Out',
    category: 'Customer Growth',
    priority: 'medium',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Customer Acquisition', 'Team Building'],
    },
  },
  {
    id: 'ca-7',
    baseTitle: 'The Ultimate Customer Acquisition Framework for [Industry] Businesses Targeting [Target Market]',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Customer Acquisition'],
    },
  },
  {
    id: 'ca-8',
    baseTitle: 'How to Cut Your Customer Acquisition Cost in Half: [Industry] Strategies for [Stage] Companies',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Customer Acquisition'],
      hasRevenue: true,
    },
  },
  {
    id: 'ca-9',
    baseTitle: '[Acquisition Method] Not Scaling? Here\'s What [Industry] Companies Should Do Instead',
    category: 'Customer Growth',
    priority: 'medium',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Customer Acquisition', 'Scaling'],
    },
  },
  {
    id: 'ca-10',
    baseTitle: 'Building a [Revenue Goal] Business: Customer Acquisition Tactics for [Industry] [Stage] Companies',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Customer Acquisition'],
    },
  },

  // Scaling Challenges (10)
  {
    id: 'sc-1',
    baseTitle: 'How to Scale Your [Industry] Business from [Team Size] Without Losing Quality',
    category: 'Scaling',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Scaling', 'Team Building'],
    },
  },
  {
    id: 'sc-2',
    baseTitle: 'The [Stage] Company\'s Guide to Scaling [Industry] Operations on a Tight Budget',
    category: 'Scaling',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Scaling', 'Operations'],
    },
  },
  {
    id: 'sc-3',
    baseTitle: 'Scaling Your [Revenue Model] Business: Lessons from [Industry] Companies That Made It',
    category: 'Scaling',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'sc-4',
    baseTitle: 'How [Industry] Founders Scale from [Current Revenue] to [Goal Revenue] in 12 months',
    category: 'Scaling',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'sc-5',
    baseTitle: 'Breaking Through the [Current Revenue] Ceiling: Scaling Strategies for [Industry] Businesses',
    category: 'Scaling',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'sc-6',
    baseTitle: 'From Solo to [Team Size]: Building Systems That Scale Your [Industry] Business',
    category: 'Scaling',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Scaling', 'Operations'],
      teamSize: ['Solo Founder'],
    },
  },
  {
    id: 'sc-7',
    baseTitle: 'How to Scale [Acquisition Method] for [Industry] Companies Without Increasing Costs',
    category: 'Scaling',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Scaling', 'Customer Acquisition'],
    },
  },
  {
    id: 'sc-8',
    baseTitle: 'The [Industry] Scaling Playbook: Growing from [Stage] to [Next Stage] Successfully',
    category: 'Scaling',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Scaling'],
    },
  },
  {
    id: 'sc-9',
    baseTitle: 'Scaling Bottlenecks in [Industry]: How to Grow Beyond [Current MRR] MRR',
    category: 'Scaling',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'sc-10',
    baseTitle: 'How [Target Market]-Focused [Industry] Companies Scale Without Losing Their Soul',
    category: 'Scaling',
    priority: 'medium',
    feature: 'Leadership',
    featureLink: '/marketplace',
    icon: 'crown',
    selectionCriteria: {
      challenges: ['Scaling'],
    },
  },

  // Product Development (10)
  {
    id: 'pd-1',
    baseTitle: 'Building Products [Target Market] Actually Want: A Guide for [Industry] [Stage] Companies',
    category: 'Product',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development'],
      businessStage: ['Idea/Planning', 'MVP Development', 'Early Stage'],
    },
  },
  {
    id: 'pd-2',
    baseTitle: 'From MVP to Product-Market Fit: [Industry] Product Development for [Stage] Businesses',
    category: 'Product',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development'],
      businessStage: ['MVP Development', 'Early Stage'],
    },
  },
  {
    id: 'pd-3',
    baseTitle: 'How to Prioritize Product Features When You\'re a [Team Size] [Industry] Team',
    category: 'Product',
    priority: 'medium',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Product Development', 'Team Building'],
    },
  },
  {
    id: 'pd-4',
    baseTitle: 'The [Industry] Product Development Framework for Businesses at [Stage]',
    category: 'Product',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development'],
    },
  },
  {
    id: 'pd-5',
    baseTitle: 'Building Your [Industry] Product While Tracking [Key Metric]: A Founder\'s Guide',
    category: 'Product',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Product Development'],
    },
  },
  {
    id: 'pd-6',
    baseTitle: 'Product Development on a Budget: How [Industry] Companies Reach [Revenue Goal]',
    category: 'Product',
    priority: 'medium',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development', 'Funding'],
    },
  },
  {
    id: 'pd-7',
    baseTitle: 'How to Balance Product Development and Growth in [Industry] [Stage] Companies',
    category: 'Product',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development', 'Scaling'],
    },
  },
  {
    id: 'pd-8',
    baseTitle: 'The [Growth Strategy] Approach to Product Development for [Industry] Businesses',
    category: 'Product',
    priority: 'medium',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development'],
    },
  },
  {
    id: 'pd-9',
    baseTitle: 'Building Products That Support [Revenue Model] in the [Industry] Space',
    category: 'Product',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Product Development'],
    },
  },
  {
    id: 'pd-10',
    baseTitle: 'From Idea to Launch: Product Development for [Target Market] in [Industry]',
    category: 'Product',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Product Development'],
      businessStage: ['Idea/Planning', 'MVP Development'],
    },
  },

  // Funding & Financial Strategy (10)
  {
    id: 'ff-1',
    baseTitle: 'How to Reach [Revenue Goal] Without External Funding: [Industry] Bootstrap Strategies',
    category: 'Revenue',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Funding'],
    },
  },
  {
    id: 'ff-2',
    baseTitle: 'When to Raise Funding vs. Bootstrap: Advice for [Industry] [Stage] Companies',
    category: 'Revenue',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Funding'],
    },
  },
  {
    id: 'ff-3',
    baseTitle: 'The [Industry] Founder\'s Guide to Managing Cash Flow at [Current MRR] MRR',
    category: 'Revenue',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      hasRevenue: true,
    },
  },
  {
    id: 'ff-4',
    baseTitle: 'How to Fund Growth from [Current Revenue] to [Goal Revenue] in [Industry]',
    category: 'Revenue',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Funding', 'Scaling'],
      hasRevenue: true,
    },
  },
  {
    id: 'ff-5',
    baseTitle: 'Building a Fundable [Industry] Business: What Investors Look for at [Stage]',
    category: 'Revenue',
    priority: 'medium',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Funding'],
    },
  },
  {
    id: 'ff-6',
    baseTitle: 'Self-Funding Your [Industry] Business: Getting to [Revenue Goal] on Revenue Alone',
    category: 'Revenue',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Funding'],
    },
  },
  {
    id: 'ff-7',
    baseTitle: 'Financial Planning for [Industry] Companies Using [Revenue Model]',
    category: 'Revenue',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      hasRevenue: true,
    },
  },
  {
    id: 'ff-8',
    baseTitle: 'How [Industry] Businesses Optimize [Key Metric] to Attract Investors',
    category: 'Revenue',
    priority: 'medium',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Funding'],
    },
  },
  {
    id: 'ff-9',
    baseTitle: 'The [Team Size] Team\'s Guide to Financial Management in [Industry]',
    category: 'Revenue',
    priority: 'medium',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      hasRevenue: true,
    },
  },
  {
    id: 'ff-10',
    baseTitle: 'Funding Your Growth: [Industry] Strategies for [Stage] to [Next Stage] Transition',
    category: 'Revenue',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Funding', 'Scaling'],
    },
  },

  // Team Building & Operations (10)
  {
    id: 'tb-1',
    baseTitle: 'Building Your First Team in [Industry]: From Solo to [Team Size] People',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building'],
      teamSize: ['Solo Founder'],
    },
  },
  {
    id: 'tb-2',
    baseTitle: 'How to Hire for Growth: Team Building Strategies for [Industry] [Stage] Companies',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building', 'Scaling'],
    },
  },
  {
    id: 'tb-3',
    baseTitle: 'Managing a [Team Size] Team While Scaling [Industry] Operations',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building', 'Operations', 'Scaling'],
    },
  },
  {
    id: 'tb-4',
    baseTitle: 'The [Industry] Founder\'s Guide to Delegation and Team Systems',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building', 'Operations'],
    },
  },
  {
    id: 'tb-5',
    baseTitle: 'Building a Remote-First Team for Your [Industry] [Stage] Business',
    category: 'Team',
    priority: 'medium',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building'],
    },
  },
  {
    id: 'tb-6',
    baseTitle: 'How to Build an Operations Team That Scales Your [Industry] Business',
    category: 'Operations',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Operations', 'Scaling'],
    },
  },
  {
    id: 'tb-7',
    baseTitle: 'From Founder-Led to Team-Led: Transitioning Your [Industry] Business at [Stage]',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building', 'Operations'],
    },
  },
  {
    id: 'tb-8',
    baseTitle: 'Hiring Your First [Role] for a [Industry] Company at [Current Revenue]',
    category: 'Team',
    priority: 'high',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building'],
      hasRevenue: true,
    },
  },
  {
    id: 'tb-9',
    baseTitle: 'Team Building on a Budget: How [Industry] Companies Grow from [Team Size]',
    category: 'Team',
    priority: 'medium',
    feature: 'Teams',
    featureLink: '/teams',
    icon: 'users',
    selectionCriteria: {
      challenges: ['Team Building', 'Funding'],
    },
  },
  {
    id: 'tb-10',
    baseTitle: 'Building Culture While Scaling: [Industry] Advice for [Stage] Companies',
    category: 'Team',
    priority: 'medium',
    feature: 'Leadership',
    featureLink: '/marketplace',
    icon: 'crown',
    selectionCriteria: {
      challenges: ['Team Building', 'Scaling'],
    },
  },

  // Marketing Strategy (10)
  {
    id: 'ms-1',
    baseTitle: 'How to Build a [Growth Strategy] Engine for [Industry] Companies at [Stage]',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing', 'Customer Acquisition'],
    },
  },
  {
    id: 'ms-2',
    baseTitle: 'From [Acquisition Method] to Omnichannel: Marketing Evolution for [Industry] Businesses',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing'],
    },
  },
  {
    id: 'ms-3',
    baseTitle: 'The [Industry] Marketing Playbook for Growing [Target Market] Customer Base',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing', 'Customer Acquisition'],
    },
  },
  {
    id: 'ms-4',
    baseTitle: 'How to Double Down on [Acquisition Method] for [Industry] [Stage] Companies',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing'],
    },
  },
  {
    id: 'ms-5',
    baseTitle: 'Building a Marketing System That Takes You from [Current Revenue] to [Goal Revenue]',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Systems',
    featureLink: '/revenue?tab=systems',
    icon: 'settings',
    selectionCriteria: {
      challenges: ['Marketing', 'Customer Acquisition'],
      hasRevenue: true,
    },
  },
  {
    id: 'ms-6',
    baseTitle: 'Content Marketing for [Industry] Companies: A [Stage] Business Guide',
    category: 'Customer Growth',
    priority: 'medium',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing'],
      acquisitionMethod: ['Content Marketing'],
    },
  },
  {
    id: 'ms-7',
    baseTitle: 'How [Industry] Businesses Optimize [Key Metric] Through Better Marketing',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Revenue Intelligence',
    featureLink: '/revenue-intelligence',
    icon: 'dollar',
    selectionCriteria: {
      challenges: ['Marketing'],
    },
  },
  {
    id: 'ms-8',
    baseTitle: 'The [Revenue Model] Marketing Strategy: Growing [Industry] Businesses Sustainably',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing'],
    },
  },
  {
    id: 'ms-9',
    baseTitle: 'From Zero to [Goal MRR] MRR: Marketing Strategies for [Industry] [Stage] Companies',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing', 'Customer Acquisition'],
    },
  },
  {
    id: 'ms-10',
    baseTitle: 'How to Build a Marketing Machine for [Target Market] in the [Industry] Space',
    category: 'Customer Growth',
    priority: 'high',
    feature: 'Discover',
    featureLink: '/discover',
    icon: 'compass',
    selectionCriteria: {
      challenges: ['Marketing'],
    },
  },
]

/**
 * Get the next stage based on current stage
 */
export function getNextStage(currentStage: string): string {
  const stageMap: { [key: string]: string } = {
    'Idea/Planning': 'MVP Development',
    'MVP Development': 'Early Stage',
    'Early Stage': 'Growth Stage',
    'Growth Stage': 'Scaling',
    'Scaling': 'Established',
    'Established': 'Scaling',
  }
  return stageMap[currentStage] || 'Growth Stage'
}

