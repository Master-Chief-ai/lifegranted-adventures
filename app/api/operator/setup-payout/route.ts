import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSubaccount } from '@/lib/flutterwave'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getCurrentOperator } from '@/lib/operator-auth'

const schema = z.object({
  businessName: z.string().min(2),
  email: z.string().email(),
  bankName: z.string(),
  accountNumber: z.string().min(4),
  accountHolderName: z.string().min(2),
})

const BANK_CODES: Record<string, string> = {
  NMB: '000005',
  CRDB: '000004',
  NBC: '000002',
  Stanbic: '000007',
  Equity: '000010',
  Other: '000000',
}

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json())
    const bankCode = BANK_CODES[data.bankName] ?? BANK_CODES.Other

    const subaccount = await createSubaccount({
      businessName: data.businessName,
      email: data.email,
      bankCode,
      accountNumber: data.accountNumber,
    })

    const subaccountId = subaccount.data?.subaccount_id ?? subaccount.id ?? null

    if (isSupabaseConfigured()) {
      try {
        const operator = await getCurrentOperator()
        const supabase = await createClient()
        await supabase
          .from('operators')
          .update({ flutterwave_subaccount_id: subaccountId, flutterwave_onboarding_complete: true })
          .eq('id', operator.id)
      } catch (error) {
        console.error('Failed to save Flutterwave subaccount to operator', error)
      }
    }

    return NextResponse.json({ success: true, subaccountId })
  } catch (error) {
    console.error('Failed to set up payout account', error)
    return NextResponse.json({ success: false, error: 'Could not save bank details' }, { status: 400 })
  }
}
