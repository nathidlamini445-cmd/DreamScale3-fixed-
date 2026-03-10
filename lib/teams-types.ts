export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
  strengths: string[]
  workStyle: string
  communicationPreference: 'direct' | 'diplomatic' | 'analytical' | 'collaborative'
  skills: string[]
  workload: number // 0-100
  performanceHistory: {
    taskType: string
    score: number
    date: string
  }[]
}

export interface TeamDNAAnalysis {
  id: string
  teamName: string
  members: TeamMember[]
  analysis: {
    teamComposition: {
      strengths: string[]
      gaps: string[]
      recommendations: string[]
      diversityAnalysis?: string
      collaborationPotential?: string
      conflictRisk?: string
      communicationStyle?: string
    }
    optimalCompositions: {
      projectType: string
      recommendedMembers: string[]
      reasoning: string
      expectedOutcomes?: string[]
      potentialChallenges?: string[]
      successFactors?: string[]
    }[]
    skillGaps: {
      gap: string
      impact: string
      urgency?: string
      suggestedHiringProfile: {
        role: string
        skills: string[]
        traits: string[]
        experience?: string
        personalityFit?: string
      }
      alternatives?: string[]
      timeline?: string
    }[]
    teamDynamics?: {
      workStyleCompatibility?: string
      communicationPatterns?: string
      leadershipStructure?: string
      motivationFactors?: string
    }
    growthOpportunities?: {
      opportunity: string
      description: string
      benefits: string[]
      implementation: string
      timeline: string
    }[]
    riskFactors?: {
      risk: string
      impact: string
      mitigation: string
      priority: string
    }[]
  }
  date: string
}

export interface Task {
  id: string
  title: string
  description: string
  project: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  assignedTo?: string
  assignedBy?: string
  dueDate?: string
  estimatedHours?: number
  tags: string[]
  aiAssignment: {
    assignedMember: string
    reasoning: string
    factors: {
      strengthMatch: number
      workloadBalance: number
      growthOpportunity: number
      pastPerformance: number
      collaborationFit?: number
      urgencyMatch?: number
    }
    alternativeAssignments?: {
      memberId: string
      reasoning: string
      pros: string[]
      cons: string[]
    }[]
    estimatedCompletion?: string
    supportNeeded?: string[]
    successFactors?: string[]
  }
  date: string
}

export interface SmartTaskAssignment {
  id: string
  projectName: string
  tasks: Task[]
  teamMembers: TeamMember[]
  assignmentStrategy: string
  workloadAnalysis?: {
    before?: string
    after?: string
    balance?: string
    recommendations?: string[]
  }
  teamDynamics?: {
    collaborationOpportunities?: string[]
    potentialBottlenecks?: string[]
    recommendedPairings?: {
      members: string[]
      reason: string
      tasks: string[]
    }[]
  }
  risks?: {
    risk: string
    impact: string
    mitigation: string
    priority: string
  }[]
  optimizationSuggestions?: string[]
  date: string
}

export interface TeamHealthMetric {
  id: string
  metric: string
  value: number
  trend: 'improving' | 'stable' | 'declining'
  date: string
  details?: string
  indicators?: string[]
  drivers?: string[]
}

export interface TeamHealthMonitor {
  id: string
  teamName: string
  overallHealth: number // 0-100
  healthBreakdown?: {
    emotional?: number
    physical?: number
    mental?: number
    social?: number
    professional?: number
  }
  metrics: {
    morale: TeamHealthMetric
    productivity: TeamHealthMetric
    collaboration: TeamHealthMetric
    communication: TeamHealthMetric
    engagement?: TeamHealthMetric
    innovation?: TeamHealthMetric
  }
  warnings: {
    type: 'burnout' | 'conflict' | 'low-productivity' | 'communication-breakdown'
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestedInterventions: string[]
    affectedMembers?: string
    rootCauses?: string[]
    timeline?: string
    urgency?: 'High' | 'Medium' | 'Low'
  }[]
  suggestions: {
    type: 'team-building' | 'process-improvement' | 'communication' | 'wellness'
    activity: string
    description: string
    priority: 'low' | 'medium' | 'high'
    expectedOutcomes?: string[]
    implementation?: string
    resources?: string[]
    timeline?: string
    successMetrics?: string[]
  }[]
  strengths?: string[]
  areasForImprovement?: {
    area: string
    description: string
    impact: string
    priority: 'High' | 'Medium' | 'Low'
    actions: string[]
  }[]
  teamCulture?: {
    values?: string[]
    norms?: string[]
    dynamics?: string
    recommendations?: string[]
  }
  actionPlan?: {
    immediate?: string[]
    shortTerm?: string[]
    longTerm?: string[]
  }
  benchmarks?: {
    industryAverage?: string
    bestPractices?: string[]
  }
  date: string
}

export interface CoFounderProfile {
  id: string
  name: string
  email?: string
  skills: string[]
  values: string[]
  availability: 'full-time' | 'part-time' | 'consulting'
  experience: string
  location?: string
  lookingFor: string[]
  preferences: {
    equity: string
    commitment: string
    workingStyle: string
  }
  date: string
  linkedinUrl?: string
  profilePictureUrl?: string
}

export interface MatchingCharacteristics {
  mustMatch: {
    skills: string[]
    values: string[]
    availability?: string
    experience?: string
    commitment?: string
    workingStyle?: string
    personalityTraits?: string[]
    riskTolerance?: string
    financialSituation?: string
    network?: string
    technicalProficiency?: string
    leadershipStyle?: string
    communicationStyle?: string
  }
  canMatch: {
    skills: string[]
    values?: string[]
    location?: string
    additionalTraits?: string[]
    industryExperience?: string
    education?: string
    ageRange?: string
    lifestyle?: string
    hobbies?: string[]
    previousStartupExperience?: string
    investorRelationships?: string
    customerRelationships?: string
    mediaPresence?: string
  }
}

export interface CoFounderMatch {
  id: string
  profile1: CoFounderProfile
  profile2?: CoFounderProfile // Optional for backward compatibility
  matchingCharacteristics?: MatchingCharacteristics // New: characteristics to match with
  matchScore: number // 0-100
  analysis: {
    complementarySkills: string[]
    sharedValues: string[]
    potentialChallenges: string[]
    collaborationFit: number
    recommendation: string
  }
  trialPeriod?: {
    startDate: string
    endDate: string
    milestones: string[]
  }
  date: string
  isRealMatch?: boolean // Indicates if this is a real profile match or AI-generated
}

export interface TeamRitual {
  id: string
  name: string
  type: 'daily-standup' | 'weekly-review' | 'retrospective' | 'one-on-one' | 'planning' | 'custom'
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed'
  duration: number // minutes
  structure: {
    sections: {
      name: string
      duration: number
      description: string
      activities?: string[]
      facilitation?: string
      outcomes?: string[]
      tips?: string[]
    }[]
  }
  purpose: string
  participants: string[]
  preparation?: {
    beforehand?: string[]
    materials?: string[]
    setup?: string
  }
  aiSuggestions: {
    whyNeeded: string
    bestPractices: string[]
    commonMistakes: string[]
    adaptations?: {
      scenario: string
      modification: string
    }[]
    successFactors?: string[]
    measuringSuccess?: string[]
  }
  followUp?: {
    immediate?: string[]
    afterRitual?: string[]
    longTerm?: string[]
  }
  variations?: {
    name: string
    description: string
    modifications: string[]
  }[]
  resources?: string[]
  troubleshooting?: {
    issue: string
    solution: string
    prevention: string
  }[]
  date: string
}

export interface TeamsData {
  dnaAnalyses: TeamDNAAnalysis[]
  taskAssignments: SmartTaskAssignment[]
  healthMonitors: TeamHealthMonitor[]
  coFounderMatches: CoFounderMatch[]
  rituals: TeamRitual[]
  members: TeamMember[]
}

export const INITIAL_TEAMS_DATA: TeamsData = {
  dnaAnalyses: [],
  taskAssignments: [],
  healthMonitors: [],
  coFounderMatches: [],
  rituals: [],
  members: []
}

