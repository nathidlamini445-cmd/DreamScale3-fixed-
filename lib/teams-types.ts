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
    }
    optimalCompositions: {
      projectType: string
      recommendedMembers: string[]
      reasoning: string
    }[]
    skillGaps: {
      gap: string
      impact: string
      suggestedHiringProfile: {
        role: string
        skills: string[]
        traits: string[]
      }
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
    }
  }
  date: string
}

export interface SmartTaskAssignment {
  id: string
  projectName: string
  tasks: Task[]
  teamMembers: TeamMember[]
  assignmentStrategy: string
  date: string
}

export interface TeamHealthMetric {
  id: string
  metric: string
  value: number
  trend: 'improving' | 'stable' | 'declining'
  date: string
}

export interface TeamHealthMonitor {
  id: string
  teamName: string
  overallHealth: number // 0-100
  metrics: {
    morale: TeamHealthMetric
    productivity: TeamHealthMetric
    collaboration: TeamHealthMetric
    communication: TeamHealthMetric
  }
  warnings: {
    type: 'burnout' | 'conflict' | 'low-productivity' | 'communication-breakdown'
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestedInterventions: string[]
  }[]
  suggestions: {
    type: 'team-building' | 'process-improvement' | 'communication' | 'wellness'
    activity: string
    description: string
    priority: 'low' | 'medium' | 'high'
  }[]
  date: string
}

export interface CoFounderProfile {
  id: string
  name: string
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
}

export interface CoFounderMatch {
  id: string
  profile1: CoFounderProfile
  profile2: CoFounderProfile
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
    }[]
  }
  purpose: string
  participants: string[]
  aiSuggestions: {
    whyNeeded: string
    bestPractices: string[]
    commonMistakes: string[]
  }
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

