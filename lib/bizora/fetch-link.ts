import axios from 'axios'
import * as cheerio from 'cheerio'

export type LinkFetchResult = {
  success: boolean
  url: string
  platform: string
  title: string
  content: string
  message?: string
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube'
    if (host.includes('twitter.com') || host === 'x.com') return 'twitter'
    if (host.includes('linkedin.com')) return 'linkedin'
    if (host.includes('instagram.com')) return 'instagram'
    if (host.includes('tiktok.com')) return 'tiktok'
    if (host.includes('facebook.com') || host === 'fb.com') return 'facebook'
    if (host.includes('medium.com')) return 'medium'
    return 'web'
  } catch {
    return 'web'
  }
}

async function fetchYouTube(url: string): Promise<LinkFetchResult> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(12_000) })
  if (!res.ok) throw new Error('YouTube oEmbed failed')
  const data = (await res.json()) as {
    title?: string
    author_name?: string
    provider_name?: string
  }
  const title = data.title ?? 'YouTube video'
  const content = [
    `Platform: YouTube`,
    `Title: ${title}`,
    data.author_name ? `Channel: ${data.author_name}` : null,
    `URL: ${url}`,
    '',
    'The user shared a YouTube link. Use the title and URL for context. If you know the topic from the title, analyze it for their business question.',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    success: true,
    url,
    platform: 'youtube',
    title,
    content,
  }
}

function extractFromHtml(html: string, url: string, platform: string): LinkFetchResult {
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, noscript, iframe').remove()

  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    url

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    ''

  const bodyText = $('article, main, [role="main"]')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()

  const fallbackText = $('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 40)
    .slice(0, 12)
    .join('\n\n')

  const mainText = (bodyText || fallbackText).slice(0, 12_000)

  const content = [
    `Platform: ${platform}`,
    `Title: ${title}`,
    `URL: ${url}`,
    description ? `\nSummary:\n${description}` : null,
    mainText ? `\nPage content (excerpt):\n${mainText}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    success: Boolean(description || mainText.length > 80),
    url,
    platform,
    title,
    content:
      content ||
      `Link shared: ${url}\n(Could not extract readable text — use the URL and title if present.)`,
    message: mainText.length > 80 ? undefined : 'Limited text extracted from page',
  }
}

async function fetchHtml(url: string, platform: string): Promise<LinkFetchResult> {
  const scraperKey = process.env.SCRAPER_API_KEY?.trim()

  if (scraperKey) {
    try {
      const scraperUrl = `https://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(url)}&render=true`
      const res = await axios.get(scraperUrl, {
        timeout: 25_000,
        responseType: 'text',
        headers: BROWSER_HEADERS,
      })
      return extractFromHtml(String(res.data), url, platform)
    } catch {
      // fall through to direct fetch
    }
  }

  const res = await axios.get(url, {
    timeout: 15_000,
    headers: BROWSER_HEADERS,
    maxRedirects: 5,
    responseType: 'text',
    validateStatus: (s) => s < 500,
  })

  if (res.status >= 400) {
    return {
      success: false,
      url,
      platform,
      title: url,
      content: `Link: ${url}\n(The page could not be fetched — status ${res.status}. Use the URL for context.)`,
      message: `HTTP ${res.status}`,
    }
  }

  return extractFromHtml(String(res.data), url, platform)
}

export async function fetchLinkContent(rawUrl: string): Promise<LinkFetchResult> {
  const url = normalizeUrl(rawUrl)
  if (!url) {
    return {
      success: false,
      url: rawUrl,
      platform: 'unknown',
      title: rawUrl,
      content: '',
      message: 'Invalid URL',
    }
  }

  const platform = detectPlatform(url)

  try {
    if (platform === 'youtube') {
      return await fetchYouTube(url)
    }
    return await fetchHtml(url, platform)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'fetch failed'
    return {
      success: false,
      url,
      platform,
      title: url,
      content: `Link: ${url}\n(Unable to read this link automatically: ${msg}. Ask the user what they want you to focus on from this URL.)`,
      message: msg,
    }
  }
}
