'use client'

import { useState } from 'react'
import { Loader2, Pencil, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

export default function GuestTeamPage() {
  const { session, memberId, teammates, updateDisplayName } = useGuestWorkspace()
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(session?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const ok = await updateDisplayName(nameDraft)
    if (!ok) setError('Could not save name')
    else setEditing(false)
    setSaving(false)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#005DFF]" />
          People
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Everyone in {session?.workspaceName}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">Your name</p>
          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setNameDraft(session?.displayName ?? '')
                setEditing(true)
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <Label htmlFor="guest-name">Display name</Label>
            <Input
              id="guest-name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              disabled={saving}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleSave()} disabled={saving || !nameDraft.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-900 dark:text-white">{session?.displayName}</p>
        )}
      </div>

      <ul className="space-y-2">
        {teammates.map((person) => (
          <li
            key={person.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              person.id === memberId
                ? 'border-[#005DFF]/30 bg-[#005DFF]/5'
                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {person.displayName}
              {person.id === memberId && (
                <span className="ml-2 text-xs text-[#005DFF]">(you)</span>
              )}
            </span>
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
              {person.roleLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
