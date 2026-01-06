"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSessionSafe } from "@/lib/session-context"
import { useBizoraLoading } from "@/lib/bizora-loading-context"
import { Button } from "@/components/ui/button"
import { AIResponse } from "@/components/ai-response"
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
  Home
} from "lucide-react"
import { ThinkingAnimation } from "@/components/thinking-animation"
import { ResearchThinking } from "@/components/research-thinking"
import { ShareModal } from "@/components/share-modal"

// Utility to merge conversations uniquely by id
function mergeConversations(
  existing: { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }[],
  incoming: { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }[],
) {
  const byId: Record<string, { id: string, title: string, lastMessage: string, timestamp: Date, messages: any[] }> = {}
  for (const conv of existing) {
    byId[conv.id] = conv
  }
  for (const conv of incoming) {
    const current = byId[conv.id]
    if (!current) {
      byId[conv.id] = conv
    } else {
      // Prefer conversation with more messages; otherwise, keep the latest timestamp
      const preferIncoming = (conv.messages?.length || 0) > (current.messages?.length || 0)
        || new Date(conv.timestamp).getTime() > new Date(current.timestamp).getTime()
      if (preferIncoming) byId[conv.id] = conv
    }
  }
  return Object.values(byId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  attachments?: Attachment[]
}

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
  const { setOpeningBizora } = useBizoraLoading()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentMessage, setCurrentMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
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

  // Hide loading overlay once page is ready (with minimum display time)
  useEffect(() => {
    // Ensure loading screen shows for at least 800ms for better UX
    const startTime = Date.now()
    const minDisplayTime = 800 // Minimum milliseconds to show loading screen
    
    const hideLoading = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      setTimeout(() => {
        setOpeningBizora(false)
      }, remainingTime)
    }
    
    hideLoading()
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
    if (userEmail && hasLoadedRef.current) {
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
    
    // Skip if already loaded (unless email changed)
    if (hasLoadedRef.current && userEmail === localStorage.getItem('bizora_last_email')) {
      return;
    }
    
    const conversationsKey = getConversationsKey(userEmail)
    
    // Load from email-keyed localStorage first (fast path) - PRIORITY
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
            messages: (conv.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
            }))
          }))
          setConversationHistory(withDates)
          // Set the ref to prevent saving on initial load
          previousConversationsRef.current = JSON.stringify(withDates)
          console.log(`✅ Set conversation history from localStorage for ${userEmail || 'anonymous'}:`, withDates.length)
          hasLoadedRef.current = true // Mark as loaded
          if (userEmail) {
            localStorage.setItem('bizora_last_email', userEmail)
          }
          return; // Exit early - localStorage takes priority
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations from localStorage', e)
    }

    // Try loading from session context if available
    if (sessionContext?.sessionData?.chat?.conversations && sessionContext.sessionData.chat.conversations.length > 0) {
      const deserializedConversations = sessionContext.sessionData.chat.conversations.map((conv: any) => ({
        ...conv,
        timestamp: typeof conv.timestamp === 'string' ? new Date(conv.timestamp) : conv.timestamp,
        messages: (conv.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }))
      }))
      console.log('✅ Loading from session context:', deserializedConversations.length)
      setConversationHistory(deserializedConversations) // Don't merge - just set directly
      // Set the ref to prevent saving on initial load
      previousConversationsRef.current = JSON.stringify(deserializedConversations)
      hasLoadedRef.current = true // Mark as loaded
      if (userEmail) {
        localStorage.setItem('bizora_last_email', userEmail)
      }
      return;
    }

    // Fallback: Try legacy storage keys for backward compatibility
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
            messages: (conv.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
            }))
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

    // If we get here, no conversations were found
    console.log(`ℹ️ No conversations found for email: ${userEmail || 'none'}`)
    hasLoadedRef.current = true // Mark as loaded even if empty
    if (userEmail) {
      localStorage.setItem('bizora_last_email', userEmail)
    }
  }, [sessionContext?.sessionData?.email]) // Re-check when email changes

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
            messages: (conv.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
            }))
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
    
    // Save to email-keyed localStorage FIRST (immediate persistence)
    // CRITICAL: Always save, even if empty - never auto-delete conversations
    // Conversations should only be deleted when user explicitly deletes them
    try {
      if (typeof window !== 'undefined') {
        // Always save the current state - never remove the key
        localStorage.setItem(conversationsKey, currentConversationsJson)
        console.log(`💾 Saved to localStorage for ${userEmail}:`, conversationHistory.length, 'conversations')
      }
    } catch (e) {
      console.error('❌ Failed to save conversations to localStorage', e)
      // Don't lose data - try to preserve existing
      try {
        const existing = localStorage.getItem(conversationsKey)
        if (existing) {
          console.warn('⚠️ Preserved existing conversations due to save error')
        }
      } catch (recoveryError) {
        console.error('❌ Recovery failed:', recoveryError)
      }
    }
    
    // Save to session context (for cross-tab sync and logout persistence)
    if (sessionContext?.updateChatData) {
      console.log('💾 Saving Bizora conversations to session:', conversationHistory.length, 'conversations')
      sessionContext.updateChatData({ conversations: conversationHistory })
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
  const handleAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Check if this is a research request (either toggle is on or message contains research keywords)
      const isResearchRequest = isDeepResearch || requiresComplexThinking(userMessage)
      
      const controller = new AbortController()
      setAbortController(controller)
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout to allow for thinking/analysis
      
      console.log('Sending API request for:', userMessage)
      // Collect file content from attachments (text files only, exclude PDFs and images)
      const fileContent = attachments
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

      // Collect PDF and image attachments for multimodal input
      const fileAttachments = attachments
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

      // Get user profile and mood from session
      const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
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
          fileContent: fileContent || undefined,
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
        // Try to get the actual error message from the API response
        try {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.message || 'API request failed'
          // If API provides a user-friendly error, throw it so it can be displayed
          throw new Error(errorMessage)
        } catch (parseError) {
          // If we can't parse the error, use a generic message
          throw new Error(`API request failed with status ${response.status}. Please try again.`)
        }
      }

      const data = await response.json()
      console.log('API response data:', data)
      console.log('Response length:', data.response?.length || 0)
      console.log('First 200 chars:', data.response?.substring(0, 200) || 'No response')
      
      if (!data.response) {
        throw new Error('No response received from AI. Please try again.')
      }
      
      return data.response
    } catch (error) {
      setAbortController(null)
      console.error('AI Response Error:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      // Only use fallback for actual errors, not for successful responses
      if (error instanceof Error && error.name === 'AbortError') {
        return 'Request was cancelled. Please try again.'
      }
      // Show the actual error message from API (which now includes retry logic)
      if (error instanceof Error && error.message) {
        // If it's a user-friendly error message from the API, show it
        if (error.message.includes('temporarily busy') || 
            error.message.includes('try again') || 
            error.message.includes('took too long') ||
            error.message.includes('quota')) {
          return error.message
        }
        // For other errors, provide helpful context
        return `I encountered an issue: ${error.message}. Please try again - the system will automatically retry on the next attempt.`
      }
      // Last resort: ask user to try again (no generic fallback response)
      return 'I encountered an issue generating a response. Please try again - the system will automatically retry with better error handling.'
    }
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim() && attachments.length === 0) return

    // Store the message before clearing it, so we can restore it if user stops
    lastSentMessageRef.current = currentMessage

    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }

    // Store the user message ID so we can remove it if user stops
    lastUserMessageIdRef.current = userMessageId

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setAttachments([])
    setIsThinking(true)
    
    // Auto-scroll to bottom after user message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
    
    // Determine if this requires complex thinking
    const needsComplexThinking = requiresComplexThinking(currentMessage)
    setIsComplexThinking(needsComplexThinking)

    // Store the message and research topic before clearing it
    const messageToProcess = currentMessage
    if (needsComplexThinking) {
      setCurrentResearchTopic(extractTopic(currentMessage))
    }

    // Simulate AI thinking and response
    const thinkingDuration = needsComplexThinking ? 60000 : 7000 // 60 seconds for complex, 7 seconds for normal
    
    // Store timeout so we can cancel it if user stops
    responseTimeoutRef.current = setTimeout(async () => {
      let aiResponse: Message
      
      try {
        const aiContent = await handleAIResponse(messageToProcess)
        
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: aiContent,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiResponse])
      } catch (error) {
        console.error('Error generating AI response:', error)
        // Only show error if it wasn't aborted (user didn't stop)
        if (!(error instanceof Error && error.name === 'AbortError')) {
          // Fallback response
          aiResponse = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: `I understand you're asking about "${messageToProcess}". Let me provide you with some insights and recommendations.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
        }
      }
      
      setIsThinking(false)
      setIsComplexThinking(false)
      setCurrentResearchTopic("")
      lastSentMessageRef.current = "" // Clear stored message after successful response
      responseTimeoutRef.current = null // Clear timeout reference
      lastUserMessageIdRef.current = null // Clear user message ID reference
      
      // Scroll to top will be handled by useEffect when isThinking changes from true to false

      // Update conversation history
      // CRITICAL: Always save conversations immediately to prevent data loss
      if (messages.length === 0) {
        const conversationId = Date.now().toString()
        const newConversation = {
          id: conversationId,
          title: messageToProcess.length > 30 ? messageToProcess.substring(0, 30) + "..." : messageToProcess,
          lastMessage: aiResponse.content.substring(0, 50) + "...",
          timestamp: new Date(),
          messages: [userMessage, aiResponse]
        }
        setConversationHistory(prev => {
          const updated = [newConversation, ...prev]
          // Immediately save to prevent any data loss
          const userEmail = sessionContext?.sessionData?.email
          if (userEmail && typeof window !== 'undefined') {
            try {
              const conversationsKey = getConversationsKey(userEmail)
              localStorage.setItem(conversationsKey, JSON.stringify(updated))
              console.log('💾 Immediately saved new conversation to localStorage')
            } catch (e) {
              console.error('Failed immediate save:', e)
            }
          }
          return updated
        })
        setSelectedConversationId(conversationId)
      } else {
        // Update existing conversation
        setConversationHistory(prev => {
          const updated = prev.map(conv => 
            conv.id === selectedConversationId 
              ? {
                  ...conv,
                  lastMessage: aiResponse.content.substring(0, 50) + "...",
                  timestamp: new Date(),
                  messages: [...conv.messages, userMessage, aiResponse]
                }
              : conv
          )
          // Immediately save to prevent any data loss
          const userEmail = sessionContext?.sessionData?.email
          if (userEmail && typeof window !== 'undefined') {
            try {
              const conversationsKey = getConversationsKey(userEmail)
              localStorage.setItem(conversationsKey, JSON.stringify(updated))
              console.log('💾 Immediately saved updated conversation to localStorage')
            } catch (e) {
              console.error('Failed immediate save:', e)
            }
          }
          return updated
        })
      }
    }, thinkingDuration)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion)
  }


  const handleLinkAdd = () => {
    if (linkUrl.trim()) {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        name: linkUrl,
        type: 'link',
        url: linkUrl
      }
      setAttachments(prev => [...prev, attachment])
      setLinkUrl("")
      setShowLinkInput(false)
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
      setMessages(conversation.messages)
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
    
    // Smooth deletion with animation
    const updatedHistory = conversationHistory.filter(conv => conv.id !== conversationId)
    
    // If the deleted conversation was selected, clear the messages
    if (selectedConversationId === conversationId) {
      setMessages([])
      setSelectedConversationId(null)
    }
    
    // Update state with smooth transition
    setConversationHistory(updatedHistory)
    
    // Update the ref to track the new state (prevents duplicate save in useEffect)
    previousConversationsRef.current = JSON.stringify(updatedHistory)
    
    // CRITICAL: Update localStorage FIRST (immediate persistence)
    const userEmail = sessionContext?.sessionData?.email || null
    const conversationsKey = getConversationsKey(userEmail)
    try {
      if (typeof window !== 'undefined' && userEmail) {
        // Always save, even if empty - preserve the state
        // Only user-initiated deletes should remove conversations
        localStorage.setItem(conversationsKey, JSON.stringify(updatedHistory))
        console.log(`✅ Deleted conversation - saved to localStorage for ${userEmail}:`, updatedHistory.length, 'remaining')
      }
    } catch (error) {
      console.error('❌ Failed to update localStorage after delete', error)
    }
    
    // Update session data IMMEDIATELY (don't wait for useEffect)
    if (sessionContext) {
      sessionContext.updateChatData({ conversations: updatedHistory })
      console.log('✅ Deleted conversation - updated session context')
    }
  }

  const formatTime = (date: Date | string) => {
    try {
      // Convert string to Date if needed
      const dateObj = typeof date === 'string' ? new Date(date) : date
      
      // Check if it's a valid date
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return 'Invalid date'
      }
      
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'N/A'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
      {/* Back Button - Only visible when sidebar is collapsed */}
      <div className={`fixed top-4 z-50 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'left-20 opacity-100' : 'left-[-200px] opacity-0 pointer-events-none'}`}>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-black dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-0">
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
                    href="/"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    title="Back to Home"
                  >
                    <Home className="h-5 w-5 text-black dark:text-gray-300 group-hover:text-[#39d2c0] transition-colors" />
                  </Link>
                  <button
                    onClick={() => {
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
                              messages: (conv.messages || []).map((msg: any) => ({
                                ...msg,
                                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
                              }))
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
                              messages: (conv.messages || []).map((msg: any) => ({
                                ...msg,
                                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
                              }))
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
        </div>

        {/* Main Panel - Chat Interface */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
          {/* Scrollable Chat Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 min-h-0" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
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
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Scroll anchor for auto-scrolling to top */}
                <div ref={messagesStartRef} />
                {messages.map((message, index) => {
                  // Find the last AI message to attach ref to it
                  const aiMessages = messages.filter(m => m.role === 'ai')
                  const isLastAIMessage = message.role === 'ai' && message.id === aiMessages[aiMessages.length - 1]?.id
                  
                  return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      
                      {message.role === 'user' ? (
                        <div className="rounded-2xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xl font-medium text-black dark:text-white leading-relaxed" style={{ fontFamily: '"Space Grotesk", sans-serif', textShadow: '0 1px 1px rgba(0, 0, 0, 0.04)' }}>
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <div 
                          ref={isLastAIMessage ? lastAIRef : null}
                          className="animate-fade-in"
                        >
                          <AIResponse 
                            content={message.content}
                            onCopy={() => navigator.clipboard.writeText(message.content)}
                            onLike={() => console.log('Liked')}
                            onDislike={() => console.log('Disliked')}
                            onShare={() => handleShareMessage(message.content)}
                            onAddToPrompt={(text) => {
                              // Add selected text to textarea
                              const currentText = currentMessage.trim()
                              const newText = currentText 
                                ? `${currentText}\n\n${text}` 
                                : text
                              setCurrentMessage(newText)
                              
                              // Focus and scroll textarea into view
                              setTimeout(() => {
                                if (textareaRef.current) {
                                  textareaRef.current.focus()
                                  textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                  // Set cursor to end
                                  const length = textareaRef.current.value.length
                                  textareaRef.current.setSelectionRange(length, length)
                                  // Auto-resize using optimized function
                                  resizeTextarea()
                                }
                              }, 100)
                            }}
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
                  placeholder="Paste a link..."
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


            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask, Search, Create and Plan"
                  value={currentMessage}
                  onChange={(e) => {
                    // Direct value access - zero overhead
                    const value = e.target.value
                    // Instant state update
                    setCurrentMessage(value)
                    // Ultra-fast synchronous resize - browser optimized
                    const textarea = e.target as HTMLTextAreaElement
                    textarea.style.height = 'auto'
                    textarea.style.height = `${Math.min(textarea.scrollHeight, 384)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className={`w-full min-h-[48px] max-h-96 resize-none rounded-lg pr-24 border dark:bg-gray-800 dark:text-white focus:border-[#39d2c0] focus:ring-2 focus:ring-[#39d2c0]/20 focus:shadow-sm focus:shadow-[#39d2c0]/10 p-2.5 text-sm overflow-y-auto text-black ${
                    showGlowEffect 
                      ? 'border-[#39d2c0] ring-4 ring-[#39d2c0]/30 shadow-lg shadow-[#39d2c0]/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows={1}
                  disabled={isThinking}
                />
                
                {/* Attachment Buttons */}
                <div className="absolute right-1.5 bottom-1.5 flex gap-0.5">
                  <button
                    onClick={() => setShowLinkInput(true)}
                    className="p-1.5 text-black hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Add link"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDeepResearchClick}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                      isDeepResearch 
                        ? 'text-[#39d2c0] bg-[#39d2c0]/10 dark:bg-[#39d2c0]/30 dark:text-[#39d2c0] shadow-md shadow-[#39d2c0]/20' 
                        : 'text-black hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isDeepResearch ? "Turn off Deep Research Mode" : "Turn on Deep Research Mode"}
                  >
                    <Globe className={`h-3.5 w-3.5 transition-all duration-200 ${isDeepResearch ? 'text-[#39d2c0]' : ''}`} />
                    <span className="text-xs font-medium">Deep research</span>
                  </button>
                </div>
              </div>
              {isThinking ? (
                <Button
                  onClick={handleStopRequest}
                  className="bg-gray-700 hover:bg-gray-600 text-white h-10 w-10 rounded-full transition-colors duration-200 flex items-center justify-center"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={(!currentMessage.trim() && attachments.length === 0)}
                  className="bg-gray-700 hover:bg-gray-600 text-white h-10 w-10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-black dark:text-gray-300 mt-1.5">
              Press Enter to send • Shift + Enter for new line • Attach links
            </p>
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