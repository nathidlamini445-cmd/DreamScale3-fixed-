'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UsageLimitModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}

export function UsageLimitModal({
  open,
  onOpenChange,
  title,
  description,
}: UsageLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-[#e8e6dc] bg-[#faf9f6] dark:border-gray-700 dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-[#1a1a18] dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-[#5c5a52] dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Link
            href="/billing"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants(),
              'rounded-full bg-[#005DFF] hover:bg-[#0047cc] text-white'
            )}
          >
            Upgrade to Pro
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
