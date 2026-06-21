import React from 'react'
import type { Components } from 'react-markdown'

/** Flatten ReactMarkdown children to plain text (avoids [object Object] in custom renderers). */
export function markdownChildrenToText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(markdownChildrenToText).join('')
  if (React.isValidElement(node)) {
    return markdownChildrenToText(
      (node.props as { children?: React.ReactNode }).children
    )
  }
  return ''
}

const proseList =
  'text-base leading-relaxed text-gray-700 dark:text-gray-300 space-y-3'

/** Shared markdown renderers for competitive intelligence reports. */
export const competitiveReportMarkdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className={`mb-4 list-disc pl-5 ${proseList}`}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className={`mb-4 list-decimal pl-5 ${proseList}`}>{children}</ol>
  ),
  li: ({ children }) => {
    const text = markdownChildrenToText(children).trim()
    if (!text) return null
    return <li className="mb-3 leading-relaxed">{children}</li>
  },
  strong: ({ children }) => (
    <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-5">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">
      {children}
    </h4>
  ),
}
