import fs from 'fs'
import path from 'path'

const patches = [
  {
    files: [
      'app/api/systems/generate/route.ts',
      'app/api/systems/generate-sop/route.ts',
      'app/api/systems/analyze-health/route.ts',
    ],
    bucket: 'systems',
  },
  {
    files: [
      'app/api/revenue/analyze/route.ts',
      'app/api/revenue/dashboard/route.ts',
      'app/api/revenue/goal-tracker/route.ts',
      'app/api/revenue/ltv/route.ts',
      'app/api/revenue/optimize/route.ts',
      'app/api/revenue/pricing-strategy/route.ts',
      'app/api/revenue/scenario/route.ts',
    ],
    bucket: 'revenue',
  },
  {
    files: [
      'app/api/leadership/analyze-decision/route.ts',
      'app/api/leadership/analyze-feedback/route.ts',
      'app/api/leadership/assess-style/route.ts',
      'app/api/leadership/generate-routine/route.ts',
      'app/api/leadership/resolve-conflict/route.ts',
      'app/api/leadership/review-communication/route.ts',
      'app/api/leadership/simulate-challenge/route.ts',
    ],
    bucket: 'leadership',
  },
  {
    files: [
      'app/api/teams/analyze-dna/route.ts',
      'app/api/teams/assign-tasks/route.ts',
      'app/api/teams/generate-ritual/route.ts',
      'app/api/teams/match-cofounder/route.ts',
      'app/api/teams/monitor-health/route.ts',
      'app/api/teams/find-real-matches/route.ts',
    ],
    bucket: 'teams',
  },
  {
    files: [
      'app/api/dreampulse/analyze/route.ts',
      'app/api/dreampulse/initial-scrape/route.ts',
      'app/api/analyze-competitor/route.ts',
    ],
    bucket: 'competitor',
  },
]

const importLine =
  "import { requireMonthlyQuota } from '@/lib/usage-quota/require-monthly'"
const guardTpl = (b) =>
  `    const quotaGate = await requireMonthlyQuota('${b}')\n    if (quotaGate.error) return quotaGate.error\n`

const root = process.cwd()
const seen = new Set()

for (const { files, bucket } of patches) {
  for (const rel of files) {
    if (seen.has(rel)) continue
    seen.add(rel)
    const fp = path.join(root, rel)
    if (!fs.existsSync(fp)) {
      console.log('skip missing', rel)
      continue
    }
    let c = fs.readFileSync(fp, 'utf8')
    if (c.includes('requireMonthlyQuota')) {
      console.log('skip done', rel)
      continue
    }
    if (!c.includes(importLine)) {
      const exportIdx = c.indexOf('export async')
      let lastImport = 0
      let pos = 0
      while (pos < exportIdx) {
        const i = c.indexOf('import ', pos)
        if (i === -1 || i >= exportIdx) break
        lastImport = i
        pos = i + 1
      }
      const lineEnd = c.indexOf('\n', lastImport)
      c = c.slice(0, lineEnd + 1) + importLine + '\n' + c.slice(lineEnd + 1)
    }
    const tryMatch = c.match(/export async function POST[^{]*\{\s*try \{/)
    if (!tryMatch) {
      console.log('no try', rel)
      continue
    }
    const insertPos = tryMatch.index + tryMatch[0].length
    c = c.slice(0, insertPos) + '\n' + guardTpl(bucket) + c.slice(insertPos)
    fs.writeFileSync(fp, c)
    console.log('patched', rel)
  }
}
