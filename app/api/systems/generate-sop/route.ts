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
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
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

Create a detailed SOP document that includes:
1. Title and Purpose
2. Scope and Applicability
3. Prerequisites
4. Detailed step-by-step instructions for each workflow step
5. Roles and responsibilities
6. Tools and resources needed
7. Quality checkpoints
8. Troubleshooting guide
9. Best practices
10. Related workflows and systems

Format as markdown with proper headings, lists, and structure. Make it comprehensive enough to train new team members.`

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

