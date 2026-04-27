import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { type, teamSize, stage } = await request.json()
    
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

    const systemPrompt = `You are SystemBuilder AI, an expert business systems architect. 
Generate complete operational systems with workflows, tools, roles, metrics, and automation opportunities.
Always return structured JSON that can be parsed. Include visual flowchart data in Mermaid format when possible.

The response must be valid JSON with this structure:
{
  "name": "System name",
  "type": "Business type",
  "status": "healthy",
  "workflows": [
    {
      "id": "workflow-1",
      "name": "Workflow name",
      "steps": ["step 1", "step 2", "step 3"],
      "visualFlow": "mermaid diagram syntax"
    }
  ],
  "tools": ["tool1", "tool2", "tool3"],
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
  "automationOpportunities": ["opportunity 1", "opportunity 2"],
  "visualFlow": "mermaid diagram syntax for overall system"
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Generate a complete operational system for:
- Business Type: ${type}
- Team Size: ${teamSize}
- Stage: ${stage}

Create a comprehensive system that includes:
1. Multiple workflows (3-5 workflows) with step-by-step processes
2. Recommended tools (5-10 tools) that are appropriate for this business type and stage
3. Roles and responsibilities (2-5 roles) based on team size
4. Key metrics to track (3-5 metrics) with realistic target values
5. Automation opportunities (3-5 opportunities)
6. Visual flowchart representation in Mermaid format for at least one workflow

Make it practical, actionable, and tailored to the business stage. For "idea" stage, focus on validation and setup. For "mvp" stage, focus on core operations. For "scaling" stage, focus on efficiency and automation.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    console.log('📝 Raw AI response:', responseText.substring(0, 500))
    
    // Try to extract JSON from the response
    let systemData
    try {
      // Remove markdown code blocks if present
      let cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Remove any leading/trailing whitespace or newlines
      cleaned = cleaned.replace(/^\s+|\s+$/g, '')
      
      // Try to find JSON object in the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
      
      systemData = JSON.parse(cleaned)
      console.log('✅ Successfully parsed AI response')
    } catch (parseError) {
      // If parsing fails, create a fallback system
      console.error('❌ Failed to parse AI response:', parseError)
      console.error('Response text:', responseText)
      systemData = createFallbackSystem(type, teamSize, stage)
      console.log('📦 Using fallback system')
    }

    // Ensure all required fields are present with proper defaults
    const system = {
      id: Date.now().toString(),
      name: systemData.name || `${type} Operations System`,
      type: systemData.type || type,
      status: 'healthy' as const,
      lastAnalyzed: new Date(),
      workflows: Array.isArray(systemData.workflows) ? systemData.workflows : (systemData.workflows ? [systemData.workflows] : []),
      tools: Array.isArray(systemData.tools) ? systemData.tools : (systemData.tools ? [systemData.tools] : []),
      roles: Array.isArray(systemData.roles) ? systemData.roles : (systemData.roles ? [systemData.roles] : []),
      metrics: Array.isArray(systemData.metrics) ? systemData.metrics : (systemData.metrics ? [systemData.metrics] : []),
      automationOpportunities: Array.isArray(systemData.automationOpportunities) ? systemData.automationOpportunities : (systemData.automationOpportunities ? [systemData.automationOpportunities] : []),
      visualFlow: systemData.visualFlow || systemData.visual_flow || ''
    }
    
    // Validate workflows have required fields
    system.workflows = system.workflows.map((wf: any, index: number) => ({
      id: wf.id || `workflow-${index + 1}`,
      name: wf.name || `Workflow ${index + 1}`,
      steps: Array.isArray(wf.steps) ? wf.steps : (wf.steps ? [wf.steps] : []),
      visualFlow: wf.visualFlow || wf.visual_flow || ''
    }))
    
    // Validate roles have required fields
    system.roles = system.roles.map((role: any, index: number) => ({
      name: role.name || `Role ${index + 1}`,
      responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities : (role.responsibilities ? [role.responsibilities] : [])
    }))
    
    // Validate metrics have required fields
    system.metrics = system.metrics.map((metric: any, index: number) => ({
      name: metric.name || `Metric ${index + 1}`,
      currentValue: typeof metric.currentValue === 'number' ? metric.currentValue : 0,
      targetValue: typeof metric.targetValue === 'number' ? metric.targetValue : 100,
      unit: metric.unit || ''
    }))
    
    console.log('✅ Generated system:', {
      id: system.id,
      name: system.name,
      workflows: system.workflows.length,
      tools: system.tools.length,
      roles: system.roles.length,
      metrics: system.metrics.length
    })

    return NextResponse.json(system)
  } catch (error) {
    console.error('❌ System generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate system'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

function createFallbackSystem(type: string, teamSize: number, stage: string) {
  const stageSpecific = {
    idea: {
      workflows: [
        {
          id: 'workflow-1',
          name: 'Idea Validation Workflow',
          steps: [
            'Market research and validation',
            'Define value proposition',
            'Create MVP concept',
            'Test with target audience',
            'Iterate based on feedback'
          ],
          visualFlow: 'graph TD\nA[Start] --> B[Market Research]\nB --> C[Define Value Prop]\nC --> D[Create MVP Concept]\nD --> E[Test with Audience]\nE --> F[Iterate]\nF --> A'
        },
        {
          id: 'workflow-2',
          name: 'Initial Setup Workflow',
          steps: [
            'Set up basic infrastructure',
            'Define core processes',
            'Establish communication channels',
            'Create initial documentation'
          ],
          visualFlow: ''
        }
      ],
      tools: ['Notion', 'Slack', 'Google Workspace', 'Figma', 'Stripe'],
      roles: teamSize > 1 ? [
        { name: 'Founder', responsibilities: ['Strategic planning', 'Product development', 'Team coordination'] },
        { name: 'Developer', responsibilities: ['Build MVP', 'Technical implementation', 'Testing'] }
      ] : [
        { name: 'Founder', responsibilities: ['All operations', 'Product development', 'Marketing', 'Sales'] }
      ],
      metrics: [
        { name: 'Market Validation Score', currentValue: 0, targetValue: 70, unit: '%' },
        { name: 'MVP Completion', currentValue: 0, targetValue: 100, unit: '%' },
        { name: 'User Feedback Score', currentValue: 0, targetValue: 80, unit: '%' }
      ],
      automationOpportunities: ['Automate customer feedback collection', 'Set up basic analytics', 'Automate email responses']
    },
    mvp: {
      workflows: [
        {
          id: 'workflow-1',
          name: 'Product Development Workflow',
          steps: [
            'Gather user feedback',
            'Prioritize features',
            'Develop features',
            'Test and QA',
            'Deploy to production',
            'Monitor performance'
          ],
          visualFlow: 'graph TD\nA[Gather Feedback] --> B[Prioritize]\nB --> C[Develop]\nC --> D[Test]\nD --> E[Deploy]\nE --> F[Monitor]\nF --> A'
        },
        {
          id: 'workflow-2',
          name: 'Customer Onboarding Workflow',
          steps: [
            'Welcome new customer',
            'Setup and configuration',
            'Training and support',
            'Follow-up and retention'
          ],
          visualFlow: ''
        },
        {
          id: 'workflow-3',
          name: 'Support Workflow',
          steps: [
            'Receive support request',
            'Triage and prioritize',
            'Resolve issue',
            'Follow up with customer',
            'Document solution'
          ],
          visualFlow: ''
        }
      ],
      tools: ['Jira', 'Slack', 'Intercom', 'Stripe', 'Mixpanel', 'Zendesk'],
      roles: [
        { name: 'Product Manager', responsibilities: ['Feature prioritization', 'Roadmap planning', 'User research'] },
        { name: 'Developer', responsibilities: ['Feature development', 'Bug fixes', 'Code reviews'] },
        { name: 'Customer Success', responsibilities: ['Onboarding', 'Support', 'Retention'] }
      ],
      metrics: [
        { name: 'Monthly Active Users', currentValue: 0, targetValue: 1000, unit: 'users' },
        { name: 'Customer Satisfaction', currentValue: 0, targetValue: 85, unit: '%' },
        { name: 'Feature Adoption Rate', currentValue: 0, targetValue: 60, unit: '%' },
        { name: 'Churn Rate', currentValue: 0, targetValue: 5, unit: '%' }
      ],
      automationOpportunities: ['Automate onboarding emails', 'Set up automated testing', 'Automate customer support responses', 'Automate billing and invoicing']
    },
    scaling: {
      workflows: [
        {
          id: 'workflow-1',
          name: 'Scalable Operations Workflow',
          steps: [
            'Strategic planning',
            'Resource allocation',
            'Team coordination',
            'Performance monitoring',
            'Continuous optimization',
            'Scale operations'
          ],
          visualFlow: 'graph TD\nA[Strategic Planning] --> B[Allocate Resources]\nB --> C[Coordinate Team]\nC --> D[Monitor Performance]\nD --> E[Optimize]\nE --> F[Scale]\nF --> A'
        },
        {
          id: 'workflow-2',
          name: 'Hiring and Onboarding Workflow',
          steps: [
            'Define role requirements',
            'Source candidates',
            'Interview and select',
            'Onboard new team member',
            'Training and integration',
            'Performance review'
          ],
          visualFlow: ''
        },
        {
          id: 'workflow-3',
          name: 'Revenue Growth Workflow',
          steps: [
            'Identify growth opportunities',
            'Develop growth strategies',
            'Execute campaigns',
            'Measure results',
            'Optimize and scale'
          ],
          visualFlow: ''
        },
        {
          id: 'workflow-4',
          name: 'Process Optimization Workflow',
          steps: [
            'Identify bottlenecks',
            'Analyze current processes',
            'Design improvements',
            'Implement changes',
            'Measure impact',
            'Iterate'
          ],
          visualFlow: ''
        }
      ],
      tools: ['Asana', 'Slack', 'Salesforce', 'HubSpot', 'Tableau', 'Zapier', 'Monday.com', 'Notion'],
      roles: [
        { name: 'CEO/Founder', responsibilities: ['Strategic vision', 'Team leadership', 'Investor relations'] },
        { name: 'VP Operations', responsibilities: ['Process optimization', 'Team management', 'Efficiency improvement'] },
        { name: 'VP Sales', responsibilities: ['Revenue growth', 'Sales team management', 'Customer acquisition'] },
        { name: 'VP Marketing', responsibilities: ['Brand growth', 'Marketing campaigns', 'Lead generation'] },
        { name: 'Engineering Lead', responsibilities: ['Technical strategy', 'Team management', 'Product development'] }
      ],
      metrics: [
        { name: 'Monthly Recurring Revenue', currentValue: 0, targetValue: 100000, unit: '$' },
        { name: 'Team Efficiency', currentValue: 0, targetValue: 90, unit: '%' },
        { name: 'Customer Acquisition Cost', currentValue: 0, targetValue: 50, unit: '$' },
        { name: 'Customer Lifetime Value', currentValue: 0, targetValue: 5000, unit: '$' },
        { name: 'Net Promoter Score', currentValue: 0, targetValue: 70, unit: 'score' }
      ],
      automationOpportunities: ['Automate sales pipeline', 'Automate marketing campaigns', 'Automate reporting', 'Automate customer onboarding', 'Automate HR processes']
    }
  }
  
  const config = stageSpecific[stage as keyof typeof stageSpecific] || stageSpecific.mvp
  
  return {
    name: `${type} Operations System`,
    type: type,
    workflows: config.workflows,
    tools: config.tools,
    roles: config.roles.slice(0, Math.min(teamSize, config.roles.length)),
    metrics: config.metrics,
    automationOpportunities: config.automationOpportunities
  }
}

