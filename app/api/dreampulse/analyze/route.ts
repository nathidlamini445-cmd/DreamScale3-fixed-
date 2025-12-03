import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface QuestionnaireData {
  intrapreneurName: string  // Name or LinkedIn profile of intrapreneur
  companyIndustry: string  // Industry their company operates in
  targetStakeholders: string[]  // Key stakeholders and decision-makers
  initiativeFrequency: string  // How often they launch initiatives
  projectTypes: string[]  // Types of projects they lead
  uniqueApproach: string  // What makes their approach stand out
  weaknesses: string
  collaborationMethods: string[]  // How they engage with stakeholders
  valueCreation: string[]  // Value their initiatives create
  skillRating: {  // Intrapreneurial skill ratings
    innovation: number
    execution: number
    leadership: number
    persistence: number
  }
  yourAdvantage: string
}

export async function POST(request: Request) {
  let data: QuestionnaireData | null = null
  
  try {
    data = await request.json()
    
    if (!data.intrapreneurName || !data.companyIndustry) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Debug: Log all environment variables related to Gemini
    console.log('🔍 Environment Check:')
    console.log('  GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    console.log('  GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0)
    console.log('  GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'undefined')
    console.log('  GEMINI_MODEL:', process.env.GEMINI_MODEL)
    console.log('  GEMINI_MAX_TOKENS:', process.env.GEMINI_MAX_TOKENS)
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables')
      const fallbackAnalysis = generateFallbackAnalysis(data)
      return NextResponse.json({ 
        analysis: fallbackAnalysis,
        warning: 'API key not configured. Using fallback analysis.'
      })
    }

    console.log(`🧠 Starting Gemini analysis for: ${data.intrapreneurName}`)
    console.log('API Key available:', !!process.env.GEMINI_API_KEY)
    
    try {
      const analysis = await performGeminiAnalysis(data)
      return NextResponse.json({ analysis })
    } catch (analysisError: any) {
      console.error('❌ Error in performGeminiAnalysis:', analysisError)
      console.error('Error message:', analysisError?.message)
      console.error('Error stack:', analysisError?.stack)
      
      // If we have data, provide fallback analysis
      if (data) {
        const fallbackAnalysis = generateFallbackAnalysis(data)
        return NextResponse.json({ 
          analysis: fallbackAnalysis + '\n\n⚠️ **Note:** This is a fallback analysis. The API request failed: ' + (analysisError.message || 'Unknown error'),
          warning: 'Analysis completed with fallback due to API error: ' + (analysisError.message || 'Unknown error')
        })
      }
      
      // Re-throw if we don't have data
      throw analysisError
    }
    
  } catch (error: any) {
    console.error('❌ Analysis error:', error)
    console.error('Error details:', error.message, error.stack)
    
    // Try to provide a fallback analysis if we have data
    if (data) {
      try {
        const fallbackAnalysis = generateFallbackAnalysis(data)
        return NextResponse.json({ 
          analysis: fallbackAnalysis + '\n\n⚠️ **Note:** This is a fallback analysis due to an error. ' + (error.message || 'Please try again.'),
          warning: 'Analysis completed with fallback due to error: ' + (error.message || 'Unknown error')
        })
      } catch (fallbackError) {
        console.error('Failed to generate fallback:', fallbackError)
      }
    }
    
    // If we can't generate fallback, return error
    return NextResponse.json({ 
      error: 'Analysis failed. Please try again.',
      details: error.message 
    }, { status: 500 })
  }
}

async function performGeminiAnalysis(data: QuestionnaireData): Promise<string> {
  // Initialize genAI with the API key (do this here so it always uses current env vars)
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  
  // Use the model from environment variables (consistent with other routes)
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  console.log('🔍 Using model:', modelName)
  console.log('🔍 Max tokens:', process.env.GEMINI_MAX_TOKENS || "16384")
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "16384"),
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
    }
  })
  
  const prompt = `
You are a senior organizational strategy analyst with expertise in intrapreneurship, innovation management, and competitive positioning within corporate environments. Provide a comprehensive analysis for this intrapreneur.

INTRAPRENEUR: ${data.intrapreneurName}
COMPANY INDUSTRY: ${data.companyIndustry}
TARGET STAKEHOLDERS: ${data.targetStakeholders.join(', ')}
INITIATIVE FREQUENCY: ${data.initiativeFrequency}
PROJECT TYPES: ${data.projectTypes.join(', ')}
UNIQUE APPROACH: ${data.uniqueApproach}
WEAKNESSES: ${data.weaknesses}
COLLABORATION METHODS: ${data.collaborationMethods.join(', ')}
VALUE CREATION: ${data.valueCreation.join(', ')}
SKILL RATINGS: Innovation ${data.skillRating.innovation}/5, Execution ${data.skillRating.execution}/5, Leadership ${data.skillRating.leadership}/5, Persistence ${data.skillRating.persistence}/5
YOUR COMPETITIVE ADVANTAGE: ${data.yourAdvantage}

Provide a detailed analysis with these sections:

## Executive Summary
Strategic assessment of this intrapreneur's innovation approach, stakeholder positioning, and key strengths/weaknesses. Include specific insights about their competitive positioning within their organization and industry.

## Competitive Positioning Analysis
Provide strategic competitive intelligence:
- **Organizational Position:** Where they stand in the internal innovation landscape
- **Vulnerable Weaknesses:** Their biggest strategic gaps you can exploit
- **Defensive Strengths:** What they do well that you need to match or exceed
- **Influence Capture:** Tactical strategies to gain more organizational support
- **Response Capability:** How likely they can counter your competitive moves

## Innovation Strategy Analysis
- What makes their approach stand out in their industry
- How their initiative frequency affects their impact
- Project type strategy and effectiveness
- Collaboration methods and stakeholder interaction patterns
- **Innovation gaps** where they're underserving organizational needs

## Stakeholder Engagement Deep Dive
- Stakeholder analysis: ${data.targetStakeholders.join(', ')}
- How well their initiatives resonate with key decision-makers
- Stakeholder retention and support potential
- **Untapped stakeholder segments** you can engage
- **Stakeholder acquisition tactics** to build stronger relationships

## Intrapreneurial Skill Assessment
- **Innovation & Creativity**: ${data.skillRating.innovation}/5 - analyze their innovative thinking
- **Execution & Delivery**: ${data.skillRating.execution}/5 - assess their implementation capabilities
- **Leadership & Influence**: ${data.skillRating.leadership}/5 - evaluate their ability to lead change
- **Persistence & Resilience**: ${data.skillRating.persistence}/5 - analyze their ability to overcome obstacles
- Overall intrapreneurial strengths and gaps
- **Specific skill benchmarks** you must exceed to excel

## Unique Approach & Innovation Style
${data.uniqueApproach}
Analyze their unique positioning and how it creates competitive advantages in their organization.

## Weakness Exploitation Strategy
**Identified Weaknesses:** ${data.weaknesses}

For each section below, provide COMPLETE, DETAILED tactical strategies. CRITICAL: Every numbered item MUST include a full explanation.

**Primary Opportunity Vectors:**
Provide 3-5 specific weaknesses to exploit immediately. For each point, include:
• The exact weakness (what it is)
• Why this makes them strategically vulnerable
• Concrete steps on how to exploit this weakness

**Quick Strike Tactics:**
Provide 3-5 actions you can take THIS WEEK to outperform them. For each numbered point, include:
• The specific actionable tactic
• Why this will be effective against their current strategy
• Implementation details or next steps
**CRITICAL: You MUST provide complete descriptions for all numbered items. Do not truncate or leave any tactic incomplete.**

**Gap Exploitation:**
How to capitalize on areas where they fail. For each point:
• The specific gap they leave open
• How you can fill this gap better than them
• The competitive advantage this creates for you

**Tactical Positioning:**
Strategies that highlight their flaws while showcasing your strengths. For each point:
• The specific initiative angle or positioning move
• How this contrasts with their weaknesses
• How it elevates your reputation in comparison

## Superior Innovation Strategies to Excel
Based on analyzing their approach, create a strategic plan:
- **Project angles they miss** - Initiatives and perspectives you should pursue
- **Project types they underutilize** - Areas where you can excel
- **Initiative frequency advantages** - How to be more proactive or deliver higher quality
- **Niche depth opportunities** - Underserved areas you can own
- **Cross-functional opportunities** - Departments or teams they ignore that you can engage

## Value Creation Intelligence
**Current Value Creation:** ${data.valueCreation.join(', ')}
- Sophistication of their value delivery strategy
- Value stream diversification analysis
- **Value creation gaps** they're leaving on the table
- **Higher-impact value creation strategies** you can implement
- **Strategic positioning tactics** to demonstrate greater organizational impact
- **Value capture timeline** - When you can realistically deliver more value

## Collaboration Strategy Analysis
**Methods Used:** ${data.collaborationMethods.join(', ')}
- Effectiveness of their collaboration approach
- Stakeholder interaction patterns
- Relationship building strengths and gaps
- **Superior collaboration tactics** to build stronger stakeholder relationships
- **Network building strategies** to create more influential connections
- **Collaboration opportunities** where you can outperform their metrics

## Strategic Differentiation Roadmap
Based on your advantage: "${data.yourAdvantage}"
- How to position yourself as the **definitive superior** intrapreneur
- Unique value propositions to emphasize and own
- Initiative strategies to win and convert stakeholder support
- **Competitive moat building** - How to create advantages they can't replicate
- **Response planning** - How to react when they copy your strategies

## 15 Specific Tactics to Excel as an Intrapreneur
Provide a single numbered list of 15 highly actionable, immediately implementable tactics:

Use this format:
1. [First innovation initiative tactic]
2. [Second innovation initiative tactic]
3. [Third innovation initiative tactic]
4. [Fourth innovation initiative tactic]
5. [Fifth innovation initiative tactic]
6. [First stakeholder engagement tactic]
7. [Second stakeholder engagement tactic]
8. [Third stakeholder engagement tactic]
9. [First collaboration domination tactic]
10. [Second collaboration domination tactic]
11. [Third collaboration domination tactic]
12. [First value creation tactic]
13. [Second value creation tactic]
14. [First organizational positioning tactic]
15. [Second organizational positioning tactic]

Cover: 5 innovation initiative strategies, 3 stakeholder engagement strategies, 3 collaboration tactics, 2 value creation strategies, and 2 organizational positioning strategies. Use ONE continuous numbered list from 1 to 15. **CRITICAL: You MUST complete all 15 items. Do not truncate or cut off the list.**

## Strategic Timeline & Priorities

**Week 1-2: Quick Impact Moves**
- Immediate initiative wins you can execute
- Low-hanging fruit in their weaknesses
- Fast stakeholder support capture opportunities

**Month 1: Defensive Positioning**
- Strengthening your competitive moat
- Matching or exceeding their strengths
- Building stakeholder loyalty

**Months 2-3: Organizational Leadership**
- Becoming the authority they can't match
- Owning specific initiative angles they ignore
- Developing unique positioning they can't replicate

**Months 4-6: Organizational Excellence**
- Establishing as the dominant intrapreneur in your area
- Diversifying beyond their capabilities
- Building systems that scale beyond their operation

## Competitive Intelligence Framework

**Daily Monitoring Checklist**
- Key metrics to track: ${data.intrapreneurName}
- Red flags that signal they're adapting to your strategy
- Initiative performance indicators to watch
- Stakeholder sentiment shifts to detect

**Weekly Competitive Analysis**
- Project themes they're testing
- New collaboration methods they're trying
- Value creation changes to watch for
- Stakeholder relationship shifts

**Monthly Strategic Review**
- Organizational influence changes
- New competitive threats
- Opportunity gaps to exploit
- Strategic pivot recommendations

## Winning Action Plan Summary
**Your Path to Excellence:**
1. **Immediate Actions (This Week):** List 3-5 things to do right now
2. **30-Day Game Plan:** Specific objectives to achieve in the next month
3. **90-Day Leadership Strategy:** How to establish organizational leadership
4. **6-Month Vision:** Becoming the undisputed intrapreneurial authority in your organization

Be specific, data-driven, and actionable. Focus on measurable intrapreneurial success metrics and strategic insights that drive real competitive advantage within corporate environments.

**MANDATORY: Complete ALL sections fully. Do not truncate any lists. Ensure the "15 Specific Tactics" section has exactly 15 complete items numbered 1-15.**

CRITICAL FORMATTING REQUIREMENTS:
- **ALWAYS format content using bullet points with bold key terms**
- Use this format: • **Bold Term:** Description or analysis
- **Example:** • **Innovation Capability:** Strong creative thinking with ability to identify market opportunities
- **DO NOT write long paragraphs.** Use concise bullet points with bold terms
- Each section should use bullet points throughout, not paragraph blocks
- Use numbered lists (1., 2., 3.) only for sequential steps or rankings
- **IMPORTANT:** When creating subsections within a section, use bullet points (•) not numbered lists to avoid duplicate numbering
- Keep each bullet point to 2-3 short sentences maximum
- Break complex ideas into multiple bullet points
- Make content scannable and visually consistent across all sections
`

  try {
    // Set timeout to 60 seconds (reduced from 120 for faster response)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout after 60 seconds')), 60000)
    })
    
    console.log('Starting Gemini API call...')
    console.log('⏱️ Timeout set to 60 seconds')
    
    // Start the API call
    const analysisPromise = model.generateContent(prompt)
    
    // Wait for either the result or timeout (whichever comes first)
    const result = await Promise.race([analysisPromise, timeoutPromise])
    const response = result.response
    const text = response.text()
    
    console.log('✅ Gemini API response received, length:', text.length)
    console.log('⏱️ Analysis completed successfully')
    return text
  } catch (error: any) {
    console.error('❌ Gemini API error:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    
    // Return a fallback analysis if API fails - but make it clear it's a fallback
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      console.log('API timed out, using fallback analysis')
      return generateFallbackAnalysis(data) + '\n\n⚠️ **Note:** This is a fallback analysis. The API request timed out. Please try again or check your connection.'
    }
    
    // Check for API key issues
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication') || error.message?.includes('401') || error.message?.includes('403')) {
      console.error('API key issue detected:', error.message)
      return generateFallbackAnalysis(data) + '\n\n⚠️ **Note:** This is a fallback analysis. Please check your GEMINI_API_KEY in .env.local'
    }
    
    console.log('Using fallback analysis due to error:', error.message)
    return generateFallbackAnalysis(data) + '\n\n⚠️ **Note:** This is a fallback analysis. An error occurred: ' + (error.message || 'Unknown error')
  }
}

function generateFallbackAnalysis(data: QuestionnaireData): string {
  return `# Intrapreneur Analysis for ${data.intrapreneurName}

## Executive Summary
This intrapreneur operates in the **${data.companyIndustry}** industry and targets **${data.targetStakeholders.join(', ')}** stakeholders.

**Key Details:**
• Company industry: ${data.companyIndustry}
• Target stakeholders: ${data.targetStakeholders.join(', ')}
• Initiative frequency: ${data.initiativeFrequency}
• Project types: ${data.projectTypes.join(', ')}
• Unique approach: ${data.uniqueApproach}
• Weaknesses: ${data.weaknesses}
• Collaboration methods: ${data.collaborationMethods.join(', ')}
• Value creation: ${data.valueCreation.join(', ')}
• Skill ratings: Innovation ${data.skillRating.innovation}/5, Execution ${data.skillRating.execution}/5, Leadership ${data.skillRating.leadership}/5, Persistence ${data.skillRating.persistence}/5
• Your advantage: ${data.yourAdvantage}

## Innovation Strategy Analysis
This intrapreneur focuses on ${data.companyIndustry} initiatives targeting ${data.targetStakeholders.join(', ')}. Their initiative frequency is ${data.initiativeFrequency} and they lead ${data.projectTypes.join(', ')} projects.

## Competitive Insights
Their unique approach is: ${data.uniqueApproach}

**Areas to exploit:**
${data.weaknesses ? `• ${data.weaknesses.split('\n').join('\n• ')}` : '• Limited weaknesses identified'}

**Your Competitive Advantage:**
${data.yourAdvantage || 'Not specified'}

## Recommendations
1. Focus on improving your ${data.skillRating.innovation < 4 ? 'innovation capabilities' : 'execution skills'}
2. ${data.skillRating.execution < 4 ? 'Enhance your execution skills to match their level' : 'Continue delivering high-impact initiatives'}
3. Leverage your advantage: ${data.yourAdvantage || 'Build on your unique strengths'}
4. Explore additional value creation strategies beyond ${data.valueCreation.join(', ')}
5. Improve collaboration through ${data.collaborationMethods.length > 0 ? 'better implementation of' : ''} ${data.collaborationMethods.join(', ') || 'direct stakeholder engagement'}

*This is a fallback analysis. For more detailed AI-powered insights, ensure your GEMINI_API_KEY is configured.*`
}
