/**
 * Venture-type path curricula — like Duolingo tracks per language.
 * "Launch my course" and "Sell my SaaS" get different lesson libraries, not the same template with a swapped name.
 */

export type GoalPathProfile =
  | 'course'
  | 'saas'
  | 'audience'
  | 'product'
  | 'general'

export type PathUserContext = {
  goalTitle: string
  category: string
  goalTarget?: string
}

export type StepTemplate = {
  label: string
  description: string
  estimatedTime: string
  points: number
}

export type ProfileCurriculum = Record<string, StepTemplate[]>

/** Detect venture type from goal title + onboarding category. */
export function detectGoalPathProfile(ctx: PathUserContext): GoalPathProfile {
  const text =
    `${ctx.goalTitle} ${ctx.category} ${ctx.goalTarget || ''}`.toLowerCase()

  if (
    /\b(saas|software|app|platform|api|subscription|b2b|startup|mvp|sell my saas|my saas)\b/.test(
      text
    )
  ) {
    return 'saas'
  }
  if (
    /\b(course|cohort|curriculum|lesson|teach|student|workshop|classroom|educat|launch my course|my course)\b/.test(
      text
    )
  ) {
    return 'course'
  }
  if (
    /\b(audience|followers|subscribers|newsletter|community|personal brand|youtube|podcast)\b/.test(
      text
    ) ||
    ctx.category === 'audience'
  ) {
    return 'audience'
  }
  if (
    ctx.category === 'product' ||
    /\b(ecommerce|physical product|merch|shopify)\b/.test(text)
  ) {
    return 'product'
  }
  if (ctx.category === 'content') return 'audience'
  if (ctx.category === 'revenue' || ctx.category === 'business') return 'saas'
  if (ctx.category === 'marketing') return 'product'
  return 'general'
}

export function getGoalPathProfileLabel(profile: GoalPathProfile): string {
  const labels: Record<GoalPathProfile, string> = {
    course: 'Course creator',
    saas: 'SaaS founder',
    audience: 'Audience builder',
    product: 'Product launch',
    general: 'Venture',
  }
  return labels[profile]
}

function seedFromContext(ctx: PathUserContext): number {
  const s = `${ctx.goalTitle}|${ctx.category}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickStepsForSkill(
  pool: StepTemplate[],
  count: number,
  ctx: PathUserContext,
  skillId: string
): StepTemplate[] {
  if (pool.length === 0) return []
  const seed = seedFromContext(ctx)
  const skillOffset = skillId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const start = (seed + skillOffset) % pool.length
  const rotated = [...pool.slice(start), ...pool.slice(0, start)]
  return Array.from({ length: count }, (_, i) => rotated[i % rotated.length])
}

// ─── Course creator (launch / teach / enroll) ───────────────────────────────

const COURSE_SALES: StepTemplate[] = [
  {
    label: 'Interview 10 ideal students for {goal}',
    description:
      'Ask what blocked them before, what outcome they want, and what they’d pay for.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Build a waitlist page for {goal}',
    description:
      'Single page: who it’s for, transformation, curriculum snapshot, email capture.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Offer 3 free beta seats for {goal}',
    description:
      'Recruit beta students in exchange for feedback and a testimonial.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Outline 5 modules for {goal}',
    description:
      'Map lessons in order: outcome per module, exercise, and checkpoint.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Record a 3-minute teaser lesson',
    description:
      'Film one high-value lesson that proves your teaching style for {goal}.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Set pricing tiers for {goal}',
    description:
      'Define self-paced vs cohort vs VIP — price each toward {target}.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Email your list about early-bird for {goal}',
    description:
      'Send launch date, bonus for early enrollments, and clear deadline.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Host a free workshop previewing {goal}',
    description:
      'Live session: teach one framework and pitch enrollment at the end.',
    estimatedTime: '60 min',
    points: 110,
  },
  {
    label: 'Collect 5 student testimonials for {goal}',
    description:
      'Ask beta learners for short video or written wins you can use on sales page.',
    estimatedTime: '25 min',
    points: 75,
  },
  {
    label: 'DM 10 creators about promoting {goal}',
    description:
      'Pitch affiliate or guest-spot collabs with creators who share your audience.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Open enrollment cart for {goal}',
    description:
      'Turn on checkout, payment plan if needed, and confirmation emails.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Review enrollments and fix drop-off for {goal}',
    description:
      'Check where people abandon — landing page, pricing, or checkout.',
    estimatedTime: '30 min',
    points: 80,
  },
]

const COURSE_CONTENT: StepTemplate[] = [
  {
    label: 'Define the transformation promise of {goal}',
    description:
      'One sentence: from [before state] to [after state] in [timeframe].',
    estimatedTime: '20 min',
    points: 70,
  },
  {
    label: 'Script your welcome video for {goal}',
    description:
      'Introduce yourself, who the course helps, and how lessons are structured.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Create lesson slides for Module 1',
    description:
      '10–15 slides max with one action step students complete before next lesson.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Film Module 1 lesson for {goal}',
    description:
      'Record screen + face or slides. Keep under 15 minutes.',
    estimatedTime: '60 min',
    points: 110,
  },
  {
    label: 'Write worksheets for {goal}',
    description:
      'Templates, checklists, or exercises students fill in per module.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Post 3 “behind the scenes” clips building {goal}',
    description:
      'Share progress on social — builds trust before launch.',
    estimatedTime: '30 min',
    points: 75,
  },
  {
    label: 'Publish a free lead magnet tied to {goal}',
    description:
      'Mini-guide or checklist that previews your teaching and grows email list.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Batch-record 2 more lessons for {goal}',
    description:
      'Block one session; record back-to-back to stay ahead of launch.',
    estimatedTime: '90 min',
    points: 120,
  },
  {
    label: 'Add captions and chapter markers',
    description:
      'Make lessons skimmable and accessible before students enroll.',
    estimatedTime: '35 min',
    points: 80,
  },
  {
    label: 'Create a student community space for {goal}',
    description:
      'Discord, Circle, or Slack — where cohort asks questions between lessons.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Repurpose one lesson into 5 social posts',
    description:
      'Pull quotes, tips, and clips from your recorded content.',
    estimatedTime: '30 min',
    points: 75,
  },
  {
    label: 'Polish course sales page copy for {goal}',
    description:
      'Hero, curriculum breakdown, testimonials, FAQ, and guarantee.',
    estimatedTime: '50 min',
    points: 100,
  },
]

const COURSE_MARKETING: StepTemplate[] = [
  {
    label: 'Map where your future students hang out',
    description:
      'List 5 communities, hashtags, or newsletters for people who need {goal}.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Run a pre-launch challenge for {goal}',
    description:
      '5-day email or social challenge that ends with enrollment offer.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Set up email welcome sequence for {goal}',
    description:
      '3 emails: value, story, invitation to waitlist or cart.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Create launch countdown posts for {goal}',
    description:
      '7 posts: problem, proof, curriculum peek, bonus, deadline.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Partner with one newsletter for {goal}',
    description:
      'Pitch a sponsored mention or guest essay to reach new students.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Track waitlist → enrollment conversion',
    description:
      'Spreadsheet: signups, opens, clicks, purchases for {goal}.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Test two headlines on your {goal} page',
    description:
      'A/B test transformation-focused vs outcome-focused headline.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Run a small ads test for {goal}',
    description:
      '$20–50 on one platform targeting your student avatar.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Send cart-close emails for {goal}',
    description:
      '48h, 24h, and final-hour reminders with bonus or scarcity.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Document launch metrics for {goal}',
    description:
      'Revenue, conversion rate, top traffic source — for next cohort.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Survey non-buyers why they passed on {goal}',
    description:
      'Short form: price, timing, or fit — use answers to improve offer.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Plan your next cohort launch date',
    description:
      'Calendar backwards from {target} with content and email milestones.',
    estimatedTime: '30 min',
    points: 75,
  },
]

const COURSE_NETWORKING: StepTemplate[] = [
  {
    label: 'Join 2 creator-educator communities',
    description:
      'Spaces where course creators share launch tactics and feedback.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Ask 3 peers to review your {goal} outline',
    description:
      'Get honest feedback on curriculum gaps before you film everything.',
    estimatedTime: '30 min',
    points: 75,
  },
  {
    label: 'Guest on a podcast about {goal}',
    description:
      'Pitch 5 small shows whose audience matches your future students.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Co-host a live Q&A about {niche}',
    description:
      'Partner with another creator; split audience and promote {goal}.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Introduce yourself in 3 student-focused groups',
    description:
      'Share who you help and one free resource — not a hard pitch.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Ask a past client for a referral to beta students',
    description:
      'Warm intro beats cold outreach for your first cohort.',
    estimatedTime: '15 min',
    points: 60,
  },
  {
    label: 'Connect with 5 alumni-style creators in {niche}',
    description:
      'Study how they launched; note what you can adapt for {goal}.',
    estimatedTime: '30 min',
    points: 75,
  },
  {
    label: 'Offer to speak at a local or online event',
    description:
      '20-min talk on one lesson from {goal} — collect emails at end.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Thank every beta student personally',
    description:
      'Handwritten note or voice memo — builds advocates for launch day.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Build a list of 10 potential affiliate partners',
    description:
      'Creators who could earn commission promoting {goal}.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Schedule office hours before cart opens',
    description:
      'Let prospects ask questions live about fit for {goal}.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Follow up with everyone from your workshop',
    description:
      'Personal DM or email within 24h with enrollment link.',
    estimatedTime: '20 min',
    points: 65,
  },
]

// ─── SaaS founder (sell software / subscriptions) ───────────────────────────

const SAAS_SALES: StepTemplate[] = [
  {
    label: 'Define your ICP for {goal}',
    description:
      'Company size, job title, pain point, and budget for buyers of {goal}.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'List 25 target accounts for {goal}',
    description:
      'Real companies that match ICP — name, contact role, and why they fit.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Write a 2-sentence value prop for {goal}',
    description:
      'Problem → your product outcome → proof or differentiator.',
    estimatedTime: '25 min',
    points: 75,
  },
  {
    label: 'Send 10 personalized LinkedIn outbounds for {goal}',
    description:
      'Reference their company pain — not a generic template blast.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Build a 15-minute demo script for {goal}',
    description:
      'Discovery → pain → demo flow → next step. Practice twice.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Book 5 product demo calls for {goal}',
    description:
      'Use calendar link or direct asks — aim for this week.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Set up free trial + onboarding email for {goal}',
    description:
      'Signup flow, day-1 email, and one activation milestone.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Log objections from demo calls',
    description:
      'Price, security, integration, timing — write responses for each.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Create a one-pager / ROI sheet for {goal}',
    description:
      'PDF prospects can forward internally: problem, solution, pricing.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Propose annual plan on live demos',
    description:
      'Offer 2 months free on annual vs monthly — track uptake.',
    estimatedTime: '20 min',
    points: 70,
  },
  {
    label: 'Close your first paying customer for {goal}',
    description:
      'Ask for the decision on call or send contract same day.',
    estimatedTime: '30 min',
    points: 110,
  },
  {
    label: 'Review trial-to-paid funnel for {goal}',
    description:
      'Where do signups drop? Fix onboarding or pricing friction.',
    estimatedTime: '35 min',
    points: 85,
  },
]

const SAAS_CONTENT: StepTemplate[] = [
  {
    label: 'Publish a “how we solve X” post for {goal}',
    description:
      'Show the workflow your product replaces — before/after screenshots.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Write a comparison post: old way vs {goal}',
    description:
      'Spreadsheets vs your tool, manual process vs automation.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Record a 90-second product walkthrough',
    description:
      'Screen recording with voiceover — one core use case only.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Share a customer win story (even if early)',
    description:
      'Quote, metric, or workflow improvement from a beta user.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Post on LinkedIn about building {goal}',
    description:
      'Founder story: why you built it and who it’s for.',
    estimatedTime: '25 min',
    points: 75,
  },
  {
    label: 'Create docs for your top 3 features',
    description:
      'Help center articles reduce support load and build trust.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Publish a changelog update for {goal}',
    description:
      'Ship notes show momentum — email subscribers who trialed.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Guest post on a {niche} blog',
    description:
      'Teach something useful; soft mention of {goal} in bio.',
    estimatedTime: '60 min',
    points: 110,
  },
  {
    label: 'Turn demo recording into 3 short clips',
    description:
      'Cut for Twitter, LinkedIn, and product page embed.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Write case study template for {goal}',
    description:
      'Problem, solution, results — send to happy users to fill in.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'SEO: target one keyword for {goal}',
    description:
      'Blog post answering a search query your ICP actually types.',
    estimatedTime: '55 min',
    points: 105,
  },
  {
    label: 'Update homepage hero for {goal}',
    description:
      'Headline = outcome, subhead = who it’s for, CTA = start trial.',
    estimatedTime: '40 min',
    points: 90,
  },
]

const SAAS_MARKETING: StepTemplate[] = [
  {
    label: 'Install product analytics for {goal}',
    description:
      'Track signup, activation, and paid conversion events.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Set up retargeting for trial abandoners',
    description:
      'Pixel + simple ad reminding visitors to finish signup.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Launch on one directory (Product Hunt, etc.)',
    description:
      'Prep assets, hunter if needed, and launch-day engagement plan.',
    estimatedTime: '60 min',
    points: 110,
  },
  {
    label: 'Run a $50 LinkedIn ads test for {goal}',
    description:
      'One audience, one creative, one CTA — measure cost per trial.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Build an integration/partner landing page',
    description:
      'Show how {goal} works with tools your ICP already uses.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Email trial users who haven’t activated',
    description:
      'Triggered email: one tip to complete first key action.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'A/B test pricing page headline',
    description:
      'Outcome-focused vs feature-focused — run 100+ visitors.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Create a referral incentive for {goal}',
    description:
      'Give existing users credit for inviting teammates.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Map competitor positioning in {niche}',
    description:
      'Table: features, price, who they target — find your wedge.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Nurture sequence for demo no-shows',
    description:
      '3 emails: recap value, social proof, book again link.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Measure CAC and payback for {goal}',
    description:
      'Cost to acquire customer vs monthly revenue — toward {target}.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Double down on best acquisition channel',
    description:
      'Scale the one channel with lowest trial cost this month.',
    estimatedTime: '40 min',
    points: 90,
  },
]

const SAAS_NETWORKING: StepTemplate[] = [
  {
    label: 'Join 2 SaaS founder communities',
    description:
      'Indie Hackers, Slack groups, or local founder meetups.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Ask 3 founders for demo feedback on {goal}',
    description:
      '15-min call: watch them click through and note confusion.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Reach out to 5 potential integration partners',
    description:
      'Complementary tools — propose co-marketing or API connect.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Get intro to a buyer via warm connection',
    description:
      'Ask network: “Who runs [role] at [company type]?”',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Attend one virtual SaaS or {niche} event',
    description:
      'Goal: 5 quality conversations, not collecting business cards.',
    estimatedTime: '60 min',
    points: 100,
  },
  {
    label: 'Share helpful comment in founder forums',
    description:
      'Answer questions in your domain — mention {goal} only if relevant.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Pitch a podcast for your {goal} origin story',
    description:
      'Problem you saw, why you built, early traction.',
    estimatedTime: '30 min',
    points: 75,
  },
  {
    label: 'Connect with 5 people who churned from trials',
    description:
      'Learn why they left — gold for product and positioning.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Find a mentor who sold B2B software before',
    description:
      'One coffee chat on enterprise sales motion for {goal}.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Offer free office hours for {niche} users',
    description:
      '30 min blocks — build trust and uncover product gaps.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Thank your first paying customer personally',
    description:
      'Founder email or call — ask what almost stopped them buying.',
    estimatedTime: '20 min',
    points: 70,
  },
  {
    label: 'Build list of 10 advisors or angel intros',
    description:
      'People who could open doors to your ICP for {goal}.',
    estimatedTime: '25 min',
    points: 75,
  },
]

// ─── Audience builder ─────────────────────────────────────────────────────

const AUDIENCE_SALES: StepTemplate[] = [
  {
    label: 'Define your niche audience for {goal}',
    description: 'One paragraph: who they are, what they struggle with, where they are online.',
    estimatedTime: '25 min',
    points: 75,
  },
  {
    label: 'Create a lead magnet for {goal}',
    description: 'Checklist, template, or mini-guide worth an email signup.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Pitch your lead magnet in 5 communities',
    description: 'Share value-first in groups where your audience already gathers.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'DM 10 ideal followers with a genuine compliment',
    description: 'Start relationships — no pitch in first message.',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Offer a free audit related to {goal}',
    description: '15-min Loom reviews — builds trust and content ideas.',
    estimatedTime: '40 min',
    points: 90,
  },
  {
    label: 'Launch a low-ticket offer for {goal}',
    description: 'Workshop, template pack, or mini-course to convert warm audience.',
    estimatedTime: '50 min',
    points: 100,
  },
  {
    label: 'Survey subscribers on what they want next',
    description: '3 questions max — shape {goal} content from answers.',
    estimatedTime: '20 min',
    points: 65,
  },
  {
    label: 'Partner with a peer for a joint live',
    description: 'Split audiences — both promote to each other’s lists.',
    estimatedTime: '45 min',
    points: 95,
  },
  {
    label: 'Send a personal email to your top 20 subscribers',
    description: 'Ask what they’re working on — reply to every response.',
    estimatedTime: '35 min',
    points: 85,
  },
  {
    label: 'Track subscriber → customer path for {goal}',
    description: 'Which content or channel brought people who actually bought?',
    estimatedTime: '25 min',
    points: 70,
  },
  {
    label: 'Raise prices or add tier for {goal}',
    description: 'Test premium offer with audience who already trusts you.',
    estimatedTime: '30 min',
    points: 80,
  },
  {
    label: 'Celebrate a subscriber milestone publicly',
    description: 'Thank audience, share what’s next for {goal}.',
    estimatedTime: '20 min',
    points: 65,
  },
]

const AUDIENCE_CONTENT: StepTemplate[] = [
  { label: 'Choose your primary platform for {goal}', description: 'Pick ONE channel to master before spreading thin.', estimatedTime: '15 min', points: 55 },
  { label: 'Write 10 hook ideas for {goal}', description: 'Headlines that stop scroll for your niche.', estimatedTime: '30 min', points: 80 },
  { label: 'Publish 3 posts this week on {goal}', description: 'Ship on schedule — consistency beats perfection.', estimatedTime: '60 min', points: 110 },
  { label: 'Reply to 20 comments in your {niche}', description: 'Visibility in others’ threads grows your audience.', estimatedTime: '25 min', points: 70 },
  { label: 'Start a content series for {goal}', description: 'Part 1 of 5 — same day/time each week.', estimatedTime: '40 min', points: 90 },
  { label: 'Repurpose best post into 3 formats', description: 'Thread, carousel, short video from one idea.', estimatedTime: '35 min', points: 85 },
  { label: 'Film talking-head video about {goal}', description: '60 seconds, one tip your audience needs today.', estimatedTime: '30 min', points: 80 },
  { label: 'Analyze top 5 posts in {niche}', description: 'What hooks, formats, and topics got engagement?', estimatedTime: '25 min', points: 70 },
  { label: 'Update all bios to match {goal}', description: 'Same promise everywhere — clear who you help.', estimatedTime: '20 min', points: 65 },
  { label: 'Batch 5 posts for next week', description: 'Block 2 hours; schedule in advance.', estimatedTime: '50 min', points: 100 },
  { label: 'Collaborate on a carousel with a peer', description: 'Co-create audience-building content.', estimatedTime: '40 min', points: 90 },
  { label: 'Review growth metrics for {goal}', description: 'Followers, saves, email signups — note what spiked.', estimatedTime: '20 min', points: 65 },
]

const AUDIENCE_MARKETING: StepTemplate[] = [
  { label: 'Set up email welcome sequence', description: '3 emails after signup tied to {goal}.', estimatedTime: '40 min', points: 90 },
  { label: 'Run a giveaway for {goal}', description: 'Partner prize, follow + email entry, clear rules.', estimatedTime: '35 min', points: 85 },
  { label: 'Cross-promote in another newsletter', description: 'Swap mentions with similar-size creator.', estimatedTime: '30 min', points: 80 },
  { label: 'Test one paid boost on best organic post', description: '$15–30 to lookalike or interest audience.', estimatedTime: '25 min', points: 75 },
  { label: 'Add UTM links to all {goal} campaigns', description: 'Know which post or email drove signups.', estimatedTime: '20 min', points: 65 },
  { label: 'Create a landing page for {goal}', description: 'Single CTA: subscribe, join, or buy.', estimatedTime: '45 min', points: 95 },
  { label: 'Host a live AMA about {niche}', description: 'Promote 48h ahead; collect questions.', estimatedTime: '50 min', points: 100 },
  { label: 'Segment email list by interest', description: 'Tag subscribers for relevant {goal} offers.', estimatedTime: '30 min', points: 80 },
  { label: 'Retarget website visitors', description: 'Simple pixel campaign for people who didn’t subscribe.', estimatedTime: '35 min', points: 85 },
  { label: 'Survey audience on preferred content format', description: 'Video vs text vs audio — give them what they want.', estimatedTime: '20 min', points: 65 },
  { label: 'Plan 30-day content calendar for {goal}', description: 'Themes, formats, and CTAs mapped to {target}.', estimatedTime: '45 min', points: 95 },
  { label: 'Review what drove most signups this month', description: 'Double content like that next month.', estimatedTime: '25 min', points: 70 },
]

const AUDIENCE_NETWORKING: StepTemplate[] = [
  { label: 'Comment on 10 creator posts in {niche}', description: 'Thoughtful replies — your name in front of their audience.', estimatedTime: '25 min', points: 70 },
  { label: 'Introduce yourself in 3 communities', description: 'Who you help and one free resource.', estimatedTime: '20 min', points: 65 },
  { label: 'Schedule 2 virtual coffees this week', description: 'Peer creators or potential collaborators.', estimatedTime: '20 min', points: 65 },
  { label: 'Share someone else’s work with credit', description: 'Generosity builds reciprocal relationships.', estimatedTime: '15 min', points: 55 },
  { label: 'Pitch a collab post to a similar creator', description: 'Equal audience size — win-win exposure.', estimatedTime: '25 min', points: 75 },
  { label: 'Attend one online {niche} event', description: 'Participate in chat; follow up with 3 people.', estimatedTime: '45 min', points: 95 },
  { label: 'Ask your audience for introductions', description: '“Who should I talk to about X?”', estimatedTime: '15 min', points: 55 },
  { label: 'Join a paid community in your space', description: 'Invest where serious people in {niche} gather.', estimatedTime: '30 min', points: 80 },
  { label: 'Thank 5 people who shared your content', description: 'DM gratitude — strengthens allies.', estimatedTime: '15 min', points: 55 },
  { label: 'Offer to interview a peer on your channel', description: 'They promote; you get content and their audience.', estimatedTime: '35 min', points: 85 },
  { label: 'Map 10 dream collaborators for {goal}', description: 'Why them, what you’d propose, how to reach out.', estimatedTime: '30 min', points: 80 },
  { label: 'Follow up with everyone from last event', description: 'Within 48h — one specific note per person.', estimatedTime: '25 min', points: 70 },
]

// ─── Product launch (non-course, non-SaaS) ────────────────────────────────

const PRODUCT_SALES: StepTemplate[] = [
  { label: 'Validate demand with 15 pre-order conversations', description: 'Would they pay for {goal}? At what price?', estimatedTime: '50 min', points: 100 },
  { label: 'Set up simple checkout for {goal}', description: 'Stripe, Gumroad, or Shopify — test purchase yourself.', estimatedTime: '40 min', points: 90 },
  { label: 'Create product one-sheet for {goal}', description: 'Features, price, guarantee — PDF for DMs and email.', estimatedTime: '35 min', points: 85 },
  { label: 'Reach out to 10 early adopters', description: 'People who complained about the problem {goal} solves.', estimatedTime: '35 min', points: 85 },
  { label: 'Run a limited launch batch for {goal}', description: 'Scarcity: first 50 units or founding member pricing.', estimatedTime: '30 min', points: 80 },
  { label: 'Collect unboxing or first-use feedback', description: 'Fix friction before scaling marketing.', estimatedTime: '25 min', points: 70 },
  { label: 'Partner with a retailer or reseller', description: 'One wholesale or affiliate conversation for {goal}.', estimatedTime: '40 min', points: 90 },
  { label: 'Handle returns policy clearly on site', description: 'Trust increases conversion for new products.', estimatedTime: '20 min', points: 65 },
  { label: 'Upsell existing buyers on {goal}', description: 'Email past customers with complement or upgrade.', estimatedTime: '25 min', points: 75 },
  { label: 'Track unit economics toward {target}', description: 'COGS, shipping, margin per sale.', estimatedTime: '30 min', points: 80 },
  { label: 'Get 3 video reviews from buyers', description: 'Social proof for product page and ads.', estimatedTime: '25 min', points: 70 },
  { label: 'Plan restock or v2 based on feedback', description: 'What to improve before next launch push.', estimatedTime: '35 min', points: 85 },
]

const PRODUCT_CONTENT: StepTemplate[] = [
  { label: 'Shoot product photos for {goal}', description: '5 angles, good lighting, lifestyle shot if possible.', estimatedTime: '45 min', points: 95 },
  { label: 'Write origin story of {goal}', description: 'Why you made it — post on site and social.', estimatedTime: '30 min', points: 80 },
  { label: 'Film unboxing or demo video', description: 'Show exactly what buyers receive.', estimatedTime: '40 min', points: 90 },
  { label: 'Create comparison: you vs alternatives', description: 'Honest table — why {goal} is different.', estimatedTime: '35 min', points: 85 },
  { label: 'Post customer UGC repost for {goal}', description: 'Permission + credit — builds community.', estimatedTime: '20 min', points: 65 },
  { label: 'Write FAQ page for {goal}', description: 'Shipping, sizing, materials, support — reduce support tickets.', estimatedTime: '35 min', points: 85 },
  { label: 'Behind-the-scenes of making {goal}', description: 'Process content humanizes the brand.', estimatedTime: '30 min', points: 80 },
  { label: 'Seasonal or use-case content for {goal}', description: '“Perfect for…” scenarios your buyer relates to.', estimatedTime: '25 min', points: 75 },
  { label: 'Email launch story to list', description: 'Problem → product → offer → deadline.', estimatedTime: '30 min', points: 80 },
  { label: 'Optimize product title and SEO', description: 'Keywords your buyers search on Google/Amazon.', estimatedTime: '25 min', points: 70 },
  { label: 'Create Pinterest or visual pins for {goal}', description: 'If product is visual — drive discovery traffic.', estimatedTime: '30 min', points: 80 },
  { label: 'Refresh hero image on product page', description: 'Best photo + clearest benefit headline.', estimatedTime: '20 min', points: 65 },
]

const PRODUCT_MARKETING: StepTemplate[] = [
  { label: 'Set up Google Shopping or marketplace listing', description: 'Meet buyers where they already search.', estimatedTime: '45 min', points: 95 },
  { label: 'Run $30 test ad for {goal}', description: 'One image, one audience, measure cost per click.', estimatedTime: '35 min', points: 85 },
  { label: 'Influencer seeding: send {goal} to 5 creators', description: 'Micro-influencers in {niche} — no fee, just product.', estimatedTime: '40 min', points: 90 },
  { label: 'Launch email to full list', description: 'Announce {goal} with launch discount window.', estimatedTime: '30 min', points: 80 },
  { label: 'Add urgency: cart deadline or low stock', description: 'Ethical scarcity if inventory is truly limited.', estimatedTime: '15 min', points: 55 },
  { label: 'Retarget site visitors who didn’t buy', description: 'Reminder ad with testimonial creative.', estimatedTime: '30 min', points: 80 },
  { label: 'Bundle {goal} with complementary item', description: 'Increase AOV — test bundle price.', estimatedTime: '25 min', points: 75 },
  { label: 'Submit to product discovery sites', description: 'Relevant directories for {niche}.', estimatedTime: '35 min', points: 85 },
  { label: 'Track ROAS for first ad campaign', description: 'Revenue ÷ ad spend — toward {target}.', estimatedTime: '20 min', points: 65 },
  { label: 'A/B test product page CTA', description: '“Buy now” vs “Get yours” vs outcome-focused.', estimatedTime: '30 min', points: 80 },
  { label: 'Post in 3 deal or community threads', description: 'Where your buyers hunt for recommendations.', estimatedTime: '25 min', points: 70 },
  { label: 'Plan post-launch promo calendar', description: 'Holidays, events, collabs for next 60 days.', estimatedTime: '35 min', points: 85 },
]

const PRODUCT_NETWORKING: StepTemplate[] = [
  { label: 'Meet 3 suppliers or makers in {niche}', description: 'Learn quality benchmarks and costs.', estimatedTime: '40 min', points: 90 },
  { label: 'Ask retailers if they’d stock {goal}', description: 'One local or online boutique conversation.', estimatedTime: '30 min', points: 80 },
  { label: 'Join maker or founder group for {niche}', description: 'Share wins and sourcing tips.', estimatedTime: '25 min', points: 70 },
  { label: 'Get feedback from 5 target customers IRL', description: 'Hand them prototype or sample — watch reactions.', estimatedTime: '45 min', points: 95 },
  { label: 'Connect with packaging designer', description: 'Unboxing experience matters for word of mouth.', estimatedTime: '25 min', points: 75 },
  { label: 'Attend trade show or market', description: 'Even small local markets — direct buyer feedback.', estimatedTime: '120 min', points: 130 },
  { label: 'Partner with complementary brand', description: 'Co-bundle or co-market to shared audience.', estimatedTime: '35 min', points: 85 },
  { label: 'Thank first 10 customers by hand', description: 'Note or small gift — drives referrals.', estimatedTime: '30 min', points: 80 },
  { label: 'Find mentor who launched physical product', description: '30 min on logistics and launch mistakes.', estimatedTime: '30 min', points: 80 },
  { label: 'Intro to press or blogger in {niche}', description: 'Pitch story angle, not just product specs.', estimatedTime: '35 min', points: 85 },
  { label: 'List 10 stores that could carry {goal}', description: 'Research buyers and outreach plan.', estimatedTime: '30 min', points: 80 },
  { label: 'Follow up with wholesale leads', description: 'Persistent but polite — B2B takes time.', estimatedTime: '25 min', points: 70 },
]

// ─── General fallback (still distinct steps, not identical to course/saas) ───

const GENERAL_SALES: StepTemplate[] = [
  { label: 'Clarify who pays for {goal} and why', description: 'Write buyer persona: role, pain, budget.', estimatedTime: '30 min', points: 80 },
  { label: 'List 15 people to pitch {goal} this week', description: 'Real names — warm or cold.', estimatedTime: '25 min', points: 75 },
  { label: 'Write outreach message for {goal}', description: 'Under 100 words: problem, offer, ask.', estimatedTime: '25 min', points: 75 },
  { label: 'Send 8 outreaches for {goal}', description: 'Track sent, opened, replied in a sheet.', estimatedTime: '35 min', points: 85 },
  { label: 'Book 2 conversations about {goal}', description: 'Discovery calls or coffee chats.', estimatedTime: '30 min', points: 80 },
  { label: 'Document objections you hear about {goal}', description: 'Top 3 — write your best response to each.', estimatedTime: '25 min', points: 70 },
  { label: 'Define your offer stack for {goal}', description: 'Core offer, bonus, guarantee, price.', estimatedTime: '35 min', points: 85 },
  { label: 'Ask for one sale or commitment today', description: 'Direct ask toward {target}.', estimatedTime: '20 min', points: 70 },
  { label: 'Follow up with everyone who showed interest', description: 'Within 24 hours — specific next step.', estimatedTime: '25 min', points: 75 },
  { label: 'Review what messaging got replies', description: 'Reuse winning lines next week.', estimatedTime: '20 min', points: 65 },
  { label: 'Set weekly revenue activity goal for {goal}', description: 'Outreach count, calls, or proposals.', estimatedTime: '15 min', points: 55 },
  { label: 'Celebrate one small win on {goal}', description: 'Reply, meeting, or payment — share progress.', estimatedTime: '10 min', points: 50 },
]

const GENERAL_CONTENT: StepTemplate[] = [
  { label: 'Publish one piece about {goal}', description: 'Post, email, or video — ship today.', estimatedTime: '35 min', points: 85 },
  { label: 'Share progress on {goal} publicly', description: 'Build in public — one honest update.', estimatedTime: '20 min', points: 65 },
  { label: 'Create one visual for {goal}', description: 'Canva graphic, screenshot, or chart.', estimatedTime: '25 min', points: 70 },
  { label: 'Engage with 10 people in {niche}', description: 'Comments, DMs, or replies.', estimatedTime: '20 min', points: 65 },
  { label: 'Write outline for next 3 content pieces', description: 'Hooks and key points only.', estimatedTime: '25 min', points: 70 },
  { label: 'Repurpose last post for second channel', description: 'Same idea, different format.', estimatedTime: '20 min', points: 65 },
  { label: 'Update link in bio for {goal}', description: 'Point traffic to latest offer or lead magnet.', estimatedTime: '10 min', points: 50 },
  { label: 'Record voice note or short video tip', description: 'One actionable tip related to {goal}.', estimatedTime: '20 min', points: 65 },
  { label: 'Ask audience what they want to learn', description: 'Poll or question post.', estimatedTime: '15 min', points: 55 },
  { label: 'Review which post performed best', description: 'Do more of that format.', estimatedTime: '15 min', points: 55 },
  { label: 'Batch draft 2 posts for {goal}', description: 'Schedule for later this week.', estimatedTime: '40 min', points: 90 },
  { label: 'Thank someone who supported {goal}', description: 'Public shoutout or private note.', estimatedTime: '10 min', points: 50 },
]

const GENERAL_MARKETING: StepTemplate[] = [
  { label: 'Pick one channel to focus on for {goal}', description: 'Email, social, ads, or SEO — one only.', estimatedTime: '20 min', points: 65 },
  { label: 'Set a measurable weekly metric for {goal}', description: 'Signups, calls, or revenue toward {target}.', estimatedTime: '15 min', points: 55 },
  { label: 'Run a small experiment for {goal}', description: 'New headline, offer, or channel — one variable.', estimatedTime: '35 min', points: 85 },
  { label: 'Track results in a simple spreadsheet', description: 'Date, action, outcome.', estimatedTime: '15 min', points: 55 },
  { label: 'Email your list about {goal}', description: 'Value first, one clear CTA.', estimatedTime: '30 min', points: 80 },
  { label: 'Improve one page related to {goal}', description: 'Faster load, clearer CTA, or better headline.', estimatedTime: '35 min', points: 85 },
  { label: 'Ask 3 customers how they found you', description: 'Double down on that channel.', estimatedTime: '20 min', points: 65 },
  { label: 'Set up basic analytics for {goal}', description: 'Know where visitors come from.', estimatedTime: '25 min', points: 70 },
  { label: 'Plan next week’s marketing tasks', description: '3 actions max — realistic schedule.', estimatedTime: '20 min', points: 65 },
  { label: 'Stop one tactic that isn’t working', description: 'Free time for what converts.', estimatedTime: '15 min', points: 55 },
  { label: 'Document your current funnel for {goal}', description: 'Awareness → interest → action — find the leak.', estimatedTime: '30 min', points: 80 },
  { label: 'Set next milestone toward {target}', description: 'Specific number and deadline.', estimatedTime: '15 min', points: 55 },
]

const GENERAL_NETWORKING: StepTemplate[] = [
  { label: 'Reach out to 3 people who could help {goal}', description: 'Specific ask — intro, feedback, or advice.', estimatedTime: '25 min', points: 70 },
  { label: 'Attend one event or online room in {niche}', description: 'Listen first; add value second.', estimatedTime: '45 min', points: 95 },
  { label: 'Introduce yourself in one new community', description: 'Who you are and who you help.', estimatedTime: '15 min', points: 55 },
  { label: 'Schedule one coffee chat this week', description: 'Peer, mentor, or potential customer.', estimatedTime: '15 min', points: 55 },
  { label: 'Share a useful resource with your network', description: 'No ask — build goodwill.', estimatedTime: '15 min', points: 55 },
  { label: 'Follow up with someone you met recently', description: 'Reference your conversation specifically.', estimatedTime: '10 min', points: 50 },
  { label: 'Ask for one warm introduction', description: 'Toward someone who needs {goal}.', estimatedTime: '15 min', points: 55 },
  { label: 'Thank someone who helped you lately', description: 'Short message — strengthens relationship.', estimatedTime: '10 min', points: 50 },
  { label: 'Map 5 people to reconnect with', description: 'Former colleagues, clients, or friends.', estimatedTime: '20 min', points: 65 },
  { label: 'Offer help to someone in {niche}', description: 'Give before you ask.', estimatedTime: '20 min', points: 65 },
  { label: 'Update LinkedIn headline for {goal}', description: 'Clear outcome you help people achieve.', estimatedTime: '15 min', points: 55 },
  { label: 'Plan networking time for next week', description: 'Block 2 slots on calendar.', estimatedTime: '10 min', points: 50 },
]

export const GOAL_PATH_CURRICULA: Record<GoalPathProfile, ProfileCurriculum> = {
  course: {
    sales: COURSE_SALES,
    content: COURSE_CONTENT,
    marketing: COURSE_MARKETING,
    networking: COURSE_NETWORKING,
  },
  saas: {
    sales: SAAS_SALES,
    content: SAAS_CONTENT,
    marketing: SAAS_MARKETING,
    networking: SAAS_NETWORKING,
  },
  audience: {
    sales: AUDIENCE_SALES,
    content: AUDIENCE_CONTENT,
    marketing: AUDIENCE_MARKETING,
    networking: AUDIENCE_NETWORKING,
  },
  product: {
    sales: PRODUCT_SALES,
    content: PRODUCT_CONTENT,
    marketing: PRODUCT_MARKETING,
    networking: PRODUCT_NETWORKING,
  },
  general: {
    sales: GENERAL_SALES,
    content: GENERAL_CONTENT,
    marketing: GENERAL_MARKETING,
    networking: GENERAL_NETWORKING,
  },
}

export function getCurriculumPool(
  profile: GoalPathProfile,
  skillCategory: string
): StepTemplate[] {
  const curricula = GOAL_PATH_CURRICULA[profile]
  return (
    curricula[skillCategory] ??
    curricula.sales ??
    GOAL_PATH_CURRICULA.general.sales
  )
}
