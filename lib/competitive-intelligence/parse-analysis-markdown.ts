export type AnalysisMarkdownSection = {
  title: string
  content: string
}

export type ParsedAnalysisMarkdown = {
  reportTitle?: string
  sections: AnalysisMarkdownSection[]
}

/**
 * Parse competitive-intelligence markdown into navigable sections.
 * Handles ## and ### headers (Gemini often uses ###), plus a full-text fallback.
 */
export function parseAnalysisMarkdown(markdown: string): ParsedAnalysisMarkdown {
  const text = (markdown ?? '').trim()
  if (!text) {
    return { sections: [] }
  }

  const lines = text.split('\n')
  let reportTitle: string | undefined
  let startIndex = 0

  const firstLine = lines[0]?.trim() ?? ''
  const topLevelTitle = firstLine.match(/^#\s+(.+)/)
  if (topLevelTitle && !firstLine.startsWith('##')) {
    reportTitle = topLevelTitle[1].trim()
    startIndex = 1
  }

  const sections: AnalysisMarkdownSection[] = []
  let currentTitle = ''
  let currentContent: string[] = []

  const flush = () => {
    if (!currentTitle) return
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    })
  }

  const parseHeader = (line: string): { level: number; title: string } | null => {
    const match = line.match(/^(#{1,4})\s+(.+?)\s*$/)
    if (!match) return null
    return { level: match[1].length, title: match[2].trim() }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    const header = parseHeader(line)

    if (header && header.level >= 2) {
      flush()
      currentTitle = header.title
      currentContent = []
      continue
    }

    if (header && header.level === 1) {
      flush()
      currentTitle = header.title
      currentContent = []
      continue
    }

    const boldHeading = line.match(/^\*\*(.+?)\*\*\s*$/)
    if (boldHeading && boldHeading[1].length < 120) {
      flush()
      currentTitle = boldHeading[1].trim()
      currentContent = []
      continue
    }

    currentContent.push(line)
  }

  flush()

  if (sections.length === 0) {
    sections.push({
      title: reportTitle || 'Full Analysis',
      content: text,
    })
  }

  return { reportTitle, sections }
}

/** Normalize Gemini output so section parsers stay consistent. */
export function normalizeAnalysisMarkdown(text: string): string {
  return text
    .replace(/^####\s+(.+)$/gm, '## $1')
    .replace(/^###\s+(.+)$/gm, '## $1')
    .trim()
}
