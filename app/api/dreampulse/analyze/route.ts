import { NextResponse } from 'next/server'
import { requireMonthlyQuota } from '@/lib/usage-quota/require-monthly'
import {
  runQuestionnaireAnalysis,
  type QuestionnaireData,
} from '@/lib/dreampulse/questionnaire-analysis'

/** Allow scrape + Gemini on Vercel (local dev has no hard cap). */
export const maxDuration = 300

export async function POST(request: Request) {
  const quotaGate = await requireMonthlyQuota('competitor')
  if (quotaGate.error) return quotaGate.error

  let data: QuestionnaireData | null = null

  try {
    data = (await request.json()) as QuestionnaireData

    if (!data || !data.intrapreneurName || !data.companyIndustry) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const result = await runQuestionnaireAnalysis(data)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 })
    }

    return NextResponse.json({
      analysis: result.analysis,
      ...(result.warning ? { warning: result.warning } : {}),
      ...(result.warningKind ? { warningKind: result.warningKind } : {}),
      ...(result.scrape?.success ? { scrapeUrl: result.scrape.url } : {}),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', details: message },
      { status: 500 }
    )
  }
}
