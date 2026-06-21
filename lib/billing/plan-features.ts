export type PlanFeatureRow = {

  label: string

  free: string

  pro: string

  freeIncluded: boolean

  proIncluded: boolean

}



export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [

  {

    label: 'Access all modules',

    free: 'Yes',

    pro: 'Yes',

    freeIncluded: true,

    proIncluded: true,

  },

  {

    label: 'Bizora AI chat',

    free: '5 messages, then 8h wait',

    pro: 'Unlimited',

    freeIncluded: true,

    proIncluded: true,

  },

  {

    label: 'File uploads (Bizora)',

    free: '2 per month',

    pro: 'Unlimited',

    freeIncluded: true,

    proIncluded: true,

  },

  {

    label: 'Systems, Revenue, Leadership, Teams, Competitor AI',

    free: '2 runs each per month',

    pro: 'Unlimited',

    freeIncluded: true,

    proIncluded: true,

  },

  {

    label: 'Pro plan badge',

    free: '—',

    pro: 'Shown on your account',

    freeIncluded: false,

    proIncluded: true,

  },

  {

    label: 'Google (Docs, Sheets, Calendar)',

    free: '—',

    pro: 'Export & schedule events to Google',

    freeIncluded: false,

    proIncluded: true,

  },

  {

    label: 'Notion & Slack',

    free: '—',

    pro: 'Export to Notion and send updates to Slack',

    freeIncluded: false,

    proIncluded: true,

  },

  {

    label: 'Venture Quest',

    free: 'Sales path only · 3 path steps/day · 2 AI task gens/month · 1 goal',

    pro: 'All skill branches, unlimited path progress, AI tasks, streak multipliers & multiple goals',

    freeIncluded: true,

    proIncluded: true,

  },

  {

    label: 'Priority support',

    free: 'Community',

    pro: 'Priority',

    freeIncluded: false,

    proIncluded: true,

  },

]



export const FREE_PLAN_HIGHLIGHTS = [

  'Full app access with fair monthly limits',

  'Bizora, Systems, Revenue, Leadership, Teams, Competitive Intelligence & Venture Quest',

  'Discover, dashboard & onboarding',

]



export const PRO_PLAN_HIGHLIGHTS = [

  'Unlimited Bizora coaching (no 8-hour wait)',

  'Unlimited AI across every Pro module',

  'Unlimited file uploads',

  'Google, Notion & Slack integrations',

]



export type ProFeatureModule = {

  id: string

  name: string

  free: string

  pro: string

}



/** Detailed Free vs Pro by product area (welcome modal & marketing). */

export const PRO_FEATURE_BY_MODULE: ProFeatureModule[] = [

  {

    id: 'bizora',

    name: 'Bizora AI — coaching chat',

    free:

      '5 messages per block, then 8-hour cooldown; 2 file uploads/month; deep research & voice still available within limits',

    pro:

      'Unlimited messages (no cooldown), unlimited uploads, deep research & web search without caps, full conversation memory, priority responses',

  },

  {

    id: 'systems',

    name: 'Systems',

    free:

      '2 AI generations/month — SOP builder, process health checks, system maps, and automation suggestions',

    pro:

      'Unlimited SOPs, system design, health diagnostics, workflow optimization, and export-ready process docs',

  },

  {

    id: 'revenue',

    name: 'Revenue Intelligence',

    free:

      '2 AI runs/month — dashboards, pricing insights, LTV views, scenario planning, and optimization prompts',

    pro:

      'Unlimited AI, Revenue Command Center, visual forecasts, goal milestone tracking, and full Google Sheets export',

  },

  {

    id: 'leadership',

    name: 'Leadership',

    free:

      '2 AI runs/month — decision frameworks, communication coaching, conflict playbooks, CEO routines',

    pro:

      'Unlimited leadership coaching, assessments, decision support, and personalized executive routines',

  },

  {

    id: 'teams',

    name: 'Teams',

    free:

      '2 AI runs/month — team DNA, task assignment, rituals, cofounder matching, and health snapshots',

    pro:

      'Unlimited team DNA, assignments, rituals, cofounder insights, and ongoing team health monitoring',

  },

  {

    id: 'competitor',

    name: 'Competitive Intelligence',

    free:

      '2 competitor analyses/month — market scans, positioning, and saved analysis reports',

    pro:

      'Unlimited competitive deep-dives, competitor tracking, and saved analysis library without monthly caps',

  },

  {

    id: 'venture_quest',

    name: 'Venture Quest — skill path & daily focus',

    free:

      'Sales Mastery branch only, 3 path steps per day, 2 AI task generations per month, 1 active goal, basic streaks',

    pro:

      'All 4 skill branches with auto-expanding path, unlimited milestones, unlimited AI-generated tasks, streak multipliers, multiple goals',

  },

  {

    id: 'discover',

    name: 'Discover & dashboard',

    free:

      'Full access to personalized content, roadmap suggestions, mood check-ins, and onboarding — no extra AI meter here',

    pro:

      'Same experience, plus Pro badge on your account and priority treatment as new Pro-only features ship',

  },

  {

    id: 'integrations',

    name: 'Integrations (Settings → Integrations)',

    free: 'Google Calendar/Docs and Notion are not available on Free',

    pro:

      'Connect Google (Docs, Sheets, Calendar), Notion, and Slack in Settings → Integrations',

  },

  {

    id: 'extras',

    name: 'Billing & account',

    free: 'Upgrade anytime from Settings → Your plan; fair-use limits reset monthly',

    pro:

      'Pro plan badge, priority support, manage or cancel subscription in Settings → Your plan',

  },

]



export const FREE_PLAN_LIMITS_SUMMARY = [

  'Every Pro module stays open — you hit monthly caps on AI runs',

  'Bizora: 5 messages, then an 8-hour wait before 5 more',

  '2 AI uses per month each for Systems, Revenue, Leadership, Teams, Competitive Intelligence & Venture Quest',

  '2 Bizora file uploads per month',

  'No Google or Notion integrations',

]

