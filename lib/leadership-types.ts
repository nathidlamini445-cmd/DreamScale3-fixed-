export interface LeadershipStyleAssessment {
  completed: boolean
  results: {
    style: string
    styleDescription?: string
    strengths: string[]
    blindSpots: string[]
    adaptations: {
      situation: string
      recommendedApproach: string
      keyActions?: string[]
    }[]
    communicationStyle?: string
    decisionMakingApproach?: string
    teamManagementStyle?: string
    conflictResolutionStyle?: string
    developmentAreas?: {
      area: string
      description: string
      specificActions: string[]
      resources: string[]
      timeline: string
    }[]
    famousLeaders?: string[]
    bestUseCases?: string[]
    challenges?: string[]
    score: number
    scoreBreakdown?: {
      vision: number
      communication: number
      decisionMaking: number
      teamBuilding: number
      adaptability: number
    }
  }
  date: string
  answers: { questionId: string; answer: string }[]
}

export interface Decision {
  id: string
  description: string
  context?: string
  analysis: {
    overview?: string
    frameworks: {
      name: string
      analysis: string
      score?: number
      keyInsights?: string[]
    }[]
    pros: string[]
    cons: string[]
    secondOrderEffects: string[]
    thirdOrderEffects?: string[]
    risks?: {
      risk: string
      probability: string
      impact: string
      mitigation: string
    }[]
    opportunities?: string[]
    caseStudies: Array<{
      company?: string
      situation?: string
      decision?: string
      outcome?: string
      lessons?: string
    }> | string[]
    alternatives?: {
      option: string
      pros: string[]
      cons: string[]
      viability: string
      viabilityReasoning?: string
      whenToConsider?: string
    }[]
    timelineConsiderations?: string
    resourceRequirements?: string
    stakeholderImpact?: string
    recommendation?: string
    implementationPlan?: {
      phase: string
      steps: string[]
      timeline: string
      resources: string
    }[]
    successMetrics?: string[]
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
    structure?: string[]
    tone?: string[]
    callToAction?: string[]
  }
  analysis?: {
    currentTone?: string
    recommendedTone?: string
    keyMessages?: string[]
    emotionalImpact?: string
    persuasiveness?: string
  }
  alternatives?: {
    version: string
    useCase: string
    rationale: string
  }[]
  bestPractices?: string[]
  commonMistakes?: string[]
  followUp?: string
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
      rationale?: string
      potentialResponses?: string[]
      handlingObjections?: string
    }[]
    rootCauseAnalysis?: string
    emotionalIntelligence?: {
      emotions?: string[]
      acknowledgment?: string
      deEscalation?: string
    }
    commonGround?: string[]
    solutionOptions?: {
      option: string
      pros: string[]
      cons: string[]
      viability: string
    }[]
    followUpPlan?: {
      immediate?: string[]
      shortTerm?: string[]
      longTerm?: string[]
    }
    preventionStrategies?: string[]
    redFlags?: string[]
    successMetrics?: string[]
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
  simulation?: {
    simulation?: string
    keyChallenges?: string[]
    stakeholders?: {
      name: string
      role: string
      perspective: string
      concerns: string[]
      interests: string[]
    }[]
    timeline?: string
    potentialOutcomes?: {
      outcome: string
      probability: string
      impact: string
      prevention: string
    }[]
    considerations?: string[]
    bestPractices?: string[]
    commonMistakes?: string[]
    strengths?: string[]
    improvements?: string[]
    score?: number
    analysis?: string
    recommendedApproach?: string
    resources?: string[]
  }
  feedback?: {
    strengths: string[]
    improvements: string[]
    score: number
    scoreBreakdown?: {
      communication: number
      decisionMaking: number
      emotionalIntelligence: number
      strategicThinking: number
      relationshipManagement: number
    }
    detailedAnalysis: string
    whatWorkedWell?: string[]
    whatCouldBeBetter?: string[]
    alternativeApproaches?: {
      approach: string
      pros: string[]
      cons: string[]
      whenToUse: string
    }[]
    lessonsLearned?: string[]
    nextSteps?: string[]
    resources?: string[]
    realWorldExamples?: {
      leader: string
      situation: string
      approach: string
      outcome: string
    }[]
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
    themes?: string[]
    growthAreas: Array<{
      area?: string
      description?: string
      impact?: string
      priority?: string
      specificActions?: string[]
      resources?: string[]
      timeline?: string
      successMetrics?: string[]
    }> | string[]
    strengths: Array<{
      strength?: string
      description?: string
      howToLeverage?: string
      examples?: string[]
    }> | string[]
    sentimentAnalysis?: {
      overall?: string
      breakdown?: {
        positive?: string[]
        constructive?: string[]
        concerns?: string[]
      }
    }
    developmentPlan: {
      area: string
      description?: string
      actions: string[]
      resources?: string[]
      timeline: string
      successMetrics?: string[]
      checkIns?: string[]
    }[]
    quickWins?: string[]
    longTermGoals?: string[]
    recommendations?: string
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

