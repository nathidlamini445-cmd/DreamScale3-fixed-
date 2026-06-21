import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  scrapeCompetitorTarget,
  type CompetitorScrapeContext,
} from '@/lib/competitive-intelligence/scrape-target'
import { normalizeAnalysisMarkdown } from '@/lib/competitive-intelligence/parse-analysis-markdown'
import {
  DREAMPULSE_GEMINI_TIMEOUT_MS,
} from '@/lib/dreampulse/analysis-timeouts'

export type AnalysisWarningKind = 'none' | 'enriched' | 'scrape-failed' | 'fallback' | 'api-error'

export function classifyAnalysisWarning(warning?: string): AnalysisWarningKind {
  if (!warning) return 'none'
  if (warning.startsWith('Enriched with live data')) return 'enriched'
  if (warning.includes('Could not read competitor page')) return 'scrape-failed'
  if (
    warning.includes('fallback') ||
    warning.includes('API key not configured')
  ) {
    return 'fallback'
  }
  return 'api-error'
}

export interface QuestionnaireData {
  intrapreneurName: string
  companyIndustry: string
  targetStakeholders: string[]
  initiativeFrequency: string
  projectTypes: string[]
  uniqueApproach: string
  weaknesses: string
  collaborationMethods: string[]
  valueCreation: string[]
  skillRating: {
    innovation: number
    execution: number
    leadership: number
    persistence: number
  }
  yourAdvantage: string
  contentNiche?: string
}

export type QuestionnaireAnalysisResult =
  | {
      ok: true
      analysis: string
      warning?: string
      warningKind?: AnalysisWarningKind
      scrape?: CompetitorScrapeContext
    }
  | { ok: false; error: string; status?: number }

export async function runQuestionnaireAnalysis(
  data: QuestionnaireData
): Promise<QuestionnaireAnalysisResult> {
  if (!data?.intrapreneurName || !data?.companyIndustry) {
    return { ok: false, error: 'Required fields missing', status: 400 }
  }

  const scrape = await scrapeCompetitorTarget(data.intrapreneurName)

  if (!process.env.GEMINI_API_KEY) {
    return {
      ok: true,
      analysis: generateFallbackAnalysis(data, scrape),
      warning: 'API key not configured. Using fallback analysis.',
      warningKind: 'fallback',
      scrape,
    }
  }

  try {
    const analysis = await performGeminiAnalysis(data, scrape)
    const analysisString = normalizeAnalysisMarkdown(
      typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)
    )

    let warning: string | undefined
    if (scrape.success) {
      warning = `Enriched with live data scraped from ${scrape.url}`
    } else if (scrape.attempted) {
      warning =
        'Could not read competitor page (blocked or protected). Analysis uses your questionnaire answers — add more detail in the wizard for sharper output.'
    }

    return { ok: true, analysis: analysisString, warning, warningKind: classifyAnalysisWarning(warning), scrape }
  } catch (analysisError: unknown) {
    const message =
      analysisError instanceof Error ? analysisError.message : 'Unknown error'
    return {
      ok: true,
      analysis:
        generateFallbackAnalysis(data, scrape) +
        '\n\n⚠️ **Note:** This is a fallback analysis. The API request failed: ' +
        message,
      warning: 'Analysis completed with fallback due to API error: ' + message,
      warningKind: 'fallback',
      scrape,
    }
  }
}

function buildScrapePromptBlock(scrape: CompetitorScrapeContext): string {
  if (!scrape.attempted) {
    return `
NO LIVE WEB SCRAPE (target looks like a name, not a URL).
- Do not invent pricing, traffic, or product facts.
- Ground every recommendation in the questionnaire answers below.
- If you lack evidence, say what the user should verify manually.
`
  }

  if (!scrape.success) {
    return `
LIVE WEB SCRAPE ATTEMPTED BUT FAILED for: ${scrape.url}
Reason: ${scrape.message ?? 'page blocked or unreadable'}
- Do not fabricate website copy or pricing.
- Rely on questionnaire data; flag gaps the user should research on the site directly.
`
  }

  return `
LIVE COMPETITOR PAGE DATA (scraped — treat as primary evidence):
URL: ${scrape.url}
Platform: ${scrape.platform}
Page title: ${scrape.title}

--- SCRAPED CONTENT START ---
${scrape.excerpt}
--- SCRAPED CONTENT END ---

SCRAPE RULES (mandatory):
1. Quote or paraphrase specific phrases, offers, features, and pricing found in the scrape.
2. Call out positioning gaps between their site messaging and the user's stated advantage.
3. Do NOT give generic consultant advice — every major recommendation must tie to scraped text OR questionnaire facts.
4. If pricing appears in the scrape, reference it explicitly.
5. Add a section "## Evidence From Their Site" listing 5-8 concrete observations from the scrape.
`
}

async function performGeminiAnalysis(
  data: QuestionnaireData,
  scrape: CompetitorScrapeContext
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '32768', 10)
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.45')

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  })

  const scrapeBlock = buildScrapePromptBlock(scrape)

  const prompt = `
You are a senior competitive intelligence analyst. Your job is to help the user beat a specific competitor with actionable, evidence-based strategy — not generic business platitudes.

${scrapeBlock}

QUESTIONNAIRE (user context — combine with scrape when available):
TARGET / COMPETITOR: ${data.intrapreneurName}
INDUSTRY: ${data.companyIndustry}
TARGET STAKEHOLDERS: ${data.targetStakeholders.join(', ') || 'Not specified'}
INITIATIVE FREQUENCY: ${data.initiativeFrequency || 'Not specified'}
PROJECT TYPES: ${data.projectTypes.join(', ') || 'Not specified'}
THEIR UNIQUE APPROACH: ${data.uniqueApproach || 'Not specified'}
THEIR WEAKNESSES (user view): ${data.weaknesses || 'Not specified'}
COLLABORATION METHODS: ${data.collaborationMethods.join(', ') || 'Not specified'}
VALUE CREATION: ${data.valueCreation.join(', ') || 'Not specified'}
SKILL RATINGS: Innovation ${data.skillRating.innovation}/5, Execution ${data.skillRating.execution}/5, Leadership ${data.skillRating.leadership}/5, Persistence ${data.skillRating.persistence}/5
USER'S COMPETITIVE ADVANTAGE: ${data.yourAdvantage || 'Not specified'}
${data.contentNiche ? `CONTENT NICHE: ${data.contentNiche}` : ''}

Required sections (complete all). Use exactly "## Section Name" markdown headers (two hashes, not three):

## Executive Summary
## Evidence From Their Site
## Competitive Positioning Analysis
## Weakness Exploitation Strategy
## Pricing & Offer Intelligence
## Innovation Strategy Analysis
## Stakeholder Engagement Deep Dive
## Strategic Differentiation Roadmap
## 10 Specific Tactics to Win
## 30 / 60 / 90 Day Action Plan

DEPTH REQUIREMENTS (mandatory):
- Write at least 150 words per major section (more for Evidence and Tactics).
- Evidence From Their Site: minimum 8 bullet points, each citing a specific phrase, feature, price, or claim from the scrape (use quotes).
- 10 Specific Tactics to Win: number 1–10. For EACH tactic include:
  (a) bold tactic title,
  (b) 2–3 sentences on what to do,
  (c) why it exploits their weakness or your advantage (cite scrape or questionnaire),
  (d) one concrete first step to take this week.
- 30 / 60 / 90 Day Action Plan: break into three subsections with 4–6 bullets each (owner, channel, metric).

Style: bullet points with **bold key terms**. Be specific. Ban vague lines like "focus on innovation" without tying to evidence. No placeholders — only actionable detail.
`

  const maxRetries = 3
  let lastError: unknown = null
  const geminiTimeoutMs = DREAMPULSE_GEMINI_TIMEOUT_MS

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `Analysis timeout after ${Math.round(geminiTimeoutMs / 1000)} seconds`
              )
            ),
          geminiTimeoutMs
        )
      })

      const analysisPromise = model.generateContent(prompt)
      const result = await Promise.race([analysisPromise, timeoutPromise])
      return normalizeAnalysisMarkdown(result.response.text())
    } catch (error: unknown) {
      lastError = error
      const message = error instanceof Error ? error.message : ''
      const name = error instanceof Error ? error.name : ''

      if (
        message.includes('503') ||
        message.includes('overloaded') ||
        message.includes('Service Unavailable') ||
        message.includes('model is overloaded')
      ) {
        if (attempt < maxRetries - 1) {
          const backoffDelay = Math.pow(2, attempt + 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, backoffDelay))
          continue
        }

        try {
          const fallbackModel = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: { maxOutputTokens: maxTokens, temperature },
          })
          const result = await fallbackModel.generateContent(prompt)
          return normalizeAnalysisMarkdown(result.response.text())
        } catch {
          /* fall through */
        }
      }

      if (message.includes('timeout') || name === 'AbortError') {
        if (attempt === 0) {
          try {
            const fastModelName =
              process.env.GEMINI_TRANSCRIBE_MODEL?.trim() || 'gemini-2.5-flash'
            const fastModel = genAI.getGenerativeModel({
              model: fastModelName,
              generationConfig: {
                maxOutputTokens: Math.min(maxTokens, 16_384),
                temperature,
              },
            })
            const fastTimeout = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Fast model timeout')), 90_000)
            })
            const fastResult = await Promise.race([
              fastModel.generateContent(prompt),
              fastTimeout,
            ])
            return normalizeAnalysisMarkdown(fastResult.response.text())
          } catch {
            /* retry primary or fall through */
          }
        }

        if (attempt < maxRetries - 1) {
          const backoffDelay = Math.pow(2, attempt + 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, backoffDelay))
          continue
        }
        return (
          generateFallbackAnalysis(data, scrape) +
          '\n\n⚠️ **Note:** This is a fallback analysis. The API request timed out after multiple attempts. Please try again.'
        )
      }

      if (
        message.includes('API_KEY') ||
        message.includes('authentication') ||
        message.includes('401') ||
        message.includes('403')
      ) {
        return (
          generateFallbackAnalysis(data, scrape) +
          '\n\n⚠️ **Note:** This is a fallback analysis. Please check your GEMINI_API_KEY in .env.local'
        )
      }

      if (attempt < maxRetries - 1) {
        const backoffDelay = Math.pow(2, attempt + 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
        continue
      }
    }
  }

  const lastMessage =
    lastError instanceof Error ? lastError.message : 'Unknown error'
  return (
    generateFallbackAnalysis(data, scrape) +
    '\n\n⚠️ **Note:** This is a fallback analysis. An error occurred after multiple retry attempts: ' +
    lastMessage
  )
}

function generateFallbackAnalysis(
  data: QuestionnaireData,
  scrape?: CompetitorScrapeContext
): string {
  const evidenceBlock = scrape?.success
    ? `## Evidence From Their Site
• Live page scraped from **${scrape.url}**
• Page title: ${scrape.title ?? 'Unknown'}
• Key excerpt: ${scrape.excerpt.slice(0, 600).replace(/\s+/g, ' ')}…

`
    : `## Evidence From Their Site
• No live scrape available — verify pricing, messaging, and offers on **${data.intrapreneurName}** manually.

`

  return `# Competitive Analysis for ${data.intrapreneurName}

## Executive Summary
**${data.intrapreneurName}** competes in **${data.companyIndustry}**. Stakeholders: **${data.targetStakeholders.join(', ') || 'unspecified'}**. Your edge: **${data.yourAdvantage || 'differentiation not yet defined'}**. Their perceived weaknesses: **${data.weaknesses || 'research needed'}**.

## Competitive Positioning Analysis
• Their approach: ${data.uniqueApproach || '—'}
• Initiative cadence: ${data.initiativeFrequency || '—'}
• Project focus: ${data.projectTypes.join(', ') || '—'}
• Collaboration style: ${data.collaborationMethods.join(', ') || '—'}

${evidenceBlock}## Weakness Exploitation Strategy
1. Target gaps in: ${data.weaknesses || 'support, onboarding, or pricing clarity'}
2. Lead every message with: ${data.yourAdvantage || 'your unique value'}
3. Out-execute on: ${data.skillRating.execution < 4 ? 'delivery speed and reliability' : 'innovation and narrative'}

## Pricing & Offer Intelligence
• Compare their public pricing tiers against your offer.
• If they bundle complexity, sell **simplicity** and transparent packaging.

## 10 Specific Tactics to Win
1. Publish a side-by-side comparison page vs ${data.intrapreneurName}
2. Run ads on keywords where they rank but underserve ${data.targetStakeholders[0] || 'your ICP'}
3. Offer a faster time-to-value onboarding (under 24h)
4. Capture testimonials from teams who switched from complex tools
5. Create content attacking: ${data.weaknesses || 'their weakest customer complaint'}
6. Partner with communities your stakeholders already use
7. Price for SMB clarity if they target enterprise
8. Ship one feature they over-complicate, done simply
9. Retarget visitors who hit their pricing page
10. Weekly win/loss review against ${data.intrapreneurName}

## 30 / 60 / 90 Day Action Plan
**30 days:** Validate positioning, scrape/pricing audit, 3 comparison assets  
**60 days:** Launch campaigns on weakness themes, 5 customer proof stories  
**90 days:** Measure win rate vs ${data.intrapreneurName}, refine offer and pricing

*Template fallback — re-run analysis when Gemini API is available for full depth.*`
}
