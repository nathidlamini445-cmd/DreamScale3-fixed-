import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { isNotionConfigured } from '@/lib/notion/config'
import { getNotionIntegration } from '@/lib/notion/store'

export async function GET() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isNotionConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      workspaceName: null,
    })
  }

  const integration = await getNotionIntegration(proGate.user.id)

  return NextResponse.json({
    configured: true,
    connected: !!integration,
    workspaceName: integration?.workspaceName ?? null,
  })
}
