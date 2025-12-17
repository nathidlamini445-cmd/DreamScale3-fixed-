import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { onboardingData, requestDifferent } = await request.json()

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
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16384')
    const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.8')

    // Extract onboarding data comprehensively
    const businessName = onboardingData?.businessName || 'their business'
    const industry = Array.isArray(onboardingData?.industry) 
      ? onboardingData.industry[0] 
      : onboardingData?.industry
    const businessStage = Array.isArray(onboardingData?.businessStage) 
      ? onboardingData.businessStage[0] 
      : onboardingData?.businessStage
    const challenges = Array.isArray(onboardingData?.challenges) 
      ? onboardingData.challenges 
      : (onboardingData?.challenges ? [onboardingData.challenges] : [])
    const targetMarket = Array.isArray(onboardingData?.targetMarket) 
      ? onboardingData.targetMarket[0] 
      : onboardingData?.targetMarket
    const revenueGoal = Array.isArray(onboardingData?.revenueGoal) 
      ? onboardingData.revenueGoal[0] 
      : onboardingData?.revenueGoal
    const teamSize = Array.isArray(onboardingData?.teamSize) 
      ? onboardingData.teamSize[0] 
      : onboardingData?.teamSize
    const monthlyRevenue = Array.isArray(onboardingData?.monthlyRevenue) 
      ? onboardingData.monthlyRevenue[0] 
      : onboardingData?.monthlyRevenue
    const biggestGoal = Array.isArray(onboardingData?.biggestGoal) 
      ? onboardingData.biggestGoal[0] 
      : onboardingData?.biggestGoal
    const primaryRevenue = Array.isArray(onboardingData?.primaryRevenue) 
      ? onboardingData.primaryRevenue[0] 
      : onboardingData?.primaryRevenue
    const customerAcquisition = Array.isArray(onboardingData?.customerAcquisition) 
      ? onboardingData.customerAcquisition[0] 
      : onboardingData?.customerAcquisition
    const growthStrategy = Array.isArray(onboardingData?.growthStrategy) 
      ? onboardingData.growthStrategy[0] 
      : onboardingData?.growthStrategy
    const keyMetrics = Array.isArray(onboardingData?.keyMetrics) 
      ? onboardingData.keyMetrics[0] 
      : onboardingData?.keyMetrics
    const name = onboardingData?.name || ''

    // Build context for AI
    let contextPrompt = `You are Bizora AI, an expert business consultant. Generate 5 highly personalized, actionable recommendations for an entrepreneur based on their onboarding data.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Entrepreneur Name: ${name || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Business Stage: ${businessStage || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}
- Current Monthly Revenue: ${monthlyRevenue || 'Not specified'}
- Revenue Goal: ${revenueGoal || 'Not specified'}
- Team Size: ${teamSize || 'Not specified'}
- Primary Revenue Model: ${primaryRevenue || 'Not specified'}
- Customer Acquisition Method: ${customerAcquisition || 'Not specified'}
- Growth Strategy: ${growthStrategy || 'Not specified'}
- Key Metrics: ${keyMetrics || 'Not specified'}
- Biggest Goal (6 months): ${biggestGoal || 'Not specified'}
- Main Challenges: ${challenges.length > 0 ? challenges.join(', ') : 'Not specified'}

AVAILABLE FEATURES IN THE APP:
1. Revenue Intelligence (/revenue-intelligence) - Revenue analysis, tracking, optimization
2. Systems (/revenue?tab=systems) - Process documentation, system building, templates
3. Teams (/teams) - Team management, role documentation, team optimization
4. Leadership (/marketplace) - Leadership coaching, decision-making frameworks
5. Bizora AI (/bizora) - AI-powered business insights and research
6. Discover (/discover) - Market research, competitor intelligence
7. Revenue (/revenue) - Revenue tracking and analysis

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5 recommendations - NO MORE, NO LESS
2. Each recommendation MUST be HIGHLY PERSONALIZED - use their business name, industry, challenges, and specific data throughout
3. Make recommendations COMPLETELY DIFFERENT for each user - if two users have different challenges, industries, or stages, they should get DIFFERENT recommendations
${requestDifferent ? '4. IMPORTANT: This is a request for DIFFERENT recommendations. Generate COMPLETELY NEW and DIFFERENT recommendations from any previous ones. Focus on different aspects, different features, different priorities, and different approaches. Vary the categories, vary the focus areas, and provide fresh perspectives.' : '4. Each recommendation MUST reference a specific feature in the app (use the feature names and links above)'}
5. PRIORITIZE their MAIN CHALLENGES - if they mentioned "finding customers", make that the #1 priority recommendation
6. Use their SPECIFIC DATA - reference their revenue goal, team size, industry, target market, etc. in the recommendations
${requestDifferent ? '7. VARIATION REQUIRED: If generating different recommendations, explore different angles: different business areas (operations vs marketing vs finance vs team), different time horizons (immediate vs long-term), different risk levels (safe bets vs bold moves), and different feature combinations.' : ''}
    7. Make explanations VERY DETAILED and comprehensive (8-12 sentences) - explain the WHY, the HOW, and the WHAT in depth. Some users are older and need clear, thorough guidance. Treat each explanation as a comprehensive lesson.
    8. Make "howToStart" steps EXTREMELY DETAILED and EDUCATIONAL - each step should be a COMPREHENSIVE MINI-TUTORIAL (8-12 sentences per step). NOT just "go to Systems" but a complete, deep walkthrough with explanations embedded WITHIN each step:
       - Step 1: Define WHAT the concept is in detail WITH DEEP EXPLANATION (8-12 sentences). Example: "A system is a documented process that allows your business to run without you. Think of it like a recipe - anyone can follow it and get the same result. It's a set of clear instructions that turn chaos into consistency. For ${businessName}, this means your team of ${teamSize || 'X'} people can handle tasks the same way every time, even when you're not there. But what exactly makes something a 'system'? A system has three key components: clear steps (anyone can follow them), documented process (written down, not just in your head), and repeatable outcome (same result every time). Without all three, you have a process but not a system. For example, if you know how to handle customer complaints but haven't written it down, that's knowledge, not a system. If you've written it down but the steps are unclear, that's documentation, not a system. A true system means someone new could read your documentation and handle a customer complaint exactly as you would. This is powerful because it means your business can grow beyond your personal capacity. For ${businessName}, this is especially important because [specific reason based on their challenges and team size]."
       - Step 2: Explain WHY this matters for their SPECIFIC business WITH DEEP EXPLANATION (8-12 sentences). Include specific examples, scenarios, and consequences: "For ${businessName} in ${industry || 'your industry'}, systems are critical because [specific reason based on their challenges]. Without systems, you'll face [specific problem they mentioned]. With systems, you'll achieve [specific benefit related to their goals]. Let me break this down with concrete examples: When you don't have systems, every task requires your personal attention. This means if you're handling customer service, you can't take a day off without things falling apart. If you're managing inventory, you have to be there to ensure it's done right. This creates a bottleneck - you become the limiting factor in your business growth. But with systems, you can delegate confidently. For instance, if ${businessName} has a system for handling returns, your team can process returns without asking you questions every time. This frees you up to focus on growth activities like finding new customers or developing new products. Here's a real scenario: Imagine you want to hire someone to handle customer inquiries. Without a system, you'd have to train them personally, answer questions constantly, and worry they're not doing it right. With a system, you give them the documentation, they follow it, and you can check their work against the expected outcome. This is how businesses scale from solo operations to teams. For ${businessName} specifically, systems will help you [specific benefit based on their goals and challenges]."
       - Step 3: Explain HOW to think about it - the mindset and approach WITH DEEP EXPLANATION (8-12 sentences): "Start by thinking about the tasks you do repeatedly. These are prime candidates for systems. Ask yourself: 'What do I do that someone else could do if I wrote it down?' For ${businessName}, this might include [specific examples based on their business]. But here's the deeper thinking: Not every task needs to be a system. Focus on tasks that are: Done frequently (daily or weekly), Important to your business (affects revenue or customer satisfaction), Currently dependent on you (you have to do it personally), or Prone to mistakes when done inconsistently. For example, if you spend 2 hours every Monday preparing weekly reports, that's a perfect candidate for a system. If you only do something once a year, it might not be worth systemizing. The mindset shift is this: Instead of thinking 'I need to do this task,' think 'How could this task be done consistently without me?' This changes everything. You start seeing opportunities everywhere. That email you send to new customers? That could be a system. The way you process orders? That's definitely a system. The way you onboard new team members? That's a critical system. For ${businessName}, start by listing all the tasks you do in a typical week. Then identify which ones take the most time or cause the most stress. Those are your priority systems. Don't try to systemize everything at once - that's overwhelming. Pick 2-3 tasks and start there."
       - Step 4-12: Each step must be 8-12 sentences with DEEP EXPLANATION embedded within:
         * Start with WHAT to do (the action)
         * Then explain HOW to do it in detail (step-by-step breakdown)
         * Explain WHY each part matters (the reasoning)
         * Explain WHAT to expect (outcomes, what you'll see)
         * Include WHERE to find things (navigation, locations)
         * Explain WHAT information you need (prerequisites)
         * Include HOW to handle common issues (troubleshooting)
         * Explain HOW to know if you're doing it right (validation)
         * Include examples specific to ${businessName}
         * Address common mistakes and how to avoid them
         * Explain what success looks like at this step
         * Connect to the next step (how this leads to the next action)
    9. For team-related recommendations, provide COMPREHENSIVE guidance:
       - Explain WHAT makes a good team structure (with examples for their team size)
       - Explain HOW to define roles properly (step-by-step with templates)
       - Explain HOW to communicate effectively (specific techniques and tools)
       - Explain WHAT delegation means and HOW to do it (with examples)
       - Explain HOW to build trust and accountability
       - Include specific examples for ${businessName}'s situation
    10. For system-related recommendations, provide COMPREHENSIVE guidance:
       - Explain WHAT systems are (detailed definition with examples)
       - Explain HOW to document them (step-by-step documentation process)
       - Explain WHY documentation matters (with real-world examples)
       - Explain HOW to make them scalable (specific techniques)
       - Include templates and examples relevant to ${businessName}
    11. For revenue-related recommendations, provide COMPREHENSIVE guidance:
       - Explain HOW revenue works (detailed breakdown)
       - Explain WHAT metrics matter and WHY (for their industry and stage)
       - Explain HOW to track them (step-by-step tracking process)
       - Explain WHY each metric is important (with examples)
       - Explain HOW to analyze revenue data (interpretation guide)
       - Include specific examples for ${businessName}'s revenue model
    12. Vary the categories and features - don't give 5 recommendations all about the same thing
    13. Consider their business stage - if they're in "Idea/Planning", focus on validation. If "Scaling", focus on systems.
    14. Each "howToStart" array MUST contain 10-15 detailed steps. Each step should be 3-5 sentences explaining WHAT, HOW, WHY, and WHAT TO EXPECT.

OUTPUT FORMAT (JSON array):
[
  {
    "id": "unique-id-1",
    "title": "Specific, personalized title for ${businessName}",
    "description": "Brief description of what they should do",
    "explanation": "VERY DETAILED explanation (8-12 sentences) that explains WHAT the concept is, WHY it matters, and HOW it works. Reference their industry, challenges, and business stage. Make it comprehensive and easy to understand for all users, including older users who need thorough guidance. This should read like a complete educational lesson.",
    "whyItMatters": "Why this specific recommendation matters for ${businessName} given their context (5-7 sentences with deep explanation, specific examples, and clear connection to their goals and challenges)",
    "howToStart": [
      "Step 1: Define the concept in EXTREME DETAIL (8-12 sentences). Explain WHAT it is deeply, use multiple analogies, give comprehensive examples, and explain the components. For example: 'A system is a documented process that allows your business to run without you. Think of it like a recipe - anyone can follow it and get the same result, just like anyone can bake a cake if they follow the recipe exactly. But it's also like a map - it shows you the path from where you are to where you want to be, step by step. It's a set of clear instructions that turn chaos into consistency. For ${businessName}, this means your team of ${teamSize || 'X'} people can handle tasks the same way every time, even when you're not there. But what exactly makes something a 'system' versus just a process? A system has three essential components: First, clear steps that anyone can follow (not just you who has all the context in your head). Second, it's documented - written down, saved, accessible to others. Third, it produces a repeatable outcome - same result every time, regardless of who follows it. Without all three components, you might have knowledge or a process, but not a true system. For example, if you know how to handle customer complaints but haven't written it down, that's knowledge locked in your head. If you've written it down but the steps are vague or unclear, that's incomplete documentation. A true system means someone completely new could read your documentation and handle a customer complaint exactly as you would, with the same quality and outcome. This is powerful because it means your business can grow beyond your personal capacity. Without systems, every task requires your personal attention, which creates a bottleneck - you become the limiting factor in your business growth. For ${businessName}, this is especially critical because [specific reason based on their challenges, team size, and goals].'",
      "Step 2: Explain WHY this matters for their SPECIFIC business with DEEP, COMPREHENSIVE EXPLANATION (8-12 sentences). Include specific examples, scenarios, consequences, and benefits: 'For ${businessName} in ${industry || 'your industry'}, systems are critical because [specific reason based on their challenges]. Without systems, you'll face [specific problem they mentioned] which will prevent you from achieving [their specific goals]. With systems, you'll achieve [specific benefit related to their goals]. Let me break this down with concrete, real-world examples: When you don't have systems, every task requires your personal attention and decision-making. This means if you're handling customer service inquiries, you can't take a day off without things falling apart or customers getting inconsistent responses. If you're managing inventory for ${businessName}, you have to be there personally to ensure orders are processed correctly, products are in stock, and shipments go out on time. This creates a bottleneck - you become the limiting factor in your business growth. You can't scale because scaling would mean you'd have to personally handle more tasks, which isn't sustainable. But with systems, you can delegate confidently. For instance, if ${businessName} has a well-documented system for handling customer returns, your team can process returns without asking you questions every time. They know exactly what to check, what information to gather, when to approve or deny, and how to process the return. This frees you up to focus on growth activities like finding new customers, developing new products, or building partnerships. Here's a real scenario: Imagine you want to hire someone to handle customer inquiries for ${businessName}. Without a system, you'd have to train them personally through shadowing, answer their questions constantly, and worry they're not handling situations the way you would. This takes weeks or months of your time. With a system, you give them the documentation, they study it, you do a quick review together, and they can start handling inquiries independently. You can check their work against the expected outcomes in the system. This is how businesses scale from solo operations to teams. For ${businessName} specifically, systems will help you [specific benefit based on their goals, challenges, and business stage]. For example, if your goal is to ${biggestGoal || 'grow revenue'}, systems will free up your time to focus on revenue-generating activities instead of operational tasks.'",
      "Step 3: Explain HOW to think about it - the mindset and approach with COMPREHENSIVE GUIDANCE (8-12 sentences): 'Start by thinking about the tasks you do repeatedly in your business. These are prime candidates for systems because they're done often enough that systemizing them will save significant time. Ask yourself: What do I do that someone else could do if I wrote it down clearly? For ${businessName}, this might include [specific examples based on their business type, industry, and current operations]. But here's the deeper thinking you need to develop: Not every task needs to be a system, and trying to systemize everything at once will overwhelm you. Focus on tasks that meet these criteria: They're done frequently (daily or weekly, not once a year), they're important to your business (affect revenue, customer satisfaction, or operational efficiency), they're currently dependent on you (you have to do them personally or be involved), or they're prone to mistakes when done inconsistently (quality varies based on who does it). For example, if you spend 2 hours every Monday preparing weekly sales reports for ${businessName}, that's a perfect candidate for a system. You could document exactly what data to pull, where to find it, how to format it, and who to send it to. Once systemized, this could take 15 minutes instead of 2 hours, or someone else could do it entirely. On the other hand, if you only do something once a year (like annual tax preparation), it might not be worth creating a full system - though you might still document the key steps. The mindset shift is this: Instead of thinking 'I need to do this task,' start thinking 'How could this task be done consistently without me?' This changes everything. You start seeing opportunities everywhere. That email template you send to new customers? That could be a system. The way you process and fulfill orders? That's definitely a system. The way you onboard new team members? That's a critical system that will save you hours as you grow. For ${businessName}, start by listing all the tasks you do in a typical week. Write them down - don't just think about them. Then identify which ones take the most time or cause the most stress when they're not done right. Those are your priority systems. Don't try to systemize everything at once - that's overwhelming and you'll give up. Pick 2-3 tasks and start there. Once those are working well, add 2-3 more.'",
      "Step 4: Give the first actionable step with EXTREMELY DETAILED explanation (8-12 sentences). Include navigation, what you'll see, how to use it: 'Navigate to the Systems section by clicking on Systems in the left sidebar menu (you can also go directly to /revenue?tab=systems by typing it in your browser). The left sidebar is the vertical menu on the left side of your screen - look for the icon that looks like gears or settings, with the word Systems next to it. When you click it, the page will load and you'll see the Systems interface. This is where you'll document all your business processes. When you first open it, you'll see a clean, organized interface designed to help you build systems step-by-step. Take a moment to explore the layout - you'll notice there are typically several sections or tabs: one for creating new systems, one for viewing existing systems, one for templates, and possibly one for system categories. You'll see options to create new systems, view existing ones, and browse templates. The interface is designed to be intuitive, but don't worry if it feels new - you'll get comfortable with it quickly. Look for a button that says something like Create New System or + New System - this is how you'll start building your first system. Before you click it, take a look at any existing systems or templates to get a sense of what a complete system looks like. This will help you understand the level of detail you should aim for. Don't worry about getting it perfect on the first try - you can always edit and improve your systems later. The goal right now is to get started and learn by doing. If you get stuck or confused, that's normal - just take your time and explore the interface.'",
      "Step 5: Continue with EXTREMELY DETAILED implementation steps (8-12 sentences each). Explain WHAT to do, HOW to do it step-by-step, WHY each part matters, WHAT TO EXPECT, and include troubleshooting: 'Click the Create New System button. You'll find this button prominently displayed, usually at the top of the Systems page or in a clearly marked section. When you click it, a form or modal will appear asking you to input information about your new system. The first field will likely ask for the system name - this is important, so choose something clear and descriptive. For example, instead of just System 1, use something like Customer Onboarding Process or Daily Sales Reporting or Order Fulfillment Workflow. The name should tell anyone (including you in 6 months) what this system does at a glance. Think about it this way: if someone sees this system name in a list, they should immediately understand its purpose. Next, you'll see fields for describing the system - this is where you explain the purpose and context. Don't just write handles customers - be specific and detailed. Explain that this system ensures every new customer receives a welcome email within 1 hour of purchase, gets added to the CRM with all relevant information, receives their first product or service within 24 hours, and gets a follow-up check-in after 7 days. The description should answer: What does this system accomplish? When is it used? Who is involved? Why does it exist? This context is crucial because it helps people understand not just what to do, but why they're doing it. As you fill in these fields, think about someone who has never done this before - would they understand what this system is for? If not, add more detail. You can always refine it later, but starting with good detail is better than starting vague.'",
      "Step 6: Explain HOW to document the process with COMPREHENSIVE DETAIL (8-12 sentences): 'Now comes the most important and detailed part - documenting the actual steps of the process. This is where you break down the entire process into individual, actionable steps. Start by thinking through the entire process from beginning to end. For example, if you're documenting customer onboarding for ${businessName}, walk through it mentally: What happens first? Then what? What comes after that? Write down every single action in order, no matter how small it seems. For customer onboarding, it might be: Step 1 - Receive order notification (this could be an email, a notification in your system, or a message). Step 2 - Verify payment has been processed (check your payment processor, confirm the amount, note any special instructions). Step 3 - Prepare the product or service (gather materials, customize if needed, ensure quality). Step 4 - Package and label (if physical product, package it properly with any included materials). Step 5 - Generate shipping label and schedule pickup (if applicable). Step 6 - Send confirmation email to customer with tracking information. Step 7 - Update your records (CRM, spreadsheet, or whatever you use). Step 8 - Schedule follow-up (maybe 7 days after delivery). Be extremely detailed in each step - include what information you need (customer name, order number, product details), where to find it (which system, which screen, which file), what tools to use (email platform, shipping software, CRM), and what the expected outcome is (customer receives confirmation, tracking number is generated, record is updated). Think about what could go wrong at each step and include troubleshooting: What if the payment didn't process? What if the product is out of stock? What if the customer's address is incomplete? Document how to handle these situations. The goal is that someone who has never done this before could follow your system and succeed. Test this mentally: if you gave this to a new employee, could they do it without asking you questions? If the answer is no, add more detail.'",
      "Step 7: Explain HOW to test and validate with DETAILED GUIDANCE (8-12 sentences): 'Once you've documented your system, it's crucial to test it before you rely on it or share it with others. Testing ensures your system actually works and produces the desired outcome. Start by testing it yourself first - this might seem obvious, but you'd be surprised how many people skip this step. Follow your own instructions exactly as written, without using any knowledge that's in your head but not in the documentation. This is important because you know the process, but the documentation needs to stand alone. As you follow your own steps, you'll likely find gaps - steps that are unclear, information that's missing, or assumptions that aren't stated. For example, you might have written check payment but not specified where to check it or what to do if it's pending. Revise the system as you discover these gaps. Go through this process 2-3 times, refining each time, until you can follow your own documentation smoothly without getting stuck or confused. Then, have someone else (a team member, a friend, or a trusted person) try to follow it without your help. This is the real test - if someone else can't follow it, it needs more work. Watch them as they try to follow it (if possible) and note where they get confused, where they pause, where they ask questions, or where they make mistakes. These are all areas that need more detail or clarification. Ask them questions afterward: What was unclear? Where did you get stuck? What information was missing? What would have helped? Use their feedback to improve the system. Remember: if someone can't follow your system, it's not their fault - it's the system that needs improvement. A good system is foolproof. Keep testing and refining until someone can follow it successfully on their first try.'",
      "Step 8: Explain HOW to implement it with your team with COMPREHENSIVE STEPS (8-12 sentences): 'Sharing and implementing the system with your team is a critical step that many people rush through, but doing it well ensures the system actually gets used. Start by sharing the system with your team through the app - make sure everyone knows where to find it and how to access it. Don't assume they'll find it on their own - actively point them to it. You might send them a message saying Hey team, I've created a new system for [process name] - you can find it in the Systems section under [category]. Take a few minutes to review it and let me know if you have questions. But sharing the document isn't enough - you need to train them on it. Schedule a brief training session (maybe 15-30 minutes) where you walk through the system together. Don't just read it to them - actually demonstrate it. Show them where to find the information they need, walk through a real example, and let them ask questions. This hands-on approach helps them understand not just what to do, but how to do it in practice. Encourage questions and feedback during and after the training - your team will likely spot improvements you missed because they're the ones actually doing the work. They might say This step is confusing or We usually also do X, why isn't that in here? or This tool isn't available anymore. Listen to this feedback and update the system. Make it clear that systems are living documents that can and should be updated as processes evolve. This isn't set in stone - if something changes or improves, the system should change too. Set a review date (maybe monthly or quarterly) to check if the system is still accurate and effective. Put it on your calendar so you don't forget. During reviews, ask your team: Is this system still accurate? Are we still following it? What's changed? What could be improved? This keeps your systems relevant and useful.'",
      "Step 9: Explain HOW to measure success with DETAILED METRICS (8-12 sentences): 'Tracking how well your system is working is essential - you can't improve what you don't measure. But measuring success isn't just about numbers, it's about outcomes. Start by identifying what success looks like for this specific system. For a customer onboarding system, success might mean: Customers receive their welcome email within 1 hour (not 24 hours), orders are processed within 2 hours (not next day), there are zero errors in customer information (not 5% error rate), customer satisfaction with onboarding is high (you can survey them), and the process takes 15 minutes instead of 45 minutes. For ${businessName}, success might look like: [specific metrics based on their business type and goals]. Use the app's tracking features to monitor these metrics if available, or create a simple tracking system yourself. You could use a spreadsheet to track: How long the process takes, how many errors occur, how often the system is followed correctly, and feedback from team members and customers. Track these metrics weekly or monthly, depending on how often the process happens. Look for trends: Is it getting faster? Are errors decreasing? Is quality improving? If something isn't working (tasks still take too long, errors are still happening, quality is inconsistent), don't abandon the system - improve it. Systems get better with iteration, not perfection. Ask yourself: What's not working? Why isn't it working? What needs to be changed? Then update the system and test again. Remember, a system that's 80% right and being used is better than a perfect system that no one follows. The goal is continuous improvement, not perfection from the start.'",
      "Step 10: Explain HOW to iterate and improve with COMPREHENSIVE GUIDANCE (8-12 sentences): 'Systems should evolve with your business - they're not set-and-forget documents. As ${businessName} grows and changes, your systems need to adapt. This is a mindset shift: systems aren't something you create once and never touch again, they're living documents that grow with your business. Review them regularly - maybe monthly for critical systems, quarterly for less frequent ones. Put these review dates on your calendar so you don't forget. During reviews, ask your team specific questions: What's working well with this system? What's confusing or unclear? What steps are we skipping and why? What's changed in our process that isn't reflected in the system? What tools or information sources have changed? What problems are we still having? Get honest feedback - create an environment where people feel comfortable saying the system isn't working or needs improvement. This feedback is gold - it tells you exactly what to fix. When you get feedback, don't get defensive. Instead, ask follow-up questions: Can you give me an example of when it was confusing? What would have made it clearer? What information were you missing? Use this to update the documentation in the app. Make the updates, test them, and share the updated version with your team. The best systems are the ones that are actually used and continuously improved. Remember, a system that's 80% right and being used is better than a perfect system that no one follows. Perfectionism kills progress - done is better than perfect, and iteration makes it better over time. As you improve systems, you'll notice patterns: certain types of steps always need more detail, certain information is always missing, certain tools always change. Use these patterns to improve your system-building process itself. The more systems you build, the better you'll get at building them.'",
      "Step 11: Address common mistakes to avoid with DETAILED EXAMPLES (8-12 sentences): 'Here are the most common mistakes business owners make when building systems, and how to avoid them: Mistake #1: Making systems too complicated. Some people try to include every possible scenario and edge case, which makes the system overwhelming and hard to follow. Solution: Start simple. Document the happy path (the normal, expected process) first. You can add edge cases and exceptions later. A simple system that gets used is better than a complex system that gets ignored. Mistake #2: Writing systems once and never updating them. Processes change, tools change, businesses evolve, but the system stays the same. Solution: Schedule regular reviews (monthly or quarterly) and actually do them. When something changes, update the system immediately, not later. Mistake #3: Not involving the team. You create the system in isolation, then expect your team to follow it. Solution: Get your team's input from the start. They're the ones doing the work - they know what actually happens, what's missing, and what's confusing. Involve them in creating and improving systems. Mistake #4: Trying to systemize everything at once. This is overwhelming and leads to giving up. Solution: Start with 2-3 critical processes. Get those working well, then add 2-3 more. Build momentum with small wins. Mistake #5: Making systems too vague. Steps like handle customer or process order aren't helpful. Solution: Be extremely specific. What exactly does handle mean? What information do you need? Where do you find it? What tools do you use? What's the expected outcome? For ${businessName}, especially watch out for [specific mistake relevant to their situation, industry, or business stage]. For example, if you're in a fast-changing industry, you might fall into the trap of not updating systems frequently enough. If you have a small team, you might try to systemize too much too fast. Be aware of these tendencies and adjust your approach.'",
      "Step 12: Explain what success looks like with COMPREHENSIVE OUTCOMES (8-12 sentences): 'You'll know your systems are working when you see these specific outcomes: First, tasks get done consistently without your direct involvement. You can take a day off, go on vacation, or focus on other priorities, and the work still gets done correctly. This is the ultimate test - if you have to be there for things to work, you don't have systems, you have processes that depend on you. Second, new team members can learn processes quickly. Instead of weeks of training and shadowing, they can study the system, ask a few questions, and start contributing. This dramatically reduces onboarding time and cost. Third, quality stays high even when you're not supervising. Because the system ensures consistency, the output is predictable and reliable. Fourth, you have more time to focus on growth activities. Instead of managing daily operations, you can focus on finding new customers, developing new products, building partnerships, or strategic planning. Fifth, your team feels confident and empowered. They know what to do, how to do it, and they can work independently without constant direction. For ${businessName}, this means you can focus on [their specific goals - reference biggestGoal, revenueGoal, etc.] instead of managing daily operations. That's when systems truly pay off - they free you to work ON your business instead of IN your business. You'll also notice less stress, fewer emergencies, and more predictability in your business. Things that used to be chaotic become routine. Problems get caught earlier because processes are consistent and visible. This is the compound effect of good systems - they don't just save time, they transform how your business operates. Start with one system, get it working well, then build from there. Each system you create makes the next one easier, and over time, you'll have a business that can run and grow without you being the bottleneck.'"
    ],
    "feature": "Feature name (e.g., Revenue Intelligence, Systems, Teams, Leadership, Bizora AI, Discover, Revenue)",
    "featureLink": "/feature-path (e.g., /revenue-intelligence, /revenue?tab=systems, /teams, /marketplace, /bizora, /discover, /revenue)",
    "icon": "icon-name (e.g., dollar, settings, users, crown, compass, target, trending)",
    "priority": "high" or "medium" or "low",
    "category": "Category name (e.g., Revenue, Operations, Team, Leadership, Customer Growth, Strategy)",
    "estimatedTime": "Time estimate (e.g., 30 minutes, 1-2 hours, Ongoing)",
    "impact": "Expected impact description"
  },
  ... (4 more recommendations)
]

CRITICAL INSTRUCTIONS FOR DETAILED EXPLANATIONS:
- Each "explanation" should be a COMPREHENSIVE LESSON (5-7 sentences) that teaches the user:
  * WHAT the concept is (define it clearly)
  * WHY it matters for their specific business
  * HOW it works in practice
  * WHAT problems it solves
  * HOW it relates to their challenges and goals
  
- Each "howToStart" step should be EXTREMELY EDUCATIONAL and COMPREHENSIVE (8-12 sentences per step):
  * NOT just "Go to Systems" but a complete, deep walkthrough with explanations embedded WITHIN the step itself. Each step should be a comprehensive mini-tutorial that teaches, explains, and guides.
  * Each step MUST deeply explain WITHIN the step itself:
    - WHAT to do (be extremely specific with full context)
    - HOW to do it (detailed step-by-step breakdown with navigation, clicks, what to look for)
    - WHY it matters (deep explanation connecting to their specific business, goals, challenges, with examples)
    - WHAT to expect (detailed description of what they'll see, what will happen, what the interface looks like)
    - WHERE to find things (exact navigation paths, menu locations, button names)
    - WHAT information they need (prerequisites, data, tools required)
    - HOW to handle common issues (troubleshooting embedded in the step)
    - HOW to know if they're doing it right (validation criteria within the step)
    - Common mistakes to avoid (with specific examples relevant to their situation)
    - What success looks like at this step (specific outcomes and metrics)
    - How this connects to the next step (transition and flow)
  * Include multiple real-world examples specific to ${businessName}, their industry, their challenges
  * Include analogies and comparisons to help understanding
  * Explain the reasoning behind each action
  * Address "what if" scenarios and edge cases
  * Make each step feel like a comprehensive lesson, not just an instruction
  * Write as if teaching someone who has never done this before and needs to understand not just what to do, but why and how
  
- For team recommendations: Explain WHAT makes a good team structure, HOW to define roles properly, HOW to communicate effectively, WHAT delegation means, HOW to build trust, etc.
  
- For system recommendations: Explain WHAT systems are, WHY documentation matters, HOW to document processes, WHAT makes a good system, HOW to make systems scalable, etc.
  
- For revenue recommendations: Explain HOW revenue works, WHAT metrics matter, HOW to track them, WHY each metric is important, HOW to analyze revenue, etc.

IMPORTANT:
- Make each recommendation UNIQUE and SPECIFIC to their situation
- Use their business name, industry, and challenges throughout
- Reference their specific data (revenue goals, team size, etc.)
- Make recommendations actionable with clear, detailed, educational steps
- Ensure recommendations are DIFFERENT from generic advice - personalize heavily
- Focus on their MAIN CHALLENGES first
- Write for users of all ages - be thorough, clear, and educational
- Only return valid JSON, no additional text`

    // Increase temperature for more variation when requesting different recommendations
    const adjustedTemperature = requestDifferent ? Math.min(temperature + 0.2, 1.0) : temperature
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: adjustedTemperature,
      },
    })

    // Add timeout (90 seconds for complex generation)
    const startTime = Date.now()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Generation timeout after 90 seconds')), 90000)
    })
    
    console.log('🔄 Starting AI recommendation generation...')
    console.log('⏱️ Timeout set to 90 seconds')
    
    // Race between API call and timeout
    const result = await Promise.race([
      model.generateContent(contextPrompt),
      timeoutPromise
    ])
    const response = result.response
    const text = response.text()
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ AI recommendations generated in ${duration} seconds`)

    // Try to extract JSON from the response
    let recommendations
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recommendations = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw response:', text)
      // Fallback: return empty array or try to extract JSON manually
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: text },
        { status: 500 }
      )
    }

    // Validate we have 5 recommendations
    if (!Array.isArray(recommendations) || recommendations.length !== 5) {
      console.error('Invalid recommendations format or count:', recommendations)
      return NextResponse.json(
        { error: 'Invalid recommendations format', recommendations },
        { status: 500 }
      )
    }

    // Ensure all required fields are present
    const validatedRecommendations = recommendations.map((rec: any, index: number) => ({
      id: rec.id || `ai-rec-${index + 1}`,
      title: rec.title || 'Recommendation',
      description: rec.description || '',
      explanation: rec.explanation || '',
      whyItMatters: rec.whyItMatters || '',
      howToStart: Array.isArray(rec.howToStart) ? rec.howToStart : [],
      feature: rec.feature || 'General',
      featureLink: rec.featureLink || '/',
      icon: rec.icon || 'lightbulb',
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
      category: rec.category || 'General',
      estimatedTime: rec.estimatedTime || 'Varies',
      impact: rec.impact || 'Positive impact'
    }))

    return NextResponse.json({ recommendations: validatedRecommendations })
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

