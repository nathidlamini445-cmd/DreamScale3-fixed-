'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

/** Shows toasts after OAuth redirects (?google=|slack=). */
export function GoogleOAuthCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const handled = useRef(false)

  useEffect(() => {
    const google = searchParams.get('google')
    const slack = searchParams.get('slack')
    if ((!google && !slack) || handled.current) return
    handled.current = true

    if (google === 'connected') {
      toast.success('Google connected', {
        description: 'Export to Docs, Sheets, and add events to Calendar.',
      })
    } else if (google === 'error') {
      toast.error('Could not connect Google', {
        description:
          'Enable Drive, Docs, Sheets, and Calendar APIs, then reconnect in Settings.',
      })
    } else if (google === 'cancelled') {
      toast.message('Google connection cancelled')
    }

    if (slack === 'connected') {
      toast.success('Slack connected', { description: 'Send insights to your workspace channel.' })
    } else if (slack === 'error') {
      toast.error('Could not connect Slack', { description: 'Check your Slack app OAuth settings.' })
    } else if (slack === 'cancelled') {
      toast.message('Slack connection cancelled')
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('google')
    params.delete('slack')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, router, pathname])

  return null
}
