import 'server-only'

import type { BusinessSystem } from '@/components/systems/SystemBuilder'
import { getNotionClientId, getNotionClientSecret, getNotionRedirectUri } from './config'
import { textToNotionBlocks } from './content-blocks'
import { systemToNotionBlocks } from './system-blocks'

const NOTION_VERSION = '2022-06-28'
const BLOCK_BATCH = 100
const MAX_TITLE = 2000

type OAuthTokenResponse = {
  access_token: string
  bot_id?: string
  workspace_id?: string
  workspace_name?: string
}

type CreatePageResponse = {
  id: string
  url?: string
}

async function notionFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data.message === 'string' ? data.message : `Notion API error (${res.status})`
    throw new Error(message)
  }
  return data as T
}

export async function exchangeNotionCode(code: string): Promise<OAuthTokenResponse> {
  const clientId = getNotionClientId()
  const clientSecret = getNotionClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Notion integration is not configured on the server.')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getNotionRedirectUri(),
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : 'Failed to connect Notion.'
    throw new Error(message)
  }

  return data as OAuthTokenResponse
}

function chunkBlocks<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function exportSystemToNotion(
  accessToken: string,
  system: BusinessSystem
): Promise<{ pageId: string; url: string }> {
  const allBlocks = systemToNotionBlocks(system)
  const [firstBatch, ...restBatches] = chunkBlocks(allBlocks, BLOCK_BATCH)

  const page = await notionFetch<CreatePageResponse>('/pages', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'workspace', workspace: true },
      icon: { type: 'emoji', emoji: '⚙️' },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: system.name.slice(0, MAX_TITLE) } }],
        },
      },
      children: firstBatch,
    }),
  })

  for (const batch of restBatches) {
    await notionFetch(`/blocks/${page.id}/children`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ children: batch }),
    })
  }

  const url = page.url ?? `https://www.notion.so/${page.id.replace(/-/g, '')}`
  return { pageId: page.id, url }
}

export async function exportContentToNotion(
  accessToken: string,
  title: string,
  content: string,
  contentType?: string
): Promise<{ pageId: string; url: string }> {
  const allBlocks = textToNotionBlocks(content, contentType)
  const [firstBatch, ...restBatches] = chunkBlocks(allBlocks, BLOCK_BATCH)

  const page = await notionFetch<CreatePageResponse>('/pages', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'workspace', workspace: true },
      icon: { type: 'emoji', emoji: '📄' },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: title.slice(0, MAX_TITLE) } }],
        },
      },
      children: firstBatch,
    }),
  })

  for (const batch of restBatches) {
    await notionFetch(`/blocks/${page.id}/children`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ children: batch }),
    })
  }

  const url = page.url ?? `https://www.notion.so/${page.id.replace(/-/g, '')}`
  return { pageId: page.id, url }
}
