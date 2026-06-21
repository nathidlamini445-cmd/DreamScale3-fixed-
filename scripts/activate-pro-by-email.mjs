import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node scripts/activate-pro-by-email.mjs <email>')
  process.exit(1)
}

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    })
)

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: rows, error: fetchErr } = await sb
  .from('user_profiles')
  .select('id,email,subscription_tier,subscription_status')
  .eq('email', email)

if (fetchErr) {
  console.error(fetchErr.message)
  process.exit(1)
}

if (!rows?.length) {
  console.log('No user_profiles found for', email)
  process.exit(1)
}

const now = new Date()
const periodEnd = new Date(now)
periodEnd.setUTCDate(periodEnd.getUTCDate() + 30)

for (const row of rows) {
  const { error } = await sb
    .from('user_profiles')
    .update({
      subscription_tier: 'pro',
      subscription_status: 'active',
      subscription_activated_at: now.toISOString(),
      subscription_ends_at: periodEnd.toISOString(),
      subscription_cancelled_at: null,
    })
    .eq('id', row.id)

  console.log(
    error
      ? `FAIL ${row.id}: ${error.message}`
      : `OK ${row.id} (${row.email}) -> pro / active`
  )
}
