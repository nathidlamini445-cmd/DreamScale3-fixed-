import type { BusinessSystem } from '@/components/systems/SystemBuilder'
import { formatToolLabel } from '@/lib/google/sheet-cell'

/** Plain-text / markdown export body for systems (share, PDF, Google Docs, etc.). */
export function formatSystemForExport(system: BusinessSystem): string {
  let content = `# ${system.name}\n\n`
  content += `Type: ${system.type}\n`
  content += `Status: ${system.status}\n`
  content += `Last analyzed: ${new Date(system.lastAnalyzed).toLocaleDateString()}\n\n`

  if (system.healthAnalysis) {
    content += `## Health insights\n\n`
    if (typeof system.healthAnalysis.score === 'number') {
      content += `Score: ${system.healthAnalysis.score}/100\n`
    }
    for (const issue of system.healthAnalysis.issues ?? []) {
      content += `- Issue: ${issue}\n`
    }
    for (const rec of system.healthAnalysis.recommendations ?? []) {
      content += `- Recommendation: ${rec}\n`
    }
    content += `\n`
  }

  if (system.metrics.length > 0) {
    content += `## Key metrics\n\n`
    for (const metric of system.metrics) {
      content += `- ${metric.name}: ${metric.currentValue} / ${metric.targetValue} ${metric.unit}\n`
    }
    content += `\n`
  }

  if (system.workflows.length > 0) {
    content += `## Workflows\n\n`
    for (const workflow of system.workflows) {
      content += `### ${workflow.name}\n\n`
      workflow.steps.forEach((step, stepIndex) => {
        content += `${stepIndex + 1}. ${step}\n`
      })
      content += `\n`
    }
  }

  if (system.tools.length > 0) {
    content += `## Tools\n\n`
    for (const tool of system.tools) {
      content += `- ${formatToolLabel(tool)}\n`
    }
    content += `\n`
  }

  if (system.roles.length > 0) {
    content += `## Roles\n\n`
    for (const role of system.roles) {
      content += `### ${role.name}\n\n`
      for (const resp of role.responsibilities) {
        content += `- ${resp}\n`
      }
      content += `\n`
    }
  }

  if (system.automationOpportunities.length > 0) {
    content += `## Automation opportunities\n\n`
    for (const opp of system.automationOpportunities) {
      content += `- ${opp}\n`
    }
  }

  content += `\n— Exported from DreamScale Systems\n`
  return content
}
