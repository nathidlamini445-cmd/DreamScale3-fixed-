import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import type { BusinessSystem } from '@/components/systems/SystemBuilder'
import {
  createGoogleSpreadsheet,
  getValidGoogleAccessToken,
} from '@/lib/google/client'
import { isGoogleConfigured } from '@/lib/google/config'
import {
  formatCompetitiveIntelligenceForSheet,
  formatRevenueForSheet,
  formatRoadmapForSheet,
  formatSystemForSheet,
  formatTaskAssignmentForSheet,
} from '@/lib/google/sheet-formatters'
import { getGoogleIntegration } from '@/lib/google/store'
import type { GoogleSheetExport } from '@/lib/google/sheet-types'
import type { SmartTaskAssignment } from '@/lib/teams-types'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: 'Google integration is not configured on the server.' },
      { status: 503 }
    )
  }

  const integration = await getGoogleIntegration(proGate.user.id)
  if (!integration) {
    return NextResponse.json(
      {
        error: 'Connect Google in Settings → Integrations first.',
        code: 'GOOGLE_NOT_CONNECTED',
      },
      { status: 400 }
    )
  }

  let body: {
    title?: string
    sheets?: GoogleSheetExport['sheets']
    system?: BusinessSystem
    roadmap?: {
      businessName?: string
      mainSuggestions: Parameters<typeof formatRoadmapForSheet>[0]['mainSuggestions']
      dailySuggestions: Parameters<typeof formatRoadmapForSheet>[0]['dailySuggestions']
      deepFocusAreas: Parameters<typeof formatRoadmapForSheet>[0]['deepFocusAreas']
      completedIds: string[]
    }
    revenue?: Parameters<typeof formatRevenueForSheet>[0]
    taskAssignment?: SmartTaskAssignment
    competitiveIntelligence?: Parameters<typeof formatCompetitiveIntelligenceForSheet>[0]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  let exportData: GoogleSheetExport | null = null

  if (body.system?.name) {
    const system: BusinessSystem = {
      ...body.system,
      lastAnalyzed:
        typeof body.system.lastAnalyzed === 'string'
          ? new Date(body.system.lastAnalyzed)
          : body.system.lastAnalyzed,
    }
    exportData = formatSystemForSheet(system)
  } else if (body.roadmap) {
    try {
      exportData = formatRoadmapForSheet(body.roadmap)
    } catch (error) {
      console.error('Roadmap sheet format error:', error)
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Could not format roadmap for Google Sheets.',
        },
        { status: 400 }
      )
    }
  } else if (body.revenue?.companyName) {
    exportData = formatRevenueForSheet(body.revenue)
  } else if (body.taskAssignment?.projectName) {
    exportData = formatTaskAssignmentForSheet(body.taskAssignment)
  } else if (body.competitiveIntelligence?.subject) {
    exportData = formatCompetitiveIntelligenceForSheet(body.competitiveIntelligence)
  } else if (body.sheets?.length) {
    exportData = {
      title: body.title?.trim() || 'DreamScale Export',
      sheets: body.sheets,
    }
  }

  if (!exportData?.sheets?.length) {
    return NextResponse.json(
      {
        error:
          'No roadmap data to export. Generate your roadmap first, then try again.',
        code: 'ROADMAP_EMPTY',
      },
      { status: 400 }
    )
  }

  if (body.title?.trim()) {
    exportData = { ...exportData, title: body.title.trim() }
  }

  try {
    const accessToken = await getValidGoogleAccessToken(proGate.user.id)
    const result = await createGoogleSpreadsheet(
      accessToken,
      exportData.title,
      exportData.sheets
    )
    return NextResponse.json({
      success: true,
      url: result.url,
      spreadsheetId: result.spreadsheetId,
    })
  } catch (error) {
    console.error('Google Sheets export error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to export to Google Sheets.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

