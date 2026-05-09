import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { onboardingData } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.8')

    // Extract onboarding data
    const businessName = Array.isArray(onboardingData?.businessName) 
      ? onboardingData.businessName[0] 
      : onboardingData?.businessName || 'their business'
    const industry = Array.isArray(onboardingData?.industry) 
      ? onboardingData.industry[0] 
      : onboardingData?.industry || 'General'
    const businessStage = Array.isArray(onboardingData?.businessStage) 
      ? onboardingData.businessStage[0] 
      : onboardingData?.businessStage || 'Early Stage'
    const challenges = Array.isArray(onboardingData?.challenges) 
      ? onboardingData.challenges 
      : (onboardingData?.challenges ? [onboardingData.challenges] : [])
    const teamSize = Array.isArray(onboardingData?.teamSize) 
      ? onboardingData.teamSize[0] 
      : onboardingData?.teamSize || 'Solo Founder'
    const revenueGoal = Array.isArray(onboardingData?.revenueGoal) 
      ? onboardingData.revenueGoal[0] 
      : onboardingData?.revenueGoal
    const monthlyRevenue = Array.isArray(onboardingData?.monthlyRevenue) 
      ? onboardingData.monthlyRevenue[0] 
      : onboardingData?.monthlyRevenue
    const primaryRevenue = Array.isArray(onboardingData?.primaryRevenue) 
      ? onboardingData.primaryRevenue[0] 
      : onboardingData?.primaryRevenue
    const targetMarket = Array.isArray(onboardingData?.targetMarket) 
      ? onboardingData.targetMarket[0] 
      : onboardingData?.targetMarket

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      }
    })

    // Generate all setup data
    const prompt = `You are DreamScale Auto-Setup AI. Based on the user's onboarding data, generate a complete workspace setup with systems, team roles, revenue goals, and leadership frameworks.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Business Stage: ${businessStage}
- Team Size: ${teamSize}
- Challenges: ${challenges.length > 0 ? challenges.join(', ') : 'None specified'}
- Revenue Goal: ${revenueGoal || 'Not specified'}
- Monthly Revenue: ${monthlyRevenue || 'Not specified'}
- Primary Revenue Model: ${primaryRevenue || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}

Generate a JSON response with this exact structure:
{
  "systems": [
    {
      "id": "system-1",
      "name": "System name based on their challenges/industry",
      "type": "System type",
      "status": "healthy",
      "lastAnalyzed": "${new Date().toISOString()}",
      "workflows": [
        {
          "id": "workflow-1",
          "name": "Workflow name",
          "steps": ["step 1", "step 2", "step 3"],
          "visualFlow": "mermaid diagram syntax"
        }
      ],
      "tools": ["tool1", "tool2"],
      "roles": [
        {
          "name": "Role name",
          "responsibilities": ["responsibility 1", "responsibility 2"]
        }
      ],
      "metrics": [
        {
          "name": "Metric name",
          "currentValue": 0,
          "targetValue": 100,
          "unit": "unit"
        }
      ],
      "automationOpportunities": ["opportunity 1"],
      "visualFlow": "mermaid diagram"
    }
  ],
  "teamRoles": [
    {
      "id": "role-1",
      "name": "Role name",
      "description": "Role description",
      "responsibilities": ["responsibility 1", "responsibility 2"],
      "requiredSkills": ["skill1", "skill2"],
      "reportingTo": "CEO/Founder",
      "decisionAuthority": "Can make decisions on X",
      "successMetrics": ["metric 1", "metric 2"]
    }
  ],
  "revenueGoals": [
    {
      "id": "goal-1",
      "name": "Goal name based on their revenue goal",
      "target": 100000,
      "timeframe": "yearly",
      "startDate": "${new Date().toISOString()}",
      "endDate": "${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}",
      "currentProgress": 0,
      "weeklyActions": [
        {
          "week": "Week 1",
          "actions": ["action 1", "action 2"],
          "target": 2000
        }
      ],
      "milestones": [
        {
          "milestone": "Milestone name",
          "target": 25000,
          "achieved": false
        }
      ],
      "date": "${new Date().toISOString()}"
    }
  ],
  "revenueOptimizations": [
    {
      "id": "opt-1",
      "analysis": {
        "pricingChanges": [
          {
            "suggestion": "Pricing suggestion",
            "impact": "Expected impact",
            "implementation": ["step 1", "step 2"]
          }
        ],
        "newRevenueStreams": [
          {
            "stream": "New revenue stream",
            "potential": "Revenue potential",
            "effort": "low" | "medium" | "high",
            "timeline": "Timeline"
          }
        ],
        "upsellOpportunities": [
          {
            "opportunity": "Upsell opportunity",
            "targetSegment": "Target segment",
            "potentialRevenue": "Revenue potential",
            "approach": ["approach 1", "approach 2"]
          }
        ],
        "costReductions": [
          {
            "area": "Cost area",
            "currentCost": "Current cost",
            "potentialSavings": "Potential savings",
            "actionItems": ["action 1", "action 2"]
          }
        ]
      },
      "date": "${new Date().toISOString()}"
    }
  ],
  "pricingStrategies": [
    {
      "id": "pricing-1",
      "productName": "Product/service name",
      "currentPricing": {
        "tier": "Tier name",
        "price": 0,
        "features": ["feature 1", "feature 2"]
      },
      "recommendedPricing": {
        "tier": "Recommended tier",
        "price": 0,
        "features": ["feature 1", "feature 2"],
        "rationale": "Why this pricing"
      },
      "competitorAnalysis": {
        "competitor": "Competitor name",
        "theirPricing": 0,
        "ourAdvantage": "Our advantage"
      },
      "date": "${new Date().toISOString()}"
    }
  ],
  "revenueDashboards": [
    {
      "id": "dashboard-1",
      "name": "Dashboard name",
      "mrr": 0,
      "arr": 0,
      "churnRate": 0,
      "runway": 12,
      "forecast": [
        {
          "month": "Month name",
          "projectedRevenue": 0,
          "confidence": 80
        }
      ],
      "date": "${new Date().toISOString()}"
    }
  ],
  "leadershipFrameworks": [
    {
      "id": "framework-1",
      "name": "Framework name",
      "type": "decision-making" | "communication" | "delegation",
      "description": "Framework description",
      "principles": ["principle 1", "principle 2"],
      "process": ["step 1", "step 2", "step 3"],
      "examples": ["example 1", "example 2"]
    }
  ],
  "leadershipCommunications": [
    {
      "id": "comm-1",
      "original": "Original communication text",
      "improved": "Improved version",
      "type": "email" | "message" | "presentation" | "tough-message",
      "suggestions": {
        "clarity": ["suggestion 1"],
        "impact": ["suggestion 2"],
        "empathy": ["suggestion 3"]
      },
      "date": "${new Date().toISOString()}"
    }
  ],
  "leadershipConflicts": [
    {
      "id": "conflict-1",
      "situation": "Conflict situation description",
      "parties": ["party 1", "party 2"],
      "guidance": {
        "conversationStructure": ["step 1", "step 2"],
        "scripts": ["script 1", "script 2"],
        "negotiationTactics": ["tactic 1"],
        "steps": [
          {
            "step": 1,
            "action": "Action description",
            "script": "What to say",
            "rationale": "Why this step"
          }
        ]
      },
      "date": "${new Date().toISOString()}"
    }
  ],
  "leadershipRoutines": [
    {
      "id": "routine-1",
      "name": "Routine name",
      "type": "daily" | "weekly" | "monthly",
      "activities": [
        {
          "time": "Time",
          "activity": "Activity description",
          "duration": 30,
          "purpose": "Why this activity"
        }
      ],
      "date": "${new Date().toISOString()}"
    }
  ],
  "teamDNAAnalyses": [
    {
      "id": "dna-1",
      "teamName": "Team name",
      "analysis": {
        "strengths": ["strength 1", "strength 2"],
        "weaknesses": ["weakness 1"],
        "recommendations": ["recommendation 1"],
        "teamCulture": "Culture description"
      },
      "date": "${new Date().toISOString()}"
    }
  ],
  "teamRituals": [
    {
      "id": "ritual-1",
      "name": "Ritual name",
      "type": "daily-standup" | "weekly-review" | "retrospective",
      "frequency": "daily" | "weekly",
      "duration": 15,
      "structure": {
        "sections": [
          {
            "name": "Section name",
            "duration": 5,
            "description": "What to do",
            "activities": ["activity 1"]
          }
        ]
      },
      "purpose": "Why this ritual",
      "participants": ["participant 1"],
      "date": "${new Date().toISOString()}"
    }
  ],
  "teamHealthMonitors": [
    {
      "id": "monitor-1",
      "teamName": "Team name",
      "metrics": [
        {
          "metric": "Metric name",
          "value": 75,
          "target": 80,
          "trend": "improving" | "stable" | "declining"
        }
      ],
      "recommendations": ["recommendation 1"],
      "date": "${new Date().toISOString()}"
    }
  ]
}

REQUIREMENTS - CREATE COMPREHENSIVE SETUP:
1. SYSTEMS: Generate 3-4 systems based on their MAIN challenges and industry. Each system should be complete with workflows, tools, roles, metrics, and automation opportunities. Focus on systems that address their specific pain points (e.g., if "customer acquisition" challenge, create "Customer Acquisition System").

2. REVENUE: Generate:
   - 1 revenue goal based on their revenueGoal with detailed weekly actions and milestones
   - 1 revenue optimization analysis with pricing changes, new revenue streams, upsell opportunities, and cost reductions
   - 1 pricing strategy based on their industry and revenue model
   - 1 revenue dashboard with MRR, ARR, churn rate, and forecasts

3. LEADERSHIP: Generate:
   - 1-2 decision frameworks based on their challenges
   - 1 communication template/guide (email or message type)
   - 1 conflict resolution guide if they have team challenges
   - 1 leadership routine (daily/weekly routine for better leadership)

4. TEAMS: Generate:
   - Team roles based on team size (if "Solo Founder", create 3-4 roles they'll need. If "2-5 People", create roles for current structure)
   - 1 team DNA analysis for their team
   - 1-2 team rituals (daily standup, weekly review, etc.)
   - 1 team health monitor setup

5. Make everything HIGHLY PERSONALIZED to their business name, industry, and challenges.
6. Use realistic values and actionable steps.
7. Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    let setupData
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      setupData = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Return fallback data
      setupData = createFallbackSetup(onboardingData)
    }

    // Ensure all required fields and add IDs/timestamps
    const systems = (setupData.systems || []).map((sys: any, index: number) => ({
      id: `system-${Date.now()}-${index}`,
      name: sys.name || `${businessName} ${sys.type || 'System'}`,
      type: sys.type || industry,
      status: 'healthy' as const,
      lastAnalyzed: new Date(),
      workflows: sys.workflows || [],
      tools: sys.tools || [],
      roles: sys.roles || [],
      metrics: sys.metrics || [],
      automationOpportunities: sys.automationOpportunities || [],
      visualFlow: sys.visualFlow || ''
    }))

    const teamRoles = (setupData.teamRoles || []).map((role: any, index: number) => ({
      id: `role-${Date.now()}-${index}`,
      name: role.name || `Role ${index + 1}`,
      description: role.description || '',
      responsibilities: role.responsibilities || [],
      requiredSkills: role.requiredSkills || [],
      reportingTo: role.reportingTo || 'CEO/Founder',
      decisionAuthority: role.decisionAuthority || '',
      successMetrics: role.successMetrics || []
    }))

    const revenueGoals = (setupData.revenueGoals || []).map((goal: any, index: number) => ({
      id: `goal-${Date.now()}-${index}`,
      name: goal.name || `${businessName} Revenue Goal`,
      target: goal.target || 100000,
      timeframe: goal.timeframe || 'yearly' as const,
      startDate: goal.startDate || new Date().toISOString(),
      endDate: goal.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      currentProgress: 0,
      weeklyActions: goal.weeklyActions || [],
      milestones: goal.milestones || [],
      date: new Date().toISOString()
    }))

    const leadershipFrameworks = (setupData.leadershipFrameworks || []).map((fw: any, index: number) => ({
      id: `framework-${Date.now()}-${index}`,
      name: fw.name || `Leadership Framework ${index + 1}`,
      type: fw.type || 'decision-making' as const,
      description: fw.description || '',
      principles: fw.principles || [],
      process: fw.process || [],
      examples: fw.examples || []
    }))

    // Parse revenue optimizations
    const revenueOptimizations = (setupData.revenueOptimizations || []).map((opt: any, index: number) => ({
      id: `opt-${Date.now()}-${index}`,
      analysis: opt.analysis || {
        pricingChanges: [],
        newRevenueStreams: [],
        upsellOpportunities: [],
        costReductions: []
      },
      date: new Date().toISOString()
    }))

    // Parse pricing strategies
    const pricingStrategies = (setupData.pricingStrategies || []).map((strategy: any, index: number) => ({
      id: `pricing-${Date.now()}-${index}`,
      productName: strategy.productName || `${businessName} Product`,
      currentPricing: strategy.currentPricing || { tier: 'Basic', price: 0, features: [] },
      recommendedPricing: strategy.recommendedPricing || { tier: 'Pro', price: 0, features: [], rationale: '' },
      competitorAnalysis: strategy.competitorAnalysis || { competitor: '', theirPricing: 0, ourAdvantage: '' },
      date: new Date().toISOString()
    }))

    // Parse revenue dashboards
    const revenueDashboards = (setupData.revenueDashboards || []).map((dashboard: any, index: number) => ({
      id: `dashboard-${Date.now()}-${index}`,
      name: dashboard.name || `${businessName} Revenue Dashboard`,
      mrr: dashboard.mrr || 0,
      arr: dashboard.arr || 0,
      churnRate: dashboard.churnRate || 0,
      runway: dashboard.runway || 12,
      forecast: dashboard.forecast || [],
      date: new Date().toISOString()
    }))

    // Parse leadership communications
    const leadershipCommunications = (setupData.leadershipCommunications || []).map((comm: any, index: number) => ({
      id: `comm-${Date.now()}-${index}`,
      original: comm.original || '',
      improved: comm.improved || '',
      type: comm.type || 'email' as const,
      suggestions: comm.suggestions || { clarity: [], impact: [], empathy: [] },
      date: new Date().toISOString()
    }))

    // Parse leadership conflicts
    const leadershipConflicts = (setupData.leadershipConflicts || []).map((conflict: any, index: number) => ({
      id: `conflict-${Date.now()}-${index}`,
      situation: conflict.situation || '',
      parties: conflict.parties || [],
      guidance: conflict.guidance || {
        conversationStructure: [],
        scripts: [],
        negotiationTactics: [],
        steps: []
      },
      date: new Date().toISOString()
    }))

    // Parse leadership routines
    const leadershipRoutines = (setupData.leadershipRoutines || []).map((routine: any, index: number) => ({
      id: `routine-${Date.now()}-${index}`,
      type: routine.type || 'daily' as const,
      name: routine.name || `Leadership Routine ${index + 1}`,
      template: {
        timeBlocks: routine.activities || [],
        priorities: [],
        frameworks: [],
        energyManagement: []
      },
      custom: false,
      date: new Date().toISOString()
    }))

    // Parse team DNA analyses
    const teamDNAAnalyses = (setupData.teamDNAAnalyses || []).map((dna: any, index: number) => ({
      id: `dna-${Date.now()}-${index}`,
      teamName: dna.teamName || `${businessName} Team`,
      analysis: dna.analysis || {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        teamCulture: ''
      },
      date: new Date().toISOString()
    }))

    // Parse team rituals
    const teamRituals = (setupData.teamRituals || []).map((ritual: any, index: number) => ({
      id: `ritual-${Date.now()}-${index}`,
      name: ritual.name || `Team Ritual ${index + 1}`,
      type: ritual.type || 'weekly-review' as const,
      frequency: ritual.frequency || 'weekly' as const,
      duration: ritual.duration || 30,
      structure: ritual.structure || { sections: [] },
      purpose: ritual.purpose || '',
      participants: ritual.participants || [],
      aiSuggestions: {
        whyNeeded: ritual.purpose || '',
        bestPractices: [],
        commonMistakes: []
      },
      date: new Date().toISOString()
    }))

    // Parse team health monitors
    const teamHealthMonitors = (setupData.teamHealthMonitors || []).map((monitor: any, index: number) => ({
      id: `monitor-${Date.now()}-${index}`,
      teamName: monitor.teamName || `${businessName} Team`,
      metrics: monitor.metrics || [],
      recommendations: monitor.recommendations || [],
      date: new Date().toISOString()
    }))

    return NextResponse.json({
      systems,
      teamRoles,
      revenueGoals,
      revenueOptimizations,
      pricingStrategies,
      revenueDashboards,
      leadershipFrameworks,
      leadershipCommunications,
      leadershipConflicts,
      leadershipRoutines,
      teamDNAAnalyses,
      teamRituals,
      teamHealthMonitors,
      success: true
    })
  } catch (error) {
    console.error('Error in auto-setup:', error)
    return NextResponse.json(
      { error: 'Failed to generate auto-setup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function createFallbackSetup(onboardingData: any) {
  const businessName = Array.isArray(onboardingData?.businessName) 
    ? onboardingData.businessName[0] 
    : onboardingData?.businessName || 'their business'
  const industry = Array.isArray(onboardingData?.industry) 
    ? onboardingData.industry[0] 
    : onboardingData?.industry || 'General'
  const challenges = Array.isArray(onboardingData?.challenges) 
    ? onboardingData.challenges 
    : (onboardingData?.challenges ? [onboardingData.challenges] : [])

  return {
    systems: [
      {
        name: `${businessName} Core Operations System`,
        type: industry,
        status: 'healthy',
        workflows: [
          {
            id: 'workflow-1',
            name: 'Daily Operations',
            steps: ['Review priorities', 'Execute tasks', 'Track progress'],
            visualFlow: ''
          }
        ],
        tools: ['Project Management Tool', 'Communication Tool'],
        roles: [],
        metrics: [
          {
            name: 'Daily Tasks Completed',
            currentValue: 0,
            targetValue: 10,
            unit: 'tasks'
          }
        ],
        automationOpportunities: ['Automate routine tasks']
      }
    ],
    teamRoles: [
      {
        name: 'Founder/CEO',
        description: 'Overall business leadership and strategy',
        responsibilities: ['Set vision', 'Make key decisions', 'Lead team'],
        requiredSkills: ['Leadership', 'Strategy'],
        reportingTo: 'Board/Advisors',
        decisionAuthority: 'All strategic decisions',
        successMetrics: ['Revenue growth', 'Team satisfaction']
      }
    ],
    revenueGoals: [
      {
        name: `${businessName} Annual Revenue Goal`,
        target: 100000,
        timeframe: 'yearly',
        weeklyActions: [
          {
            week: 'Week 1',
            actions: ['Set up tracking', 'Define metrics'],
            target: 2000
          }
        ],
        milestones: [
          {
            milestone: 'Q1 Target',
            target: 25000,
            achieved: false
          }
        ]
      }
    ],
    leadershipFrameworks: [
      {
        name: 'Decision-Making Framework',
        type: 'decision-making',
        description: 'A framework for making consistent business decisions',
        principles: ['Data-driven', 'Customer-focused', 'Aligned with vision'],
        process: ['Define the decision', 'Gather information', 'Evaluate options', 'Make decision', 'Review outcome'],
        examples: ['Pricing decisions', 'Hiring decisions']
      }
    ]
  }
}

