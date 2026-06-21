"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Copy, Link2, Twitter, Linkedin, MessageCircle, Check, Download, FileText, BookOpen, Table2, MessageSquare } from "lucide-react"
import { downloadPDF, type PDFData } from "@/lib/pdf-generator"
import { useSubscriptionStatus } from "@/hooks/use-subscription-status"
import { exportToGoogleSheets } from "@/lib/integrations/export-google-sheets"
import { toast } from "sonner"
import type { BusinessSystem } from "@/components/systems/SystemBuilder"
import type { SmartTaskAssignment } from "@/lib/teams-types"
import type { GoogleSheetExport } from "@/lib/google/sheet-types"

type RevenueSheetPayload = {
  companyName: string
  industry: string
  analysis: {
    revenueStreams: { name: string; type: string; estimatedRevenue: string; growthRate: string; description: string }[]
    pricingStrategy: { model: string; analysis: string; recommendations: string[] }
    marketPosition: { position: string; competitors: string[]; differentiation: string }
    growthOpportunities: { opportunity: string; potential: string; actionItems: string[] }[]
    revenueProjections: { timeframe: string; projection: string; assumptions: string[] }[]
  }
}

type CompetitiveIntelligenceSheetPayload = {
  subject: string
  analysisResult: string
  data?: Record<string, unknown>
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  messageContent: string
  conversationTitle?: string
  contentType?: string
  contentTitle?: string
  system?: BusinessSystem
  taskAssignment?: SmartTaskAssignment
  revenueAnalysis?: RevenueSheetPayload
  competitiveIntelligence?: CompetitiveIntelligenceSheetPayload
  revenueOsSheets?: GoogleSheetExport
}

export function ShareModal({
  isOpen,
  onClose,
  messageContent,
  conversationTitle,
  contentType = 'Bizora AI Response',
  contentTitle,
  system,
  taskAssignment,
  revenueAnalysis,
  competitiveIntelligence,
  revenueOsSheets,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [googleExporting, setGoogleExporting] = useState(false)
  const [sheetsExporting, setSheetsExporting] = useState(false)
  const [notionExporting, setNotionExporting] = useState(false)
  const [slackExporting, setSlackExporting] = useState(false)
  const { isPro } = useSubscriptionStatus()

  const supportsSheetsExport = !!(
    system ||
    taskAssignment ||
    revenueAnalysis ||
    competitiveIntelligence ||
    revenueOsSheets?.sheets?.length
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  const handleExportGoogleDocs = useCallback(async () => {
    if (!isPro) {
      toast.error('Google Docs export requires DreamScale Pro')
      return
    }
    setGoogleExporting(true)
    try {
      const res = await fetch('/api/integrations/google/export-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: contentTitle || contentType,
          content: messageContent,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'GOOGLE_NOT_CONNECTED') {
          window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
          return
        }
        throw new Error(data.error || 'Export failed')
      }
      toast.success('Exported to Google Docs')
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (error) {
      toast.error('Google Docs export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setGoogleExporting(false)
    }
  }, [isPro, contentTitle, contentType, messageContent, onClose])

  const handleExportGoogleSheets = useCallback(async () => {
    if (!isPro) {
      toast.error('Google Sheets export requires DreamScale Pro')
      return
    }
    if (!supportsSheetsExport) return

    setSheetsExporting(true)
    try {
      const payload: Record<string, unknown> = {}
      if (system) {
        payload.system = {
          ...system,
          lastAnalyzed:
            system.lastAnalyzed instanceof Date
              ? system.lastAnalyzed.toISOString()
              : system.lastAnalyzed,
        }
      }
      if (taskAssignment) payload.taskAssignment = taskAssignment
      if (revenueAnalysis) payload.revenue = revenueAnalysis
      if (competitiveIntelligence) {
        payload.competitiveIntelligence = competitiveIntelligence
      }
      if (revenueOsSheets?.sheets?.length) {
        payload.sheets = revenueOsSheets.sheets
        payload.title = revenueOsSheets.title
      }
      if (contentTitle && !payload.title) payload.title = contentTitle

      const data = await exportToGoogleSheets(payload)
      if (data.code === 'GOOGLE_NOT_CONNECTED') return

      toast.success('Exported to Google Sheets')
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (error) {
      toast.error('Google Sheets export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setSheetsExporting(false)
    }
  }, [
    isPro,
    supportsSheetsExport,
    system,
    taskAssignment,
    revenueAnalysis,
    competitiveIntelligence,
    revenueOsSheets,
    contentTitle,
    onClose,
  ])

  const handleExportNotion = useCallback(async () => {
    if (!isPro) {
      toast.error('Notion export requires DreamScale Pro')
      return
    }
    setNotionExporting(true)
    try {
      const payload: Record<string, unknown> = {
        title: contentTitle || contentType,
        content: messageContent,
        contentType,
      }
      if (system) {
        payload.system = {
          ...system,
          lastAnalyzed:
            system.lastAnalyzed instanceof Date
              ? system.lastAnalyzed.toISOString()
              : system.lastAnalyzed,
        }
      }

      const res = await fetch('/api/integrations/notion/export-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'NOTION_NOT_CONNECTED') {
          window.location.href = `/api/integrations/notion/connect?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
          return
        }
        throw new Error(data.error || 'Export failed')
      }
      toast.success('Exported to Notion')
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (error) {
      toast.error('Notion export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setNotionExporting(false)
    }
  }, [isPro, contentTitle, contentType, messageContent, onClose, system])

  const handleExportSlack = useCallback(async () => {
    if (!isPro) {
      toast.error('Slack requires DreamScale Pro')
      return
    }
    setSlackExporting(true)
    try {
      const text = contentTitle ? `*${contentTitle}*\n\n${messageContent}` : messageContent
      const res = await fetch('/api/integrations/slack/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text.slice(0, 3500), title: contentTitle || contentType }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'SLACK_NOT_CONNECTED') {
          window.location.href = `/api/integrations/slack/connect?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
          return
        }
        throw new Error(data.error || 'Send failed')
      }
      toast.success('Sent to Slack')
      onClose()
    } catch (error) {
      toast.error('Slack send failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setSlackExporting(false)
    }
  }, [isPro, contentTitle, contentType, messageContent, onClose])

  if (!isOpen || !mounted) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownloadPDF = async () => {
    const pdfData: PDFData = {
      title: contentTitle || contentType,
      subtitle: 'DreamScale AI-Powered Intelligence',
      analysisDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      competitorUrl: 'N/A',
      content: messageContent,
      metadata: {
        author: contentType,
        version: '1.0',
        category: contentType,
      },
    }

    await downloadPDF(
      pdfData,
      `${contentType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
    )
  }

  const shareOptions = [
    {
      id: 'copy-link',
      icon: Link2,
      label: 'Copy link',
      action: handleCopyLink,
      color: 'text-blue-500',
    },
    {
      id: 'copy-text',
      icon: Copy,
      label: 'Copy text',
      action: handleCopyText,
      color: 'text-gray-500',
    },
    {
      id: 'twitter',
      icon: Twitter,
      label: 'X (Twitter)',
      action: () => {
        const text = encodeURIComponent(`Check out this AI response:\n\n${messageContent}`)
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
      },
      color: 'text-blue-400',
    },
    {
      id: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      action: () => {
        const text = encodeURIComponent(`AI Response: ${messageContent}`)
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`,
          '_blank'
        )
      },
      color: 'text-blue-600',
    },
    {
      id: 'reddit',
      icon: MessageCircle,
      label: 'Reddit',
      action: () => {
        const text = encodeURIComponent(`AI Response: ${messageContent}`)
        window.open(`https://reddit.com/submit?title=AI Response&text=${text}`, '_blank')
      },
      color: 'text-orange-500',
    },
    {
      id: 'download-pdf',
      icon: Download,
      label: 'Download as PDF',
      action: handleDownloadPDF,
      color: 'text-red-500',
    },
    {
      id: 'google-docs',
      icon: FileText,
      label: googleExporting ? 'Exporting…' : 'Google Docs',
      action: handleExportGoogleDocs,
      color: 'text-green-600',
      disabled: googleExporting || sheetsExporting || slackExporting || notionExporting,
      proOnly: true,
    },
    ...(supportsSheetsExport
      ? [
          {
            id: 'google-sheets',
            icon: Table2,
            label: sheetsExporting ? 'Exporting…' : 'Google Sheets',
            action: handleExportGoogleSheets,
            color: 'text-emerald-600',
            disabled: googleExporting || sheetsExporting || slackExporting || notionExporting,
            proOnly: true,
          },
        ]
      : []),
    {
      id: 'notion',
      icon: BookOpen,
      label: notionExporting ? 'Exporting…' : 'Notion',
      action: handleExportNotion,
      color: 'text-gray-800 dark:text-gray-200',
      disabled: googleExporting || sheetsExporting || slackExporting || notionExporting,
      proOnly: true,
    },
    {
      id: 'slack',
      icon: MessageSquare,
      label: slackExporting ? 'Sending…' : 'Slack',
      action: handleExportSlack,
      color: 'text-purple-600',
      disabled: googleExporting || sheetsExporting || slackExporting || notionExporting,
      proOnly: true,
    },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3
            id="share-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Share {contentTitle || contentType}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shareOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={option.action}
                  disabled={'disabled' in option && option.disabled}
                  className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
                >
                  <div className="rounded-full bg-gray-100 p-3 transition-colors group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
                    <Icon className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <span className="text-center text-xs font-medium leading-tight text-gray-700 dark:text-gray-300 sm:text-sm">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>

          {copied && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>Copied to clipboard!</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Share this {contentType.toLowerCase()} with others
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
