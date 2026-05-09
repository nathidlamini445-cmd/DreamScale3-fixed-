import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { projectName, tasks, members } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      }
    })

    const prompt = `You are TeamSync AI, an expert in intelligent task assignment and team optimization.

Project: ${projectName}

Team Members:
${members.map((m: any) => `
- ${m.name} (${m.id})
  Role: ${m.role}
  Skills: ${m.skills.join(', ') || 'Not specified'}
  Current Workload: ${m.workload || 0}%
  Work Style: ${m.workStyle || 'Not specified'}
  Communication: ${m.communicationPreference || 'Not specified'}
`).join('\n')}

Tasks to Assign:
${tasks.map((t: any, i: number) => `
${i + 1}. ${t.title}
   Description: ${t.description || 'N/A'}
   Priority: ${t.priority}
   Estimated Hours: ${t.estimatedHours || 'N/A'}
   Tags: ${t.tags.join(', ') || 'None'}
`).join('\n')}

Assign each task to the best team member with EXTENSIVE analysis based on:
1. Individual strengths and skills match (be very specific about skill alignment)
2. Current workload balance (ensure fair distribution)
3. Past performance on similar tasks (if available)
4. Growth opportunities for team members
5. Team collaboration potential
6. Deadline and urgency considerations
7. Learning curve and development needs

Return JSON with this exact structure:
{
  "strategy": "Very detailed 3-4 paragraph explanation of overall assignment strategy, workload distribution approach, and team optimization considerations",
  "workloadAnalysis": {
    "before": "Analysis of workload distribution before assignment",
    "after": "Analysis of workload distribution after assignment",
    "balance": "How balanced the workload is across team members",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  },
  "tasks": [
    {
      "id": "task_id_from_input",
      "assignedMember": "member_id",
      "reasoning": "Very detailed 2-3 sentence explanation of why this assignment makes sense, including specific skills, workload considerations, and growth opportunities",
      "factors": {
        "strengthMatch": 0.85,
        "workloadBalance": 0.75,
        "growthOpportunity": 0.80,
        "pastPerformance": 0.70,
        "collaborationFit": 0.75,
        "urgencyMatch": 0.80
      },
      "alternativeAssignments": [
        {
          "memberId": "alternative_member_id",
          "reasoning": "Why this alternative could work",
          "pros": ["pro 1", "pro 2"],
          "cons": ["con 1", "con 2"]
        }
      ],
      "estimatedCompletion": "Estimated completion time based on member's capacity",
      "supportNeeded": ["support type 1", "support type 2"],
      "successFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ],
  "teamDynamics": {
    "collaborationOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "potentialBottlenecks": ["bottleneck 1", "bottleneck 2"],
    "recommendedPairings": [
      {
        "members": ["member1", "member2"],
        "reason": "Why they should collaborate",
        "tasks": ["task1", "task2"]
      }
    ]
  },
  "risks": [
    {
      "risk": "Risk description",
      "impact": "Impact on project",
      "mitigation": "How to mitigate",
      "priority": "High/Medium/Low"
    }
  ],
  "optimizationSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
}

Be VERY DETAILED and SPECIFIC. Provide comprehensive analysis that helps optimize team performance.

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let assignmentData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      assignmentData = JSON.parse(cleanedText)
      
      // Merge assignment data back with original task data
      const assignedTasks = tasks.map((task: any) => {
        const assignment = assignmentData.tasks?.find((a: any) => a.id === task.id)
        return {
          ...task,
          assignedTo: assignment?.assignedMember || members[0]?.id,
          aiAssignment: {
            assignedMember: assignment?.assignedMember || members[0]?.id,
            reasoning: assignment?.reasoning || 'AI assignment based on team analysis',
            factors: {
              strengthMatch: assignment?.factors?.strengthMatch || 0.7,
              workloadBalance: assignment?.factors?.workloadBalance || 0.7,
              growthOpportunity: assignment?.factors?.growthOpportunity || 0.7,
              pastPerformance: assignment?.factors?.pastPerformance || 0.7,
              collaborationFit: assignment?.factors?.collaborationFit,
              urgencyMatch: assignment?.factors?.urgencyMatch
            },
            alternativeAssignments: assignment?.alternativeAssignments,
            estimatedCompletion: assignment?.estimatedCompletion,
            supportNeeded: assignment?.supportNeeded,
            successFactors: assignment?.successFactors
          }
        }
      })

      return NextResponse.json({
        strategy: assignmentData.strategy || 'Tasks assigned based on team member strengths and workload balance.',
        tasks: assignedTasks,
        workloadAnalysis: assignmentData.workloadAnalysis,
        teamDynamics: assignmentData.teamDynamics,
        risks: assignmentData.risks,
        optimizationSuggestions: assignmentData.optimizationSuggestions
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      // Fallback: assign tasks round-robin style
      const assignedTasks = tasks.map((task: any, index: number) => ({
        ...task,
        assignedTo: members[index % members.length]?.id,
        aiAssignment: {
          assignedMember: members[index % members.length]?.id,
          reasoning: 'Round-robin assignment as fallback',
          factors: {
            strengthMatch: 0.6,
            workloadBalance: 0.6,
            growthOpportunity: 0.6,
            pastPerformance: 0.6
          }
        }
      }))

      return NextResponse.json({
        strategy: 'Tasks assigned using round-robin method.',
        tasks: assignedTasks
      })
    }
  } catch (error) {
    console.error('Error assigning tasks:', error)
    return NextResponse.json(
      { error: 'Failed to assign tasks' },
      { status: 500 }
    )
  }
}

