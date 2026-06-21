/** Official URLs for common business tools recommended in Systems. */
const TOOL_URLS: Record<string, string> = {
  asana: 'https://asana.com',
  airtable: 'https://airtable.com',
  amplitude: 'https://amplitude.com',
  analytics: 'https://analytics.google.com',
  'google analytics': 'https://analytics.google.com',
  atlassian: 'https://www.atlassian.com',
  bamboohr: 'https://www.bamboohr.com',
  basecamp: 'https://basecamp.com',
  buffer: 'https://buffer.com',
  calendly: 'https://calendly.com',
  canva: 'https://www.canva.com',
  clickup: 'https://clickup.com',
  confluence: 'https://www.atlassian.com/software/confluence',
  convertkit: 'https://convertkit.com',
  docusign: 'https://www.docusign.com',
  dropbox: 'https://www.dropbox.com',
  figma: 'https://www.figma.com',
  freshdesk: 'https://freshdesk.com',
  gusto: 'https://gusto.com',
  'google ads': 'https://ads.google.com',
  'google drive': 'https://drive.google.com',
  'google sheets': 'https://sheets.google.com',
  'google workspace': 'https://workspace.google.com',
  gmail: 'https://mail.google.com',
  greenhouse: 'https://www.greenhouse.io',
  heap: 'https://heap.io',
  hotjar: 'https://www.hotjar.com',
  hubspot: 'https://www.hubspot.com',
  intercom: 'https://www.intercom.com',
  jira: 'https://www.atlassian.com/software/jira',
  klaviyo: 'https://www.klaviyo.com',
  linear: 'https://linear.app',
  loom: 'https://www.loom.com',
  mailchimp: 'https://mailchimp.com',
  make: 'https://www.make.com',
  'make.com': 'https://www.make.com',
  metabase: 'https://www.metabase.com',
  'microsoft teams': 'https://www.microsoft.com/microsoft-teams',
  miro: 'https://miro.com',
  mixpanel: 'https://mixpanel.com',
  monday: 'https://monday.com',
  'monday.com': 'https://monday.com',
  notion: 'https://www.notion.so',
  outreach: 'https://www.outreach.io',
  pipedrive: 'https://www.pipedrive.com',
  posthog: 'https://posthog.com',
  quickbooks: 'https://quickbooks.intuit.com',
  rippling: 'https://www.rippling.com',
  salesforce: 'https://www.salesforce.com',
  segment: 'https://segment.com',
  sendgrid: 'https://sendgrid.com',
  shopify: 'https://www.shopify.com',
  slack: 'https://slack.com',
  stripe: 'https://stripe.com',
  tableau: 'https://www.tableau.com',
  tally: 'https://tally.so',
  trello: 'https://trello.com',
  twilio: 'https://www.twilio.com',
  typeform: 'https://www.typeform.com',
  webflow: 'https://webflow.com',
  wordpress: 'https://wordpress.com',
  xero: 'https://www.xero.com',
  zapier: 'https://zapier.com',
  zendesk: 'https://www.zendesk.com',
  zoom: 'https://zoom.us',
}

const SORTED_TOOL_KEYS = Object.keys(TOOL_URLS).sort((a, b) => b.length - a.length)

function normalizeToolName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Resolve an official URL for a tool name, or null if unknown. */
export function getToolUrl(toolName: string): string | null {
  const normalized = normalizeToolName(toolName)
  if (!normalized) return null

  if (TOOL_URLS[normalized]) return TOOL_URLS[normalized]

  // Strip parentheticals: "Stripe (Payments)" → "stripe"
  const withoutParens = normalized.replace(/\s*\([^)]*\)/g, '').trim()
  if (TOOL_URLS[withoutParens]) return TOOL_URLS[withoutParens]

  // Exact key contained in name or vice versa (longest keys checked first)
  for (const key of SORTED_TOOL_KEYS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return TOOL_URLS[key]
    }
  }

  return null
}

export type TextSegment = { type: 'text'; value: string } | { type: 'link'; value: string; url: string }

/** Split automation text into plain text and linkable tool mentions. */
export function linkifyAutomationText(text: string): TextSegment[] {
  if (!text.trim()) return [{ type: 'text', value: text }]

  const lower = text.toLowerCase()
  const matches: Array<{ start: number; end: number; label: string; url: string }> = []

  for (const key of SORTED_TOOL_KEYS) {
    let searchFrom = 0
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(key, searchFrom)
      if (idx === -1) break

      const before = idx > 0 ? lower[idx - 1] : ' '
      const after = idx + key.length < lower.length ? lower[idx + key.length] : ' '
      const isWordBoundary =
        !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)

      if (isWordBoundary) {
        const overlaps = matches.some(
          (m) => !(idx + key.length <= m.start || idx >= m.end)
        )
        if (!overlaps) {
          matches.push({
            start: idx,
            end: idx + key.length,
            label: text.slice(idx, idx + key.length),
            url: TOOL_URLS[key],
          })
        }
      }
      searchFrom = idx + 1
    }
  }

  if (matches.length === 0) {
    return [{ type: 'text', value: text }]
  }

  matches.sort((a, b) => a.start - b.start)

  const segments: TextSegment[] = []
  let cursor = 0
  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ type: 'text', value: text.slice(cursor, match.start) })
    }
    segments.push({ type: 'link', value: match.label, url: match.url })
    cursor = match.end
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', value: text.slice(cursor) })
  }

  return segments
}
