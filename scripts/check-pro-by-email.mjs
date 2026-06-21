import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

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

const emails = [
  'narhidlamini445@gmail.com',
  'nervenet450@gmail.com',
  'nathidlamini445@gmail.com',
]

for (const email of emails) {
  const { data, error } = await sb
    .from('user_profiles')
    .select(
      'id,email,subscription_tier,subscription_status,payfast_last_pf_payment_id,subscription_activated_at'
    )
    .eq('email', email)

  console.log('\n---', email, '---')
  if (error) console.log('error:', error.message)
  else console.log(JSON.stringify(data, null, 2))
}

const { data: partial } = await sb
  .from('user_profiles')
  .select('id,email,subscription_tier,subscription_status')
  .ilike('email', '%lamini445%')

console.log('\n--- ilike %lamini445% ---')
console.log(JSON.stringify(partial, null, 2))
