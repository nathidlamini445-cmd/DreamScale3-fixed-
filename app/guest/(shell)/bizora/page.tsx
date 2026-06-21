'use client'

import { useState } from 'react'
import { Atom } from 'lucide-react'
import { BizoraComposer } from '@/components/bizora/bizora-composer'
import { useGuestWorkspace } from '@/lib/workspace/guest-context'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function GuestBizoraPage() {
  const { session, role } = useGuestWorkspace()
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const isViewer = role === 'viewer'

  const handleAsk = async () => {
    const text = prompt.trim()
    if (!text || isViewer || loading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('/api/guest/bizora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          workspaceName: session?.workspaceName,
          displayName: session?.displayName,
        }),
      })
      const data = await res.json()
      const reply =
        typeof data.reply === 'string' ? data.reply : 'Could not get a response right now.'
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Connection failed. Make sure the dev server is running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Atom className="w-6 h-6 text-[#005DFF]" />
          Bizora AI
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Workspace assistant for {session?.workspaceName}
        </p>
      </div>

      {isViewer ? (
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 p-5 text-sm text-gray-600 dark:text-slate-300">
          Your role is <strong>Viewer</strong> — you can browse the workspace but cannot run Bizora
          chats. Ask the workspace owner to change your role to Member or Admin if you need AI
          access.
        </div>
      ) : (
        <div className="flex min-h-[420px] flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 px-6 py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
                Ask Bizora anything about {session?.workspaceName}. Use the mic or type below —
                same assistant as the full DreamScale experience.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#005DFF] px-4 py-3 text-sm text-white'
                      : 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap'
                  }
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}

          <BizoraComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => void handleAsk()}
            loading={loading}
            placeholder={`Ask Bizora about ${session?.workspaceName}…`}
            className="mt-auto"
          />
        </div>
      )}
    </div>
  )
}
