'use client'

import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function useProfileAvatar() {
  const { isLoaded, user } = useUser()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setProfilePictureUrl(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/me/profile-avatar', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        setProfilePictureUrl(null)
        return
      }
      const data = (await res.json()) as { profilePictureUrl?: string | null }
      setProfilePictureUrl(
        typeof data.profilePictureUrl === 'string' ? data.profilePictureUrl : null
      )
    } catch {
      setProfilePictureUrl(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isLoaded) return
    void refetch()
  }, [isLoaded, refetch])

  const upload = useCallback(
    async (file: File) => {
      setUploading(true)
      setError(null)
      try {
        const form = new FormData()
        form.append('avatar', file)
        const res = await fetch('/api/me/profile-avatar', {
          method: 'POST',
          body: form,
          credentials: 'include',
        })
        const data = (await res.json()) as {
          profilePictureUrl?: string
          error?: string
          hint?: string
        }
        if (!res.ok) {
          setError(data.hint ? `${data.error} — ${data.hint}` : data.error ?? 'Upload failed')
          return false
        }
        setProfilePictureUrl(data.profilePictureUrl ?? null)
        return true
      } catch {
        setError('Network error — try again')
        return false
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const remove = useCallback(async () => {
    setUploading(true)
    setError(null)
    try {
      const res = await fetch('/api/me/profile-avatar', {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Could not remove photo')
        return false
      }
      setProfilePictureUrl(null)
      return true
    } catch {
      setError('Network error — try again')
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    profilePictureUrl,
    loading,
    uploading,
    error,
    upload,
    remove,
    refetch,
  }
}
