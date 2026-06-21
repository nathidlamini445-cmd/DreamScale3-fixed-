import type { BusinessSystem } from '@/components/systems/SystemBuilder'
import type { SmartTaskAssignment } from '@/lib/teams-types'
import type { GoogleSheetExport, SheetTab } from './sheet-types'

import { formatToolLabel, toSheetCell } from './sheet-cell'
type RoadmapSuggestion = {
  id: string
  title: string
  description: string
  whyItMatters: string
  howToStart: string[]
  feature: string
  category: string
  priority: string
  estimatedTime?: string
}

type DeepFocusArea = {
  title: string
  description: string
  keyQuestions: string[]
  systemsToCreate: string[]
}

type RevenueAnalysisInput = {
  companyName: string
  industry: string
  analysis: {
    revenueStreams: {
      name: string
      type: string
      estimatedRevenue: string
      growthRate: string
      description: string
    }[]
    pricingStrategy: { model: string; analysis: string; recommendations: string[] }
    marketPosition: { position: string; competitors: string[]; differentiation: string }
    growthOpportunities: { opportunity: string; potential: string; actionItems: string[] }[]
    revenueProjections: { timeframe: string; projection: string; assumptions: string[] }[]
  }
}

type CompetitiveIntelligenceInput = {
  subject: string
  analysisResult: string
  data?: {
    companyIndustry?: string
    initiativeFrequency?: string
    uniqueApproach?: string
    weaknesses?: string
    yourAdvantage?: string
    targetStakeholders?: string[]
    projectTypes?: string[]
    collaborationMethods?: string[]
    valueCreation?: string[]
    skillRating?: {
      innovation: number
      execution: number
      leadership: number
      persistence: number
    }
  }
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]]/g, ' ').trim().slice(0, 80)
  return cleaned || 'Sheet'
}

function parseMarkdownSections(markdown: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = []
  const lines = markdown.split('\n')
  let startIndex = 0
  if (lines[0]?.match(/^# /)) startIndex = 1

  let currentTitle = ''
  let currentContent: string[] = []

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim(),
        })
      }
      currentTitle = line.slice(3).trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    })
  }

  return sections
}

export function formatSystemForSheet(system: BusinessSystem): GoogleSheetExport {
  const sheets: SheetTab[] = []

  const overviewRows: string[][] = [
    ['Field', 'Value'],
    ['System name', system.name],
    ['Type', system.type],
    ['Status', system.status],
    ['Last analyzed', new Date(system.lastAnalyzed).toLocaleDateString()],
  ]

  if (system.healthAnalysis?.score != null) {
    overviewRows.push(['Health score', `${system.healthAnalysis.score}/100`])
  }
  for (const issue of system.healthAnalysis?.issues ?? []) {
    overviewRows.push(['Issue', issue])
  }
  for (const rec of system.healthAnalysis?.recommendations ?? []) {
    overviewRows.push(['Recommendation', rec])
  }
  for (const tool of system.tools) {
    overviewRows.push(['Tool', formatToolLabel(tool)])
  }
  for (const opp of system.automationOpportunities) {
    overviewRows.push(['Automation opportunity', toSheetCell(opp)])
  }

  sheets.push({ name: 'Overview', rows: overviewRows })

  if (system.metrics.length) {
    sheets.push({
      name: 'Metrics',
      rows: [
        ['Metric', 'Current', 'Target', 'Unit'],
        ...system.metrics.map((m) => [
          m.name,
          String(m.currentValue),
          String(m.targetValue),
          m.unit,
        ]),
      ],
    })
  }

  if (system.workflows.length) {
    const workflowRows: string[][] = [['Workflow', 'Step #', 'Step']]
    for (const workflow of system.workflows) {
      workflow.steps.forEach((step, index) => {
        workflowRows.push([workflow.name, String(index + 1), step])
      })
    }
    sheets.push({ name: 'Workflows', rows: workflowRows })
  }

  if (system.roles.length) {
    const roleRows: string[][] = [['Role', 'Responsibility']]
    for (const role of system.roles) {
      for (const resp of role.responsibilities) {
        roleRows.push([role.name, resp])
      }
    }
    sheets.push({ name: 'Roles', rows: roleRows })
  }

  return {
    title: `${system.name} — DreamScale Systems`,
    sheets: sheets.map((s) => ({ ...s, name: sanitizeSheetName(s.name) })),
  }
}

export function formatRoadmapForSheet(opts: {
  businessName?: string
  mainSuggestions: RoadmapSuggestion[]
  dailySuggestions: RoadmapSuggestion[]
  deepFocusAreas: DeepFocusArea[]
  completedIds: string[]
}): GoogleSheetExport {
  const name = opts.businessName?.trim() || 'Your Business'
  const sheets: SheetTab[] = []

  if (opts.mainSuggestions.length) {
    sheets.push({
      name: 'Milestones',
      rows: [
        [
          'Title',
          'Status',
          'Category',
          'Priority',
          'Feature',
          'Est. time',
          'Description',
          'Why it matters',
          'Steps',
        ],
        ...opts.mainSuggestions.map((s) => [
          toSheetCell(s.title),
          opts.completedIds.includes(s.id) ? 'Done' : 'Not started',
          toSheetCell(s.category),
          toSheetCell(s.priority),
          toSheetCell(s.feature),
          toSheetCell(s.estimatedTime),
          toSheetCell(s.description),
          toSheetCell(s.whyItMatters),
          (Array.isArray(s.howToStart) ? s.howToStart : [])
            .map((step, i) => `${i + 1}. ${toSheetCell(step)}`)
            .join('\n'),
        ]),
      ],
    })
  }

  if (opts.deepFocusAreas.length) {
    sheets.push({
      name: 'Strategic Focus',
      rows: [
        ['Area', 'Description', 'Key questions', 'Systems to build'],
        ...opts.deepFocusAreas.map((area) => [
          toSheetCell(area.title),
          toSheetCell(area.description),
          (Array.isArray(area.keyQuestions) ? area.keyQuestions : [])
            .map(toSheetCell)
            .join('\n'),
          (Array.isArray(area.systemsToCreate) ? area.systemsToCreate : [])
            .map(toSheetCell)
            .join('\n'),
        ]),
      ],
    })
  }

  if (opts.dailySuggestions.length) {
    sheets.push({
      name: 'Daily Actions',
      rows: [
        ['Title', 'Description', 'Category', 'Priority'],
        ...opts.dailySuggestions.map((s) => [
          toSheetCell(s.title),
          toSheetCell(s.description),
          toSheetCell(s.category),
          toSheetCell(s.priority),
        ]),
      ],
    })
  }

  return {
    title: `${name} — DreamScale Roadmap`,
    sheets: sheets.map((s) => ({ ...s, name: sanitizeSheetName(s.name) })),
  }
}

export function formatRevenueForSheet(analysis: RevenueAnalysisInput): GoogleSheetExport {
  const sheets: SheetTab[] = []

  sheets.push({
    name: 'Overview',
    rows: [
      ['Field', 'Value'],
      ['Company', analysis.companyName],
      ['Industry', analysis.industry],
      ['Pricing model', analysis.analysis.pricingStrategy.model],
      ['Pricing analysis', analysis.analysis.pricingStrategy.analysis],
      ['Market position', analysis.analysis.marketPosition.position],
      ['Differentiation', analysis.analysis.marketPosition.differentiation],
      ...analysis.analysis.pricingStrategy.recommendations.map((rec) => [
        'Pricing recommendation',
        rec,
      ]),
      ...analysis.analysis.marketPosition.competitors.map((comp) => ['Competitor', comp]),
    ],
  })

  if (analysis.analysis.revenueStreams.length) {
    sheets.push({
      name: 'Revenue Streams',
      rows: [
        ['Stream', 'Type', 'Est. revenue', 'Growth', 'Description'],
        ...analysis.analysis.revenueStreams.map((s) => [
          s.name,
          s.type,
          s.estimatedRevenue,
          s.growthRate,
          s.description,
        ]),
      ],
    })
  }

  if (analysis.analysis.growthOpportunities.length) {
    const rows: string[][] = [['Opportunity', 'Potential', 'Action item']]
    for (const opp of analysis.analysis.growthOpportunities) {
      if (!opp.actionItems.length) {
        rows.push([opp.opportunity, opp.potential, ''])
      } else {
        opp.actionItems.forEach((item, index) => {
          rows.push([index === 0 ? opp.opportunity : '', index === 0 ? opp.potential : '', item])
        })
      }
    }
    sheets.push({ name: 'Growth', rows })
  }

  if (analysis.analysis.revenueProjections.length) {
    const rows: string[][] = [['Timeframe', 'Projection', 'Assumption']]
    for (const proj of analysis.analysis.revenueProjections) {
      if (!proj.assumptions.length) {
        rows.push([proj.timeframe, proj.projection, ''])
      } else {
        proj.assumptions.forEach((assumption, index) => {
          rows.push([
            index === 0 ? proj.timeframe : '',
            index === 0 ? proj.projection : '',
            assumption,
          ])
        })
      }
    }
    sheets.push({ name: 'Projections', rows })
  }

  return {
    title: `${analysis.companyName} — Revenue Intelligence`,
    sheets: sheets.map((s) => ({ ...s, name: sanitizeSheetName(s.name) })),
  }
}

export function formatTaskAssignmentForSheet(
  assignment: SmartTaskAssignment
): GoogleSheetExport {
  const memberName = (id?: string) =>
    assignment.teamMembers.find((m) => m.id === id)?.name ?? id ?? 'Unassigned'

  const taskRows: string[][] = [
    ['Task', 'Priority', 'Assigned to', 'Description', 'AI reasoning'],
    ...assignment.tasks.map((task) => [
      task.title,
      task.priority,
      memberName(task.assignedTo),
      task.description ?? '',
      task.aiAssignment?.reasoning ?? '',
    ]),
  ]

  const memberRows: string[][] = [
    ['Name', 'Role', 'Skills', 'Workload %'],
    ...assignment.teamMembers.map((m) => [
      m.name,
      m.role,
      m.skills.join(', '),
      String(m.workload),
    ]),
  ]

  const sheets: SheetTab[] = [
    {
      name: 'Tasks',
      rows: assignment.assignmentStrategy
        ? [
            ['Assignment strategy', assignment.assignmentStrategy],
            [],
            ...taskRows,
          ]
        : taskRows,
    },
    { name: 'Team', rows: memberRows },
  ]

  return {
    title: `${assignment.projectName} — Task Assignment`,
    sheets: sheets.map((s) => ({ ...s, name: sanitizeSheetName(s.name) })),
  }
}

export function formatCompetitiveIntelligenceForSheet(
  input: CompetitiveIntelligenceInput
): GoogleSheetExport {
  const sheets: SheetTab[] = []
  const d = input.data

  const profileRows: string[][] = [['Field', 'Value'], ['Subject', input.subject]]
  if (d?.companyIndustry) profileRows.push(['Industry', d.companyIndustry])
  if (d?.initiativeFrequency) profileRows.push(['Initiative frequency', d.initiativeFrequency])
  if (d?.uniqueApproach) profileRows.push(['Unique approach', d.uniqueApproach])
  if (d?.weaknesses) profileRows.push(['Weaknesses', d.weaknesses])
  if (d?.yourAdvantage) profileRows.push(['Your advantage', d.yourAdvantage])
  for (const item of d?.targetStakeholders ?? []) {
    profileRows.push(['Stakeholder', item])
  }
  for (const item of d?.projectTypes ?? []) {
    profileRows.push(['Project type', item])
  }
  for (const item of d?.collaborationMethods ?? []) {
    profileRows.push(['Collaboration method', item])
  }
  for (const item of d?.valueCreation ?? []) {
    profileRows.push(['Value created', item])
  }

  sheets.push({ name: 'Profile', rows: profileRows })

  if (d?.skillRating) {
    sheets.push({
      name: 'Skill ratings',
      rows: [
        ['Skill', 'Rating (1-10)'],
        ['Innovation', String(d.skillRating.innovation)],
        ['Execution', String(d.skillRating.execution)],
        ['Leadership', String(d.skillRating.leadership)],
        ['Persistence', String(d.skillRating.persistence)],
      ],
    })
  }

  const sections = parseMarkdownSections(input.analysisResult)
  if (sections.length) {
    sheets.push({
      name: 'Analysis',
      rows: [
        ['Section', 'Content'],
        ...sections.map((s) => [s.title, s.content]),
      ],
    })
  } else if (input.analysisResult.trim()) {
    sheets.push({
      name: 'Analysis',
      rows: [['Section', 'Content'], ['Full report', input.analysisResult]],
    })
  }

  return {
    title: `${input.subject} — Competitive Intelligence`,
    sheets: sheets.map((s) => ({ ...s, name: sanitizeSheetName(s.name) })),
  }
}

