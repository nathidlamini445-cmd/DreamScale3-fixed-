'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  findLeadershipItemById,
  type LeadershipDetailKind,
} from '@/lib/leadership/persist-leadership'

export function useLeadershipDetail<T extends { id: string }>(
  kind: LeadershipDetailKind,
  id: string | string[] | undefined
) {
  const { user } = useUser()
  const [item, setItem] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedId = Array.isArray(id) ? id[0] : id

  useEffect(() => {
    if (!resolvedId) {
      setLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const found = await findLeadershipItemById<T>(user?.id, kind, resolvedId)
        if (!cancelled) setItem(found)
      } catch (e) {
        console.error(`Failed to load leadership ${kind} detail:`, e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id, kind, resolvedId])

  return { item, loading }
}
