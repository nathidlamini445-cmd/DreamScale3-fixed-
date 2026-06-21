import type {
  LTVAnalysis,
  PricingStrategy,
  RevenueDashboard,
  RevenueData,
  RevenueGoal,
  RevenueOptimization,
  ScenarioPlan,
} from '@/lib/revenue-types'
import { toSheetCell } from '@/lib/google/sheet-cell'
import type { GoogleSheetExport } from '@/lib/google/sheet-types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function formatOptimizationForShare(opt: RevenueOptimization): string {
  let content = `# Revenue Optimization\n\n`
  if (opt.businessInfo) content += `${opt.businessInfo}\n\n`
  if (opt.analysis.pricingChanges.length) {
    content += `## Pricing Changes\n\n`
    for (const c of opt.analysis.pricingChanges) {
      content += `### ${c.suggestion}\nImpact: ${c.impact}\n`
      c.implementation.forEach((s) => { content += `- ${s}\n` })
      content += '\n'
    }
  }
  if (opt.analysis.newRevenueStreams.length) {
    content += `## New Revenue Streams\n\n`
    for (const s of opt.analysis.newRevenueStreams) {
      content += `- **${s.stream}** (${s.effort} effort, ${s.timeline}): ${s.potential}\n`
    }
    content += '\n'
  }
  if (opt.analysis.upsellOpportunities.length) {
    content += `## Upsell Opportunities\n\n`
    for (const u of opt.analysis.upsellOpportunities) {
      content += `- **${u.opportunity}** → ${u.targetSegment} (${u.potentialRevenue})\n`
    }
    content += '\n'
  }
  if (opt.analysis.costReductions.length) {
    content += `## Cost Reductions\n\n`
    for (const c of opt.analysis.costReductions) {
      content += `- **${c.area}**: save ${c.potentialSavings} from ${c.currentCost}\n`
    }
  }
  return content.trim()
}

export function formatDashboardForShare(d: RevenueDashboard): string {
  let content = `# ${d.name} — Revenue Dashboard\n\n`
  content += `MRR: ${fmt(d.mrr)}\nARR: ${fmt(d.arr)}\nChurn: ${d.churnRate}%\nRunway: ${d.runway} months\n\n`
  if (d.forecast.length) {
    content += `## Forecast\n\n`
    for (const f of d.forecast) {
      content += `- ${f.month}: ${fmt(f.projectedRevenue)} (${f.confidence}% confidence)\n`
    }
  }
  return content.trim()
}

export function formatPricingForShare(p: PricingStrategy): string {
  let content = `# Pricing Strategy · ${p.productName}\n\n`
  content += `## Current Pricing\n\n`
  for (const tier of p.currentPricing) {
    content += `- **${tier.tier}**: ${fmt(tier.price)} — ${tier.features.join(', ')}\n`
  }
  if (p.aiRecommendations.optimalPricing.length) {
    content += `\n## AI Recommendations\n\n`
    for (const rec of p.aiRecommendations.optimalPricing) {
      content += `- **${rec.tier}**: ${fmt(rec.price)} — ${rec.reasoning}\n`
    }
  }
  content += `\nMarket position: ${p.aiRecommendations.marketPosition}\n`
  return content.trim()
}

export function formatGoalForShare(g: RevenueGoal): string {
  let content = `# ${g.name}\n\n`
  content += `Target: ${fmt(g.target)} (${g.timeframe})\nProgress: ${fmt(g.currentProgress)} (${Math.round((g.currentProgress / g.target) * 100)}%)\n\n`
  if (g.milestones.length) {
    content += `## Milestones\n\n`
    for (const m of g.milestones) {
      content += `- [${m.achieved ? 'x' : ' '}] ${m.milestone} — ${fmt(m.target)}\n`
    }
  }
  if (g.weeklyActions.length) {
    content += `\n## Weekly Actions\n\n`
    for (const w of g.weeklyActions) {
      content += `### ${w.week} (target ${fmt(w.target)})\n`
      w.actions.forEach((a) => { content += `- ${a}\n` })
    }
  }
  return content.trim()
}

export function formatLtvForShare(l: LTVAnalysis): string {
  let content = `# LTV Analysis · ${l.customerSegment}\n\n`
  content += `LTV: ${fmt(l.averageLTV)} | CAC: ${fmt(l.cac)} | Ratio: ${l.ltvCacRatio.toFixed(1)}x\n\n`
  content += `${l.analysis.segmentValue}\n\n`
  if (l.predictions.length) {
    content += `## Predictions\n\n`
    for (const p of l.predictions) {
      content += `- ${p.timeframe}: ${fmt(p.predictedLTV)} (${p.confidence}% confidence)\n`
    }
  }
  return content.trim()
}

export function formatScenarioForShare(s: ScenarioPlan): string {
  let content = `# Scenario · ${s.name}\n\n${s.scenario}\n\n`
  if (s.projections.length) {
    content += `## Projections\n\n`
    for (const p of s.projections) {
      content += `- ${p.month}: ${fmt(p.revenue)} (impact ${fmt(p.impact)})\n`
    }
  }
  if (s.analysis.summary) content += `\n## Summary\n\n${s.analysis.summary}\n`
  return content.trim()
}

export function formatDashboardForSheet(d: RevenueDashboard): GoogleSheetExport {
  const sheets = [
    {
      name: 'Summary',
      rows: [
        ['Metric', 'Value'],
        ['Name', d.name],
        ['MRR', fmt(d.mrr)],
        ['ARR', fmt(d.arr)],
        ['Churn %', String(d.churnRate)],
        ['Runway (months)', String(d.runway)],
      ],
    },
  ]
  if (d.forecast.length) {
    sheets.push({
      name: 'Forecast',
      rows: [
        ['Month', 'Projected revenue', 'Confidence %'],
        ...d.forecast.map((f) => [f.month, fmt(f.projectedRevenue), String(f.confidence)]),
      ],
    })
  }
  return { title: `${d.name} — Revenue Dashboard`, sheets }
}

export function formatOptimizationForSheet(o: RevenueOptimization): GoogleSheetExport {
  const rows: string[][] = [['Category', 'Item', 'Detail', 'Extra']]
  for (const c of o.analysis.pricingChanges) {
    rows.push(['Pricing', c.suggestion, c.impact, c.implementation.join('; ')])
  }
  for (const s of o.analysis.newRevenueStreams) {
    rows.push(['New stream', s.stream, s.potential, `${s.effort} · ${s.timeline}`])
  }
  for (const u of o.analysis.upsellOpportunities) {
    rows.push(['Upsell', u.opportunity, u.targetSegment, u.potentialRevenue])
  }
  for (const c of o.analysis.costReductions) {
    rows.push(['Cost cut', c.area, c.potentialSavings, c.currentCost])
  }
  return { title: 'Revenue Optimization', sheets: [{ name: 'Optimization', rows }] }
}

export function formatPricingForSheet(p: PricingStrategy): GoogleSheetExport {
  const sheets = [
    {
      name: 'Your pricing',
      rows: [
        ['Tier', 'Price', 'Features'],
        ...p.currentPricing.map((t) => [t.tier, fmt(t.price), t.features.join(', ')]),
      ],
    },
  ]
  if (p.aiRecommendations.optimalPricing.length) {
    sheets.push({
      name: 'AI recommendations',
      rows: [
        ['Tier', 'Price', 'Reasoning'],
        ...p.aiRecommendations.optimalPricing.map((r) => [r.tier, fmt(r.price), r.reasoning]),
      ],
    })
  }
  return { title: `${p.productName} — Pricing`, sheets }
}

export function formatGoalForSheet(g: RevenueGoal): GoogleSheetExport {
  const sheets = [
    {
      name: 'Goal',
      rows: [
        ['Field', 'Value'],
        ['Name', g.name],
        ['Target', fmt(g.target)],
        ['Progress', fmt(g.currentProgress)],
        ['Timeframe', g.timeframe],
        ['Start', g.startDate],
        ['End', g.endDate],
      ],
    },
  ]
  if (g.milestones.length) {
    sheets.push({
      name: 'Milestones',
      rows: [
        ['Milestone', 'Target', 'Achieved', 'Date'],
        ...g.milestones.map((m) => [
          m.milestone,
          fmt(m.target),
          m.achieved ? 'Yes' : 'No',
          m.achievedDate ?? '',
        ]),
      ],
    })
  }
  if (g.weeklyActions.length) {
    const rows: string[][] = [['Week', 'Target', 'Action']]
    for (const w of g.weeklyActions) {
      w.actions.forEach((action, i) => {
        rows.push([i === 0 ? w.week : '', i === 0 ? fmt(w.target) : '', action])
      })
    }
    sheets.push({ name: 'Weekly actions', rows })
  }
  return { title: `${g.name} — Revenue Goal`, sheets }
}

export function formatLtvForSheet(l: LTVAnalysis): GoogleSheetExport {
  return {
    title: `${l.customerSegment} — LTV Analysis`,
    sheets: [
      {
        name: 'LTV',
        rows: [
          ['Metric', 'Value'],
          ['Segment', l.customerSegment],
          ['LTV', fmt(l.averageLTV)],
          ['CAC', fmt(l.cac)],
          ['LTV:CAC', `${l.ltvCacRatio.toFixed(1)}x`],
          ['Segment value', l.analysis.segmentValue],
          ...l.predictions.map((p) => [`Prediction ${p.timeframe}`, fmt(p.predictedLTV)]),
        ],
      },
    ],
  }
}

export function formatScenarioForSheet(s: ScenarioPlan): GoogleSheetExport {
  const sheets = [
    {
      name: 'Scenario',
      rows: [
        ['Name', s.name],
        ['Description', s.scenario],
      ],
    },
  ]
  if (s.projections.length) {
    sheets.push({
      name: 'Projections',
      rows: [
        ['Month', 'Revenue', 'Impact'],
        ...s.projections.map((p) => [p.month, fmt(p.revenue), fmt(p.impact)]),
      ],
    })
  }
  if (s.variables.length) {
    sheets.push({
      name: 'Variables',
      rows: [
        ['Variable', 'Change', 'Value'],
        ...s.variables.map((v) => [v.name, v.change, String(v.value)]),
      ],
    })
  }
  return { title: `${s.name} — Scenario`, sheets }
}

export function formatFullRevenueOsForSheet(data: RevenueData, businessName?: string): GoogleSheetExport {
  const name = businessName?.trim() || 'Your Business'
  const sheets: GoogleSheetExport['sheets'] = []

  if (data.dashboards.length) {
    const latest = data.dashboards[data.dashboards.length - 1]
    sheets.push({
      name: 'Dashboard',
      rows: [
        ['Metric', 'Value'],
        ['Latest dashboard', latest.name],
        ['MRR', fmt(latest.mrr)],
        ['ARR', fmt(latest.arr)],
        ['Churn %', String(latest.churnRate)],
        ['Runway', `${latest.runway} mo`],
        ...latest.forecast.map((f) => [`Forecast ${f.month}`, fmt(f.projectedRevenue)]),
      ],
    })
  }

  if (data.goals.length) {
    const active = data.goals.find((g) => new Date(g.endDate) > new Date()) ?? data.goals[0]
    sheets.push({
      name: 'Goals',
      rows: [
        ['Goal', 'Target', 'Progress', '%', 'Timeframe'],
        ...data.goals.map((g) => [
          g.name,
          fmt(g.target),
          fmt(g.currentProgress),
          `${Math.round((g.currentProgress / g.target) * 100)}%`,
          g.timeframe,
        ]),
      ],
    })
    void active
  }

  if (data.scenarios.length) {
    const rows: string[][] = [['Scenario', 'Month', 'Revenue', 'Impact']]
    for (const sc of data.scenarios) {
      sc.projections.forEach((p, i) => {
        rows.push([i === 0 ? sc.name : '', p.month, fmt(p.revenue), fmt(p.impact)])
      })
    }
    sheets.push({ name: 'Scenarios', rows })
  }

  if (data.ltvAnalyses.length) {
    sheets.push({
      name: 'LTV',
      rows: [
        ['Segment', 'LTV', 'CAC', 'Ratio'],
        ...data.ltvAnalyses.map((l) => [
          l.customerSegment,
          fmt(l.averageLTV),
          fmt(l.cac),
          `${l.ltvCacRatio.toFixed(1)}x`,
        ]),
      ],
    })
  }

  if (data.optimizations.length) {
    const opt = data.optimizations[data.optimizations.length - 1]
    const optSheet = formatOptimizationForSheet(opt)
    sheets.push({ name: 'Optimization', rows: optSheet.sheets[0].rows })
  }

  if (data.weeklyCheckIns?.length) {
    sheets.push({
      name: 'Weekly check-ins',
      rows: [
        ['Week', 'Amount', 'Driver', 'Note', 'Date'],
        ...data.weeklyCheckIns.map((c) => [
          c.weekKey,
          fmt(c.amount),
          c.driver,
          c.note ?? '',
          new Date(c.date).toLocaleDateString(),
        ]),
      ],
    })
  }

  if (!sheets.length) {
    sheets.push({ name: 'RevenueOS', rows: [['Note', 'No revenue data yet — create a dashboard or goal first.']] })
  }

  return {
    title: `${name} — RevenueOS Workspace`,
    sheets: sheets.map((s) => ({ ...s, name: toSheetCell(s.name).slice(0, 80) })),
  }
}
