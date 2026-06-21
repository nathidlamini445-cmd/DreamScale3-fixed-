import { NextRequest, NextResponse } from 'next/server'

import { requireProUser } from '@/lib/billing/require-pro'

import { exportContentToNotion, exportSystemToNotion } from '@/lib/notion/client'

import { isNotionConfigured } from '@/lib/notion/config'

import { getNotionIntegration } from '@/lib/notion/store'

import type { BusinessSystem } from '@/components/systems/SystemBuilder'



export async function POST(request: NextRequest) {

  const proGate = await requireProUser()

  if (proGate.error) return proGate.error



  if (!isNotionConfigured()) {

    return NextResponse.json(

      { error: 'Notion integration is not configured on the server.' },

      { status: 503 }

    )

  }



  const integration = await getNotionIntegration(proGate.user.id)

  if (!integration) {

    return NextResponse.json(

      {

        error: 'Connect Notion in Settings → Integrations first.',

        code: 'NOTION_NOT_CONNECTED',

      },

      { status: 400 }

    )

  }



  let body: {

    title?: string

    content?: string

    contentType?: string

    system?: BusinessSystem

  }



  try {

    body = await request.json()

  } catch {

    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })

  }



  try {

    if (body.system?.name && Array.isArray(body.system.workflows)) {

      const normalized: BusinessSystem = {

        ...body.system,

        lastAnalyzed:

          typeof body.system.lastAnalyzed === 'string'

            ? new Date(body.system.lastAnalyzed)

            : body.system.lastAnalyzed,

      }

      const result = await exportSystemToNotion(integration.accessToken, normalized)

      return NextResponse.json({ success: true, url: result.url, pageId: result.pageId })

    }



    const title = body.title?.trim()

    const content = body.content?.trim()

    if (!title || !content) {

      return NextResponse.json(

        { error: 'Title and content (or system) are required.' },

        { status: 400 }

      )

    }



    const result = await exportContentToNotion(

      integration.accessToken,

      title,

      content,

      body.contentType

    )

    return NextResponse.json({ success: true, url: result.url, pageId: result.pageId })

  } catch (error) {

    console.error('Notion export error:', error)

    const message = error instanceof Error ? error.message : 'Failed to export to Notion.'

    return NextResponse.json({ error: message }, { status: 500 })

  }

}

