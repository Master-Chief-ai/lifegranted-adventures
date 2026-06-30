import { adminSupabase } from '@/lib/supabase/admin'
import { COMMISSION } from '@/lib/commission'

export interface GuaranteeFundBalance {
  id: number
  current_balance: number
  total_contributed: number
  total_paid_out: number
  total_recovered: number
  updated_at: string
}

export interface GuaranteeFundTransaction {
  id: string
  booking_id: string | null
  transaction_type: 'contribution' | 'payout_tourist' | 'recovery' | 'adjustment'
  amount: number
  balance_after: number
  notes: string | null
  created_by: string | null
  created_at: string
  bookings?: { booking_ref: string; total_usd: number } | null
}

export async function recordFundContribution(bookingId: string, tourPrice: number) {
  if (!adminSupabase) return null
  const contribution = Math.round(tourPrice * COMMISSION.guaranteeFund * 100) / 100
  const { data: balance } = await adminSupabase.from('guarantee_fund_balance').select('current_balance').single()
  const newBalance = (balance?.current_balance ?? 0) + contribution

  await adminSupabase.from('guarantee_fund_transactions').insert({
    booking_id: bookingId,
    transaction_type: 'contribution',
    amount: contribution,
    balance_after: newBalance,
    notes: `Auto-contribution: 3% of $${tourPrice} tour price`,
  })
  return contribution
}

export async function payTouristFromFund(bookingId: string, amount: number, adminId: string, notes: string) {
  if (!adminSupabase) throw new Error('Database not configured')
  const { data: balance } = await adminSupabase.from('guarantee_fund_balance').select('current_balance').single()

  if ((balance?.current_balance ?? 0) < amount) {
    throw new Error('Insufficient guarantee fund balance')
  }

  await adminSupabase.from('guarantee_fund_transactions').insert({
    booking_id: bookingId,
    transaction_type: 'payout_tourist',
    amount,
    balance_after: (balance?.current_balance ?? 0) - amount,
    notes,
    created_by: adminId,
  })
  return true
}

export async function recordRecovery(bookingId: string, amount: number, notes: string) {
  if (!adminSupabase) throw new Error('Database not configured')
  const { data: balance } = await adminSupabase.from('guarantee_fund_balance').select('current_balance').single()

  await adminSupabase.from('guarantee_fund_transactions').insert({
    booking_id: bookingId,
    transaction_type: 'recovery',
    amount,
    balance_after: (balance?.current_balance ?? 0) + amount,
    notes,
  })
  return true
}

export async function recordAdjustment(amount: number, notes: string, adminId: string) {
  if (!adminSupabase) throw new Error('Database not configured')
  const { data: balance } = await adminSupabase.from('guarantee_fund_balance').select('current_balance').single()

  await adminSupabase.from('guarantee_fund_transactions').insert({
    booking_id: null,
    transaction_type: 'adjustment',
    amount,
    balance_after: (balance?.current_balance ?? 0) + amount,
    notes,
    created_by: adminId,
  })
  return true
}

export async function getFundBalance(): Promise<GuaranteeFundBalance | null> {
  if (!adminSupabase) return null
  const { data } = await adminSupabase.from('guarantee_fund_balance').select('*').single()
  return data
}

export async function getFundTransactions(limit = 50): Promise<GuaranteeFundTransaction[]> {
  if (!adminSupabase) return []
  const { data } = await adminSupabase
    .from('guarantee_fund_transactions')
    .select('*, bookings(booking_ref, total_usd)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as GuaranteeFundTransaction[]) ?? []
}
