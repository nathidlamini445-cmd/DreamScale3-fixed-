'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'

type SubscriptionState = {
  loading: boolean
  isPro: boolean
  subscription_tier: string
  subscription_status: string
}

const initial: SubscriptionState = {
  loading: true,
  isPro: false,
  subscription_tier: 'free',
  subscription_status: 'inactive',
}

export function useSubscriptionStatus() {
  const { isLoaded, user } = useUser()
  const [state, setState] = useState<SubscriptionState>(initial)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setState({ ...initial, loading: false })
      return
    }
    try {
      const res = await fetch('/api/me/subscription-status', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        setState({ ...initial, loading: false })
        return
      }
      const data = await res.json()
      setState({
        loading: false,
        isPro: data.isPro === true,
        subscription_tier: data.subscription_tier ?? 'free',
        subscription_status: data.subscription_status ?? 'inactive',
      })
    } catch {
      setState({ ...initial, loading: false })
    }
  }, [user?.id])

  useEffect(() => {
    if (!isLoaded) return
    void refresh()
  }, [isLoaded, refresh])

  return { ...state, refresh }
}
