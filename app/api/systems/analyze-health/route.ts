import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { systemId, system } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are SystemBuilder AI's health analysis engine. 
Analyze business systems and determine their health status.
Return JSON with status ("healthy", "needs-attention", or "broken") and recommendations.

A system is:
- "healthy" if all workflows are defined, tools are appropriate, metrics are being tracked, and automation is optimized
- "needs-attention" if some workflows are incomplete, tools need updating, or metrics show declining trends
- "broken" if critical workflows are missing, tools are incompatible, or system is not functioning

Return JSON format:
{
  "status": "healthy" | "needs-attention" | "broken",
  "score": 0-100,
  "recommendations": ["recommendation 1", "recommendation 2"],
  "issues": ["issue 1", "issue 2"],
  "strengths": ["strength 1", "strength 2"]
}`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Analyze this business system and determine its health status:

System Name: ${system.name}
Type: ${system.type}
Workflows: ${system.workflows.length} workflows
Tools: ${system.tools.join(', ')}
Roles: ${system.roles.length} roles
Metrics: ${system.metrics.length} metrics
Automation Opportunities: ${system.automationOpportunities.length} identified

Workflow Details:
${system.workflows.map((w: any, i: number) => `${i + 1}. ${w.name}: ${w.steps.length} steps`).join('\n')}

Metrics:
${system.metrics.map((m: any) => `- ${m.name}: ${m.currentValue} ${m.unit} (target: ${m.targetValue})`).join('\n')}

Analyze:
1. Completeness of workflows
2. Appropriateness of tools
3. Metric tracking effectiveness
4. Automation opportunities utilization
5. Overall system coherence

Return ONLY valid JSON with status, score, recommendations, issues, and strengths.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Try to extract JSON from the response
    let analysis
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse health analysis:', parseError)
      // Fallback analysis
      analysis = {
        status: determineStatusFromSystem(system),
        score: 75,
        recommendations: ['Review and update workflows regularly', 'Ensure all tools are properly integrated'],
        issues: [],
        strengths: ['System structure is defined', 'Metrics are being tracked']
      }
    }

    // Ensure status is valid
    if (!['healthy', 'needs-attention', 'broken'].includes(analysis.status)) {
      analysis.status = determineStatusFromSystem(system)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Health analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze system health' },
      { status: 500 }
    )
  }
}

function determineStatusFromSystem(system: any): 'healthy' | 'needs-attention' | 'broken' {
  // Simple heuristic-based status determination
  if (system.workflows.length === 0) return 'broken'
  if (system.tools.length === 0) return 'needs-attention'
  if (system.metrics.length === 0) return 'needs-attention'
  
  // Check if metrics are below targets
  const metricsBelowTarget = system.metrics.filter((m: any) => m.currentValue < m.targetValue * 0.5)
  if (metricsBelowTarget.length > system.metrics.length / 2) return 'broken'
  if (metricsBelowTarget.length > 0) return 'needs-attention'
  
  return 'healthy'
}

