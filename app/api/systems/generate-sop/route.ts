import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { system, workflow } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    // Increased token limit for more comprehensive documentation, especially troubleshooting section
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '32768')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')

    const systemPrompt = `You are SystemBuilder AI's documentation assistant. 
Generate comprehensive Standard Operating Procedures (SOPs) for business workflows.
Create detailed, step-by-step documentation that can be used for training and reference.

Format your response as a well-structured markdown document with:
- Clear title and overview
- Prerequisites and requirements
- Step-by-step instructions
- Troubleshooting section
- Best practices
- Related resources

Make it professional, clear, and actionable.`

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    const prompt = `Generate a comprehensive Standard Operating Procedure (SOP) for this workflow:

System: ${system.name}
System Type: ${system.type}
Workflow: ${workflow.name}

Workflow Steps:
${workflow.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}

System Context:
- Tools Used: ${system.tools.join(', ')}
- Roles Involved: ${system.roles.map((r: any) => r.name).join(', ')}
- Key Metrics: ${system.metrics.map((m: any) => m.name).join(', ')}

Create a detailed SOP document that includes ONLY the following sections (do not include any sections beyond 7):
1. Title and Purpose
2. Scope and Applicability
3. Prerequisites
4. Detailed step-by-step instructions for each workflow step
5. Roles and responsibilities
6. Tools and resources needed
7. Quality checkpoints - This is the FINAL and MOST IMPORTANT section. It must be EXTREMELY COMPREHENSIVE and DETAILED. Include:

   For EACH workflow step, provide:
   - Specific verification steps to perform
   - What to check at each stage
   - How to verify the step was completed correctly
   - What success looks like for that step
   - Common issues to watch for during that step
   - Quality indicators and metrics specific to that step
   
   Additionally include:
   - Daily quality checks: What should be verified daily
   - Pre-completion checks: What to verify before marking the workflow as complete
   - Post-completion checks: What to verify after the workflow is done
   - Quality metrics to monitor: Specific metrics, KPIs, or measurements to track
   - Verification procedures: Step-by-step how to verify each checkpoint
   - Quality standards: What constitutes acceptable vs. unacceptable quality
   - Escalation criteria: When to escalate if quality checkpoints fail
   - Documentation requirements: What needs to be documented at each checkpoint
   
   Make section 7 VERY DETAILED - it should be the longest and most comprehensive section. For each workflow step, provide at least 3-5 specific verification points. Include specific examples, checklists, and actionable items. This section should be thorough enough that someone can use it to ensure quality at every stage of the workflow.

CRITICAL: The document must END at section 7 (Quality checkpoints). Do NOT include troubleshooting guides, best practices, related workflows, or ANY sections beyond section 7. Section 7 is the final section and must be complete and comprehensive.

Format as markdown with proper headings, lists, and structure. Make it comprehensive enough to train new team members. Ensure all sections 1-7 are complete, with section 7 being the final, longest, and most detailed section.`

    const result = await model.generateContent(prompt)
    const sop = result.response.text() || 'Failed to generate SOP'

    return NextResponse.json({ sop })
  } catch (error) {
    console.error('SOP generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate SOP' },
      { status: 500 }
    )
  }
}

