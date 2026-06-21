/** Google Sheets cells must be primitives — coerce objects (e.g. AI tool { name, use }). */
export function toSheetCell(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(toSheetCell).join(', ')
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const name = typeof obj.name === 'string' ? obj.name : null
    const use =
      typeof obj.use === 'string'
        ? obj.use
        : typeof obj.description === 'string'
          ? obj.description
          : null
    if (name && use) return `${name}: ${use}`
    if (name) return name
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function normalizeSheetRows(rows: unknown[][]): string[][] {
  return rows.map((row) => row.map(toSheetCell))
}

/** Plain-text label for tools in Docs/share exports. */
export function formatToolLabel(tool: unknown): string {
  return toSheetCell(tool)
}
