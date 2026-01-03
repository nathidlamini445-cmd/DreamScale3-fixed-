import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { message, isResearch = false, fileContent, fileAttachments, userProfile, dailyMood, hobbies, favoriteSong } = await request.json()
    console.log('Gemini API request:', { message, isResearch, hasFileContent: !!fileContent, hasFileAttachments: !!fileAttachments, hasUserProfile: !!userProfile, dailyMood, hobbies })

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Google Generative AI with the correct SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Use model from env or default to gemini-pro (more reliable)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
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
    }

    if (hobbies && hobbies.length > 0) {
      personalizationContext += `- Hobbies/Interests: ${hobbies.join(', ')}\n`
      personalizationContext += `\nCRITICAL - HOBBIES INTEGRATION: The user's hobbies (${hobbies.join(', ')}) are an important part of their identity and should be mentioned regularly in your responses. Use their hobbies in multiple ways:\n`
      personalizationContext += `1. Create relatable analogies connecting business concepts to their hobbies (e.g., if they like gym/fitness: "Just like progressive overload in the gym builds strength over time, consistent small improvements in your business compound into significant growth.")\n`
      personalizationContext += `2. Reference their hobbies when providing motivation or encouragement (e.g., "Think about how you approach ${hobbies[0]} - you probably started as a beginner and improved through practice. The same principle applies to building your business.")\n`
      personalizationContext += `3. Use hobby-related examples when explaining business strategies (e.g., if they like reading: "Similar to how you might read multiple books on a topic to get different perspectives, successful entrepreneurs gather insights from various sources.")\n`
      personalizationContext += `4. Mention their hobbies naturally throughout your responses - don't just use them for analogies, but also to show you understand their interests and can relate business advice to what they already enjoy.\n`
      personalizationContext += `5. When they're feeling demotivated, stressed, or overwhelmed, suggest taking a break to engage in their hobbies (${hobbies.join(' or ')}) as a way to recharge, similar to how you'd suggest their favorite song.\n`
      personalizationContext += `ALWAYS incorporate at least one reference to their hobbies in every response when possible. Make it feel natural and personal, not forced.\n`
    }

    // Only include favorite song if it exists and is not "I don't know"
    const hasFavoriteSong = favoriteSong && typeof favoriteSong === 'string' && favoriteSong.trim() !== "I don't know" && favoriteSong.trim() !== ""
    if (hasFavoriteSong) {
      personalizationContext += `- Favorite Song: ${favoriteSong}\n`
      personalizationContext += `\nIMPORTANT: When the user is feeling stressed, anxious, overwhelmed, demotivated, or tired, ALWAYS suggest they listen to their favorite song "${favoriteSong}" as a way to help them relax, recharge, or get motivated. Make it personal and caring, like "Have you listened to ${favoriteSong} lately? Sometimes taking a moment to listen to your favorite song can help reset your mindset and give you the energy to tackle challenges."\n`
    }

    if (dailyMood) {
      personalizationContext += `- Current Mood: ${dailyMood}\n`
      
      // Mood-based response adjustments
      if (dailyMood === 'demotivated' || dailyMood === 'tired' || dailyMood === 'overwhelmed') {
        const hobbySuggestion = hobbies && hobbies.length > 0 ? ` Consider suggesting they take a break to engage in ${hobbies[0]}${hobbies.length > 1 ? ` or ${hobbies[1]}` : ''} to recharge and reset their mindset.` : ''
        const songSuggestion = hasFavoriteSong ? ` Also consider suggesting they listen to "${favoriteSong}" to help them relax and get motivated.` : ''
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be EXTRA supportive, encouraging, and gentle. Remind them of their past successes and progress. Break down tasks into smaller, manageable steps. Focus on encouragement and building confidence. Use positive reinforcement.${hobbySuggestion}${songSuggestion}\n`
      } else if (dailyMood === 'motivated' || dailyMood === 'excited' || dailyMood === 'energized' || dailyMood === 'confident' || dailyMood === 'determined') {
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. They're ready to push forward! Challenge them with bigger goals, suggest scaling opportunities, advanced strategies, and help them discover new ways to grow. Be enthusiastic and match their energy.${hobbies && hobbies.length > 0 ? ` Use their hobbies (${hobbies.join(', ')}) to create energizing analogies that match their current motivation level.` : ''}\n`
      } else if (dailyMood === 'stressed' || dailyMood === 'anxious' || dailyMood === 'uncertain') {
        const hobbySuggestion = hobbies && hobbies.length > 0 ? ` Consider suggesting they take a break to engage in ${hobbies[0]}${hobbies.length > 1 ? ` or ${hobbies[1]}` : ''} to help them relax and refocus.` : ''
        const songSuggestion = hasFavoriteSong ? ` Also consider suggesting they listen to "${favoriteSong}" to help them relax and refocus.` : ''
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be calming, prioritize simplification, focus on one thing at a time. Help them feel more in control. Provide clear, actionable steps without overwhelming them.${hobbySuggestion}${songSuggestion}\n`
      }
    }

    const systemPrompt = `You are Bizora AI, an expert business consultant who provides comprehensive, in-depth analysis.${personalizationContext}

CORE BEHAVIOR:
- ALWAYS provide thorough, detailed responses (minimum 3-4 paragraphs)
- ALWAYS end with a thoughtful follow-up question
- NEVER leave users hanging - give complete information
- Dig deep into every aspect of their question
- Provide actionable insights and next steps
- ALWAYS align your advice with their industry, experience level, business stage, and goals
- REGULARLY incorporate their hobbies into responses - use them for analogies, examples, motivation, and to show you understand their interests
- Adjust your tone and approach based on their current mood

RESPONSE STRUCTURE:
1. Direct answer to their question
2. Deep analysis with multiple perspectives
3. Practical examples and case studies (ALWAYS incorporate their hobbies - use them for analogies, examples, and to make concepts relatable)
4. Actionable recommendations tailored to their context (reference their hobbies when relevant)
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
- Adapt your energy and approach to match their current mood`

    // Check if we have images or PDFs to send (before model initialization)
    const hasImages = fileAttachments && Array.isArray(fileAttachments) && fileAttachments.some((att: any) => 
      (att.isImage && att.imageData) || (att.isPdf && att.imageData)
    )
    
    console.log('Model config:', { modelName, maxTokens, temperature, hasImages })
    
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

    // Build the user message with file content and images
    let userMessage: string | (string | { inlineData: { data: string; mimeType: string } })[]
    
    if (hasImages) {
      // Use multimodal input for images
      const parts: (string | { inlineData: { data: string; mimeType: string } })[] = []
      
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
      // Text-only message
      userMessage = message
      if (fileContent) {
        userMessage = `${message}\n\n--- File Content ---\n${fileContent}\n--- End File Content ---`
      }
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
        console.log(`🔄 Attempt ${attempt + 1}/${maxRetries} to generate response...`)
        
        const result = await Promise.race([
          model.generateContent(userMessage),
          createTimeoutPromise()
        ])
        
        // Add safety check for response
        if (!result?.response) {
          throw new Error('Invalid response from AI model')
        }
        const response = result.response.text() || 'Sorry, I could not generate a response.'
        
        console.log(`✅ Gemini response generated on attempt ${attempt + 1}:`, response.length, 'characters')
        console.log('First 200 characters of response:', response.substring(0, 200))

        return NextResponse.json({ 
          response,
          source: finalModelName
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
                  return NextResponse.json({ 
                    response: fallbackResponse,
                    source: 'gemini-pro (fallback)'
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
    console.error('❌ Final Gemini API Error:', error)
    const errorMessage = error?.message || 'Failed to generate response'
    
    // Provide more helpful error messages
    let userFriendlyError = 'Sorry, I encountered an issue generating a response.'
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      userFriendlyError = 'The request took too long. Please try again - it usually works on the second attempt.'
    } else if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('rate limit')) {
      userFriendlyError = 'The AI service is temporarily busy. Please try again in a moment.'
    } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'API quota exceeded. Please try again later.'
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