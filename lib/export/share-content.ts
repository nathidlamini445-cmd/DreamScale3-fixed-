import type { Communication } from '@/lib/leadership-types'
import type { SmartTaskAssignment } from '@/lib/teams-types'

type RevenueAnalysisShare = {
  companyName: string
  industry: string
  analysis: {
    revenueStreams: { name: string; type: string; estimatedRevenue: string; growthRate: string; description: string }[]
    pricingStrategy: { model: string; analysis: string; recommendations: string[] }
    marketPosition: { position: string; competitors: string[]; differentiation: string }
    growthOpportunities: { opportunity: string; potential: string; actionItems: string[] }[]
    revenueProjections: { timeframe: string; projection: string; assumptions: string[] }[]
  }
}

export function formatTaskAssignmentForShare(assignment: SmartTaskAssignment): string {
  let content = `# ${assignment.projectName}\n\n`
  if (assignment.assignmentStrategy) {
    content += `## Assignment Strategy\n\n${assignment.assignmentStrategy}\n\n`
  }
  content += `## Assigned Tasks\n\n`
  for (const task of assignment.tasks) {
    content += `### ${task.title}\n`
    if (task.description) content += `${task.description}\n`
    content += `- Priority: ${task.priority}\n`
    if (task.assignedTo) {
      const member = assignment.teamMembers.find((m) => m.id === task.assignedTo)
      content += `- Assigned to: ${member?.name ?? task.assignedTo}\n`
    }
    if (task.aiAssignment?.reasoning) {
      content += `\n**AI reasoning:** ${task.aiAssignment.reasoning}\n`
    }
    content += '\n'
  }
  return content.trim()
}

export function formatListSection(title: string, items: string[]): string {
  if (!items.length) return ''
  return `## ${title}\n\n${items.map((item) => `- ${item}`).join('\n')}\n\n`
}

export function formatCommunicationForShare(communication: Communication): string {
  let content = `# Communication Review · ${communication.type.replace('-', ' ')}\n\n`
  content += `## Original\n\n${communication.original}\n\n`
  content += `## Improved\n\n${communication.improved}\n\n`
  const suggestionGroups: [string, string[]][] = [
    ['Clarity', communication.suggestions.clarity],
    ['Impact', communication.suggestions.impact],
    ['Empathy', communication.suggestions.empathy],
  ]
  for (const [label, items] of suggestionGroups) {
    content += formatListSection(`Suggestions · ${label}`, items)
  }
  return content.trim()
}

export function formatLeadershipAdviceForShare(problem: string, advice: string): string {
  return `# Leadership Advice\n\n## Problem\n\n${problem}\n\n## Advice\n\n${advice}`.trim()
}

export function formatRevenueAnalysisForShare(analysis: RevenueAnalysisShare): string {
  let content = `# Revenue Intelligence · ${analysis.companyName}\n\n`
  content += `Industry: ${analysis.industry}\n\n`
  if (analysis.analysis.revenueStreams.length) {
    content += `## Revenue Streams\n\n`
    for (const stream of analysis.analysis.revenueStreams) {
      content += `### ${stream.name}\n`
      content += `- Type: ${stream.type}\n`
      content += `- Estimated revenue: ${stream.estimatedRevenue}\n`
      content += `- Growth: ${stream.growthRate}\n`
      content += `${stream.description}\n\n`
    }
  }
  content += `## Pricing Strategy\n\n`
  content += `Model: ${analysis.analysis.pricingStrategy.model}\n\n`
  content += `${analysis.analysis.pricingStrategy.analysis}\n\n`
  content += formatListSection('Pricing recommendations', analysis.analysis.pricingStrategy.recommendations)
  content += `## Market Position\n\n`
  content += `${analysis.analysis.marketPosition.position}\n\n`
  content += formatListSection('Competitors', analysis.analysis.marketPosition.competitors)
  content += `### Differentiation\n\n${analysis.analysis.marketPosition.differentiation}\n\n`
  if (analysis.analysis.growthOpportunities.length) {
    content += `## Growth Opportunities\n\n`
    for (const opp of analysis.analysis.growthOpportunities) {
      content += `### ${opp.opportunity}\n`
      content += `Potential: ${opp.potential}\n`
      content += formatListSection('Action items', opp.actionItems)
    }
  }
  return content.trim()
}
