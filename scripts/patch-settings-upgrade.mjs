import fs from 'fs'

const p = 'components/settings-modal.tsx'
let c = fs.readFileSync(p, 'utf8')
const start = c.indexOf('      case "upgrade":')
const end = c.indexOf('      default:', start)
if (start < 0 || end < 0) {
  console.error('markers not found', start, end)
  process.exit(1)
}
const repl = `      case "upgrade":
        return <PlanBillingSection />
      case "integrations":
        return <IntegrationsSection />
`
c = c.slice(0, start) + repl + c.slice(end)
fs.writeFileSync(p, c)
console.log('patched')
