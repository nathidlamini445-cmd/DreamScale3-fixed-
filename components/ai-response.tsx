import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, ThumbsUp, ThumbsDown, Share, MessageSquare } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface AIResponseProps {
  content: string
  onCopy?: () => void
  onLike?: () => void
  onDislike?: () => void
  onShare?: () => void
  onAddToPrompt?: (text: string) => void
}

export function AIResponse({ content, onCopy, onLike, onDislike, onShare, onAddToPrompt }: AIResponseProps) {
  const [selectedText, setSelectedText] = useState<string>('')
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle text selection
  useEffect(() => {
    if (!containerRef.current) return

    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || !containerRef.current) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      const range = selection.getRangeAt(0)
      const selectedTextContent = range.toString().trim()

      // Only show button if selection is within this component and has text
      if (!selectedTextContent || selectedTextContent.length === 0) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      // Check if the selection is actually within this component
      const containerNode = containerRef.current
      
      // Get the common ancestor of the selection
      const commonAncestor = range.commonAncestorContainer
      const ancestorNode = commonAncestor.nodeType === Node.TEXT_NODE 
        ? commonAncestor.parentNode 
        : commonAncestor
      
      // Only proceed if the selection is within this component
      if (!ancestorNode || !containerNode.contains(ancestorNode)) {
        setSelectedText('')
        setSelectionPosition(null)
        return
      }

      // Only proceed if we have valid selected text within this component
      setSelectedText(selectedTextContent)
      
      // Get position for floating button
      const rect = range.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      
      // Position button below selection, centered horizontally
      // Ensure it doesn't go off-screen
      const buttonWidth = 140 // Approximate button width
      const leftPosition = Math.max(
        buttonWidth / 2,
        Math.min(
          rect.left - containerRect.left + (rect.width / 2),
          containerRect.width - (buttonWidth / 2)
        )
      )
      
      setSelectionPosition({
        top: rect.top - containerRect.top + rect.height + 8,
        left: leftPosition
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Only handle if the mouseup is within this component
      const target = e.target as Node
      if (containerRef.current?.contains(target)) {
        // Small delay to ensure selection is complete
        setTimeout(() => {
          handleSelection()
        }, 50)
      } else {
        // Clear selection if mouseup is outside
        setSelectedText('')
        setSelectionPosition(null)
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Hide button if clicking outside the component or on the button itself
      const target = e.target as Node
      if (!containerRef.current?.contains(target)) {
        setSelectedText('')
        setSelectionPosition(null)
      }
    }

    // Only listen to mouseup, not selectionchange (which fires too often)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClick, true) // Use capture phase

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  const handleAddToPrompt = () => {
    if (selectedText && onAddToPrompt) {
      onAddToPrompt(selectedText)
      // Clear selection
      window.getSelection()?.removeAllRanges()
      setSelectedText('')
      setSelectionPosition(null)
    }
  }

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
        // Clear selection after copying
        window.getSelection()?.removeAllRanges()
        setSelectedText('')
        setSelectionPosition(null)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }
  // Custom components for markdown rendering - Minimalistic style
  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-5xl font-medium text-black dark:text-white mb-5 mt-7" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)' }}>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-4xl font-medium text-black dark:text-white mb-4 mt-6" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)' }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-3xl font-medium text-black dark:text-gray-200 mb-3 mt-5" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)' }}>
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-xl font-medium text-black dark:text-gray-200 mb-5 leading-relaxed" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-3 mb-5 pl-1">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-3 mb-5 pl-6">
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => {
      // Check if this is an ordered list item
      const isOrderedList = props.node?.parent?.tagName === 'ol'
      
      if (isOrderedList) {
        return (
            <li className="flex items-start gap-4 text-xl font-medium text-black dark:text-gray-200" style={{ fontFamily: '"Libre Baskerville", serif' }}>
            <span className="text-black dark:text-gray-300 mt-0.5 font-semibold text-2xl" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>{props.node?.index + 1}.</span>
            <span className="flex-1 leading-relaxed" style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>{children}</span>
          </li>
        )
      }
      
      // For unordered lists - make bullet points more prominent with gradient animation
      return (
            <li className="flex items-start gap-4 text-xl font-medium text-black dark:text-gray-200" style={{ fontFamily: '"Libre Baskerville", serif' }}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 dark:from-[#005DFF] dark:to-[#39d2c0] mt-1 text-2xl font-bold leading-none relative inline-block overflow-hidden animate-pulse" style={{ textShadow: '0 1px 2px rgba(0, 93, 255, 0.3), 0 2px 4px rgba(0, 93, 255, 0.2)' }}>
            <span className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white dark:via-cyan-200 to-transparent opacity-70 dark:opacity-90 animate-text-shimmer-sweep"></span>
            </span>
            •
          </span>
          <span className="flex-1 leading-relaxed" style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>{children}</span>
        </li>
      )
    },
    strong: ({ children }: any) => (
      <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#005DFF] to-cyan-300 dark:from-[#005DFF] dark:to-[#39d2c0] relative inline-block overflow-hidden animate-pulse" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 1px rgba(0, 93, 255, 0.15)' }}>
        <span className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white dark:via-cyan-200 to-transparent opacity-70 dark:opacity-90 animate-text-shimmer-sweep"></span>
        </span>
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic font-medium text-black dark:text-gray-300" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>
        {children}
      </em>
    ),
    code: ({ children, className }: any) => {
      const isInline = !className
      // For code blocks, ensure children is a string
      const codeContent = Array.isArray(children) 
        ? children.map((c: any) => String(c ?? '')).join('')
        : String(children ?? '')
      return isInline ? (
        <code className="bg-gray-100 dark:bg-gray-800/50 text-black dark:text-gray-200 px-1.5 py-0.5 rounded text-base font-mono border border-gray-200/60 dark:border-gray-800/60">
          {codeContent}
        </code>
      ) : (
        <code className={className}>
          {codeContent}
        </code>
      )
    },
    pre: ({ children }: any) => (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 mb-4 overflow-x-auto border border-gray-200/60 dark:border-gray-800/60">
        <pre className="text-black dark:text-gray-200 text-base">
          {children}
        </pre>
      </div>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-5 py-3 mb-5 text-xl font-medium text-black dark:text-gray-300 italic" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
        {children}
      </blockquote>
    ),
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-black dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-200/60 dark:border-gray-800/60 rounded-md">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 text-left text-xl font-medium text-black dark:text-gray-200 border-b border-gray-200/60 dark:border-gray-800/60" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 2px rgba(0, 0, 0, 0.06)' }}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-5 py-3 text-xl font-medium text-black dark:text-gray-300 border-b border-gray-200/60 dark:border-gray-800/60" style={{ fontFamily: '"Libre Baskerville", serif', textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>
        {children}
      </td>
    ),
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] overflow-hidden relative"
      style={{
        // Force DreamScale blue selection color
        ['--selection-color' as string]: '#005DFF',
      }}
    >
      {/* Floating "Add to prompt" and "Copy" buttons */}
      {selectedText && selectionPosition && (
        <div 
          className="absolute z-50 flex flex-col gap-2"
          style={{
            top: `${selectionPosition.top}px`,
            left: `${selectionPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {onAddToPrompt && (
            <button
              onClick={handleAddToPrompt}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#39d2c0] hover:bg-[#2bb3a3] text-white text-sm font-medium rounded-md shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Add to prompt
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {typeof content === 'string' ? content : String(content || '')}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action buttons - Minimalistic */}
      <div className="px-6 py-3 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between bg-white dark:bg-slate-950">
        <div className="flex items-center gap-1">
          <button 
            onClick={onCopy}
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded transition-colors group"
            title="Copy response"
          >
            <Copy className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
          <button 
            onClick={onLike}
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded transition-colors group"
            title="Like this response"
          >
            <ThumbsUp className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
          <button 
            onClick={onDislike}
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded transition-colors group"
            title="Dislike this response"
          >
            <ThumbsDown className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </div>
        <button 
          onClick={onShare}
          className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded transition-colors group"
          title="Share response"
        >
          <Share className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </button>
      </div>
    </div>
  )
}
