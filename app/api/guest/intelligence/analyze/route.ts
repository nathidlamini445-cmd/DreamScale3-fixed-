import { NextResponse } from 'next/server'
import {
  runQuestionnaireAnalysis,
  type QuestionnaireData,
} from '@/lib/dreampulse/questionnaire-analysis'
import { resolveGuestInvite } from '@/lib/workspace/guest-invite'

export const maxDuration = 300

export async function POST(request: Request) {
  let body: (QuestionnaireData & { inviteToken?: string }) | null = null

  try {
    body = (await request.json()) as QuestionnaireData & { inviteToken?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const token = typeof body?.inviteToken === 'string' ? body.inviteToken.trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing invite token' }, { status: 400 })
  }

  const invite = await resolveGuestInvite(token)
  if (!invite) {
    return NextResponse.json({ error: 'Guest session not found' }, { status: 404 })
  }

  const { inviteToken: _token, ...data } = body
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
}
