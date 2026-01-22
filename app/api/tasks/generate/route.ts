import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60 // 60 seconds for task generation

export async function POST(request: NextRequest) {
  try {
    const { onboardingData } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro'
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.8')

    // Extract onboarding data
    const businessName = onboardingData?.businessName || 'their business'
    const industry = Array.isArray(onboardingData?.industry) 
      ? onboardingData.industry[0] 
      : onboardingData?.industry || 'General'
    const businessStage = Array.isArray(onboardingData?.businessStage) 
      ? onboardingData.businessStage[0] 
      : onboardingData?.businessStage || 'Early Stage'
    const challenges = Array.isArray(onboardingData?.challenges) 
      ? onboardingData.challenges 
      : (onboardingData?.challenges ? [onboardingData.challenges] : [])
    const revenueGoal = Array.isArray(onboardingData?.revenueGoal) 
      ? onboardingData.revenueGoal[0] 
      : onboardingData?.revenueGoal
    const biggestGoal = Array.isArray(onboardingData?.biggestGoal)
      ? onboardingData.biggestGoal[0] 
      : onboardingData?.biggestGoal
    const targetMarket = Array.isArray(onboardingData?.targetMarket) 
      ? onboardingData.targetMarket[0] 
      : onboardingData?.targetMarket
    const teamSize = Array.isArray(onboardingData?.teamSize) 
      ? onboardingData.teamSize[0] 
      : onboardingData?.teamSize
    const monthlyRevenue = Array.isArray(onboardingData?.monthlyRevenue) 
      ? onboardingData.monthlyRevenue[0] 
      : onboardingData?.monthlyRevenue
    const primaryRevenue = Array.isArray(onboardingData?.primaryRevenue) 
      ? onboardingData.primaryRevenue[0] 
      : onboardingData?.primaryRevenue
    const growthStrategy = Array.isArray(onboardingData?.growthStrategy) 
      ? onboardingData.growthStrategy[0] 
      : onboardingData?.growthStrategy

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    })

    const prompt = `You are a business productivity AI assistant. Generate personalized tasks for an entrepreneur based on their onboarding information.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Business Stage: ${businessStage}
- Biggest Goal: ${biggestGoal || 'Not specified'}
- Revenue Goal: ${revenueGoal || 'Not specified'}
- Monthly Revenue: ${monthlyRevenue || 'Not specified'}
- Primary Revenue Source: ${primaryRevenue || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}
- Team Size: ${teamSize || 'Not specified'}
- Growth Strategy: ${growthStrategy || 'Not specified'}
- Challenges: ${challenges.length > 0 ? challenges.join(', ') : 'Not specified'}

Generate comprehensive, actionable tasks organized by frequency. Make them SPECIFIC to this business, industry, and stage.

REQUIREMENTS - GENERATE TASKS (MAXIMUM 15 PER CATEGORY):
1. Daily Tasks: Generate EXACTLY 15 tasks (no more, no less) that should be done every day. Include tasks like:
   - DM 5-10 people on LinkedIn in your industry
   - Post on social media (LinkedIn, Twitter, Instagram)
   - Reach out to 3-5 potential customers via email
   - Review daily metrics and KPIs
   - Follow up with leads from yesterday
   - Engage with comments on your posts
   - Research 2-3 potential clients
   - Update CRM with new contacts
   - Send thank you messages to new connections
   - Check and respond to customer inquiries
   - Share valuable content in industry groups
   - Track competitor activity
   - Update your website/blog
   - Review and optimize ad campaigns
   - Plan tomorrow's priorities

2. Weekly Tasks: Generate EXACTLY 15 tasks (no more, no less) that should be done weekly. Include tasks like:
   - Network with 10-15 industry professionals
   - Analyze competitor activity and strategies
   - Review customer feedback and testimonials
   - Create and schedule social media content
   - Write blog posts or articles
   - Attend networking events or webinars
   - Review and optimize marketing campaigns
   - Conduct team meetings and check-ins
   - Analyze weekly revenue and expenses
   - Plan content calendar for next week
   - Reach out to potential partners
   - Review and update business processes
   - Research new market opportunities
   - Update website and online presence
   - Review and respond to all customer inquiries

3. Monthly Tasks: Generate EXACTLY 15 tasks (no more, no less) that should be done monthly. Include:
   - Strategic business review and planning
   - Financial review and budget planning
   - Customer feedback analysis and surveys
   - Team performance reviews
   - Marketing campaign analysis
   - Product/service improvements
   - Industry trend research
   - Competitor deep-dive analysis
   - Revenue optimization strategies
   - Process improvement initiatives
   - Partnership evaluations
   - Technology and tool assessments
   - Content strategy planning
   - Customer retention analysis
   - Goal setting for next month

4. Yearly Tasks: Generate EXACTLY 15 tasks (no more, no less) that should be done annually. Include:
   - Annual business planning and goal setting
   - Comprehensive performance review
   - Long-term vision and roadmap (3-5 years)
   - Financial audit and tax preparation
   - Team structure and hiring plan
   - Market expansion strategy
   - Technology infrastructure review
   - Brand positioning and messaging review
   - Customer success and retention strategy
   - Competitive landscape analysis
   - Investment and funding strategy
   - Legal and compliance review

5. Mini Wins: Generate EXACTLY 3 quick tasks (2-5 minutes each) that can be done daily for quick wins. Examples:
   - Send one thank you message to a customer
   - Engage with 3 posts in your niche
   - Write down one business idea
   - Research one competitor
   - Update one social media bio

6. Daily Quests: Generate EXACTLY 4 quests that track daily progress. Examples:
   - Complete 3 tasks today
   - Earn 50 XP
   - Complete 2 high-impact tasks
   - Maintain a 5-day streak

Each task must have:
- A clear, actionable title (be specific, not generic)
- A detailed description explaining what to do and why
- Priority level: "high", "medium", or "low"
- Category: One of "Sales", "Marketing", "Operations", "Finance", "Strategy", "Team", "Product", "Customer Success", "Analytics", "Networking", "Planning"

Mini Wins must have:
- A quick actionable title (2-5 minutes to complete)
- A brief description
- Priority: "easy"
- Category: Same as tasks above
- Time: "2-5 min"

Quests must have:
- A clear quest title
- A description of what needs to be achieved
- Target: A number (e.g., 3 tasks, 50 XP)
- Reward: Points earned (e.g., 25, 30, 40)
- Type: "tasks", "xp", "streak", or "performance"

Make tasks:
- Specific to their industry and business stage
- Actionable and measurable
- Aligned with their biggest goal and challenges
- Realistic for their team size
- Progressive (daily tasks build toward weekly, weekly toward monthly, etc.)
- Include common entrepreneur tasks like: LinkedIn outreach, social media posting, customer follow-ups, competitor research, networking, content creation, email marketing, etc.
- Be VERY comprehensive - entrepreneurs need many actionable tasks to stay productive

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "daily": [
    {
      "title": "Specific actionable task title",
      "description": "Detailed description of what to do and why it matters",
      "priority": "high|medium|low",
      "category": "Sales|Marketing|Operations|Finance|Strategy|Team|Product|Customer Success|Analytics|Networking|Planning"
    }
  ],
  "weekly": [...],
  "monthly": [...],
  "yearly": [...],
  "miniWins": [
    {
      "title": "Quick 2-5 minute actionable task",
      "description": "Brief description",
      "priority": "easy",
      "category": "Sales|Marketing|Operations|Finance|Strategy|Team|Product|Customer Success|Analytics|Networking|Planning",
      "time": "2-5 min"
    }
  ],
  "quests": [
    {
      "title": "Daily quest title",
      "description": "Quest description",
      "target": 3,
      "reward": 25,
      "type": "tasks|xp|streak|performance"
    }
  ]
}

Generate tasks, mini wins, and quests that are truly personalized to this specific business, not generic templates.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      
      // Parse JSON from response (handle markdown code blocks if present)
      let jsonString = response.trim()
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n?/g, '')
      }
      
      const tasks = JSON.parse(jsonString)
      
      // Validate structure (miniWins and quests are optional)
      if (!tasks.daily || !tasks.weekly || !tasks.monthly || !tasks.yearly) {
        throw new Error('Invalid task structure from AI')
      }
      
      // Ensure miniWins and quests exist (generate defaults if missing)
      if (!tasks.miniWins || !Array.isArray(tasks.miniWins)) {
        tasks.miniWins = []
      }
      if (!tasks.quests || !Array.isArray(tasks.quests)) {
        tasks.quests = []
      }

      // Limit to maximum 15 tasks per category
      const limitTasks = (taskList: any[], maxCount: number = 15) => {
        return Array.isArray(taskList) ? taskList.slice(0, maxCount) : []
      }

      // Add IDs and metadata to each task
      const addMetadata = (taskList: any[], type: string) => {
        // Ensure we only take first 15 tasks
        const limitedTasks = limitTasks(taskList, 15)
        return limitedTasks.map((task, index) => ({
          id: `${type}-${index + 1}`,
          title: task.title,
          description: task.description,
          type: type,
          priority: task.priority || 'medium',
          category: task.category || 'General',
          completed: false,
          createdAt: new Date()
        }))
      }

      // Format mini wins
      const formatMiniWins = (miniWinsList: any[]) => {
        const limited = limitTasks(miniWinsList || [], 3)
        return limited.map((win, index) => ({
          id: index + 1,
          title: win.title,
          description: win.description || '',
          completed: false,
          points: 25,
          time: win.time || '5 min',
          category: win.category?.toLowerCase() || 'general',
          difficulty: 'easy' as const
        }))
      }

      // Format quests
      const formatQuests = (questsList: any[]) => {
        const limited = limitTasks(questsList || [], 4)
        return limited.map((quest, index) => ({
          id: `quest-${index + 1}`,
          title: quest.title,
          description: quest.description || '',
          current: 0,
          target: quest.target || 3,
          completed: false,
          reward: quest.reward || 25,
          type: quest.type || 'tasks'
        }))
      }

      const formattedTasks = {
        daily: addMetadata(tasks.daily, 'daily'),
        weekly: addMetadata(tasks.weekly, 'weekly'),
        monthly: addMetadata(tasks.monthly, 'monthly'),
        yearly: addMetadata(tasks.yearly, 'yearly')
      }

      const formattedMiniWins = formatMiniWins(tasks.miniWins || [])
      const formattedQuests = formatQuests(tasks.quests || [])

      return NextResponse.json({ 
        tasks: formattedTasks,
        miniWins: formattedMiniWins,
        quests: formattedQuests
      })
    } catch (parseError: any) {
      console.error('Error parsing AI response:', parseError)
      console.error('Response was:', parseError.message)
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: parseError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error generating tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks', details: error.message },
      { status: 500 }
    )
  }
}

