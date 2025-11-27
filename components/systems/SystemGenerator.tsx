"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2 } from "lucide-react"

interface SystemGeneratorProps {
  onGenerate: (data: {
    type: string
    teamSize: number
    stage: 'idea' | 'mvp' | 'scaling'
  }) => void
  isGenerating: boolean
}

export default function SystemGenerator({ onGenerate, isGenerating }: SystemGeneratorProps) {
  const [businessType, setBusinessType] = useState('')
  const [teamSize, setTeamSize] = useState(1)
  const [stage, setStage] = useState<'idea' | 'mvp' | 'scaling'>('idea')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType.trim()) {
      alert('Please enter a business type')
      return
    }
    onGenerate({ type: businessType, teamSize, stage })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Generate Custom System
        </CardTitle>
        <CardDescription>
          Tell us about your business and we'll generate a complete operational system tailored to your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type *</Label>
            <Input
              id="business-type"
              placeholder="e.g., SaaS, E-commerce, Agency, Consulting"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Describe your business model or industry
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size</Label>
              <Input
                id="team-size"
                type="number"
                min="1"
                max="100"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Business Stage</Label>
              <Select value={stage} onValueChange={(value: 'idea' | 'mvp' | 'scaling') => setStage(value)}>
                <SelectTrigger id="stage" disabled={isGenerating}>
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
            <Label htmlFor="additional-info">Additional Information (Optional)</Label>
            <Textarea
              id="additional-info"
              placeholder="Tell us more about your specific needs, challenges, or goals..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provide any additional context that will help us create a more tailored system
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              What You'll Get:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
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
            className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3]"
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
      </CardContent>
    </Card>
  )
}

