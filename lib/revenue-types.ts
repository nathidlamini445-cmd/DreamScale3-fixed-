export interface RevenueDashboard {
  id: string
  name: string
  mrr: number
  arr: number
  churnRate: number
  runway: number // months
  forecast: {
    month: string
    projectedRevenue: number
    confidence: number
  }[]
  date: string
}

export interface RevenueOptimization {
  id: string
  businessInfo?: string
  analysis: {
    pricingChanges: {
      suggestion: string
      impact: string
      implementation: string[]
    }[]
    newRevenueStreams: {
      stream: string
      potential: string
      effort: 'low' | 'medium' | 'high'
      timeline: string
    }[]
    upsellOpportunities: {
      opportunity: string
      targetSegment: string
      potentialRevenue: string
      approach: string[]
    }[]
    costReductions: {
      area: string
      currentCost: string
      potentialSavings: string
      actionItems: string[]
    }[]
  }
  date: string
}

export interface PricingStrategy {
  id: string
  productName: string
  currentPricing: {
    tier: string
    price: number
    features: string[]
  }[]
  competitorPricing: {
    competitor: string
    pricing: {
      tier: string
      price: number
    }[]
  }[]
  aiRecommendations: {
    optimalPricing: {
      tier: string
      price: number
      reasoning: string
    }[]
    marketPosition: string
    suggestions: string[]
  }
  abTests: {
    id: string
    name: string
    variantA: { price: number; features: string[] }
    variantB: { price: number; features: string[] }
    status: 'draft' | 'running' | 'completed'
    results?: {
      variant: 'A' | 'B'
      conversionRate: number
      revenue: number
    }
  }[]
  date: string
}

export interface RevenueGoal {
  id: string
  name: string
  target: number
  timeframe: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  currentProgress: number
  weeklyActions: {
    week: string
    actions: string[]
    target: number
  }[]
  milestones: {
    milestone: string
    target: number
    achieved: boolean
    achievedDate?: string
  }[]
  /** Venture Quest goal id when linked for action sync */
  ventureQuestGoalId?: string
  date: string
}

export type RevenueCheckInDriver =
  | 'outreach'
  | 'pricing'
  | 'new-offer'
  | 'retention'
  | 'partnerships'
  | 'other'

export interface WeeklyRevenueCheckIn {
  id: string
  weekKey: string
  amount: number
  driver: RevenueCheckInDriver
  note?: string
  date: string
}

export interface LTVAnalysis {
  id: string
  customerSegment: string
  averageLTV: number
  cac: number // Customer Acquisition Cost
  ltvCacRatio: number
  analysis: {
    segmentValue: string
    acquisitionFocus: string[]
    recommendations: string[]
  }
  predictions: {
    timeframe: string
    predictedLTV: number
    confidence: number
  }[]
  date: string
}

export interface ScenarioPlan {
  id: string
  name: string
  scenario: string
  variables: {
    name: string
    change: string
    value: number
  }[]
  projections: {
    month: string
    revenue: number
    impact: number
  }[]
  analysis: {
    summary: string
    risks: string[]
    opportunities: string[]
    recommendations: string[]
  }
  date: string
}

export interface RevenueData {
  dashboards: RevenueDashboard[]
  optimizations: RevenueOptimization[]
  pricingStrategies: PricingStrategy[]
  goals: RevenueGoal[]
  ltvAnalyses: LTVAnalysis[]
  scenarios: ScenarioPlan[]
  weeklyCheckIns: WeeklyRevenueCheckIn[]
}

export const INITIAL_REVENUE_DATA: RevenueData = {
  dashboards: [],
  optimizations: [],
  pricingStrategies: [],
  goals: [],
  ltvAnalyses: [],
  scenarios: [],
  weeklyCheckIns: [],
}

