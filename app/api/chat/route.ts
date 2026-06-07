import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { chatSchema } from '@/lib/validations'
import { auth } from '@clerk/nextjs/server'
import { assertChatAllowed, recordChatSuccess } from '@/lib/usage-quota/guard'
import { getCoachingStylePrompt } from '@/lib/bizora/coaching-styles'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per client
    const rateLimited = rateLimit(`chat:${getClientIp(request)}`, 30, 60_000)
    if (rateLimited) return rateLimited

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format. Please try again.' },
        { status: 400 }
      )
    }

    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    const {
      message,
      conversationHistory = [],
      isResearch = false,
      coachingStyle = 'balanced',
      fileContent,
      fileAttachments,
      userProfile: clientUserProfile,
      dailyMood,
      hobbies,
      favoriteSong,
      userId,
    } = parsed.data
    
    let userProfile = clientUserProfile
    
    // Use Clerk session to determine the real userId instead of trusting client input
    const { userId: clerkUserId } = await auth()
    const verifiedUserId = clerkUserId ?? userId ?? null

    const chatHasFiles =
      Array.isArray(fileAttachments) && fileAttachments.length > 0
    if (verifiedUserId) {
      const quotaDenied = await assertChatAllowed(verifiedUserId, {
        hasFileAttachments: chatHasFiles,
      })
      if (quotaDenied) return quotaDenied
    }

    if (verifiedUserId && (!userProfile || !userProfile.businessName)) {
      try {
        const supabase = await createClient()
        
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', verifiedUserId)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('⚠️ User profile not found in Supabase')
          } else {
            console.error('❌ Error fetching user profile from Supabase:', error)
          }
        } else if (profile) {
          // Map Supabase user_profiles fields to userProfile format
          userProfile = {
            name: profile.user_name || profile.full_name || null,
            businessName: profile.business_name || null,
            industry: profile.industry && profile.industry.length > 0 ? profile.industry : null,
            experienceLevel: null,
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
          
          // Profile loaded from Supabase
        }
      } catch (error) {
        console.error('❌ Error fetching profile from Supabase in API route:', error)
        // Continue with client-provided userProfile or null
      }
    }
    
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty' },
        { status: 400 }
      )
    }
    
    // Ensure conversationHistory is an array
    const safeConversationHistory = Array.isArray(conversationHistory) ? conversationHistory : []
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Gemini API request:', { messageLength: message.length, historyLength: safeConversationHistory.length })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
    if (!geminiApiKey) {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Google Generative AI with the correct SDK
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    
    // Use model from env or default to a current stable model
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')
    
    // Build personalized context
    let personalizationContext = ''
    if (userProfile) {
      personalizationContext += `\n\nUSER CONTEXT:\n`
      if (userProfile.name) {
        personalizationContext += `- Name: ${userProfile.name}\n`
      }
      if (userProfile.businessName) {
        personalizationContext += `- Business Name: ${userProfile.businessName}\n`
      }
      if (userProfile.industry) {
        const industry = Array.isArray(userProfile.industry) ? userProfile.industry.join(', ') : userProfile.industry
        personalizationContext += `- Industry: ${industry}\n`
      }
      if (userProfile.experienceLevel) {
        personalizationContext += `- Experience Level: ${userProfile.experienceLevel}\n`
      }
      if (userProfile.businessStage) {
        const stage = Array.isArray(userProfile.businessStage) ? userProfile.businessStage.join(', ') : userProfile.businessStage
        personalizationContext += `- Business Stage: ${stage}\n`
      }
      if (userProfile.revenueGoal) {
        const goal = Array.isArray(userProfile.revenueGoal) ? userProfile.revenueGoal.join(', ') : userProfile.revenueGoal
        personalizationContext += `- Revenue Goal: ${goal}\n`
      }
      if (userProfile.targetMarket) {
        const market = Array.isArray(userProfile.targetMarket) ? userProfile.targetMarket.join(', ') : userProfile.targetMarket
        personalizationContext += `- Target Market: ${market}\n`
      }
      if (userProfile.teamSize) {
        const size = Array.isArray(userProfile.teamSize) ? userProfile.teamSize.join(', ') : userProfile.teamSize
        personalizationContext += `- Team Size: ${size}\n`
      }
      if (userProfile.monthlyRevenue) {
        const revenue = Array.isArray(userProfile.monthlyRevenue) ? userProfile.monthlyRevenue.join(', ') : userProfile.monthlyRevenue
        personalizationContext += `- Monthly Revenue: ${revenue}\n`
      }
      if (userProfile.growthStrategy) {
        const strategy = Array.isArray(userProfile.growthStrategy) ? userProfile.growthStrategy.join(', ') : userProfile.growthStrategy
        personalizationContext += `- Growth Strategy: ${strategy}\n`
      }
      if (userProfile.goals && userProfile.goals.length > 0) {
        personalizationContext += `- Goals: ${userProfile.goals.join(', ')}\n`
      }
      if (userProfile.biggestGoal) {
        const goal = Array.isArray(userProfile.biggestGoal) ? userProfile.biggestGoal.join(', ') : userProfile.biggestGoal
        personalizationContext += `- Biggest Goal (6 months): ${goal}\n`
      }
      if (userProfile.challenges) {
        const challenges = Array.isArray(userProfile.challenges) ? userProfile.challenges.join(', ') : userProfile.challenges
        personalizationContext += `- Current Challenges: ${challenges}\n`
      }
      if (userProfile.primaryRevenue) {
        const revenue = Array.isArray(userProfile.primaryRevenue) ? userProfile.primaryRevenue.join(', ') : userProfile.primaryRevenue
        personalizationContext += `- Revenue Model: ${revenue}\n`
      }
      if (userProfile.customerAcquisition) {
        const acquisition = Array.isArray(userProfile.customerAcquisition) ? userProfile.customerAcquisition.join(', ') : userProfile.customerAcquisition
        personalizationContext += `- Customer Acquisition Methods: ${acquisition}\n`
      }
      if (userProfile.keyMetrics) {
        const metrics = Array.isArray(userProfile.keyMetrics) ? userProfile.keyMetrics.join(', ') : userProfile.keyMetrics
        personalizationContext += `- Key Metrics Tracked: ${metrics}\n`
      }
    }

    // Use favoriteSong from userProfile if available, otherwise use passed favoriteSong
    const userFavoriteSong = userProfile?.favoriteSong || favoriteSong
    
    // Only include favorite song if it exists and is not "I don't know"
    const hasFavoriteSong = userFavoriteSong && typeof userFavoriteSong === 'string' && userFavoriteSong.trim() !== "I don't know" && userFavoriteSong.trim() !== ""
    if (hasFavoriteSong) {
      personalizationContext += `- Favorite Song: ${userFavoriteSong}\n`
      personalizationContext += `\nIMPORTANT: When the user is feeling stressed, anxious, overwhelmed, demotivated, or tired, ALWAYS suggest they listen to their favorite song "${userFavoriteSong}" as a way to help them relax, recharge, or get motivated. Make it personal and caring, like "Have you listened to ${userFavoriteSong} lately? Sometimes taking a moment to listen to your favorite song can help reset your mindset and give you the energy to tackle challenges."\n`
    }

    if (dailyMood) {
      personalizationContext += `- Current Mood: ${dailyMood}\n`
      
      // Mood-based response adjustments
      if (dailyMood === 'demotivated' || dailyMood === 'tired' || dailyMood === 'overwhelmed') {
        const songSuggestion = hasFavoriteSong ? ` Also consider suggesting they listen to "${userFavoriteSong}" to help them relax and get motivated.` : ''
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be EXTRA supportive, encouraging, and gentle. Remind them of their past successes and progress. Break down tasks into smaller, manageable steps. Focus on encouragement and building confidence. Use positive reinforcement.${songSuggestion}\n`
      } else if (dailyMood === 'motivated' || dailyMood === 'excited' || dailyMood === 'energized' || dailyMood === 'confident' || dailyMood === 'determined') {
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. They're ready to push forward! Challenge them with bigger goals, suggest scaling opportunities, advanced strategies, and help them discover new ways to grow. Be enthusiastic and match their energy.\n`
      } else if (dailyMood === 'stressed' || dailyMood === 'anxious' || dailyMood === 'uncertain') {
        const songSuggestion = hasFavoriteSong ? ` Also consider suggesting they listen to "${userFavoriteSong}" to help them relax and refocus.` : ''
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be calming, prioritize simplification, focus on one thing at a time. Help them feel more in control. Provide clear, actionable steps without overwhelming them.${songSuggestion}\n`
      }
    }

    const coachingStylePrompt = getCoachingStylePrompt(coachingStyle)

    if (process.env.NODE_ENV === 'development' && coachingStyle !== 'balanced') {
      console.log('[Bizora chat] coaching style:', coachingStyle)
    }

    const systemPrompt = `You are Bizora AI, an expert business consultant who provides comprehensive, in-depth analysis.${personalizationContext}${coachingStylePrompt}

CRITICAL MEMORY INSTRUCTIONS:
- You have access to the FULL conversation history with this user
- ALWAYS reference previous messages when relevant - if the user mentions something from earlier in the conversation, recall and reference it
- If the user asks about something mentioned 2, 3, 4, or more messages ago, you MUST remember and reference it
- Build on previous conversations - connect current questions to what was discussed before
- Show continuity by referencing past topics, decisions, or plans discussed earlier
- If the user says "remember when I said..." or "earlier I mentioned...", you MUST recall and reference that information
- Maintain context throughout the entire conversation - don't treat each message as isolated
- When the conversation history is provided, carefully review it and actively reference relevant past discussions

CORE BEHAVIOR:
- ALWAYS provide thorough, detailed responses (minimum 3-4 paragraphs)
- ALWAYS end with a thoughtful follow-up question
- NEVER leave users hanging - give complete information
- Dig deep into every aspect of their question
- Provide actionable insights and next steps
- ALWAYS align your advice with their industry, experience level, business stage, and goals
- Do NOT mention the user's hobbies, personal interests from onboarding, or leisure activities unless they explicitly bring them up in the current message
- Adjust your tone and approach based on their current mood
- ALWAYS reference previous conversation context when relevant
- Write in a calm, thoughtful, conversational style: clear, grounded, and supportive
- Prefer natural language over hype; avoid sounding robotic, salesy, or overly formal
- Explain reasoning step by step in plain English before giving recommendations

RESPONSE STRUCTURE:
1. Direct answer to their question
2. Deep analysis with multiple perspectives
3. Practical examples and case studies grounded in their industry and business context
4. Actionable recommendations tailored to their context
5. Thoughtful follow-up question
6. Always recommend popular people in their industry to follow and engage with

FORMATTING REQUIREMENTS:
- Use **bold headings** for main sections (## Main Heading, ### Sub-heading)
- Use numbered lists (1., 2., 3.) for key points and steps
- Use bullet points for supporting details
- Make important terms **bold** for emphasis
- Structure your response with clear visual hierarchy

PERSONALITY:
- Enthusiastic and knowledgeable
- Business-focused and practical
- Encouraging and supportive
- Always ready to dive deeper
- Adapt your energy and approach to match their current mood
- Voice style: warm, intelligent, and steady; concise where possible but never abrupt`

    // Check if we have images or PDFs to send (before model initialization)
    const hasImages = fileAttachments && Array.isArray(fileAttachments) && fileAttachments.some((att: any) => 
      (att.isImage && att.imageData) || (att.isPdf && att.imageData)
    )
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Model config:', { modelName, hasImages })
    }
    
    // Use vision model if images are present, otherwise use text model
    const finalModelName = hasImages ? 'gemini-1.5-pro' : (modelName || 'gemini-pro')
    
    const model = genAI.getGenerativeModel({ 
      model: finalModelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    // Build conversation context from history
    let conversationContext = ''
    if (safeConversationHistory && safeConversationHistory.length > 0) {
      try {
        conversationContext = '\n\n--- CONVERSATION HISTORY ---\n'
        // Include last 20 messages for context (to maintain better memory while avoiding token limits)
        const recentHistory = safeConversationHistory.slice(-20)
        recentHistory.forEach((msg: any) => {
          // Validate message structure
          if (msg && typeof msg === 'object' && msg.role && msg.content) {
            const role = msg.role === 'user' ? 'User' : 'Bizora AI'
            const content = typeof msg.content === 'string' ? msg.content : String(msg.content || '')
            if (content.trim()) {
              conversationContext += `${role}: ${content}\n\n`
            }
          }
        })
        conversationContext += '--- END CONVERSATION HISTORY ---\n\n'
        conversationContext += 'IMPORTANT: Use the conversation history above to maintain context. If the user references something from earlier messages, recall and reference it. Build on previous discussions.\n\n'
      } catch (historyError) {
        console.error('Error building conversation context:', historyError)
        // Continue without conversation context if there's an error
        conversationContext = ''
      }
    }

    // Build the user message with file content and images
    let userMessage: string | (string | { inlineData: { data: string; mimeType: string } })[]
    
    if (hasImages) {
      // Use multimodal input for images
      const parts: (string | { inlineData: { data: string; mimeType: string } })[] = []
      
      // Add conversation context first
      if (conversationContext) {
        parts.push(conversationContext)
      }
      
      // Add text message
      let textMessage = message
      if (fileContent) {
        textMessage = `${message}\n\n--- File Content ---\n${fileContent}\n--- End File Content ---`
      }
      parts.push(textMessage)
      
      // Add images and PDFs
      fileAttachments.forEach((att: any) => {
        if ((att.isImage || att.isPdf) && att.imageData) {
          // Add file context if available
          if (att.content && att.content.trim() && !att.content.includes('[PDF File:') && !att.content.includes('[Image:')) {
            parts.push(`File: ${att.name}\n${att.content}`)
          }
          
          // Add the actual file (PDF or image) for Gemini to process
          parts.push({
            inlineData: {
              data: att.imageData,
              mimeType: att.type || (att.isPdf ? 'application/pdf' : 'image/png')
            }
          })
        }
      })
      
      userMessage = parts
    } else {
      // Text-only message with conversation context
      let fullMessage = ''
      if (conversationContext) {
        fullMessage = conversationContext
      }
      fullMessage += message
      if (fileContent) {
        fullMessage += `\n\n--- File Content ---\n${fileContent}\n--- End File Content ---`
      }
      userMessage = fullMessage
    }

    // Add retry logic with exponential backoff to handle rate limits and timeouts
    const maxRetries = 3
    let lastError: any = null
    
    // Helper function to create timeout promise
    const createTimeoutPromise = () => new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
    })
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (process.env.NODE_ENV === 'development') console.log(`Attempt ${attempt + 1}/${maxRetries}`)
        
        const result = await Promise.race([
          model.generateContent(userMessage),
          createTimeoutPromise()
        ])
        
        // Add safety check for response
        if (!result?.response) {
          throw new Error('Invalid response from AI model')
        }
        const response = result.response.text() || 'Sorry, I could not generate a response.'
        
        if (process.env.NODE_ENV === 'development') console.log(`Response generated: ${response.length} chars`)

        if (verifiedUserId) {
          await recordChatSuccess(verifiedUserId, {
            hasFileAttachments: chatHasFiles,
          })
        }
        return NextResponse.json({
          response,
          source: finalModelName,
        })
      } catch (error: any) {
        lastError = error
        console.error(`❌ Gemini API error (attempt ${attempt + 1}/${maxRetries}):`, error)
        console.error('Error name:', error?.name)
        console.error('Error message:', error?.message)
        
        // Check if it's a 503/overload/rate limit error - retry with backoff
        if (error.message?.includes('503') || 
            error.message?.includes('overloaded') || 
            error.message?.includes('Service Unavailable') ||
            error.message?.includes('model is overloaded') ||
            error.message?.includes('429') ||
            error.message?.includes('rate limit') ||
            error.message?.includes('quota') ||
            error.message?.includes('RESOURCE_EXHAUSTED')) {
          if (attempt < maxRetries - 1) {
            // Exponential backoff: 2s, 4s, 8s
            const backoffDelay = Math.pow(2, attempt + 1) * 1000
            console.log(`⏳ Rate limit/overload detected, retrying in ${backoffDelay / 1000} seconds...`)
            await new Promise(resolve => setTimeout(resolve, backoffDelay))
            continue // Retry
          } else {
            // Last attempt failed, try fallback model if not already using it
            if (finalModelName !== 'gemini-pro') {
              console.log('🔄 All retries exhausted, trying fallback model (gemini-pro)...')
              try {
                const fallbackModel = genAI.getGenerativeModel({ 
                  model: 'gemini-pro',
                  generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature: temperature,
                  },
                  systemInstruction: systemPrompt
                })
                const fallbackResult = await Promise.race([
                  fallbackModel.generateContent(userMessage),
                  createTimeoutPromise()
                ])
                if (fallbackResult?.response) {
                  const fallbackResponse = fallbackResult.response.text()
                  console.log('✅ Fallback model succeeded')
                  if (verifiedUserId) {
                    await recordChatSuccess(verifiedUserId, {
                      hasFileAttachments: chatHasFiles,
                    })
                  }
                  return NextResponse.json({
                    response: fallbackResponse,
                    source: 'gemini-pro (fallback)',
                  })
                }
              } catch (fallbackError) {
                console.error('❌ Fallback model also failed:', fallbackError)
              }
            }
          }
        }
        
        // Check for timeout - don't retry timeouts on last attempt
        if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
          if (attempt < maxRetries - 1) {
            const backoffDelay = Math.pow(2, attempt + 1) * 1000
            console.log(`⏳ Timeout occurred, retrying in ${backoffDelay / 1000} seconds...`)
            await new Promise(resolve => setTimeout(resolve, backoffDelay))
            continue
          }
        }
        
        // For other errors, retry if we have attempts left
        if (attempt < maxRetries - 1 && !error.message?.includes('Invalid response')) {
          const backoffDelay = Math.pow(2, attempt + 1) * 1000
          console.log(`⏳ Error occurred, retrying in ${backoffDelay / 1000} seconds...`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
          continue
        }
        
        // If we've exhausted all retries, throw the error
        if (attempt === maxRetries - 1) {
          throw error
        }
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('Failed to generate response after all retries')
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Gemini API Error:', error?.message)
    }
    const errorMessage = error?.message || 'Failed to generate response'
    
    // Provide more helpful error messages
    let userFriendlyError = 'Sorry, I encountered an issue generating a response.'
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      userFriendlyError = 'The request took too long. Please try again - it usually works on the second attempt.'
    } else if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('rate limit')) {
      userFriendlyError = 'The AI service is temporarily busy. Please try again in a moment.'
    } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'API quota exceeded. Please try again later.'
    } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      userFriendlyError = 'There was an issue processing the request. Please try again.'
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyError,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}