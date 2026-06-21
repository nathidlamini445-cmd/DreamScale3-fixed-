"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useSessionSafe } from '@/lib/session-context'

interface SystemGeneratorProps {
  onGenerate: (data: {
    type: string
    teamSize: number
    stage: 'idea' | 'mvp' | 'scaling'
    templateName?: string
    additionalInfo?: string
  }) => void
  isGenerating: boolean
}

const firstString = (value: string | string[] | null | undefined): string | null => {
  if (Array.isArray(value)) return value.find((v) => typeof v === 'string' && v.trim()) ?? null
  return typeof value === 'string' && value.trim() ? value : null
}

const stageFromProfile = (value: string | null): 'idea' | 'mvp' | 'scaling' | null => {
  if (!value) return null
  const v = value.toLowerCase()
  if (v.includes('idea') || v.includes('start')) return 'idea'
  if (v.includes('scal') || v.includes('grow') || v.includes('establish')) return 'scaling'
  if (v.includes('mvp') || v.includes('launch') || v.includes('early')) return 'mvp'
  return null
}

export default function SystemGenerator({ onGenerate, isGenerating }: SystemGeneratorProps) {
  const sessionContext = useSessionSafe()
  const [businessType, setBusinessType] = useState('')
  const [teamSize, setTeamSize] = useState(1)
  const [stage, setStage] = useState<'idea' | 'mvp' | 'scaling'>('idea')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false)
  const didPrefillRef = useRef(false)

  // Pre-fill from the user's onboarding profile so the generated system is theirs, not generic.
  useEffect(() => {
    if (didPrefillRef.current) return
    const profile = sessionContext?.sessionData?.entrepreneurProfile
    if (!profile) return

    const industry = firstString(profile.industry)
    const profileTeamSize = firstString(profile.teamSize)
    const profileStage = stageFromProfile(firstString(profile.businessStage))

    if (!industry && !profileTeamSize && !profileStage) return
    didPrefillRef.current = true

    if (industry) setBusinessType(industry)
    if (profileTeamSize) {
      const parsed = parseInt(profileTeamSize.replace(/\D/g, ''), 10)
      if (!Number.isNaN(parsed) && parsed > 0) setTeamSize(Math.min(parsed, 100))
    }
    if (profileStage) setStage(profileStage)
    setPrefilledFromProfile(true)
  }, [sessionContext?.sessionData?.entrepreneurProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType.trim()) return
    onGenerate({
      type: businessType,
      teamSize,
      stage,
      additionalInfo: additionalInfo.trim() || undefined,
    })
  }

  return (
    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Generate Custom System
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tell us about your business and we'll generate a complete operational system tailored to your needs
        </p>
        {prefilledFromProfile && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200/70 bg-blue-50/70 px-3 py-2 text-xs text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-200">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Pre-filled from your business profile — the generated system will be tailored to your industry, challenges, and goals.
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-type" className="text-sm font-medium text-gray-900 dark:text-white">Business Type *</Label>
          <Input
            id="business-type"
            placeholder="e.g., SaaS, E-commerce, Agency, Consulting"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            required
            disabled={isGenerating}
            className="border-gray-200/60 dark:border-gray-800/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team-size" className="text-sm font-medium text-gray-900 dark:text-white">Team Size</Label>
            <Input
              id="team-size"
              type="number"
              min="1"
              max="100"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
              disabled={isGenerating}
              className="border-gray-200/60 dark:border-gray-800/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium text-gray-900 dark:text-white">Business Stage</Label>
            <Select value={stage} onValueChange={(value: 'idea' | 'mvp' | 'scaling') => setStage(value)}>
              <SelectTrigger id="stage" disabled={isGenerating} className="border-gray-200/60 dark:border-gray-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea Stage</SelectItem>
                <SelectItem value="mvp">MVP Stage</SelectItem>
                <SelectItem value="scaling">Scaling Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional-info" className="text-sm font-medium text-gray-900 dark:text-white">Additional Information (Optional)</Label>
          <Textarea
            id="additional-info"
            placeholder="Tell us more about your specific needs, challenges, or goals..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            disabled={isGenerating}
            className="border-gray-200/60 dark:border-gray-800/60"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            What You'll Get:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Complete workflow processes</li>
            <li>Recommended tools and integrations</li>
            <li>Role definitions and responsibilities</li>
            <li>Key metrics to track</li>
            <li>Automation opportunities</li>
            <li>Visual workflow diagrams</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={!businessType.trim() || isGenerating}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Your System...
            </>
          ) : (
            <>
              Generate System
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

