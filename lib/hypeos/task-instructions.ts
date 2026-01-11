// Utility function to generate howToComplete instructions for tasks
export function getHowToCompleteInstructions(taskTitle: string, category: string): string[] | undefined {
  const titleLower = taskTitle.toLowerCase();
  
  // Research tasks
  if (titleLower.includes('research')) {
    if (titleLower.includes('revenue') || titleLower.includes('pricing')) {
      return [
        "Search 'revenue streams for [your niche]' on YouTube - watch top 5 videos (minimum 10 minutes each) and take notes",
        "Check out IndieHackers.com - browse the 'Revenue' section and read 3-5 case studies of businesses in similar niches",
        "Visit PriceIntelligently.com - read their pricing strategy guides and download their pricing framework templates",
        "Review competitor pricing - visit 5-10 competitor websites, note their pricing tiers, and document what's included",
        "Use Google Trends - search your product/service keywords to see demand patterns over the last 12 months",
        "Research on Reddit - search r/entrepreneur, r/SaaS, or niche-specific subreddits for revenue discussions",
        "Check ProductHunt.com - look at similar products and see how they monetize and price their offerings",
        "Read pricing psychology articles on ConversionXL.com to understand pricing strategies",
        "Document your findings in a Google Doc or Notion page with screenshots and links",
        "Create a comparison table of different revenue models you discovered (subscription, one-time, freemium, etc.)"
      ];
    }
    if (titleLower.includes('audience') || titleLower.includes('competitor')) {
      return [
        "Search 'target audience analysis' on YouTube - watch 3-5 comprehensive tutorials (15+ minutes each) from marketing channels",
        "Use SparkToro.com - enter competitor domains to analyze their audience demographics, interests, and behaviors",
        "Check competitor social media profiles - analyze their Instagram, Twitter, LinkedIn for follower engagement patterns",
        "Review competitor content - read 5-10 blog posts and watch 3-5 YouTube videos to understand their messaging",
        "Use Google Analytics or SimilarWeb - check traffic sources, demographics, and popular content (if you have access)",
        "Search Facebook Audience Insights - use this tool to understand audience demographics and interests",
        "Check competitor email lists - sign up for their newsletters to see their content strategy and audience targeting",
        "Research on Quora - search questions your target audience asks about your niche or competitor products",
        "Use AnswerThePublic.com - enter your niche keywords to see what questions your audience is asking",
        "Join relevant Facebook groups and Reddit communities - observe discussions to understand pain points and interests",
        "Document audience personas - create detailed profiles with demographics, goals, challenges, and preferred channels",
        "Create a competitor analysis spreadsheet with their strengths, weaknesses, and audience positioning"
      ];
    }
    return [
      "Search your topic on YouTube - watch top 5-7 educational videos (minimum 10 minutes each) from credible channels",
      "Read articles on Medium.com - search your topic, filter by 'Most Claps' and read top 5-7 articles",
      "Check industry-specific forums - Reddit, Discord servers, Facebook groups, and niche communities",
      "Review case studies - search '[your topic] case study' on Google and read 3-5 real-world examples",
      "Use Google Scholar - search academic papers if you need data-backed research and statistics",
      "Check industry reports - look for annual reports from companies like McKinsey, Deloitte, or industry associations",
      "Browse ProductHunt.com and IndieHackers.com - see how others have approached similar challenges",
      "Read books on the topic - check Amazon bestsellers and read reviews to find the most recommended books",
      "Join relevant online courses - browse Udemy, Coursera, or Skillshare for structured learning on the topic",
      "Document everything - create a research document with links, quotes, screenshots, and key insights",
      "Create an action plan - summarize your findings and list 5-7 actionable next steps based on your research"
    ];
  }
  
  // Content tasks
  if (titleLower.includes('content') || titleLower.includes('blog') || titleLower.includes('video')) {
    return [
      "Research trending topics - use Google Trends to find rising keywords in your niche over the last 30 days",
      "Check competitor content - analyze top 10 blog posts or videos from 3-5 competitors in your niche",
      "Use AnswerThePublic.com - enter your niche keywords to find content ideas based on real questions",
      "Browse Reddit and Quora - find popular questions and discussions that need content addressing them",
      "Use Canva.com or Figma - create visual assets (thumbnails, graphics, infographics) for your content",
      "Write/edit content - use Grammarly for proofreading and Hemingway Editor for readability improvements",
      "Research SEO keywords - use Ubersuggest or Ahrefs to find relevant keywords with good search volume",
      "Create an outline - structure your content with clear headings, subheadings, and key points",
      "Add internal/external links - link to relevant resources, your own content, and authoritative sources",
      "Optimize for SEO - include meta descriptions, alt text for images, and proper heading structure",
      "Schedule posts - use Buffer.com, Later.com, or Hootsuite to schedule across multiple platforms",
      "Create social media snippets - design quote cards, carousel posts, or short video clips to promote the content",
      "Set up tracking - use Google Analytics or platform analytics to monitor performance after publishing"
    ];
  }
  
  // Marketing tasks
  if (titleLower.includes('marketing') || titleLower.includes('campaign') || titleLower.includes('advertising')) {
    return [
      "Research marketing strategies - watch 5-7 comprehensive YouTube tutorials on marketing channels and tactics",
      "Check HubSpot.com - download their free marketing templates and read their comprehensive guides",
      "Use Google Ads Keyword Planner - research high-intent keywords with good search volume and low competition",
      "Study competitor campaigns - analyze their Facebook Ads, Google Ads, and email campaigns (sign up for their lists)",
      "Create buyer personas - document detailed profiles of your ideal customers with demographics and pain points",
      "Set up tracking - install Google Analytics, Facebook Pixel, and conversion tracking for your campaigns",
      "Design ad creatives - use Canva.com or Figma to create multiple ad variations (A/B test different designs)",
      "Write ad copy - create 3-5 variations of headlines and descriptions, test different value propositions",
      "Set up campaigns - configure campaigns on Facebook Ads Manager, Google Ads, or your chosen platform",
      "Research landing page best practices - watch YouTube tutorials on conversion optimization and landing page design",
      "Create landing pages - use Unbounce, Leadpages, or build custom pages optimized for conversions",
      "Set up email sequences - use Mailchimp, ConvertKit, or similar tools to create automated email campaigns",
      "Monitor performance - check metrics daily for first week, then weekly: CTR, conversion rate, cost per acquisition",
      "Optimize based on data - pause underperforming ads, increase budget on winners, and test new variations"
    ];
  }
  
  // Social media tasks
  if (titleLower.includes('social media') || titleLower.includes('instagram') || titleLower.includes('tiktok')) {
    return [
      "Research growth strategies - watch top 5-7 YouTube videos on '[platform] growth strategies' (15+ minutes each)",
      "Check Later.com blog - read their comprehensive guides on content scheduling, hashtag strategy, and engagement",
      "Analyze competitor accounts - study top 5-10 accounts in your niche, note posting frequency, content types, and engagement",
      "Use Hashtagify.me or RiteKit - research trending hashtags in your niche and find related hashtags with good reach",
      "Create content calendar - use Google Sheets or Notion template to plan 30 days of content with themes and post types",
      "Research best posting times - use Later.com's Best Time to Post feature or analyze when your competitors post most",
      "Design content templates - create reusable templates in Canva for carousels, stories, and feed posts",
      "Plan content mix - decide on ratio (e.g., 40% educational, 30% entertaining, 20% promotional, 10% behind-the-scenes)",
      "Create content batch - produce 5-10 pieces of content in one session to maintain consistency",
      "Engage authentically - spend 15-20 minutes daily commenting on posts from your target audience and competitors",
      "Use scheduling tools - schedule posts using Later.com, Buffer, or platform-native schedulers for consistency",
      "Track analytics - review Instagram Insights, TikTok Analytics, or Twitter Analytics weekly to see what performs best",
      "Join engagement groups - find niche-specific engagement pods or communities to boost initial engagement",
      "Create user-generated content campaigns - encourage followers to share content using your branded hashtag",
      "Collaborate with micro-influencers - reach out to 5-10 accounts with 5k-50k followers for potential collaborations"
    ];
  }
  
  // Setup/technical tasks
  if (titleLower.includes('set up') || titleLower.includes('setup') || titleLower.includes('install')) {
    return [
      "Search YouTube tutorials - find 2-3 step-by-step video tutorials (preferably from official channels or trusted creators)",
      "Read official documentation - visit the tool/service's help center or documentation site for comprehensive guides",
      "Check setup guides - look for written tutorials on the service's blog, Medium, or their knowledge base",
      "Watch demo videos - find product demos or walkthrough videos that show the complete setup process",
      "Join community forums - check Reddit, Discord, or official forums for setup tips and troubleshooting",
      "Prepare requirements - list all prerequisites, accounts, API keys, or integrations needed before starting",
      "Follow step-by-step - go through each setup step carefully, don't skip any configuration options",
      "Test each feature - after setup, test all major features to ensure everything works as expected",
      "Configure settings - customize settings, preferences, and integrations according to your needs",
      "Set up backups - ensure you have backup methods in place and know how to restore if needed",
      "Document your setup - take screenshots and notes of your configuration for future reference",
      "Verify integrations - test all connected services, APIs, or third-party integrations to confirm they work",
      "Create user accounts - if needed, set up team member accounts with appropriate permissions",
      "Schedule maintenance - set reminders for regular updates, backups, or maintenance tasks"
    ];
  }
  
  // Analysis tasks
  if (titleLower.includes('analyze') || titleLower.includes('track') || titleLower.includes('review')) {
    return [
      "Gather all data sources - collect data from Google Analytics, social media insights, email platforms, sales data, etc.",
      "Export raw data - download CSV files or export data from all platforms into a central location",
      "Use Google Sheets or Excel - create a master spreadsheet to organize and consolidate all your data",
      "Research analysis frameworks - watch YouTube tutorials on data analysis, KPIs, and metrics interpretation",
      "Read analysis guides - check Medium.com articles on data analysis best practices for your industry",
      "Create data visualizations - use Google Sheets charts, Excel pivot tables, or tools like Tableau for visual insights",
      "Calculate key metrics - compute important KPIs like conversion rates, growth rates, engagement rates, ROI, etc.",
      "Compare time periods - analyze month-over-month, quarter-over-quarter, or year-over-year trends",
      "Identify patterns - look for trends, anomalies, correlations, and patterns in your data",
      "Benchmark against industry - research industry averages and compare your metrics to see where you stand",
      "Document findings - create a comprehensive report with charts, graphs, key insights, and recommendations",
      "Identify opportunities - list 5-7 actionable opportunities based on your analysis findings",
      "Set up tracking dashboards - create ongoing dashboards in Google Analytics, Data Studio, or similar tools",
      "Schedule regular reviews - set calendar reminders for weekly, monthly, or quarterly analysis reviews"
    ];
  }
  
  // Strategy/planning tasks
  if (titleLower.includes('strategy') || titleLower.includes('plan') || titleLower.includes('roadmap') || titleLower.includes('competitive advantage') || titleLower.includes('develop')) {
    return [
      "Research best practices - watch 5-7 comprehensive YouTube tutorials on strategy development and planning",
      "Read case studies - find 5-10 case studies of similar businesses on Medium, Harvard Business Review, or industry sites",
      "Use planning templates - download templates from Notion.so, Trello, or Airtable for structured planning",
      "Analyze competitor strategies - study 3-5 competitors' approaches, their positioning, and what makes them successful",
      "Define clear objectives - use SMART goal framework (Specific, Measurable, Achievable, Relevant, Time-bound)",
      "Conduct SWOT analysis - analyze your Strengths, Weaknesses, Opportunities, and Threats in detail",
      "Research frameworks - study popular frameworks like OKRs, Balanced Scorecard, or Growth Hacking frameworks",
      "Create timeline - break down your strategy into phases with specific milestones and deadlines",
      "Identify resources needed - list all tools, team members, budget, and resources required for execution",
      "Define success metrics - establish KPIs and metrics to measure strategy effectiveness",
      "Document risks and mitigation - identify potential obstacles and create contingency plans",
      "Get feedback - share your strategy with mentors, peers, or team members for input and refinement",
      "Create action plan - break strategy into actionable tasks with owners, deadlines, and priorities",
      "Set up tracking system - use project management tools (Asana, Monday.com, Trello) to track progress",
      "Schedule review meetings - plan regular strategy reviews (weekly/monthly) to assess progress and adjust"
    ];
  }
  
  // Creative/experimentation tasks
  if (titleLower.includes('creative') || titleLower.includes('experiment') || titleLower.includes('explore') || titleLower.includes('technique')) {
    return [
      "Research creative inspiration - browse Behance, Dribbble, or Pinterest for creative concepts in your niche",
      "Watch YouTube tutorials - search 'creative brainstorming techniques' and watch 3-5 videos on ideation methods",
      "Use mind mapping tools - create visual mind maps using tools like Miro, MindMeister, or XMind",
      "Study competitor creative work - analyze top 5-10 creative projects from competitors or industry leaders",
      "Create mood boards - collect visual references, color palettes, and style inspirations on Pinterest or Figma",
      "Experiment with different approaches - try 3-5 different creative styles or techniques and compare results",
      "Join creative communities - participate in Discord servers, Facebook groups, or Reddit communities for feedback",
      "Use creative prompts - find AI tools like ChatGPT or Midjourney for creative prompts and ideas",
      "Document your process - take screenshots, notes, and record your creative journey for future reference",
      "Get early feedback - share your work with 3-5 trusted peers or mentors before finalizing",
      "Iterate based on feedback - refine your creative work based on constructive criticism",
      "Create variations - develop 2-3 alternative versions to test different creative directions",
      "Research best practices - read articles on creative process, design thinking, and innovation methodologies",
      "Set creative constraints - define boundaries (time, resources, style) to focus your creative exploration"
    ];
  }
  
  return undefined; // No instructions for generic tasks
}

