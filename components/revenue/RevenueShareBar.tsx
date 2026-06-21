'use client'

import { useState } from 'react'
import { Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareModal } from '@/components/share-modal'
import { ExportToGoogleSheetsButton } from '@/components/integrations/ExportToGoogleSheetsButton'
import { SendToSlackButton } from '@/components/integrations/SendToSlackButton'
import type { GoogleSheetExport } from '@/lib/google/sheet-types'

type RevenueShareBarProps = {
  title: string
  contentType: string
  textContent: string
  sheetExport: GoogleSheetExport
}

export function RevenueShareBar({
  title,
  contentType,
  textContent,
  sheetExport,
}: RevenueShareBarProps) {
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>
      <ExportToGoogleSheetsButton
        label="Export to Sheets"
        title={sheetExport.title}
        payload={{ sheets: sheetExport.sheets, title: sheetExport.title }}
      />
      <SendToSlackButton title={title} message={textContent.slice(0, 3500)} label="Send to Slack" />
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        messageContent={textContent}
        contentType={contentType}
        contentTitle={title}
        revenueOsSheets={sheetExport}
      />
    </div>
  )
}
