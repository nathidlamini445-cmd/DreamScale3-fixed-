import { fetchLinkContent } from '@/lib/bizora/fetch-link'
import { DREAMPULSE_SCRAPE_EXCERPT_CHARS } from '@/lib/dreampulse/analysis-timeouts'

export type CompetitorScrapeContext = {
  attempted: boolean
  success: boolean
  url: string | null
  platform: string | null
  title: string | null
  excerpt: string
  message?: string
}

const URL_LIKE =
  /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i

export function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false
  if (/^https?:\/\//i.test(trimmed)) return true
  if (trimmed.includes(' ')) return false
  return URL_LIKE.test(trimmed) || /\.(com|co|io|app|net|org|za)\b/i.test(trimmed)
}

export async function scrapeCompetitorTarget(
  target: string
): Promise<CompetitorScrapeContext> {
  const trimmed = target.trim()
  if (!looksLikeUrl(trimmed)) {
    return {
      attempted: false,
      success: false,
      url: null,
      platform: null,
      title: null,
      excerpt: '',
    }
  }

  const result = await fetchLinkContent(trimmed)
  const excerpt = result.content.slice(0, DREAMPULSE_SCRAPE_EXCERPT_CHARS)

  return {
    attempted: true,
    success: result.success && excerpt.length > 120,
    url: result.url,
    platform: result.platform,
    title: result.title,
    excerpt,
    message: result.message,
  }
}
