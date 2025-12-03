import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { message, isResearch = false, fileContent, userProfile, dailyMood, hobbies } = await request.json()
    console.log('Gemini API request:', { message, isResearch, hasFileContent: !!fileContent, hasUserProfile: !!userProfile, dailyMood, hobbies })

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
      if (userProfile.industry) {
        personalizationContext += `- Industry: ${userProfile.industry}\n`
      }
      if (userProfile.experienceLevel) {
        personalizationContext += `- Experience Level: ${userProfile.experienceLevel}\n`
      }
      if (userProfile.businessStage) {
        personalizationContext += `- Business Stage: ${userProfile.businessStage}\n`
      }
      if (userProfile.goals && userProfile.goals.length > 0) {
        personalizationContext += `- Goals: ${userProfile.goals.join(', ')}\n`
      }
    }

    if (hobbies && hobbies.length > 0) {
      personalizationContext += `- Hobbies/Interests: ${hobbies.join(', ')}\n`
      personalizationContext += `\nIMPORTANT: Use their hobbies to create relatable analogies. For example, if they like gym/fitness, use gym analogies like "Just like when someone's using the machine you need at the gym, you don't quit—you find an alternative exercise for that muscle group. In business, when one path is blocked, find another way."\n`
    }

    if (dailyMood) {
      personalizationContext += `- Current Mood: ${dailyMood}\n`
      
      // Mood-based response adjustments
      if (dailyMood === 'demotivated' || dailyMood === 'tired' || dailyMood === 'overwhelmed') {
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be EXTRA supportive, encouraging, and gentle. Remind them of their past successes and progress. Break down tasks into smaller, manageable steps. Focus on encouragement and building confidence. Use positive reinforcement.\n`
      } else if (dailyMood === 'motivated' || dailyMood === 'excited' || dailyMood === 'energized' || dailyMood === 'confident' || dailyMood === 'determined') {
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. They're ready to push forward! Challenge them with bigger goals, suggest scaling opportunities, advanced strategies, and help them discover new ways to grow. Be enthusiastic and match their energy.\n`
      } else if (dailyMood === 'stressed' || dailyMood === 'anxious' || dailyMood === 'uncertain') {
        personalizationContext += `\nMOOD ADJUSTMENT: The user is feeling ${dailyMood}. Be calming, prioritize simplification, focus on one thing at a time. Help them feel more in control. Provide clear, actionable steps without overwhelming them.\n`
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
- Use their hobbies for relatable analogies when relevant
- Adjust your tone and approach based on their current mood

RESPONSE STRUCTURE:
1. Direct answer to their question
2. Deep analysis with multiple perspectives
3. Practical examples and case studies (use their hobbies for analogies when relevant)
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
- Adapt your energy and approach to match their current mood`

    console.log('Model config:', { modelName, maxTokens, temperature })
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
      systemInstruction: systemPrompt
    })

    // Build the user message
    let userMessage = message
    if (fileContent) {
      userMessage = `${message}\n\n--- File Content ---\n${fileContent}\n--- End File Content ---`
    }

    const result = await model.generateContent(userMessage)
    const response = result.response.text() || 'Sorry, I could not generate a response.'
    
    console.log('Gemini response generated:', response.length, 'characters')
    console.log('First 200 characters of response:', response.substring(0, 200))

    return NextResponse.json({ 
      response,
      source: modelName
    })
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}