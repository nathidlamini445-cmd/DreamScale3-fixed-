'use client'

/**
 * Drop-in replacement for the browser Supabase client used by `lib/supabase-data.ts`.
 *
 * The app authenticates with Clerk (not Supabase Auth), so the real anon browser client
 * has no session and every RLS policy (`auth.uid()::text = user_id`) rejects its reads and
 * writes — silently breaking persistence for chat, HypeOS, systems, calendar, tasks, etc.
 *
 * This shim re-implements the small subset of the supabase-js query builder that the data
 * layer relies on and forwards each operation to `/api/db`, which runs it with the service
 * role (bypassing RLS) while scoping everything to the authenticated Clerk user id.
 */

type ProxyResult = { data: any; error: { message: string; code?: string; details?: string } | null }

interface QueryDescriptor {
  table: string
  action?: 'select' | 'insert' | 'upsert' | 'update' | 'delete'
  columns?: string
  filters: { column: string; value: unknown }[]
  order?: { column: string; ascending: boolean }
  values?: unknown
  onConflict?: string
  returning?: { columns: string } | null
  result?: 'single' | 'maybeSingle' | 'many'
}

class ProxyQueryBuilder implements PromiseLike<ProxyResult> {
  private d: QueryDescriptor

  constructor(table: string) {
    this.d = { table, filters: [] }
  }

  select(columns = '*') {
    if (!this.d.action) {
      // Initial read.
      this.d.action = 'select'
      this.d.columns = columns
    } else {
      // `.select()` chained after insert/upsert to return the written row(s).
      this.d.returning = { columns }
    }
    return this
  }

  insert(values: unknown) {
    this.d.action = 'insert'
    this.d.values = values
    return this
  }

  upsert(values: unknown, opts?: { onConflict?: string }) {
    this.d.action = 'upsert'
    this.d.values = values
    if (opts?.onConflict) this.d.onConflict = opts.onConflict
    return this
  }

  update(values: unknown) {
    this.d.action = 'update'
    this.d.values = values
    return this
  }

  delete() {
    this.d.action = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.d.filters.push({ column, value })
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.d.order = { column, ascending: opts?.ascending !== false }
    return this
  }

  single() {
    this.d.result = 'single'
    return this
  }

  maybeSingle() {
    this.d.result = 'maybeSingle'
    return this
  }

  private async run(): Promise<ProxyResult> {
    if (typeof window === 'undefined') {
      return { data: null, error: { message: 'Data proxy can only run in the browser' } }
    }
    if (!this.d.action) this.d.action = 'select'

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.d),
      })

      if (res.status === 401) {
        return { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
      }

      const json = (await res.json().catch(() => ({}))) as ProxyResult
      if (!res.ok && !json?.error) {
        return { data: null, error: { message: `Request failed (${res.status})`, code: String(res.status) } }
      }
      return { data: json?.data ?? null, error: json?.error ?? null }
    } catch (e: any) {
      return { data: null, error: { message: e?.message || 'Network error' } }
    }
  }

  then<TResult1 = ProxyResult, TResult2 = never>(
    onfulfilled?: ((value: ProxyResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected)
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<ProxyResult | TResult> {
    return this.run().catch(onrejected)
  }
}

export function createDataProxyClient() {
  return {
    from(table: string) {
      return new ProxyQueryBuilder(table)
    },
  }
}
