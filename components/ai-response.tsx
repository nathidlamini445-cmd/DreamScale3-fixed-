import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, ThumbsUp, ThumbsDown, Share } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface AIResponseProps {
  content: string
  onCopy?: () => void
  onLike?: () => void
  onDislike?: () => void
  onShare?: () => void
}

export function AIResponse({ content, onCopy, onLike, onDislike, onShare }: AIResponseProps) {
  // Custom components for markdown rendering - Minimalistic style
  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-3 mt-5">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-2 mb-4">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-2 mb-4 pl-4">
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => {
      // Check if this is an ordered list item
      const isOrderedList = props.node?.parent?.tagName === 'ol'
      
      if (isOrderedList) {
        return (
          <li className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
            <span className="text-gray-400 dark:text-gray-500 mt-0.5">{props.node?.index + 1}.</span>
            <span className="flex-1 leading-relaxed">{children}</span>
          </li>
        )
      }
      
      // For unordered lists
      return (
        <li className="flex items-start gap-3 text-base font-medium text-gray-600 dark:text-gray-400">
          <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">{children}</span>
        </li>
      )
    },
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic font-medium text-gray-500 dark:text-gray-400">
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
        <code className="bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200/60 dark:border-gray-800/60">
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
        <pre className="text-gray-700 dark:text-gray-300 text-sm">
          {children}
        </pre>
      </div>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 text-base font-medium text-gray-500 dark:text-gray-400 italic">
        {children}
      </blockquote>
    ),
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
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
      <th className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-left text-base font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200/60 dark:border-gray-800/60">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200/60 dark:border-gray-800/60">
        {children}
      </td>
    ),
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] overflow-hidden">
      {/* Content */}
      <div className="p-6">
        <div className="prose prose-base max-w-none">
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
