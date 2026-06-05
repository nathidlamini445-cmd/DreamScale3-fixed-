import { NextRequest, NextResponse } from 'next/server'
import { applyPayfastItn } from '@/lib/payfast/apply-itn'
import {
  parsePayfastItnBody,
  validatePayfastItn,
} from '@/lib/payfast/validate-itn'

export const dynamic = 'force-dynamic'

/**
 * PayFast ITN webhook (no Clerk session — verified via PayFast signature).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const data = parsePayfastItnBody(rawBody)

    if (!data || Object.keys(data).length === 0) {
      return new NextResponse('EMPTY', { status: 400 })
    }

    const validation = await validatePayfastItn(data)
    if (!validation.ok) {
      console.warn('[PayFast ITN] Rejected:', validation.reason, {
        payment_status: data.payment_status,
        m_payment_id: data.m_payment_id,
        pf_payment_id: data.pf_payment_id,
      })
      return new NextResponse('INVALID', { status: 400 })
    }

    const userId = data.custom_str1

    console.info('[PayFast ITN] Valid notification', {
      payment_status: data.payment_status,
      m_payment_id: data.m_payment_id,
      pf_payment_id: data.pf_payment_id,
      custom_str1: userId,
    })

    const applied = await applyPayfastItn(data)
    if (!applied.ok) {
      console.error('[PayFast ITN] Apply failed:', applied.reason)
      return new NextResponse('APPLY_FAILED', { status: 500 })
    }

    if (!applied.skipped) {
      console.info('[PayFast ITN] Applied Pro subscription for user:', userId)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('[PayFast ITN] Error:', err)
    return new NextResponse('ERROR', { status: 500 })
  }
}
