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

function heading1(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: { rich_text: richText(text) },
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

/** Convert plain / markdown-ish export text into Notion blocks. */
export function textToNotionBlocks(content: string, contentType?: string): NotionBlock[] {
  const blocks: NotionBlock[] = [
    paragraph(
      `Exported from DreamScale${contentType ? ` · ${contentType}` : ''} on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    ),
    divider(),
  ]

  const lines = content.replace(/\r\n/g, '\n').split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('### ')) {
      blocks.push(heading3(trimmed.slice(4).trim()))
    } else if (trimmed.startsWith('## ')) {
      blocks.push(heading2(trimmed.slice(3).trim()))
    } else if (trimmed.startsWith('# ')) {
      blocks.push(heading1(trimmed.slice(2).trim()))
    } else if (/^[-*•]\s+/.test(trimmed)) {
      blocks.push(bullet(trimmed.replace(/^[-*•]\s+/, '')))
    } else {
      blocks.push(paragraph(trimmed))
    }
  }

  return blocks.length > 2 ? blocks : [...blocks, paragraph(content.slice(0, MAX_TEXT))]
}
