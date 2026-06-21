type ExportGoogleSheetsResult = {
  url?: string
  spreadsheetId?: string
  error?: string
  code?: string
}

export async function exportToGoogleSheets(
  payload: Record<string, unknown>,
  returnTo?: string
): Promise<ExportGoogleSheetsResult> {
  const res = await fetch('/api/integrations/google/export-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const raw = await res.text()
  let data = {} as ExportGoogleSheetsResult
  try {
    data = raw ? (JSON.parse(raw) as ExportGoogleSheetsResult) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    if (data.code === 'GOOGLE_NOT_CONNECTED') {
      const path =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : returnTo ?? '/settings'
      window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(path)}`
      return data
    }
    const fallback =
      raw && !raw.trimStart().startsWith('<')
        ? raw.slice(0, 300)
        : `Export failed (HTTP ${res.status})`
    throw new Error(data.error || fallback)
  }

  return data
}

