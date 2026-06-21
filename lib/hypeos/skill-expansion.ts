import type { Skill, SkillBranch, SkillTree } from './skill-tree'

/** Always keep this many skills ahead of the user's furthest mastered node */
const SKILLS_BUFFER = 2

/** Max generated skills per branch (safety cap) */
const MAX_SKILLS_PER_BRANCH = 24

type SkillTemplate = {
  name: string
  description: string
  icon: string
  difficulty: Skill['difficulty']
  taskLabels: string[]
}

const EXPANSION_TEMPLATES: Record<string, SkillTemplate[]> = {
  sales: [
    {
      name: 'Discovery Call Framework',
      description: 'Run structured discovery calls that uncover real pain and budget',
      icon: '🎯',
      difficulty: 'intermediate',
      taskLabels: [
        'Write your discovery script',
        'Book 3 discovery calls',
        'Ask budget-timeline questions',
        'Document pain points',
        'Send recap emails',
        'Refine based on feedback',
      ],
    },
    {
      name: 'Objection Handling',
      description: 'Turn pushback into progress with proven rebuttal frameworks',
      icon: '🛡️',
      difficulty: 'intermediate',
      taskLabels: [
        'List your top 5 objections',
        'Write responses for each',
        'Practice on 5 calls',
        'Log what worked',
        'Update your playbook',
        'Role-play with a peer',
      ],
    },
    {
      name: 'Proposal & Pricing',
      description: 'Package offers and price with confidence',
      icon: '📋',
      difficulty: 'advanced',
      taskLabels: [
        'Build a proposal template',
        'Define 3 pricing tiers',
        'Send 2 proposals',
        'Follow up within 24h',
        'Negotiate one deal',
        'Track win rate',
        'Iterate pricing copy',
      ],
    },
    {
      name: 'Pipeline Management',
      description: 'Forecast revenue and keep deals moving through stages',
      icon: '📊',
      difficulty: 'advanced',
      taskLabels: [
        'Map your sales stages',
        'Clean your pipeline',
        'Set weekly review ritual',
        'Move 5 deals forward',
        'Identify stuck deals',
        'Create re-engagement emails',
        'Update forecast',
        'Close or disqualify stale leads',
      ],
    },
    {
      name: 'Account Expansion',
      description: 'Grow revenue from existing customers through upsells and renewals',
      icon: '📈',
      difficulty: 'expert',
      taskLabels: [
        'Segment top accounts',
        'Identify expansion triggers',
        'Schedule check-in calls',
        'Pitch one upsell',
        'Document expansion playbook',
        'Set renewal reminders',
        'Build case study from win',
        'Automate health scoring',
        'Plan quarterly business review',
        'Hit expansion revenue target',
      ],
    },
    {
      name: 'Enterprise Sales Motion',
      description: 'Navigate long cycles, multiple stakeholders, and procurement',
      icon: '🏛️',
      difficulty: 'expert',
      taskLabels: [
        'Map decision-makers',
        'Build champion relationship',
        'Create mutual action plan',
        'Handle security review',
        'Align legal on terms',
        'Present to buying committee',
        'Negotiate enterprise contract',
        'Document lessons learned',
        'Template your enterprise playbook',
        'Land one enterprise logo',
      ],
    },
  ],
  content: [
    {
      name: 'Content Repurposing',
      description: 'Turn one idea into a week of posts across formats',
      icon: '♻️',
      difficulty: 'intermediate',
      taskLabels: [
        'Pick your pillar piece',
        'Cut into 5 micro-posts',
        'Create 3 carousel slides',
        'Draft a thread',
        'Schedule the week',
        'Review engagement',
      ],
    },
    {
      name: 'Hook & Storytelling',
      description: 'Write openings that stop the scroll and hold attention',
      icon: '✍️',
      difficulty: 'intermediate',
      taskLabels: [
        'Study 10 viral hooks',
        'Write 20 hook variations',
        'A/B test 3 openings',
        'Track retention metrics',
        'Refine your hook library',
        'Apply to next 5 posts',
      ],
    },
    {
      name: 'YouTube Growth Systems',
      description: 'Publish consistently with thumbnails, titles, and retention in mind',
      icon: '▶️',
      difficulty: 'advanced',
      taskLabels: [
        'Research 10 competitor titles',
        'Design 3 thumbnails',
        'Script one video',
        'Record and publish',
        'Analyze audience retention',
        'Improve next thumbnail',
        'Reply to every comment',
        'Plan next 4 videos',
      ],
    },
    {
      name: 'Newsletter Engine',
      description: 'Build an owned audience with a repeatable newsletter rhythm',
      icon: '📬',
      difficulty: 'advanced',
      taskLabels: [
        'Choose newsletter angle',
        'Write welcome sequence',
        'Publish issue #1',
        'Grow list by 50',
        'Survey readers',
        'Iterate format',
        'Hit open-rate benchmark',
        'Monetize or drive offers',
      ],
    },
    {
      name: 'Brand Authority',
      description: 'Position yourself as the go-to voice in your niche',
      icon: '👑',
      difficulty: 'expert',
      taskLabels: [
        'Define your POV',
        'Publish thought-leadership piece',
        'Guest on one podcast',
        'Collaborate with peer creator',
        'Launch signature series',
        'Build media kit',
        'Pitch 5 partnerships',
        'Measure inbound leads',
        'Document authority playbook',
        'Sustain 90-day content cadence',
      ],
    },
  ],
  marketing: [
    {
      name: 'Landing Page Conversion',
      description: 'Turn traffic into signups with clear offers and proof',
      icon: '🖥️',
      difficulty: 'intermediate',
      taskLabels: [
        'Audit current page',
        'Rewrite headline + CTA',
        'Add social proof',
        'Run 100 visitors test',
        'Measure conversion rate',
        'Iterate one variable',
      ],
    },
    {
      name: 'Email Funnel',
      description: 'Automate nurture sequences that warm leads to buy',
      icon: '📧',
      difficulty: 'intermediate',
      taskLabels: [
        'Map funnel stages',
        'Write 5-email sequence',
        'Set up automation',
        'Segment your list',
        'Track open and click rates',
        'Optimize weak email',
      ],
    },
    {
      name: 'Paid Ads Foundations',
      description: 'Launch profitable small-budget campaigns with clear ROAS',
      icon: '💳',
      difficulty: 'advanced',
      taskLabels: [
        'Define campaign goal',
        'Write 3 ad variations',
        'Set daily budget cap',
        'Launch test campaign',
        'Kill losers fast',
        'Scale winner',
        'Track cost per lead',
        'Document ad playbook',
      ],
    },
    {
      name: 'SEO & Organic Growth',
      description: 'Rank for keywords your buyers actually search',
      icon: '🔍',
      difficulty: 'advanced',
      taskLabels: [
        'Keyword research',
        'Outline 3 articles',
        'Publish optimized post',
        'Build 5 internal links',
        'Track rankings',
        'Update underperformers',
        'Earn 2 backlinks',
        'Measure organic traffic',
      ],
    },
    {
      name: 'Growth Experiments',
      description: 'Run fast tests, double down on winners, kill losers',
      icon: '🧪',
      difficulty: 'expert',
      taskLabels: [
        'Build experiment backlog',
        'Run 3 tests this week',
        'Document hypotheses',
        'Measure leading indicators',
        'Ship winning experiment',
        'Share learnings',
        'Automate repeatable win',
        'Set monthly growth target',
        'Review channel mix',
        'Plan next quarter experiments',
      ],
    },
  ],
  networking: [
    {
      name: 'Warm Outreach',
      description: 'Start conversations that feel personal, not spammy',
      icon: '💬',
      difficulty: 'intermediate',
      taskLabels: [
        'Build prospect list',
        'Personalize 10 messages',
        'Send value-first DMs',
        'Book 2 calls',
        'Follow up thoughtfully',
        'Log conversation notes',
      ],
    },
    {
      name: 'Event Networking',
      description: 'Turn conferences and meetups into real relationships',
      icon: '🎤',
      difficulty: 'intermediate',
      taskLabels: [
        'Pick one event',
        'Prepare 30-sec intro',
        'Set 3 connection goals',
        'Collect 10 contacts',
        'Follow up within 48h',
        'Schedule 2 follow-ups',
      ],
    },
    {
      name: 'Mentor & Advisor Circle',
      description: 'Build a board of mentors who accelerate your decisions',
      icon: '🎓',
      difficulty: 'advanced',
      taskLabels: [
        'List dream mentors',
        'Craft outreach template',
        'Ask for 20-min calls',
        'Prepare specific questions',
        'Send thank-you notes',
        'Share progress updates',
        'Offer value back',
        'Quarterly mentor check-in',
      ],
    },
    {
      name: 'Strategic Partnerships',
      description: 'Co-market and co-sell with complementary businesses',
      icon: '🤝',
      difficulty: 'advanced',
      taskLabels: [
        'Identify 10 partners',
        'Pitch win-win collab',
        'Draft partnership terms',
        'Launch joint offer',
        'Track referral revenue',
        'Renew top partnership',
        'Template partnership deck',
        'Scale partner pipeline',
      ],
    },
    {
      name: 'Community Leadership',
      description: 'Become the connector others want in their network',
      icon: '🌐',
      difficulty: 'expert',
      taskLabels: [
        'Host one community event',
        'Introduce 5 people',
        'Share weekly insights',
        'Moderate discussion',
        'Spot collaboration opportunities',
        'Build referral system',
        'Measure network ROI',
        'Document relationship CRM',
        'Plan annual network goals',
        'Become known in your niche',
      ],
    },
  ],
}

function scaleDifficulty(tier: number): Skill['difficulty'] {
  if (tier < 2) return 'intermediate'
  if (tier < 5) return 'advanced'
  return 'expert'
}

function scaleRequiredTasks(difficulty: Skill['difficulty']): number {
  switch (difficulty) {
    case 'beginner':
      return 3
    case 'intermediate':
      return 5
    case 'advanced':
      return 7
    case 'expert':
      return 10
    default:
      return 5
  }
}

function scalePoints(difficulty: Skill['difficulty'], tier: number): number {
  const base =
    difficulty === 'beginner'
      ? 600
      : difficulty === 'intermediate'
        ? 1500
        : difficulty === 'advanced'
          ? 3000
          : 5000
  return base + tier * 400
}

function scaleRewards(difficulty: Skill['difficulty'], tier: number) {
  const unlock =
    difficulty === 'beginner'
      ? 100
      : difficulty === 'intermediate'
        ? 200
        : difficulty === 'advanced'
          ? 400
          : 600
  const mastery =
    difficulty === 'beginner'
      ? 500
      : difficulty === 'intermediate'
        ? 1000
        : difficulty === 'advanced'
          ? 2000
          : 3500
  return {
    unlockReward: unlock + tier * 25,
    masteryReward: mastery + tier * 100,
  }
}

function estimatedTimeFor(difficulty: Skill['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return '1-2 hours'
    case 'intermediate':
      return '3-5 hours'
    case 'advanced':
      return '5-8 hours'
    case 'expert':
      return '8-12 hours'
  }
}

export function getSkillTaskLabels(skill: Skill): string[] {
  const genMatch = skill.id.match(/^(\w+)-gen-(\d+)$/)
  if (genMatch) {
    const branchId = genMatch[1]
    const genIndex = parseInt(genMatch[2], 10) - 1
    const templates = EXPANSION_TEMPLATES[branchId]
    if (templates?.length) {
      const template = templates[genIndex % templates.length]
      const tier = Math.floor(genIndex / templates.length)
      const labels = [...template.taskLabels]
      while (labels.length < skill.requiredTasks) {
        labels.push(`${template.name} · deep practice ${labels.length + 1}`)
      }
      if (tier > 0) {
        return labels.map((l) => (tier > 1 ? `[L${tier + 2}] ${l}` : l))
      }
      return labels.slice(0, skill.requiredTasks)
    }
  }
  return []
}

export function generateNextSkill(branch: SkillBranch, generationIndex: number): Skill {
  const templates = EXPANSION_TEMPLATES[branch.id] ?? EXPANSION_TEMPLATES.sales
  const template = templates[generationIndex % templates.length]
  const tier = Math.floor(generationIndex / templates.length)
  const difficulty =
    generationIndex < templates.length
      ? template.difficulty
      : scaleDifficulty(tier)

  const suffix = tier > 0 ? ` · Level ${tier + 2}` : ''
  const prevSkill = branch.skills[branch.skills.length - 1]
  const requiredTasks = scaleRequiredTasks(difficulty)
  const requiredPoints = scalePoints(difficulty, generationIndex)
  const rewards = scaleRewards(difficulty, generationIndex)

  return {
    id: `${branch.id}-gen-${branch.skills.length + 1}`,
    name: `${template.name}${suffix}`,
    description: template.description,
    category: branch.id,
    icon: template.icon,
    prerequisites: prevSkill ? [prevSkill.id] : [],
    requiredTasks,
    requiredPoints,
    unlocked: false,
    progress: 0,
    tasksCompleted: 0,
    pointsEarned: 0,
    mastered: false,
    unlockReward: rewards.unlockReward,
    masteryReward: rewards.masteryReward,
    difficulty,
    estimatedTime: estimatedTimeFor(difficulty),
  }
}

function defaultSkillCount(branchId: string): number {
  const defaults: Record<string, number> = {
    sales: 3,
    content: 3,
    marketing: 2,
    networking: 2,
  }
  return defaults[branchId] ?? 2
}

function generationIndexForBranch(branch: SkillBranch): number {
  return branch.skills.filter((s) => s.id.includes('-gen-')).length
}

/** Append skills so the path keeps growing as users master content */
export function expandBranch(branch: SkillBranch): boolean {
  if (branch.skills.length >= MAX_SKILLS_PER_BRANCH) return false

  const masteredCount = branch.skills.filter((s) => s.mastered).length
  const targetLength = Math.max(
    defaultSkillCount(branch.id) + 1,
    masteredCount + SKILLS_BUFFER + 1
  )

  let added = false
  while (branch.skills.length < targetLength && branch.skills.length < MAX_SKILLS_PER_BRANCH) {
    const genIndex = generationIndexForBranch(branch)
    branch.skills.push(generateNextSkill(branch, genIndex))
    added = true
  }

  return added
}

export function expandSkillTree(tree: SkillTree): SkillTree {
  let changed = false
  tree.branches.forEach((branch) => {
    if (expandBranch(branch)) changed = true
    branch.progress =
      branch.skills.length > 0
        ? branch.skills.reduce((sum, s) => sum + s.progress, 0) / branch.skills.length
        : 0
  })

  if (changed) {
    tree.totalSkills = tree.branches.reduce((sum, b) => sum + b.skills.length, 0)
  }

  return tree
}

/** Unlock the skill immediately after a mastered prerequisite */
export function unlockNextInChain(tree: SkillTree): SkillTree {
  const mastered = new Set(
    tree.branches.flatMap((b) => b.skills.filter((s) => s.mastered).map((s) => s.id))
  )

  tree.branches.forEach((branch) => {
    branch.skills.forEach((skill) => {
      if (!skill.unlocked && !skill.mastered) {
        const prereqsMet = skill.prerequisites.every((p) => mastered.has(p))
        if (prereqsMet && skill.prerequisites.length > 0) {
          skill.unlocked = true
          skill.unlockedAt = new Date()
        }
      }
    })
  })

  return tree
}
