'use client'

import { useLayoutEffect } from 'react'

/** Allows vertical scroll on billing routes (globals.css locks body scroll elsewhere). */
export function BillingScrollUnlock() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.setAttribute('data-billing-page', 'true')
    body.setAttribute('data-billing-page', 'true')
    html.style.overflowY = 'auto'
    html.style.height = 'auto'
    body.style.overflowY = 'auto'
    body.style.height = 'auto'
    body.style.minHeight = '100vh'

    return () => {
      html.removeAttribute('data-billing-page')
      body.removeAttribute('data-billing-page')
      html.style.overflowY = ''
      html.style.height = ''
      body.style.overflowY = ''
      body.style.height = ''
      body.style.minHeight = ''
    }
  }, [])

  return null
}
