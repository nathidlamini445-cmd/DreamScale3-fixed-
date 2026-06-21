type RoadmapSuggestion = {
  id: string
  title: string
  description: string
  explanation: string
  whyItMatters: string
  howToStart: string[]
  feature: string
  category: string
  priority: string
  estimatedTime?: string
}

type DeepFocusArea = {
  title: string
  description: string
  explanation: string
  keyQuestions: string[]
  systemsToCreate: string[]
}

export function formatFullRoadmapForExport(opts: {
  businessName?: string
  mainSuggestions: RoadmapSuggestion[]
  dailySuggestions: RoadmapSuggestion[]
  deepFocusAreas: DeepFocusArea[]
  completedIds: string[]
}): { title: string; content: string } {
  const name = opts.businessName?.trim() || 'Your Business'
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  let content = `# DreamScale Roadmap · ${name}\n\n`
  content += `Generated ${date}\n\n`
  content += `## Progress\n\n`
  const total = opts.mainSuggestions.length + opts.dailySuggestions.length
  const done = opts.completedIds.length
  content += `${done} of ${total} items completed\n\n`

  if (opts.deepFocusAreas.length) {
    content += `## Strategic Focus\n\n`
    for (const area of opts.deepFocusAreas) {
      content += `### ${area.title}\n\n`
      content += `${area.description}\n\n`
      content += `${area.explanation}\n\n`
    }
  }

  if (opts.mainSuggestions.length) {
    content += `## Main Recommendations\n\n`
    for (const s of opts.mainSuggestions) {
      const check = opts.completedIds.includes(s.id) ? '✓ ' : ''
      content += `### ${check}${s.title}\n\n`
      content += `**${s.category}** · ${s.priority} priority`
      if (s.estimatedTime) content += ` · ${s.estimatedTime}`
      content += `\n\n${s.description}\n\n`
      content += `**Why it matters:** ${s.whyItMatters}\n\n`
      content += `**Steps:**\n`
      s.howToStart.forEach((step, i) => {
        content += `${i + 1}. ${step}\n`
      })
      content += `\n**Open in:** ${s.feature}\n\n`
    }
  }

  if (opts.dailySuggestions.length) {
    content += `## Today's Actions\n\n`
    for (const s of opts.dailySuggestions) {
      content += `- ${s.title}: ${s.description}\n`
    }
  }

  return {
    title: `${name} — DreamScale Roadmap`,
    content: content.trim(),
  }
}
