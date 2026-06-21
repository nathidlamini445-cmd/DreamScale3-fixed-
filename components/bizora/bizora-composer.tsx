'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BizoraComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  className?: string
}

export function BizoraComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = 'Reply to Bizora…',
  className,
}: BizoraComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [value, resizeTextarea])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const voiceAvailable =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startVoice = useCallback(() => {
    if (disabled || loading || !voiceAvailable) return

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) return

    stopVoice()
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (transcript.trim()) {
        onChange(value ? `${value.trimEnd()} ${transcript.trim()}` : transcript.trim())
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }, [disabled, loading, onChange, stopVoice, value, voiceAvailable])

  const handleSubmit = () => {
    if (disabled || loading || !value.trim()) return
    onSubmit()
  }

  return (
    <div className={cn('mx-auto w-full max-w-3xl', className)}>
      <div
        className={cn(
          'relative flex flex-col gap-2 rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition-shadow dark:bg-gray-800/95',
          isListening
            ? 'border-[#39d2c0]/50 ring-2 ring-[#39d2c0]/20'
            : 'border-gray-200 dark:border-gray-600'
        )}
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => (isListening ? stopVoice() : startVoice())}
            disabled={disabled || loading || !voiceAvailable}
            aria-pressed={isListening}
            title={
              !voiceAvailable
                ? 'Voice input is not available in this browser'
                : isListening
                  ? 'Stop voice input'
                  : 'Voice input'
            }
            className={cn(
              'mb-1 shrink-0 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              isListening
                ? 'bg-[#39d2c0]/10 text-[#39d2c0]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200'
            )}
          >
            {isListening ? (
              <Square className="h-4 w-4 fill-current" aria-hidden />
            ) : (
              <Mic className="h-4 w-4" aria-hidden />
            )}
          </button>

          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            disabled={disabled || loading}
            rows={1}
            className="max-h-80 min-h-[44px] flex-1 resize-none border-0 bg-transparent py-2 text-[17px] leading-relaxed text-black outline-none ring-0 focus:ring-0 dark:text-white"
          />

          <div className="mb-1 flex shrink-0 items-center gap-1">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || loading || !value.trim()}
              size="sm"
              className="h-9 w-9 rounded-xl bg-gray-800 p-0 text-white hover:bg-gray-700 disabled:opacity-40 dark:bg-gray-600 dark:hover:bg-gray-500"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
        Bizora can make mistakes — verify important business decisions.
      </p>
    </div>
  )
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
