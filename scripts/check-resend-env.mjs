import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const lines = env.split(/\r?\n/).filter((l) => l.startsWith('RESEND_API_KEY='))
const last = lines[lines.length - 1]
const raw = last ? last.slice('RESEND_API_KEY='.length).trim() : ''
const value = raw.replace(/^["']|["']$/g, '')

console.log('RESEND_API_KEY line found:', Boolean(last))
console.log('RESEND_API_KEY has value:', value.length > 0)
console.log('RESEND_API_KEY length:', value.length)
console.log('Looks like Resend key (re_):', value.startsWith('re_'))

const fromLine = env.split(/\r?\n/).find((l) => l.startsWith('RESEND_FROM='))
const fromVal = fromLine ? fromLine.slice('RESEND_FROM='.length).trim() : ''
console.log('RESEND_FROM has value:', fromVal.length > 0)
