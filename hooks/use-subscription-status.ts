'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useRef, useState } from 'react'

type SubscriptionState = {
  loading: boolean
  isPro: boolean
  subscription_tier: string
  subscription_status: string
  subscription_ends_at: string | null
}

const CACHE_KEY = 'dreamscale:subscription-status'
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

type SubscriptionCache = SubscriptionState & {
  userId: string
  cachedAt: number
}

const emptyState = (loading: boolean): SubscriptionState => ({
  loading,
  isPro: false,
  subscription_tier: 'free',
  subscription_status: 'inactive',
  subscription_ends_at: null,
})

function readCachedSubscription(userId: string | undefined): SubscriptionState | null {
  if (!userId || typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SubscriptionCache
    if (parsed.userId !== userId) return null
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null
    return {
      loading: false,
      isPro: parsed.isPro === true,
      subscription_tier: parsed.subscription_tier ?? 'free',
      subscription_status: parsed.subscription_status ?? 'inactive',
      subscription_ends_at: parsed.subscription_ends_at ?? null,
    }
  } catch {
    return null
  }
}

function writeCachedSubscription(userId: string, state: SubscriptionState): void {
  if (typeof window === 'undefined') return
  try {
    const payload: SubscriptionCache = {
      ...state,
      userId,
      cachedAt: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota errors
  }
}

/** Read last session's cache before Clerk finishes (same browser). */
function readOptimisticCache(): SubscriptionState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SubscriptionCache
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null
    return {
      loading: false,
      isPro: parsed.isPro === true,
      subscription_tier: parsed.subscription_tier ?? 'free',
      subscription_status: parsed.subscription_status ?? 'inactive',
      subscription_ends_at: parsed.subscription_ends_at ?? null,
    }
  } catch {
    return null
  }
}

function getInitialState(): SubscriptionState {
  const optimistic = readOptimisticCache()
  if (optimistic) return optimistic
  return emptyState(true)
}

export function useSubscriptionStatus() {
  const { isLoaded, user } = useUser()
  const [state, setState] = useState<SubscriptionState>(getInitialState)
  const fetchIdRef = useRef(0)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setState(emptyState(false))
      return
    }

    const requestId = ++fetchIdRef.current
    const cached = readCachedSubscription(user.id)
    if (!cached) {
      setState((prev) => ({ ...prev, loading: true }))
    }

    try {
      const res = await fetch('/api/me/subscription-status', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (requestId !== fetchIdRef.current) return

      if (!res.ok) {
        if (cached) {
          setState({ ...cached, loading: false })
        } else {
          setState(emptyState(false))
        }
        return
      }

      const data = await res.json()
      const next: SubscriptionState = {
        loading: false,
        isPro: data.isPro === true,
        subscription_tier: data.subscription_tier ?? 'free',
        subscription_status: data.subscription_status ?? 'inactive',
        subscription_ends_at: data.subscription_ends_at ?? null,
      }
      writeCachedSubscription(user.id, next)
      setState(next)
    } catch {
      if (requestId !== fetchIdRef.current) return
      if (cached) {
        setState({ ...cached, loading: false })
      } else {
        setState(emptyState(false))
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (!isLoaded) return

    if (!user?.id) {
      setState(emptyState(false))
      return
    }

    const cached = readCachedSubscription(user.id)
    if (cached) {
      setState(cached)
    }

    void refresh()
  }, [isLoaded, user?.id, refresh])

  return { ...state, refresh }
}
