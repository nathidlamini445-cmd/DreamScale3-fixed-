'use client'

import type { CSSProperties, ReactNode } from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, ThumbsUp, ThumbsDown, Share, MessageSquare } from 'lucide-react'

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
  onAskAboutSelection?: (text: string) => void
}

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
    <ol className="mb-5 list-none space-y-3 pl-0">{children}</ol>
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

    if (isOrdered) {
      return (
        <li
          className={`relative mb-3 pl-7 ${bodyClass} [&>p]:mb-0`}
          style={{ fontFamily: serif }}
        >
          <span
            className={`pointer-events-none absolute left-0 top-[0.15rem] select-none text-[17px] tabular-nums ${glowBlueClass}`}
            style={glowBlueStyle}
            aria-hidden
          >
            {index}.
          </span>
          {children}
        </li>
      )
    }

    return (
      <li
        className={`relative mb-3 pl-5 ${bodyClass} [&>p]:mb-0`}
        style={{ fontFamily: serif }}
      >
        <span
          className="pointer-events-none absolute left-1 top-[0.72rem] h-[5px] w-[5px] select-none rounded-full bg-black/75 dark:bg-[#eceae4]/90"
          aria-hidden
        />
        {children}
      </li>
    )
  },
  strong: ({ children }: { children?: ReactNode }) => (
    <strong
      className={`${glowBlueClass} font-semibold`}
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
      <code className="rounded-md border border-gray-200/80 bg-gray-100/90 px-1.5 py-0.5 font-mono text-[15px] text-black/90 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100">
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

const MessageMarkdown = memo(function MessageMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  )
})

export function StreamingAIMessage({
  fullText,
  animate = false,
  onStreamComplete,
  onRevealProgress,
  onCopy,
  onLike,
  onDislike,
  onShare,
  onAskAboutSelection,
}: Props) {
  const [visible, setVisible] = useState(() => (animate ? '' : fullText))
  const [isStreaming, setIsStreaming] = useState(animate)
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const content = contentRef.current
    if (!onAskAboutSelection || isStreaming || !content) return

    const readSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      const range = selection.getRangeAt(0)
      const selected = selection.toString().trim()
      if (!selected) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      const ancestor =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentNode
          : range.commonAncestorContainer

      if (!ancestor || !content.contains(ancestor)) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      setSelectedText(selected)
      const rect = range.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const buttonWidth = 130
      const left = Math.max(
        buttonWidth / 2,
        Math.min(
          rect.left - containerRect.left + rect.width / 2,
          containerRect.width - buttonWidth / 2
        )
      )
      setSelectionPosition({
        top: rect.top - containerRect.top + rect.height + 8,
        left,
      })
    }

    const handleMouseUp = () => {
      requestAnimationFrame(readSelection)
    }

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        (target as HTMLElement).closest?.('[data-ask-about-selection]') ||
        content.contains(target)
      ) {
        return
      }
      setSelectedText('')
      setSelectionPosition(null)
    }

    content.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => {
      content.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [onAskAboutSelection, isStreaming])

  const handleAskAbout = () => {
    if (!selectedText || !onAskAboutSelection) return
    onAskAboutSelection(selectedText)
    window.getSelection()?.removeAllRanges()
    setSelectedText('')
    setSelectionPosition(null)
  }

  const showActions = !isStreaming

  return (
    <div ref={containerRef} className="relative w-full">
      {selectedText && selectionPosition && onAskAboutSelection && (
        <button
          type="button"
          data-ask-about-selection
          onClick={handleAskAbout}
          className="absolute z-50 flex select-none items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          style={{
            top: `${selectionPosition.top}px`,
            left: `${selectionPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ask about this
        </button>
      )}

      <div
        ref={contentRef}
        className="max-w-none select-text"
        style={{ fontFamily: serif }}
      >
        <MessageMarkdown text={visible} />
      </div>

      {showActions && (
        <div
          className="mt-3 flex select-none items-center gap-0.5"
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
