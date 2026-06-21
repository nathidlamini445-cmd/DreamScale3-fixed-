'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building, Loader2, ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveGuestWorkspaceSession } from '@/lib/workspace/guest-session'
import Link from 'next/link'

type InvitePreview = {
  workspaceId: string
  workspaceName: string
  email: string
  displayName: string | null
  status: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params.token === 'string' ? params.token : ''

  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }
    void (async () => {
      try {
        const res = await fetch(`/api/invite/${encodeURIComponent(token)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          setError('This invite link is invalid or has expired.')
          return
        }
        const data = await res.json()
        setPreview(data)
        setDisplayName(data.displayName || data.email?.split('@')[0] || '')
        if (data.status === 'active') {
          saveGuestWorkspaceSession({
            inviteToken: token,
            workspaceId: data.workspaceId,
            workspaceName: data.workspaceName,
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            joinedAt: new Date().toISOString(),
          })
          router.replace('/guest/dashboard')
          return
        }
      } catch {
        setError('Could not load invite.')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const handleAccept = async () => {
    if (!displayName.trim()) {
      setError('Enter your name to join')
      return
    }

    setAccepting(true)
    setError(null)
    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not join workspace')
        return
      }

      saveGuestWorkspaceSession({
        inviteToken: token,
        workspaceId: data.workspaceId,
        workspaceName: data.workspaceName,
        email: data.email,
        displayName: data.displayName,
        joinedAt: new Date().toISOString(),
      })

      router.push('/guest/dashboard')
    } catch {
      setError('Could not join workspace')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#005DFF]" />
      </div>
    )
  }

  if (error && !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <Link href="/login">
            <Button variant="outline">Go to DreamScale</Button>
          </Link>
        </div>
      </div>
    )
  }

  const alreadyJoined = preview?.status === 'active'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#005DFF] flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Workspace invite</p>
            <h1 className="text-xl font-semibold text-white">{preview?.workspaceName}</h1>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          You have been invited to collaborate on{' '}
          <strong className="text-white">{preview?.workspaceName}</strong> on DreamScale.
        </p>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-3 text-sm text-slate-300 flex items-start gap-2">
          <Users className="w-4 h-4 text-[#005DFF] shrink-0 mt-0.5" />
          <span>
            No DreamScale account needed. Enter your name to join as a guest collaborator.
          </span>
        </div>

        {!alreadyJoined && (
          <div className="space-y-2">
            <Label htmlFor="guest-name" className="text-slate-300">
              Your name
            </Label>
            <Input
              id="guest-name"
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              disabled={accepting}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {alreadyJoined ? (
          <Button className="w-full gap-2 bg-[#005DFF] hover:bg-[#0050dd]" asChild>
            <Link href="/guest/dashboard">
              Open workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full gap-2 bg-[#005DFF] hover:bg-[#0050dd]"
            onClick={() => void handleAccept()}
            disabled={accepting || !displayName.trim()}
          >
            {accepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Join workspace
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-slate-500 text-center">
          Want your own full account later?{' '}
          <Link href="/login" className="text-[#005DFF] underline">
            Sign up separately
          </Link>
        </p>
      </div>
    </div>
  )
}
