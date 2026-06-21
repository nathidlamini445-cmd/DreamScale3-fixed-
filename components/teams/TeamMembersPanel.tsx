"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Download,
  Loader2,
  X,
  Check,
} from 'lucide-react'
import type { TeamMember } from '@/lib/teams-types'
import {
  fetchWorkspaceTeamMembers,
  mergeTeamMembers,
} from '@/lib/teams/import-workspace-members'
import { toast } from 'sonner'

interface TeamMembersPanelProps {
  members: TeamMember[]
  onUpdateMembers: (members: TeamMember[]) => void
}

const EMPTY_FORM = {
  name: '',
  role: '',
  email: '',
  skills: '',
  workStyle: '',
  communicationPreference: 'collaborative' as TeamMember['communicationPreference'],
}

export default function TeamMembersPanel({
  members,
  onUpdateMembers,
}: TeamMembersPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [importing, setImporting] = useState(false)

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowAdd(false)
  }

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id)
    setShowAdd(true)
    setForm({
      name: member.name,
      role: member.role,
      email: member.email ?? '',
      skills: member.skills.join(', '),
      workStyle: member.workStyle,
      communicationPreference: member.communicationPreference,
    })
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required')
      return
    }

    const payload: TeamMember = {
      id: editingId ?? Date.now().toString(),
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim() || undefined,
      strengths: [],
      workStyle: form.workStyle.trim() || 'flexible',
      communicationPreference: form.communicationPreference,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      workload: editingId
        ? members.find((m) => m.id === editingId)?.workload ?? 0
        : 0,
      performanceHistory:
        members.find((m) => m.id === editingId)?.performanceHistory ?? [],
    }

    if (editingId) {
      onUpdateMembers(members.map((m) => (m.id === editingId ? payload : m)))
      toast.success('Member updated')
    } else {
      onUpdateMembers([...members, payload])
      toast.success('Member added')
    }
    resetForm()
  }

  const handleDelete = (id: string) => {
    onUpdateMembers(members.filter((m) => m.id !== id))
    if (editingId === id) resetForm()
    toast.success('Member removed')
  }

  const handleImportWorkspace = async () => {
    setImporting(true)
    try {
      const imported = await fetchWorkspaceTeamMembers()
      if (imported.length === 0) {
        toast.message('No workspace collaborators found', {
          description: 'Invite teammates in Settings → Teamspaces first.',
        })
        return
      }
      const { merged, added } = mergeTeamMembers(members, imported)
      onUpdateMembers(merged)
      if (added === 0) {
        toast.message('Everyone is already on your roster')
      } else {
        toast.success(`Imported ${added} teammate${added === 1 ? '' : 's'} from workspace`)
      }
    } catch {
      toast.error('Could not load workspace members')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 mb-6">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#39d2c0]" />
              Team roster
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {members.length} member{members.length !== 1 ? 's' : ''} · used across DNA, tasks, and health
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportWorkspace}
              disabled={importing}
            >
              {importing ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              Import workspace
            </Button>
            {!showAdd && (
              <Button size="sm" onClick={() => setShowAdd(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add member
              </Button>
            )}
          </div>
        </div>

        {members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Add your team to unlock AI DNA analysis and smart assignments.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Use <span className="font-medium">Import workspace</span> above, or invite people in Settings → Teamspaces.
            </p>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add first member
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {member.role}
                  </p>
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(member)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {editingId ? 'Edit member' : 'New member'}
              </p>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role *</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Product lead"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Skills (comma-separated)</Label>
                <Input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Design, sales, ops"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Work style</Label>
                <Input
                  value={form.workStyle}
                  onChange={(e) => setForm({ ...form, workStyle: e.target.value })}
                  placeholder="Fast-paced, detail-oriented"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Communication</Label>
                <Select
                  value={form.communicationPreference}
                  onValueChange={(v: TeamMember['communicationPreference']) =>
                    setForm({ ...form, communicationPreference: v })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              {editingId ? 'Save changes' : 'Add to roster'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
