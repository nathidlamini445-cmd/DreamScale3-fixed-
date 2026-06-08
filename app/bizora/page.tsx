"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { useSessionSafe } from "@/lib/session-context"
import { useUser } from "@clerk/nextjs"
import { useBizoraLoading } from "@/lib/bizora-loading-context"
import * as supabaseData from "@/lib/supabase-data"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { StreamingAIMessage } from "@/components/bizora/streaming-ai-message"
import { Source_Serif_4 } from "next/font/google"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Send, 
  Plus, 
  MessageCircle, 
  Clock, 
  Brain,
  Image as ImageIcon,
  RefreshCw,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Link as LinkIcon,
  FileText,
  X,
  Share,
  Search,
  Sparkles,
  Globe,
  Square,
  Trash2,
  Menu,
  Home,
  MessageSquare,
  Mic,
  ChevronDown
} from "lucide-react"
import { ThinkingAnimation } from "@/components/thinking-animation"
import { ResearchThinking } from "@/components/research-thinking"
import { ShareModal } from "@/components/share-modal"
import { VoiceWaveform } from "@/components/bizora/voice-waveform"
import { ChatQuotaBanner } from "@/components/bizora/chat-quota-banner"
import { ChatLimitReached } from "@/components/bizora/chat-limit-reached"
import { ComposerAttachMenu } from "@/components/bizora/composer-attach-menu"
import {
  playVoiceStartSound,
  playVoiceStopSound,
} from "@/lib/bizora/voice-feedback-sounds"
import {
  isCoachingStyleId,
  type CoachingStyleId,
} from "@/lib/bizora/coaching-styles"
import { chatLimitPlaceholder } from "@/lib/usage-quota/format-chat-resume"
import { useUsageQuota } from "@/hooks/use-usage-quota"
import {
  parseQuotaError,
  QuotaExceededError,
  isQuotaMessage,
} from "@/lib/usage-quota/client-errors"

// Utility to check if two conversations are the same (by content, not just ID)
function areConversationsSame(conv1: any, conv2: any): boolean {
  // Match by ID first (fastest)
  if (conv1.id === conv2.id) return true
  
  // Match by title and first message content (handles UUID vs Date.now() ID mismatch)
  const titleMatch = conv1.title === conv2.title
  const firstMsg1 = conv1.messages?.[0]?.content || ''
  const firstMsg2 = conv2.messages?.[0]?.content || ''
  const messageMatch = firstMsg1 === firstMsg2 && firstMsg1.length > 0
  
  return titleMatch && messageMatch
}

// Utility to merge conversations uniquely by id AND content (prevents duplicates)
function mergeConversations(
  existing: { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }[],
  incoming: { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }[],
) {
  const merged: { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }[] = []
  const seen = new Set<string>() // Track IDs we've already added
  const seenByContent = new Map<string, string>() // Track content signatures to detect duplicates with different IDs
  
  // Helper to create a content signature for duplicate detection
  const getContentSignature = (conv: any) => {
    const firstMsg = conv.messages?.[0]?.content || ''
    return `${conv.title || ''}::${firstMsg.substring(0, 50)}`
  }
  
  // First, add all existing conversations
  for (const conv of existing) {
    const sig = getContentSignature(conv)
    if (!seen.has(conv.id) && !seenByContent.has(sig)) {
      merged.push(conv)
      seen.add(conv.id)
      seenByContent.set(sig, conv.id)
    }
  }
  
  // Then, add incoming conversations (skip if duplicate by ID or content)
  for (const conv of incoming) {
    const sig = getContentSignature(conv)
    const existingId = seenByContent.get(sig)
    
    // Skip if we've already seen this ID
    if (seen.has(conv.id)) {
      // Update if this version has more messages
      const existingIndex = merged.findIndex(c => c.id === conv.id)
      if (existingIndex >= 0) {
        const existing = merged[existingIndex]
        if ((conv.messages?.length || 0) > (existing.messages?.length || 0)) {
          merged[existingIndex] = conv
        }
      }
      continue
    }
    
    // Skip if we've seen this content with a different ID (duplicate)
    if (existingId && existingId !== conv.id) {
      console.log('🔄 Skipping duplicate conversation by content:', conv.title)
      continue
    }
    
    // Add new conversation
    merged.push(conv)
    seen.add(conv.id)
    seenByContent.set(sig, conv.id)
  }
  
  return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/* ------------------------------------------------------------------ *
 *  Web Speech API typings + lookup                                   *
 *  Chrome/Edge expose `webkitSpeechRecognition`; Safari iOS exposes  *
 *  `SpeechRecognition`.  We narrow only the bits we use.             *
 * ------------------------------------------------------------------ */
interface SpeechRecognitionAlternativeLike { transcript: string; confidence: number }
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: SpeechRecognitionAlternativeLike
}
interface SpeechRecognitionResultListLike {
  readonly length: number
  [index: number]: SpeechRecognitionResultLike
}
interface SpeechRecognitionEventLike {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultListLike
}
interface SpeechRecognitionErrorEventLike {
  readonly error: string
  readonly message?: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: ((this: SpeechRecognitionLike) => void) | null
  onend: ((this: SpeechRecognitionLike) => void) | null
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function isVoiceInputSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

// #region agent log
if (typeof window !== "undefined") {
  const __buildStamp = "bizora-debug-build-3"
  // visible in the browser DevTools Console, regardless of fetch success
  // eslint-disable-next-line no-console
  console.log(`[${__buildStamp}] bizora client module loaded`)
  fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'BUILD',location:'app/bizora/page.tsx:module-load',message:'bizora client module loaded in browser',data:{buildStamp:__buildStamp,href:typeof location!=='undefined'?location.href:'',ua:navigator.userAgent.slice(0,200)},timestamp:Date.now()})}).catch(()=>{});
}
// #endregion

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  attachments?: Attachment[]
}

/** Loaded history must never replay the typing animation. */
function deserializeMessage(msg: any): Message {
  const { animateReveal: _drop, ...rest } = msg ?? {}
  return {
    ...rest,
    timestamp:
      typeof rest.timestamp === 'string'
        ? new Date(rest.timestamp)
        : rest.timestamp,
  }
}

const bizoraSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
})

interface Attachment {
  id: string
  name: string
  type: 'file' | 'link'
  url?: string
  file?: File
  content?: string
  processed?: boolean
  isImage?: boolean
  isPdf?: boolean
  imageData?: string
}

export default function BizoraAIPage() {
  const sessionContext = useSessionSafe()
  const { user: authUser } = useUser()
  const { setOpeningBizora } = useBizoraLoading()
  const {
    usage: usageQuota,
    storeError: usageStoreError,
    refresh: refreshUsageQuota,
  } = useUsageQuota(1000)
  const chatInCooldown =
    usageQuota != null &&
    !usageQuota.isPro &&
    usageQuota.chat.inCooldown
  const chatAtLimit =
    usageQuota != null &&
    !usageQuota.isPro &&
    !usageQuota.chat.inCooldown &&
    usageQuota.chat.messagesUsed >= usageQuota.chat.messagesLimit
  const chatLimitActive = chatInCooldown || chatAtLimit
  const chatCooldownUntil = usageQuota?.chat.cooldownUntil ?? null
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentMessage, setCurrentMessage] = useState("")
  const [replyQuote, setReplyQuote] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  /** Only the latest incoming AI reply plays the typing animation once. */
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  )
  const [isThinking, setIsThinking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<{id: string, title: string, lastMessage: string, timestamp: Date, messages: Message[]}[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [shareModal, setShareModal] = useState<{isOpen: boolean, messageContent: string, conversationTitle?: string}>({
    isOpen: false,
    messageContent: "",
    conversationTitle: undefined
  })
  const [isComplexThinking, setIsComplexThinking] = useState(false)
  const [currentResearchTopic, setCurrentResearchTopic] = useState("")
  const [isDeepResearch, setIsDeepResearch] = useState(false)
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyleId>('balanced')
  const [showGlowEffect, setShowGlowEffect] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const hasLoadedRef = useRef(false) // Track if we've loaded initial data
  const isSavingRef = useRef(false) // Prevent saving during initial load
  const previousConversationsRef = useRef<string>('') // Track previous conversations JSON to detect changes
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null) // Ref for auto-scrolling to bottom
  const messagesStartRef = useRef<HTMLDivElement>(null) // Ref for auto-scrolling to top
  const lastAIRef = useRef<HTMLDivElement>(null) // Ref for the most recent AI response
  const taskPromptProcessedRef = useRef(false) // Track if we've processed task prompt from URL
  const textareaRef = useRef<HTMLTextAreaElement>(null) // Ref for auto-expanding textarea
  const focusComposerRef = useRef(false)
  /** UI only — like a hamburger menu: stays open until the user closes it; not tied to Speech API lifecycle. */
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false)
  /** Shown inside the voice bar if getUserMedia was denied (no blocking alert). */
  const [micPermissionHint, setMicPermissionHint] = useState<string | null>(null)
  const [voiceInputAvailable, setVoiceInputAvailable] = useState(false)
  /** True once SpeechRecognition has actually fired `onstart`. */
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  /** Mirrors `isListening` synchronously so callbacks don't see stale state. */
  const isListeningRef = useRef(false)
  /** Final-only transcript accumulated across the session (never includes interim). */
  const finalTranscriptRef = useRef("")
  /** Text already in the textarea when listening started; we append the transcript to this. */
  const voicePrefixRef = useRef("")
  /** True while the user wants the voice bar open (until Stop). Never cleared by onend/onerror — only by user. */
  const voiceUserKeepsPanelOpenRef = useRef(false)
  const [waveLevels, setWaveLevels] = useState<number[]>(() => [0, 0, 0, 0, 0])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const voiceRafRef = useRef<number | null>(null)
  const speechImpulseRef = useRef(0)
  const lastSentMessageRef = useRef<string>("") // Store the last sent message to restore on stop
  const previousIsThinkingRef = useRef<boolean>(false) // Track previous thinking state
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Store timeout to cancel on stop
  const lastUserMessageIdRef = useRef<string | null>(null) // Store user message ID to remove on stop
  const isLoadingConversationRef = useRef<boolean>(false) // Track when loading a conversation (to scroll to bottom)
  
  // Helper to get email-keyed storage key for conversations
  const getConversationsKey = (email: string | null): string => {
    if (!email) return 'bizora:conversations' // Legacy fallback
    return `bizora:conversations_${email.toLowerCase().trim()}`
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('bizora_coaching_style')
    if (saved && isCoachingStyleId(saved)) setCoachingStyle(saved)
    const webSearch = localStorage.getItem('bizora_web_search')
    if (webSearch === 'true') setIsDeepResearch(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('bizora_coaching_style', coachingStyle)
  }, [coachingStyle])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('bizora_web_search', String(isDeepResearch))
  }, [isDeepResearch])

  // Ultra-fast synchronous resize for instant typing
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Synchronous resize - no delays for instant typing
      textarea.style.height = '0px' // Reset first for accurate measurement
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 384 // max-h-96 = 384px (24rem)
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [])

  const handleAskAboutSelection = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setReplyQuote(trimmed)
    focusComposerRef.current = true
  }, [])

  useLayoutEffect(() => {
    if (!focusComposerRef.current) return
    focusComposerRef.current = false
    textareaRef.current?.focus()
  }, [replyQuote])

  useEffect(() => {
    setVoiceInputAvailable(isVoiceInputSupported())
  }, [])

  const cancelVoiceRaf = useCallback(() => {
    if (voiceRafRef.current != null) {
      cancelAnimationFrame(voiceRafRef.current)
      voiceRafRef.current = null
    }
  }, [])

  /** Stops recognition + visualizer + mic stream. Does not hide the panel. */
  const teardownVoiceEngineOnly = useCallback(() => {
    cancelVoiceRaf()
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.onstart = null
        rec.onend = null
        rec.onerror = null
        rec.onresult = null
        try { rec.abort() } catch { /* ignore */ }
      } catch { /* ignore */ }
    }
    recognitionRef.current = null
    isListeningRef.current = false
    setIsListening(false)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    speechImpulseRef.current = 0
    setWaveLevels([0, 0, 0, 0, 0])
  }, [cancelVoiceRaf])

  const closeVoicePanelForUser = useCallback(() => {
    voiceUserKeepsPanelOpenRef.current = false
    setIsVoicePanelOpen(false)
    setMicPermissionHint(null)
    teardownVoiceEngineOnly()
  }, [teardownVoiceEngineOnly])

  useEffect(() => {
    return () => {
      try {
        const rec = recognitionRef.current
        if (rec) {
          rec.onstart = null
          rec.onend = null
          rec.onerror = null
          rec.onresult = null
          try { rec.abort() } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
      try {
        mediaStreamRef.current?.getTracks().forEach(t => t.stop())
      } catch { /* ignore */ }
      if (voiceRafRef.current != null) {
        cancelAnimationFrame(voiceRafRef.current)
        voiceRafRef.current = null
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  const applyRecordingHeartbeat = useCallback(() => {
    speechImpulseRef.current = Math.min(1, speechImpulseRef.current + 0.45)
    queueMicrotask(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.style.height = "auto"
        ta.style.height = `${Math.min(ta.scrollHeight, 384)}px`
      }
    })
  }, [])

  const startFakeWaveformLoop = useCallback(() => {
    const step = () => {
      if (!voiceUserKeepsPanelOpenRef.current) {
        return
      }
      if (!analyserRef.current && !recognitionRef.current) {
        return
      }
      speechImpulseRef.current = Math.max(0, speechImpulseRef.current * 0.91)
      const t = performance.now() * 0.01
      const imp = speechImpulseRef.current
      const next = [0, 1, 2, 3, 4].map((i) => {
        const wobble = 0.5 + 0.5 * Math.sin(t * 0.6 + i * 0.9)
        const level = 0.15 + 0.85 * wobble * (0.2 + 0.8 * Math.min(1, imp + 0.08 * Math.random()))
        return Math.min(1, level)
      })
      setWaveLevels(next)
      voiceRafRef.current = requestAnimationFrame(step)
    }
    voiceRafRef.current = requestAnimationFrame(step)
  }, [])

  const getMicErrorHint = useCallback((e: unknown): string => {
    const msg = e instanceof Error ? e.message : String(e)
    const name = e instanceof DOMException ? e.name : (e as { name?: string })?.name ?? ""
    const tag = name ? ` [${name}]` : ""
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return `No microphone is available to this page${tag}. Open Windows → Settings → System → Sound → Input, pick a working mic, and close any app holding the device.`
    }
    if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
      return `The microphone is busy or already in use${tag}. Close other apps (Zoom, Teams, OBS, Discord, etc.) that may hold the mic, then click Retry microphone.`
    }
    if (
      name === "NotAllowedError" ||
      name === "SecurityError" ||
      msg.toLowerCase().includes("denied") ||
      msg.includes("Permission")
    ) {
      return `Microphone is denied${tag}. Check ALL of these in order — fix one then click Retry: 1) Windows: Settings → Privacy & security → Microphone → turn ON "Microphone access" AND "Let desktop apps access your microphone" (Chrome counts as a desktop app). 2) Chrome: paste chrome://settings/content/microphone in the URL bar → make sure "http://localhost:3000" is NOT in the Block list, and the default is "Sites can ask". 3) Reload this page (Ctrl+Shift+R) so a fresh prompt appears.`
    }
    return `Could not use the microphone${tag}: ${msg || "unknown error"}`
  }, [])

  const releaseMediaCaptureOnly = useCallback(() => {
    cancelVoiceRaf()
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    setWaveLevels([0, 0, 0, 0, 0])
  }, [cancelVoiceRaf])

  const startRealWaveformLoop = useCallback((analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount)
    const step = () => {
      if (!voiceUserKeepsPanelOpenRef.current) {
        return
      }
      if (!analyserRef.current) {
        return
      }
      analyser.getByteFrequencyData(data)
      const n = 5
      const slice = Math.max(1, Math.floor(data.length / n))
      const next = Array.from({ length: n }, (_, i) => {
        let s = 0
        for (let j = 0; j < slice; j++) s += data[i * slice + j] ?? 0
        return Math.min(1, (s / slice / 255) * 1.5)
      })
      setWaveLevels(next)
      voiceRafRef.current = requestAnimationFrame(step)
    }
    voiceRafRef.current = requestAnimationFrame(step)
  }, [])

  /** Retry button under the warning: fully tear down and restart the recognition flow. */
  const retryVoicePanelMicrophone = useCallback(() => {
    teardownVoiceEngineOnly()
    setMicPermissionHint(null)
    setIsListening(false)
    setIsVoicePanelOpen(false)
    voiceUserKeepsPanelOpenRef.current = false
    window.setTimeout(() => {
      startVoiceInputRef.current?.()
    }, 30)
  }, [teardownVoiceEngineOnly])

  // Indirection ref to call startVoiceInput from retry without circular dep in deps array.
  const startVoiceInputRef = useRef<(() => void) | null>(null)

  const stopVoiceInput = useCallback(() => {
    playVoiceStopSound()
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch (e) {
        console.warn("SpeechRecognition.stop failed:", e)
        closeVoicePanelForUser()
      }
      return
    }
    closeVoicePanelForUser()
  }, [closeVoicePanelForUser])

  /**
   * Voice input flow:
   *   1. getUserMedia({audio:true}) — warms up the mic and lifts the
   *      site permission from "prompt" to "granted".  Without this, Chrome
   *      can fire `not-allowed` on SpeechRecognition.start() even when the
   *      site is set to Allow.
   *   2. SpeechRecognition.start() — happens inside getUserMedia's .then(),
   *      which is still within the user-activation window.
   *   3. We reuse the stream for the live waveform visualizer.
   *
   * Internal: if recognition.start() succeeds but onerror immediately
   * fires `not-allowed` (a known Chrome edge case after a permission
   * change), we retry once after a short delay.
   */
  const startVoiceInput = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H6',location:'app/bizora/page.tsx:startVoiceInput-entry',message:'startVoiceInput entry',data:{isThinking,isVoicePanelOpen,ctorPresent:!!getSpeechRecognitionCtor(),ctorName:(getSpeechRecognitionCtor() as unknown as {name?:string})?.name||'unknown',userAgent:typeof navigator!=='undefined'?navigator.userAgent.slice(0,200):'',hasPermissionsApi:!!(navigator as Navigator & {permissions?:unknown}).permissions},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (isThinking || isVoicePanelOpen) return
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      if (typeof window !== "undefined") {
        window.alert("Voice input is not supported in this browser. Try Chrome, Edge, or Safari.")
      }
      return
    }

    playVoiceStartSound()
    voiceUserKeepsPanelOpenRef.current = true
    setIsVoicePanelOpen(true)
    setMicPermissionHint(null)
    setIsListening(false)
    voicePrefixRef.current = currentMessage
    finalTranscriptRef.current = ""
    speechImpulseRef.current = 0.25

    let didRetryAfterNotAllowed = false

    const wireRecognitionHandlers = (rec: SpeechRecognitionLike, onNotAllowedFirstFail: () => void) => {
      rec.onstart = () => {
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H3',location:'app/bizora/page.tsx:recognition-onstart',message:'recognition.onstart fired',data:{didRetry:didRetryAfterNotAllowed},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        isListeningRef.current = true
        setIsListening(true)
        setMicPermissionHint(null)
      }

      rec.onresult = (event) => {
        let interim = ""
        let newlyFinal = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ""
          if (result.isFinal) {
            newlyFinal += transcript
          } else {
            interim += transcript
          }
        }
        if (newlyFinal) {
          const prev = finalTranscriptRef.current
          const sep = prev && !/\s$/.test(prev) ? " " : ""
          finalTranscriptRef.current = `${prev}${sep}${newlyFinal.trim()}`
          speechImpulseRef.current = Math.min(1, speechImpulseRef.current + 0.5)
        } else if (interim) {
          speechImpulseRef.current = Math.min(1, speechImpulseRef.current + 0.25)
        }

        const prefix = voicePrefixRef.current
        const live = (finalTranscriptRef.current + (interim ? " " + interim : "")).trim()
        const sep = prefix && live && !/\s$/.test(prefix) ? " " : ""
        setCurrentMessage(`${prefix}${sep}${live}`)
        applyRecordingHeartbeat()
      }

      rec.onerror = (event) => {
        const err = event.error || "unknown"
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H3,H4,H6',location:'app/bizora/page.tsx:recognition-onerror',message:'recognition.onerror fired',data:{error:err,errMessage:event.message||'',didRetry:didRetryAfterNotAllowed,isListeningRef:isListeningRef.current,attemptNumber:didRetryAfterNotAllowed?2:1},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        console.warn("SpeechRecognition error:", err, event.message)

        // Chrome quirk: sometimes the FIRST attempt right after a permission
        // change fires not-allowed immediately. Retry once silently.
        if ((err === "not-allowed" || err === "service-not-allowed") && !didRetryAfterNotAllowed && isListeningRef.current === false) {
          didRetryAfterNotAllowed = true
          // #region agent log
          fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H4',location:'app/bizora/page.tsx:retry-triggered',message:'retry triggered after not-allowed',data:{},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          console.info("Retrying SpeechRecognition once after not-allowed…")
          onNotAllowedFirstFail()
          return
        }

        let msg = `Speech recognition error [${err}]. Click Retry microphone.`
        switch (err) {
          case "no-speech":
            msg = "We didn't hear any speech. Click Retry microphone and speak a bit louder or closer to the mic."
            break
          case "audio-capture":
            msg = "No microphone is available [audio-capture]. Pick an input device in Windows → Settings → System → Sound → Input, then click Retry microphone."
            break
          case "not-allowed":
          case "service-not-allowed":
            msg = "Microphone permission is blocked for this site [not-allowed]. Click the icon left of the URL → Site settings → Microphone → Allow, then reload this page (Ctrl+Shift+R)."
            break
          case "network":
            msg = "Speech recognition couldn't reach Google's servers [network]. Disable any VPN/strict firewall, check your internet, then click Retry microphone."
            break
          case "aborted":
            msg = ""
            break
        }
        if (msg) setMicPermissionHint(msg)
        isListeningRef.current = false
        setIsListening(false)
      }

      rec.onend = () => {
        isListeningRef.current = false
        setIsListening(false)
        cancelVoiceRaf()
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop())
          mediaStreamRef.current = null
        }
        if (audioContextRef.current) {
          void audioContextRef.current.close()
          audioContextRef.current = null
        }
        analyserRef.current = null
        recognitionRef.current = null

        const transcript = finalTranscriptRef.current.trim()
        if (transcript) {
          const prefix = voicePrefixRef.current
          const sep = prefix && !/\s$/.test(prefix) ? " " : ""
          setCurrentMessage(`${prefix}${sep}${transcript}`)
          queueMicrotask(() => {
            const ta = textareaRef.current
            if (ta) {
              ta.style.height = "auto"
              ta.style.height = `${Math.min(ta.scrollHeight, 384)}px`
              ta.focus()
            }
          })
          voiceUserKeepsPanelOpenRef.current = false
          setIsVoicePanelOpen(false)
          setMicPermissionHint(null)
        }
      }
    }

    const buildAndStartRecognition = () => {
      const recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      try {
        const lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US"
        recognition.lang = lang
      } catch { /* ignore */ }

      wireRecognitionHandlers(recognition, () => {
        // Retry path: build a brand new recognition object after a tiny delay.
        window.setTimeout(() => {
          if (!voiceUserKeepsPanelOpenRef.current) return
          buildAndStartRecognition()
        }, 200)
      })

      try {
        recognition.start()
        recognitionRef.current = recognition
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H2',location:'app/bizora/page.tsx:recognition-start-ok',message:'recognition.start() returned without throwing',data:{didRetry:didRetryAfterNotAllowed,lang:recognition.lang,continuous:recognition.continuous,interim:recognition.interimResults},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H2',location:'app/bizora/page.tsx:recognition-start-threw',message:'recognition.start() threw synchronously',data:{name:(e as {name?:string})?.name||'',errMessage:(e as {message?:string})?.message||'',toStr:String(e),didRetry:didRetryAfterNotAllowed},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        console.error("SpeechRecognition.start threw:", e)
        setMicPermissionHint(
          e instanceof Error
            ? `Speech recognition could not start: ${e.message}. Try reloading the page.`
            : "Speech recognition could not start. Try reloading the page."
        )
        teardownVoiceEngineOnly()
      }
    }

    /* ---- Step 1: warm up the mic.  This is critical — without an
       active getUserMedia grant on this page, Chrome can refuse
       SpeechRecognition with `not-allowed` even when the site is Allowed. */
    const __gumStartedAt = Date.now()

    // #region agent log
    void (async () => {
      try {
        const perms = (navigator as Navigator & { permissions?: { query: (q: { name: PermissionName }) => Promise<PermissionStatus> } }).permissions
        if (perms?.query) {
          const status = await perms.query({ name: "microphone" as PermissionName })
          fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H1',location:'app/bizora/page.tsx:permissions-state',message:'navigator.permissions microphone state',data:{state:status.state},timestamp:Date.now()})}).catch(()=>{})
        } else {
          fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H1',location:'app/bizora/page.tsx:permissions-state',message:'navigator.permissions unavailable',data:{},timestamp:Date.now()})}).catch(()=>{})
        }
      } catch (e) {
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H1',location:'app/bizora/page.tsx:permissions-state',message:'navigator.permissions query threw',data:{err:String(e)},timestamp:Date.now()})}).catch(()=>{})
      }
    })()
    // #endregion

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H1,H5',location:'app/bizora/page.tsx:getUserMedia-resolved',message:'getUserMedia resolved',data:{tookMs:Date.now()-__gumStartedAt,tracks:stream.getAudioTracks().map(t=>({label:t.label,readyState:t.readyState,enabled:t.enabled,muted:t.muted,kind:t.kind})),panelStillOpen:voiceUserKeepsPanelOpenRef.current},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (!voiceUserKeepsPanelOpenRef.current) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        mediaStreamRef.current = stream

        // Set up the visualizer with the stream we just got.
        try {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const ctx = new Ctx()
          audioContextRef.current = ctx
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 128
          analyser.smoothingTimeConstant = 0.4
          analyserRef.current = analyser
          const source = ctx.createMediaStreamSource(stream)
          source.connect(analyser)
          void ctx.resume().then(() => startRealWaveformLoop(analyser)).catch(() => startFakeWaveformLoop())
        } catch (e) {
          console.warn("Visualizer setup failed (recognition still works):", e)
          startFakeWaveformLoop()
        }

        // Step 2: start recognition (still within user-activation window).
        buildAndStartRecognition()
      })
      .catch(e => {
        // #region agent log
        fetch('http://127.0.0.1:7814/ingest/80efc676-913c-4ade-bee5-d24572e83533',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d25f6f'},body:JSON.stringify({sessionId:'d25f6f',runId:'run2',hypothesisId:'H1',location:'app/bizora/page.tsx:getUserMedia-rejected',message:'getUserMedia rejected',data:{name:(e as {name?:string})?.name||'',errMessage:(e as {message?:string})?.message||'',toStr:String(e),tookMs:Date.now()-__gumStartedAt},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        console.warn("getUserMedia failed:", e)
        setMicPermissionHint(getMicErrorHint(e))
        startFakeWaveformLoop()
      })
  }, [
    isThinking,
    isVoicePanelOpen,
    currentMessage,
    applyRecordingHeartbeat,
    cancelVoiceRaf,
    getMicErrorHint,
    startRealWaveformLoop,
    startFakeWaveformLoop,
    teardownVoiceEngineOnly,
  ])

  // Keep startVoiceInputRef pointing at the latest startVoiceInput so
  // retryVoicePanelMicrophone (defined before startVoiceInput) can invoke it.
  useEffect(() => {
    startVoiceInputRef.current = startVoiceInput
  }, [startVoiceInput])

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('bizora:sidebarCollapsed') : null
      if (saved !== null) {
        setIsSidebarCollapsed(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load sidebar state from localStorage', e)
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bizora:sidebarCollapsed', JSON.stringify(isSidebarCollapsed))
      }
    } catch (e) {
      console.warn('Failed to save sidebar state to localStorage', e)
    }
  }, [isSidebarCollapsed])

  // Hide loading overlay once page is ready (with very short minimum display time)
  useEffect(() => {
    // Very short minimum display time for instant feel - only 150ms
    const startTime = Date.now()
    const minDisplayTime = 150 // Minimum milliseconds to show loading screen (reduced for faster UX)
    
    const hideLoading = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      setTimeout(() => {
        setOpeningBizora(false)
      }, remainingTime)
    }
    
    // Hide loading immediately if page is already loaded
    if (hasLoadedRef.current) {
      setOpeningBizora(false)
    } else {
      hideLoading()
    }
  }, [setOpeningBizora])

  // Auto-scroll to top of most recent AI response when AI response is done (isThinking goes from true to false)
  // Auto-scroll to bottom when user sends a message or when a conversation is clicked
  useEffect(() => {
    // Check if thinking just finished (was true, now false)
    if (previousIsThinkingRef.current && !isThinking) {
      // AI response just finished - scroll to top of the most recent AI response
      const scrollTimeout = setTimeout(() => {
        // Try to scroll to the last AI response first, fallback to messagesStartRef if not available
        if (lastAIRef.current) {
          lastAIRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          messagesStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300) // Slightly longer delay to ensure DOM is fully updated with AI response
      previousIsThinkingRef.current = isThinking
      return () => clearTimeout(scrollTimeout)
    }
    
    // Update previous thinking state
    previousIsThinkingRef.current = isThinking
    
    // If thinking just started, scroll to bottom to show thinking indicator
    if (isThinking && !previousIsThinkingRef.current) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
      return () => clearTimeout(scrollTimeout)
    }
    
    // When messages change and we're loading a conversation (not in active chat), scroll to bottom
    // This ensures when clicking an old conversation, we see the latest messages
    if (!isThinking && messages.length > 0 && isLoadingConversationRef.current) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 150) // Slightly longer delay to ensure DOM is fully updated
      return () => clearTimeout(scrollTimeout)
    }
  }, [messages, isThinking])

  // Check for task query params and auto-populate message
  useEffect(() => {
    if (taskPromptProcessedRef.current) return // Only process once
    
    // Check for direct prompt parameter (from recommendations/roadmap)
    const promptParam = searchParams.get('prompt')
    if (promptParam) {
      try {
        const decodedPrompt = decodeURIComponent(promptParam)
        setCurrentMessage(decodedPrompt)
        taskPromptProcessedRef.current = true
        
        // Clean up URL params after processing
        const newUrl = window.location.pathname
        router.replace(newUrl, { scroll: false })
        return
      } catch (e) {
        console.warn('Failed to parse prompt from URL', e)
      }
    }
    
    // Check for task and instructions (from task detail page)
    const taskTitle = searchParams.get('task')
    const instructionsParam = searchParams.get('instructions')
    
    if (taskTitle && instructionsParam) {
      try {
        const instructions = JSON.parse(decodeURIComponent(instructionsParam))
        const instructionsText = Array.isArray(instructions) 
          ? instructions.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')
          : instructions
        
        // Create a comprehensive prompt for Bizora AI
        const prompt = `I need help completing this task from Venture Quest: "${taskTitle}"

Here are the step-by-step instructions I have:
${instructionsText}

Please provide personalized guidance on how to complete this task. Give me detailed, actionable steps tailored to my situation.`
        
        setCurrentMessage(prompt)
        taskPromptProcessedRef.current = true
        
        // Clean up URL params after processing
        const newUrl = window.location.pathname
        router.replace(newUrl, { scroll: false })
      } catch (e) {
        console.warn('Failed to parse task instructions from URL', e)
      }
    }
  }, [searchParams, router])

  // Load conversations from session
  useEffect(() => {
    const userEmail = sessionContext?.sessionData?.email || null
    
    // Reset loaded flag when email changes (to reload conversations for new user)
    // Only track email in localStorage for unauthenticated users
    if (userEmail && hasLoadedRef.current && !authUser?.id) {
      // Check if email changed - if so, reset and reload
      const lastEmail = localStorage.getItem('bizora_last_email')
      if (lastEmail && lastEmail !== userEmail) {
        console.log(`📧 Email changed from ${lastEmail} to ${userEmail} - reloading conversations`)
        // Don't clear conversations here - let the load logic handle it
        // This prevents accidental data loss
        hasLoadedRef.current = false
        previousConversationsRef.current = ''
        localStorage.setItem('bizora_last_email', userEmail)
      } else if (!lastEmail && userEmail) {
        // First time loading for this email
        localStorage.setItem('bizora_last_email', userEmail)
      }
    }
    
    // Skip if already loaded (unless email changed) - only check localStorage for unauthenticated users
    if (!authUser?.id && hasLoadedRef.current && userEmail === localStorage.getItem('bizora_last_email')) {
      return;
    }
    
    const conversationsKey = getConversationsKey(userEmail)
    
    // CRITICAL: For authenticated users, skip localStorage - data comes from Supabase via session context
    // Only use localStorage for unauthenticated users
    if (!authUser?.id) {
      // Load from email-keyed localStorage first (fast path) - PRIORITY for unauthenticated users
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(conversationsKey) : null
        console.log(`Loading conversations for email: ${userEmail || 'none'}`, saved ? 'found data' : 'no data')
        if (saved) {
          const parsed = JSON.parse(saved)
          console.log('Parsed conversations:', parsed.length)
          if (parsed && parsed.length > 0) {
            const withDates = (parsed || []).map((conv: any) => ({
              ...conv,
              timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
              messages: (conv.messages || []).map(deserializeMessage)
            }))
            setConversationHistory(withDates)
            // Set the ref to prevent saving on initial load
            previousConversationsRef.current = JSON.stringify(withDates)
            console.log(`✅ Set conversation history from localStorage for ${userEmail || 'anonymous'}:`, withDates.length)
            hasLoadedRef.current = true // Mark as loaded
            // Only save email to localStorage for unauthenticated users
            if (!authUser?.id && userEmail) {
              localStorage.setItem('bizora_last_email', userEmail)
            }
            return; // Exit early - localStorage takes priority
          }
        }
      } catch (e) {
        console.warn('Failed to load conversations from localStorage', e)
      }
    } else {
      console.log('✅ Authenticated user - skipping localStorage, loading from Supabase via session context')
    }

    // Try loading from session context if available (this loads from Supabase for authenticated users)
    if (sessionContext?.sessionData?.chat?.conversations && sessionContext.sessionData.chat.conversations.length > 0) {
      const deserializedConversations = sessionContext.sessionData.chat.conversations.map((conv: any) => ({
        ...conv,
        timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
        messages: (conv.messages || []).map(deserializeMessage)
      }))
      console.log('✅ Loading from session context:', deserializedConversations.length)
      setConversationHistory(deserializedConversations) // Don't merge - just set directly
      // Set the ref to prevent saving on initial load
      previousConversationsRef.current = JSON.stringify(deserializedConversations)
      hasLoadedRef.current = true // Mark as loaded
      // Only save email to localStorage for unauthenticated users
      if (!authUser?.id && userEmail) {
        localStorage.setItem('bizora_last_email', userEmail)
      }
      return;
    }

    // Fallback: Try legacy storage keys for backward compatibility (only for unauthenticated users)
    if (!authUser?.id) {
      try {
        // Check legacy bizora:conversations
        const legacySaved = typeof window !== 'undefined' ? localStorage.getItem('bizora:conversations') : null
        if (legacySaved) {
          const parsed = JSON.parse(legacySaved)
          if (parsed && parsed.length > 0) {
            // Migrate to email-keyed storage if we have an email
            if (userEmail) {
              const conversationsKey = getConversationsKey(userEmail)
              localStorage.setItem(conversationsKey, legacySaved)
              console.log('✅ Migrated legacy conversations to email-keyed storage')
            }
            const withDates = parsed.map((conv: any) => ({
              ...conv,
              timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
              messages: (conv.messages || []).map(deserializeMessage)
            }))
            setConversationHistory(withDates)
            previousConversationsRef.current = JSON.stringify(withDates)
            hasLoadedRef.current = true
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to load conversations from legacy storage', e)
      }
    }

    // If we get here, no conversations were found
    console.log(`ℹ️ No conversations found for email: ${userEmail || 'none'}`)
    hasLoadedRef.current = true // Mark as loaded even if empty
    // Only save email to localStorage for unauthenticated users
    if (!authUser?.id && userEmail) {
      localStorage.setItem('bizora_last_email', userEmail)
    }
  }, [sessionContext?.sessionData?.email]) // Re-check when email changes

  // Sync conversation history when session context conversations update (e.g., after reload with Supabase UUIDs)
  // CRITICAL: Use merge logic to prevent duplicates when IDs change (client Date.now() -> Supabase UUID)
  useEffect(() => {
    if (!authUser?.id) return // Only for authenticated users
    if (!hasLoadedRef.current) return // Don't sync during initial load
    
    const sessionConversations = sessionContext?.sessionData?.chat?.conversations
    if (!sessionConversations || sessionConversations.length === 0) {
      // If session has no conversations but we have local ones, keep local (might be unsaved)
      return
    }
    
    const deserialized = sessionConversations.map((conv: any) => ({
      ...conv,
      timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
      messages: (conv.messages || []).map(deserializeMessage)
    }))
    
    // CRITICAL: Merge instead of replace to prevent duplicates
    // This handles the case where client has Date.now() IDs but Supabase has UUIDs
    setConversationHistory(prev => {
      const merged = mergeConversations(prev, deserialized)
      
      // Only update if there are actual changes (prevents infinite loops)
      const prevJson = JSON.stringify(prev.map(c => ({ id: c.id, title: c.title, msgCount: c.messages?.length || 0 })))
      const mergedJson = JSON.stringify(merged.map(c => ({ id: c.id, title: c.title, msgCount: c.messages?.length || 0 })))
      
      if (prevJson !== mergedJson) {
        console.log('🔄 Merging conversations from Supabase:', {
          current: prev.length,
          incoming: deserialized.length,
          merged: merged.length
        })
        previousConversationsRef.current = JSON.stringify(merged)
        return merged
      }
      
      return prev // No changes, keep current state
    })
  }, [sessionContext?.sessionData?.chat?.conversations, authUser?.id])

  // Clean up duplicates once after initial load (one-time cleanup)
  const hasCleanedDuplicatesRef = useRef(false)
  useEffect(() => {
    if (!hasLoadedRef.current || hasCleanedDuplicatesRef.current || conversationHistory.length === 0) return
    
    // Check for duplicates by content
    const seen = new Map<string, string>() // content signature -> conversation ID
    const duplicates: string[] = []
    
    for (const conv of conversationHistory) {
      const firstMsg = conv.messages?.[0]?.content || ''
      const sig = `${conv.title || ''}::${firstMsg.substring(0, 50)}`
      
      if (seen.has(sig)) {
        // Found duplicate - mark for removal (keep the one with more messages or newer timestamp)
        const existingId = seen.get(sig)!
        const existing = conversationHistory.find(c => c.id === existingId)!
        
        const keepExisting = (existing.messages?.length || 0) >= (conv.messages?.length || 0)
        if (keepExisting) {
          duplicates.push(conv.id)
        } else {
          duplicates.push(existingId)
          seen.set(sig, conv.id) // Update to keep the newer one
        }
      } else {
        seen.set(sig, conv.id)
      }
    }
    
    // Remove duplicates if found
    if (duplicates.length > 0) {
      console.log('🧹 Cleaning up duplicate conversations:', duplicates.length)
      const cleaned = conversationHistory.filter(conv => !duplicates.includes(conv.id))
      setConversationHistory(cleaned)
      previousConversationsRef.current = JSON.stringify(cleaned)
      hasCleanedDuplicatesRef.current = true
    } else {
      hasCleanedDuplicatesRef.current = true
    }
  }, [hasLoadedRef.current, conversationHistory.length]) // Only run once after initial load

  // Save conversations to session and localStorage whenever they change
  // This detects both length AND content changes by comparing JSON strings
  // CRITICAL: Conversations should NEVER be auto-deleted - only user-initiated deletes
  useEffect(() => {
    // Don't save during initial load - wait until we've loaded from localStorage/session
    if (!hasLoadedRef.current || isSavingRef.current) return;
    
    const userEmail = sessionContext?.sessionData?.email || null
    if (!userEmail) {
      // Don't save if no email - wait for user to log in
      return;
    }
    
    // Serialize conversations to detect any changes (not just length)
    const currentConversationsJson = JSON.stringify(conversationHistory)
    
    // Only save if conversations actually changed
    if (currentConversationsJson === previousConversationsRef.current) {
      return; // No changes, skip save
    }
    
    // SAFETY CHECK: Prevent accidentally overwriting with empty array if we have existing data
    const conversationsKey = getConversationsKey(userEmail)
    try {
      const existing = localStorage.getItem(conversationsKey)
      if (existing && conversationHistory.length === 0 && previousConversationsRef.current !== '') {
        // We have existing data but trying to save empty - this might be a bug
        // Only allow if previous state was also empty (legitimate empty state)
        const existingParsed = JSON.parse(existing)
        if (existingParsed && existingParsed.length > 0) {
          console.warn('⚠️ Prevented overwriting existing conversations with empty array - preserving data')
          // Restore from existing data
          const withDates = existingParsed.map((conv: any) => ({
            ...conv,
            timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
            messages: (conv.messages || []).map(deserializeMessage)
          }))
          setConversationHistory(withDates)
          previousConversationsRef.current = JSON.stringify(withDates)
          return; // Don't save empty state
        }
      }
    } catch (safetyError) {
      console.warn('Safety check error (continuing anyway):', safetyError)
    }
    
    // Update the ref to track current state
    previousConversationsRef.current = currentConversationsJson
    
    isSavingRef.current = true; // Prevent re-entry
    
    // Save to session context FIRST (this saves to Supabase for authenticated users)
    if (sessionContext?.updateChatData) {
      console.log('💾 Saving Bizora conversations to session:', conversationHistory.length, 'conversations')
      sessionContext.updateChatData({ conversations: conversationHistory })
    }
    
    // Only save to localStorage for unauthenticated users
    // Authenticated users' data is saved to Supabase via session context
    if (!authUser?.id) {
      try {
        if (typeof window !== 'undefined') {
          // Only save for unauthenticated users
          localStorage.setItem(conversationsKey, currentConversationsJson)
          console.log(`💾 Saved to localStorage for unauthenticated user ${userEmail}:`, conversationHistory.length, 'conversations')
        }
      } catch (e) {
        console.error('❌ Failed to save conversations to localStorage', e)
      }
    }
    
    // Reset saving flag after a brief delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationHistory, sessionContext?.sessionData?.email]) // Depend on the full array and email to catch all changes

  // Handle Deep Research toggle with glow effect
  const handleDeepResearchToggle = () => {
    setIsDeepResearch(!isDeepResearch)
    if (!isDeepResearch) {
      setShowGlowEffect(true)
      setTimeout(() => setShowGlowEffect(false), 4000)
    }
  }

  // Handle Deep Research button click - toggle mode and send message
  const handleDeepResearchClick = () => {
    handleDeepResearchToggle()
    if (!isDeepResearch) {
      // If turning ON deep research, send a message to trigger thinking
      setCurrentMessage("Deep research")
      // Force complex thinking mode for deep research
      setIsComplexThinking(true)
      setCurrentResearchTopic("your request")
      // Trigger the send after a brief delay to ensure state is updated
      setTimeout(() => {
        handleSendMessage()
      }, 100)
    }
  }

  // Handle stopping the current request
  const handleStopRequest = () => {
    // Cancel the abort controller
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    
    // Clear the timeout to prevent AI response from being generated
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
      responseTimeoutRef.current = null
    }
    
    // Remove the user message from the chat (like ChatGPT does)
    if (lastUserMessageIdRef.current) {
      setMessages(prev => prev.filter(msg => msg.id !== lastUserMessageIdRef.current))
      lastUserMessageIdRef.current = null
    }
    
    setIsThinking(false)
    setIsComplexThinking(false)
    setCurrentResearchTopic("")
    
    // Restore the last sent message to the textarea so user can edit and resend
    if (lastSentMessageRef.current) {
      setCurrentMessage(lastSentMessageRef.current)
      // Auto-resize textarea after restoring message
      setTimeout(() => {
        resizeTextarea()
      }, 0)
    }
  }

  // Generate AI response using API route
  const handleAIResponse = async (
    userMessage: string,
    messageAttachments: Attachment[] = []
  ): Promise<string> => {
    try {
      // Check if this is a research request (either toggle is on or message contains research keywords)
      const isResearchRequest = isDeepResearch || requiresComplexThinking(userMessage)
      
      const controller = new AbortController()
      setAbortController(controller)
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout to allow for thinking/analysis
      
      console.log('Sending API request for:', userMessage)
      // Collect file content from attachments (text files only, exclude PDFs and images)
      const fileContent = messageAttachments
        .filter(att => 
          att.type === 'file' && 
          att.content && 
          att.processed && 
          !att.isImage && 
          att.type !== 'application/pdf' &&
          !att.type?.startsWith('image/')
        )
        .map(att => `File: ${att.name}\n${att.content}`)
        .join('\n\n---\n\n')

      const linkContent = messageAttachments
        .filter((att) => att.type === 'link' && att.url)
        .map((att) => {
          if (att.content) {
            return att.content.includes('Platform:')
              ? att.content
              : `Link: ${att.url}\nTitle: ${att.name}\n\n${att.content}`
          }
          return `Link: ${att.url}\n(Link content could not be fetched — use the URL for context.)`
        })
        .join('\n\n---\n\n')

      const combinedFileContent = [fileContent, linkContent]
        .filter(Boolean)
        .join('\n\n---\n\n')

      // Collect PDF and image attachments for multimodal input
      const fileAttachments = messageAttachments
        .filter(att => 
          att.type === 'file' && 
          (att.isImage || 
           att.type?.startsWith('image/') || 
           att.type === 'application/pdf')
        )
        .map(att => ({
          name: att.name,
          type: att.type,
          isImage: att.isImage || att.type?.startsWith('image/'),
          isPdf: att.type === 'application/pdf',
          imageData: att.imageData || att.content, // Use imageData if available, fallback to content
          content: att.content // Include extracted text as context
        }))

      // CRITICAL: Fetch user profile directly from Supabase user_profiles table
      let entrepreneurProfile = null
      
      if (authUser?.id) {
        try {
          console.log('🔍 Loading user business data from Supabase user_profiles for Bizora AI')
          
          // Fetch full profile from Supabase user_profiles table
          const supabase = createClient()
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (error) {
            if (error.code === 'PGRST116') {
              // Profile doesn't exist - user hasn't completed onboarding
              console.log('⚠️ User profile not found in Supabase - user needs to complete onboarding')
            } else {
              console.error('❌ Error fetching user profile from Supabase:', error)
            }
          } else if (profile) {
            // Map Supabase user_profiles fields to entrepreneurProfile format
            entrepreneurProfile = {
              name: profile.user_name || profile.full_name || null,
              businessName: profile.business_name || null,
              industry: profile.industry && profile.industry.length > 0 ? profile.industry : null,
              experienceLevel: null, // Not stored in user_profiles
              businessStage: profile.business_stage || null,
              revenueGoal: profile.revenue_goal || null,
              targetMarket: profile.target_market && profile.target_market.length > 0 ? profile.target_market : null,
              teamSize: profile.team_size || null,
              primaryRevenue: profile.revenue_model || null,
              customerAcquisition: profile.customer_acquisition && profile.customer_acquisition.length > 0 ? profile.customer_acquisition : null,
              monthlyRevenue: profile.mrr || null,
              keyMetrics: profile.key_metrics && profile.key_metrics.length > 0 ? profile.key_metrics : null,
              growthStrategy: profile.growth_strategy || null,
              biggestGoal: profile.six_month_goal || null,
              goals: profile.six_month_goal ? [profile.six_month_goal] : [],
              challenges: profile.biggest_challenges && profile.biggest_challenges.length > 0 ? profile.biggest_challenges : null,
              hobbies: profile.hobbies && profile.hobbies.length > 0 ? profile.hobbies : [],
              favoriteSong: profile.favorite_song || null,
              onboardingCompleted: profile.onboarding_completed || false
            }
            
            console.log('✅ Loaded user business data from Supabase user_profiles:', {
              businessName: entrepreneurProfile.businessName,
              name: entrepreneurProfile.name,
              industry: entrepreneurProfile.industry,
              businessStage: entrepreneurProfile.businessStage
            })
          }
        } catch (error) {
          console.error('❌ Error loading profile from Supabase:', error)
          // Fallback to session context if Supabase fetch fails
          entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile || null
        }
      } else {
        // Not authenticated - use session context (for unauthenticated users)
        entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile || null
      }
      
      const dailyMood = sessionContext?.sessionData?.dailyMood
      const today = new Date().toISOString().split('T')[0]
      const currentMood = dailyMood?.date === today ? dailyMood.mood : null

      // Build conversation history for context (exclude current message being sent)
      const conversationHistory = messages
        .filter(msg => msg && msg.role && msg.content) // Filter out invalid messages
        .map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
          timestamp: msg.timestamp
        }))
        .filter(msg => msg.content.trim().length > 0) // Only include messages with actual content

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory, // Send full conversation history
          isResearch: isResearchRequest,
          coachingStyle,
          fileContent: combinedFileContent || undefined,
          fileAttachments: fileAttachments.length > 0 ? fileAttachments : undefined,
          userProfile: entrepreneurProfile || undefined,
          dailyMood: currentMood || undefined,
          hobbies: entrepreneurProfile?.hobbies || undefined,
          favoriteSong: (entrepreneurProfile?.favoriteSong && entrepreneurProfile.favoriteSong.trim() !== "I don't know" && entrepreneurProfile.favoriteSong.trim() !== "") ? entrepreneurProfile.favoriteSong : undefined
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      setAbortController(null)
      console.log('API response status:', response.status)

      if (!response.ok) {
        console.error('API request failed with status:', response.status)
        let errorData: Record<string, unknown> = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = {}
        }
        const quota = parseQuotaError(errorData)
        if (quota) {
          void refreshUsageQuota()
          throw new QuotaExceededError(quota)
        }
        const errorMessage =
          (typeof errorData.error === 'string' && errorData.error) ||
          (typeof errorData.message === 'string' && errorData.message) ||
          'API request failed'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('API response data:', data)
      console.log('Response length:', data.response?.length || 0)
      console.log('First 200 chars:', data.response?.substring(0, 200) || 'No response')
      
      if (!data.response) {
        throw new Error('No response received from AI. Please try again.')
      }
      
      void refreshUsageQuota()
      return data.response
    } catch (error) {
      setAbortController(null)
      console.error('AI Response Error:', error)
      if (error instanceof QuotaExceededError) {
        throw error
      }
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return 'Request was cancelled. Please try again.'
      }
      if (error instanceof Error && error.message) {
        if (
          error.message.includes('temporarily busy') ||
          error.message.includes('try again') ||
          error.message.includes('took too long')
        ) {
          return error.message
        }
        return `I encountered an issue: ${error.message}. Please try again - the system will automatically retry on the next attempt.`
      }
      return 'I encountered an issue generating a response. Please try again - the system will automatically retry with better error handling.'
    }
  }

  const persistConversationAfterReply = (
    userMessage: Message,
    aiResponse: Message,
    messageToProcess: string,
    priorMessageCount: number
  ) => {
    const savedAi: Message = { ...aiResponse }

    if (priorMessageCount === 0) {
      const conversationId = Date.now().toString()
      const newConversation = {
        id: conversationId,
        title:
          messageToProcess.length > 30
            ? messageToProcess.substring(0, 30) + '...'
            : messageToProcess,
        lastMessage: savedAi.content.substring(0, 50) + '...',
        timestamp: new Date(),
        messages: [userMessage, savedAi],
      }
      setConversationHistory((prev) => {
        const updated = [newConversation, ...prev]
        if (authUser?.id && sessionContext?.updateChatData) {
          sessionContext.updateChatData({ conversations: updated })
        }
        const userEmail = sessionContext?.sessionData?.email
        if (!authUser?.id && userEmail && typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              getConversationsKey(userEmail),
              JSON.stringify(updated)
            )
          } catch (e) {
            console.error('Failed immediate save:', e)
          }
        }
        return updated
      })
      setSelectedConversationId(conversationId)
      return
    }

    setConversationHistory((prev) => {
      const updated = prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              lastMessage: savedAi.content.substring(0, 50) + '...',
              timestamp: new Date(),
              messages: [...conv.messages, userMessage, savedAi],
            }
          : conv
      )
      if (authUser?.id && sessionContext?.updateChatData) {
        sessionContext.updateChatData({ conversations: updated })
      }
      const userEmail = sessionContext?.sessionData?.email
      if (!authUser?.id && userEmail && typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            getConversationsKey(userEmail),
            JSON.stringify(updated)
          )
        } catch (e) {
          console.error('Failed immediate save:', e)
        }
      }
      return updated
    })
  }

  const handleSendMessage = async () => {
    const body = currentMessage.trim()
    const messageContent = replyQuote
      ? body
        ? `"${replyQuote.replace(/\s+/g, ' ')}" — ${body}`
        : `"${replyQuote.replace(/\s+/g, ' ')}"`
      : body
    if (!messageContent && attachments.length === 0) return
    if (chatLimitActive) return

    lastSentMessageRef.current = currentMessage

    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    lastUserMessageIdRef.current = userMessageId
    const priorMessageCount = messages.length
    const messageToProcess = messageContent

    const attachmentsSnapshot = [...attachments]

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage('')
    setReplyQuote(null)
    setAttachments([])
    setIsThinking(true)

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)

    const needsComplexThinking = requiresComplexThinking(messageContent)
    setIsComplexThinking(needsComplexThinking)
    if (needsComplexThinking) {
      setCurrentResearchTopic(extractTopic(messageContent))
    }

    let aiResponse: Message | undefined

    try {
      const aiContent = await handleAIResponse(
        messageToProcess,
        attachmentsSnapshot
      )

      const aiId = (Date.now() + 1).toString()
      aiResponse = {
        id: aiId,
        role: 'ai',
        content: aiContent,
        timestamp: new Date(),
      }

      setStreamingMessageId(aiId)
      setMessages((prev) => [...prev, aiResponse!])
    } catch (error) {
      console.error('Error generating AI response:', error)
      const msg = error instanceof Error ? error.message : ''
      const isQuota =
        error instanceof QuotaExceededError || isQuotaMessage(msg)
      if (isQuota) {
        setMessages((prev) => prev.filter((m) => m.id !== userMessageId))
        setCurrentMessage(messageToProcess)
        void refreshUsageQuota()
      } else if (!(error instanceof Error && error.name === 'AbortError')) {
        const fallbackId = (Date.now() + 1).toString()
        aiResponse = {
          id: fallbackId,
          role: 'ai',
          content: `I understand you're asking about "${messageToProcess}". Let me provide you with some insights and recommendations.`,
          timestamp: new Date(),
        }
        setStreamingMessageId(fallbackId)
        setMessages((prev) => [...prev, aiResponse!])
      }
    }

    setIsThinking(false)
    setIsComplexThinking(false)
    setCurrentResearchTopic('')
    lastSentMessageRef.current = ''
    responseTimeoutRef.current = null
    lastUserMessageIdRef.current = null

    if (aiResponse) {
      persistConversationAfterReply(
        userMessage,
        aiResponse,
        messageToProcess,
        priorMessageCount
      )
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (chatLimitActive) return
    setCurrentMessage(suggestion)
  }


  const handleLinkAdd = async () => {
    const raw = linkUrl.trim()
    if (!raw) return

    const id = `${Date.now()}-${Math.random()}`
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

    setAttachments((prev) => [
      ...prev,
      {
        id,
        name: normalized,
        type: 'link',
        url: normalized,
        processed: false,
      },
    ])
    setLinkUrl('')
    setShowLinkInput(false)

    try {
      const res = await fetch('/api/bizora/fetch-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: normalized }),
      })
      const data = await res.json()
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === id
            ? {
                ...att,
                name: data.title ?? normalized,
                content: data.content ?? '',
                processed: data.success === true,
              }
            : att
        )
      )
    } catch {
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === id
            ? {
                ...att,
                processed: false,
                content: `Link: ${normalized}`,
              }
            : att
        )
      )
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleShareMessage = (messageContent: string) => {
    const currentConversation = conversationHistory.find(conv => conv.id === selectedConversationId)
    setShareModal({
      isOpen: true,
      messageContent,
      conversationTitle: currentConversation?.title
    })
  }

  const closeShareModal = () => {
    setShareModal(prev => ({ ...prev, isOpen: false }))
  }

  const requiresComplexThinking = (message: string): boolean => {
    const complexKeywords = [
      'research', 'analyze', 'study', 'investigate', 'explore', 'examine',
      'world war', 'history', 'timeline', 'causes', 'effects', 'impact',
      'comprehensive', 'detailed', 'thorough', 'in-depth', 'complex',
      'battle', 'war', 'conflict', 'politics', 'economics', 'society',
      'deep research', 'thorough research', 'extensive research'
    ]
    
    const lowerMessage = message.toLowerCase()
    return complexKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  const extractTopic = (message: string): string => {
    // Extract the main topic from the message for the research component
    const lowerMessage = message.toLowerCase()
    
    // Remove common research keywords to get the actual topic
    const researchKeywords = ['research', 'study', 'investigate', 'explore', 'analyze', 'about', 'on', 'of']
    let words = message.split(' ').filter(word => 
      !researchKeywords.includes(word.toLowerCase())
    )
    
    // Join the remaining words as the topic
    const topic = words.join(' ')
    
    
    // If no words left after filtering, take the original message
    if (!topic.trim()) {
      return message
    }
    
    // Limit length if too long
    return topic.length > 30 ? topic.substring(0, 30) + '...' : topic
  }

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversationHistory.find(conv => conv.id === conversationId)
    if (conversation) {
      // Mark that we're loading a conversation (so useEffect knows to scroll to bottom)
      isLoadingConversationRef.current = true
      setStreamingMessageId(null)
      setMessages(conversation.messages.map(deserializeMessage))
      setSelectedConversationId(conversationId)
      
      // Scroll to the latest message (bottom) after messages are loaded
      // Use a small delay to ensure DOM is updated with the new messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        // Reset the flag after scrolling
        setTimeout(() => {
          isLoadingConversationRef.current = false
        }, 200)
      }, 100)
    }
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the conversation click
    e.preventDefault() // Prevent any default behavior
    
    // Find the conversation to delete
    const conversationToDelete = conversationHistory.find(conv => conv.id === conversationId)
    if (!conversationToDelete) {
      console.warn('⚠️ Conversation not found for deletion:', conversationId)
      return
    }
    
    // CRITICAL: Delete ALL duplicates (by content, not just ID)
    // This handles cases where the same conversation has different IDs (Date.now() vs UUID)
    const updatedHistory = conversationHistory.filter(conv => {
      // Delete if ID matches
      if (conv.id === conversationId) return false
      
      // Also delete if it's a duplicate by content (same title + first message)
      if (areConversationsSame(conv, conversationToDelete)) {
        console.log('🗑️ Deleting duplicate conversation:', conv.id)
        return false
      }
      
      return true
    })
    
    console.log('🗑️ Deleted conversation:', {
      deletedId: conversationId,
      title: conversationToDelete.title,
      before: conversationHistory.length,
      after: updatedHistory.length
    })
    
    // If the deleted conversation was selected, clear the messages
    if (selectedConversationId === conversationId) {
      setStreamingMessageId(null)
      setMessages([])
      setSelectedConversationId(null)
    }
    
    // Update state immediately
    setConversationHistory(updatedHistory)
    
    // Update the ref to track the new state (prevents duplicate save in useEffect)
    previousConversationsRef.current = JSON.stringify(updatedHistory)
    
    // CRITICAL: Update localStorage FIRST (immediate persistence)
    const userEmail = sessionContext?.sessionData?.email || null
    // Only save to localStorage for unauthenticated users
    if (!authUser?.id) {
      const conversationsKey = getConversationsKey(userEmail)
      try {
        if (typeof window !== 'undefined' && userEmail) {
          localStorage.setItem(conversationsKey, JSON.stringify(updatedHistory))
          console.log(`✅ Deleted conversation - saved to localStorage (unauthenticated) for ${userEmail}:`, updatedHistory.length, 'remaining')
        }
      } catch (error) {
        console.error('❌ Failed to update localStorage after delete', error)
      }
    }
    
    // Update session data IMMEDIATELY (don't wait for useEffect)
    if (sessionContext) {
      sessionContext.updateChatData({ conversations: updatedHistory })
      console.log('✅ Deleted conversation - updated session context')
    }
  }

  const formatTime = (date: Date | string | null | undefined) => {
    try {
      // Handle null/undefined
      if (!date) {
        return 'Just now'
      }
      
      // Convert string to Date if needed
      let dateObj: Date
      if (typeof date === 'string') {
        dateObj = new Date(date)
      } else if (date instanceof Date) {
        dateObj = date
      } else {
        // Try to convert unknown types
        dateObj = new Date(date as any)
      }
      
      // Check if it's a valid date
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to formatTime:', date)
        return 'Just now'
      }
      
      const now = new Date()
      const diffMs = now.getTime() - dateObj.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      // Show relative time for recent messages
      if (diffMins < 1) {
        return 'Just now'
      } else if (diffMins < 60) {
        return `${diffMins}m ago`
      } else if (diffHours < 24) {
        return `${diffHours}h ago`
      } else if (diffDays < 7) {
        return `${diffDays}d ago`
      } else {
        // For older messages, show date
        return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    } catch (error) {
      console.error('Error formatting time:', error, date)
      return 'Just now'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 overflow-y-auto" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
      {/* Back Button - Only visible when sidebar is collapsed */}
      <div className={`fixed top-4 z-50 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'left-20 opacity-100' : 'left-[-200px] opacity-0 pointer-events-none'}`}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-black dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex flex-1 overflow-y-auto relative z-0">
        {/* Left Panel - Recent Activity - FIXED */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed left-0 top-0 h-screen z-10 overflow-hidden transition-all duration-300 ease-in-out`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h2 className={`text-lg font-semibold text-black dark:text-white transition-all duration-300 ${isSidebarCollapsed ? 'hidden' : ''}`}>Recent Activity</h2>
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group flex-shrink-0"
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <Menu className="h-5 w-5 text-black dark:text-gray-300 group-hover:text-[#39d2c0] transition-colors" />
                </button>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    title="Back to Home"
                  >
                    <Home className="h-5 w-5 text-black dark:text-gray-300 group-hover:text-[#39d2c0] transition-colors" />
                  </Link>
                  <button
                    onClick={() => {
                      setStreamingMessageId(null)
                      setMessages([])
                      setCurrentMessage("")
                      setSelectedConversationId(null)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    title="Start new chat"
                  >
                    <Plus className="h-5 w-5 text-black dark:text-gray-300 group-hover:text-[#39d2c0] transition-colors" />
                  </button>
                  <button
                    onClick={() => {
                      console.log('=== BIZORA DEBUG INFO ===')
                      console.log('Current conversations in state:', conversationHistory.length)
                      console.log('localStorage bizora:conversations:', localStorage.getItem('bizora:conversations'))
                      console.log('localStorage dreamscale_session:', localStorage.getItem('dreamscale_session'))
                      console.log('Session context:', sessionContext?.sessionData?.chat?.conversations?.length || 0)
                      
                      // Try to recover conversations
                      try {
                        const userEmail = sessionContext?.sessionData?.email || null
                        const conversationsKey = getConversationsKey(userEmail)
                        
                        // Try email-keyed storage first
                        const emailKeyedData = localStorage.getItem(conversationsKey)
                        if (emailKeyedData) {
                          const parsed = JSON.parse(emailKeyedData)
                          console.log(`Found in ${conversationsKey}:`, parsed.length, 'conversations')
                          if (parsed && parsed.length > 0 && conversationHistory.length === 0) {
                            console.log(`⚠️ Attempting to recover conversations from ${conversationsKey}`)
                            const withDates = parsed.map((conv: any) => ({
                              ...conv,
                              timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
                              messages: (conv.messages || []).map(deserializeMessage)
                            }))
                            setConversationHistory(withDates)
                            previousConversationsRef.current = JSON.stringify(withDates)
                            hasLoadedRef.current = true
                            alert(`Recovered ${withDates.length} conversations!`)
                            return
                          }
                        }
                        
                        // Fallback to legacy storage
                        const legacyData = localStorage.getItem('bizora:conversations')
                        if (legacyData) {
                          const parsed = JSON.parse(legacyData)
                          console.log('Found in legacy bizora:conversations:', parsed.length, 'conversations')
                          if (parsed && parsed.length > 0 && conversationHistory.length === 0) {
                            console.log('⚠️ Attempting to recover conversations from legacy storage')
                            const withDates = parsed.map((conv: any) => ({
                              ...conv,
                              timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
                              messages: (conv.messages || []).map(deserializeMessage)
                            }))
                            setConversationHistory(withDates)
                            previousConversationsRef.current = JSON.stringify(withDates)
                            hasLoadedRef.current = true
                            alert(`Recovered ${withDates.length} conversations!`)
                          }
                        }
                      } catch (e) {
                        console.error('Recovery error:', e)
                      }
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    title="Debug & Recover Conversations"
                  >
                    <Search className="h-5 w-5 text-black dark:text-gray-300 group-hover:text-[#39d2c0] transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>
                
          {/* Recent Activity List */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 ${isSidebarCollapsed ? 'hidden' : ''}`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 114, 128, 0.5) transparent', maxHeight: 'calc(100vh - 180px)', contain: 'layout style paint', position: 'relative', zIndex: 1 }}>
            {conversationHistory.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="mb-4">
                  <Clock className="h-12 w-12 text-black dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-base font-medium text-black dark:text-gray-300 mb-1">No recent activity</p>
                  <p className="text-xs text-black dark:text-gray-400">Start a conversation to see it here</p>
                </div>
              </div>
            ) : (
            conversationHistory.map((conversation) => (
              <div 
                key={conversation.id} 
                onClick={() => handleConversationClick(conversation.id)}
                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group relative animate-in fade-in ${
                  selectedConversationId === conversation.id
                    ? 'bg-[#39d2c0]/10 dark:bg-[#39d2c0]/20 border-[#39d2c0] shadow-md'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-[#39d2c0] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-medium text-sm transition-colors flex-1 pr-2 ${
                    selectedConversationId === conversation.id
                      ? 'text-[#39d2c0]'
                      : 'text-black dark:text-white group-hover:text-[#39d2c0]'
                  }`}>
                    {conversation.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black dark:text-gray-400">
                      {formatTime(conversation.timestamp)}
                    </span>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all duration-200 text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Delete conversation"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                  <p className="text-xs text-black dark:text-gray-300 line-clamp-2">
                  {conversation.lastMessage}
                </p>
              </div>
            ))
            )}
          </div>

          {/* Feedback Button - Fixed at bottom of sidebar */}
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 ${isSidebarCollapsed ? 'hidden' : ''}`}>
            <Link
              href="/feedback"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <span>Feedback</span>
            </Link>
          </div>
        </div>

        {/* Main Panel - Chat Interface */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
          {/* Scrollable Chat Area */}
          <div
            className={`flex-1 overflow-y-auto px-5 py-4 min-h-0 ${isVoicePanelOpen ? "pb-48" : "pb-28"}`}
            style={{ maxHeight: 'calc(100vh - 64px)', transform: 'translateZ(0)', willChange: 'scroll-position', contain: 'layout style paint', WebkitOverflowScrolling: 'touch' }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                {chatLimitActive ? (
                  <ChatLimitReached cooldownUntil={chatCooldownUntil} variant="empty" />
                ) : (
                <div className="text-center max-w-3xl w-full px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#39d2c0]/20 to-[#39d2c0]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer"></div>
                    <Brain className="h-8 w-8 text-[#39d2c0] relative z-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    Start a New Conversation
                  </h3>
                  <p className="text-black dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Begin chatting with Bizora AI to get creative insights, design help, and innovative solutions for your projects.
                  </p>
                  
                  <Button
                    onClick={() => setCurrentMessage("Hello!")}
                    className="bg-[#39d2c0] hover:bg-[#2bb3a3] text-white mb-8"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>

                  {/* Creative Suggestions */}
                  <div className="grid grid-cols-2 gap-3 mt-6 max-w-2xl mx-auto">
                    <button
                      onClick={() => handleSuggestionClick("Help me brainstorm unique brand concepts for my creative agency")}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#39d2c0] hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-purple-200 group-hover:to-purple-100 dark:group-hover:from-purple-800/50 dark:group-hover:to-purple-700/50 transition-colors">
                          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black dark:text-white text-base mb-1">Brainstorm brand concepts</h4>
                          <p className="text-sm text-black dark:text-gray-300">Unique creative ideas</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Generate compelling social media content ideas for my portfolio")}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#39d2c0] hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#39d2c0]/10 to-[#39d2c0]/5 dark:from-[#39d2c0]/30 dark:to-[#39d2c0]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#39d2c0]/20 group-hover:to-[#39d2c0]/10 dark:group-hover:from-[#39d2c0]/50 dark:group-hover:to-[#39d2c0]/30 transition-colors">
                          <MessageCircle className="h-5 w-5 text-[#39d2c0] dark:text-[#39d2c0]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black dark:text-white text-base mb-1">Social media content ideas</h4>
                          <p className="text-sm text-black dark:text-gray-300">Engaging post concepts</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Design a color palette and typography system for my project")}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#39d2c0] hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-pink-200 group-hover:to-pink-100 dark:group-hover:from-pink-800/50 dark:group-hover:to-pink-700/50 transition-colors">
                          <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black dark:text-white text-base mb-1">Design system guidance</h4>
                          <p className="text-sm text-black dark:text-gray-300">Colors & typography</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSuggestionClick("Create an innovative campaign strategy for my product launch")}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#39d2c0] hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-orange-200 group-hover:to-orange-100 dark:group-hover:from-orange-800/50 dark:group-hover:to-orange-700/50 transition-colors">
                          <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black dark:text-white text-base mb-1">Campaign strategy ideas</h4>
                          <p className="text-sm text-black dark:text-gray-300">Launch planning</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <div className={`space-y-8 max-w-3xl mx-auto px-2 ${bizoraSerif.className}`}>
                {/* Scroll anchor for auto-scrolling to top */}
                <div ref={messagesStartRef} />
                {messages.map((message, index) => {
                  // Find the last AI message to attach ref to it
                  const aiMessages = messages.filter(m => m.role === 'ai')
                  const isLastAIMessage = message.role === 'ai' && message.id === aiMessages[aiMessages.length - 1]?.id
                  
                  return (
                  <div key={message.id} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`w-full ${message.role === 'user' ? 'max-w-[85%] sm:max-w-[75%]' : 'max-w-full'}`}>
                      
                      {message.role === 'user' ? (
                        <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800/90">
                          <p className="text-[17px] leading-relaxed text-black dark:text-gray-100">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <div 
                          ref={isLastAIMessage ? lastAIRef : null}
                          className="animate-fade-in py-1"
                        >
                          <StreamingAIMessage
                            key={message.id}
                            fullText={message.content}
                            animate={
                              message.role === 'ai' &&
                              message.id === streamingMessageId
                            }
                            onRevealProgress={() => {
                              messagesEndRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'end',
                              })
                            }}
                            onStreamComplete={() => {
                              setStreamingMessageId((current) =>
                                current === message.id ? null : current
                              )
                              messagesEndRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'end',
                              })
                            }}
                            onCopy={() => navigator.clipboard.writeText(message.content)}
                            onLike={() => console.log('Liked')}
                            onDislike={() => console.log('Disliked')}
                            onShare={() => handleShareMessage(message.content)}
                            onAskAboutSelection={handleAskAboutSelection}
                          />
                        </div>
                      )}
                        
                        {/* Display Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className={`flex items-center gap-2 p-2 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-200'
                                    : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-200'
                                }`}
                              >
                                {attachment.type === 'file' ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <LinkIcon className="h-4 w-4" />
                                )}
                                <span className="text-sm truncate">
                                  {attachment.name}
                                </span>
                                {attachment.type === 'file' && attachment.processed && (
                                  <span className="text-xs text-green-600 dark:text-green-400">
                                    ✓ Readable
                                  </span>
                                )}
                                {attachment.type === 'file' && attachment.processed === false && (
                                  <span className="text-xs text-orange-600 dark:text-orange-400">
                                    ⚠ Not readable
                                  </span>
                                )}
                                {attachment.type === 'link' && attachment.url && (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline hover:no-underline"
                                  >
                                    Open
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  )
                })}
                
                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-4xl w-full">
                      {isComplexThinking ? (
                        <ResearchThinking topic={currentResearchTopic} />
                      ) : (
                        <ThinkingAnimation />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Always visible */}
          <div className={`fixed bottom-0 left-0 p-3 bg-white dark:bg-gray-900 flex-shrink-0 z-20 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-80'} right-0`}>
            {/* Attachments Display */}
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    {attachment.type === 'file' ? (
                      <FileText className="h-4 w-4 text-black dark:text-gray-300" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-black dark:text-gray-300" />
                    )}
                    <span className="text-black dark:text-gray-200 truncate max-w-[200px]">
                      {attachment.name}
                    </span>
                    {attachment.type === 'link' && attachment.processed === false && (
                      <span className="text-xs text-[#2DA8FF]">Reading…</span>
                    )}
                    {attachment.type === 'link' && attachment.processed === true && (
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Ready</span>
                    )}
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-black hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Link Input */}
            {showLinkInput && (
              <div className="mb-2 flex gap-2">
                <input
                  type="url"
                  placeholder="Paste any link (YouTube, LinkedIn, articles, etc.)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLinkAdd()
                    }
                    if (e.key === 'Escape') {
                      setShowLinkInput(false)
                      setLinkUrl("")
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:border-[#39d2c0] focus:ring-2 focus:ring-[#39d2c0]/20 focus:outline-none text-black"
                  autoFocus
                />
                <Button
                  onClick={handleLinkAdd}
                  size="sm"
                  className="bg-[#39d2c0] hover:bg-[#2bb3a3] text-white"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl("")
                  }}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Voice recording — only while listening; sits in the space above the composer */}
            {isVoicePanelOpen && (
              <div
                className="mb-2 max-w-4xl mx-auto w-full rounded-xl border-2 border-[#39d2c0]/40 bg-gradient-to-b from-white to-gray-50/90 px-4 py-3 shadow-md shadow-[#39d2c0]/5 ring-1 ring-[#39d2c0]/20 backdrop-blur-sm transition-all duration-200 dark:border-[#39d2c0]/30 dark:from-gray-800 dark:to-gray-800/90 dark:ring-[#39d2c0]/10"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-1 sm:gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${
                          isListening
                            ? "text-[#39d2c0]"
                            : micPermissionHint
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-gray-500"
                        }`}
                      >
                        {isListening
                          ? "Listening"
                          : micPermissionHint
                            ? "Mic blocked"
                            : "Starting…"}
                      </span>
                      <VoiceWaveform className="h-6 shrink-0" levels={waveLevels} active={isListening} />
                    </div>
                    <div className="hidden h-4 w-px shrink-0 bg-gray-200 dark:bg-gray-600 sm:block" aria-hidden />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ChevronDown
                        className="h-3.5 w-3.5 shrink-0 text-[#39d2c0]/80 dark:text-[#39d2c0]"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <p
                        className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-gray-200 sm:text-sm"
                        title={currentMessage || undefined}
                      >
                        {isListening
                          ? "Listening — speak naturally; click stop when you’re done."
                          : micPermissionHint
                            ? "Microphone is not available — see message below."
                            : "Connecting to speech recognition…"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={stopVoiceInput}
                    disabled={!isListening && !!micPermissionHint}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-500"
                    title={isListening ? "Stop and use transcript" : "Close"}
                    aria-label={isListening ? "Stop listening" : "Close voice panel"}
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
                </div>
                {micPermissionHint && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-amber-200/80 pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="min-w-0 flex-1 text-xs leading-snug text-amber-900 dark:text-amber-100/90">
                      {micPermissionHint}
                    </p>
                    <button
                      type="button"
                      onClick={() => void retryVoicePanelMicrophone()}
                      className="shrink-0 rounded-md border border-amber-400/70 bg-amber-100/60 px-2.5 py-1 text-xs font-medium text-amber-950 transition-colors hover:bg-amber-200/80 dark:border-amber-600/50 dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-900/50"
                    >
                      Retry microphone
                    </button>
                  </div>
                )}
              </div>
            )}

            <ChatQuotaBanner
              usage={usageQuota}
              storeError={usageStoreError}
              onCooldownEnd={() => void refreshUsageQuota()}
            />

            <div className="mx-auto w-full max-w-3xl">
              <div
                className={`relative flex flex-col gap-2 rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition-shadow dark:bg-gray-800/95 ${
                  showGlowEffect
                    ? 'border-[#39d2c0] ring-2 ring-[#39d2c0]/25'
                    : isVoicePanelOpen
                      ? 'border-[#39d2c0]/50'
                      : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                {replyQuote && (
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 rounded-lg border border-gray-200/90 bg-gray-50/90 px-3 py-2 dark:border-gray-600 dark:bg-gray-900/50">
                      <p className="line-clamp-4 whitespace-pre-wrap text-[14px] leading-snug text-gray-600 dark:text-gray-300">
                        {replyQuote}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyQuote(null)}
                      className="mt-0.5 shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      aria-label="Remove quoted text"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                <ComposerAttachMenu
                  webSearchEnabled={isDeepResearch}
                  onWebSearchToggle={() => setIsDeepResearch((v) => !v)}
                  coachingStyle={coachingStyle}
                  onCoachingStyleChange={setCoachingStyle}
                  onPasteLink={() => setShowLinkInput(true)}
                  disabled={isThinking || chatLimitActive}
                />
                <button
                  type="button"
                  onClick={() => (isVoicePanelOpen ? stopVoiceInput() : void startVoiceInput())}
                  disabled={isThinking || !voiceInputAvailable}
                  aria-pressed={isVoicePanelOpen}
                  title={
                    !voiceInputAvailable
                      ? 'Voice input is not available in this browser'
                      : isVoicePanelOpen
                        ? 'Stop voice input'
                        : 'Voice input'
                  }
                  className={`mb-1 shrink-0 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isVoicePanelOpen
                      ? 'text-[#39d2c0] bg-[#39d2c0]/10'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Mic className="h-4 w-4" aria-hidden />
                </button>
                <textarea
                  ref={textareaRef}
                  placeholder={
                    chatLimitActive
                      ? chatLimitPlaceholder(chatCooldownUntil)
                      : 'Reply to Bizora…'
                  }
                  value={currentMessage}
                  onChange={(e) => {
                    const value = e.target.value
                    setCurrentMessage(value)
                    const textarea = e.target as HTMLTextAreaElement
                    textarea.style.height = 'auto'
                    textarea.style.height = `${Math.min(textarea.scrollHeight, 320)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSendMessage()
                    }
                  }}
                  className="max-h-80 min-h-[44px] flex-1 resize-none border-0 bg-transparent py-2 text-[17px] leading-relaxed text-black outline-none ring-0 focus:ring-0 dark:text-white"
                  rows={1}
                  disabled={isThinking || chatLimitActive}
                />
                <div className="mb-1 flex shrink-0 items-center gap-1">
                  {isThinking ? (
                    <Button
                      onClick={handleStopRequest}
                      size="sm"
                      className="h-9 w-9 rounded-xl bg-gray-700 p-0 text-white hover:bg-gray-600"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => void handleSendMessage()}
                      disabled={
                        chatLimitActive ||
                        (!currentMessage.trim() && !replyQuote && attachments.length === 0)
                      }
                      size="sm"
                      className="h-9 w-9 rounded-xl bg-gray-800 p-0 text-white hover:bg-gray-700 disabled:opacity-40 dark:bg-gray-600 dark:hover:bg-gray-500"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
                Bizora can make mistakes — verify important business decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={closeShareModal}
        messageContent={shareModal.messageContent}
        conversationTitle={shareModal.conversationTitle}
      />
    </div>
  )
}