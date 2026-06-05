'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import type { UsageQuotaPublic } from '@/lib/usage-quota/types'

export function useUsageQuota(pollMs = 30_000) {
  const { isLoaded, user } = useUser()
  const [usage, setUsage] = useState<UsageQuotaPublic | null>(null)
  const [storeError, setStoreError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setUsage(null)
      setStoreError(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/me/usage', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        setUsage(null)
        if (res.status === 503) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          setStoreError(
            body.error ??
              'Free-tier limits are not active. Run supabase-free-usage-migration.sql in Supabase.'
          )
        } else {
          setStoreError(null)
        }
        return
      }
      setStoreError(null)
      const data = (await res.json()) as UsageQuotaPublic
      setUsage(data)
    } catch {
      setUsage(null)
      setStoreError(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isLoaded) return
    void refresh()
  }, [isLoaded, refresh])

  useEffect(() => {
    if (!user?.id) return
    const id = setInterval(() => void refresh(), pollMs)
    return () => clearInterval(id)
  }, [user?.id, pollMs, refresh])

  return { usage, loading, storeError, refresh }
}
