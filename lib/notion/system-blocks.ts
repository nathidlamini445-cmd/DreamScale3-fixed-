import type { BusinessSystem } from '@/components/systems/SystemBuilder'

type RichText = { type: 'text'; text: { content: string } }
type NotionBlock = Record<string, unknown>

const MAX_TEXT = 1900

function richText(content: string): RichText[] {
  const chunks: RichText[] = []
  let remaining = content
  while (remaining.length > 0) {
    chunks.push({
      type: 'text',
      text: { content: remaining.slice(0, MAX_TEXT) },
    })
    remaining = remaining.slice(MAX_TEXT)
  }
  return chunks.length ? chunks : [{ type: 'text', text: { content: '' } }]
}

function paragraph(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: richText(text) },
  }
}

function heading2(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: richText(text) },
  }
}

function heading3(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: { rich_text: richText(text) },
  }
}

function bullet(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: richText(text) },
  }
}

function divider(): NotionBlock {
  return { object: 'block', type: 'divider', divider: {} }
}

function callout(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: richText(text),
      icon: { type: 'emoji', emoji: '⚡' },
    },
  }
}

/** Convert a DreamScale system into Notion block children (may exceed 100 — chunk on export). */
export function systemToNotionBlocks(system: BusinessSystem): NotionBlock[] {
  const blocks: NotionBlock[] = []

  blocks.push(
    paragraph(`Exported from DreamScale Systems on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`),
    divider(),
    paragraph(`Type: ${system.type}`),
    paragraph(`Status: ${system.status.replace('-', ' ')}`),
    paragraph(`Last analyzed: ${new Date(system.lastAnalyzed).toLocaleDateString()}`)
  )

  if (system.templateName) {
    blocks.push(paragraph(`Template: ${system.templateName}`))
  }

  if (system.healthAnalysis) {
    blocks.push(heading2('Health insights'))
    if (typeof system.healthAnalysis.score === 'number') {
      blocks.push(paragraph(`Score: ${system.healthAnalysis.score}/100`))
    }
    for (const issue of system.healthAnalysis.issues ?? []) {
      blocks.push(bullet(`Issue: ${issue}`))
    }
    for (const rec of system.healthAnalysis.recommendations ?? []) {
      blocks.push(bullet(`Recommendation: ${rec}`))
    }
    blocks.push(divider())
  }

  if (system.metrics.length > 0) {
    blocks.push(heading2('Key metrics'))
    for (const metric of system.metrics) {
      blocks.push(
        bullet(
          `${metric.name}: ${metric.currentValue} / ${metric.targetValue} ${metric.unit}`.trim()
        )
      )
    }
    blocks.push(divider())
  }

  if (system.workflows.length > 0) {
    blocks.push(heading2('Workflows'))
    for (const workflow of system.workflows) {
      blocks.push(heading3(workflow.name))
      workflow.steps.forEach((step, index) => {
        blocks.push(bullet(`Step ${index + 1}: ${step}`))
      })
    }
    blocks.push(divider())
  }

  if (system.tools.length > 0) {
    blocks.push(heading2('Tools'))
    blocks.push(paragraph(system.tools.join(' · ')))
    blocks.push(divider())
  }

  if (system.roles.length > 0) {
    blocks.push(heading2('Roles'))
    for (const role of system.roles) {
      blocks.push(heading3(role.name))
      for (const resp of role.responsibilities) {
        blocks.push(bullet(resp))
      }
    }
    blocks.push(divider())
  }

  if (system.automationOpportunities.length > 0) {
    blocks.push(heading2('Automation opportunities'))
    for (const opp of system.automationOpportunities) {
      blocks.push(callout(opp))
    }
  }

  blocks.push(
    divider(),
    paragraph('— Created with DreamScale Systems')
  )

  return blocks
}
