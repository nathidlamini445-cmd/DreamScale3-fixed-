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
    
    // Try to extract JSON from the response
    let systemData
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      systemData = JSON.parse(cleaned)
    } catch (parseError) {
      // If parsing fails, create a fallback system
      console.error('Failed to parse AI response:', parseError)
      systemData = createFallbackSystem(type, teamSize, stage)
    }

    // Ensure all required fields are present
    const system = {
      id: Date.now().toString(),
      name: systemData.name || `${type} Operations System`,
      type: systemData.type || type,
      status: 'healthy' as const,
      lastAnalyzed: new Date(),
      workflows: systemData.workflows || [],
      tools: systemData.tools || [],
      roles: systemData.roles || [],
      metrics: systemData.metrics || [],
      automationOpportunities: systemData.automationOpportunities || [],
      visualFlow: systemData.visualFlow || ''
    }

    return NextResponse.json(system)
  } catch (error) {
    console.error('System generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate system' },
      { status: 500 }
    )
  }
}

function createFallbackSystem(type: string, teamSize: number, stage: string) {
  return {
    name: `${type} Operations System`,
    type: type,
    workflows: [
      {
        id: 'workflow-1',
        name: 'Core Operations Workflow',
        steps: [
          'Define objectives and goals',
          'Assign responsibilities',
          'Execute tasks',
          'Review and optimize'
        ],
        visualFlow: 'graph TD\nA[Start] --> B[Define Objectives]\nB --> C[Assign Responsibilities]\nC --> D[Execute Tasks]\nD --> E[Review]\nE --> F[Optimize]\nF --> A'
      }
    ],
    tools: ['Project Management Tool', 'Communication Platform', 'Analytics Tool'],
    roles: [
      {
        name: 'Team Lead',
        responsibilities: ['Oversee operations', 'Make strategic decisions']
      }
    ],
    metrics: [
      {
        name: 'Efficiency',
        currentValue: 0,
        targetValue: 80,
        unit: '%'
      }
    ],
    automationOpportunities: ['Automate reporting', 'Streamline communication']
  }
}

