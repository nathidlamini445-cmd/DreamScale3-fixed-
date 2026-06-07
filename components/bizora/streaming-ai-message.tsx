'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, ThumbsUp, ThumbsDown, Share } from 'lucide-react'

const CHARS_PER_TICK = 6
const TICK_MS = 12

const serif =
  '"Source Serif 4", "Lora", "Charter", "Georgia", "Times New Roman", serif'
const sans =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif'

const bodyClass =
  'text-[18px] leading-[1.75] text-black/88 dark:text-[#eceae4] font-normal tracking-[0.01em]'

const glowBlueClass =
  'font-bold inline align-baseline text-[#2DA8FF] dark:text-[#5CC8FF]'

const glowBlueStyle: CSSProperties = {
  WebkitFontSmoothing: 'antialiased',
}

type Props = {
  fullText: string
  animate?: boolean
  onStreamComplete?: () => void
  onRevealProgress?: () => void
  onCopy?: () => void
  onLike?: () => void
  onDislike?: () => void
  onShare?: () => void
}

export function StreamingAIMessage({
  fullText,
  animate = false,
  onStreamComplete,
  onRevealProgress,
  onCopy,
  onLike,
  onDislike,
  onShare,
}: Props) {
  const [visible, setVisible] = useState(() => (animate ? '' : fullText))
  const [isStreaming, setIsStreaming] = useState(animate)

  const onCompleteRef = useRef(onStreamComplete)
  const onProgressRef = useRef(onRevealProgress)
  const animationRunIdRef = useRef(0)

  onCompleteRef.current = onStreamComplete
  onProgressRef.current = onRevealProgress

  useEffect(() => {
    if (!animate || !fullText) {
      animationRunIdRef.current += 1
      setVisible(fullText)
      setIsStreaming(false)
      return
    }

    const runId = ++animationRunIdRef.current
    setIsStreaming(true)
    setVisible('')

    let index = 0
    const text = fullText

    const tick = () => {
      if (animationRunIdRef.current !== runId) return

      index = Math.min(text.length, index + CHARS_PER_TICK)
      setVisible(text.slice(0, index))

      if (index % 24 === 0) {
        onProgressRef.current?.()
      }

      if (index >= text.length) {
        window.clearInterval(timer)
        setVisible(text)
        setIsStreaming(false)
        onCompleteRef.current?.()
      }
    }

    const timer = window.setInterval(tick, TICK_MS)
    tick()

    return () => {
      animationRunIdRef.current += 1
      window.clearInterval(timer)
    }
  }, [animate, fullText])

  const showActions = !isStreaming

  const markdownComponents = {
    p: ({ children }: { children?: ReactNode }) => (
      <p className={`mb-5 last:mb-0 ${bodyClass}`} style={{ fontFamily: serif }}>
        {children}
      </p>
    ),
    h1: ({ children }: { children?: ReactNode }) => (
      <h1
        className="mb-4 mt-6 text-[1.5rem] font-semibold text-black dark:text-white"
        style={{ fontFamily: serif }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2
        className="mb-3 mt-5 text-[1.35rem] font-semibold text-black dark:text-white"
        style={{ fontFamily: serif }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3
        className="mb-2.5 mt-4 text-[1.2rem] font-semibold text-black dark:text-gray-100"
        style={{ fontFamily: serif }}
      >
        {children}
      </h3>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-5 list-none space-y-3 pl-0">{children}</ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-5 list-none space-y-3 pl-0">
        {children}
      </ol>
    ),
    li: ({
      children,
      ...props
    }: {
      children?: ReactNode
      node?: { parent?: { tagName?: string }; index?: number }
    }) => {
      const isOrdered = props.node?.parent?.tagName === 'ol'
      const index = (props.node?.index ?? 0) + 1

      return (
        <li className="flex items-start gap-3" style={{ fontFamily: serif }}>
          {isOrdered ? (
            <span
              className={`mt-[0.5rem] shrink-0 text-[17px] tabular-nums ${glowBlueClass}`}
              style={glowBlueStyle}
            >
              {index}.
            </span>
          ) : (
            <span
              className="mt-[0.62rem] h-[5px] w-[5px] shrink-0 rounded-full bg-black/75 dark:bg-[#eceae4]/90"
              aria-hidden
            />
          )}
          <span className={`flex-1 ${bodyClass}`}>{children}</span>
        </li>
      )
    },
    strong: ({ children }: { children?: ReactNode }) => (
      <strong
        className={glowBlueClass}
        style={{ ...glowBlueStyle, fontFamily: serif }}
      >
        {children}
      </strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em
        className="italic text-black/80 dark:text-[#d8d6d0]"
        style={{ fontFamily: serif }}
      >
        {children}
      </em>
    ),
    a: ({ children, href }: { children?: ReactNode; href?: string }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#005DFF] underline decoration-[#005DFF]/40 underline-offset-[3px] transition-colors hover:text-[#0048CC] hover:decoration-[#005DFF] dark:text-[#5b9fff] dark:hover:text-[#7eb3ff]"
        style={{ fontFamily: serif }}
      >
        {children}
      </a>
    ),
    code: ({
      children,
      className,
    }: {
      children?: ReactNode
      className?: string
    }) => {
      const inline = !className
      const text = Array.isArray(children)
        ? children.map((c) => String(c ?? '')).join('')
        : String(children ?? '')
      return inline ? (
        <code
          className="rounded-md border border-gray-200/80 bg-gray-100/90 px-1.5 py-0.5 font-mono text-[15px] text-black/90 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100"
        >
          {text}
        </code>
      ) : (
        <code className={className}>{children}</code>
      )
    },
    pre: ({ children }: { children?: ReactNode }) => (
      <pre className="mb-5 overflow-x-auto rounded-xl border border-gray-200/80 bg-gray-50/90 p-4 text-[15px] dark:border-gray-700 dark:bg-gray-900/80">
        {children}
      </pre>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote
        className="mb-5 border-l-[3px] border-[#005DFF]/35 py-1 pl-4 italic text-black/75 dark:border-[#005DFF]/50 dark:text-[#d0cec8]"
        style={{ fontFamily: serif }}
      >
        {children}
      </blockquote>
    ),
  }

  return (
    <div className="w-full">
      <div className="max-w-none" style={{ fontFamily: serif }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {visible}
        </ReactMarkdown>
      </div>

      {showActions && (
        <div
          className="mt-3 flex items-center gap-0.5"
          style={{ fontFamily: sans }}
        >
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onLike}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Helpful"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDislike}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Not helpful"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onShare}
            className="ml-1 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Share"
          >
            <Share className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
