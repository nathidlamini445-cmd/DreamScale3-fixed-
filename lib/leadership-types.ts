export interface LeadershipStyleAssessment {
  completed: boolean
  results: {
    style: string
    strengths: string[]
    blindSpots: string[]
    adaptations: {
      situation: string
      recommendedApproach: string
    }[]
    score: number
  }
  date: string
  answers: { questionId: string; answer: string }[]
}

export interface Decision {
  id: string
  description: string
  context?: string
  analysis: {
    frameworks: {
      name: string
      analysis: string
    }[]
    pros: string[]
    cons: string[]
    secondOrderEffects: string[]
    caseStudies: string[]
    recommendation?: string
  }
  date: string
}

export interface Communication {
  id: string
  original: string
  improved: string
  type: 'email' | 'message' | 'presentation' | 'tough-message'
  suggestions: {
    clarity: string[]
    impact: string[]
    empathy: string[]
  }
  context?: string
  date: string
}

export interface Conflict {
  id: string
  situation: string
  parties: string[]
  guidance: {
    conversationStructure: string[]
    scripts: string[]
    negotiationTactics: string[]
    steps: {
      step: number
      action: string
      script: string
    }[]
  }
  date: string
}

export interface CEORoutine {
  id: string
  type: 'daily' | 'weekly' | 'monthly'
  name: string
  template: {
    timeBlocks: {
      time: string
      activity: string
      priority: 'high' | 'medium' | 'low'
      energy: 'high' | 'medium' | 'low'
    }[]
    priorities: string[]
    frameworks: string[]
    energyManagement: string[]
  }
  custom: boolean
  date: string
}

export interface LeadershipChallenge {
  id: string
  scenario: string
  category: string
  description: string
  userResponse?: string
  feedback?: {
    strengths: string[]
    improvements: string[]
    score: number
    detailedAnalysis: string
  }
  completed: boolean
  date?: string
}

export interface Feedback360 {
  id: string
  feedback: {
    source: string
    relationship: 'team' | 'peer' | 'mentor' | 'other'
    text: string
    categories: string[]
  }
  analysis: {
    patterns: string[]
    growthAreas: string[]
    strengths: string[]
    developmentPlan: {
      area: string
      actions: string[]
      timeline: string
    }[]
  }
  date: string
}

export interface LeadershipData {
  styleAssessment: LeadershipStyleAssessment | null
  decisions: Decision[]
  communications: Communication[]
  conflicts: Conflict[]
  routines: CEORoutine[]
  challenges: LeadershipChallenge[]
  feedback360: Feedback360[]
}

export const INITIAL_LEADERSHIP_DATA: LeadershipData = {
  styleAssessment: null,
  decisions: [],
  communications: [],
  conflicts: [],
  routines: [],
  challenges: [],
  feedback360: []
}

